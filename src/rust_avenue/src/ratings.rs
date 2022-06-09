use crate::types::*;
use crate::utils::caller;
use ic_cdk::export::Principal;
use ic_cdk_macros::*;
use ordered_float::OrderedFloat;
use std::cell::RefCell;
use std::collections::BTreeMap;

use crate::dao_store::SIGNAL_DAO;

use crate::signal::{get_user_for_signal_coordinates, internal_delete_signal};

// Store the ratings a user has given (they can only vote once per signal)
type UserGivenRatingsStore = BTreeMap<Principal, Vec<Coordinate>>;
// store the rating of the signal
type SignalRatingsStore = BTreeMap<Coordinate, i32>;
// store whether the signal has been awarded tokens yet
type SignalsToTokensStore = BTreeMap<Coordinate, bool>;

thread_local! {
    static USER_GIVEN_RATING_STORE: RefCell<UserGivenRatingsStore> = RefCell::default();
    static SIGNAL_RATINGS_STORE: RefCell<SignalRatingsStore> = RefCell::default();
    static SIGNALS_TO_TOKEN_STORE: RefCell<SignalsToTokensStore> = RefCell::default();
}

/**
 * This function allows users to leave a rating of a signal
 * Each user can rate each signal once
 * If a signal receives more than 10 downvotes (-10) it will be deleted
 * TODO: implementation: If a signal receives more than 10 upvotes, then the user will be rewarded
 */
#[query]
fn get_rating_for_signal(location: IncomingCoordinate) -> i32 {
    let ordered_location = Coordinate {
        lat: OrderedFloat(location.lat),
        long: OrderedFloat(location.long),
    };
    SIGNAL_RATINGS_STORE.with(|signal_ratings_store| {
        signal_ratings_store
            .borrow()
            .get(&ordered_location)
            .clone()
            .unwrap_or_else(|| &0)
            .clone()
    })
}

#[update]
fn leave_rating(location: IncomingCoordinate, positive: bool) {
    let principal_id = caller();

    let ordered_location = Coordinate {
        lat: OrderedFloat(location.lat),
        long: OrderedFloat(location.long),
    };

    let user_ratings = USER_GIVEN_RATING_STORE.with(|user_store| {
        user_store
            .borrow()
            .get(&principal_id)
            .cloned()
            .unwrap_or_else(|| vec![])
    });

    // if it contains the located signal, they can't vote again
    if user_ratings.contains(&ordered_location) {
        panic!("You can only vote once for a given signal")
    } else {
        // add an entry for this user into the store so they can't rate again
        USER_GIVEN_RATING_STORE.with(|user_store| {
            let mut signals = match user_store.borrow_mut().get(&principal_id).clone() {
                None => vec![],
                Some(i) => i.clone(),
            };
            signals.push(ordered_location.clone());
            user_store
                .borrow_mut()
                .insert(principal_id, signals.clone());
        });

        // get the ratings of the signal to see if we meet thresholds
        SIGNAL_RATINGS_STORE.with(|signal_ratings_store| {
            let mut score = match signal_ratings_store
                .borrow_mut()
                .get(&ordered_location)
                .clone()
            {
                None => 0,
                Some(i) => i.clone(),
            };

            match positive {
                true => score += 1,
                false => score -= 1,
            }

            signal_ratings_store
                .borrow_mut()
                .insert(ordered_location, score);

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
                        .get(&ordered_location)
                        .clone()
                        .unwrap_or_else(|| &false)
                    {
                        signals_to_token_store
                            .borrow_mut()
                            .insert(ordered_location, true);

                        let user_principle = get_user_for_signal_coordinates(location);

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
                    // delete the signal if it has too many negative ratings
                    internal_delete_signal(location, get_user_for_signal_coordinates(location));
                    SIGNAL_RATINGS_STORE
                        .with(|signal_store| signal_store.borrow_mut().remove(&ordered_location));
                    SIGNALS_TO_TOKEN_STORE
                        .with(|signal_store| signal_store.borrow_mut().remove(&ordered_location));
                    // and delete it from the users vec
                    USER_GIVEN_RATING_STORE.with(|user_given_ratings_store| {
                        // get the vec of locations for this user and remove it
                        let mut ratings = user_given_ratings_store
                            .borrow()
                            .get(&principal_id)
                            .clone()
                            .unwrap()
                            .to_owned();
                        ratings.retain(|x| x.clone() != ordered_location);
                        user_given_ratings_store
                            .borrow_mut()
                            .insert(principal_id, ratings.clone());
                    });
                }
            })
        });
    }
}
