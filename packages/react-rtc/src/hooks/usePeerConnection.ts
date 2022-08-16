import { useEffect } from 'react';
import Message from '../models/Message';
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
  const peerConnections = usePeers();
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

  const addNewPeer = (peerId: string, initCall = false) => {
    const peerConnection = new RTCPeerConnection({ iceServers });
    const dataChannel = peerConnection.createDataChannel(crypto.randomUUID());

    peerConnection.addEventListener('icecandidate', (event) =>
      onIceCandidate(event, peerId)
    );
    peerConnection.addEventListener('iceconnectionstatechange', () =>
      checkPeerDisconnect(peerId)
    );
    peerConnection.addEventListener('datachannel', (event) =>
      Object.defineProperty(peerConnections.get(peerId), 'dataChannel', {
        value: event.channel,
      })
    );
    peerConnection.addEventListener('connectionstatechange', () => {
      const peer = peerConnections.get(peerId);
      if (
        peer &&
        peer.peerConnection.connectionState === 'connected' &&
        !initCall
      )
        dispatchEvent('peerConnected', peer.id);
    });

    dataChannel.addEventListener('message', (event) => {
      try {
        const message = new Message(JSON.parse(event.data));

        dispatchEvent('receive', message);
      } catch (error) {
        dispatchEvent('error', error);
      }
    });

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
      newPeer: true,
      uuid: localUuid,
    });
  };

  const createdDescription = async (
    description: RTCSessionDescriptionInit,
    peerUuid: string
  ) => {
    try {
      await peerConnections
        .get(peerUuid)
        ?.peerConnection.setLocalDescription(description);

      sendSignalingMessage(peerUuid, {
        sdp: peerConnections.get(peerUuid)?.peerConnection.localDescription,
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
            ?.peerConnection.createAnswer();

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

    const currentPeerConnection = peerConnections.get(peerUuid)?.peerConnection;

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
    const state =
      peerConnections.get(peerUuid)?.peerConnection.iceConnectionState;
    const peer = peerConnections.get(peerUuid);

    if (
      peer &&
      (state === ConnectionState.FAILED ||
        state === ConnectionState.CLOSED ||
        state === ConnectionState.DISCONNECT)
    ) {
      peerConnections.remove(peerUuid);
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
    peerConnections,
    connect,
    disconnect,
  };
};
