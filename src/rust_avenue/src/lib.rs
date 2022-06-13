use crate::types::*;
use ic_cdk::export::candid::{CandidType, Deserialize};
use ic_cdk::storage;
use ic_cdk_macros::*;
use ordered_float::OrderedFloat;
use std::mem;

pub mod dao;
pub mod dao_store;
pub mod heartbeat;
pub mod ratings;
pub mod sales;
pub mod signal;
pub mod ticketing;
pub mod types;
pub mod users;
pub mod utils;

#[derive(CandidType, Deserialize)]
pub struct StableState {
    // signals
    pub user_signals: UserSignalStore,
    pub current_id: i128,
    pub signal_id_to_signal: SignalIdMap,
    // users
    pub users: users::UserStore,
    // dao
    pub dao: dao::SignalDaoService,
    // ratings
    pub user_given_ratings: ratings::UserGivenRatingsStore,
    pub signal_ratings: ratings::SignalRatingsStore,
    pub signals_to_tokens: ratings::SignalsToTokensStore,
    // tickets
    pub events: ticketing::EventStore,
    pub principal_event_store: ticketing::PrincipalEvents,
    // sale
    pub purchase_store: sales::PurchaseStore,
}

#[pre_upgrade]
fn pre_upgrade() {
    let user_signals = signal::USER_SIGNAL_STORE.with(|state| mem::take(&mut *state.borrow_mut()));
    let current_id = signal::CURRENT_ID.with(|state| mem::take(&mut *state.borrow_mut()));
    let signal_id_to_signal =
        signal::SIGNAL_ID_TO_SIGNAL.with(|state| mem::take(&mut *state.borrow_mut()));
    let dao = dao_store::SIGNAL_DAO.with(|state| mem::take(&mut *state.borrow_mut()));

    let user_given_ratings =
        ratings::USER_GIVEN_RATING_STORE.with(|state| mem::take(&mut *state.borrow_mut()));
    let signal_ratings =
        ratings::SIGNAL_RATINGS_STORE.with(|state| mem::take(&mut *state.borrow_mut()));
    let signals_to_tokens =
        ratings::SIGNALS_TO_TOKEN_STORE.with(|state| mem::take(&mut *state.borrow_mut()));

    let purchase_store = sales::PURCHASE_STORE.with(|state| mem::take(&mut *state.borrow_mut()));

    let users = users::USER_STORE.with(|state| mem::take(&mut *state.borrow_mut()));

    let events = ticketing::EVENTS.with(|state| mem::take(&mut *state.borrow_mut()));
    let principal_event_store =
        ticketing::PRINCIPAL_TO_EVENT_NUMBER.with(|state| mem::take(&mut *state.borrow_mut()));

    let stable_state = StableState {
        user_signals,
        current_id,
        signal_id_to_signal,
        dao,
        user_given_ratings,
        signal_ratings,
        signals_to_tokens,
        purchase_store,
        users,
        events,
        principal_event_store,
    };
    storage::stable_save((stable_state,)).unwrap();
}
#[post_upgrade]
fn post_upgrade() {
    let (StableState {
        user_signals,
        current_id,
        signal_id_to_signal,
        dao,
        user_given_ratings,
        signal_ratings,
        signals_to_tokens,
        purchase_store,
        users,
        events,
        principal_event_store,
    },) = storage::stable_restore().unwrap();
    signal::USER_SIGNAL_STORE.with(|state0| *state0.borrow_mut() = user_signals);
    signal::CURRENT_ID.with(|state0| *state0.borrow_mut() = current_id);

    dao_store::SIGNAL_DAO.with(|state0| *state0.borrow_mut() = dao);

    ratings::USER_GIVEN_RATING_STORE.with(|state0| *state0.borrow_mut() = user_given_ratings);
    ratings::SIGNAL_RATINGS_STORE.with(|state0| *state0.borrow_mut() = signal_ratings);
    ratings::SIGNALS_TO_TOKEN_STORE.with(|state0| *state0.borrow_mut() = signals_to_tokens);

    sales::PURCHASE_STORE.with(|state0| *state0.borrow_mut() = purchase_store);

    users::USER_STORE.with(|state0| *state0.borrow_mut() = users);

    ticketing::EVENTS.with(|state0| *state0.borrow_mut() = events);
    ticketing::PRINCIPAL_TO_EVENT_NUMBER
        .with(|state0| *state0.borrow_mut() = principal_event_store);

    signal::SIGNAL_ID_TO_SIGNAL.with(|state0| {
        signal::SIGNAL_STORE.with(|signal_store| {
            signal_id_to_signal.values().for_each(|signal| {
                let ordered_coordinate = Coordinate {
                    lat: OrderedFloat(signal.location.lat),
                    long: OrderedFloat(signal.location.long),
                };
                let new_signal = Signal {
                    created_at: signal.created_at,
                    updated_at: signal.updated_at,
                    user: signal.user,
                    location: IncomingCoordinate {
                        lat: signal.location.lat,
                        long: signal.location.long,
                    },
                    metadata: signal.metadata.clone(),
                    id: signal.id,
                    messages: signal.messages.clone(),
                    signal_type: signal.signal_type.clone(),
                };

                signal_store
                    .borrow_mut()
                    .insert(ordered_coordinate, new_signal);
            });
            *state0.borrow_mut() = signal_id_to_signal;
        });
    });
}

#[init]
fn init() {
    ic_cdk::setup();
    signal::CURRENT_ID.with(|current_id| *current_id.borrow_mut() = 0);
}
