"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sockApp = void 0;
const event_1 = require("../../shared/src/event");
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
        };
        return {
            onEvent,
            onAnyEvent,
            onSubscribe,
            onUnsubscribe
        };
    };
};
exports.sockApp = sockApp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxrREFBOEQ7QUEwQnZELE1BQU0sT0FBTyxHQUFHLENBQUMsSUFBaUIsRUFBbUIsRUFBRTtJQUM1RCxPQUFPLENBQUMsR0FBbUIsRUFBRSxFQUFFO1FBQzdCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV0QixNQUFNLFdBQVcsR0FBRyxLQUFLLEVBQUUsTUFBZSxFQUFFLEtBQWdCLEVBQUUsRUFBRTtZQUM5RCxJQUFJLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDcEIsTUFBTSxHQUFHLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN2QyxDQUFDO1FBQ0gsQ0FBQyxDQUFBO1FBRUQsTUFBTSxhQUFhLEdBQUcsS0FBSyxFQUFFLE1BQWUsRUFBRSxLQUFnQixFQUFFLEVBQUU7WUFDaEUsSUFBSSxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3RCLE1BQU0sR0FBRyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDekMsQ0FBQztRQUNILENBQUMsQ0FBQTtRQUVELE1BQU0sVUFBVSxHQUFHLEtBQUssRUFBRSxNQUFlLEVBQUUsS0FBZ0IsRUFBRSxFQUFFO1lBQzdELElBQUksR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNuQixNQUFNLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3RDLENBQUM7UUFDSCxDQUFDLENBQUE7UUFFRCxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsTUFBZSxFQUFFLEtBQWdCLEVBQUUsRUFBRTtZQUMxRCxJQUFJLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDaEIsTUFBTSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNuQyxDQUFDO1lBQ0QsUUFBUSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ25CLEtBQUssa0JBQVUsQ0FBQyxhQUFhO29CQUFFLE1BQU0sV0FBVyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFBQyxNQUFNO2dCQUN2RSxLQUFLLGtCQUFVLENBQUMsZUFBZTtvQkFBRSxNQUFNLGFBQWEsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQUMsTUFBTTtZQUM3RSxDQUFDO1FBQ0gsQ0FBQyxDQUFBO1FBRUQsT0FBTztZQUNMLE9BQU87WUFDUCxVQUFVO1lBQ1YsV0FBVztZQUNYLGFBQWE7U0FDZCxDQUFBO0lBQ0gsQ0FBQyxDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBdkNZLFFBQUEsT0FBTyxXQXVDbkIifQ==