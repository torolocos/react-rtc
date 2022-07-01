import React, { useState } from 'react';
import Message from '../models/Message';
import { RtcContext } from './RtcContext';
import { type Metadata, type User } from '../types';
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
  const [, setUser] = useState<User>({
    displayName: undefined,
  });
  const handleError = (error: unknown) => dispatchEvent('error', error);

  const { dispatchEvent, on, off } = usePubSub();

  const { peerConnections, onDisconnect, id, onConnect } = usePeerConnection(
    dispatchEvent,
    signalingServer,
    iceServers,
    handleError
  );

  const send = (inputValue: string, metadata?: Metadata) => {
    try {
      const messageData = new Message({
        message: inputValue,
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

  const enter = (displayName: string, userMetadata?: Metadata) => {
    onConnect();
    setUser({ displayName, userMetadata });
  };

  const disconnect = (callback?: () => void) => {
    onDisconnect();
    if (callback) callback();
  };

  return (
    <RtcContext.Provider
      value={{
        send,
        disconnect,
        enter,
        on,
        off,
      }}
    >
      {children}
    </RtcContext.Provider>
  );
};
