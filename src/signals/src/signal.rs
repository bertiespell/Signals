use crate::dao_store::SIGNAL_DAO;
use crate::ticketing;
use crate::types::*;
use crate::users;
use crate::utils::caller;
use candid::Principal;
use ic_cdk::api::time;
use ic_cdk_macros::*;
use ordered_float::OrderedFloat;
use std::cell::RefCell;

thread_local! {
    pub static SIGNAL_STORE: RefCell<SignalStore> = RefCell::default();
    pub static USER_SIGNAL_STORE: RefCell<UserSignalStore> = RefCell::default();
    pub static CURRENT_ID: RefCell<i128> = RefCell::default();
    pub static SIGNAL_ID_TO_SIGNAL: RefCell<SignalIdMap> = RefCell::default();
}

#[update]
async fn create_ticketed_signal(
    location: IncomingCoordinate,
    initial_contents: String,
    signal_type: SignalType,
    number_of_passes: u32,
) -> Signal {
    let signal = create_new_signal(location, initial_contents, signal_type).await;
    ticketing::create_tickets(signal.id, number_of_passes);
    return signal;
}

#[update]
async fn create_new_signal(
    location: IncomingCoordinate,
    initial_contents: String,
    signal_type: SignalType,
) -> Signal {
    let principal_id = caller();

    return CURRENT_ID.with(|current_id| {
        let new_id = *current_id.borrow_mut();
        *current_id.borrow_mut() = new_id + 1;

        let signal = Signal {
            created_at: time(),
            updated_at: time(),
            user: principal_id,
            location: location,
            metadata: initial_contents.clone(),
            id: new_id,
            messages: vec![],
            signal_type: signal_type,
        };
        let ordered_location = Coordinate {
            lat: OrderedFloat(location.lat),
            long: OrderedFloat(location.long),
        };
        if SIGNAL_STORE.with(|signal_store| signal_store.borrow().contains_key(&ordered_location)) {
            ic_cdk::trap("A signal already exists at this location!");
        }
        SIGNAL_STORE.with(|signal_store| {
            signal_store
                .borrow_mut()
                .insert(ordered_location.clone(), signal.clone());
        });

        SIGNAL_ID_TO_SIGNAL.with(|signal_id_store| {
            signal_id_store
                .borrow_mut()
                .insert(signal.id, signal.clone());
        });

        USER_SIGNAL_STORE.with(|user_store| {
            let mut signals = match user_store.borrow_mut().get(&principal_id).clone() {
                None => vec![],
                Some(i) => i.clone(),
            };
            signals.push(signal.clone());
            user_store
                .borrow_mut()
                .insert(principal_id, signals.clone());
        });

        // reward tokens for creating a signal
        SIGNAL_DAO.with(|service| {
            let token_amount = service
                .borrow()
                .system_params
                .tokens_received_for_signal_creation;
            let mut service = service.borrow_mut();
            service.mint(principal_id, token_amount.amount)
        });

        return signal.clone();
    });
}

#[query]
fn get_signals_for_user(principal: Principal) -> Vec<Signal> {
    return USER_SIGNAL_STORE.with(|user_store| {
        user_store
            .borrow()
            .get(&principal)
            .cloned()
            .unwrap_or_else(|| vec![])
    });
}

#[query]
pub fn get_signal(location: IncomingCoordinate) -> Signal {
    let ordered_location = Coordinate {
        lat: OrderedFloat(location.lat),
        long: OrderedFloat(location.long),
    };

    SIGNAL_STORE.with(|signal_store| {
        signal_store
            .borrow()
            .get(&ordered_location)
            .cloned()
            .unwrap()
    })
}

pub fn get_signal_by_id(signal_id: i128) -> Signal {
    SIGNAL_ID_TO_SIGNAL
        .with(|signal_id_store| signal_id_store.borrow().get(&signal_id).cloned().unwrap())
}

#[query]
fn get_all_signals() -> Vec<Signal> {
    let mut all_signals: Vec<Signal> = vec![];

    SIGNAL_STORE.with(|signal_store| {
        signal_store
            .borrow()
            .iter()
            .for_each(|(_key, value)| all_signals.push(value.clone()))
    });

    return all_signals;
}

#[update]
fn add_new_message(location: IncomingCoordinate, contents: String) -> Signal {
    let principal = caller();

    let updated_at = time();

    let message: Message = Message {
        identity: users::get_user_from_principal(principal),
        contents: contents,
        time: updated_at,
    };

    let mut signal = get_signal(location);
    signal.messages.push(message);
    signal.updated_at = updated_at;

    let ordered_location = Coordinate {
        lat: OrderedFloat(location.lat),
        long: OrderedFloat(location.long),
    };

    SIGNAL_STORE.with(|signal_store| {
        signal_store
            .borrow_mut()
            .insert(ordered_location, signal.clone())
    });

    return signal;
}

#[query]
pub fn get_principal_for_signal_coordinates(location: IncomingCoordinate) -> Principal {
    let signal = get_signal(location);

    return signal.user;
}

#[query]
pub fn get_principal_for_signal_id(signal_id: SignalID) -> Principal {
    let signal = get_signal_by_id(signal_id);

    return signal.user;
}

#[update]
fn delete_signal(location: IncomingCoordinate) {
    let principal_id = caller();
    let user = get_principal_for_signal_coordinates(location);
    let signal = get_signal(location);

    if caller() != user {
        ic_cdk::trap("You're not authorized to delete this signal");
    }
    internal_delete_signal(signal.location, principal_id);
}

pub fn internal_delete_signal(location: IncomingCoordinate, principal_id: Principal) {
    let ordered_location = Coordinate {
        lat: OrderedFloat(location.lat),
        long: OrderedFloat(location.long),
    };

    let located_signal = SIGNAL_STORE.with(|signal_store| {
        signal_store
            .borrow()
            .get(&ordered_location)
            .cloned()
            .unwrap()
    });

    let user_signals = USER_SIGNAL_STORE
        .with(|user_store| user_store.borrow().get(&principal_id).cloned().unwrap());

    if user_signals.contains(&located_signal) {
        SIGNAL_STORE.with(|signal_store| signal_store.borrow_mut().remove(&ordered_location));

        USER_SIGNAL_STORE.with(|user_store| {
            // get the vec of locations for this user and remove it
            let mut signals = user_store
                .borrow()
                .get(&principal_id)
                .clone()
                .unwrap()
                .to_owned();
            signals.retain(|x| x.clone() != located_signal);

            user_store
                .borrow_mut()
                .insert(principal_id, signals.clone());
        });
    }
}
