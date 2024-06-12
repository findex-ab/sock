import { SockEvent } from "#/shared/event";
import { Dict } from "#/shared/types";
import { SchemaParser } from "./schema";
import { ISocket } from "./socket";
import { SetStateFun, UseStateOptions } from "./state";
type EventSlot<T extends Dict = Dict> = {
    schema: SchemaParser<T>;
    fun: (client: ISocket, event: SockEvent<T>) => (void | Promise<void>);
};
export declare const defineEventSlot: <T extends Dict = Dict>(name: string, slot: EventSlot<T>) => {
    [x: string]: EventSlot<T>;
};
export type SockApp = {
    onEvent: (client: ISocket, event: SockEvent) => (void | Promise<void>);
    onAnyEvent: (client: ISocket, event: SockEvent) => (void | Promise<void>);
    onSubscribe: (client: ISocket, event: SockEvent) => (void | Promise<void>);
    onUnsubscribe: (client: ISocket, event: SockEvent) => (void | Promise<void>);
    events: Record<string, EventSlot<any>>;
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
export {};
