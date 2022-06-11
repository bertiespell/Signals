export const idlFactory = ({ IDL }) => {
  const Tokens = IDL.Record({ 'amount' : IDL.Nat64 });
  const Coordinate = IDL.Record({ 'lat' : IDL.Float64, 'long' : IDL.Float64 });
  const SignalType = IDL.Variant({
    'Event' : IDL.Null,
    'Chat' : IDL.Null,
    'Trade' : IDL.Null,
  });
  const Message = IDL.Record({
    'contents' : IDL.Text,
    'time' : IDL.Nat64,
    'identity' : IDL.Text,
  });
  const Signal = IDL.Record({
    'id' : IDL.Int,
    'updated_at' : IDL.Nat64,
    'signal_type' : SignalType,
    'messages' : IDL.Vec(Message),
    'metadata' : IDL.Text,
    'user' : IDL.Principal,
    'created_at' : IDL.Nat64,
    'location' : Coordinate,
  });
  const ProposalState = IDL.Variant({
    'Failed' : IDL.Text,
    'Open' : IDL.Null,
    'Executing' : IDL.Null,
    'Rejected' : IDL.Null,
    'Succeeded' : IDL.Null,
    'Accepted' : IDL.Null,
  });
  const ProposalPayload = IDL.Record({
    'method' : IDL.Text,
    'metadata' : IDL.Text,
    'canister_id' : IDL.Principal,
    'message' : IDL.Vec(IDL.Nat8),
  });
  const Proposal = IDL.Record({
    'id' : IDL.Nat64,
    'votes_no' : Tokens,
    'voters' : IDL.Vec(IDL.Principal),
    'state' : ProposalState,
    'timestamp' : IDL.Nat64,
    'proposer' : IDL.Principal,
    'votes_yes' : Tokens,
    'payload' : ProposalPayload,
  });
  const ProposalParams = IDL.Record({ 'amount' : IDL.Nat64 });
  const SystemParams = IDL.Record({
    'tokens_received_for_signal_creation' : ProposalParams,
    'transfer_fee' : Tokens,
    'upvotes_required_before_token_minting' : ProposalParams,
    'downvotes_required_before_delete' : ProposalParams,
    'tokens_received_for_upvoted_signal' : ProposalParams,
    'proposal_vote_threshold' : Tokens,
    'proposal_submission_deposit' : Tokens,
  });
  const Profile = IDL.Record({
    'profile_pic_url' : IDL.Text,
    'name' : IDL.Text,
  });
  const Account = IDL.Record({ 'owner' : IDL.Principal, 'tokens' : Tokens });
  const SubmitProposalResult = IDL.Variant({
    'Ok' : IDL.Nat64,
    'Err' : IDL.Text,
  });
  const TransferArgs = IDL.Record({ 'to' : IDL.Principal, 'amount' : Tokens });
  const TransferResult = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  const UpdateSystemParamsPayload = IDL.Record({
    'tokens_received_for_signal_creation' : IDL.Opt(ProposalParams),
    'transfer_fee' : IDL.Opt(Tokens),
    'upvotes_required_before_token_minting' : IDL.Opt(ProposalParams),
    'downvotes_required_before_delete' : IDL.Opt(ProposalParams),
    'tokens_received_for_upvoted_signal' : IDL.Opt(ProposalParams),
    'proposal_vote_threshold' : IDL.Opt(Tokens),
    'proposal_submission_deposit' : IDL.Opt(Tokens),
  });
  const Vote = IDL.Variant({ 'No' : IDL.Null, 'Yes' : IDL.Null });
  const VoteArgs = IDL.Record({ 'vote' : Vote, 'proposal_id' : IDL.Nat64 });
  const VoteResult = IDL.Variant({ 'Ok' : ProposalState, 'Err' : IDL.Text });
  return IDL.Service({
    'account_balance' : IDL.Func([], [Tokens], ['query']),
    'add_new_message' : IDL.Func([Coordinate, IDL.Text], [Signal], []),
    'create_account' : IDL.Func([IDL.Principal, IDL.Nat64], [], []),
    'create_new_signal' : IDL.Func(
        [Coordinate, IDL.Text, SignalType],
        [Signal],
        [],
      ),
    'delete_signal' : IDL.Func([Coordinate], [], []),
    'get_all_signals' : IDL.Func([], [IDL.Vec(Signal)], ['query']),
    'get_principal_for_signal_coordinates' : IDL.Func(
        [Coordinate],
        [IDL.Principal],
        ['query'],
      ),
    'get_proposal' : IDL.Func([IDL.Nat64], [IDL.Opt(Proposal)], []),
    'get_rating_for_signal' : IDL.Func([Coordinate], [IDL.Int32], ['query']),
    'get_signal' : IDL.Func([Coordinate], [Signal], []),
    'get_signals_for_user' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Signal)],
        ['query'],
      ),
    'get_system_params' : IDL.Func([], [SystemParams], []),
    'get_user_for_signal_location' : IDL.Func(
        [Coordinate],
        [Profile],
        ['query'],
      ),
    'get_user_self' : IDL.Func([], [Profile], ['query']),
    'leave_rating' : IDL.Func([Coordinate, IDL.Bool], [], []),
    'list_accounts' : IDL.Func([], [IDL.Vec(Account)], ['query']),
    'list_proposals' : IDL.Func([], [IDL.Vec(Proposal)], []),
    'principal_can_rate_location' : IDL.Func(
        [IDL.Principal, Coordinate],
        [IDL.Bool],
        ['query'],
      ),
    'submit_proposal' : IDL.Func([ProposalPayload], [SubmitProposalResult], []),
    'transfer' : IDL.Func([TransferArgs], [TransferResult], []),
    'update_system_params' : IDL.Func([UpdateSystemParamsPayload], [], []),
    'update_user' : IDL.Func([Profile], [], []),
    'vote' : IDL.Func([VoteArgs], [VoteResult], []),
    'whoami' : IDL.Func([], [IDL.Principal], ['query']),
  });
};
export const init = ({ IDL }) => { return [IDL.Opt(IDL.Vec(IDL.Principal))]; };
