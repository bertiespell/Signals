use ic_cdk::export::Principal;

pub fn caller() -> Principal {
    let caller = ic_cdk::api::caller();
    // The anonymous principal is not allowed to do certain actions, such as creating new signals or add messages.
    if caller == Principal::anonymous() {
        panic!("Anonymous principal not allowed to make this call.")
    }
    caller
}
