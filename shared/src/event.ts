import { Dict } from "./types";

export enum ESockEvent {
  AUTH = 'AUTH',
  STATE_UPDATE = "STATE_UPDATE",
  SUBSCRIBE = "SUBSCRIBE",
  SUBSCRIBE_APP = "SUBSCRIBE_APP",
  UNSUBSCRIBE_APP = "UNSUBSCRIBE_APP"
}

export type SockEvent<T extends Dict = Dict> = {
  type: string;
  app?: string;
  payload: T;
}

export type SockPayloadByteChunk = {
  name: string;
  totalSize: number;
  index: number;
  chunk: number[];
  done?: boolean;
}

export const isSockEvent = <T extends Dict = Dict>(x: any): x is SockEvent<T> => {
  if (!x) return false;
  if (typeof x !== 'object') return false;
  return (typeof x.type === 'string' && typeof x.payload === 'object');
}
