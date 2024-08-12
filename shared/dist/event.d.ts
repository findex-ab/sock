import { Dict } from "./types";
export declare enum ESockEvent {
    PING = "PING",
    PONG = "PONG",
    AUTH = "AUTH",
    CLOSE = "CLOSE",
    BEGIN_TRANSACTION = "BEGIN_TRANSACTION",
    END_TRANSACTION = "END_TRANSACTION",
    TRANSFER_RECEIVED = "TRANSFER_RECEIVED",
    FILE_TRANSACTION = "FILE_TRANSACTION",
    FILE_TRANSACTION_COMPLETE = "FILE_TRANSACTION_COMPLETE",
    STATE_UPDATE = "STATE_UPDATE",
    PULL = "PULL",
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
};
export type SockPayloadByteChunk = {
    name: string;
    totalSize: number;
    index: number;
    chunk: number[];
    done?: boolean;
};
export type FileTransaction = {
    name: string;
    progress: number;
    finished: boolean;
    totalSize: number;
    chunkSize: number;
    chunkIndex: number;
};
export declare const isSockEvent: <T extends Dict = Dict>(x: any) => x is SockEvent<T>;
export declare const parseEvent: <T extends Dict = Dict>(data: {
    toString: () => string;
}) => SockEvent<T>;
