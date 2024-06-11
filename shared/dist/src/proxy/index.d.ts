import { type Dict } from '../types/dict';
export type ProxySubscriberMethods<T extends Dict = Dict> = {
    get?: (target: T, p: keyof T, receiver: any) => any;
    set?: (target: T, p: keyof T, newValue: any, receiver: any) => boolean;
    onChange?: (key: keyof T, oldValue: any, nextValue: any, target: T, receiver: any) => any;
};
export type ProxySubscriber<T extends Dict = Dict> = ProxySubscriberMethods<T> & {
    uid: string;
};
export type ProxySubscriberHandle = string;
export type ProxySubscriberInit<T extends Dict = Dict> = Omit<ProxySubscriber<T>, "uid">;
export declare const proxy: <T extends Dict = Dict>(initial: T, args?: ProxySubscriberMethods<T>) => T;
export type SubscriptionProxy<T extends Dict = Dict> = {
    state: T;
    subscribe: (sub: ProxySubscriberInit<T>, handle?: ProxySubscriberHandle) => ProxySubscriberHandle;
    unsubscribe: (handle: ProxySubscriberHandle) => void;
    unsubscribeAll: () => void;
    setState: (fun: (s: T) => T) => void;
    subscribers: Record<string, ProxySubscriber<T>>;
};
export declare const isSubscriptionProxy: <T extends Dict = Dict>(x: any) => x is SubscriptionProxy<T>;
export declare const subscriptionProxy: <T extends Dict = Dict>(initial: T, initialSubscribers?: ProxySubscriberInit<T>[]) => SubscriptionProxy<T>;
