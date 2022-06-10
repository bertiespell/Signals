use crate::dao_store::SIGNAL_DAO;
use crate::types::*;
use crate::utils::caller;
use ic_cdk::{api::time, export::Principal};
use ic_cdk_macros::*;
use ordered_float::OrderedFloat;
use std::cell::RefCell;

thread_local! {
    pub static SIGNAL_STORE: RefCell<SignalStore> = RefCell::default();
    pub static USER_SIGNAL_STORE: RefCell<UserSignalStore> = RefCell::default();
    pub static CURRENT_ID: RefCell<i128> = RefCell::default();
}

#[init]
fn init() {
    ic_cdk::setup();
    CURRENT_ID.with(|current_id| *current_id.borrow_mut() = 0);
}

#[update]
fn delete_signal(location: IncomingCoordinate) {
    let principal_id = caller();

    // Let pk be the public key of a principal that is allowed to perform
    // this operation. This pk could be stored in the canister's state.
    if caller() != Principal::self_authenticating(principal_id) {
        ic_cdk::trap("You're not authorized to delete this signal");
    }

    let user = get_principal_for_signal_coordinates(location);

    if caller() != user {
        ic_cdk::trap("You're not authorized to delete this signal");
    }
    internal_delete_signal(location, principal_id);
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

#[update]
async fn create_new_chat(
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
            panic!("A signal already exists at this location!")
        }
        SIGNAL_STORE.with(|signal_store| {
            signal_store
                .borrow_mut()
                .insert(ordered_location.clone(), signal.clone());
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

        // reward tokens for creating a chat
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
    let principal_id = caller();

    let updated_at = time();

    let message: Message = Message {
        identity: principal_id.to_string(),
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
