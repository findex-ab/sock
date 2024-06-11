"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Socket = void 0;
const ws_1 = require("ws");
const event_1 = require("../event");
const array_1 = require("../../../shared/src/utils/array");
class Socket {
    socket;
    auth;
    apps;
    id;
    constructor(socket, id) {
        if (typeof socket === 'string') {
            this.socket = new ws_1.WebSocket(socket);
        }
        else {
            this.socket = socket;
        }
        this.id = id;
        this.apps = [];
    }
    addApp(app) {
        if (this.apps.includes(app))
            return;
        console.log(`Add ${app} to client`);
        this.apps = (0, array_1.unique)([...this.apps, app]);
    }
    removeApp(app) {
        if (!this.apps.includes(app))
            return;
        console.log(`Remove ${app} to client`);
        this.apps = this.apps.filter(it => it !== app);
    }
    receive(expect, timeout = 10000) {
        return new Promise((resolve) => {
            const fun = (msg) => {
                const event = (0, event_1.parseEvent)(msg.data);
                if (expect.app && event.app !== expect.app)
                    return;
                if (expect.type && event.type !== expect.type)
                    return;
                clear();
                resolve(event);
            };
            this.socket.addEventListener('message', fun);
            const clear = () => {
                this.socket.removeEventListener('message', fun);
            };
            setTimeout(() => {
                clear();
                resolve(null);
            }, timeout);
        });
    }
    send(event) {
        this.socket.send(JSON.stringify(event));
    }
}
exports.Socket = Socket;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc29ja2V0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJCQUE4QztBQUM5QyxvQ0FBc0M7QUFHdEMsMkRBQXlEO0FBRXpELE1BQWEsTUFBTTtJQUNqQixNQUFNLENBQVk7SUFDbEIsSUFBSSxDQUFrQjtJQUN0QixJQUFJLENBQVc7SUFDZixFQUFFLENBQVM7SUFFWCxZQUFZLE1BQTBCLEVBQUUsRUFBVTtRQUNoRCxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxjQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEMsQ0FBQzthQUFNLENBQUM7WUFDTixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUN2QixDQUFDO1FBQ0QsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRUQsTUFBTSxDQUFDLEdBQVc7UUFDaEIsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7WUFBRSxPQUFPO1FBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBQSxjQUFNLEVBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUN6QyxDQUFDO0lBRUQsU0FBUyxDQUFDLEdBQVc7UUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU87UUFDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQsT0FBTyxDQUFDLE1BQTBCLEVBQUUsVUFBa0IsS0FBSztRQUN6RCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDN0IsTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFpQixFQUFFLEVBQUU7Z0JBQ2hDLE1BQU0sS0FBSyxHQUFHLElBQUEsa0JBQVUsRUFBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ25DLElBQUksTUFBTSxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLE1BQU0sQ0FBQyxHQUFHO29CQUFFLE9BQU87Z0JBQ25ELElBQUksTUFBTSxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxJQUFJO29CQUFFLE9BQU87Z0JBQ3RELEtBQUssRUFBRSxDQUFDO2dCQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqQixDQUFDLENBQUE7WUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUM3QyxNQUFNLEtBQUssR0FBRyxHQUFHLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2xELENBQUMsQ0FBQTtZQUNELFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2QsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hCLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUNiLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELElBQUksQ0FBQyxLQUFnQjtRQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDMUMsQ0FBQztDQUNGO0FBbkRELHdCQW1EQyJ9