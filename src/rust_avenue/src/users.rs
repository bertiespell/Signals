use crate::types::*;
use crate::utils::caller;
use ic_cdk::export::Principal;
use ic_cdk_macros::*;
use std::cell::RefCell;
use std::collections::BTreeMap;

type UserStore = BTreeMap<Principal, User>;

thread_local! {
    static USER_STORE: RefCell<UserStore> = RefCell::default();
}

#[query]
fn whoami() -> Principal {
    return ic_cdk::api::caller();
}

#[query(name = "getSelf")]
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
fn get(name: String) -> User {
    let found_user = User::default();
    USER_STORE.with(|user_store| {
        user_store
            .borrow()
            .values()
            .cloned()
            .collect::<Vec<User>>()
            .iter()
            .map(|user| {
                if user.name == name {
                    found_user = user.clone();
                }
            })
    });
    return found_user;
}

#[update]
fn update(user: User) {
    let id = caller();

    USER_STORE.with(|user_store| {
        user_store.borrow_mut().insert(id, user);
    });
}
