import { SockEvent, isSockEvent } from "../../../shared/src/event";

export const parseEvent = (data: { toString: () => string }): SockEvent => {
  const parsed = JSON.parse(data.toString());
  if (!isSockEvent(parsed)) throw new Error(`Malformed event`);
  return parsed;
}
