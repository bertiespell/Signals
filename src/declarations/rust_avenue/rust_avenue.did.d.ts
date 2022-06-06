import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Coordinate_2 { 'lat' : number, 'long' : number }
export type Located_Signal = Located_Signal_2;
export interface Located_Signal_2 {
  'signal' : Signal_2,
  'location' : Coordinate_2,
}
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
export type Signal = Signal_2;
export type SignalType_2 = { 'trade' : null } |
  { 'chat' : null } |
  { 'event' : null };
export interface Signal_2 {
  'signal_type' : SignalType_2,
  'messages' : Array<Message_2>,
}
export interface _SERVICE {
  'add_new_message' : ActorMethod<[Coordinate_2, string], Signal_2>,
  'create_new_chat' : ActorMethod<
    [Coordinate_2, string, SignalType_2],
    Signal_2,
  >,
  'get' : ActorMethod<[string], Profile_2>,
  'getSelf' : ActorMethod<[], Profile_2>,
  'get_all_signals' : ActorMethod<[], Array<Located_Signal_2>>,
  'get_chat' : ActorMethod<[Coordinate_2], Signal_2>,
  'greet' : ActorMethod<[string], string>,
  'search' : ActorMethod<[string], [] | [Profile_2]>,
  'update' : ActorMethod<[Profile_2], undefined>,
  'whoami' : ActorMethod<[], Principal>,
}
