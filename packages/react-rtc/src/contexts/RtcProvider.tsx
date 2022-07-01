import React from 'react';
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
  const handleError = (error: unknown) => dispatchEvent('error', error);

  const { dispatchEvent, on, off } = usePubSub();

  const { peerConnections, disconnect, id, connect } = usePeerConnection(
    dispatchEvent,
    signalingServer,
    iceServers,
    handleError
  );

  const send = (message: string, metadata?: Metadata) => {
    try {
      const messageData = new Message({
        message,
        senderId: id,
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

  const leave = (callback?: () => void) => {
    disconnect();
    if (callback) callback();
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
