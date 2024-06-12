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

// src/event.ts
var event_exports = {};
__export(event_exports, {
  ESockEvent: () => ESockEvent,
  isSockEvent: () => isSockEvent,
  parseEvent: () => parseEvent
});
module.exports = __toCommonJS(event_exports);
var ESockEvent = /* @__PURE__ */ ((ESockEvent2) => {
  ESockEvent2["PING"] = "PING";
  ESockEvent2["PONG"] = "PONG";
  ESockEvent2["AUTH"] = "AUTH";
  ESockEvent2["CLOSE"] = "CLOSE";
  ESockEvent2["BEGIN_TRANSACTION"] = "BEGIN_TRANSACTION";
  ESockEvent2["END_TRANSACTION"] = "END_TRANSACTION";
  ESockEvent2["TRANSFER_RECEIVED"] = "TRANSFER_RECEIVED";
  ESockEvent2["STATE_UPDATE"] = "STATE_UPDATE";
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ESockEvent,
  isSockEvent,
  parseEvent
});
