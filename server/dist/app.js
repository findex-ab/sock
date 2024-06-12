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

// src/app.ts
var app_exports = {};
__export(app_exports, {
  defineEventSlot: () => defineEventSlot,
  sockApp: () => sockApp
});
module.exports = __toCommonJS(app_exports);
var defineEventSlot = (name, slot) => {
  return {
    [name]: slot
  };
};
var sockApp = (init) => {
  return (ctx) => {
    const cfg = init(ctx);
    const onSubscribe = async (client, event) => {
      if (cfg.onSubscribe) {
        await cfg.onSubscribe(client, event);
      }
    };
    const onUnsubscribe = async (client, event) => {
      if (cfg.onUnsubscribe) {
        await cfg.onUnsubscribe(client, event);
      }
    };
    const onAnyEvent = async (client, event) => {
      if (cfg.onAnyEvent) {
        await cfg.onAnyEvent(client, event);
      }
    };
    const onEvent = async (client, event) => {
      if (cfg.onEvent) {
        await cfg.onEvent(client, event);
      }
      switch (event.type) {
        case "SUBSCRIBE_APP" /* SUBSCRIBE_APP */:
          await onSubscribe(client, event);
          break;
        case "UNSUBSCRIBE_APP" /* UNSUBSCRIBE_APP */:
          await onUnsubscribe(client, event);
          break;
      }
      const eventSlots = cfg.events || {};
      const slot = eventSlots[event.type];
      if (slot) {
        try {
          const parsed = slot.schema.parse(event.payload);
          if (parsed) {
            await slot.fun(client, {
              ...event,
              payload: parsed
            });
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    return {
      events: cfg.events || {},
      onEvent,
      onAnyEvent,
      onSubscribe,
      onUnsubscribe
    };
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  defineEventSlot,
  sockApp
});
