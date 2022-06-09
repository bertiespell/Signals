use crate::types::*;
use crate::utils::caller;
use ic_cdk::export::candid::{CandidType, Deserialize};
use ic_cdk::export::Principal;

use std::collections::HashMap;

#[derive(Clone, Debug, Default, Deserialize)]
pub struct TicketingService {
    pub event_passes: HashMap<Coordinate, Vec<Principal>>,
}

impl TicketingService {
    // buy a ticket, Principal is added to passes

    // transfer a ticket
}
