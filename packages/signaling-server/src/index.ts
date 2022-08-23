import { Server, type RawData, type WebSocket } from 'ws';
import type { Server as HttpServer } from 'http';
import type { Server as HttpsServer } from 'https';
import { sendToAllClients } from './send';

export const createSignalingServer = (server: HttpServer | HttpsServer) => {
  const webSocket = new Server({ server });

  const handleMessage = (message: RawData) =>
    sendToAllClients(webSocket.clients, message.toString('utf-8'));

  const handleError = () => webSocket.close();

  const handleConnection = (socket: WebSocket) => {
    socket.on('message', handleMessage);
    socket.on('error', handleError);
  };

  webSocket.on('connection', handleConnection);
};
