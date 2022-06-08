use ic_cdk::export::{
    candid::{CandidType, Deserialize},
    Principal,
};
use ordered_float::OrderedFloat;
use std::collections::BTreeMap;

use std::ops::{Add, AddAssign, Mul, SubAssign};
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

// pub struct Loca

#[derive(Clone, Debug, CandidType, Deserialize, PartialEq)]
pub struct Signal {
    pub created_at: u64,
    pub updated_at: u64,
    pub user: Principal,
    pub location: IncomingCoordinate,
    pub metadata: String, // each type of event has a stringified metadata
    pub id: i128,
    pub messages: Vec<Message>,
    pub signal_type: SignalType,
}

#[derive(Clone, Debug, CandidType, Deserialize, PartialEq)]
pub enum SignalType {
    Chat,
    Trade,
    Event,
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

impl Add for SignalsTokens {
    type Output = Self;

    fn add(self, other: Self) -> Self {
        SignalsTokens {
            amount_e8s: self.amount_e8s + other.amount_e8s,
        }
    }
}

impl AddAssign for SignalsTokens {
    fn add_assign(&mut self, other: Self) {
        self.amount_e8s += other.amount_e8s;
    }
}

impl SubAssign for SignalsTokens {
    fn sub_assign(&mut self, other: Self) {
        self.amount_e8s -= other.amount_e8s;
    }
}

impl Mul<u64> for SignalsTokens {
    type Output = SignalsTokens;
    fn mul(self, rhs: u64) -> Self {
        SignalsTokens {
            amount_e8s: self.amount_e8s * rhs,
        }
    }
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct SystemParams {
    pub tokens_received_for_signal_creation: u64,
    pub tokens_received_for_upvoted_signal: u64,
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
    pub tokens_received_for_signal_creation: Option<u64>,
    pub tokens_received_for_upvoted_signal: Option<u64>,
    pub downvotes_required_before_delete: Option<i32>,
    pub upvotes_required_before_token_minting: Option<i32>,
    pub transfer_fee: Option<SignalsTokens>,
    pub proposal_vote_threshold: Option<SignalsTokens>,
    pub proposal_submission_deposit: Option<SignalsTokens>,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct TransferArgs {
    pub to: Principal,
    pub amount: SignalsTokens,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct VoteArgs {
    pub proposal_id: u64,
    pub vote: Vote,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Account {
    pub owner: Principal,
    pub tokens: SignalsTokens,
}

/// A proposal is a proposition to execute an arbitrary canister call
///
/// Token holders can vote to either accept the proposal and execute the given
/// canister call, or vote to reject the proposal and not execute the canister
/// call.
#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct Proposal {
    pub id: u64,
    pub timestamp: u64,
    pub proposer: Principal,
    pub payload: ProposalPayload,
    pub state: ProposalState,
    pub votes_yes: SignalsTokens,
    pub votes_no: SignalsTokens,
    pub voters: Vec<Principal>,
}

/// The data needed to call a given method on a given canister with given args
#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct ProposalPayload {
    pub canister_id: Principal,
    pub method: String,
    pub message: Vec<u8>,
}

// The state of a Proposal
#[derive(Clone, Debug, CandidType, Deserialize, PartialEq)]
pub enum ProposalState {
    // The proposal is open for voting
    Open,

    // Enough "yes" votes have been cast to accept the proposal, and it will soon be executed
    Accepted,

    // Enough "no" votes have been cast to reject the proposal, and it will not be executed
    Rejected,

    // The proposal is currently being executed
    Executing,

    // The proposal has been successfully executed
    Succeeded,

    // A failure occurred while executing the proposal
    Failed(String),
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub enum Vote {
    Yes,
    No,
}
