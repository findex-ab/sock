import { ESockEvent, SockEvent } from "../../shared/src/event"
import { Dict } from "../../shared/src/types/dict";
import { SchemaParser } from "./schema";
import { ISocket } from "./socket"
import { SetStateFun, UseStateOptions } from "./state";
import { SockCompleteTransaction, SockTransaction } from "./transaction";

type EventSlot<T extends Dict = Dict> = {
  schema: SchemaParser<T>;
  fun: (client: ISocket, event: SockEvent<T>) => (void | Promise<void>);
};

export const defineEventSlot = <T extends Dict = Dict>(name: string, slot: EventSlot<T>) => {
  return {
    [name]: slot
  }
}

export type SockApp = {
  onBinary: (client: ISocket, data: Uint8Array) => (void | Promise<void>);
  onCompleteTransaction: (client: ISocket, transaction: SockCompleteTransaction) => (void | Promise<void>);
  onTransfer: (client: ISocket, transaction: SockTransaction) => (void | Promise<void>);
  onEvent: (client: ISocket, event: SockEvent) => (void | Promise<void>);
  onAnyEvent: (client: ISocket, event: SockEvent) => (void | Promise<void>)
  onSubscribe: (client: ISocket, event: SockEvent) => (void | Promise<void>);
  onUnsubscribe: (client: ISocket, event: SockEvent) => (void | Promise<void>);
  events: Record<string, EventSlot<any>>;
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

    const onTransfer = async (client: ISocket, transaction: SockTransaction) => {
      if (cfg.onTransfer) {
        cfg.onTransfer(client, transaction);
      }
    };

    const onCompleteTransaction = async (client: ISocket, transaction: SockCompleteTransaction) => {
      if (cfg.onCompleteTransaction) {
        await cfg.onCompleteTransaction(client, transaction);
      }
    }

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
        case ESockEvent.BEGIN_TRANSACTION: {
          //client.beginTransaction(event);
        } break;
        case ESockEvent.END_TRANSACTION: {
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
        }; break;
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
        } catch (e) {
          console.error(e);
        }
      }
    }

    const onBinary = async (client: ISocket, data: Uint8Array) => {
      //client.transfer(data);

      if (cfg.onBinary) {
        await cfg.onBinary(client, data);
      }
    }

    return {
      events: cfg.events || {},
      onBinary,
      onCompleteTransaction,
      onTransfer,
      onEvent,
      onAnyEvent,
      onSubscribe,
      onUnsubscribe
    }
  }
}
