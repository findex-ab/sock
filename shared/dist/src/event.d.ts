import { Dict } from "./types";
export declare enum ESockEvent {
    PING = "PING",
    AUTH = "AUTH",
    CLOSE = "CLOSE",
    STATE_UPDATE = "STATE_UPDATE",
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
};
export type SockPayloadByteChunk = {
    name: string;
    totalSize: number;
    index: number;
    chunk: number[];
    done?: boolean;
};
export declare const isSockEvent: <T extends Dict = Dict>(x: any) => x is SockEvent<T>;
export declare const parseEvent: <T extends Dict = Dict>(data: {
    toString: () => string;
}) => SockEvent<T>;