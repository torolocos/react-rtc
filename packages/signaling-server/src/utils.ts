import { OPEN, type WebSocket } from 'ws';

export const isConnected = (client: WebSocket) => client.readyState === OPEN;
