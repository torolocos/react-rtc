import { renderHook } from '@testing-library/react-hooks';
import { usePeers } from '../usePeers';

const close = jest.fn();
const send = jest.fn();
const dispatchEvent = jest.fn();

Object.defineProperty(global, 'RTCPeerConnection', {
  value: class {
    createDataChannel = jest.fn(() => ({ send }));
    close = close;
  },
  writable: false,
});

describe('usePeers', () => {
  const id = ['a', 'b'] as const;
  const peerConnection = new RTCPeerConnection();
  const dataChannel = peerConnection.createDataChannel('test');

  it.only('should add and get a peer', () => {
    const peerConnection = new RTCPeerConnection();
    const dataChannel = peerConnection.createDataChannel('test');
    const { result } = renderHook(() => usePeers(dispatchEvent));

    result.current.add(id[0], peerConnection, dataChannel);
    expect(result.current.get(id[0])).toMatchObject({ id: id[0] });
  });

  it('should get all peers', () => {
    const { result } = renderHook(() => usePeers(dispatchEvent));

    result.current.add(id[0], peerConnection, dataChannel);
    result.current.add(id[1], peerConnection, dataChannel);
    expect(result.current.getAll()).toStrictEqual(id);
  });

  it('should remove a peer', () => {
    const { result } = renderHook(() => usePeers(dispatchEvent));

    result.current.add(id[0], peerConnection, dataChannel);
    result.current.remove(id[0]);
    expect(result.current.get(id[0])).toBeUndefined();
  });

  it('should disconnect from all peers', () => {
    const { result } = renderHook(() => usePeers(dispatchEvent));

    result.current.add(id[0], peerConnection, dataChannel);
    result.current.add(id[1], peerConnection, dataChannel);
    result.current.disconnect();

    expect(close).toBeCalledTimes(2);
  });

  it('should send data to all peers', () => {
    const data = 'data';
    const { result } = renderHook(() => usePeers(dispatchEvent));

    result.current.add(id[0], peerConnection, dataChannel);
    result.current.add(id[1], peerConnection, dataChannel);
    result.current.sendToAll(data);

    expect(send).toHaveBeenNthCalledWith(2, data);
    expect(dispatchEvent).toBeCalledWith('send', data);
  });
});
