use crate::types::*;
use crate::utils::caller;
use ic_cdk::export::candid::{CandidType, Deserialize};
use ic_cdk::export::Principal;

use std::collections::HashMap;

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct SignalDaoService {
    pub accounts: HashMap<Principal, SignalsTokens>,
    pub proposals: HashMap<u64, Proposal>,
    pub next_proposal_id: u64,
    pub system_params: SystemParams,
}

impl Default for SystemParams {
    fn default() -> Self {
        SystemParams {
            tokens_received_for_signal_creation: ProposalParams { amount: 100000 },
            tokens_received_for_upvoted_signal: ProposalParams { amount: 50 },
            downvotes_required_before_delete: ProposalParams { amount: 10 },
            upvotes_required_before_token_minting: ProposalParams { amount: 15 },
            transfer_fee: SignalsTokens { amount: 5 },
            proposal_vote_threshold: SignalsTokens { amount: 10000 },
            proposal_submission_deposit: SignalsTokens { amount: 1 },
        }
    }
}

impl SignalDaoService {
    pub fn create_account(&mut self, user: Principal, amount: u64) {
        self.accounts.insert(user, SignalsTokens { amount: amount });
    }

    pub fn mint(&mut self, user: Principal, amount: u64) {
        match self.accounts.get_mut(&user) {
            Some(tokens) => {
                *tokens = *tokens + SignalsTokens { amount: amount };
            }
            None => {
                self.create_account(user, amount);
            }
        }
    }

    /// Transfer tokens from the caller's account to another account
    pub fn transfer(&mut self, transfer: TransferArgs) -> Result<(), String> {
        let caller = caller();

        if let Some(account) = self.accounts.get_mut(&caller) {
            if account.clone() < transfer.amount {
                return Err(format!(
                    "Caller's account has insufficient funds to transfer {:?}",
                    transfer.amount
                ));
            } else {
                *account -= transfer.amount + self.system_params.transfer_fee;
                let to_account = self.accounts.entry(transfer.to).or_default();
                *to_account += transfer.amount;
            }
        } else {
            return Err("Caller needs an account to transfer funds".to_string());
        }

        Ok(())
    }

    /// Return the account balance of the caller
    pub fn account_balance(&self) -> SignalsTokens {
        let caller = caller();
        self.accounts
            .get(&caller)
            .cloned()
            .unwrap_or_else(|| Default::default())
    }

    /// Lists all accounts
    pub fn list_accounts(&self) -> Vec<Account> {
        self.accounts
            .clone()
            .into_iter()
            .map(|(owner, tokens)| Account { owner, tokens })
            .collect()
    }

    /// Submit a proposal
    ///
    /// A proposal contains a canister ID, method name and method args. If enough users
    /// vote "yes" on the proposal, the given method will be called with the given method
    /// args on the given canister.
    pub fn submit_proposal(&mut self, payload: ProposalPayload) -> Result<u64, String> {
        self.deduct_proposal_submission_deposit()?;

        let proposal_id = self.next_proposal_id;
        self.next_proposal_id += 1;

        let proposal = Proposal {
            id: proposal_id,
            timestamp: ic_cdk::api::time(),
            proposer: caller(),
            payload,
            state: ProposalState::Open,
            votes_yes: Default::default(),
            votes_no: Default::default(),
            voters: vec![],
        };

        self.proposals.insert(proposal_id, proposal);
        Ok(proposal_id)
    }

    /// Return the proposal with the given ID, if one exists
    pub fn get_proposal(&self, proposal_id: u64) -> Option<Proposal> {
        self.proposals.get(&proposal_id).cloned()
    }

    /// Return the list of all proposals
    pub fn list_proposals(&self) -> Vec<Proposal> {
        self.proposals.values().cloned().collect()
    }

    // Vote on an open proposal
    pub fn vote(&mut self, args: VoteArgs) -> Result<ProposalState, String> {
        let caller = caller();

        let proposal = self
            .proposals
            .get_mut(&args.proposal_id)
            .ok_or_else(|| format!("No proposal with ID {} exists", args.proposal_id))?;

        if proposal.state != ProposalState::Open {
            return Err(format!(
                "Proposal {} is not open for voting",
                args.proposal_id
            ));
        }

        let voting_tokens = self
            .accounts
            .get(&caller)
            .ok_or_else(|| "Caller does not have any tokens to vote with".to_string())?
            .clone();

        if proposal.voters.contains(&caller) {
            return Err("Already voted".to_string());
        }

        match args.vote {
            Vote::Yes => proposal.votes_yes += voting_tokens,
            Vote::No => proposal.votes_no += voting_tokens,
        }

        proposal.voters.push(caller);

        if proposal.votes_yes >= self.system_params.proposal_vote_threshold {
            // Refund the proposal deposit when the proposal is accepted
            if let Some(account) = self.accounts.get_mut(&proposal.proposer) {
                *account += self.system_params.proposal_submission_deposit.clone();
            }

            proposal.state = ProposalState::Accepted;
        }

        if proposal.votes_no >= self.system_params.proposal_vote_threshold {
            proposal.state = ProposalState::Rejected;
        }

        Ok(proposal.state.clone())
    }

    /// Update system params
    ///
    /// Only callable via proposal execution
    pub fn update_system_params(&mut self, payload: UpdateSystemParamsPayload) {
        if caller() != ic_cdk::id() {
            return;
        }

        if let Some(tokens_received_for_signal_creation) =
            payload.tokens_received_for_signal_creation
        {
            self.system_params.tokens_received_for_signal_creation =
                tokens_received_for_signal_creation;
        }

        if let Some(tokens_received_for_upvoted_signal) = payload.tokens_received_for_upvoted_signal
        {
            self.system_params.tokens_received_for_upvoted_signal =
                tokens_received_for_upvoted_signal;
        }

        if let Some(upvotes_required_before_token_minting) =
            payload.upvotes_required_before_token_minting
        {
            self.system_params.upvotes_required_before_token_minting =
                upvotes_required_before_token_minting;
        }

        if let Some(downvotes_required_before_delete) = payload.downvotes_required_before_delete {
            self.system_params.downvotes_required_before_delete = downvotes_required_before_delete;
        }

        if let Some(transfer_fee) = payload.transfer_fee {
            self.system_params.transfer_fee = transfer_fee;
        }

        if let Some(proposal_vote_threshold) = payload.proposal_vote_threshold {
            self.system_params.proposal_vote_threshold = proposal_vote_threshold;
        }

        if let Some(proposal_submission_deposit) = payload.proposal_submission_deposit {
            self.system_params.proposal_submission_deposit = proposal_submission_deposit;
        }
    }

    /// Update the state of a proposal
    pub fn update_proposal_state(&mut self, proposal_id: u64, new_state: ProposalState) {
        if let Some(proposal) = self.proposals.get_mut(&proposal_id) {
            proposal.state = new_state
        }
    }

    /// Deduct the proposal submission deposit from the caller's account
    fn deduct_proposal_submission_deposit(&mut self) -> Result<(), String> {
        let caller = caller();
        if let Some(account) = self.accounts.get_mut(&caller) {
            if account.clone() < self.system_params.proposal_submission_deposit {
                return Err(format!(
                    "Caller's account must have at least {:?} to submit a proposal",
                    self.system_params.proposal_submission_deposit
                ));
            } else {
                *account -= self.system_params.proposal_submission_deposit.clone();
            }
        } else {
            return Err("Caller needs an account to submit a proposal".to_string());
        }

        Ok(())
    }
}
