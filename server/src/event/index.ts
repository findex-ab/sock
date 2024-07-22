import { SockEvent, isSockEvent } from "../../../shared/src/event";
import { ISocket } from "../socket";

export type QueuedEvent = SockEvent & {
  client: ISocket;
}

export const parseEvent = (data: { toString: () => string }): SockEvent => {
  const parsed = JSON.parse(data.toString());
  if (!isSockEvent(parsed)) throw new Error(`Malformed event`);
  return parsed;
}
