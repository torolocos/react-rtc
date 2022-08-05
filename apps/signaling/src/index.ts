import { createServer } from 'http';
import * as WebSocket from 'ws';
import 'dotenv/config';

const httpServer = createServer();
const webSocket = new WebSocket.Server({ server: httpServer });

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
httpServer.listen(process.env.PORT);
