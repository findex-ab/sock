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
                const transform = options?.transform ? options.transform : (data) => data;
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
                    getClients: () => state.clients
                }
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
                payload: {}
            });
        }));
        const allAppNames = Object.keys(state.apps);
        await Promise.all(allAppNames.map(async (appName) => {
            const app = state.apps[appName];
            return await app.onAnyEvent(client, {
                type: event_1.ESockEvent.CLOSE,
                payload: {}
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
            const receiver = state.clients.find(it => it.id === event.receiverId);
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
                message: 'OK'
            }
        });
        sock.on("close", async () => {
            await safely(async () => removeClient(client));
        });
        sock.on("message", async (msg) => {
            try {
                const event = (0, event_2.parseEvent)(msg);
                await safely(async () => onEvent(client, event));
            }
            catch (e) {
                console.error(e);
            }
        });
        sock.on('ping', async () => {
            await safely(async () => onEvent(client, {
                type: event_1.ESockEvent.PING,
                payload: {}
            }));
        });
    });
    const close = () => {
        socket.close();
    };
    return { close };
};
exports.server = server;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpREFBa0U7QUFDbEUsa0RBSWdDO0FBRWhDLGtEQUE0RTtBQUc1RSxzREFBMkQ7QUFDM0QsbUNBQXFDO0FBQ3JDLHFDQUEyQztBQXFCM0MsTUFBTSxNQUFNLEdBQUcsS0FBSyxFQUFFLEdBQXVCLEVBQUUsRUFBRTtJQUMvQyxJQUFJLENBQUM7UUFDSCxHQUFHLEVBQUUsQ0FBQTtJQUNQLENBQUM7SUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuQixDQUFDO0FBQ0gsQ0FBQyxDQUFBO0FBRU0sTUFBTSxNQUFNLEdBQUcsS0FBSyxFQUN6QixNQUFvQixFQUNDLEVBQUU7SUFDdkIsTUFBTSxNQUFNLEdBQUcsSUFBQSwyQkFBWSxFQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzQyxNQUFNLEtBQUssR0FBRyxJQUFBLGFBQUssRUFBYztRQUMvQixPQUFPLEVBQUUsRUFBRTtRQUNYLElBQUksRUFBRSxFQUFFO0tBQ1QsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxNQUFNLEdBQUcsSUFBQSxtQkFBWSxFQUFDO1FBQzFCLFNBQVMsRUFBRSxFQUFFO0tBQ2QsQ0FBQyxDQUFDO0lBRUgsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDaEIsTUFBTSxNQUFNLEdBQTJDLEVBQUUsQ0FBQztRQUUxRCxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFO1lBQzdDLE1BQU0sUUFBUSxHQUFHLENBQ2YsT0FBVSxFQUNWLE9BQTRCLEVBQ1AsRUFBRTtnQkFDdkIsTUFBTSxXQUFXLEdBQUcsT0FBTyxFQUFFLE1BQU0sQ0FB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