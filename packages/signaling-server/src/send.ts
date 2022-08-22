import { type WebSocket } from 'ws';
import { isConnected } from './utils';

export const sendToClient = (client: WebSocket, message: string) => {
  if (isConnected(client)) client.send(message);
};

export const sendToAllClients = (clients: Set<WebSocket>, message: string) => {
  clients.forEach((client) => sendToClient(client, message));
};
