import {  MessageEvent, WebSocket } from "ws";
import { parseEvent } from "../event";
import { ESockEvent, SockEvent } from "../../../shared/src/event";
import { SockClientAuth } from "../auth";
import { unique } from "../../../shared/src/utils/array";
import { SockTransaction } from "../transaction";
import { IncomingMessage } from "http";

export class Socket {
  socket: WebSocket;
  connectedAt: Date;
  id: string;
  connectionRequest: IncomingMessage;
  auth?: SockClientAuth;
  apps: string[];
  transactions: Record<string, SockTransaction>;
  transaction?: SockTransaction;

  constructor(socket: WebSocket | string, id: string, connectionRequest: IncomingMessage) {
    if (typeof socket === 'string') {
      this.socket = new WebSocket(socket);
    } else {
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

  beginTransaction(event: SockEvent) {
    this.transaction = undefined;
    const name = event.transactionName;
    if (!name) throw new Error(`Missing transaction name`);
    if (!event.totalSize) throw new Error(`Missing totalSize in transaction start event`);
    const transaction = (this.transactions[name] || {}) as SockTransaction;
    transaction.size = 0;
    transaction.start = event;
    transaction.packets = [];
    this.transactions[name] = transaction;
    this.transaction = transaction;
  }

  endTransaction(event: SockEvent) {
    const name = event.transactionName;
    if (!name) throw new Error(`Missing transaction name`);
    const transaction = this.transaction;
    if (!transaction) throw new Error(`No such transaction ${name}`);
    if (!transaction.start) throw new Error(`Found transaction but missing start event`);
    transaction.end = event;
    this.transactions[name] = transaction;
  }

  transfer(data: Uint8Array) {
    const transaction = this.transaction;
    if (!transaction) throw new Error(`No current transaction`);
    const start = transaction.start;
    if (!start) throw new Error(`Found transaction but missing start event`);
    const totalSize = start.totalSize ?? 0;
    transaction.packets = transaction.packets || [];
    transaction.packets = [...transaction.packets, { data: data }];
    transaction.size += data.length;
    this.transaction = transaction;
    this.send({
      type: ESockEvent.TRANSFER_RECEIVED,
      app: start.app,
      payload: {
        progress: transaction.size / Math.max(1, totalSize)
      },
    })
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

  addApp(app: string) {
    if (this.apps.includes(app)) return;
    console.log(`Add ${app} to client`);
    this.apps = unique([...this.apps, app])
  }

  removeApp(app: string) {
    if (!this.apps.includes(app)) return;
    console.log(`Remove ${app} to client`);
    this.apps = this.apps.filter(it => it !== app);
  }

  receive(expect: Partial<SockEvent>, timeout: number = 10000): Promise<SockEvent | null> {
    return new Promise((resolve) => {
      const fun = (msg: MessageEvent) => {
        const event = parseEvent(msg.data);
        if (expect.app && event.app !== expect.app) return;
        if (expect.type && event.type !== expect.type) return;
        clear();
        resolve(event);
      }
      this.socket.addEventListener('message', fun);
      const clear = () => {
        this.socket.removeEventListener('message', fun);
      }
      setTimeout(() => {
        clear();
        resolve(null);
      }, timeout)
    })
  }

  send(event: SockEvent) {
    this.socket.send(JSON.stringify(event));
  }

  getIP() {
    const a = this.connectionRequest.headers['x-forwarded-for'];
    if (typeof a === 'string') return a;
    if (Array.isArray(a) && a.length >= 1 && typeof a[0] === 'string') return a[0];
    return this.connectionRequest.socket.remoteAddress;
  }
}

export type ISocket = InstanceType<typeof Socket>;
