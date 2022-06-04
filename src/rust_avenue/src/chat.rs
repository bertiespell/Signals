use ic_cdk::{
    api::time,
    export::{
        candid::{CandidType, Deserialize},
    },
};
use ic_cdk_macros::*;
use std::cell::RefCell;
use std::collections::BTreeMap;
use std::collections::HashMap;

use ordered_float::OrderedFloat;

/// The incoming coordinate is an f64 which can implement CandidType
#[derive(Clone, Copy, Debug, Default, Deserialize, CandidType)]
struct IncomingCoordinate {
    lat: f64,
    long: f64
}

/// On the BE we actually store a Coordinate using OrderedFloat, so that we can use it in a BTreeMap
/// And later do an optimised search algoirthm for finding points within a specific location
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq, PartialOrd, Ord)]
struct Coordinate {
    lat: OrderedFloat<f64>,
    long: OrderedFloat<f64>
}

/// This is used to return to FE, IncomingCoordinate which impliments CandidType
#[derive(Clone, Debug, CandidType, Deserialize)]
struct LocatedSignal {
    location: IncomingCoordinate,
    signal:  Signal,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
struct Signal {
    messages: Vec<Message>,
    signal_type: SignalType
}

#[derive(Clone, Debug, CandidType, Deserialize)]
enum SignalType {
    chat,
    trade,
    event,
}

type SignalStore = BTreeMap<Coordinate, Signal>;

thread_local! {
    static SIGNAL_STORE: RefCell<SignalStore> = RefCell::default();
}

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
struct Message {
    pub identity: String, // this could be a Profile from lib.rs
    pub contents: String,
    pub time: u64,
}

#[update]
fn create_new_chat(location: IncomingCoordinate, initial_contents: String, signal_type: SignalType) -> Signal {
    let principal_id = ic_cdk::api::caller();

    let message: Message = Message { identity: principal_id.to_string(), contents: initial_contents, time: time() };

    let signal = Signal {
        messages: vec![message],
        signal_type: signal_type
    };

    let ordered_location = Coordinate {
        lat: OrderedFloat(location.lat),
        long: OrderedFloat(location.long)
    };

    SIGNAL_STORE.with(|signal_store| {
        signal_store
            .borrow_mut()
            // TODO: consider what to do when this isn't a new message
            .insert(ordered_location.clone(), signal.clone());
    });

    return signal;
}

#[query]
fn get_chat(location: IncomingCoordinate) -> Signal {
    let ordered_location = Coordinate {
        lat: OrderedFloat(location.lat),
        long: OrderedFloat(location.long)
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
        signal_store
            .borrow()
            .iter()
            .for_each(|(key, value)| {
                let incoming_coordinate = IncomingCoordinate {
                    lat: key.lat.into_inner(),
                    long: key.long.into_inner()
                };

                let signal = LocatedSignal {
                    location: incoming_coordinate,
                    signal: value.clone()
                };

                all_signals.push(signal)
            })
            // .collect::<Coordinate, Vec<_>>()
    });

    return all_signals;
}

#[update]
fn add_new_message(location: IncomingCoordinate, contents: String) -> Signal {
    let principal_id = ic_cdk::api::caller();

    let message: Message = Message { identity: principal_id.to_string(), contents: contents, time: time() };

    let mut signal = get_chat(location);
    signal.messages.push(message);

    let ordered_location = Coordinate {
        lat: OrderedFloat(location.lat),
        long: OrderedFloat(location.long)
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