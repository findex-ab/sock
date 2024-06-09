import { SockEvent, isSockEvent } from  '#/shared/event';
import { Dict } from "#/shared/types";
import { until } from '#/shared/utils/until';
import { proxy } from "#/shared/proxy";

const DEFAULT_TIMEOUT = 10000

export type ClientConfig = {
  socket: string | WebSocket;
  id: number;
  onEvent?: (event: SockEvent) => (void | Promise<void>);
}

export type Client = ClientConfig & {
  socket: WebSocket;
  send: (event: SockEvent) => void;
  receive: <T extends Dict = Dict>(type: string, timeout?: number) => Promise<SockEvent<T> | null>;
  ack: <T extends Dict = Dict>(event: SockEvent<T>, expect: string, timeout?: number) => Promise<SockEvent<T> | null>;
  apps: string[]
}

export const sockClient = async (cfg: ClientConfig, wait: boolean = false): Promise<Client> => {
  const { socket: connection } = cfg;
  const socket = typeof connection === 'string' ? new WebSocket(connection) : connection;

  if (wait) {
    await until(() => socket.readyState === WebSocket.OPEN, 0, DEFAULT_TIMEOUT);
  }

  const send = (event: SockEvent) => {
    socket.send(JSON.stringify(event));
  }

  const receive = async <T extends Dict = Dict>(type: string, timeout: number = DEFAULT_TIMEOUT): Promise<SockEvent<T> | null> => {
    return new Promise((resolve, _reject) => {
      const fun = (msg: MessageEvent) => {
        try {
          const parsed = JSON.parse(msg.data.toString());
          if (!isSockEvent(parsed)) return;
          if (parsed.type !== type) return;
          resolve(parsed as SockEvent<T>);
          clear();
        } catch (e) {
          console.error(e);
        }
      }
      const clear = () => {
        socket.removeEventListener('message', fun);
        clearTimeout(timer);
      }
      socket.addEventListener('message', fun);

      const timer = setTimeout(() => {
        clear();
        resolve(null);
      }, timeout);
    })
  }

  const ack = async <T extends Dict = Dict>(event: SockEvent, expect: string, timeout: number = DEFAULT_TIMEOUT): Promise<SockEvent<T> | null> => {
    send(event);
    return await receive<T>(expect, timeout);
  }

  if (cfg.onEvent) {
    socket.addEventListener('message', async (msg) => {
      try {
        const parsed = JSON.parse(msg.data.toString());
        if (!isSockEvent(parsed)) return;
        cfg.onEvent(parsed);
      } catch (e) {
        console.error(e);
      }
    })
  }

  return proxy<Client>({
    ...cfg,
    apps: [],
    socket,
    send,
    receive,
    ack
  })
}
