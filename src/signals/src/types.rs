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

#[derive(Clone, Debug, CandidType, Deserialize, PartialEq)]
pub struct User {
    pub name: String,
    pub principal: Principal,
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

pub type SignalID = i128;

#[derive(Clone, Debug, CandidType, Deserialize, PartialEq)]
pub struct Signal {
    pub created_at: u64,
    pub updated_at: u64,
    pub user: Principal,
    pub location: IncomingCoordinate,
    pub metadata: String, // each type of event has a stringified metadata
    pub id: SignalID,
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

pub type SignalIdMap = BTreeMap<i128, Signal>;

#[derive(Clone, Debug, CandidType, Deserialize, PartialEq)]
pub struct Message {
    pub identity: User,
    pub contents: String,
    pub time: u64,
}

#[derive(Clone, Copy, Debug, Default, CandidType, Deserialize, PartialEq, PartialOrd)]
pub struct ProposalParams {
    pub amount: u64,
}

#[derive(Clone, Copy, Debug, Default, CandidType, Deserialize, PartialEq, PartialOrd)]
pub struct SignalsTokens {
    pub amount: u64,
}

impl Add for SignalsTokens {
    type Output = Self;

    fn add(self, other: Self) -> Self {
        SignalsTokens {
            amount: self.amount + other.amount,
        }
    }
}

impl AddAssign for SignalsTokens {
    fn add_assign(&mut self, other: Self) {
        self.amount += other.amount;
    }
}

impl SubAssign for SignalsTokens {
    fn sub_assign(&mut self, other: Self) {
        self.amount -= other.amount;
    }
}

impl Mul<u64> for SignalsTokens {
    type Output = SignalsTokens;
    fn mul(self, rhs: u64) -> Self {
        SignalsTokens {
            amount: self.amount * rhs,
        }
    }
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct SystemParams {
    pub tokens_received_for_signal_creation: ProposalParams,
    pub tokens_received_for_upvoted_signal: ProposalParams,
    pub downvotes_required_before_delete: ProposalParams,
    pub upvotes_required_before_token_minting: ProposalParams,

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
    pub tokens_received_for_signal_creation: Option<ProposalParams>,
    pub tokens_received_for_upvoted_signal: Option<ProposalParams>,
    pub downvotes_required_before_delete: Option<ProposalParams>,
    pub upvotes_required_before_token_minting: Option<ProposalParams>,
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
    pub metadata: String,
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
