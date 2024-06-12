import { ServerSocketConfig, serverSocket } from "./serverSocket";
import { SubscriptionProxy, proxy, subscriptionProxy } from "../../shared/src/proxy";
import WebSocket, { RawData } from "ws";
import { ESockEvent, SockEvent, isSockEvent } from "../../shared/src/event";
import { Dict } from "../../shared/src/types/dict";
import { SockClientAuth } from "./auth";
import { UIDGenerator } from "../../shared/src/utils/hash";
import { parseEvent } from "./event";
import { ISocket, Socket } from "./socket";
import { SockApp, SockAppInternal } from "./app";
import { SetStateFun, UseStateOptions } from "./state";
import { SockCompleteTransaction, SockTransaction } from "./transaction";

export type ServerConfig = {
  socket: ServerSocketConfig;
  authenticate: (
    event: SockEvent<any>,
  ) => Promise<SockClientAuth | null | undefined>;
  apps?: Record<string, SockAppInternal>;
};

export type ServerState = {
  clients: ISocket[];
  apps: Record<string, SockApp>;
};

export type SockServer = {
  close: () => void;
};

const safely = async (fun: () => Promise<any>) => {
  try {
    fun();
  } catch (e) {
    console.error(e);
  }
};

export const server = async <AuthenticationEventType extends Dict = Dict>(
  config: ServerConfig,
): Promise<SockServer> => {
  const socket = serverSocket(config.socket);
  const state = proxy<ServerState>({
    clients: [],
    apps: {},
  });
  const uidGen = UIDGenerator({
    uidLength: 24,
  });

  if (config.apps) {
    const states: Record<string, SubscriptionProxy<any>> = {};

    Object.entries(config.apps).map(([key, fun]) => {
      const useState = <T extends Dict = Dict>(
        initial: T,
        options?: UseStateOptions<T>,
      ): [T, SetStateFun<T>] => {
        const stateClient = options?.client;
        const stateKey = stateClient ? `${key}-${stateClient.id}` : key;

        const transform = options?.transform
          ? options.transform
          : (data: T) => data;

        if (stateClient && !states[stateKey]) {
          stateClient.send({
            type: ESockEvent.STATE_UPDATE,
            app: key,
            payload: transform(initial),
          });
        }

        const proxyState =
          states[stateKey] || subscriptionProxy<T>(initial, []);
        states[stateKey] = proxyState;
        const setState: SetStateFun<T> = (fun) => {
          const next = fun(states[stateKey].state || initial);
          proxyState.setState((s) => ({ ...s, ...next }));

          if (stateClient) {
            stateClient.send({
              type: ESockEvent.STATE_UPDATE,
              app: key,
              payload: transform(next),
            });
          } else {
            const clients = state.clients.filter((it) => it.apps.includes(key));
            clients.forEach((client) => {
              client.send({
                type: ESockEvent.STATE_UPDATE,
                app: key,
                payload: transform(next),
              });
            });
          }
        };
        return [states[stateKey].state, setState];
      };

      state.apps[key] = fun({
        key,
        useState,
        server: {
          getClients: () => state.clients,
        },
      });
    });
  }

  const removeClient = async (client: ISocket) => {
    console.log(`Removing client ${client.id}`);
    state.clients = state.clients.filter((it) => it.id !== client.id);

    await Promise.all(
      client.apps.map(async (appName) => {
        return await onEvent(client, {
          type: ESockEvent.UNSUBSCRIBE_APP,
          app: appName,
          payload: {},
        });
      }),
    );

    const allAppNames = Object.keys(state.apps);
    await Promise.all(
      allAppNames.map(async (appName) => {
        const app = state.apps[appName];
        return await app.onAnyEvent(client, {
          type: ESockEvent.CLOSE,
          payload: {},
        });
      }),
    );
  };

  const insertClient = async (client: ISocket) => {
    const existing = state.clients.find(it => it.id === client.id);
    if (existing) {
      console.warn(`Warning: Existing client already exists ${client.id}`);
      return;
    }
    state.clients = [...state.clients, client];
  };

  const onEvent = async (client: ISocket, event: SockEvent) => {
    console.log(`Received: ${event.type}`);

    if (event.receiverId && event.receiverId !== client.id) {
      console.log(`Event is to be forwarded to ${event.receiverId}`);
      const receiver = state.clients.find((it) => it.id === event.receiverId);
      if (!receiver) {
        console.error(`Receiver ${event.receiverId} not found.`);
        return;
      }
      await onEvent(receiver, event);
    }

    switch (event.type) {
      case ESockEvent.SUBSCRIBE_APP:
        {
          if (!event.app) throw new Error(`Missing app in event`);
          client.addApp(event.app);
          client.send(event);
        }
        break;
      case ESockEvent.UNSUBSCRIBE_APP:
        {
          if (!event.app) throw new Error(`Missing app in event`);
          client.removeApp(event.app);
          client.send(event);
        }
        break;
      case ESockEvent.BEGIN_TRANSACTION:
        {
          client.beginTransaction(event);
          client.send(event)
        }
        break;
      case ESockEvent.END_TRANSACTION:
        {
          client.endTransaction(event);

          const transaction = client.transaction;
          if (transaction.start && transaction.end && transaction.packets) {
            const completeTransaction: SockCompleteTransaction = {
              start: transaction.start,
              packets: transaction.packets,
              size: transaction.size || 0,
              end: transaction.end,
            };
            await onCompleteTransaction(client, completeTransaction);
          }
          client.send(event);
          client.finishTransactions();
        }
        break;
    }

    if (event.app && client.apps.includes(event.app)) {
      const app = state.apps[event.app];
      if (app) {
        await app.onEvent(client, event);
      }
    }

    const allAppNames = Object.keys(state.apps);
    await Promise.all(
      allAppNames.map(async (appName) => {
        const app = state.apps[appName];
        return await app.onAnyEvent(client, event);
      }),
    );
  };

  const onTransfer = async (
    client: ISocket,
    transaction: SockTransaction,
  ) => {
    const start = transaction.start;
    if (!start) return;
    const appName = start.app;
    if (!appName) return;
    const app = state.apps[appName];
    if (!app || !client.apps.includes(appName)) return;
    await app.onTransfer(client, transaction);
  };

  const onCompleteTransaction = async (
    client: ISocket,
    transaction: SockCompleteTransaction,
  ) => {
    const start = transaction.start;
    if (!start) return;
    const appName = start.app;
    if (!appName) return;
    const app = state.apps[appName];
    if (!app || !client.apps.includes(appName)) return;
    await app.onCompleteTransaction(client, transaction);
  };

  const onBinary = async (client: ISocket, data: RawData) => {
    if (!client.transaction) return;
    client.transfer(new Uint8Array(data as any));
    await onTransfer(client, client.transaction);
  };

  socket.on("connection", async (sock, req) => {
    console.log(`Received connection`);
    const uid = uidGen.next();
    const client = new Socket(sock, uid);
    const authResp = await client.receive({ type: ESockEvent.AUTH });
    if (!authResp) return;
    const auth = await config.authenticate(authResp);
    if (!auth) {
      console.error("Not authenticated");
      return;
    }
    console.log({ auth });
    client.id = auth.id;
    client.auth = auth;

    await safely(async () => insertClient(client));
    await safely(async () => onEvent(client, authResp));

    client.send({
      type: ESockEvent.AUTH,
      payload: {
        message: "OK",
      },
    });

    sock.on("close", async () => {
      await safely(async () => removeClient(client));
    });

    sock.on("message", async (msg, isBinary) => {
      if (isBinary) {
        await safely(async () => onBinary(client, msg))
        return;
      }
      try {
        const event = parseEvent(msg);
        await safely(async () => onEvent(client, event));
      } catch (e) {
        console.error(e);
      }
    });

    sock.on("ping", async () => {
      await safely(async () =>
        onEvent(client, {
          type: ESockEvent.PING,
          payload: {},
        }),
      );
    });
  });

  const close = () => {
    socket.close();
  };

  return { close };
};
