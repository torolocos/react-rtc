import { useRef } from 'react';
import type { DispatchEvent, Peer } from '../types';
import { useErrorHandler } from './useErrorHandler';

export const useConnections = (dispatchEvent: DispatchEvent) => {
  const connections = useRef(new Map<string, Peer>());
  const handleError = useErrorHandler(dispatchEvent);

  const add = (
    id: string,
    peerConnection: RTCPeerConnection,
    dataChannel: RTCDataChannel
  ) => {
    const peer: Peer = { id, peerConnection, dataChannel };

    connections.current.set(id, peer);
  };

  const get = (id: string) => connections.current.get(id);

  const remove = (id: string) => connections.current.delete(id);

  const forEach = (callback: (peer: Peer, id?: string) => void) =>
    connections.current.forEach(callback);

  const disconnect = () => {
    forEach((peer) => peer.peerConnection.close());
    connections.current.clear();
  };

  const send = (peer: Peer, data: string) => {
    try {
      if (peer.dataChannel.readyState !== 'open') {
        // TODO: Throw custom error
        throw new Error();
      }

      peer.dataChannel.send(data);
      dispatchEvent('send', [peer.id, data]);
    } catch (error) {
      handleError(error);
    }
  };

  const sendTo = (id: string, data: string) => {
    const peer = get(id);

    if (peer) send(peer, data);
  };

  const sendToAll = (data: string) => {
    forEach((peer) => send(peer, data));
  };

  const addTrack = (id: string, track: MediaStreamTrack) => {
    const peer = get(id)?.peerConnection;

    peer?.addTrack(track);
  };

  return {
    add,
    get,
    remove,
    sendTo,
    sendToAll,
    addTrack,
    disconnect,
  };
};
