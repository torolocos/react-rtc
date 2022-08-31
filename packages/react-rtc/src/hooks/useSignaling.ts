import { useState, useEffect } from 'react';
import type { DispatchEvent } from '../types';

export const useSignaling = (
  id: string,
  signalingServer: string,
  dispatchEvent: DispatchEvent
) => {
  const [signaling, setSignaling] = useState<WebSocket | undefined>();

  const connect = () => setSignaling(new WebSocket(signalingServer));

  const disconnect = () => signaling?.close();

  const send = (destination: string, data: unknown) => {
    try {
      signaling?.send(
        JSON.stringify({
          id,
          destination,
          data,
        })
      );
    } catch (error) {
      dispatchEvent('error', error);
    }
  };

  const handleSignalingOpen = () => {
    send('all', { id });
    dispatchEvent('enter');
  };

  useEffect(() => {
    signaling?.addEventListener('open', handleSignalingOpen);

    return () => {
      signaling?.removeEventListener('open', handleSignalingOpen);
    };
  }, [signaling]);

  return {
    send,
    signaling,
    connect,
    disconnect,
  };
};
