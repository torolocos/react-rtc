import { useRef, useEffect } from 'react';
import Peer from '../models/Peer';

export const useSignaling = (
  uuid: string,
  signalingServer: string,
  peerConnections: React.MutableRefObject<Map<string, Peer>>
) => {
  const signaling = useRef<WebSocket>();

  const onConnect = () => {
    signaling.current = new WebSocket(signalingServer);
  };

  const onDisconnect = () => {
    signaling.current?.close();
    peerConnections.current.forEach((connection) => {
      connection.pc.close();
    });
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

    signaling.current?.send(message);
  };

  const handleSignalingOpen = () => 
    sendSignalingMessage('all', { displayName: uuid });

  useEffect(() => {
    signaling.current?.addEventListener('open', handleSignalingOpen);

    return () => {
      signaling.current?.removeEventListener('open', handleSignalingOpen);
    };
  }, [signaling.current]);

  return { sendSignalingMessage, signaling, onConnect, onDisconnect };
};
