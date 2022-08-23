import { OPEN, type WebSocket } from 'ws';
import { sendToAllClients, sendToClient } from '../send';

describe('send', () => {
  const send = jest.fn();
  const client = jest.fn(
    () =>
      ({
        readyState: OPEN,
        send,
      } as unknown as WebSocket)
  );
  const clients = new Set<WebSocket>();
  const message = 'test';

  beforeAll(() => {
    clients.add(client());
    clients.add(client());
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send message to client', () => {
    sendToClient(client(), message);

    expect(send).toBeCalledWith(message);
  });

  it('should send message to all clients', () => {
    sendToAllClients(clients, message);

    expect(send).toHaveBeenNthCalledWith(2, message);
  });
});
