use crate::signal;
use crate::utils;
use candid::{CandidType, Principal};
use ic_cdk_macros::*;
use ic_ledger_types::{
    AccountIdentifier, BlockIndex, Memo, Subaccount, Tokens, MAINNET_LEDGER_CANISTER_ID,
};
use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use std::collections::BTreeMap;
use std::convert::TryInto;
use std::hash::Hash;

const ICP_FEE: u64 = 10_000;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, Hash)]
pub struct TransferArgs {
    amount: Tokens,
    to_principal: Principal,
    to_subaccount: Option<Subaccount>,
}

/// Maps a Signal ID to whether it's been purchased
pub type PurchaseStore = BTreeMap<i128, Trade>;

thread_local! {
    pub static PURCHASE_STORE: RefCell<PurchaseStore> = RefCell::default();
}

/**
 * The point is to know if a signal is accountted for, and how much for...
 */
#[derive(Clone, Copy, CandidType, Deserialize)]
pub struct Trade {
    seller: Principal,
    amount: u64,
}

fn get_trade_for_signal_id(id: i128) -> Trade {
    PURCHASE_STORE.with(|event_store| event_store.borrow().get(&id).cloned().unwrap())
}

/**
 * TODO: this sends funds on to another address, which will work for when the seller wants to claim the funds from the sale
 * We can keep a list of paid sales with the claiming Principal, and then the claimer can invoke this function
 * However we need a way for buyers to fund the contract, but these payment canisters are still in development
 * https://forum.dfinity.org/t/payments-invoice-canister-design-review/9843/40
 * Another option might to be integrate with BTC instead:
 * https://github.com/dfinity/bitcoin-developer-preview
 */
#[update]
async fn claim_sale(signal_id: i128) -> Result<BlockIndex, String> {
    let caller_principal = utils::caller();
    let canister_id = ic_cdk::api::id();

    let trade = get_trade_for_signal_id(signal_id);

    if trade.seller != caller_principal {
        ic_cdk::trap("You aren't a seller of this signal");
    }

    ic_cdk::println!(
        "Transferring {} ICP to principal {}",
        &trade.amount,
        caller_principal,
    );

    let transfer_args = ic_ledger_types::TransferArgs {
        memo: Memo(0),
        amount: Tokens::from_e8s(trade.amount),
        fee: Tokens::from_e8s(ICP_FEE),
        from_subaccount: Some(principal_to_subaccount(&canister_id)),
        to: AccountIdentifier::new(
            &caller_principal,
            &principal_to_subaccount(&caller_principal),
        ),
        created_at_time: None,
    };

    let transfer = ic_ledger_types::transfer(MAINNET_LEDGER_CANISTER_ID, transfer_args)
        .await
        .map_err(|e| format!("failed to call ledger: {:?}", e))?
        .map_err(|e| format!("ledger transfer error {:?}", e));

    PURCHASE_STORE.with(|purchase_store| purchase_store.borrow_mut().remove(&signal_id));
    transfer
}

#[derive(CandidType)]
pub enum DepositErr {
    BalanceLow,
    TransferFailure,
}

pub type DepositReceipt = Result<(), DepositErr>;

// the caller, send funds to us, the canister it
// we should get the signal trade ID
#[update]

pub async fn buy_item(signal_id: i128, amount: u64) -> DepositReceipt {
    let canister_id = ic_cdk::api::id();

    let caller_principal = utils::caller();

    let signal = signal::get_signal_by_id(signal_id);

    let trade = Trade {
        seller: signal.user,
        amount,
    };

    PURCHASE_STORE.with(|purchase_store| purchase_store.borrow_mut().insert(signal_id, trade));

    let this_canister_account =
        AccountIdentifier::new(&canister_id, &principal_to_subaccount(&canister_id));

    let caller_account = AccountIdentifier::new(
        &caller_principal,
        &principal_to_subaccount(&caller_principal),
    );

    let caller_balance_args = ic_ledger_types::AccountBalanceArgs {
        account: caller_account,
    };
    let caller_balance =
        ic_ledger_types::account_balance(MAINNET_LEDGER_CANISTER_ID, caller_balance_args)
            .await
            .map_err(|_| DepositErr::TransferFailure)?;

    if caller_balance.e8s() < ICP_FEE {
        return Err(DepositErr::BalanceLow);
    }

    let transfer_args = ic_ledger_types::TransferArgs {
        memo: Memo(0),
        amount: caller_balance - Tokens::from_e8s(ICP_FEE),
        fee: Tokens::from_e8s(ICP_FEE),
        from_subaccount: Some(principal_to_subaccount(&caller_principal)),
        to: this_canister_account,
        created_at_time: None,
    };
    ic_ledger_types::transfer(MAINNET_LEDGER_CANISTER_ID, transfer_args)
        .await
        .map_err(|_| DepositErr::TransferFailure)?
        .map_err(|_| DepositErr::TransferFailure)?;

    ic_cdk::println!(
        "Deposit of {} ICP in account {:?}",
        caller_balance - Tokens::from_e8s(ICP_FEE),
        &caller_account
    );

    DepositReceipt::Ok(())
}

pub fn principal_to_subaccount(principal_id: &Principal) -> Subaccount {
    let mut subaccount = [0; std::mem::size_of::<Subaccount>()];
    let principal_id = principal_id.as_slice();
    subaccount[0] = principal_id.len().try_into().unwrap();
    subaccount[1..1 + principal_id.len()].copy_from_slice(principal_id);

    Subaccount(subaccount)
}
