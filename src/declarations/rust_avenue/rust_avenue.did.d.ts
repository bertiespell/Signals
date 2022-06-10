import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Account { 'owner' : Principal, 'tokens' : Tokens }
export interface BasicDaoStableStorage {
  'system_params' : SystemParams,
  'accounts' : Array<Account>,
  'proposals' : Array<Proposal>,
}
export interface Coordinate_2 { 'lat' : number, 'long' : number }
export type Error = { 'CanisterError' : { 'message' : string } } |
  { 'CannotNotify' : null } |
  { 'NoSuchToken' : null } |
  { 'Unauthorized' : null } |
  { 'NotOwner' : null };
export interface EventPass { 'canister' : Principal, 'index' : TokenIndex }
export type ManageResult = { 'Ok' : null } |
  { 'Err' : Error };
export type Message = Message_2;
export interface Message_2 {
  'contents' : string,
  'time' : bigint,
  'identity' : string,
}
export type Profile = Profile_2;
export interface Profile_2 { 'profile_pic_url' : string, 'name' : string }
export interface Proposal {
  'id' : bigint,
  'votes_no' : Tokens,
  'voters' : Array<Principal>,
  'state' : ProposalState,
  'timestamp' : bigint,
  'proposer' : Principal,
  'votes_yes' : Tokens,
  'payload' : ProposalPayload,
}
export interface ProposalParams { 'amount' : bigint }
export interface ProposalPayload {
  'method' : string,
  'canister_id' : Principal,
  'message' : Array<number>,
}
export type ProposalState = { 'Failed' : string } |
  { 'Open' : null } |
  { 'Executing' : null } |
  { 'Rejected' : null } |
  { 'Succeeded' : null } |
  { 'Accepted' : null };
export type Signal = Signal_2;
export type SignalType_2 = { 'Event' : null } |
  { 'Chat' : null } |
  { 'Trade' : null };
export interface Signal_2 {
  'id' : bigint,
  'updated_at' : bigint,
  'signal_type' : SignalType_2,
  'messages' : Array<Message_2>,
  'metadata' : string,
  'user' : Principal,
  'created_at' : bigint,
  'location' : Coordinate_2,
}
export type SubmitProposalResult = { 'Ok' : bigint } |
  { 'Err' : string };
export interface SystemParams {
  'tokens_received_for_signal_creation' : ProposalParams,
  'transfer_fee' : Tokens,
  'upvotes_required_before_token_minting' : ProposalParams,
  'downvotes_required_before_delete' : ProposalParams,
  'tokens_received_for_upvoted_signal' : ProposalParams,
  'proposal_vote_threshold' : Tokens,
  'proposal_submission_deposit' : Tokens,
}
export type TokenIndex = bigint;
export interface Tokens { 'amount' : bigint }
export interface TransferArgs { 'to' : Principal, 'amount' : Tokens }
export type TransferResult = { 'Ok' : null } |
  { 'Err' : string };
export interface UpdateSystemParamsPayload {
  'tokens_received_for_signal_creation' : [] | [ProposalParams],
  'transfer_fee' : [] | [Tokens],
  'upvotes_required_before_token_minting' : [] | [ProposalParams],
  'downvotes_required_before_delete' : [] | [ProposalParams],
  'tokens_received_for_upvoted_signal' : [] | [ProposalParams],
  'proposal_vote_threshold' : [] | [Tokens],
  'proposal_submission_deposit' : [] | [Tokens],
}
export type Vote = { 'No' : null } |
  { 'Yes' : null };
export interface VoteArgs { 'vote' : Vote, 'proposal_id' : bigint }
export type VoteResult = { 'Ok' : ProposalState } |
  { 'Err' : string };
export interface _SERVICE {
  'account_balance' : ActorMethod<[], Tokens>,
  'add_new_message' : ActorMethod<[Coordinate_2, string], Signal_2>,
  'create_account' : ActorMethod<[Principal, bigint], undefined>,
  'create_new_chat' : ActorMethod<
    [Coordinate_2, string, SignalType_2],
    Signal_2,
  >,
  'delete_signal' : ActorMethod<[Coordinate_2], undefined>,
  'get_all_signals' : ActorMethod<[], Array<Signal_2>>,
  'get_principal_for_signal_coordinates' : ActorMethod<
    [Coordinate_2],
    Principal,
  >,
  'get_proposal' : ActorMethod<[bigint], [] | [Proposal]>,
  'get_rating_for_signal' : ActorMethod<[Coordinate_2], number>,
  'get_signal' : ActorMethod<[Coordinate_2], Signal_2>,
  'get_signals_for_user' : ActorMethod<[Principal], Array<Signal_2>>,
  'get_system_params' : ActorMethod<[], SystemParams>,
  'get_user_for_signal_location' : ActorMethod<[Coordinate_2], Profile_2>,
  'get_user_self' : ActorMethod<[], Profile_2>,
  'leave_rating' : ActorMethod<[Coordinate_2, boolean], undefined>,
  'list_accounts' : ActorMethod<[], Array<Account>>,
  'list_proposals' : ActorMethod<[], Array<Proposal>>,
  'principal_can_rate_location' : ActorMethod<
    [Principal, Coordinate_2],
    boolean,
  >,
  'submit_proposal' : ActorMethod<[ProposalPayload], SubmitProposalResult>,
  'transfer' : ActorMethod<[TransferArgs], TransferResult>,
  'update_system_params' : ActorMethod<[UpdateSystemParamsPayload], undefined>,
  'update_user' : ActorMethod<[Profile_2], undefined>,
  'vote' : ActorMethod<[VoteArgs], VoteResult>,
  'whoami' : ActorMethod<[], Principal>,
}
