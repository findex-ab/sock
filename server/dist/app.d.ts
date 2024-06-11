import { SockEvent } from "../../shared/src/event";
import { Dict } from "../../shared/src/types";
import { ISocket } from "./socket";
import { SetStateFun, UseStateOptions } from "./state";
export type SockApp = {
    onEvent: (client: ISocket, event: SockEvent) => (void | Promise<void>);
    onAnyEvent: (client: ISocket, event: SockEvent) => (void | Promise<void>);
    onSubscribe: (client: ISocket, event: SockEvent) => (void | Promise<void>);
    onUnsubscribe: (client: ISocket, event: SockEvent) => (void | Promise<void>);
};
export type SockAppConfig = Partial<SockApp>;
export type SockAppContext = {
    key: string;
    useState: <T extends Dict = Dict>(init: T, options?: UseStateOptions<T>) => [T, SetStateFun<T>];
    server: {
        getClients: () => ISocket[];
    };
};
export type SockAppInternal = (ctx: SockAppContext) => SockApp;
export type SockAppInit = (ctx: SockAppContext) => SockAppConfig;
export declare const sockApp: (init: SockAppInit) => SockAppInternal;
