import { SockEvent } from "../../../shared/src/event";
type TransactionPacket = {
    data: Uint8Array;
};
export type SockTransaction = {
    start?: SockEvent;
    packets: TransactionPacket[];
    size: number;
    end?: SockEvent;
};
export type SockCompleteTransaction = {
    start: SockEvent;
    packets: TransactionPacket[];
    size: number;
    end: SockEvent;
};
export {};
