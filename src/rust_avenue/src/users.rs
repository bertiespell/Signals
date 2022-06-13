use crate::signal::get_principal_for_signal_coordinates;
use crate::types::*;
use crate::utils::caller;
use ic_cdk::export::Principal;
use ic_cdk_macros::*;
use std::cell::RefCell;
use std::collections::BTreeMap;

pub type UserStore = BTreeMap<Principal, User>;

thread_local! {
    pub static USER_STORE: RefCell<UserStore> = RefCell::default();
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
            .unwrap_or_else(|| User {
                name: String::default(),
                principal: id,
                profile_pic_url: String::default(),
            })
    })
}

#[query]
pub fn get_user_from_principal(principal: Principal) -> User {
    USER_STORE.with(|user_store| {
        user_store
            .borrow()
            .get(&principal)
            .cloned()
            .unwrap_or_else(|| User {
                name: String::default(),
                principal,
                profile_pic_url: String::default(),
            })
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
