use crate::dao::SignalDaoService;
use ic_cdk::export::Principal;
use std::cell::RefCell;

use crate::types::*;
use ic_cdk_macros::*;

thread_local! {
    pub static SIGNAL_DAO: RefCell<SignalDaoService> = RefCell::default();
}

#[update]
fn create_account(user: Principal, amount: u64) {
    SIGNAL_DAO.with(|service| service.borrow_mut().create_account(user, amount))
}

#[query]
fn get_system_params() -> SystemParams {
    SIGNAL_DAO.with(|service| service.borrow().system_params.clone())
}

#[update]
fn transfer(args: TransferArgs) -> Result<(), String> {
    SIGNAL_DAO.with(|service| service.borrow_mut().transfer(args))
}

#[query]
fn account_balance() -> SignalsTokens {
    SIGNAL_DAO.with(|service| service.borrow().account_balance())
}

#[query]
fn list_accounts() -> Vec<Account> {
    SIGNAL_DAO.with(|service| service.borrow().list_accounts())
}

#[update]
fn submit_proposal(proposal: ProposalPayload) -> Result<u64, String> {
    SIGNAL_DAO.with(|service| service.borrow_mut().submit_proposal(proposal))
}

#[query]
fn get_proposal(proposal_id: u64) -> Option<Proposal> {
    SIGNAL_DAO.with(|service| service.borrow().get_proposal(proposal_id))
}

#[query]
fn list_proposals() -> Vec<Proposal> {
    SIGNAL_DAO.with(|service| service.borrow().list_proposals())
}

#[update]
fn vote(args: VoteArgs) -> Result<ProposalState, String> {
    SIGNAL_DAO.with(|service| service.borrow_mut().vote(args))
}

#[update]
fn update_system_params(payload: UpdateSystemParamsPayload) {
    SIGNAL_DAO.with(|service| service.borrow_mut().update_system_params(payload))
}
