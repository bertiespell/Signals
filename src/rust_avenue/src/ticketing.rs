use std::collections::{BTreeSet, HashSet};
use std::mem;

use crate::utils::caller;
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
use ic_cdk_macros::*;
use once_cell::sync::Lazy;
use parking_lot::{MappedRwLockReadGuard, RwLock, RwLockReadGuard};
use serde::{Deserialize, Serialize};

#[derive(CandidType, Deserialize)]
struct StableState {
    assets: ic_certified_assets::StableState,
    events: BTreeSet<Event>,
}

#[pre_upgrade]
fn pre_upgrade() {
    let state = StableState {
        assets: ic_certified_assets::pre_upgrade(),
        events: mem::take(&mut *STORAGE.write()),
    };
    storage::stable_save((state,)).unwrap();
}

#[post_upgrade]
fn post_upgrade() {
    let (s,): (StableState,) = storage::stable_restore().unwrap();
    *STORAGE.write() = s.events;
    ic_certified_assets::post_upgrade(s.assets);
}

#[derive(CandidType, Deserialize, Ord, PartialOrd, Eq, PartialEq, Clone)]
struct Event {
    event_owner: Principal,
    number_of_tickets: u64,
    event_passes_distributed: Vec<EventPass>,
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

#[derive(CandidType, Deserialize, Debug)]
enum DipError {
    Unauthorized,
    InvalidTokenId,
    ZeroAddress,
    Other,
}

/**
 * TODO: add authorized, each user should only be able to add a few free events
 */
fn create_event(event: Event) -> Result {
    // in the future we'll make this paid, but to stop cycle exhaustion, let's limit events to 100 for now
    if event.number_of_tickets > 100 {
        ic_cdk::trap(&String::from(
            "We currently only support events for 100 people or less",
        ));
    }
    // put the event in storage
    // then register the number of events
    let mut i = 0;

    while i < event.number_of_tickets {
        // register the number of passes
        register(event.event_passes_distributed[i]);
        i = i + 1;
    }

    if STORAGE.read().passes.contains(&event) {
        return Ok(());
    }

    STORAGE.write().passes.insert(event);
    Ok(())
}

/**
 * TODO: we can support non-paid but limited supply tickets with this
 * On Event creationg, we can register an EventPass, with an owner (of the event), and a number available.
 * Payments integration will be done later
 */
#[update]
async fn register(eventPass: EventPass) -> Result {
    let principal_id = caller();

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
    Ok(())
}

#[update]
async fn burn(event_pass: EventPass) -> Result {
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
fn passes() -> Wrapper<MappedRwLockReadGuard<'static, BTreeSet<Event>>> {
    Wrapper(RwLockReadGuard::map(STORAGE.read(), |s| &s.passes))
}

/**
 * Transfer will work whilst tickets remain
 */
#[update]
async fn transfer(event_pass: EventPass, target: Principal, notify: Option<bool>) -> Result {
    if !STORAGE.read().passes.contains(&event_pass) {
        register_passes(event_pass).await?;
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
    STORAGE.write().passes.remove(&event_pass);
    Ok(())
}

#[update(name = "onDIP721Received")]
fn on_dip721_received(_: Principal, _: Principal, tokenid: u64, _: Vec<u8>) {
    STORAGE.write().passes.insert(EventPass {
        canister: api::caller(),
        index: tokenid,
    });
}

#[derive(CandidType, Deserialize, Default)]
struct Storage {
    passes: BTreeSet<Event>,
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
