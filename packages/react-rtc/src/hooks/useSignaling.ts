import { useState, useEffect } from 'react';
import type { DispatchEvent } from '../types';

export const useSignaling = (
  uuid: string,
  signalingServer: string,
  dispatchEvent: DispatchEvent
) => {
  const [signaling, setSignaling] = useState<WebSocket | undefined>();

  const connect = () => setSignaling(new WebSocket(signalingServer));

  const disconnect = () => signaling?.close();

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

  const handleSignalingOpen = () => {
    sendSignalingMessage('all', { newPeer: true });
    dispatchEvent('enter');
  };

  useEffect(() => {
    signaling?.addEventListener('open', handleSignalingOpen);

    return () => {
      signaling?.removeEventListener('open', handleSignalingOpen);
    };
  }, [signaling]);

  return { sendSignalingMessage, signaling, connect, disconnect };
};
