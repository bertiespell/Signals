use ic_cdk::{
    api::call::{ManualReply},
    export::{
        candid::{CandidType, Deserialize},
        Principal,
    },
};
use ic_cdk_macros::*;
use std::cell::RefCell;
use std::collections::BTreeMap;

type UserStore = BTreeMap<Principal, User>;

thread_local! {
    static USER_STORE: RefCell<UserStore> = RefCell::default();
}

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
struct User {
    pub name: String,
    pub profile_pic_url: String,
}

#[query]
fn whoami() -> Principal {
    return ic_cdk::api::caller();
}

// #[query(name = "getSelf")]
// fn get_user_self() -> User {
//     let id = ic_cdk::api::caller();
//     USER_STORE.with(|user_store| {
//         user_store
//             .borrow()
//             .get(&id)
//             .cloned()
//             .unwrap_or_else(|| User::default())
//     })
// }

// #[query]
// fn get(name: String) -> User {
//     USER_STORE.with(|user_store| {
//         user_store
//             .borrow()
//             .get(&name)
//             .and_then(|id| user_store.borrow().get(id).cloned())
//             .unwrap_or_else(|| User::default())
//     })

//     USER_STORE.with(|user_store| {
//         user_store
//             .borrow()
//             .get(&name)
//             .cloned()
//             .unwrap()
//     })
// }

// #[update]
// fn update(user: User) {
//     let principal_id = ic_cdk::api::caller();
//     USER_STORE.with(|user_store| {
//         user_store.borrow_mut().insert(principal_id, user);
//     });
// }

