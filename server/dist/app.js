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
                cfg.onTransfer(client, transaction);
            }
        };
        const onCompleteTransaction = async (client, transaction) => {
            if (cfg.onCompleteTransaction) {
                await cfg.onCompleteTransaction(client, transaction);
            }
        };
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
                await cfg.onBinary(client, data);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxrREFBOEQ7QUFZdkQsTUFBTSxlQUFlLEdBQUcsQ0FBd0IsSUFBWSxFQUFFLElBQWtCLEVBQUUsRUFBRTtJQUN6RixPQUFPO1FBQ0wsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJO0tBQ2IsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUpZLFFBQUEsZUFBZSxtQkFJM0I7QUEyQk0sTUFBTSxPQUFPLEdBQUcsQ0FBQyxJQUFpQixFQUFtQixFQUFFO0lBQzVELE9BQU8sQ0FBQyxHQUFtQixFQUFFLEVBQUU7UUFDN0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXRCLE1BQU0sVUFBVSxHQUFHLEtBQUssRUFBRSxNQUFlLEVBQUUsV0FBNEIsRUFBRSxFQUFFO1lBQ3pFLElBQUksR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNuQixHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztZQUN0QyxDQUFDO1FBQ0gsQ0FBQyxDQUFDO1FBRUYsTUFBTSxxQkFBcUIsR0FBRyxLQUFLLEVBQUUsTUFBZSxFQUFFLFdBQW9DLEVBQUUsRUFBRTtZQUM1RixJQUFJLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUM5QixNQUFNLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDdkQsQ0FBQztRQUNILENBQUMsQ0FBQTtRQUVELE1BQU0sV0FBVyxHQUFHLEtBQUssRUFBRSxNQUFlLEVBQUUsS0FBZ0IsRUFBRSxFQUFFO1lBQzlELElBQUksR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNwQixNQUFNLEdBQUcsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7UUFDSCxDQUFDLENBQUE7UUFFRCxNQUFNLGFBQWEsR0FBRyxLQUFLLEVBQUUsTUFBZSxFQUFFLEtBQWdCLEVBQUUsRUFBRTtZQUNoRSxJQUFJLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDdEIsTUFBTSxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN6QyxDQUFDO1FBQ0gsQ0FBQyxDQUFBO1FBRUQsTUFBTSxVQUFVLEdBQUcsS0FBSyxFQUFFLE1BQWUsRUFBRSxLQUFnQixFQUFFLEVBQUU7WUFDN0QsSUFBSSxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ25CLE1BQU0sR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdEMsQ0FBQztRQUNILENBQUMsQ0FBQTtRQUVELE1BQU0sT0FBTyxHQUFHLEtBQUssRUFBRSxNQUFlLEVBQUUsS0FBZ0IsRUFBRSxFQUFFO1lBQzFELElBQUksR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNoQixNQUFNLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ25DLENBQUM7WUFDRCxRQUFRLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbkIsS0FBSyxrQkFBVSxDQUFDLGFBQWE7b0JBQUUsTUFBTSxXQUFXLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUFDLE1BQU07Z0JBQ3ZFLEtBQUssa0JBQVUsQ0FBQyxlQUFlO29CQUFFLE1BQU0sYUFBYSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFBQyxNQUFNO2dCQUMzRSxLQUFLLGtCQUFVLENBQUMsaUJBQWlCO29CQUFFLENBQUM7d0JBQ2xDLGlDQUFpQztvQkFDbkMsQ0FBQztvQkFBQyxNQUFNO2dCQUNSLEtBQUssa0JBQVUsQ0FBQyxlQUFlO29CQUFFLENBQUM7d0JBQ2hDLCtCQUErQjt3QkFFL0IseUNBQXlDO3dCQUN6QyxvRUFBb0U7d0JBQ3BFLDBEQUEwRDt3QkFDMUQsK0JBQStCO3dCQUMvQixtQ0FBbUM7d0JBQ25DLGtDQUFrQzt3QkFDbEMsMEJBQTBCO3dCQUMxQixNQUFNO3dCQUNOLDZEQUE2RDt3QkFDN0QsR0FBRztvQkFDTCxDQUFDO29CQUFBLENBQUM7b0JBQUMsTUFBTTtZQUNYLENBQUM7WUFHRCxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztZQUNwQyxNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXBDLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ1QsSUFBSSxDQUFDO29CQUNILE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDaEQsSUFBSSxNQUFNLEVBQUUsQ0FBQzt3QkFDWCxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFOzRCQUNyQixHQUFHLEtBQUs7NEJBQ1IsT0FBTyxFQUFFLE1BQU07eUJBQ2hCLENBQUMsQ0FBQztvQkFDTCxDQUFDO2dCQUNILENBQUM7Z0JBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztvQkFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUMsQ0FBQTtRQUVELE1BQU0sUUFBUSxHQUFHLEtBQUssRUFBRSxNQUFlLEVBQUUsSUFBZ0IsRUFBRSxFQUFFO1lBQzNELHdCQUF3QjtZQUV4QixJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDakIsTUFBTSxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNuQyxDQUFDO1FBQ0gsQ0FBQyxDQUFBO1FBRUQsT0FBTztZQUNMLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxJQUFJLEVBQUU7WUFDeEIsUUFBUTtZQUNSLHFCQUFxQjtZQUNyQixVQUFVO1lBQ1YsT0FBTztZQUNQLFVBQVU7WUFDVixXQUFXO1lBQ1gsYUFBYTtTQUNkLENBQUE7SUFDSCxDQUFDLENBQUE7QUFDSCxDQUFDLENBQUE7QUFsR1ksUUFBQSxPQUFPLFdBa0duQiJ9