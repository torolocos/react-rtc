import React, { useState, useRef, useEffect } from 'react';
import Message from './models/Message';
import { RtcContext } from './RtcContext';
import {
  ConnectionState,
  Event,
  type Metadata,
  type User,
  type PeerConnection,
  type ContextType,
  type Signal,
} from './types';

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
  const [messageData, setMessageData] = useState<Message[]>([]);
  const [error, setError] = useState<string>(''); // TODO: Remove error, use onError event instead
  const [user, setUser] = useState<User>({
    displayName: undefined,
    userMetadata: undefined,
  });
  const signaling = useRef<WebSocket>(null);

  const peerConnections = useRef<PeerConnection>(new Map());

  const onSendEventMessage = (
    peer: {
      pc: RTCPeerConnection;
      dataChannel: RTCDataChannel;
      displayName: string;
    },

    event: Event
  ) => {
    const message = new Message({
      senderId: localUuid.current,
      displayName: peer.displayName,
      timestamp: Date.now(),
      message: '',
      metadata: { event },
    });

    setMessageData((prev) => [...prev, message]);
  };

  const send = (inputValue: string, metadata?: Metadata) => {
    try {
      const messageData = new Message({
        id: crypto.randomUUID(),
        message: inputValue,
        displayName: user.displayName,
        senderId: localUuid.current,
        timestamp: Date.now(),
        metadata: { event: 'message', ...metadata },
      });

      setMessageData((prev) => [...prev, messageData]);

      peerConnections.current.forEach((connection) => {
        const message = JSON.stringify(messageData);

        connection?.dataChannel?.send(message);
      });
    } catch (e) {
      // TODO: Add error handler
      setError(e as string);
      console.warn(e);
    }
  };

  function checkPeerDisconnect(peerUuid: string) {
    const state = peerConnections.current.get(peerUuid)?.pc.iceConnectionState;
    const peer = peerConnections.current.get(peerUuid);

    if (
      peer &&
      (state === ConnectionState.FAILED ||
        state === ConnectionState.CLOSED ||
        state === ConnectionState.DISCONNECT)
    ) {
      onSendEventMessage(peer, 'disconnected');
      peerConnections.current.delete(peerUuid);
    }
  }

  function setUpPeer(peerUuid: string, displayName: string, initCall = false) {
    const peerConnection = new RTCPeerConnection({ iceServers });
    // TODO: Make better naming
    const dataChannel = peerConnection.createDataChannel('test');

    // TODO: Pull it outside to separate file, use it as handleres
    peerConnection.onicecandidate = (event) => gotIceCandidate(event, peerUuid);
    peerConnection.oniceconnectionstatechange = () =>
      checkPeerDisconnect(peerUuid);
    peerConnection.addEventListener('datachannel', (event) =>
      Object.defineProperty(
        peerConnections.current.get(peerUuid),
        'dataChannel',
        {
          value: event.channel,
        }
      )
    );
    peerConnection.addEventListener('connectionstatechange', () => {
      const peer = peerConnections.current.get(peerUuid);
      if (peer && peer.pc.connectionState === 'connected' && !initCall)
        onSendEventMessage(peer, 'connected');
    });

    // TODO: Parse message outside, add try catch, use addMessageData
    dataChannel.addEventListener('message', (event) =>
      setMessageData((prev) => [...prev, JSON.parse(event.data)])
    );

    if (initCall) {
      peerConnection
        .createOffer()
        .then((description) => createdDescription(description, peerUuid))
        // TODO: Add error handlerer
        .catch((e) => handleError(e));
    }

    peerConnections.current.set(peerUuid, {
      displayName,
      pc: peerConnection,
      dataChannel,
    });
    setIsEntered(true);
  }

  function gotIceCandidate(event: RTCPeerConnectionIceEvent, peerUuid: string) {
    if (event.candidate != null) {
      sendSignalingMessage(peerUuid, { ice: event.candidate });
    }
  }

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

  const initIceCandidate = (
    peerConnection: RTCPeerConnection,
    signal: Signal
  ) => {
    peerConnection
      .addIceCandidate(new RTCIceCandidate(signal.ice))
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

  const onEnter = async (displayName: string, userMetadata?: Metadata) => {
    // TODO: Fix this ignore

    // @ts-ignore
    signaling.current = new WebSocket(signalingServer);
    // TODO: Add callback, notifi user about event, remove setError,
    setError('');
    setUser({ displayName, userMetadata });

    setIsEntered(true);
  };

  const onLeave = () => {
    signaling.current?.close();
    peerConnections.current.forEach((connection) => {
      connection.pc.close();
    });
    setIsEntered(false);
    // TODO: Add callback
  };

  const sendSignalingMessage = (
    dest: string,

    data: Record<string, unknown>
  ) => {
    const message = JSON.stringify({ uuid: localUuid.current, dest, ...data });

    signaling.current?.send(message);
  };

  const handleSignalingOpen = () => {
    sendSignalingMessage('all', { displayName: user.displayName });
  };

  const handleError = (error: unknown) => {
    // TODO: handle errors
    console.error(error);
  };

  useEffect(() => {
    signaling.current?.addEventListener('message', handleMessageFromServer);
    signaling.current?.addEventListener('open', handleSignalingOpen);

    return () => {
      signaling.current?.removeEventListener(
        'message',
        handleMessageFromServer
      );
      signaling.current?.removeEventListener('open', handleSignalingOpen);
    };
  }, [signaling.current]);

  const rtcContext: ContextType = {
    send,
    onEnter,
    onLeave,
    messageData,
    connections: peerConnections.current,
    state: { isEntered },
    error,
  };
  return (
    <RtcContext.Provider value={rtcContext}>{children}</RtcContext.Provider>
  );
};
