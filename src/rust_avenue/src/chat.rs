use ic_cdk::{
    api::time,
    export::{
        candid::{CandidType, Deserialize},
    },
};
use ic_cdk_macros::*;
use std::cell::RefCell;
use std::collections::BTreeMap;

#[derive(Clone, Debug, Default, CandidType, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
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

type Chat = Vec<Message>;

#[update]
fn create_new_chat(location: Coordinate, initial_contents: String) -> Vec<Message> {
    let principal_id = ic_cdk::api::caller();

    let message: Message = Message { identity: principal_id.to_string(), contents: initial_contents, time: time() };
    let chat = vec![message];

    CHAT_STORE.with(|chat_store| {
        chat_store
            .borrow_mut()
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

