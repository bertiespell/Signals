use crate::utils::caller;
use ic_cdk::export::candid::{CandidType, Deserialize};
use ic_cdk::export::Principal;
use ic_cdk_macros::*;
use std::cell::RefCell;
use std::collections::BTreeMap;

// Maps the SignalID to an TicketedEvent
pub type EventStore = BTreeMap<i128, TicketedEvent>;

pub type PrincipalEvents = BTreeMap<Principal, u8>;

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct TicketedEvent {
    event_owner: Principal,
    number_of_tickets: u32,
    issued_passes: Vec<Principal>,
}

thread_local! {
    pub static EVENTS: RefCell<EventStore> = RefCell::default();
    // for now, if you want to create a ticketed event, we limit accounts to 3 (to stop cycle exhaustion)
    pub static PRINCIPAL_TO_EVENT_NUMBER: RefCell<PrincipalEvents> = RefCell::default();
}

pub fn create_tickets(signal_id: i128, number_of_tickets: u32) {
    if number_of_tickets >= 1000 {
        ic_cdk::trap("Currently ticketed events are limited to 1000 places");
    }

    let caller_principal = caller();
    let events_already_created = PRINCIPAL_TO_EVENT_NUMBER.with(|events_created| {
        events_created
            .borrow()
            .get(&caller_principal)
            .cloned()
            .unwrap_or_else(|| 0)
    });

    // if events_already_created >= 3 {
    //     ic_cdk::trap("Limit reached: You have already created 3 ticketed events.");
    // }

    let event = TicketedEvent {
        event_owner: caller_principal,
        number_of_tickets,
        issued_passes: vec![],
    };

    PRINCIPAL_TO_EVENT_NUMBER.with(|principal_to_events_store| {
        principal_to_events_store
            .borrow_mut()
            .insert(caller_principal, events_already_created + 1);
    });

    EVENTS.with(|event_store| {
        event_store.borrow_mut().insert(signal_id, event);
    });
}

#[update]
pub fn claim_ticket(signal_id: i128) {
    let buyer = caller();
    let mut ticketed_event = get_event_details(signal_id);

    if ticketed_event.number_of_tickets as usize <= ticketed_event.issued_passes.len() {
        ic_cdk::trap("Ticket limit reached.");
    }

    ticketed_event.issued_passes.push(buyer);

    EVENTS.with(|events_store| events_store.borrow_mut().insert(signal_id, ticketed_event));
}

#[query]
pub fn get_event_details(signal_id: i128) -> TicketedEvent {
    EVENTS.with(|event_store| event_store.borrow().get(&signal_id).cloned().unwrap())
}

#[query]
// takes a principal and an event and checks
pub fn check_ticket(signal_id: i128, ticket_holder: Principal) -> bool {
    let ticketed_event = get_event_details(signal_id);
    ticketed_event.issued_passes.contains(&ticket_holder)
}

#[query]
fn get_all_ticketed_events() -> Vec<TicketedEvent> {
    let mut all_events: Vec<TicketedEvent> = vec![];

    EVENTS.with(|event_store| {
        event_store
            .borrow()
            .iter()
            .for_each(|(_key, value)| all_events.push(value.clone()))
    });

    return all_events;
}
