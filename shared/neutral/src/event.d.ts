import { Dict } from "./types";
export declare enum ESockEvent {
    PING = "PING",
    PONG = "PONG",
    AUTH = "AUTH",
    CLOSE = "CLOSE",
    BEGIN_TRANSACTION = "BEGIN_TRANSACTION",
    END_TRANSACTION = "END_TRANSACTION",
    TRANSFER_RECEIVED = "TRANSFER_RECEIVED",
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
    binary?: Uint8Array;
    transactionName?: string;
    totalSize?: number;
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
