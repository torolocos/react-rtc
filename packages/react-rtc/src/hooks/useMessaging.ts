import Message from '../models/Message';
import Peer from '../models/Peer';
import type { DispatchEvent, Metadata } from '../types';
import { useErrorHandler } from './useErrorHandler';

export const useMessaging = (
  id: string,
  peerConnections: Map<string, Peer>,
  dispatchEvent: DispatchEvent
) => {
  const errorHandler = useErrorHandler(dispatchEvent);

  const send = (data: string, metadata?: Metadata) => {
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
