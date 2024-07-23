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
export {
  ESockEvent,
  isSockEvent,
  parseEvent
};
