import { useEffect, useRef } from 'react';
import { ConnectionState, type Signal, type DispatchEvent } from '../types';
import { useErrorHandler } from './useErrorHandler';
import { useConnection } from './useConnection';
import { useSignaling } from './useSignaling';

export const usePeerConnection = (
  dispatchEvent: DispatchEvent,
  signalingServer: string,
  iceServers: { urls: string }[]
) => {
  const id = useRef(crypto.randomUUID());
  const {
    add: addConnection,
    get: getConnection,
    remove: removeConnection,
    closeAll: closeAllConnections,
    sendTo: sendToPeer,
    sendToAll: sendToAllPeers,
    addTrack: addTrackToConnection,
  } = useConnection(dispatchEvent);
  const {
    send: sendToSignaling,
    connect: connectToSginaling,
    disconnect: disconnectFromSignaling,
    signaling,
  } = useSignaling(id.current, signalingServer, dispatchEvent);
  const handleError = useErrorHandler(dispatchEvent);

  const connect = connectToSginaling;

  const disconnect = () => {
    disconnectFromSignaling();
    closeAllConnections();
    dispatchEvent('leave');
  };

  const createConnection = async (peerId: string) => {
    const peerConnection = new RTCPeerConnection({ iceServers });
    const dataChannel = peerConnection.createDataChannel(crypto.randomUUID());

    addConnection(peerId, peerConnection, dataChannel);

    peerConnection.addEventListener('icecandidate', (event) => {
      if (event.candidate) sendToSignaling(peerId, { ice: event.candidate });
    });

    peerConnection.addEventListener('iceconnectionstatechange', () =>
      checkPeerDisconnect(peerId)
    );

    peerConnection.addEventListener('datachannel', (event) => {
      Object.defineProperty(getConnection(peerId), 'dataChannel', {
        value: event.channel,
      });

      dispatchEvent('dataChannel', peerId);
    });

    peerConnection.addEventListener('connectionstatechange', () => {
      const peer = getConnection(peerId);
      const isConnected = peer?.peerConnection.connectionState === 'connected';

      if (isConnected) dispatchEvent('peerConnected', peer.id);
    });

    peerConnection.addEventListener('track', (event) =>
      dispatchEvent('track', [peerId, event.track])
    );

    peerConnection.addEventListener('negotiationneeded', async (event) => {
      if (!(event.target instanceof RTCPeerConnection)) return;

      try {
        const target = event.target;

        await target.createOffer();
        await target.setLocalDescription();
        sendToSignaling(peerId, { sdp: peerConnection.localDescription });
      } catch (error) {
        dispatchEvent('error', error);
      }
    });

    dataChannel.addEventListener('message', (event) =>
      dispatchEvent('receive', [peerId, event.data])
    );
  };

  const sendAnswer = async (id: string, sdp: RTCSessionDescriptionInit) => {
    const connection = getConnection(id);

    if (!connection) return;
    try {
      await connection.peerConnection.setRemoteDescription(
        new RTCSessionDescription(sdp)
      );

      if (sdp.type == 'offer') {
        await connection.peerConnection.setLocalDescription();
        sendToSignaling(id, {
          sdp: connection.peerConnection.localDescription,
        });
      }
    } catch (error) {
      handleError(error);
    }
  };

  const initIceCandidate = async (
    peerConnection: RTCPeerConnection,
    ice: RTCIceCandidateInit
  ) => {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(ice));
    } catch (error) {
      handleError(error);
    }
  };

  const handleSignalingMessage = async (message: MessageEvent) => {
    try {
      const {
        id: peerId,
        destination,
        data: { sdp, ice },
      }: Signal = JSON.parse(message.data);
      const isMySignal =
        peerId == id.current ||
        (destination != id.current && destination != 'all');

      if (isMySignal) return;

      const peerConnection = getConnection(peerId)?.peerConnection;

      if (peerConnection) {
        if (!!sdp) await sendAnswer(peerId, sdp);
        if (!!ice) await initIceCandidate(peerConnection, ice);
      } else {
        await createConnection(peerId);
        sendToSignaling(peerId, { id });
      }
    } catch (error) {
      dispatchEvent('error', error);
    }
  };

  const checkPeerDisconnect = (id: string) => {
    const peerConnection = getConnection(id)?.peerConnection;
    const state = peerConnection?.iceConnectionState;

    if (
      state === ConnectionState.FAILED ||
      state === ConnectionState.CLOSED ||
      state === ConnectionState.DISCONNECT
    ) {
      removeConnection(id);
      dispatchEvent('peerDisconnected', id);
    }
  };

  useEffect(() => {
    signaling?.addEventListener('message', handleSignalingMessage);

    return () => {
      signaling?.removeEventListener('message', handleSignalingMessage);
    };
  }, [signaling]);

  return {
    connect,
    disconnect,
    sendTo: sendToPeer,
    sendToAll: sendToAllPeers,
    addTrackToConnection,
  };
};
