import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

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
export type Signal = Signal_2;
export interface Signal_2 {
  'messages' : Array<Message_2>,
  'location' : Coordinate_2,
}
export interface _SERVICE {
  'add_new_message' : ActorMethod<[Coordinate_2, string], Array<Message_2>>,
  'create_new_chat' : ActorMethod<[Coordinate_2, string], Array<Message_2>>,
  'get' : ActorMethod<[string], Profile_2>,
  'getSelf' : ActorMethod<[], Profile_2>,
  'get_all_signals' : ActorMethod<[], Array<Signal>>,
  'get_chat' : ActorMethod<[Coordinate_2], Array<Message_2>>,
  'greet' : ActorMethod<[string], string>,
  'search' : ActorMethod<[string], [] | [Profile_2]>,
  'update' : ActorMethod<[Profile_2], undefined>,
}
