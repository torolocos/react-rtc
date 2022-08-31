import { useEffect, useRef } from 'react';
import { ConnectionState, type Signal, type DispatchEvent } from '../types';
import { useErrorHandler } from './useErrorHandler';
import { usePeers } from './usePeers';
import { useSignaling } from './useSignaling';

export const usePeerConnection = (
  dispatchEvent: DispatchEvent,
  signalingServer: string,
  iceServers: { urls: string }[]
) => {
  const id = useRef(crypto.randomUUID());
  const peerConnections = usePeers(dispatchEvent);
  const {
    send,
    signaling,
    connect: connectToSginaling,
    disconnect: disconnectFromSignaling,
  } = useSignaling(id.current, signalingServer, dispatchEvent);
  const handleError = useErrorHandler(dispatchEvent);

  const connect = connectToSginaling;

  const disconnect = () => {
    disconnectFromSignaling();
    peerConnections.disconnect();
    dispatchEvent('leave');
  };

  const addNewPeer = (peerId: string, initCall = false) => {
    const peerConnection = new RTCPeerConnection({ iceServers });
    const dataChannel = peerConnection.createDataChannel(crypto.randomUUID());

    peerConnection.addEventListener('icecandidate', (event) => {
      if (event.candidate) send(peerId, { ice: event.candidate });
    });

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
        .then((description) => createdDescription(peerId, description))
        .catch((e) => handleError(e));
    }

    peerConnections.add(peerId, peerConnection, dataChannel);
  };

  const createdDescription = async (
    peerId: string,
    description: RTCSessionDescriptionInit
  ) => {
    try {
      await peerConnections
        .get(peerId)
        ?.peerConnection.setLocalDescription(description);

      const sessionDescription =
        peerConnections.get(peerId)?.peerConnection.localDescription;

      if (sessionDescription) send(peerId, { sdp: sessionDescription });
    } catch (error) {
      handleError(error);
    }
  };

  const sendSessionWithDescription = async (
    peerId: string,
    peerConnection: RTCPeerConnection,
    sdp: RTCSessionDescriptionInit
  ) => {
    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));

      if (sdp.type == 'offer') {
        const answer = await peerConnections
          .get(peerId)
          ?.peerConnection.createAnswer();

        if (answer) createdDescription(peerId, answer);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const initIceCandidate = async (
    peerConnection: RTCPeerConnection,
    signal: Signal
  ) => {
    try {
      await peerConnection.addIceCandidate(
        new RTCIceCandidate(signal.data.ice)
      );
    } catch (error) {
      handleError(error);
    }
  };

  const handleMessageFromServer = (message: MessageEvent) => {
    const signal: Signal = JSON.parse(message.data);
    const {
      id: peerId,
      destination,
      data: { sdp, ice },
    } = signal;
    const isMySignal =
      peerId == id.current ||
      (destination != id.current && destination != 'all');

    if (isMySignal) return;

    const peerConnection = peerConnections.get(peerId)?.peerConnection;

    if (peerConnection) {
      if (!!sdp) sendSessionWithDescription(peerId, peerConnection, sdp);
      if (!!ice) initIceCandidate(peerConnection, signal);
    } else {
      const isNewcomer = destination === id.current;

      addNewPeer(peerId, isNewcomer);

      if (!isNewcomer) send(peerId, { id });
    }
  };

  const checkPeerDisconnect = (peerId: string) => {
    const peerConnection = peerConnections.get(peerId)?.peerConnection;
    const state = peerConnection?.iceConnectionState;

    if (
      state === ConnectionState.FAILED ||
      state === ConnectionState.CLOSED ||
      state === ConnectionState.DISCONNECT
    ) {
      peerConnections.remove(peerId);
      dispatchEvent('peerDisconnected', peerId);
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
