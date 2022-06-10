use crate::signal::get_principal_for_signal_coordinates;
use crate::types::*;
use crate::utils::caller;
use ic_cdk::export::Principal;
use ic_cdk_macros::*;
use std::cell::RefCell;
use std::collections::BTreeMap;

thread_local! {
    static SIGNAL_STORE: RefCell<SignalStore> = RefCell::default();
    static USER_SIGNAL_STORE: RefCell<UserSignalStore> = RefCell::default();
    static CURRENT_ID: RefCell<i128> = RefCell::default();
}

type UserStore = BTreeMap<Principal, User>;

thread_local! {
    static USER_STORE: RefCell<UserStore> = RefCell::default();
}

#[query]
fn whoami() -> Principal {
    return ic_cdk::api::caller();
}

#[query]
fn get_user_self() -> User {
    let id = caller();
    USER_STORE.with(|user_store| {
        user_store
            .borrow()
            .get(&id)
            .cloned()
            .unwrap_or_else(|| User::default())
    })
}

#[query]
fn get_user_from_principal(principal: Principal) -> User {
    USER_STORE.with(|user_store| {
        user_store
            .borrow()
            .get(&principal)
            .cloned()
            .unwrap_or_else(|| User::default())
    })
}

#[query]
fn get_user_for_signal_location(location: IncomingCoordinate) -> User {
    let principal = get_principal_for_signal_coordinates(location);
    return get_user_from_principal(principal);
}

#[update]
fn update_user(user: User) {
    let id = caller();

    USER_STORE.with(|user_store| {
        user_store.borrow_mut().insert(id, user);
    });
}
