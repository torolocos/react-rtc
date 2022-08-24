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

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useSignaling', () => {
  const id = 'id';
  const peerId = 'peerId';
  const signalingServer = 'ws://localhost:8001/';
  const dispatchEvent = jest.fn();

  it('should connect to signaling server', () => {
    const { result } = renderHook(() =>
      useSignaling(id, signalingServer, dispatchEvent)
    );

    act(() => {
      result.current.connect();
    });

    expect(dispatchEvent).toBeCalledWith('enter');
    expect(send).toBeCalledWith(expect.stringContaining(id));
  });

  it('should disconnect from signaling server', () => {
    const { result } = renderHook(() =>
      useSignaling(id, signalingServer, dispatchEvent)
    );

    act(() => result.current.connect());
    result.current.disconnect();

    expect(close).toBeCalled();
  });

  it('should send new peer notification', () => {
    const { result } = renderHook(() =>
      useSignaling(id, signalingServer, dispatchEvent)
    );

    act(() => {
      result.current.connect();
    });

    result.current.sendNewPeerNotification(peerId);

    expect(send).toBeCalledWith(expect.stringContaining(id));
    expect(send).toBeCalledWith(expect.stringContaining(peerId));
    expect(send).toBeCalledWith(expect.stringContaining('newPeer'));
  });

  it('should send session description', () => {
    const sdp = jest.fn<RTCSessionDescription, never>();
    const { result } = renderHook(() =>
      useSignaling(id, signalingServer, dispatchEvent)
    );

    act(() => {
      result.current.connect();
    });

    result.current.sendSessionDescription(peerId, sdp());

    expect(send).toBeCalledWith(expect.stringContaining(id));
    expect(send).toBeCalledWith(expect.stringContaining(peerId));
  });

  it('should send ice candidate', () => {
    const ice = jest.fn<RTCIceCandidate, never>();
    const { result } = renderHook(() =>
      useSignaling(id, signalingServer, dispatchEvent)
    );

    act(() => {
      result.current.connect();
    });

    result.current.sendIceCandidate(peerId, ice());

    expect(send).toBeCalledWith(expect.stringContaining(id));
    expect(send).toBeCalledWith(expect.stringContaining(peerId));
  });

  it('should handle send error', () => {
    const error = new Error();

    send.mockImplementationOnce(() => {
      throw error;
    });

    const { result } = renderHook(() =>
      useSignaling(id, signalingServer, dispatchEvent)
    );

    act(() => {
      result.current.connect();
    });

    expect(dispatchEvent).toBeCalledWith('error', error);
  });
});
