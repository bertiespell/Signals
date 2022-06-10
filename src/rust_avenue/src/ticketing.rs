use std::collections::{BTreeSet, HashSet};
use std::mem;

use candid::{
    types::{Serializer, Type},
    CandidType, Principal,
};
use ic_cdk::{
    api::{
        self,
        call::{self, RejectionCode},
    },
    storage,
};
use once_cell::sync::Lazy;
use parking_lot::{MappedRwLockReadGuard, RwLock, RwLockReadGuard};

#[init]
fn init(custodians: Option<HashSet<Principal>>) {
    STORAGE.write().custodians = custodians.unwrap_or_else(|| HashSet::from([api::caller()]));
    ic_certified_assets::init();
}

fn create_event() {
    // should cost to list ticketed event
}

fn buy_ticket() {}

#[derive(CandidType, Deserialize)]
struct StableState {
    assets: ic_certified_assets::StableState,
    wallet: Storage,
}

#[pre_upgrade]
fn pre_upgrade() {
    let state = StableState {
        assets: ic_certified_assets::pre_upgrade(),
        wallet: mem::take(&mut *STORAGE.write()),
    };
    storage::stable_save((state,)).unwrap();
}

#[post_upgrade]
fn post_upgrade() {
    let (s,): (StableState,) = storage::stable_restore().unwrap();
    *STORAGE.write() = s.wallet;
    ic_certified_assets::post_upgrade(s.assets);
}

#[derive(CandidType, Deserialize, Ord, PartialOrd, Eq, PartialEq, Clone, Copy)]
struct EventPass {
    canister: Principal,
    index: u64,
}

#[derive(CandidType, Deserialize)]
enum Error {
    InvalidCanister,
    CannotNotify,
    CanisterError { message: String },
    NoSuchToken,
    NotOwner,
    Unauthorized,
}

impl From<DipError> for Error {
    fn from(e: DipError) -> Self {
        match e {
            DipError::InvalidTokenId => Self::NoSuchToken,
            DipError::Unauthorized => Self::NotOwner,
            _ => Self::CanisterError {
                message: format!("{e:?}"),
            },
        }
    }
}

type Result<T = (), E = Error> = std::result::Result<T, E>;

impl From<(RejectionCode, String)> for Error {
    fn from((code, message): (RejectionCode, String)) -> Self {
        match code {
            RejectionCode::CanisterError => Self::CanisterError { message },
            _ => Self::InvalidCanister,
        }
    }
}

#[inspect_message]
fn inspect_message() {
    if is_authorized()
        || !["set_authorized", "transfer", "register"].contains(&call::method_name().as_str())
    {
        call::accept_message();
    }
}

#[query]
fn is_authorized() -> bool {
    STORAGE.read().custodians.contains(&api::caller())
}

#[update]
fn set_authorized(principal: Principal, authorized: bool) -> Result {
    if !is_authorized() {
        return Err(Error::Unauthorized);
    }
    if authorized {
        STORAGE.write().custodians.insert(principal);
    } else {
        STORAGE.write().custodians.remove(&principal);
    }
    Ok(())
}

#[derive(CandidType, Deserialize, Debug)]
enum DipError {
    Unauthorized,
    InvalidTokenId,
    ZeroAddress,
    Other,
}

#[update]
async fn register(eventPass: EventPass) -> Result {
    if !is_authorized() {
        return Err(Error::Unauthorized);
    }
    if STORAGE.read().bought_passes.contains(&eventPass) {
        return Ok(());
    }
    if let Ok((owner,)) = call::call::<_, (Result<Principal, DipError>,)>(
        eventPass.canister,
        "ownerOfDip721",
        (eventPass.index,),
    )
    .await
    {
        if !matches!(owner, Ok(p) if p == api::id()) {
            return Err(Error::NotOwner);
        }
    } else {
        return Err(Error::InvalidCanister);
    }
    STORAGE.write().bought_passes.insert(eventPass);
    Ok(())
}

#[update]
async fn burn(event_pass: EventPass) -> Result {
    if !is_authorized() {
        return Err(Error::Unauthorized);
    }
    call::call::<_, (Result<u128, DipError>,)>(
        event_pass.canister,
        "burnDip721",
        (event_pass.index,),
    )
    .await?
    .0?;
    Ok(())
}

#[query]
fn bought_passes() -> Wrapper<MappedRwLockReadGuard<'static, BTreeSet<EventPass>>> {
    Wrapper(RwLockReadGuard::map(STORAGE.read(), |s| &s.bought_passes))
}

#[update]
async fn transfer(event_pass: EventPass, target: Principal, notify: Option<bool>) -> Result {
    if !is_authorized() {
        return Err(Error::Unauthorized);
    }
    if !STORAGE.read().bought_passes.contains(&event_pass) {
        register(event_pass).await?;
    }
    if notify != Some(false) {
        if let Ok((res,)) = call::call::<_, (Result<u128, DipError>,)>(
            event_pass.canister,
            "safeTransferFromNotifyDip721",
            (api::id(), target, event_pass.index, Vec::<u8>::new()),
        )
        .await
        {
            res?;
        } else {
            if notify == None {
                call::call::<_, (Result<u128, DipError>,)>(
                    event_pass.canister,
                    "safeTransferFromDip721",
                    (api::id(), target, event_pass.index),
                )
                .await?
                .0?;
            } else {
                return Err(Error::CannotNotify);
            }
        }
    } else {
        call::call::<_, (Result<u128, DipError>,)>(
            event_pass.canister,
            "safeTransferFromDip721",
            (api::id(), target, event_pass.index),
        )
        .await?
        .0?;
    }
    STORAGE.write().bought_passes.remove(&event_pass);
    Ok(())
}

#[update(name = "onDIP721Received")]
fn on_dip721_received(_: Principal, _: Principal, tokenid: u64, _: Vec<u8>) {
    STORAGE.write().bought_passes.insert(EventPass {
        canister: api::caller(),
        index: tokenid,
    });
}

#[derive(CandidType, Deserialize, Default)]
struct Storage {
    custodians: HashSet<Principal>,
    bought_passes: BTreeSet<EventPass>,
}

static STORAGE: Lazy<RwLock<Storage>> = Lazy::new(|| RwLock::new(Storage::default()));

pub struct Wrapper<T>(pub T);

impl<'a, T> CandidType for Wrapper<MappedRwLockReadGuard<'a, T>>
where
    T: CandidType,
{
    fn _ty() -> Type {
        T::_ty()
    }

    fn idl_serialize<S>(&self, serializer: S) -> Result<(), S::Error>
    where
        S: Serializer,
    {
        (*self.0).idl_serialize(serializer)
    }
}
