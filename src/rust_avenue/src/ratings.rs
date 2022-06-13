use crate::types::*;
use crate::utils::caller;
use ic_cdk::export::Principal;
use ic_cdk_macros::*;
use std::cell::RefCell;
use std::collections::BTreeMap;

use crate::dao_store::SIGNAL_DAO;

use crate::signal::{get_principal_for_signal_id, get_signal_by_id, internal_delete_signal};

// Store the ratings a user has given (they can only vote once per signal)
pub type UserGivenRatingsStore = BTreeMap<Principal, Vec<SignalID>>;
// store the rating of the signal
pub type SignalRatingsStore = BTreeMap<SignalID, i32>;
// store whether the signal has been awarded tokens yet
pub type SignalsToTokensStore = BTreeMap<SignalID, bool>;

thread_local! {
    pub static USER_GIVEN_RATING_STORE: RefCell<UserGivenRatingsStore> = RefCell::default();
    pub static SIGNAL_RATINGS_STORE: RefCell<SignalRatingsStore> = RefCell::default();
    pub static SIGNALS_TO_TOKEN_STORE: RefCell<SignalsToTokensStore> = RefCell::default();
}
/**
 * This function allows users to leave a rating of a signal
 * Each user can rate each signal once
 * If a signal receives more than 10 downvotes (-10) it will be deleted
 * If a signal receives more than 10 upvotes, then the user will be rewarded
 */
#[query]
fn get_rating_for_signal(signal_id: SignalID) -> i32 {
    SIGNAL_RATINGS_STORE.with(|signal_ratings_store| {
        signal_ratings_store
            .borrow()
            .get(&signal_id)
            .clone()
            .unwrap_or_else(|| &0)
            .clone()
    })
}

#[query]
fn principal_can_rate_signal(principal: Principal, signal_id: SignalID) -> bool {
    let user_ratings = USER_GIVEN_RATING_STORE.with(|user_store| {
        user_store
            .borrow()
            .get(&principal)
            .cloned()
            .unwrap_or_else(|| vec![])
    });

    return !user_ratings.contains(&signal_id);
}

#[update]
fn leave_rating(signal_id: SignalID, positive: bool) {
    let principal_id = caller();

    let user_ratings = USER_GIVEN_RATING_STORE.with(|user_store| {
        user_store
            .borrow()
            .get(&principal_id)
            .cloned()
            .unwrap_or_else(|| vec![])
    });

    // if it contains the located signal, they can't vote again
    if user_ratings.contains(&signal_id) {
        panic!("You can only vote once for a given signal")
    } else {
        // add an entry for this user into the store so they can't rate again
        USER_GIVEN_RATING_STORE.with(|user_store| {
            let mut signals = match user_store.borrow_mut().get(&principal_id).clone() {
                None => vec![],
                Some(i) => i.clone(),
            };
            signals.push(signal_id.clone());
            user_store
                .borrow_mut()
                .insert(principal_id, signals.clone());
        });

        // get the ratings of the signal to see if we meet thresholds
        SIGNAL_RATINGS_STORE.with(|signal_ratings_store| {
            let mut score = match signal_ratings_store.borrow_mut().get(&signal_id).clone() {
                None => 0,
                Some(i) => i.clone(),
            };

            match positive {
                true => score += 1,
                false => score -= 1,
            }

            signal_ratings_store.borrow_mut().insert(signal_id, score);

            // take action for above or below thresholds
            SIGNALS_TO_TOKEN_STORE.with(|signals_to_token_store| {
                if score
                    >= SIGNAL_DAO.with(|signal_dao| {
                        signal_dao
                            .borrow()
                            .system_params
                            .upvotes_required_before_token_minting
                            .amount
                    }) as i32
                {
                    // transfer takens if we haven't already
                    if *signals_to_token_store
                        .borrow()
                        .get(&signal_id)
                        .clone()
                        .unwrap_or_else(|| &false)
                    {
                        signals_to_token_store.borrow_mut().insert(signal_id, true);

                        let user_principle = get_principal_for_signal_id(signal_id);

                        // reward tokens for upvoted signal
                        SIGNAL_DAO.with(|service| {
                            let token_amount = service
                                .borrow()
                                .system_params
                                .tokens_received_for_upvoted_signal;
                            let mut service = service.borrow_mut();
                            service.mint(user_principle, token_amount.amount)
                        });
                    }
                } else if score
                    <= -(SIGNAL_DAO.with(|signal_dao| {
                        signal_dao
                            .borrow()
                            .system_params
                            .downvotes_required_before_delete
                            .amount
                    }) as i32)
                {
                    let signal = get_signal_by_id(signal_id);
                    // delete the signal if it has too many negative ratings
                    internal_delete_signal(signal.location, get_principal_for_signal_id(signal_id));
                    SIGNAL_RATINGS_STORE
                        .with(|signal_store| signal_store.borrow_mut().remove(&signal_id));
                    SIGNALS_TO_TOKEN_STORE
                        .with(|signal_store| signal_store.borrow_mut().remove(&signal_id));
                    // and delete it from the users vec
                    USER_GIVEN_RATING_STORE.with(|user_given_ratings_store| {
                        // get the vec of signals for this user and remove it
                        let mut ratings = user_given_ratings_store
                            .borrow()
                            .get(&principal_id)
                            .clone()
                            .unwrap()
                            .to_owned();
                        ratings.retain(|x| x.clone() != signal_id);
                        user_given_ratings_store
                            .borrow_mut()
                            .insert(principal_id, ratings.clone());
                    });
                }
            })
        });

        // TODO: We could make this reward configurable too
        SIGNAL_DAO.with(|service| service.borrow_mut().mint(principal_id, 1));
    }
}
