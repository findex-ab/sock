import { ServerSocketConfig, serverSocket } from "./serverSocket";
import {
  SubscriptionProxy,
  proxy,
  subscriptionProxy,
} from "../../shared/src/proxy";
import WebSocket, { RawData, WebSocketServer } from "ws";
import { ESockEvent, FileTransaction, SockEvent, isSockEvent } from "../../shared/src/event";
import { Dict } from "../../shared/src/types/dict";
import { SockClientAuth } from "./auth";
import { UIDGenerator } from "../../shared/src/utils/hash";
import { parseEvent, QueuedEvent } from "./event";
import { ISocket, Socket } from "./socket";
import { SockApp, SockAppInternal } from "./app";
import { SetStateFun, UseStateOptions } from "./state";
import { SockCompleteTransaction, SockTransaction } from "./transaction";
import { serverTick } from "./tick";
import { range } from "#/shared/utils/array";
import { BinaryReader } from "./utils/binary";
import z from 'zod';

const DEFAULT_TICK_RATE = 1000;

export type ServerConfig = {
  socket: ServerSocketConfig;
  authenticate: (
    event: SockEvent<any>,
  ) => Promise<SockClientAuth | null | undefined>;
  onClientClose?: (client: ISocket) => void | Promise<void>;
  apps?: Record<string, SockAppInternal>;
  tickRate?: number;
};

export type ServerState = {
  clients: ISocket[];
  apps: Record<string, SockApp>;
  eventQueue: QueuedEvent[]
};

export type SockServer = {
  close: () => void;
  socket: InstanceType<typeof WebSocketServer>;
  state: ServerState;
};

const safely = async (fun: () => Promise<any>) => {
  try {
    fun();
  } catch (e) {
    console.error(e);
  }
};

