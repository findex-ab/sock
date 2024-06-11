import { WebSocketServer } from "ws";
export type ServerSocketConfig = {
    port: number;
    https?: boolean;
    host?: string;
    socket?: InstanceType<typeof WebSocketServer>;
};
export declare const serverSocket: (config: ServerSocketConfig) => InstanceType<typeof WebSocketServer>;
