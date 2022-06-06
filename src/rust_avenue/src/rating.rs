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

use std::collections::HashMap;

// Enables us to look up and search by location
type UserGivenRatingsStore = BTreeMap<Principal, Vec<Signal>>;
type SignalRatingsStore = BTreeMap<Signal, i32>;

thread_local! {
    static USER_GIVEN_RATING_STORE: RefCell<UserGivenRatingsStore> = RefCell::default();
    static SIGNAL_RATINGS_STORE: RefCell<UserGivenRatingsStore> = RefCell::default();
}
