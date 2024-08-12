"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionProxy = exports.isSubscriptionProxy = exports.proxy = void 0;
const copyObject = (obj) => obj;
const proxy = (initial, args) => {
    return new Proxy(initial, {
        get(target, p, receiver) {
            const key = p;
            if (args?.get)
                return args.get(target, key, receiver);
            return target[key];
        },
        set(target, p, newValue, receiver) {
            const key = p;
            if (target[key] === newValue)
                return true;
            target[key] = newValue;
            if (args?.set)
                args.set(target, key, newValue, receiver);
            if (args?.onChange)
                args.onChange(key, target[key], newValue, target, receiver);
            return true;
        },
    });
};
exports.proxy = proxy;
const isSubscriptionProxy = (x) => {
    if (!x)
        return false;
    if (typeof x !== "object")
        return false;
    return !!("subscribe" in x && "setState" in x);
};
exports.isSubscriptionProxy = isSubscriptionProxy;
const subscriptionProxy = (initial, initialSubscribers = []) => {
    const subscribers = (0, exports.proxy)({});
    let counter = 0;
    const subscribe = (sub, handle) => {
        if (handle && subscribers[handle])
            return handle;
        const uid = handle || `${counter++}`;
        subscribers[uid] = {
            ...sub,
            uid,
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
                .forEach((sub) => sub.set(...args));
            return true;
        },
        onChange: (...args) => {
            Object.values(subscribers)
                .filter((sub) => !!sub.onChange)
                .forEach((sub) => sub.onChange(...args));
        },
    };
    const state = (0, exports.proxy)(initial, reducer);
    const setState = (fun) => {
        Object.entries(fun(copyObject(state))).forEach(([key, value]) => (state[key] = value));
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
exports.subscriptionProxy = subscriptionProxy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHJveHkvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsTUFBTSxVQUFVLEdBQUcsQ0FBd0IsR0FBTSxFQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUEwQnRELE1BQU0sS0FBSyxHQUFHLENBQ25CLE9BQVUsRUFDVixJQUFnQyxFQUNoQyxFQUFFO0lBQ0YsT0FBTyxJQUFJLEtBQUssQ0FBSSxPQUFPLEVBQUU7UUFDM0IsR0FBRyxDQUFDLE1BQVMsRUFBRSxDQUFrQixFQUFFLFFBQWE7WUFDOUMsTUFBTSxHQUFHLEdBQUcsQ0FBWSxDQUFDO1lBQ3pCLElBQUksSUFBSSxFQUFFLEdBQUc7Z0JBQUUsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDdEQsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckIsQ0FBQztRQUNELEdBQUcsQ0FBQyxNQUFTLEVBQUUsQ0FBa0IsRUFBRSxRQUFhLEVBQUUsUUFBYTtZQUM3RCxNQUFNLEdBQUcsR0FBRyxDQUFZLENBQUM7WUFDekIsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssUUFBUTtnQkFBRSxPQUFPLElBQUksQ0FBQztZQUN6QyxNQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDO1lBQ2hDLElBQUksSUFBSSxFQUFFLEdBQUc7Z0JBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN6RCxJQUFJLElBQUksRUFBRSxRQUFRO2dCQUNoQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUM5RCxPQUFPLElBQUksQ0FBQztRQUNk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