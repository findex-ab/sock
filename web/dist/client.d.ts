import { SockEvent } from '#/shared/event';
import { Dict } from "#/shared/types";
export type ClientEventListener = {
    app?: string;
    fun: (event: SockEvent) => (void | Promise<void>);
};
export type ClientConfig = {
    socket: string | WebSocket;
    id: number;
    onEvent?: (event: SockEvent) => (void | Promise<void>);
};
export type Client = ClientConfig & {
    socket: WebSocket;
    send: (event: SockEvent) => void;
    sendRaw: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
    receive: <T extends Dict = Dict>(expect: Partial<SockEvent>, timeout?: number) => Promise<SockEvent<T> | null>;
    ack: <T extends Dict = Dict>(event: SockEvent<T>, expect: Partial<SockEvent>, timeout?: number) => Promise<SockEvent<T> | null>;
    subscribe: (listener: ClientEventListener) => () => void;
    apps: string[];
};
export declare const sockClient: (cfg: ClientConfig, wait?: boolean) => Promise<Client>;
