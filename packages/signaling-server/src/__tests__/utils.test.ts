import { CLOSED, OPEN, type WebSocket } from 'ws';
import { isConnected } from '../utils';

describe('utils', () => {
  const readyState = jest.fn();
  const client = jest.fn(
    () =>
      ({
        readyState: readyState(),
      } as unknown as WebSocket)
  );

  it('should return true if client is connected', () => {
    readyState.mockReturnValueOnce(OPEN);

    expect(isConnected(client())).toBeTruthy();
  });

  it('should return false if client is not connected', () => {
    readyState.mockReturnValueOnce(CLOSED);

    expect(isConnected(client())).toBeFalsy();
  });
});
