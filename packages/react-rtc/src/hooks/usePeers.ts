import { useRef } from 'react';
import type { DispatchEvent, Peer } from '../types';
import { useErrorHandler } from './useErrorHandler';

export const usePeers = (dispatchEvent: DispatchEvent) => {
  const peers = useRef(new Map<string, Peer>());
  const handleError = useErrorHandler(dispatchEvent);

  const add = (
    id: string,
    peerConnection: RTCPeerConnection,
    dataChannel: RTCDataChannel
  ) => {
    const peer = { uuid: id, pc: peerConnection, dataChannel };

    peers.current.set(id, peer);
  };

  const get = (id: string) => peers.current.get(id);

  const remove = (id: string) => peers.current.delete(id);

  const forEach = (callback: (peer: Peer, id?: string) => void) =>
    peers.current.forEach(callback);

  const disconnect = () => {
    forEach((peer) => peer.pc.close());
    peers.current.clear();
  };

  const send = (peer: Peer, data: string) => {
    try {
      peer.dataChannel.send(data);
      dispatchEvent('send', [peer.uuid, data]);
    } catch (error) {
      handleError(error);
    }
  };

  const sendTo = (id: string, data: string) => {
    const peer = peers.current.get(id);

    if (peer) send(peer, data);
  };

  const sendToAll = (data: string) => {
    forEach((peer) => send(peer, data));
  };

  return {
    add,
    get,
    remove,
    sendTo,
    sendToAll,
    disconnect,
  };
};
