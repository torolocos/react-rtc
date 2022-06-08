import React, { useState, useRef, useEffect } from 'react';
import Message from '../models/Message';
import { RtcContext } from './RtcContext';
import { type Metadata, type User, type Signal } from '../types';
import { usePubSub } from '../hooks/usePubSub';
import { useSignaling } from '../hooks/useSignaling';
import { usePeerConnection } from '../hooks/usePeerConection';

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
  const [isEntered, setIsEntered] = useState(false); // TODO: Rename, leave there
  const localUuid = useRef(crypto.randomUUID());
  const [user, setUser] = useState<User>({
    displayName: undefined,
  });

  const handleError = (error: unknown) => dispatchEvent('error', error);

  const { dispatchEvent, on, off } = usePubSub();
  const { sendSignalingMessage, signaling } = useSignaling(localUuid.current);
  const { peerConnections, setUpPeer, initIceCandidate } = usePeerConnection(
    iceServers,
    handleError
  );

  const send = (inputValue: string, metadata?: Metadata) => {
    try {
      const messageData = new Message({
        message: inputValue,
        displayName: user.displayName,
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

  function createdDescription(
    description: RTCSessionDescriptionInit,

    peerUuid: string
  ) {
    peerConnections.current
      .get(peerUuid)
      ?.pc.setLocalDescription(description)

      .then(() => {
        sendSignalingMessage(peerUuid, {
          sdp: peerConnections.current.get(peerUuid)?.pc.localDescription,
        });
      })
      .catch((e) => handleError(e));
  }

  const sendSignalingMessageToNewcomers = (uuid: string) => {
    sendSignalingMessage(uuid, {
      displayName: localUuid.current, // not sure if this is correct
      uuid: localUuid.current,
    });
  };

  const sendSessionWithDescription = (
    peerConnection: RTCPeerConnection,
    signal: Signal
  ) => {
    peerConnection
      .setRemoteDescription(new RTCSessionDescription(signal.sdp))
      .then(() => {
        // Only create answers in response to offers
        if (signal.sdp.type == 'offer') {
          peerConnections.current
            .get(signal.uuid)
            ?.pc.createAnswer()
            .then((description) => createdDescription(description, signal.uuid))
            .catch((e) => handleError(e));
        }
      })
      .catch((e) => handleError(e));
  };

  function handleMessageFromServer(message: MessageEvent) {
    const signal: Signal = JSON.parse(message.data);
    const peerUuid = signal.uuid;
    const peerDisplayName = signal.displayName;
    const destination = signal.dest;
    const isSessionDescription = signal.sdp;
    const isIceCandidate = signal.ice;
    // Ignore messages that are not for us or from ourselves
    if (
      peerUuid == localUuid.current ||
      (destination != localUuid.current && destination != 'all')
    )
      return;

    const currentPeerConnection = peerConnections.current.get(peerUuid)?.pc;

    if (currentPeerConnection) {
      if (isSessionDescription) {
        sendSessionWithDescription(currentPeerConnection, signal);
      } else if (isIceCandidate) {
        initIceCandidate(currentPeerConnection, signal);
      }
    }

    if (peerDisplayName) {
      const isNewcomer = destination === localUuid.current;
      setUpPeer(peerUuid, peerDisplayName, isNewcomer);
      if (isNewcomer) {
        setIsEntered(true);
      } else {
        sendSignalingMessageToNewcomers(peerUuid);
      }
    }
  }

  const enter = (displayName: string, userMetadata?: Metadata) => {
    // TODO: Fix this ignore

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    signaling.current = new WebSocket(signalingServer);
    setUser({ displayName, userMetadata });

    setIsEntered(true);
  };

  const disconnect = () => {
    signaling.current?.close();
    peerConnections.current.forEach((connection) => {
      connection.pc.close();
    });
    setIsEntered(false);
    // TODO: Add callback
  };

  useEffect(() => {
    signaling.current?.addEventListener('message', handleMessageFromServer);

    return () => {
      signaling.current?.removeEventListener(
        'message',
        handleMessageFromServer
      );
    };
  }, [signaling.current]);

  return (
    <RtcContext.Provider
      value={{
        send,
        state: { isEntered },
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
