import Message from '../models/Message';
import type { DispatchEvent, Send } from '../types';
import { useErrorHandler } from './useErrorHandler';

export const useMessaging = (
  id: string,
  sendToAllPeers: (data: string) => void,
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

      sendToAllPeers(JSON.stringify(message));
      dispatchEvent('send', message);
    } catch (error) {
      errorHandler(error);
    }
  };

  return { send };
};
