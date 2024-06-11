import * as fs from "fs";
import * as https from "https";
import { WebSocketServer } from "ws";

export type ServerSocketConfig = {
  port: number;
  https?: boolean;
  host?: string;
  socket?: InstanceType<typeof WebSocketServer>;
}

export const serverSocket = (
  config: ServerSocketConfig,
): InstanceType<typeof WebSocketServer> => {
  if (config.socket) return config.socket;
  console.log(`Creating server on port ${config.port}`);

  const certExists = fs.existsSync(
    "/etc/letsencrypt/live/ws.findex.se/cert.pem",
  );

  if (config.https && certExists) {
    const httpsServer = https.createServer({
      cert: fs.readFileSync(
        "/etc/letsencrypt/live/ws.findex.se/cert.pem",
        "utf8",
      ),
      key: fs.readFileSync(
        "/etc/letsencrypt/live/ws.findex.se/privkey.pem",
        "utf8",
      ),
      ca: fs.readFileSync(
        "/etc/letsencrypt/live/ws.findex.se/chain.pem",
        "utf8",
      ),
    });

    httpsServer.listen({
      port: config.port,
      host: config.host,
    });

    const server = new WebSocketServer({
      server: httpsServer,
    });

    return server;
  }

  const server = new WebSocketServer({
    port: config.port,
  });
  return server;
};
