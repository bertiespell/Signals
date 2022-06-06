export const idlFactory = ({ IDL }) => {
  const Coordinate_2 = IDL.Record({
    'lat' : IDL.Float64,
    'long' : IDL.Float64,
  });
  const SignalType_2 = IDL.Variant({
    'trade' : IDL.Null,
    'chat' : IDL.Null,
    'event' : IDL.Null,
  });
  const Message_2 = IDL.Record({
    'contents' : IDL.Text,
    'time' : IDL.Nat64,
    'identity' : IDL.Text,
  });
  const Signal_2 = IDL.Record({
    'signal_type' : SignalType_2,
    'messages' : IDL.Vec(Message_2),
  });
  const Profile_2 = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Text,
    'keywords' : IDL.Vec(IDL.Text),
  });
  const Located_Signal_2 = IDL.Record({
    'signal' : Signal_2,
    'location' : Coordinate_2,
  });
  return IDL.Service({
    'add_new_message' : IDL.Func([Coordinate_2, IDL.Text], [Signal_2], []),
    'create_new_chat' : IDL.Func(
        [Coordinate_2, IDL.Text, SignalType_2],
        [Signal_2],
        [],
      ),
    'delete_signal' : IDL.Func([Coordinate_2], [], []),
    'get' : IDL.Func([IDL.Text], [Profile_2], ['query']),
    'getSelf' : IDL.Func([], [Profile_2], ['query']),
    'get_all_signals' : IDL.Func([], [IDL.Vec(Located_Signal_2)], ['query']),
    'get_chat' : IDL.Func([Coordinate_2], [Signal_2], []),
    'get_signals_for_user' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Signal_2)],
        ['query'],
      ),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'search' : IDL.Func([IDL.Text], [IDL.Opt(Profile_2)], ['query']),
    'update' : IDL.Func([Profile_2], [], []),
    'whoami' : IDL.Func([], [IDL.Principal], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
