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
    const onTransfer = async (client, transaction) => {
      if (cfg.onTransfer) {
        try {
          cfg.onTransfer(client, transaction);
        } catch (e) {
          console.error(e);
        }
      }
    };
    const onCompleteTransaction = async (client, transaction) => {
      if (cfg.onCompleteTransaction) {
        try {
          await cfg.onCompleteTransaction(client, transaction);
        } catch (e) {
          console.error(e);
        }
      }
    };
    const onSubscribe = async (client, event) => {
      if (cfg.onSubscribe) {
        try {
          await cfg.onSubscribe(client, event);
        } catch (e) {
          console.error(e);
        }
      }
    };
    const onUnsubscribe = async (client, event) => {
      if (cfg.onUnsubscribe) {
        try {
          await cfg.onUnsubscribe(client, event);
        } catch (e) {
          console.error(e);
        }
      }
    };
    const onAnyEvent = async (client, event) => {
      if (cfg.onAnyEvent) {
        try {
          await cfg.onAnyEvent(client, event);
        } catch (e) {
          console.error(e);
        }
      }
    };
    const onEvent = async (client, event) => {
      if (cfg.onEvent) {
        try {
          await cfg.onEvent(client, event);
        } catch (e) {
          console.error(e);
        }
      }
      switch (event.type) {
        case "SUBSCRIBE_APP" /* SUBSCRIBE_APP */:
          await onSubscribe(client, event);
          break;
        case "UNSUBSCRIBE_APP" /* UNSUBSCRIBE_APP */:
          await onUnsubscribe(client, event);
          break;
        case "BEGIN_TRANSACTION" /* BEGIN_TRANSACTION */:
          {
          }
          break;
        case "END_TRANSACTION" /* END_TRANSACTION */:
          {
          }
          ;
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
    const onBinary = async (client, data) => {
      if (cfg.onBinary) {
        try {
          await cfg.onBinary(client, data);
        } catch (e) {
          console.error(e);
        }
      }
    };
    return {
      events: cfg.events || {},
      onBinary,
      onCompleteTransaction,
      onTransfer,
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
