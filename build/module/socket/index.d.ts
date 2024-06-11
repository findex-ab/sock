import { WebSocket } from "ws";
import { SockEvent } from "#/shared/event";
import { SockClientAuth } from "../auth";
export declare class Socket {
    socket: WebSocket;
    auth?: SockClientAuth;
    apps: string[];
    id: string;
    constructor(socket: WebSocket, id: string);
    addApp(app: string): void;
    removeApp(app: string): void;
    receive(expect: Partial<SockEvent>, timeout?: number): Promise<SockEvent | null>;
    send(event: SockEvent): void;
}
export type ISocket = InstanceType<typeof Socket>;
