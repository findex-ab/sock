// ../shared/src/event.ts
var isSockEvent = (x) => {
  if (!x) return false;
  if (typeof x !== "object") return false;
  return typeof x.type === "string" && typeof x.payload === "object";
};
var parseEvent = (data) => {
  const parsed = JSON.parse(data.toString());
  if (!isSockEvent(parsed)) throw new Error(`Malformed event`);
  return parsed;
};

// ../shared/src/utils/until.ts
var until = (fun, interval = 500, timeout = 6e4) => {
  const started = performance.now();
  let timer = void 0;
  return new Promise((resolve, _reject) => {
    if (fun()) {
      resolve(true);
      return;
    }
    timer = setInterval(() => {
      if (fun()) {
        clearInterval(timer);
        resolve(true);
        return;
      }
      const now = performance.now();
      const elapsed = now - started;
      if (elapsed >= timeout) {
        clearInterval(timer);
        resolve(false);
      }
    }, interval);
  });
};

// ../shared/src/proxy/index.ts
var proxy = (initial, args) => {
  return new Proxy(initial, {
    get(target, p, receiver) {
      const key = p;
      if (args?.get) return args.get(target, key, receiver);
      return target[key];
    },
    set(target, p, newValue, receiver) {
      const key = p;
      if (target[key] === newValue) return true;
      target[key] = newValue;
      if (args?.set) args.set(target, key, newValue, receiver);
      if (args?.onChange)
        args.onChange(key, target[key], newValue, target, receiver);
      return true;
    }
  });
};

// src/client.ts
var DEFAULT_TIMEOUT = 1e4;
var sockClient = async (cfg, wait = false) => {
  const { socket: connection } = cfg;
  const socket = typeof connection === "string" ? new WebSocket(connection) : connection;
  const state = proxy({
    eventListeners: []
  });
  if (wait) {
    await until(() => socket.readyState === WebSocket.OPEN, 0, DEFAULT_TIMEOUT);
  }
  const subscribe = (listener) => {
    state.eventListeners = [...state.eventListeners, listener];
    return () => {
      state.eventListeners = state.eventListeners.filter((it) => it !== listener);
    };
  };
  const send = (event) => {
    socket.send(JSON.stringify(event));
  };
  const sendRaw = (data) => {
    socket.send(data);
  };
  const receive = async (expect, timeout = 5e3) => {
    return new Promise((resolve) => {
      const fun = (msg) => {
        const event = parseEvent(msg.data);
        if (expect.app && event.app !== expect.app) return;
        if (expect.type && event.type !== expect.type) return;
        clear();
        resolve(event);
      };
      socket.addEventListener("message", fun);
      const clear = () => {
        socket.removeEventListener("message", fun);
      };
      setTimeout(() => {
        clear();
        resolve(null);
      }, timeout);
    });
  };
  const ack = async (event, expect, timeout = DEFAULT_TIMEOUT) => {
    send(event);
    return await receive(expect, timeout);
  };
  socket.addEventListener("message", async (msg) => {
    try {
      const parsed = JSON.parse(msg.data.toString());
      if (!isSockEvent(parsed)) return;
      if (cfg.onEvent) {
        cfg.onEvent(parsed);
      }
      if (parsed.app) {
        const listeners = state.eventListeners.filter((it) => it.app === parsed.app);
        await Promise.all(listeners.map(async (listener) => {
          return await listener.fun(parsed);
        }));
      }
    } catch (e) {
      console.error(e);
    }
  });
  const clearListeners = () => {
    state.eventListeners = [];
  };
  return proxy({
    ...cfg,
    apps: [],
    socket,
    send,
    sendRaw,
    receive,
    ack,
    subscribe,
    clearListeners
  });
};
export {
  sockClient
};