const createServer = async <AuthenticationEventType extends Dict = Dict>(
  config: ServerConfig,
): Promise<SockServer> => {
  const socket = serverSocket(config.socket);
  const state = proxy<ServerState>({
    clients: [],
    apps: {},
    eventQueue: []
  });
  const uidGen = UIDGenerator({
    uidLength: 24,
  });

  const states: Record<string, SubscriptionProxy<any>> = {};
  const stateTransformers: Record<string, (x: any) => any> = {};
  const getAppStateKey = (appName: string, client?: ISocket) =>
    client ? `${appName}-${client.id}` : appName;

  const getTransformer = (appName: string, client?: ISocket) => {
    return stateTransformers[getAppStateKey(appName, client)] || ((x: any) => x);
  }
  const getAppState = (appName: string, client?: ISocket) =>
    states[getAppStateKey(appName, client)];

  const sendAppStateUpdate = (appName: string, client: ISocket) => {
    const transform = getTransformer(appName, client);
    const appstate = getAppState(appName, client)?.state || getAppState(appName)?.state;
    if (!appstate) return;
    
    const stateEvent: SockEvent = {
            type: ESockEvent.STATE_UPDATE,
            app: appName,
            payload: transform(appstate)
          }

    client.send(stateEvent);
  }

  const deleteAppState = (appName: string, client: ISocket) => {
    const key = getAppStateKey(appName, client);
    if (states[key]) {
      console.log(`Deleting app state ${key}`);
      delete states[key];
    }
  }

  if (config.apps) {
    Object.entries(config.apps).map(([key, fun]) => {
      const useState = <T extends Dict = Dict>(
        initial: T,
        options?: UseStateOptions<T>,
      ): [T, SetStateFun<T>] => {
        const stateClient = options?.client;
        const stateKey = getAppStateKey(key, stateClient);

        const transform = options?.transform
          ? options.transform
                        : (data: T) => data;

        stateTransformers[stateKey] = transform;

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
        deleteAppState(appName, client);
        const app = state.apps[appName];
        return await app.onAnyEvent(client, {
          type: ESockEvent.CLOSE,
          payload: {},
        });
      }),
    );
  };

  const insertClient = async (client: ISocket) => {
    const existing = state.clients.find((it) => it.id === client.id);
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

    if (event.broadcast && event.app) {
      const clients = state.clients.filter((it) => it.apps.includes(event.app));
      const app = state.apps[event.app];
      if (!app) {
        console.error(`No such app ${event.app}`);
        return;
      }

      return await Promise.all(
        clients.map(async (it) => {
          return await app.onEvent(it, event);
        }),
      );
    }

    if (event.type !== ESockEvent.SUBSCRIBE_APP && event.type !== ESockEvent.UNSUBSCRIBE_APP && event.app && client.apps.includes(event.app) === false) {
      client.addApp(event.app);
      client.send({
        ...event,
        type: ESockEvent.SUBSCRIBE_APP,
        app: event.app,
        payload: {
          app: event.app,
          name: event.app
        }
      });
      sendAppStateUpdate(event.app, client);
    }

    switch (event.type) {
      case ESockEvent.PULL:
        {
          if (!event.app) throw new Error(`Missing app in event`);
          client.addApp(event.app);
          client.send(event);
          sendAppStateUpdate(event.app, client);
        }
        break;
      case ESockEvent.SUBSCRIBE_APP:
        {
          if (!event.app) throw new Error(`Missing app in event`);
          client.addApp(event.app);
          client.send(event);
          setTimeout(() => {
            sendAppStateUpdate(event.app, client);
          }, 1000);
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
          client.send(event);
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
              uid: transaction.uid
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

  const onTransfer = async (client: ISocket, transaction: SockTransaction) => {
    const start = transaction.start;
    if (!start) return;
    const appName = start.app;
    if (!appName) return;
    const app = state.apps[appName];
    if (!app || !client.apps.includes(appName)) return;
    await app.onTransfer(client, transaction);
  };

  const onFileTransaction = async (client: ISocket, event: SockEvent<FileTransaction>) => {
    const appName = event.app;
    if (!appName) return;
    const app = state.apps[appName];
    if (!app || !client.apps.includes(appName)) return;
    await app.onEvent(client, event);
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

  const parseBinary = (data: Uint8Array): SockEvent<FileTransaction> | null => {
    const buf = Buffer.from(data).buffer;
    const view = new DataView(buf);
    if (view.byteLength <= 0) return null;

    const reader = BinaryReader(data);
    const schema = z.object<any>({
      type: z.string(),
      app: z.string().optional(),
      payload: z.object({
        name: z.string().min(1),
        progress: z.number(),
        finished: z.boolean(),
        totalSize: z.number(),
        chunkSize: z.number().min(1),
        chunkIndex: z.number()
      })
    });
    const event = reader.readJSON<SockEvent<FileTransaction>>(schema as any);
    if (!event) return null;

    const chunkSize = event.payload.chunkSize;
    const bin = reader.readChunk(chunkSize);
    event.binary = bin;
    return event;
  }

  const onBinary = async (client: ISocket, data: RawData) => {
    const binaryEvent = parseBinary(new Uint8Array(data as any));
    if (binaryEvent) {
      await onFileTransaction(client, binaryEvent);
    } 
    if (!client.transaction) return;
    client.transfer(new Uint8Array(data as any));
    await onTransfer(client, client.transaction);
  };

  socket.on("connection", async (sock, req) => {
    console.log(`Received connection`);
    const uid = uidGen.next();

    if (state.clients.find(it => it.id === uid)) {
      console.error(`Warning: uid collision ${uid}`);
    }
    
    const client = new Socket(sock, uid, req);
    const authResp = await client.receive({ type: ESockEvent.AUTH }, 5000);
    if (!authResp) {
      console.error(`Did not receive authentication response.`);
      sock.close();
      return;
    }
    const auth = await config.authenticate(authResp);
    if (!auth) {
      console.error("Not authenticated");
      return;
    }
    console.log(`-- Authenticated --`);
    client.id = auth.id;
    client.auth = auth;
    client.ip =
      typeof authResp.payload.ip === "string" ? authResp.payload.ip : undefined;

    console.log(`inserting client...`)
    await safely(async () => insertClient(client));

    console.log(`on event....`);
    await safely(async () => onEvent(client, authResp));

    client.send({
      type: ESockEvent.AUTH,
      payload: {
        message: "OK",
      },
    });

    sock.on("close", async () => {
      if (config.onClientClose) {
        try {
          await config.onClientClose(client);
        } catch (e) {
          console.error(e);
        }
      }
      await safely(async () => removeClient(client));
    });

    sock.on("message", async (msg, isBinary) => {
      if (isBinary) {
        await safely(async () => onBinary(client, msg));
        return;
      }
      try {
        const event = parseEvent(msg);
        await safely(async () => onEvent(client, event));
      } catch (e) {
        console.error(e);
      }
    });

    //sock.on("ping", async () => {});
    //sock.on('pong', async () => {});
  });

  const close = () => {
    socket.close();
  };

  return { socket, close, state };
};
export const server = async <AuthenticationEventType extends Dict = Dict>(
  config: ServerConfig,
): Promise<SockServer> => {
  const server = await createServer(config);

  setInterval(async () => {
    try {
      await serverTick(server);
    } catch (e) {
      console.error(e);
    }
  }, config.tickRate || DEFAULT_TICK_RATE);

  return server;
};
