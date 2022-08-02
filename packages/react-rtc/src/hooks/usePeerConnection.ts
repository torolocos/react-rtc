import { useEffect, useRef } from 'react';
import Peer from '../models/Peer';
import { type Signal, ConnectionState, type EventsDetail } from '../types';
import { useSignaling } from './useSignaling';

export const usePeerConnection = (
  localUuid: string,
  dispatchEvent: <Type extends keyof EventsDetail>(
    type: Type,
    detail: EventsDetail[Type]
  ) => boolean,
  signalingServer: string,
  iceServers: { urls: string }[],
  handleError: (e: unknown) => void
) => {
  const peerConnections = useRef<Map<string, Peer>>(new Map());
  const {
    sendSignalingMessage,
    signaling,
    connect: connectToSginaling,
    disconnect: disconnectFromSignaling,
  } = useSignaling(localUuid, signalingServer);

  const connect = connectToSginaling;

  const disconnect = () => {
    disconnectFromSignaling();
    peerConnections.current.forEach((connection) => connection.pc.close());
  };

  const onIceCandidate = (
    event: RTCPeerConnectionIceEvent,
    peerUuid: string
  ) => {
    if (event.candidate)
      sendSignalingMessage(peerUuid, { ice: event.candidate });
  };

  const addNewPeer = (peerUuid: string, initCall = false) => {
    const peerConnection = new RTCPeerConnection({ iceServers });
    const dataChannel = peerConnection.createDataChannel(crypto.randomUUID());

    peerConnection.addEventListener('icecandidate', (event) =>
      onIceCandidate(event, peerUuid)
    );
    peerConnection.addEventListener('iceconnectionstatechange', () =>
      checkPeerDisconnect(peerUuid)
    );
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
      new Peer({ uuid: peerUuid, peerConnection, dataChannel })
    );
  };

  const sendSignalingMessageToNewcomers = (uuid: string) => {
    sendSignalingMessage(uuid, {
      newPeer: true,
      uuid: localUuid,
    });
  };

  const createdDescription = async (
    description: RTCSessionDescriptionInit,
    peerUuid: string
  ) => {
    try {
      await peerConnections.current
        .get(peerUuid)
        ?.pc.setLocalDescription(description);

      sendSignalingMessage(peerUuid, {
        sdp: peerConnections.current.get(peerUuid)?.pc.localDescription,
      });
    } catch (error) {
      handleError(error);
    }
  };

  const sendSessionWithDescription = async (
    peerConnection: RTCPeerConnection,
    signal: Signal
  ) => {
    if (signal.sdp) {
      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(signal.sdp)
        );
        // Only create answers in response to offers
        if (signal.sdp?.type == 'offer') {
          const description = await peerConnections.current
            .get(signal.uuid)
            ?.pc.createAnswer();

          if (description) createdDescription(description, signal.uuid);
        }
      } catch (error) {
        handleError(error);
      }
    }
  };

  const initIceCandidate = async (
    peerConnection: RTCPeerConnection,
    signal: Signal
  ) => {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice));
    } catch (error) {
      handleError(error);
    }
  };

  const handleMessageFromServer = (message: MessageEvent) => {
    const signal: Signal = JSON.parse(message.data);
    const peerUuid = signal.uuid;
    const destination = signal.dest;
    const isSessionDescription = signal.sdp;
    const isIceCandidate = signal.ice;
    // Ignore messages that are not for us or from ourselves
    if (
      peerUuid == localUuid ||
      (destination != localUuid && destination != 'all')
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
      const isNewcomer = destination === localUuid;
      addNewPeer(peerUuid, isNewcomer);
      if (isNewcomer) {
      } else {
        sendSignalingMessageToNewcomers(peerUuid);
      }
    }
  };

  const checkPeerDisconnect = (peerUuid: string) => {
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
  };

  useEffect(() => {
    signaling?.addEventListener('message', handleMessageFromServer);

    return () => {
      signaling?.removeEventListener('message', handleMessageFromServer);
    };
  }, [signaling]);

  return {
    peerConnections,
    connect,
    disconnect,
  };
};
