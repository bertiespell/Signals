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

#[derive(Clone, Copy, Debug, Default, Eq, PartialEq, PartialOrd, Ord)]
struct Coordinate {
    lat: OrderedFloat<f64>,
    long: OrderedFloat<f64>
}

struct Chat {
    messages: Vec<Message>,
    chat_type: String
}

type ChatStore = BTreeMap<Coordinate, Vec<Message>>;

thread_local! {
    static CHAT_STORE: RefCell<ChatStore> = RefCell::default();
}

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
struct Message {
    pub identity: String, // this could be a Profile from lib.rs
    pub contents: String,
    pub time: u64,
}

// type Chat = Vec<Message>;

#[derive(Clone, Copy, Debug, Default, Deserialize, CandidType)]
struct IncomingCoordinate {
    lat: f64,
    long: f64
}

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
struct Signal {
    location: IncomingCoordinate,
    messages:  Vec<Message>
}

#[update]
fn create_new_chat(location: IncomingCoordinate, initial_contents: String) -> Vec<Message> {
    let principal_id = ic_cdk::api::caller();

    let message: Message = Message { identity: principal_id.to_string(), contents: initial_contents, time: time() };
    let chat = vec![message];

    let ordered_location = Coordinate {
        lat: OrderedFloat(location.lat),
        long: OrderedFloat(location.long)
    };

    CHAT_STORE.with(|chat_store| {
        chat_store
            .borrow_mut()
            // TODO: consider what to do when this isn't a new message
            .insert(ordered_location.clone(), chat.clone());
    });

    return chat;
}

#[query]
fn get_chat(location: IncomingCoordinate) -> Vec<Message> {
    let ordered_location = Coordinate {
        lat: OrderedFloat(location.lat),
        long: OrderedFloat(location.long)
    };

    CHAT_STORE.with(|chat_store| {
        chat_store
            .borrow()
            .get(&ordered_location)
            .cloned()
            .unwrap()
    })
}

#[query]
fn get_all_signals() -> Vec<Signal> {
    let mut all_signals: Vec<Signal> = vec![];

    CHAT_STORE.with(|chat_store| {
        chat_store
            .borrow()
            .iter()
            .for_each(|(key, value)| {
                let incoming_coordinate = IncomingCoordinate {
                    lat: key.lat.into_inner(),
                    long: key.long.into_inner()
                };

                let signal = Signal {
                    location: incoming_coordinate,
                    messages: value.clone().to_vec()
                };

                all_signals.push(signal)
            })
            // .collect::<Coordinate, Vec<_>>()
    });

    return all_signals;
}

#[update]
fn add_new_message(location: IncomingCoordinate, contents: String) -> Vec<Message> {
    let principal_id = ic_cdk::api::caller();

    let message: Message = Message { identity: principal_id.to_string(), contents: contents, time: time() };

    let mut chat = get_chat(location);
    chat.push(message);

    let ordered_location = Coordinate {
        lat: OrderedFloat(location.lat),
        long: OrderedFloat(location.long)
    };

    CHAT_STORE.with(|chat_store| {
        chat_store
            .borrow_mut()
            .insert(ordered_location, chat.clone())
    });

    return chat;
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
