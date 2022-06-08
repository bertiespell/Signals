use crate::types::*;
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

// fn caller() -> Principal {
//     let caller = ic_cdk::api::caller();
//     // The anonymous principal is not allowed to do certain actions, such as create chats or add messages.
//     if caller == Principal::anonymous() {
//         panic!("Anonymous principal not allowed to make calls.")
//     }
//     caller
// }

// #[query(name = "getSelf")]
// fn get_user_self() -> User {
//     let id = caller();
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
//     });

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
//     let id = caller();
//     USER_STORE.with(|user_store| {
//         user_store.borrow_mut().insert(principal_id, user);
//     });
// }
