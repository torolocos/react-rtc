import { act, renderHook } from '@testing-library/react-hooks';
import { useSignaling } from '../useSignaling';

const send = jest.fn();
const close = jest.fn();

Object.defineProperty(global, 'WebSocket', {
  value: class {
    addEventListener = jest.fn((_type: string, handler: () => void) =>
      handler()
    );
    send = send;
    close = close;
  },
});

describe('useSignaling', () => {
  const uuid = 'test';
  const signalingServer = 'ws://localhost:8001/';
  const dispatchEvent = jest.fn();

  it('should connect to signaling server', () => {
    const { result } = renderHook(() =>
      useSignaling(uuid, signalingServer, dispatchEvent)
    );

    act(() => {
      result.current.connect();
    });

    expect(dispatchEvent).toBeCalledWith('enter');
    expect(send).toBeCalledWith(expect.stringContaining(uuid));
  });

  it('should disconnect from signaling server', () => {
    const { result } = renderHook(() =>
      useSignaling(uuid, signalingServer, dispatchEvent)
    );

    act(() => result.current.connect());
    result.current.disconnect();

    expect(close).toBeCalled();
  });
});
