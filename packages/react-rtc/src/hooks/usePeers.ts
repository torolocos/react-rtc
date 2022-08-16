import { useRef } from 'react';
import type { Peer } from '../types';

export const usePeers = () => {
  const peers = useRef(new Map<string, Peer>());

  const get = (id: string) => {
    return peers.current.get(id);
  };

  const getAll = () => Array.from(peers.current).map(([, { id }]) => id);

  const add = (
    id: string,
    peerConnection: RTCPeerConnection,
    dataChannel: RTCDataChannel
  ) => {
    const peer = { id, peerConnection, dataChannel };

    peers.current.set(id, peer);
  };

  const remove = (id: string) => peers.current.delete(id);

  const disconnect = () => {
    peers.current.forEach((peer) => peer.peerConnection.close());
    peers.current.clear();
  };

  const sendToAll = (data: string) =>
    peers.current.forEach((peer) => peer.dataChannel.send(data));

  return {
    add,
    get,
    getAll,
    remove,
    sendToAll,
    disconnect,
  };
};
