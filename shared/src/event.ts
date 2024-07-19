import { Dict } from "./types";

export enum ESockEvent {
  PING = 'PING',
  PONG = 'PONG',
  AUTH = 'AUTH',
  CLOSE = 'CLOSE',
  BEGIN_TRANSACTION = 'BEGIN_TRANSACTION',
  END_TRANSACTION = 'END_TRANSACTION',
  TRANSFER_RECEIVED = 'TRANSFER_RECEIVED',
  STATE_UPDATE = "STATE_UPDATE",
  PULL = 'PULL',
  SUBSCRIBE = "SUBSCRIBE",
  SUBSCRIBE_APP = "SUBSCRIBE_APP",
  UNSUBSCRIBE_APP = "UNSUBSCRIBE_APP"
}

export type SockEvent<T extends Dict = Dict> = {
  type: string;
  app?: string;
  receiverId?: string;
  senderId?: string;
  payload: T;
  binary?: Uint8Array;
  transactionName?: string;
  totalSize?: number;
  sizeReceived?: number;
  broadcast?: boolean;
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

export const parseEvent = <T extends Dict = Dict>(data: { toString: () => string }): SockEvent<T> => {
  const parsed = JSON.parse(data.toString());
  if (!isSockEvent<T>(parsed)) throw new Error(`Malformed event`);
  return parsed;
}
