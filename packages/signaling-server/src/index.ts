import * as WebSocket from 'ws';
import type { Server as HttpServer } from 'http';
import type { Server as HttpsServer } from 'https';

export const createSignalingServer = (server: HttpServer | HttpsServer) => {
  const webSocket = new WebSocket.Server({ server });

  const sendToAllClients = (message: string) => {
    webSocket.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(message);
    });
  };

  const handleMessage = (message: WebSocket.RawData) =>
    sendToAllClients(message.toString('utf-8'));

  const handleError = () => webSocket.close();

  const handleConnection = (socket: WebSocket.WebSocket) => {
    socket.on('message', handleMessage);
    socket.on('error', handleError);
  };

  webSocket.on('connection', handleConnection);
};
