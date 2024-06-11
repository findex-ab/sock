import { SockEvent } from "#/shared/event";
import { Dict } from "#/shared/types";
import { ISocket } from "./socket";
import { SetStateFun } from "./state";
export type SockApp = {
    onEvent: (client: ISocket, event: SockEvent) => (void | Promise<void>);
};
export type SockAppConfig = Partial<SockApp>;
export type SockAppContext = {
    key: string;
    useState: <T extends Dict = Dict>(init: T) => [T, SetStateFun<T>];
};
export type SockAppInternal = (ctx: SockAppContext) => SockApp;
export type SockAppInit = (ctx: SockAppContext) => SockAppConfig;
export declare const sockApp: (init: SockAppInit) => SockAppInternal;
