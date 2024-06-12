import { SockEvent } from "../../../shared/src/event";
export declare const parseEvent: (data: {
    toString: () => string;
}) => SockEvent;
