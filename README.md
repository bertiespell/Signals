# Signals

Welcome to Signals! I was inspired to build Signals after moving to a new city and finding it hard to connect with new people. It occurred to me that I pass the same strangers every day who share my interests and hobbies - we live in the same building, go to the same gym, enjoy the same cafes or play the same sports. Despite an epidemic of loneliness, crowded cities and all of us carrying devices which constantly broadcast our location to private companies... it seems harder than ever to connect with one another in meaningful ways. Signals presents an opportunity to re-think social media to put connection at the heart.

Signals is a decentralized app, built as a DAO on the Internet Computer. You can find out more about that project <a href="https://internetcomputer.org/">here</a>.

The project is hosted live <a href="https://2fydv-iqaaa-aaaak-qap6q-cai.ic0.app/">here</a>, and you can find out more about it on the <a href="https://2fydv-iqaaa-aaaak-qap6q-cai.ic0.app/about">About</a> page.

It's build in Rust, Typescript, React and Tailwind. With many humble thanks to the awesome documentation and starter templates over on the <a href="https://github.com/dfinity">Dfinity Github</a>. 🙇

# Local Development

This project uses Rust on the BE, so you'll want to install the Rust toolchain. You can find out more <a href="https://internetcomputer.org/docs/current/developer-docs/build/languages/rust/rust-quickstart#before-you-begin">here</a>. Follow the "Before you Begin" steps.

TLDR is that you need Rust, cmake and an ICP utility:

```bash
# install rust
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
# install dfx
sh -ci "$(curl -fsSL https://smartcontracts.org/install.sh)"
# check it installed correctly dfx
dfx --version
# install IC utility
cargo install ic-cdk-optimizer
# install cmake
brew install cmake
```

You should ideally be using Node 16+

Then, to start dfx:

```bash
# Starts the replica, running in the background
dfx start --background
```

# Deploy your canisters to the replica and generates your candid interface

Since the app uses the Internet Identity canister for authentication, you'll want to set this up to (see the section below) and then:

```bash
# Deploys without argument
II_FETCH_ROOT_KEY=1 dfx deploy --no-wallet --argument '(null)'
```

Note: if you see the error `Error: Invalid data: Expected arguments but found none.`, it means you probably didn't do the command above.

Once the job completes, your application will be available at `http://localhost:8000?canisterId={asset_canister_id}`.

Additionally, if you are making frontend changes, you can start a development server with

```bash
npm start
```

Which will start a server at `http://localhost:8080`, proxying API requests to the replica at port 8000.

# Troubleshooting

I've found that pretty consistently I need to stop dfx and then reinstall it. Seems to be particularly true when also working with the identity canister, for this the order of steps seems to matter. This works though:

-   `dfx stop`
-   delete .dfx folder
-   Reinstall dfx: `~/.cache/dfinity/uninstall.sh && sh -ci "$(curl -sSL https://smartcontracts.org/install.sh)"`
-   `dfx start` (in Signals)
-   `dfx deploy` (in Signals)
-   `II_FETCH_ROOT_KEY=1 dfx deploy --no-wallet --argument '(null)'` (in internet-identity)
-   `npm start` (in internet-indentity) (this needs port 8080)
-   `npm start` (in Signals) this now falls back to 8081

You'll maybe want to remove any problem packages from the dfx.json (for instance installing ledger isn't working yet)

# Internet Identity

The app is currently configured to work with a local copy of the internet identity canister running on port 8080

Follow the instructions over: https://github.com/dfinity/internet-identity, specifically, in the HACKING document: https://github.com/dfinity/internet-identity/blob/main/HACKING.md#running-locally

I.e. install the Internet Identity canister

```bash
npm ci
dfx start --clean --background
II_FETCH_ROOT_KEY=1 dfx deploy --no-wallet --argument '(null)'
dfx canister call internet_identity init_salt
```

Then `npm start` on the FE (which is where the actor is looking in the User Context)

# Ledger

You'll also need to set up the ledger if you want to run this locally. Instructions over <a href="https://internetcomputer.org/docs/current/developer-docs/functionality/ledger/ledger-local-setup/">here</a>:

