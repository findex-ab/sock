import { ServerSocketConfig } from "./serverSocket";
import { WebSocketServer } from "ws";
import { SockEvent } from "../../shared/src/event";
import { Dict } from "../../shared/src/types/dict";
import { SockClientAuth } from "./auth";
import { ISocket } from "./socket";
import { SockApp, SockAppInternal } from "./app";
export type ServerConfig = {
    socket: ServerSocketConfig;
    authenticate: (event: SockEvent<any>) => Promise<SockClientAuth | null | undefined>;
    onClientClose?: (client: ISocket) => (void | Promise<void>);
    apps?: Record<string, SockAppInternal>;
    tickRate?: number;
};
export type ServerState = {
    clients: ISocket[];
    apps: Record<string, SockApp>;
};
export type SockServer = {
    close: () => void;
    socket: InstanceType<typeof WebSocketServer>;
    state: ServerState;
};
export declare const server: <AuthenticationEventType extends Dict = Dict>(config: ServerConfig) => Promise<SockServer>;
