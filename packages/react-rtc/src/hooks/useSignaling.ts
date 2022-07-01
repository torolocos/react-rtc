import { useState, useEffect } from 'react';
import Peer from '../models/Peer';

export const useSignaling = (
  uuid: string,
  signalingServer: string,
  peerConnections: React.MutableRefObject<Map<string, Peer>>
) => {
  const [signaling, setSignaling] = useState<WebSocket | undefined>();

  const connect = () => setSignaling(new WebSocket(signalingServer));

  const disconnect = () => {
    signaling?.close();
    peerConnections.current.forEach((connection) => connection.pc.close());
  };

  const sendSignalingMessage = (
    destination: string,
    data: Record<string, unknown>
  ) => {
    const message = JSON.stringify({
      uuid,
      dest: destination,
      ...data,
    });

    signaling?.send(message);
  };

  const handleSignalingOpen = () =>
    sendSignalingMessage('all', { newPeer: true });

  useEffect(() => {
    signaling?.addEventListener('open', handleSignalingOpen);

    return () => {
      signaling?.removeEventListener('open', handleSignalingOpen);
    };
  }, [signaling]);

  return { sendSignalingMessage, signaling, connect, disconnect };
};
