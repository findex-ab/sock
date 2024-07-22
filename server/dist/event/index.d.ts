import { SockEvent } from "../../../shared/src/event";
import { ISocket } from "../socket";
export type QueuedEvent = SockEvent & {
    client: ISocket;
};
export declare const parseEvent: (data: {
    toString: () => string;
}) => SockEvent;
