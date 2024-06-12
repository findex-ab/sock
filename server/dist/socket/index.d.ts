import { WebSocket } from "ws";
import { SockEvent } from "../../../shared/src/event";
import { SockClientAuth } from "../auth";
import { SockTransaction } from "../transaction";
export declare class Socket {
    socket: WebSocket;
    id: string;
    auth?: SockClientAuth;
    apps: string[];
    transactions: Record<string, SockTransaction>;
    transaction?: SockTransaction;
    constructor(socket: WebSocket | string, id: string);
    beginTransaction(event: SockEvent): void;
    endTransaction(event: SockEvent): void;
    transfer(data: Uint8Array): void;
    deleteTransaction(): void;
    deleteAllTransactions(): void;
    finishTransactions(): void;
    addApp(app: string): void;
    removeApp(app: string): void;
    receive(expect: Partial<SockEvent>, timeout?: number): Promise<SockEvent | null>;
    send(event: SockEvent): void;
}
export type ISocket = InstanceType<typeof Socket>;
