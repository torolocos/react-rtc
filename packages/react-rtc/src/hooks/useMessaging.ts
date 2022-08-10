import Message from '../models/Message';
import type PeerConnections from '../models/PeerConnections';
import type { DispatchEvent, Send } from '../types';
import { useErrorHandler } from './useErrorHandler';

export const useMessaging = (
  id: string,
  peerConnections: PeerConnections,
  dispatchEvent: DispatchEvent
) => {
  const errorHandler = useErrorHandler(dispatchEvent);

  const send: Send = (data, metadata) => {
    try {
      const message = new Message({
        message: data,
        senderId: id,
        timestamp: Date.now(),
        metadata,
      });
      const payload = JSON.stringify(message);

      peerConnections.forEach((peer) => peer.dataChannel.send(payload));
      dispatchEvent('send', message);
    } catch (error) {
      errorHandler(error);
    }
  };

  return { send };
};
