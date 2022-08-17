import { useRef } from 'react';
import Peer from '../models/Peer';
import type { DispatchEvent } from '../types';

export const usePeers = (dispatchEvent: DispatchEvent) => {
  const peers = useRef(new Map<string, Peer>());

  const get = (id: string) => {
    return peers.current.get(id);
  };

  const getAll = () => Array.from(peers.current).map(([id]) => id);

  const add = (
    id: string,
    peerConnection: RTCPeerConnection,
    dataChannel: RTCDataChannel
  ) => {
    const peer = new Peer({ uuid: id, peerConnection, dataChannel });

    peers.current.set(id, peer);
  };

  const remove = (id: string) => peers.current.delete(id);

  const disconnect = () => {
    peers.current.forEach((peer) => peer.pc.close());
    peers.current.clear();
  };

  const sendToAll = (data: string) => {
    peers.current.forEach((peer) => peer.dataChannel.send(data));
    dispatchEvent('send', data);
  };

  return {
    add,
    get,
    getAll,
    remove,
    sendToAll,
    disconnect,
  };
};
