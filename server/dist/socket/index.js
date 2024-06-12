"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Socket = void 0;
const ws_1 = require("ws");
const event_1 = require("../event");
const event_2 = require("../../../shared/src/event");
const array_1 = require("../../../shared/src/utils/array");
class Socket {
    socket;
    connectedAt;
    id;
    auth;
    apps;
    transactions;
    transaction;
    constructor(socket, id) {
        if (typeof socket === 'string') {
            this.socket = new ws_1.WebSocket(socket);
        }
        else {
            this.socket = socket;
        }
        this.id = id;
        this.apps = [];
        this.transactions = {};
        this.connectedAt = new Date();
    }
    getTimeAliveSeconds() {
        const now = (new Date()).getTime() / 1000;
        const connectedAt = this.connectedAt.getTime() / 1000;
        return now - connectedAt;
    }
    beginTransaction(event) {
        this.transaction = undefined;
        const name = event.transactionName;
        if (!name)
            throw new Error(`Missing transaction name`);
        if (!event.totalSize)
            throw new Error(`Missing totalSize in transaction start event`);
        const transaction = (this.transactions[name] || {});
        transaction.size = 0;
        transaction.start = event;
        transaction.packets = [];
        this.transactions[name] = transaction;
        this.transaction = transaction;
    }
    endTransaction(event) {
        const name = event.transactionName;
        if (!name)
            throw new Error(`Missing transaction name`);
        const transaction = this.transaction;
        if (!transaction)
            throw new Error(`No such transaction ${name}`);
        if (!transaction.start)
            throw new Error(`Found transaction but missing start event`);
        transaction.end = event;
        this.transactions[name] = transaction;
    }
    transfer(data) {
        const transaction = this.transaction;
        if (!transaction)
            throw new Error(`No current transaction`);
        const start = transaction.start;
        if (!start)
            throw new Error(`Found transaction but missing start event`);
        const totalSize = start.totalSize ?? 0;
        transaction.packets = transaction.packets || [];
        transaction.packets = [...transaction.packets, { data: data }];
        transaction.size += data.length;
        this.transaction = transaction;
        this.send({
            type: event_2.ESockEvent.TRANSFER_RECEIVED,
            app: start.app,
            payload: {
                progress: transaction.size / Math.max(1, totalSize)
            },
        });
    }
    deleteTransaction() {
        this.transaction = undefined;
    }
    deleteAllTransactions() {
        this.transactions = {};
    }
    finishTransactions() {
        this.deleteTransaction();
        this.deleteAllTransactions();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc29ja2V0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJCQUE4QztBQUM5QyxvQ0FBc0M7QUFDdEMscURBQWtFO0FBRWxFLDJEQUF5RDtBQUd6RCxNQUFhLE1BQU07SUFDakIsTUFBTSxDQUFZO0lBQ2xCLFdBQVcsQ0FBTztJQUNsQixFQUFFLENBQVM7SUFDWCxJQUFJLENBQWtCO0lBQ3RCLElBQUksQ0FBVztJQUNmLFlBQVksQ0FBa0M7SUFDOUMsV0FBVyxDQUFtQjtJQUU5QixZQUFZLE1BQTBCLEVBQUUsRUFBVTtRQUNoRCxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxjQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEMsQ0FBQzthQUFNLENBQUM7WUFDTixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUN2QixDQUFDO1FBQ0QsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNmLElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBRUQsbUJBQW1CO1FBQ2pCLE1BQU0sR0FBRyxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQztRQUMxQyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQztRQUN0RCxPQUFPLEdBQUcsR0FBRyxXQUFXLENBQUM7SUFDM0IsQ0FBQztJQUVELGdCQUFnQixDQUFDLEtBQWdCO1FBQy9CLElBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDO1FBQzdCLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUM7UUFDbkMsSUFBSSxDQUFDLElBQUk7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO1FBQ3RGLE1BQU0sV0FBVyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQW9CLENBQUM7UUFDdkUsV0FBVyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7UUFDckIsV0FBVyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDMUIsV0FBVyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUM7UUFDdEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7SUFDakMsQ0FBQztJQUVELGNBQWMsQ0FBQyxLQUFnQjtRQUM3QixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDO1FBQ25DLElBQUksQ0FBQyxJQUFJO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDckMsSUFBSSxDQUFDLFdBQVc7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLHVCQUF1QixJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQztRQUNyRixXQUFXLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQztRQUN4QixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLFdBQVcsQ0FBQztJQUN4QyxDQUFDO0lBRUQsUUFBUSxDQUFDLElBQWdCO1FBQ3ZCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDckMsSUFBSSxDQUFDLFdBQVc7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDNUQsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztRQUNoQyxJQUFJLENBQUMsS0FBSztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQztRQUN6RSxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQztRQUN2QyxXQUFXLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQ2hELFdBQVcsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUMvRCxXQUFXLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDaEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNSLElBQUksRUFBRSxrQkFBVSxDQUFDLGlCQUFpQjtZQUNsQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUc7WUFDZCxPQUFPLEVBQUU7Z0JBQ1AsUUFBUSxFQUFFLFdBQVcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDO2FBQ3BEO1NBQ0YsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELGlCQUFpQjtRQUNmLElBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDO0lBQy9CLENBQUM7SUFFRCxxQkFBcUI7UUFDbkIsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBRUQsTUFBTSxDQUFDLEdBQVc7UUFDaEIsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7WUFBRSxPQUFPO1FBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBQSxjQUFNLEVBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUN6QyxDQUFDO0lBRUQsU0FBUyxDQUFDLEdBQVc7UUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUFFLE9BQU87UUFDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQsT0FBTyxDQUFDLE1BQTBCLEVBQUUsVUFBa0IsS0FBSztRQUN6RCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDN0IsTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFpQixFQUFFLEVBQUU7Z0JBQ2hDLE1BQU0sS0FBSyxHQUFHLElBQUEsa0JBQVUsRUFBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ25DLElBQUksTUFBTSxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLE1BQU0sQ0FBQyxHQUFHO29CQUFFLE9BQU87Z0JBQ25ELElBQUksTUFBTSxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxJQUFJO29CQUFFLE9BQU87Z0JBQ3RELEtBQUssRUFBRSxDQUFDO2dCQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqQixDQUFDLENBQUE7WUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUM3QyxNQUFNLEtBQUssR0FBRyxHQUFHLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2xELENBQUMsQ0FBQTtZQUNELFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2QsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hCLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUNiLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELElBQUksQ0FBQyxLQUFnQjtRQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDMUMsQ0FBQztDQUNGO0FBckhELHdCQXFIQyJ9