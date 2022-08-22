import {
  Server,
  OPEN as WebSocketOpen,
  type RawData,
  type WebSocket,
} from 'ws';
import type { Server as HttpServer } from 'http';
import type { Server as HttpsServer } from 'https';

const sendToAllClients = (message: string, webSocket: Server<WebSocket>) => {
  webSocket.clients.forEach((client) => {
    if (client.readyState === WebSocketOpen) client.send(message);
  });
};

export const createSignalingServer = (server: HttpServer | HttpsServer) => {
  const webSocket = new Server({ server });

  const handleMessage = (message: RawData) =>
    sendToAllClients(message.toString('utf-8'), webSocket);

  const handleError = () => webSocket.close();

  const handleConnection = (socket: WebSocket) => {
    socket.on('message', handleMessage);
    socket.on('error', handleError);
  };

  webSocket.on('connection', handleConnection);
};
