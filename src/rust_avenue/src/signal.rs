use ic_cdk::{
    api::time,
    export::{
        candid::{CandidType, Deserialize},
        Principal,
    },
};
use ic_cdk_macros::*;
use std::cell::RefCell;
use std::collections::BTreeMap;

use ordered_float::OrderedFloat;

/// The incoming coordinate is an f64 which can implement CandidType
#[derive(Clone, Copy, Debug, Default, Deserialize, CandidType)]
struct IncomingCoordinate {
    lat: f64,
    long: f64,
}

/// On the BE we actually store a Coordinate using OrderedFloat, so that we can use it in a BTreeMap
/// And later do an optimised search algoirthm for finding points within a specific location
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq, PartialOrd, Ord)]
struct Coordinate {
    lat: OrderedFloat<f64>,
    long: OrderedFloat<f64>,
}

/// This is used to return to FE, IncomingCoordinate which impliments CandidType
#[derive(Clone, Debug, CandidType, Deserialize)]
struct LocatedSignal {
    location: IncomingCoordinate,
    signal: Signal,
}

#[derive(Clone, Debug, CandidType, Deserialize, PartialEq)]
struct Signal {
    messages: Vec<Message>,
    signal_type: SignalType,
}

#[derive(Clone, Debug, CandidType, Deserialize, PartialEq)]
enum SignalType {
    chat,
    trade,
    event,
}

// Enables us to look up and search by location
type SignalStore = BTreeMap<Coordinate, Signal>;
// Allows administrative priviledges to principles over their signals
type UserSignalStore = BTreeMap<Principal, Vec<Signal>>;

thread_local! {
    static SIGNAL_STORE: RefCell<SignalStore> = RefCell::default();
    static USER_SIGNAL_STORE: RefCell<UserSignalStore> = RefCell::default();
}

#[derive(Clone, Debug, Default, CandidType, Deserialize, PartialEq)]
struct Message {
    pub identity: String, // this could be a User from users.rs
    pub contents: String,
    pub time: u64,
}

fn caller() -> Principal {
    let caller = ic_cdk::api::caller();
    // TODO: remove this when not testing
    // The anonymous principal is not allowed to do certain actions, such as create chats or add messages.
    // if caller == Principal::anonymous() {
    //     panic!("Anonymous principal not allowed to make calls.")
    // }
    caller
}

#[update]
fn delete_signal(location: IncomingCoordinate) {
    let principal_id = caller();

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

    // TODO: succeed if it has a certain amount of downvotes or if called by DAO
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
    } else {
        panic!("Cannot delete a signal you do not own")
    }
}

#[update]
fn create_new_chat(
    location: IncomingCoordinate,
    initial_contents: String,
    signal_type: SignalType,
) -> Signal {
    let principal_id = caller();

    let message: Message = Message {
        identity: principal_id.to_string(),
        contents: initial_contents,
        time: time(),
    };

    let signal = Signal {
        messages: vec![message],
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

    return signal.clone();
}

#[query]
fn get_signals_for_user(principal: Principal) -> Vec<Signal> {
    return USER_SIGNAL_STORE
        .with(|user_store| user_store.borrow().get(&principal).cloned().unwrap());
}

#[query]
fn get_chat(location: IncomingCoordinate) -> Signal {
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
fn get_all_signals() -> Vec<LocatedSignal> {
    let mut all_signals: Vec<LocatedSignal> = vec![];

    SIGNAL_STORE.with(|signal_store| {
        signal_store.borrow().iter().for_each(|(key, value)| {
            let incoming_coordinate = IncomingCoordinate {
                lat: key.lat.into_inner(),
                long: key.long.into_inner(),
            };

            let signal = LocatedSignal {
                location: incoming_coordinate,
                signal: value.clone(),
            };

            all_signals.push(signal)
        })
        // .collect::<Coordinate, Vec<_>>()
    });

    return all_signals;
}

#[update]
fn add_new_message(location: IncomingCoordinate, contents: String) -> Signal {
    let principal_id = caller();

    let message: Message = Message {
        identity: principal_id.to_string(),
        contents: contents,
        time: time(),
    };

    let mut signal = get_chat(location);
    signal.messages.push(message);

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

// #[cfg(test)]
// mod tests {
//     use super::*;

//     #[test]
//     fn test_add_new_message() {
//         let location = Coordinate {
//             lat: 1,
//             long: 2
//         };
//         let result = add_new_message(location, String::from("new test"));
//         println!("{:?}", result);
//     }
// }
