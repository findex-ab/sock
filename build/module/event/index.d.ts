import { SockEvent } from "#/shared/event";
export declare const parseEvent: (data: {
    toString: () => string;
}) => SockEvent;
