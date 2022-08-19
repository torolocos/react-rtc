import { useEffect } from 'react';
import { ConnectionState, type Signal, type DispatchEvent } from '../types';
import { useErrorHandler } from './useErrorHandler';
import { usePeers } from './usePeers';
import { useSignaling } from './useSignaling';

export const usePeerConnection = (
  localUuid: string,
  dispatchEvent: DispatchEvent,
  signalingServer: string,
  iceServers: { urls: string }[]
) => {
  const peerConnections = usePeers(dispatchEvent);
  const {
    sendSignalingMessage,
    signaling,
    connect: connectToSginaling,
    disconnect: disconnectFromSignaling,
  } = useSignaling(localUuid, signalingServer, dispatchEvent);
  const handleError = useErrorHandler(dispatchEvent);

  const connect = connectToSginaling;

  const disconnect = () => {
    disconnectFromSignaling();
    peerConnections.disconnect();
    dispatchEvent('leave');
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
      Object.defineProperty(peerConnections.get(peerUuid), 'dataChannel', {
        value: event.channel,
      })
    );

    peerConnection.addEventListener('connectionstatechange', () => {
      const peer = peerConnections.get(peerUuid);
      const isConnected = peer?.pc.connectionState === 'connected';

      if (isConnected && !initCall) dispatchEvent('peerConnected', peer);
    });

    dataChannel.addEventListener('open', () =>
      dispatchEvent('dataChannelOpen', peerUuid)
    );

    dataChannel.addEventListener('message', (event) =>
      dispatchEvent('receive', [peerUuid, event.data])
    );

    if (initCall) {
      peerConnection
        .createOffer()
        .then((description) => createdDescription(description, peerUuid))
        .catch((e) => handleError(e));
    }

    peerConnections.add(peerUuid, peerConnection, dataChannel);
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
      await peerConnections.get(peerUuid)?.pc.setLocalDescription(description);

      sendSignalingMessage(peerUuid, {
        sdp: peerConnections.get(peerUuid)?.pc.localDescription,
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
          const description = await peerConnections
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

    const currentPeerConnection = peerConnections.get(peerUuid)?.pc;

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
    const state = peerConnections.get(peerUuid)?.pc.iceConnectionState;
    const peer = peerConnections.get(peerUuid);

    if (
      peer &&
      (state === ConnectionState.FAILED ||
        state === ConnectionState.CLOSED ||
        state === ConnectionState.DISCONNECT)
    ) {
      peerConnections.remove(peerUuid);
      dispatchEvent('peerDisconnected', peer);
    }
  };

  useEffect(() => {
    signaling?.addEventListener('message', handleMessageFromServer);

    return () => {
      signaling?.removeEventListener('message', handleMessageFromServer);
    };
  }, [signaling]);

  return {
    connect,
    disconnect,
    sendToPeer: peerConnections.sendTo,
    sendToAllPeers: peerConnections.sendToAll,
  };
};
