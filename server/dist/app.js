"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sockApp = exports.defineEventSlot = void 0;
const event_1 = require("../../shared/src/event");
const defineEventSlot = (name, slot) => {
    return {
        [name]: slot
    };
};
exports.defineEventSlot = defineEventSlot;
const sockApp = (init) => {
    return (ctx) => {
        const cfg = init(ctx);
        const onTransfer = async (client, transaction) => {
            if (cfg.onTransfer) {
                try {
                    cfg.onTransfer(client, transaction);
                }
                catch (e) {
                    console.error(e);
                }
            }
        };
        const onCompleteTransaction = async (client, transaction) => {
            if (cfg.onCompleteTransaction) {
                try {
                    await cfg.onCompleteTransaction(client, transaction);
                }
                catch (e) {
                    console.error(e);
                }
            }
        };
        const onSubscribe = async (client, event) => {
            if (cfg.onSubscribe) {
                try {
                    await cfg.onSubscribe(client, event);
                }
                catch (e) {
                    console.error(e);
                }
            }
        };
        const onUnsubscribe = async (client, event) => {
            if (cfg.onUnsubscribe) {
                try {
                    await cfg.onUnsubscribe(client, event);
                }
                catch (e) {
                    console.error(e);
                }
            }
        };
        const onAnyEvent = async (client, event) => {
            if (cfg.onAnyEvent) {
                try {
                    await cfg.onAnyEvent(client, event);
                }
                catch (e) {
                    console.error(e);
                }
            }
        };
        const onEvent = async (client, event) => {
            if (cfg.onEvent) {
                try {
                    await cfg.onEvent(client, event);
                }
                catch (e) {
                    console.error(e);
                }
            }
            switch (event.type) {
                case event_1.ESockEvent.SUBSCRIBE_APP:
                    await onSubscribe(client, event);
                    break;
                case event_1.ESockEvent.UNSUBSCRIBE_APP:
                    await onUnsubscribe(client, event);
                    break;
                case event_1.ESockEvent.BEGIN_TRANSACTION:
                    {
                        //client.beginTransaction(event);
                    }
                    break;
                case event_1.ESockEvent.END_TRANSACTION:
                    {
                        //client.endTransaction(event);
                        //const transaction = client.transaction;
                        //if (transaction.start && transaction.end && transaction.packets) {
                        //  const completeTransaction: SockCompleteTransaction = {
                        //    start: transaction.start,
                        //    packets: transaction.packets,
                        //    size: transaction.size || 0,
                        //    end: transaction.end
                        //  };
                        //  await onCompleteTransaction(client, completeTransaction);
                        //}
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
                }
                catch (e) {
                    console.error(e);
                }
            }
        };
        const onBinary = async (client, data) => {
            //client.transfer(data);
            if (cfg.onBinary) {
                try {
                    await cfg.onBinary(client, data);
                }
                catch (e) {
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
exports.sockApp = sockApp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxrREFBOEQ7QUFZdkQsTUFBTSxlQUFlLEdBQUcsQ0FBd0IsSUFBWSxFQUFFLElBQWtCLEVBQUUsRUFBRTtJQUN6RixPQUFPO1FBQ0wsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJO0tBQ2IsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUpZLFFBQUEsZUFBZSxtQkFJM0I7QUEyQk0sTUFBTSxPQUFPLEdBQUcsQ0FBQyxJQUFpQixFQUFtQixFQUFFO0lBQzVELE9BQU8sQ0FBQyxHQUFtQixFQUFFLEVBQUU7UUFDN0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXRCLE1BQU0sVUFBVSxHQUFHLEtBQUssRUFBRSxNQUFlLEVBQUUsV0FBNEIsRUFBRSxFQUFFO1lBQ3pFLElBQUksR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNuQixJQUFJLENBQUM7b0JBQ0gsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQ3RDLENBQUM7Z0JBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztvQkFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUMsQ0FBQztRQUVGLE1BQU0scUJBQXFCLEdBQUcsS0FBSyxFQUFFLE1BQWUsRUFBRSxXQUFvQyxFQUFFLEVBQUU7WUFDNUYsSUFBSSxHQUFHLENBQUMscUJBQXFCLEVBQUUsQ0FBQztnQkFDOUIsSUFBSSxDQUFDO29CQUNILE1BQU0sR0FBRyxDQUFDLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFDdkQsQ0FBQztnQkFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO29CQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7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