use ic_cdk::export::Principal;

pub fn caller() -> Principal {
    let caller = ic_cdk::api::caller();
    // TODO: remove this when not testing
    // The anonymous principal is not allowed to do certain actions, such as create chats or add messages.
    // if caller == Principal::anonymous() {
    //     panic!("Anonymous principal not allowed to make this call.")
    // }
    caller
}
