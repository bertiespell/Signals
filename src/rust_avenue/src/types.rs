use ic_cdk::export::{
    candid::{CandidType, Deserialize},
    Principal,
};
use ordered_float::OrderedFloat;
use std::collections::BTreeMap;

pub type IdStore = BTreeMap<String, Principal>;
pub type ProfileStore = BTreeMap<Principal, Profile>;

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct Profile {
    pub name: String,
    pub description: String,
    pub keywords: Vec<String>,
}

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct User {
    pub name: String,
    pub profile_pic_url: String,
}

/// The incoming coordinate is an f64 which can implement CandidType
#[derive(Clone, Copy, Debug, Default, Deserialize, CandidType, PartialEq)]
pub struct IncomingCoordinate {
    pub lat: f64,
    pub long: f64,
}

/// On the BE we actually store a Coordinate using OrderedFloat, so that we can use it in a BTreeMap
/// And later do an optimised search algoirthm for finding points within a specific location
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq, PartialOrd, Ord)]
pub struct Coordinate {
    pub lat: OrderedFloat<f64>,
    pub long: OrderedFloat<f64>,
}

/// This is used to return to FE, IncomingCoordinate which impliments CandidType
#[derive(Clone, Debug, CandidType, Deserialize, PartialEq)]
pub struct IncomingLocatedSignal {
    pub location: IncomingCoordinate,
    pub signal: Signal,
}

// pub struct Loca

#[derive(Clone, Debug, CandidType, Deserialize, PartialEq)]
pub struct Signal {
    pub messages: Vec<Message>,
    pub signal_type: SignalType,
}

#[derive(Clone, Debug, CandidType, Deserialize, PartialEq)]
pub enum SignalType {
    chat,
    trade,
    event,
}

// Enables us to look up and search by location
pub type SignalStore = BTreeMap<Coordinate, Signal>;
// Allows administrative priviledges to principles over their signals
pub type UserSignalStore = BTreeMap<Principal, Vec<Signal>>;

#[derive(Clone, Debug, Default, CandidType, Deserialize, PartialEq)]
pub struct Message {
    pub identity: String, // this could be a User from users.rs
    pub contents: String,
    pub time: u64,
}

#[derive(Clone, Copy, Debug, Default, CandidType, Deserialize, PartialEq, PartialOrd)]
pub struct SignalsTokens {
    pub amount_e8s: u64,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct SystemParams {
    pub downvotes_required_before_delete: i32,
    pub upvotes_required_before_token_minting: i32,

    // The fee incurred by transferring tokens
    pub transfer_fee: SignalsTokens,

    // The amount of tokens needed to vote "yes" to accept, or "no" to reject, a proposal
    pub proposal_vote_threshold: SignalsTokens,

    // The amount of tokens that will be temporarily deducted from the account of
    // a user that submits a proposal. If the proposal is Accepted, this deposit is returned,
    // otherwise it is lost. This prevents users from submitting superfluous proposals.
    pub proposal_submission_deposit: SignalsTokens,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct UpdateSystemParamsPayload {
    pub downvotes_required_before_delete: Option<i32>,
    pub upvotes_required_before_token_minting: Option<i32>,
    pub transfer_fee: Option<SignalsTokens>,
    pub proposal_vote_threshold: Option<SignalsTokens>,
    pub proposal_submission_deposit: Option<SignalsTokens>,
}
