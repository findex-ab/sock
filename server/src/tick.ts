//import { processEvents } from "./queue";
import { SockServer } from "./server";

export const serverTick = async (server: SockServer) => {
  server.state.clients.forEach(client => client.socket.ping());
  //await processEvents(server);
}
