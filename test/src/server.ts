import { sockApp } from '#/server/app';
import { server } from '#/server/server';


const main = async () => {
  server<{ token: string }>({
    socket: {
      port: 6000,
      host: 'localhost'
    },
    authenticate:  async (client, event) => {
      return !!event.payload.token;
    },
    apps: {
      'test': sockApp<{ counter: number }>((ctx) => {
        return {
          initialSessionState: () => ({
            counter: 0
          }),
          onEvent: (client, event) => {
            console.log(`Hello from test!`);

            setTimeout(() => {
              const session = ctx.getSession(client);
              if (session) {
                session.setState((s) => ({...s, counter: s.counter + 1}));
              }
            }, 1000);
          }
        }
      })
    }
  });
}

main().catch(e => console.error(e))
