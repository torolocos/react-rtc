import { useRef } from 'react';
import Message from '../models/Message';
import { RtcContext } from './RtcContext';
import { type Metadata } from '../types';
import { usePubSub } from '../hooks/usePubSub';
import { usePeerConnection } from '../hooks/usePeerConnection';

interface Props {
  children: JSX.Element;
  signalingServer: string;
  iceServers: { urls: string }[];
}

export const RtcProvider = ({
  children,
  signalingServer,
  iceServers,
}: Props) => {
  const localUuid = useRef(crypto.randomUUID());
  const handleError = (error: unknown) => dispatchEvent('error', error);

  const { dispatchEvent, on, off } = usePubSub();

  const { peerConnections, disconnect, connect } = usePeerConnection(
    localUuid.current,
    dispatchEvent,
    signalingServer,
    iceServers,
    handleError
  );

  const send = (message: string, metadata?: Metadata) => {
    try {
      const messageData = new Message({
        message,
        senderId: localUuid.current,
        timestamp: Date.now(),
        metadata: metadata,
      });

      peerConnections.current.forEach((connection) => {
        const message = JSON.stringify(messageData);

        connection?.dataChannel?.send(message);
      });

      dispatchEvent('send', messageData);
    } catch (error) {
      handleError(error);
    }
  };

  const enter = () => connect();

  const leave = () => {
    disconnect();
    dispatchEvent('leave');
  };

  return (
    <RtcContext.Provider
      value={{
        enter,
        leave,
        send,
        on,
        off,
      }}
    >
      {children}
    </RtcContext.Provider>
  );
};
