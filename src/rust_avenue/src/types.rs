use ic_cdk::{
    api::time,
    export::{
        candid::{CandidType, Deserialize},
        Principal,
    },
};
use ic_cdk_macros::*;
use ordered_float::OrderedFloat;
use std::cell::RefCell;
use std::collections::BTreeMap;

pub type IdStore = BTreeMap<String, Principal>;
pub type ProfileStore = BTreeMap<Principal, Profile>;

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct Profile {
    pub name: String,
    pub description: String,
    pub keywords: Vec<String>,
}

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct User {
    pub name: String,
    pub profile_pic_url: String,
}

/// The incoming coordinate is an f64 which can implement CandidType
#[derive(Clone, Copy, Debug, Default, Deserialize, CandidType)]
pub struct IncomingCoordinate {
    pub lat: f64,
    pub long: f64,
}

/// On the BE we actually store a Coordinate using OrderedFloat, so that we can use it in a BTreeMap
/// And later do an optimised search algoirthm for finding points within a specific location
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq, PartialOrd, Ord)]
pub struct Coordinate {
    pub lat: OrderedFloat<f64>,
    pub long: OrderedFloat<f64>,
}

/// This is used to return to FE, IncomingCoordinate which impliments CandidType
#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct LocatedSignal {
    pub location: IncomingCoordinate,
    pub signal: Signal,
}

#[derive(Clone, Debug, CandidType, Deserialize, PartialEq)]
pub struct Signal {
    pub messages: Vec<Message>,
    pub signal_type: SignalType,
}

#[derive(Clone, Debug, CandidType, Deserialize, PartialEq)]
pub enum SignalType {
    chat,
    trade,
    event,
}

// Enables us to look up and search by location
pub type SignalStore = BTreeMap<Coordinate, Signal>;
// Allows administrative priviledges to principles over their signals
pub type UserSignalStore = BTreeMap<Principal, Vec<Signal>>;

#[derive(Clone, Debug, Default, CandidType, Deserialize, PartialEq)]
pub struct Message {
    pub identity: String, // this could be a User from users.rs
    pub contents: String,
    pub time: u64,
}