```
curl -o ledger.wasm.gz https://download.dfinity.systems/ic/430eff2024adc2cea9ffd081a94dcb0ce4f96f58/canisters/ledger-canister_notify-method.wasm.gz
gunzip ledger.wasm.gz
curl -o ledger.private.did https://raw.githubusercontent.com/dfinity/ic/430eff2024adc2cea9ffd081a94dcb0ce4f96f58/rs/rosetta-api/ledger.did
curl -o ledger.public.did https://raw.githubusercontent.com/dfinity/ic/430eff2024adc2cea9ffd081a94dcb0ce4f96f58/rs/rosetta-api/ledger_canister/ledger.did
```

You then need to deploy it, but the steps are a bit involved so best to check the documentation there.

# Interacting with the DAO, to submit a proposal

Signals is built as a DAO, meaning that its users control how it operates and are incentivised through the Signals Token to interact with the map and maintain the quality of the data. Currently it supports leaving three types of signals - Chats, Trades and Events. Any user with sufficient tokens can see the state of the system, and make proposals on how Signals should be run.

To make a proposal you can either use the front-end, or it can be done programmatically liek so: We can change `transfer_fee` by calling signals' `update_system_params` method. This method takes
a `UpdateSystemParamsPayload` as an arg, which we need to encode into a `blob` to use in `ProposalPayload`.
Use `didc` to encode a `UpdateSystemParamsPayload`:

```text
$ didc encode '(record { transfer_fee = opt record { amount_e8s = 20_000:nat64; }; })' -f blob


$ didc encode '(record { tokens_received_for_signal_creation = 2:nat64; })' -f blob

```

Output:

```text
blob "DIDL\03l\01\f2\c7\94\ae\03\01n\02l\01\b9\ef\93\80\08x\01\00\01 N\00\00\00\00\00\00"
```

We can then submit the proposal:

```text
$ dfx canister call signals submit_proposal '(record { canister_id = principal "ryjl3-tyaaa-aaaaa-aaaba-cai";
   method = "update_system_params":text;
   metadata = "tokens_received_for_signal_creation":text;
   message = blob "DIDL\01l\01\87\8f\c3Ux\01\00\02\00\00\00\00\00\00\00";

})'
```

Note the output proposal ID:

```text
(variant { Ok = 0 : nat64 })
```

# To do / Extension Ideas

Before the app is a feasible app it really needs a general refactor to be efficient and secure, so that's a given! Here are some other ideas though of extra features, or things I didn't get round to finishing...

## New UI / Features

-   Dao Launcher - use templated DAOs to allow users in a Signal to launch their own DAO from the app
-   Add ability to DM (maybe link up with another canister to do this?)
-   Reward people for real face-to-face meetings. Perhaps this could be done with a timed/shared code in the app, which is also location based. Difficult to really protect against spoofing though so requires some thought.

## Signal / General UI / Refactor

-   Paginate data
-   Search functionality using a bounding box for coordinates (to load only what's visible on the map)
-   Improve map search bar
-   Make mobile friendly
-   Add search filters to BE
-   Add ability to tag events
-   Add edit functionality to change a Signal or message
-   Add views to:
    -   See your own Signals
    -   See any signals where you've left messages
-   Show the number of likes a signal has
-   Poll data in FE to give real time updates
-   Add bookmark view, to save and favourite signals
-   Split the code into separate canisters / rethink storage optimization
-   Consider using React's Leaflet library instead (https://react-leaflet.js.org/docs/example-draggable-marker/)
-   Add more system configuration and incentive mechanisms
-   Add information page with more technical details on how the DAO is built specifically (and the system parameters that control it)
-   Better FE validation and error messages

## Tickets

-   Show tickets as QR codes, and make them proper NFTs so they can be resold/traded
-   Add view for event organizer to see attendees and validate tickets
-   Add view to see who's attending an event

## Trades

-   Implement push/pull ability to pay in the app

## Profile Related

-   Allow users to upload a Profile pic (maybe via IPFS)
