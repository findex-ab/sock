import { ServerSocketConfig } from "./serverSocket";
import { SockEvent } from "#/shared/event";
import { Dict } from "#/shared/types";
import { SockClientAuth } from "./auth";
import { ISocket } from "./socket";
import { SockApp, SockAppInternal } from "./app";
export type ServerConfig = {
    socket: ServerSocketConfig;
    authenticate: (event: SockEvent<any>) => Promise<SockClientAuth | null | undefined>;
    apps?: Record<string, SockAppInternal>;
};
export type ServerState = {
    clients: ISocket[];
    apps: Record<string, SockApp>;
};
export type SockServer = {
    close: () => void;
};
export declare const server: <AuthenticationEventType extends Dict = Dict>(config: ServerConfig) => Promise<SockServer>;
