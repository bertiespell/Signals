export const idlFactory = ({ IDL }) => {
  const Coordinate_2 = IDL.Record({ 'lat' : IDL.Int32, 'long' : IDL.Int32 });
  const Message_2 = IDL.Record({
    'contents' : IDL.Text,
    'time' : IDL.Nat64,
    'identity' : IDL.Text,
  });
  const Profile_2 = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Text,
    'keywords' : IDL.Vec(IDL.Text),
  });
  return IDL.Service({
    'add_new_message' : IDL.Func(
        [Coordinate_2, IDL.Text],
        [IDL.Vec(Message_2)],
        [],
      ),
    'create_new_chat' : IDL.Func(
        [Coordinate_2, IDL.Text],
        [IDL.Vec(Message_2)],
        [],
      ),
    'get' : IDL.Func([IDL.Text], [Profile_2], ['query']),
    'getSelf' : IDL.Func([], [Profile_2], ['query']),
    'get_chat' : IDL.Func([Coordinate_2], [IDL.Vec(Message_2)], []),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'search' : IDL.Func([IDL.Text], [IDL.Opt(Profile_2)], ['query']),
    'update' : IDL.Func([Profile_2], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
