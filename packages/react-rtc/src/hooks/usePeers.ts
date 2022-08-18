import { useRef } from 'react';
import Peer from '../models/Peer';
import type { DispatchEvent } from '../types';

export const usePeers = (dispatchEvent: DispatchEvent) => {
  const peers = useRef(new Map<string, Peer>());

  const add = (
    id: string,
    peerConnection: RTCPeerConnection,
    dataChannel: RTCDataChannel
  ) => {
    const peer = new Peer({ uuid: id, peerConnection, dataChannel });

    peers.current.set(id, peer);
  };

  const get = (id: string) => peers.current.get(id);

  const remove = (id: string) => peers.current.delete(id);

  const disconnect = () => {
    peers.current.forEach((peer) => peer.pc.close());
    peers.current.clear();
  };

  const send = (peer: Peer, data: string) => {
    peer.dataChannel.send(data);
  };

  const sendTo = (id: string, data: string) => {
    const peer = peers.current.get(id);

    if (peer) {
      send(peer, data);
      dispatchEvent('send', data);
    }
  };

  const sendToAll = (data: string) => {
    peers.current.forEach((peer) => send(peer, data));
    dispatchEvent('send', data);
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
