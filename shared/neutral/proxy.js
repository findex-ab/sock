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
export {
  isSubscriptionProxy,
  proxy,
  subscriptionProxy
};
