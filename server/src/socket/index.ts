import {  MessageEvent, WebSocket } from "ws";
import { parseEvent } from "../event";
import { SockEvent } from "../../../shared/src/event";
import { SockClientAuth } from "../auth";
import { unique } from "../../../shared/src/utils/array";

export class Socket {
  socket: WebSocket;
  auth?: SockClientAuth;
  apps: string[];
  id: string;

  constructor(socket: WebSocket | string, id: string) {
    if (typeof socket === 'string') {
      this.socket = new WebSocket(socket);
    } else {
      this.socket = socket;
    }
    this.id = id;
    this.apps = [];
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
}

export type ISocket = InstanceType<typeof Socket>;
