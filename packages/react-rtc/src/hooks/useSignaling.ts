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

  const send = (destination: string, data: Record<string, unknown>) => {
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

  const sendSessionDescription = (peerId: string, sdp: RTCSessionDescription) =>
    send(peerId, { sdp });

  const sendIceCandidate = (peerId: string, ice: RTCIceCandidate) =>
    send(peerId, { ice });

  const sendNewPeerNotification = (peerId: string) =>
    send(peerId, { id, newPeer: true });

  const handleSignalingOpen = () => {
    sendNewPeerNotification('all');
    dispatchEvent('enter');
  };

  useEffect(() => {
    signaling?.addEventListener('open', handleSignalingOpen);

    return () => {
      signaling?.removeEventListener('open', handleSignalingOpen);
    };
  }, [signaling]);

  return {
    sendSessionDescription,
    sendIceCandidate,
    sendNewPeerNotification,
    signaling,
    connect,
    disconnect,
  };
};
