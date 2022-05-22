import React, { useState, useRef, useEffect } from 'react';
import Message from './models/Message';
import { RtcContext } from './RtcContext';
import { isCustomEvent } from '@guards';
import {
  ConnectionState,
  Event,
  type Metadata,
  type User,
  type PeerConnection,
  type ContextType,
} from '@types';

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
    userMetadata: undefined,
  });
  const signaling = useRef<WebSocket>(null);
  const peerConnections = useRef<PeerConnection>(new Map());
  const rtcPublisher = useRef(new EventTarget());

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

    rtcPublisher.current.dispatchEvent(
      new CustomEvent('message', { detail: message })
    );
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

      peerConnections.current.forEach((connection) => {
        const message = JSON.stringify(messageData);

        connection?.dataChannel?.send(message);
      });

      rtcPublisher.current.dispatchEvent(
        new CustomEvent('send', { detail: messageData })
      );
    } catch (error) {
      handleError(error);
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
      rtcPublisher.current.dispatchEvent(
        new CustomEvent('message', { detail: JSON.parse(event.data) })
      )
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

  // TODO: Check the logic, use better name
  function gotMessageFromServer(message: MessageEvent) {
    const signal = JSON.parse(message.data);
    const peerUuid = signal.uuid;

    // Ignore messages that are not for us or from ourselves
    if (
      peerUuid == localUuid.current ||
      (signal.dest != localUuid.current && signal.dest != 'all')
    )
      return;

    if (signal.displayName && signal.dest == 'all') {
      // set up peer connection object for a newcomer peer
      setUpPeer(peerUuid, signal.displayName);
      sendSignalingMessage(peerUuid, {
        displayName: localUuid.current,
        uuid: localUuid.current,
      });
    } else if (signal.displayName && signal.dest == localUuid.current) {
      // initiate call if we are the newcomer peer
      setUpPeer(peerUuid, signal.displayName, true);
      setIsEntered(true);
    } else if (signal.sdp) {
      peerConnections.current
        .get(peerUuid)
        ?.pc.setRemoteDescription(new RTCSessionDescription(signal.sdp))

        .then(() => {
          // Only create answers in response to offers
          if (signal.sdp.type == 'offer') {
            peerConnections.current
              .get(peerUuid)
              ?.pc.createAnswer()
              .then((description) => createdDescription(description, peerUuid))
              .catch((e) => handleError(e));
          }
        })
        .catch((e) => handleError(e));
    } else if (signal.ice) {
      peerConnections.current
        .get(peerUuid)
        ?.pc.addIceCandidate(new RTCIceCandidate(signal.ice))
        .catch((e) => handleError(e));
    }
  }

  // TODO: Remove avatar, rename name to displayName

  const enter = (displayName: string, userMetadata?: Metadata) => {
    // TODO: Fix this ignore

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
    rtcPublisher.current.dispatchEvent(
      new CustomEvent('error', { detail: error })
    );
  };

  const onMessage = (handler: (event: CustomEvent<Message>) => void) =>
    rtcPublisher.current.addEventListener('message', (event) => {
      if (isCustomEvent<Message>(event)) handler(event);
    });

  const onSend = (handler: (event: CustomEvent<Message>) => void) =>
    rtcPublisher.current.addEventListener('send', (event) => {
      if (isCustomEvent<Message>(event)) handler(event);
    });

  const onError = (handler: (event: CustomEvent<unknown>) => void) =>
    rtcPublisher.current.addEventListener('error', (event) => {
      if (isCustomEvent<unknown>(event)) handler(event);
    });

  useEffect(() => {
    signaling.current?.addEventListener('message', gotMessageFromServer);
    signaling.current?.addEventListener('open', handleSignalingOpen);

    return () => {
      signaling.current?.removeEventListener('message', gotMessageFromServer);
      signaling.current?.removeEventListener('open', handleSignalingOpen);
    };
  }, [signaling.current]);

  const rtcContext: ContextType = {
    send,
    state: { isEntered },
    disconnect,
    enter,
    onMessage,
    onSend,
    onError,
  };
  return (
    <RtcContext.Provider value={rtcContext}>{children}</RtcContext.Provider>
  );
};
