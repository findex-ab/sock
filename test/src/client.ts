import { sockClient } from '#/server/client';
import { ESockEvent } from '#/shared/event';


const main = async () => {
  const client = await sockClient({
    id: 123,
    socket: 'ws://localhost:6000',
    onEvent: (ev) => {
      console.log(`I received: ${JSON.stringify(ev, undefined, 2)}`);
    }
  }, true);


  client.send({
    type: ESockEvent.AUTH,
    payload: {
      token: 'my_token'
    }
  });

  await client.receive(ESockEvent.AUTH);

  client.send({
    type: 'stuff',
    app: 'test',
    payload: {}
  })

  client.send({
    type: 'stuff2',
    app: 'test',
    payload: {}
  })
}

main().catch(e => console.error(e))
