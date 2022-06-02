use ic_cdk::{
    api::time,
    export::{
        candid::{CandidType, Deserialize},
    },
};
use ic_cdk_macros::*;
use std::cell::RefCell;
use std::collections::BTreeMap;
// use std::fmt::Display;

#[derive(Clone, Copy, Debug, Default, CandidType, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
struct Coordinate {
    lat: i32,
    long: i32
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

#[update]
fn create_new_chat(location: Coordinate, initial_contents: String) -> Vec<Message> {
    let principal_id = ic_cdk::api::caller();

    let message: Message = Message { identity: principal_id.to_string(), contents: initial_contents, time: time() };
    let chat = vec![message];

    CHAT_STORE.with(|chat_store| {
        chat_store
            .borrow_mut()
            // TODO: consider what to do when this isn't a new message
            .insert(location.clone(), chat.clone());
    });

    return chat;
}

#[query]
fn get_chat(location: Coordinate) -> Vec<Message> {
    CHAT_STORE.with(|chat_store| {
        chat_store
            .borrow()
            .get(&location)
            .cloned()
            .unwrap()
    })
}

#[update]
fn add_new_message(location: Coordinate, contents: String) -> Vec<Message> {
    let principal_id = ic_cdk::api::caller();

    let message: Message = Message { identity: principal_id.to_string(), contents: contents, time: time() };

    let mut chat = get_chat(location);
    chat.push(message);

    CHAT_STORE.with(|chat_store| {
        chat_store
            .borrow_mut()
            .insert(location, chat.clone())
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
