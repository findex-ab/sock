"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverSocket = void 0;
const fs = __importStar(require("fs"));
const https = __importStar(require("https"));
const ws_1 = require("ws");
const serverSocket = (config) => {
    if (config.socket)
        return config.socket;
    console.log(`Creating server on port ${config.port}`);
    const certExists = fs.existsSync("/etc/letsencrypt/live/ws.findex.se/cert.pem");
    if (config.https && certExists) {
        const httpsServer = https.createServer({
            cert: fs.readFileSync("/etc/letsencrypt/live/ws.findex.se/cert.pem", "utf8"),
            key: fs.readFileSync("/etc/letsencrypt/live/ws.findex.se/privkey.pem", "utf8"),
            ca: fs.readFileSync("/etc/letsencrypt/live/ws.findex.se/chain.pem", "utf8"),
        });
        httpsServer.listen({
            port: config.port,
            host: config.host,
        });
        const server = new ws_1.WebSocketServer({
            server: httpsServer,
        });
        return server;
    }
    const server = new ws_1.WebSocketServer({
        port: config.port,
    });
    return server;
};
exports.serverSocket = serverSocket;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyU29ja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NlcnZlclNvY2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6Qiw2Q0FBK0I7QUFDL0IsMkJBQXFDO0FBUzlCLE1BQU0sWUFBWSxHQUFHLENBQzFCLE1BQTBCLEVBQ1ksRUFBRTtJQUN4QyxJQUFJLE1BQU0sQ0FBQyxNQUFNO1FBQUUsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ3hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBRXRELE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQzlCLDZDQUE2QyxDQUM5QyxDQUFDO0lBRUYsSUFBSSxNQUFNLENBQUMsS0FBSyxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBQy9CLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUM7WUFDckMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQ25CLDZDQUE2QyxFQUM3QyxNQUFNLENBQ1A7WUFDRCxHQUFHLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FDbEIsZ0RBQWdELEVBQ2hELE1BQU0sQ0FDUDtZQUNELEVBQUUsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUNqQiw4Q0FBOEMsRUFDOUMsTUFBTSxDQUNQO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsV0FBVyxDQUFDLE1BQU0sQ0FBQztZQUNqQixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7WUFDakIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO1NBQ2xCLENBQUMsQ0FBQztRQUVILE1BQU0sTUFBTSxHQUFHLElBQUksb0JBQWUsQ0FBQztZQUNqQyxNQUFNLEVBQUUsV0FBVztTQUNwQixDQUFDLENBQUM7UUFFSCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxvQkFBZSxDQUFDO1FBQ2pDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtLQUNsQixDQUFDLENBQUM7SUFDSCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDLENBQUM7QUExQ1csUUFBQSxZQUFZLGdCQTBDdkIifQ==