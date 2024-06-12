import { SockEvent, isSockEvent, parseEvent } from  '#/shared/event';
import { Dict } from "#/shared/types";
import { until } from '#/shared/utils/until';
import { proxy } from "#/shared/proxy";

const DEFAULT_TIMEOUT = 10000;

export type ClientEventListener = {
  app?: string;
  fun: (event: SockEvent) => (void | Promise<void>);
}

export type ClientConfig = {
  socket: string | WebSocket;
  id: number;
  onEvent?: (event: SockEvent) => (void | Promise<void>);
}

export type Client = ClientConfig & {
  socket: WebSocket;
  send: (event: SockEvent) => void;
  sendRaw: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
  receive: <T extends Dict = Dict>(expect: Partial<SockEvent>, timeout?: number) => Promise<SockEvent<T> | null>;
  ack: <T extends Dict = Dict>(event: SockEvent<T>, expect: Partial<SockEvent>, timeout?: number) => Promise<SockEvent<T> | null>;
  subscribe: (listener: ClientEventListener) => () => void;
  apps: string[];
}

export const sockClient = async (cfg: ClientConfig, wait: boolean = false): Promise<Client> => {
  const { socket: connection } = cfg;
  const socket = typeof connection === 'string' ? new WebSocket(connection) : connection;

  const state = proxy<{
    eventListeners: ClientEventListener[]
  }>({
    eventListeners: []
  })

  if (wait) {
    await until(() => socket.readyState === WebSocket.OPEN, 0, DEFAULT_TIMEOUT);
  }

  const subscribe = (listener: ClientEventListener) => {
    state.eventListeners = [...state.eventListeners, listener];

    return () => {
      state.eventListeners = state.eventListeners.filter(it => it !== listener);
    }
  }

  const send = (event: SockEvent) => {
    socket.send(JSON.stringify(event));
  }

  const sendRaw = (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    socket.send(data);
  }


  const receive = async <T extends Dict = Dict>(expect: Partial<SockEvent>, timeout: number = 5000): Promise<SockEvent<T> | null> => {
    return new Promise((resolve) => {
      const fun = (msg: MessageEvent) => {
        const event = parseEvent<T>(msg.data);
        if (expect.app && event.app !== expect.app) return;
        if (expect.type && event.type !== expect.type) return;
        clear();
        resolve(event);
      }
      socket.addEventListener('message', fun);
      const clear = () => {
        socket.removeEventListener('message', fun);
      }
      setTimeout(() => {
        clear();
        resolve(null);
      }, timeout)
    })
  }

  const ack = async <T extends Dict = Dict>(event: SockEvent, expect: Partial<SockEvent>, timeout: number = DEFAULT_TIMEOUT): Promise<SockEvent<T> | null> => {
    send(event);
    return await receive<T>(expect, timeout);
  }

  socket.addEventListener('message', async (msg) => {
    try {
      const parsed = JSON.parse(msg.data.toString());
      if (!isSockEvent(parsed)) return;

      if (cfg.onEvent) {
        cfg.onEvent(parsed);
      }

      if (parsed.app) {
        const listeners = state.eventListeners.filter(it => it.app === parsed.app);
        await Promise.all(listeners.map(async (listener) => {
          return await listener.fun(parsed);
        }))
      }
    } catch (e) {
      console.error(e);
    }
  })

  return proxy<Client>({
    ...cfg,
    apps: [],
    socket,
    send,
    sendRaw,
    receive,
    ack,
    subscribe
  })
}
