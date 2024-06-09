import { type Dict } from '../types/dict';


const copyObject = <T extends Dict = Dict>(obj: T): T =>
  JSON.parse(JSON.stringify(obj));

export type ProxySubscriberMethods<T extends Dict = Dict> = {
  get?: (target: T, p: keyof T, receiver: any) => any;
  set?: (target: T, p: keyof T, newValue: any, receiver: any) => boolean;
  onChange?: (
    key: keyof T,
    oldValue: any,
    nextValue: any,
    target: T,
    receiver: any,
  ) => any;
};

export type ProxySubscriber<T extends Dict = Dict> =
  ProxySubscriberMethods<T> & {
    uid: string;
  };

export type ProxySubscriberHandle = string;

export type ProxySubscriberInit<T extends Dict = Dict> = Omit<
  ProxySubscriber<T>,
  "uid"
>;

export const proxy = <T extends Dict = Dict>(
  initial: T,
  args?: ProxySubscriberMethods<T>,
) => {
  return new Proxy<T>(initial, {
    get(target: T, p: string | symbol, receiver: any) {
      const key = p as keyof T;
      if (args?.get) return args.get(target, key, receiver);
      return target[key];
    },
    set(target: T, p: string | symbol, newValue: any, receiver: any) {
      const key = p as keyof T;
      if (target[key] === newValue) return true;
      (target as any)[key] = newValue;
      if (args?.set) args.set(target, key, newValue, receiver);
      if (args?.onChange)
        args.onChange(key, target[key], newValue, target, receiver);
      return true;
    },
  });
};

export type SubscriptionProxy<T extends Dict = Dict> = {
  state: T;
  subscribe: (
    sub: ProxySubscriberInit<T>,
    handle?: ProxySubscriberHandle,
  ) => ProxySubscriberHandle;
  unsubscribe: (handle: ProxySubscriberHandle) => void;
  unsubscribeAll: () => void;
  setState: (fun: (s: T) => T) => void;
  subscribers: Record<string, ProxySubscriber<T>>;
};

export const isSubscriptionProxy = <T extends Dict = Dict>(
  x: any,
): x is SubscriptionProxy<T> => {
  if (!x) return false;
  if (typeof x !== "object") return false;
  return !!("subscribe" in x && "setState" in x);
};

export const subscriptionProxy = <T extends Dict = Dict>(
  initial: T,
  initialSubscribers: ProxySubscriberInit<T>[] = [],
): SubscriptionProxy<T> => {
  const subscribers = proxy<Record<string, ProxySubscriber<T>>>({});
  let counter: number = 0;

  const subscribe = (
    sub: ProxySubscriberInit<T>,
    handle?: ProxySubscriberHandle,
  ): ProxySubscriberHandle => {
    if (handle && subscribers[handle]) return handle;
    const uid = handle || `${counter++}`;
    subscribers[uid] = {
      ...sub,
      uid,
    };
    return uid;
  };

  const unsubscribe = (handle: ProxySubscriberHandle) => {
    delete subscribers[handle];
  };

  const unsubscribeAll = () => {
    Object.keys(subscribers).forEach((key) => unsubscribe(key));
  };

  initialSubscribers.forEach((sub) => subscribe(sub));

  const reducer: ProxySubscriber<T> = {
    uid: "root",
    get: (target, key, receiver) => {
      const copy = copyObject(target);

      Object.values(subscribers)
        .filter((sub) => !!sub.get)
        .reduce((obj, sub) => {
          const nextValue = sub.get(obj, key, receiver);
          return {
            ...obj,
            [key]: nextValue,
          };
        }, copy);

      return copy[key];
    },
    set: (...args) => {
      Object.values(subscribers)
        .filter((sub) => !!sub.set)
        .forEach((sub) => sub.set!(...args));
      return true;
    },
    onChange: (...args) => {
      Object.values(subscribers)
        .filter((sub) => !!sub.onChange)
        .forEach((sub) => sub.onChange!(...args));
    },
  };

  const state = proxy(initial, reducer);

  const setState = (fun: (s: T) => T) => {
    Object.entries(fun(copyObject(state))).forEach(
      ([key, value]) => ((state as Dict)[key] = value),
    );
  };

  return {
    state,
    setState,
    subscribers,
    subscribe,
    unsubscribe,
    unsubscribeAll,
  };
};
