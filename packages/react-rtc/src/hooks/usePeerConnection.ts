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

  const onIceCandidate = (event: RTCPeerConnectionIceEvent, peerId: string) => {
    if (event.candidate) sendSignalingMessage(peerId, { ice: event.candidate });
  };

  const addNewPeer = (peerId: string, initCall = false) => {
    const peerConnection = new RTCPeerConnection({ iceServers });
    const dataChannel = peerConnection.createDataChannel(crypto.randomUUID());

    peerConnection.addEventListener('icecandidate', (event) =>
      onIceCandidate(event, peerId)
    );

    peerConnection.addEventListener('iceconnectionstatechange', () =>
      checkPeerDisconnect(peerId)
    );

    peerConnection.addEventListener('datachannel', (event) => {
      Object.defineProperty(peerConnections.get(peerId), 'dataChannel', {
        value: event.channel,
      });

      dispatchEvent('dataChannel', peerId);
    });

    peerConnection.addEventListener('connectionstatechange', () => {
      const peer = peerConnections.get(peerId);
      const isConnected = peer?.peerConnection.connectionState === 'connected';

      if (isConnected && !initCall) dispatchEvent('peerConnected', peer.id);
    });

    dataChannel.addEventListener('message', (event) =>
      dispatchEvent('receive', [peerId, event.data])
    );

    if (initCall) {
      peerConnection
        .createOffer()
        .then((description) => createdDescription(description, peerId))
        .catch((e) => handleError(e));
    }

    peerConnections.add(peerId, peerConnection, dataChannel);
  };

  const sendSignalingMessageToNewcomers = (uuid: string) => {
    sendSignalingMessage(uuid, {
      id: localUuid,
      newPeer: true,
    });
  };

  const createdDescription = async (
    description: RTCSessionDescriptionInit,
    peerId: string
  ) => {
    try {
      await peerConnections
        .get(peerId)
        ?.peerConnection.setLocalDescription(description);

      sendSignalingMessage(peerId, {
        sdp: peerConnections.get(peerId)?.peerConnection.localDescription,
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
            .get(signal.id)
            ?.peerConnection.createAnswer();

          if (description) createdDescription(description, signal.id);
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
    const peerId = signal.id;
    const destination = signal.dest;
    const isSessionDescription = signal.sdp;
    const isIceCandidate = signal.ice;
    // Ignore messages that are not for us or from ourselves
    if (
      peerId == localUuid ||
      (destination != localUuid && destination != 'all')
    )
      return;

    const currentPeerConnection = peerConnections.get(peerId)?.peerConnection;

    if (currentPeerConnection) {
      if (isSessionDescription) {
        sendSessionWithDescription(currentPeerConnection, signal);
      } else if (isIceCandidate) {
        initIceCandidate(currentPeerConnection, signal);
      }
    }

    if (signal.newPeer) {
      const isNewcomer = destination === localUuid;
      addNewPeer(peerId, isNewcomer);
      if (isNewcomer) {
      } else {
        sendSignalingMessageToNewcomers(peerId);
      }
    }
  };

  const checkPeerDisconnect = (peerId: string) => {
    const state =
      peerConnections.get(peerId)?.peerConnection.iceConnectionState;
    const peer = peerConnections.get(peerId);

    if (
      peer &&
      (state === ConnectionState.FAILED ||
        state === ConnectionState.CLOSED ||
        state === ConnectionState.DISCONNECT)
    ) {
      peerConnections.remove(peerId);
      dispatchEvent('peerDisconnected', peer.id);
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
