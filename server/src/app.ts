import { ESockEvent, SockEvent } from "../../shared/src/event"
import { Dict } from "../../shared/src/types";
import { ISocket } from "./socket"
import { SetStateFun, UseStateOptions } from "./state";

export type SockApp = {
  onEvent: (client: ISocket, event: SockEvent) => (void | Promise<void>)
  onAnyEvent: (client: ISocket, event: SockEvent) => (void | Promise<void>)
  onSubscribe: (client: ISocket, event: SockEvent) => (void | Promise<void>);
  onUnsubscribe: (client: ISocket, event: SockEvent) => (void | Promise<void>);
}

export type SockAppConfig = Partial<SockApp>;


export type SockAppContext = {
  key: string;
  useState: <T extends Dict = Dict>(init: T, options?: UseStateOptions<T>) => [T, SetStateFun<T>]
  server: {
    getClients: () => ISocket[]
  }
}

export type SockAppInternal = (ctx: SockAppContext) => SockApp;
export type SockAppInit = (ctx: SockAppContext) => SockAppConfig;

export const sockApp = (init: SockAppInit): SockAppInternal => {
  return (ctx: SockAppContext) => {
    const cfg = init(ctx);

    const onSubscribe = async (client: ISocket, event: SockEvent) => {
      if (cfg.onSubscribe) {
        await cfg.onSubscribe(client, event);
      }
    }

    const onUnsubscribe = async (client: ISocket, event: SockEvent) => {
      if (cfg.onUnsubscribe) {
        await cfg.onUnsubscribe(client, event);
      }
    }

    const onAnyEvent = async (client: ISocket, event: SockEvent) => {
      if (cfg.onAnyEvent) {
        await cfg.onAnyEvent(client, event);
      }
    }

    const onEvent = async (client: ISocket, event: SockEvent) => {
      if (cfg.onEvent) {
        await cfg.onEvent(client, event);
      }
      switch (event.type) {
        case ESockEvent.SUBSCRIBE_APP: await onSubscribe(client, event); break;
        case ESockEvent.UNSUBSCRIBE_APP: await onUnsubscribe(client, event); break;
      }
    }

    return {
      onEvent,
      onAnyEvent,
      onSubscribe,
      onUnsubscribe
    }
  }
}
