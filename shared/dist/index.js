var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  ESockEvent: () => ESockEvent,
  UIDGenerator: () => UIDGenerator,
  floatBitsToUint: () => floatBitsToUint,
  generateUID: () => generateUID,
  hashUint32: () => hashUint32,
  isSockEvent: () => isSockEvent,
  isSubscriptionProxy: () => isSubscriptionProxy,
  parseEvent: () => parseEvent,
  proxy: () => proxy,
  subscriptionProxy: () => subscriptionProxy,
  until: () => until
});
module.exports = __toCommonJS(src_exports);

// src/proxy/index.ts
var copyObject = (obj) => obj;
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
var isSubscriptionProxy = (x) => {
  if (!x) return false;
  if (typeof x !== "object") return false;
  return !!("subscribe" in x && "setState" in x);
};
var subscriptionProxy = (initial, initialSubscribers = []) => {
  const subscribers = proxy({});
  let counter = 0;
  const subscribe = (sub, handle) => {
    if (handle && subscribers[handle]) return handle;
    const uid = handle || `${counter++}`;
    subscribers[uid] = {
      ...sub,
      uid
    };
    return uid;
  };
  const unsubscribe = (handle) => {
    delete subscribers[handle];
  };
  const unsubscribeAll = () => {
    Object.keys(subscribers).forEach((key) => unsubscribe(key));
  };
  initialSubscribers.forEach((sub) => subscribe(sub));
  const reducer = {
    uid: "root",
    get: (target, key, receiver) => {
      const copy = copyObject(target);
      Object.values(subscribers).filter((sub) => !!sub.get).reduce((obj, sub) => {
        const nextValue = sub.get(obj, key, receiver);
        return {
          ...obj,
          [key]: nextValue
        };
      }, copy);
      return copy[key];
    },
    set: (...args) => {
      Object.values(subscribers).filter((sub) => !!sub.set).forEach((sub) => sub.set(...args));
      return true;
    },
    onChange: (...args) => {
      Object.values(subscribers).filter((sub) => !!sub.onChange).forEach((sub) => sub.onChange(...args));
    }
  };
  const state = proxy(initial, reducer);
  const setState = (fun) => {
    Object.entries(fun(copyObject(state))).forEach(
      ([key, value]) => state[key] = value
    );
  };
  return {
    state,
    setState,
    subscribers,
    subscribe,
    unsubscribe,
    unsubscribeAll
  };
};

// src/event.ts
var ESockEvent = /* @__PURE__ */ ((ESockEvent2) => {
  ESockEvent2["PING"] = "PING";
  ESockEvent2["PONG"] = "PONG";
  ESockEvent2["AUTH"] = "AUTH";
  ESockEvent2["CLOSE"] = "CLOSE";
  ESockEvent2["BEGIN_TRANSACTION"] = "BEGIN_TRANSACTION";
  ESockEvent2["END_TRANSACTION"] = "END_TRANSACTION";
  ESockEvent2["TRANSFER_RECEIVED"] = "TRANSFER_RECEIVED";
  ESockEvent2["FILE_TRANSACTION"] = "FILE_TRANSACTION";
  ESockEvent2["FILE_TRANSACTION_COMPLETE"] = "FILE_TRANSACTION_COMPLETE";
  ESockEvent2["STATE_UPDATE"] = "STATE_UPDATE";
  ESockEvent2["PULL"] = "PULL";
  ESockEvent2["SUBSCRIBE"] = "SUBSCRIBE";
  ESockEvent2["SUBSCRIBE_APP"] = "SUBSCRIBE_APP";
  ESockEvent2["UNSUBSCRIBE_APP"] = "UNSUBSCRIBE_APP";
  return ESockEvent2;
})(ESockEvent || {});
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

// src/utils/until.ts
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

// src/utils/array.ts
var range = (n) => Array.from(Array(n).keys());

// src/utils/hash.ts
var isFloat = (x) => typeof x === "number" && (x + "").includes(".");
var floatBitsToUint = (f) => {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  if (isFloat(f)) {
    view.setFloat32(0, f);
  } else {
    view.setUint32(0, f);
  }
  return view.getUint32(0);
};
var U = floatBitsToUint;
var hashUint32 = (n, normalize = false) => {
  let x = U(n);
  let y = U(~U(n));
  let z = U((U(x * 1013) + U(11 * y)) * 7);
  z ^= z << 17;
  z ^= z >> 13;
  z ^= z << 5;
  z *= 5013;
  return U(z) / (normalize ? U(4294967295) : 1);
};
var chance = (seed) => hashUint32(seed, true) > 0.5;
var generateUID = (numChars, inputSeed) => {
  const alpha = "abcdefghijklmnopqrstuvwxyz";
  const genChar = (seed) => {
    seed = hashUint32(seed);
    const digit = chance(seed);
    seed = hashUint32(seed);
    if (digit) return [seed, (seed % 9).toString()];
    seed = hashUint32(seed);
    const c = alpha[seed % alpha.length];
    seed = hashUint32(seed);
    const upper = chance(seed);
    return [seed, upper ? c.toUpperCase() : c];
  };
  const initialState = { seed: inputSeed, tokens: [] };
  const gen = range(numChars).reduce((prev, cur) => {
    const [seed, token] = genChar(prev.seed);
    const nextSeed = hashUint32(prev.seed + 5 * hashUint32(prev.seed) + cur + seed);
    return {
      ...prev,
      tokens: [...prev.tokens, token],
      seed: nextSeed
    };
  }, initialState);
  return [gen.seed, gen.tokens.join("")];
};
var UIDGenerator = (config, inputSeed = 583281) => {
  let token = generateUID(config.uidLength, inputSeed);
  const next = () => {
    token = generateUID(config.uidLength, token[0]);
    return token[1];
  };
  return { next };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ESockEvent,
  UIDGenerator,
  floatBitsToUint,
  generateUID,
  hashUint32,
  isSockEvent,
  isSubscriptionProxy,
  parseEvent,
  proxy,
  subscriptionProxy,
  until
});
