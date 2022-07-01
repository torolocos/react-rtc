import { useEffect, useRef } from 'react';
import Peer from '../models/Peer';
import { type Signal, ConnectionState, type EventsDetail } from '../types';
import { useSignaling } from './useSignaling';

export const usePeerConnection = (
  dispatchEvent: <Type extends keyof EventsDetail>(
    type: Type,
    detail: EventsDetail[Type]
  ) => boolean,
  signalingServer: string,
  iceServers: { urls: string }[],
  handleError: (e: Error) => void
) => {
  const localUuid = useRef(crypto.randomUUID());
  const peerConnections = useRef<Map<string, Peer>>(new Map());
  const { sendSignalingMessage, signaling, onConnect, onDisconnect } =
    useSignaling(localUuid.current, signalingServer, peerConnections);

  function gotIceCandidate(event: RTCPeerConnectionIceEvent, peerUuid: string) {
    if (event.candidate != null) {
      sendSignalingMessage(peerUuid, { ice: event.candidate });
    }
  }

  function setUpPeer(peerUuid: string, displayName: string, initCall = false) {
    const peerConnection = new RTCPeerConnection({ iceServers });
    const dataChannel = peerConnection.createDataChannel(crypto.randomUUID());

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
        dispatchEvent('peerConnected', peer);
    });

    // TODO: Parse message outside, add try catch, use addMessageData
    dataChannel.addEventListener('message', (event) =>
      dispatchEvent('message', JSON.parse(event.data))
    );

    if (initCall) {
      peerConnection
        .createOffer()
        .then((description) => createdDescription(description, peerUuid))
        .catch((e) => handleError(e));
    }

    peerConnections.current.set(
      peerUuid,
      new Peer({ peerConnection, dataChannel, displayName })
    );
  }

  const sendSignalingMessageToNewcomers = (uuid: string) => {
    sendSignalingMessage(uuid, {
      newPeer: true, // not sure if this is correct
      uuid: localUuid.current,
    });
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

    if (signal.newPeer) {
      const isNewcomer = destination === localUuid.current;
      setUpPeer(peerUuid, peerDisplayName, isNewcomer);
      if (isNewcomer) {
      } else {
        sendSignalingMessageToNewcomers(peerUuid);
      }
    }
  }

  function checkPeerDisconnect(peerUuid: string) {
    const state = peerConnections.current.get(peerUuid)?.pc.iceConnectionState;
    const peer = peerConnections.current.get(peerUuid);

    if (
      peer &&
      (state === ConnectionState.FAILED ||
        state === ConnectionState.CLOSED ||
        state === ConnectionState.DISCONNECT)
    ) {
      dispatchEvent('peerDisconnected', peer);
      peerConnections.current.delete(peerUuid);
    }
  }

  useEffect(() => {
    signaling.current?.addEventListener('message', handleMessageFromServer);

    return () => {
      signaling.current?.removeEventListener(
        'message',
        handleMessageFromServer
      );
    };
  }, [signaling.current]);

  return {
    peerConnections,
    onConnect,
    onDisconnect,
    id: localUuid.current,
  };
};
