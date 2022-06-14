import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface AccTokens { 'e8s' : bigint }
export interface Account { 'owner' : Principal, 'tokens' : Tokens }
export interface Coordinate { 'lat' : number, 'long' : number }
export type DepositErr = { 'TransferFailure' : null } |
  { 'BalanceLow' : null };
export type DepositReceipt = { 'Ok' : bigint } |
  { 'Err' : DepositErr };
export type Error = { 'CanisterError' : { 'message' : string } } |
  { 'CannotNotify' : null } |
  { 'NoSuchToken' : null } |
  { 'Unauthorized' : null } |
  { 'NotOwner' : null };
export type ManageResult = { 'Ok' : null } |
  { 'Err' : Error };
export type Memo = bigint;
export interface Message {
  'contents' : string,
  'time' : bigint,
  'identity' : Profile,
}
export interface Profile {
  'principal' : Principal,
  'profile_pic_url' : string,
  'name' : string,
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
export interface ProposalParams { 'amount' : bigint }
export interface ProposalPayload {
  'method' : string,
  'metadata' : string,
  'canister_id' : Principal,
  'message' : Array<number>,
}
export type ProposalState = { 'Failed' : string } |
  { 'Open' : null } |
  { 'Executing' : null } |
  { 'Rejected' : null } |
  { 'Succeeded' : null } |
  { 'Accepted' : null };
export interface SaleTransferArgs {
  'to_principal' : Principal,
  'to_subaccount' : [] | [Array<number>],
  'amount' : AccTokens,
}
export type SaleTransferResult = { 'Ok' : Memo } |
  { 'Err' : string };
export interface Signal {
  'id' : bigint,
  'updated_at' : bigint,
  'signal_type' : SignalType,
  'messages' : Array<Message>,
  'metadata' : string,
  'user' : Principal,
  'created_at' : bigint,
  'location' : Coordinate,
}
export type SignalType = { 'Event' : null } |
  { 'Chat' : null } |
  { 'Trade' : null };
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
export interface TicketedEvent {
  'event_owner' : Principal,
  'number_of_tickets' : number,
  'issued_passes' : Array<Principal>,
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
  'add_new_message' : ActorMethod<[Coordinate, string], Signal>,
  'buy_item' : ActorMethod<[bigint, bigint], DepositReceipt>,
  'check_ticket' : ActorMethod<[bigint, Principal], boolean>,
  'claim_sale' : ActorMethod<[bigint], TransferResult>,
  'claim_ticket' : ActorMethod<[bigint], undefined>,
  'create_new_signal' : ActorMethod<[Coordinate, string, SignalType], Signal>,
  'create_ticketed_signal' : ActorMethod<
    [Coordinate, string, SignalType, number],
    Signal,
  >,
  'delete_signal' : ActorMethod<[Coordinate], undefined>,
  'get_all_signals' : ActorMethod<[], Array<Signal>>,
  'get_all_ticketed_events' : ActorMethod<[], Array<TicketedEvent>>,
  'get_event_details' : ActorMethod<[bigint], TicketedEvent>,
  'get_principal_for_signal_coordinates' : ActorMethod<[Coordinate], Principal>,
  'get_proposal' : ActorMethod<[bigint], [] | [Proposal]>,
  'get_rating_for_signal' : ActorMethod<[Coordinate], number>,
  'get_signal' : ActorMethod<[Coordinate], Signal>,
  'get_signals_for_user' : ActorMethod<[Principal], Array<Signal>>,
  'get_system_params' : ActorMethod<[], SystemParams>,
  'get_user_for_signal_location' : ActorMethod<[Coordinate], Profile>,
  'get_user_self' : ActorMethod<[], Profile>,
  'leave_rating' : ActorMethod<[bigint, boolean], undefined>,
  'list_accounts' : ActorMethod<[], Array<Account>>,
  'list_proposals' : ActorMethod<[], Array<Proposal>>,
  'principal_can_rate_signal' : ActorMethod<[Principal, bigint], boolean>,
  'submit_proposal' : ActorMethod<[ProposalPayload], SubmitProposalResult>,
  'transfer' : ActorMethod<[TransferArgs], TransferResult>,
  'transfer_sale' : ActorMethod<[SaleTransferArgs], SaleTransferResult>,
  'update_system_params' : ActorMethod<[UpdateSystemParamsPayload], undefined>,
  'update_user' : ActorMethod<[Profile], undefined>,
  'vote' : ActorMethod<[VoteArgs], VoteResult>,
  'whoami' : ActorMethod<[], Principal>,
}
