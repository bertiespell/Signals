use candid::{CandidType, Nat, Principal};
use std::cell::RefCell;
use std::convert::TryInto;
use std::hash::Hash;

use ic_cdk_macros::*;
use ic_ledger_types::{
    AccountIdentifier, BlockIndex, Memo, Subaccount, Tokens, DEFAULT_SUBACCOUNT,
    MAINNET_LEDGER_CANISTER_ID,
};
use serde::{Deserialize, Serialize};

const ICP_FEE: u64 = 10_000;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, Hash, PartialEq)]
pub struct Conf {
    ledger_canister_id: Principal,
    // The subaccount of the account identifier that will be used to withdraw tokens and send them
    // to another account identifier. If set to None then the default subaccount will be used.
    // See the [Ledger doc](https://smartcontracts.org/docs/integration/ledger-quick-start.html#_accounts).
    subaccount: Option<Subaccount>,
    transaction_fee: Tokens,
}

impl Default for Conf {
    fn default() -> Self {
        Conf {
            ledger_canister_id: MAINNET_LEDGER_CANISTER_ID,
            subaccount: None,
            transaction_fee: Tokens::from_e8s(10_000),
        }
    }
}

thread_local! {
    pub static CONF: RefCell<Conf> = RefCell::new(Conf::default());
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, Hash)]
pub struct TransferArgs {
    amount: Tokens,
    to_principal: Principal,
    to_subaccount: Option<Subaccount>,
}

#[update]

async fn create_sale() {
    // store a record of who has paid, who they are paying too, and how much
    // create a record of "claimable sales", with the Principal of who can claim and how much
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
async fn claim_sale(args: TransferArgs) -> Result<BlockIndex, String> {
    ic_cdk::println!(
        "Transferring {} tokens to principal {} subaccount {:?}",
        &args.amount,
        &args.to_principal,
        &args.to_subaccount
    );
    let ledger_canister_id = CONF.with(|conf| conf.borrow().ledger_canister_id);
    let to_subaccount = args.to_subaccount.unwrap_or(DEFAULT_SUBACCOUNT);
    let transfer_args = CONF.with(|conf| {
        let conf = conf.borrow();
        ic_ledger_types::TransferArgs {
            memo: Memo(0),
            amount: args.amount,
            fee: conf.transaction_fee,
            from_subaccount: conf.subaccount,
            to: AccountIdentifier::new(&args.to_principal, &to_subaccount),
            created_at_time: None,
        }
    });
    let callerPrinciapl = ic_cdk::api::caller();
    let args = ic_ledger_types::AccountBalanceArgs {
        account: AccountIdentifier::new(&callerPrinciapl, &DEFAULT_SUBACCOUNT),
    };
    let balance = ic_ledger_types::account_balance(callerPrinciapl, args).await;
    ic_ledger_types::transfer(ledger_canister_id, transfer_args)
        .await
        .map_err(|e| format!("failed to call ledger: {:?}", e))?
        .map_err(|e| format!("ledger transfer error {:?}", e))
}

#[derive(CandidType)]
pub enum DepositErr {
    BalanceLow,
    TransferFailure,
}

pub type DepositReceipt = Result<Nat, DepositErr>;

async fn deposit_icp(caller: Principal) -> Result<Nat, DepositErr> {
    let canister_id = ic_cdk::api::id();
    let ledger_canister_id = STATE
        .with(|s| s.borrow().ledger)
        .unwrap_or(MAINNET_LEDGER_CANISTER_ID);

    let account = AccountIdentifier::new(&canister_id, &principal_to_subaccount(&caller));

    let balance_args = ic_ledger_types::AccountBalanceArgs { account };
    let balance = ic_ledger_types::account_balance(ledger_canister_id, balance_args)
        .await
        .map_err(|_| DepositErr::TransferFailure)?;

    if balance.e8s() < ICP_FEE {
        return Err(DepositErr::BalanceLow);
    }

    let transfer_args = ic_ledger_types::TransferArgs {
        memo: Memo(0),
        amount: balance - Tokens::from_e8s(ICP_FEE),
        fee: Tokens::from_e8s(ICP_FEE),
        from_subaccount: Some(principal_to_subaccount(&caller)),
        to: AccountIdentifier::new(&canister_id, &DEFAULT_SUBACCOUNT),
        created_at_time: None,
    };
    ic_ledger_types::transfer(ledger_canister_id, transfer_args)
        .await
        .map_err(|_| DepositErr::TransferFailure)?
        .map_err(|_| DepositErr::TransferFailure)?;

    ic_cdk::println!(
        "Deposit of {} ICP in account {:?}",
        balance - Tokens::from_e8s(ICP_FEE),
        &account
    );

    Ok((balance.e8s() - ICP_FEE).into())
}

pub fn principal_to_subaccount(principal_id: &Principal) -> Subaccount {
    let mut subaccount = [0; std::mem::size_of::<Subaccount>()];
    let principal_id = principal_id.as_slice();
    subaccount[0] = principal_id.len().try_into().unwrap();
    subaccount[1..1 + principal_id.len()].copy_from_slice(principal_id);

    Subaccount(subaccount)
}
