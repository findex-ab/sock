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
    ip;
    connectionRequest;
    auth;
    apps;
    transactions;
    transaction;
    constructor(socket, id, connectionRequest) {
        if (typeof socket === 'string') {
            this.socket = new ws_1.WebSocket(socket);
        }
        else {
            this.socket = socket;
        }
        this.id = id;
        this.connectionRequest = connectionRequest;
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
    getIP() {
        if (this.ip)
            return this.ip;
        const a = this.connectionRequest.headers['x-forwarded-for'];
        if (typeof a === 'string')
            return a;
        if (Array.isArray(a) && a.length >= 1 && typeof a[0] === 'string')
            return a[0];
        return this.connectionRequest.socket.remoteAddress;
    }
}
exports.Socket = Socket;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc29ja2V0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJCQUE4QztBQUM5QyxvQ0FBc0M7QUFDdEMscURBQWtFO0FBRWxFLDJEQUF5RDtBQUl6RCxNQUFhLE1BQU07SUFDakIsTUFBTSxDQUFZO0lBQ2xCLFdBQVcsQ0FBTztJQUNsQixFQUFFLENBQVM7SUFDWCxFQUFFLENBQVU7SUFDWixpQkFBaUIsQ0FBa0I7SUFDbkMsSUFBSSxDQUFrQjtJQUN0QixJQUFJLENBQVc7SUFDZixZQUFZLENBQWtDO0lBQzlDLFdBQVcsQ0FBbUI7SUFFOUIsWUFBWSxNQUEwQixFQUFFLEVBQVUsRUFBRSxpQkFBa0M7UUFDcEYsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksY0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RDLENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDdkIsQ0FBQztRQUNELElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDO1FBQzNDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFRCxtQkFBbUI7UUFDakIsTUFBTSxHQUFHLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQzFDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ3RELE9BQU8sR0FB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