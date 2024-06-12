"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const serverSocket_1 = require("./serverSocket");
const proxy_1 = require("../../shared/src/proxy");
const event_1 = require("../../shared/src/event");
const hash_1 = require("../../shared/src/utils/hash");
const event_2 = require("./event");
const socket_1 = require("./socket");
const safely = async (fun) => {
    try {
        fun();
    }
    catch (e) {
        console.error(e);
    }
};
const server = async (config) => {
    const socket = (0, serverSocket_1.serverSocket)(config.socket);
    const state = (0, proxy_1.proxy)({
        clients: [],
        apps: {},
    });
    const uidGen = (0, hash_1.UIDGenerator)({
        uidLength: 24,
    });
    if (config.apps) {
        const states = {};
        Object.entries(config.apps).map(([key, fun]) => {
            const useState = (initial, options) => {
                const stateClient = options?.client;
                const stateKey = stateClient ? `${key}-${stateClient.id}` : key;
                const transform = options?.transform
                    ? options.transform
                    : (data) => data;
                if (stateClient && !states[stateKey]) {
                    stateClient.send({
                        type: event_1.ESockEvent.STATE_UPDATE,
                        app: key,
                        payload: transform(initial),
                    });
                }
                const proxyState = states[stateKey] || (0, proxy_1.subscriptionProxy)(initial, []);
                states[stateKey] = proxyState;
                const setState = (fun) => {
                    const next = fun(states[stateKey].state || initial);
                    proxyState.setState((s) => ({ ...s, ...next }));
                    if (stateClient) {
                        stateClient.send({
                            type: event_1.ESockEvent.STATE_UPDATE,
                            app: key,
                            payload: transform(next),
                        });
                    }
                    else {
                        const clients = state.clients.filter((it) => it.apps.includes(key));
                        clients.forEach((client) => {
                            client.send({
                                type: event_1.ESockEvent.STATE_UPDATE,
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
    const removeClient = async (client) => {
        console.log(`Removing client ${client.id}`);
        state.clients = state.clients.filter((it) => it.id !== client.id);
        await Promise.all(client.apps.map(async (appName) => {
            return await onEvent(client, {
                type: event_1.ESockEvent.UNSUBSCRIBE_APP,
                app: appName,
                payload: {},
            });
        }));
        const allAppNames = Object.keys(state.apps);
        await Promise.all(allAppNames.map(async (appName) => {
            const app = state.apps[appName];
            return await app.onAnyEvent(client, {
                type: event_1.ESockEvent.CLOSE,
                payload: {},
            });
        }));
    };
    const insertClient = async (client) => {
        await removeClient(client);
        state.clients = [...state.clients, client];
    };
    const onEvent = async (client, event) => {
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
            case event_1.ESockEvent.SUBSCRIBE_APP:
                {
                    if (!event.app)
                        throw new Error(`Missing app in event`);
                    client.addApp(event.app);
                    client.send(event);
                }
                break;
            case event_1.ESockEvent.UNSUBSCRIBE_APP:
                {
                    if (!event.app)
                        throw new Error(`Missing app in event`);
                    client.removeApp(event.app);
                    client.send(event);
                }
                break;
            case event_1.ESockEvent.BEGIN_TRANSACTION:
                {
                    client.beginTransaction(event);
                    client.send(event);
                }
                break;
            case event_1.ESockEvent.END_TRANSACTION:
                {
                    client.endTransaction(event);
                    const transaction = client.transaction;
                    if (transaction.start && transaction.end && transaction.packets) {
                        const completeTransaction = {
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
        await Promise.all(allAppNames.map(async (appName) => {
            const app = state.apps[appName];
            return await app.onAnyEvent(client, event);
        }));
    };
    const onTransfer = async (client, transaction) => {
        const start = transaction.start;
        if (!start)
            return;
        const appName = start.app;
        if (!appName)
            return;
        const app = state.apps[appName];
        if (!app || !client.apps.includes(appName))
            return;
        await app.onTransfer(client, transaction);
    };
    const onCompleteTransaction = async (client, transaction) => {
        const start = transaction.start;
        if (!start)
            return;
        const appName = start.app;
        if (!appName)
            return;
        const app = state.apps[appName];
        if (!app || !client.apps.includes(appName))
            return;
        await app.onCompleteTransaction(client, transaction);
    };
    const onBinary = async (client, data) => {
        if (!client.transaction)
            return;
        client.transfer(new Uint8Array(data));
        await onTransfer(client, client.transaction);
    };
    socket.on("connection", async (sock, req) => {
        console.log(`Received connection`);
        const uid = uidGen.next();
        const client = new socket_1.Socket(sock, uid);
        const authResp = await client.receive({ type: event_1.ESockEvent.AUTH });
        if (!authResp)
            return;
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
            type: event_1.ESockEvent.AUTH,
            payload: {
                message: "OK",
            },
        });
        sock.on("close", async () => {
            await safely(async () => removeClient(client));
        });
        sock.on("message", async (msg, isBinary) => {
            if (isBinary) {
                await safely(async () => onBinary(client, msg));
                return;
            }
            try {
                const event = (0, event_2.parseEvent)(msg);
                await safely(async () => onEvent(client, event));
            }
            catch (e) {
                console.error(e);
            }
        });
        sock.on("ping", async () => {
            await safely(async () => onEvent(client, {
                type: event_1.ESockEvent.PING,
                payload: {},
            }));
        });
    });
    const close = () => {
        socket.close();
    };
    return { close };
};
exports.server = server;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpREFBa0U7QUFDbEUsa0RBQXFGO0FBRXJGLGtEQUE0RTtBQUc1RSxzREFBMkQ7QUFDM0QsbUNBQXFDO0FBQ3JDLHFDQUEyQztBQXNCM0MsTUFBTSxNQUFNLEdBQUcsS0FBSyxFQUFFLEdBQXVCLEVBQUUsRUFBRTtJQUMvQyxJQUFJLENBQUM7UUFDSCxHQUFHLEVBQUUsQ0FBQztJQUNSLENBQUM7SUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuQixDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBRUssTUFBTSxNQUFNLEdBQUcsS0FBSyxFQUN6QixNQUFvQixFQUNDLEVBQUU7SUFDdkIsTUFBTSxNQUFNLEdBQUcsSUFBQSwyQkFBWSxFQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzQyxNQUFNLEtBQUssR0FBRyxJQUFBLGFBQUssRUFBYztRQUMvQixPQUFPLEVBQUUsRUFBRTtRQUNYLElBQUksRUFBRSxFQUFFO0tBQ1QsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxNQUFNLEdBQUcsSUFBQSxtQkFBWSxFQUFDO1FBQzFCLFNBQVMsRUFBRSxFQUFFO0tBQ2QsQ0FBQyxDQUFDO0lBRUgsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDaEIsTUFBTSxNQUFNLEdBQTJDLEVBQUUsQ0FBQztRQUUxRCxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFO1lBQzdDLE1BQU0sUUFBUSxHQUFHLENBQ2YsT0FBVSxFQUNWLE9BQTRCLEVBQ1AsRUFBRTtnQkFDdkIsTUFBTSxXQUFXLEdBQUcsT0FBTyxFQUFFLE1BQU0sQ0FB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