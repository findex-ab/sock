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
        return {
            events: cfg.events || {},
            onEvent,
            onAnyEvent,
            onSubscribe,
            onUnsubscribe
        };
    };
};
exports.sockApp = sockApp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxrREFBOEQ7QUFXdkQsTUFBTSxlQUFlLEdBQUcsQ0FBd0IsSUFBWSxFQUFFLElBQWtCLEVBQUUsRUFBRTtJQUN6RixPQUFPO1FBQ0wsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJO0tBQ2IsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUpZLFFBQUEsZUFBZSxtQkFJM0I7QUF3Qk0sTUFBTSxPQUFPLEdBQUcsQ0FBQyxJQUFpQixFQUFtQixFQUFFO0lBQzVELE9BQU8sQ0FBQyxHQUFtQixFQUFFLEVBQUU7UUFDN0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXRCLE1BQU0sV0FBVyxHQUFHLEtBQUssRUFBRSxNQUFlLEVBQUUsS0FBZ0IsRUFBRSxFQUFFO1lBQzlELElBQUksR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNwQixNQUFNLEdBQUcsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7UUFDSCxDQUFDLENBQUE7UUFFRCxNQUFNLGFBQWEsR0FBRyxLQUFLLEVBQUUsTUFBZSxFQUFFLEtBQWdCLEVBQUUsRUFBRTtZQUNoRSxJQUFJLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDdEIsTUFBTSxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN6QyxDQUFDO1FBQ0gsQ0FBQyxDQUFBO1FBRUQsTUFBTSxVQUFVLEdBQUcsS0FBSyxFQUFFLE1BQWUsRUFBRSxLQUFnQixFQUFFLEVBQUU7WUFDN0QsSUFBSSxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ25CLE1BQU0sR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdEMsQ0FBQztRQUNILENBQUMsQ0FBQTtRQUVELE1BQU0sT0FBTyxHQUFHLEtBQUssRUFBRSxNQUFlLEVBQUUsS0FBZ0IsRUFBRSxFQUFFO1lBQzFELElBQUksR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNoQixNQUFNLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ25DLENBQUM7WUFDRCxRQUFRLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbkIsS0FBSyxrQkFBVSxDQUFDLGFBQWE7b0JBQUUsTUFBTSxXQUFXLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUFDLE1BQU07Z0JBQ3ZFLEtBQUssa0JBQVUsQ0FBQyxlQUFlO29CQUFFLE1BQU0sYUFBYSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFBQyxNQUFNO1lBQzdFLENBQUM7WUFHRCxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztZQUNwQyxNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXBDLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ1QsSUFBSSxDQUFDO29CQUNILE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDaEQsSUFBSSxNQUFNLEVBQUUsQ0FBQzt3QkFDWCxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFOzRCQUNyQixHQUFHLEtBQUs7NEJBQ1IsT0FBTyxFQUFFLE1BQU07eUJBQ2hCLENBQUMsQ0FBQztvQkFDTCxDQUFDO2dCQUNILENBQUM7Z0JBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztvQkFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUMsQ0FBQTtRQUVELE9BQU87WUFDTCxNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sSUFBSSxFQUFFO1lBQ3hCLE9BQU87WUFDUCxVQUFVO1lBQ1YsV0FBVztZQUNYLGFBQWE7U0FDZCxDQUFBO0lBQ0gsQ0FBQyxDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBMURZLFFBQUEsT0FBTyxXQTBEbkIifQ==