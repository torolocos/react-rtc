import { renderHook } from '@testing-library/react-hooks';
import { useConnection } from '../useConnection';

const close = jest.fn();
const send = jest.fn();
const dispatchEvent = jest.fn();
const addTrack = jest.fn();

Object.defineProperty(global, 'RTCPeerConnection', {
  value: class {
    createDataChannel = jest.fn(() => ({ send }));
    close = close;
    addTrack = addTrack;
  },
});

describe('useConnection', () => {
  const id = ['a', 'b'] as const;
  const peerConnection = new RTCPeerConnection();
  const dataChannel = peerConnection.createDataChannel('test');

  it('should add and get a connection', () => {
    const { result } = renderHook(() => useConnection(dispatchEvent));

    result.current.add(id[0], peerConnection, dataChannel);
    expect(result.current.get(id[0])).toEqual({
      id: id[0],
      peerConnection,
      dataChannel,
    });
  });

  it('should remove a connection', () => {
    const { result } = renderHook(() => useConnection(dispatchEvent));

    result.current.add(id[0], peerConnection, dataChannel);
    result.current.remove(id[0]);
    expect(result.current.get(id[0])).toBeUndefined();
  });

  it('should close all connections', () => {
    const { result } = renderHook(() => useConnection(dispatchEvent));

    result.current.add(id[0], peerConnection, dataChannel);
    result.current.add(id[1], peerConnection, dataChannel);
    result.current.closeAll();

    expect(close).toBeCalledTimes(2);
  });

  it('should send data to peer', () => {
    const data = 'data';
    const { result } = renderHook(() => useConnection(dispatchEvent));

    result.current.add(id[0], peerConnection, dataChannel);
    result.current.sendTo(id[0], data);

    expect(send).toBeCalledWith(data);
    expect(dispatchEvent).toBeCalledWith('send', [id[0], data]);
  });

  it('should handle send error', () => {
    send.mockImplementationOnce(() => {
      throw new Error();
    });
    const data = 'data';
    const { result } = renderHook(() => useConnection(dispatchEvent));

    result.current.add(id[0], peerConnection, dataChannel);
    result.current.sendTo(id[0], data);

    expect(send).toBeCalledWith(data);
    expect(dispatchEvent).toBeCalledWith('error');
  });

  it('should send data to all peers', () => {
    const data = 'data';
    const { result } = renderHook(() => useConnection(dispatchEvent));

    result.current.add(id[0], peerConnection, dataChannel);
    result.current.add(id[1], peerConnection, dataChannel);
    result.current.sendToAll(data);

    expect(send).toHaveBeenNthCalledWith(2, data);
    expect(dispatchEvent).toHaveBeenCalledWith('send', [id[0], data]);
    expect(dispatchEvent).toHaveBeenCalledWith('send', [id[1], data]);
  });

  it('should add track to connection', () => {
    const { result } = renderHook(() => useConnection(dispatchEvent));
    const mediaStreamTrack = jest.fn<MediaStreamTrack, never>();

    result.current.add(id[0], peerConnection, dataChannel);
    result.current.addTrack(id[0], mediaStreamTrack());

    expect(addTrack).toBeCalledWith(mediaStreamTrack());
  });
});
