import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Account { 'owner' : Principal, 'tokens' : Tokens }
export interface BasicDaoStableStorage {
  'system_params' : SystemParams,
  'accounts' : Array<Account>,
  'proposals' : Array<Proposal>,
}
export interface Coordinate_2 { 'lat' : number, 'long' : number }
export type Message = Message_2;
export interface Message_2 {
  'contents' : string,
  'time' : bigint,
  'identity' : string,
}
export type Profile = Profile_2;
export interface Profile_2 {
  'name' : string,
  'description' : string,
  'keywords' : Array<string>,
}
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
  'tokens_received_for_signal_creation' : bigint,
  'transfer_fee' : Tokens,
  'upvotes_required_before_token_minting' : number,
  'downvotes_required_before_delete' : number,
  'tokens_received_for_upvoted_signal' : bigint,
  'proposal_vote_threshold' : Tokens,
  'proposal_submission_deposit' : Tokens,
}
export interface Tokens { 'amount_e8s' : bigint }
export interface TransferArgs { 'to' : Principal, 'amount' : Tokens }
export type TransferResult = { 'Ok' : null } |
  { 'Err' : string };
export interface UpdateSystemParamsPayload {
  'tokens_received_for_signal_creation' : [] | [bigint],
  'transfer_fee' : [] | [Tokens],
  'upvotes_required_before_token_minting' : [] | [number],
  'downvotes_required_before_delete' : [] | [number],
  'tokens_received_for_upvoted_signal' : [] | [bigint],
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
  'get' : ActorMethod<[string], Profile_2>,
  'getSelf' : ActorMethod<[], Profile_2>,
  'get_all_signals' : ActorMethod<[], Array<Signal_2>>,
  'get_proposal' : ActorMethod<[bigint], [] | [Proposal]>,
  'get_rating_for_signal' : ActorMethod<[Coordinate_2], number>,
  'get_signal' : ActorMethod<[Coordinate_2], Signal_2>,
  'get_signals_for_user' : ActorMethod<[Principal], Array<Signal_2>>,
  'get_system_params' : ActorMethod<[], SystemParams>,
  'get_user_for_signal_coordinates' : ActorMethod<[Coordinate_2], Principal>,
  'greet' : ActorMethod<[string], string>,
  'leave_rating' : ActorMethod<[Coordinate_2, boolean], undefined>,
  'list_accounts' : ActorMethod<[], Array<Account>>,
  'list_proposals' : ActorMethod<[], Array<Proposal>>,
  'search' : ActorMethod<[string], [] | [Profile_2]>,
  'submit_proposal' : ActorMethod<[ProposalPayload], SubmitProposalResult>,
  'transfer' : ActorMethod<[TransferArgs], TransferResult>,
  'update' : ActorMethod<[Profile_2], undefined>,
  'update_system_params' : ActorMethod<[UpdateSystemParamsPayload], undefined>,
  'vote' : ActorMethod<[VoteArgs], VoteResult>,
  'whoami' : ActorMethod<[], Principal>,
}
