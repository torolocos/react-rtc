import { useEffect, useRef } from 'react';
import { ConnectionState, type Signal, type DispatchEvent } from '../types';
import { useErrorHandler } from './useErrorHandler';
import { useConnections } from './useConnections';
import { useSignaling } from './useSignaling';

export const usePeerConnection = (
  dispatchEvent: DispatchEvent,
  signalingServer: string,
  iceServers: { urls: string }[]
) => {
  const id = useRef(crypto.randomUUID());
  const peers = useConnections(dispatchEvent);
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
    peers.disconnect();
    dispatchEvent('leave');
  };

  const addNewPeer = async (peerId: string) => {
    const peerConnection = new RTCPeerConnection({ iceServers });
    const dataChannel = peerConnection.createDataChannel(crypto.randomUUID());

    peers.add(peerId, peerConnection, dataChannel);

    peerConnection.addEventListener('icecandidate', (event) => {
      if (event.candidate) send(peerId, { ice: event.candidate });
    });

    peerConnection.addEventListener('iceconnectionstatechange', () =>
      checkPeerDisconnect(peerId)
    );

    peerConnection.addEventListener('datachannel', (event) => {
      Object.defineProperty(peers.get(peerId), 'dataChannel', {
        value: event.channel,
      });

      dispatchEvent('dataChannel', peerId);
    });

    peerConnection.addEventListener('connectionstatechange', () => {
      const peer = peers.get(peerId);
      const isConnected = peer?.peerConnection.connectionState === 'connected';

      if (isConnected) dispatchEvent('peerConnected', peer.id);
    });

    peerConnection.addEventListener('track', (event) =>
      dispatchEvent('track', [peerId, event.track])
    );

    peerConnection.addEventListener('negotiationneeded', async (event) => {
      const target = event.target;

      if (!(target instanceof RTCPeerConnection)) return;

      try {
        await target.createOffer();
        await target.setLocalDescription();
        send(peerId, { sdp: peerConnection.localDescription });
      } catch (error) {
        dispatchEvent('error', error);
      }
    });

    dataChannel.addEventListener('message', (event) =>
      dispatchEvent('receive', [peerId, event.data])
    );
  };

  const sendAnswer = async (peerId: string, sdp: RTCSessionDescriptionInit) => {
    const peer = peers.get(peerId);

    if (!peer) return;
    try {
      await peer.peerConnection.setRemoteDescription(
        new RTCSessionDescription(sdp)
      );

      if (sdp.type == 'offer') {
        await peer.peerConnection.setLocalDescription();
        send(peerId, { sdp: peer.peerConnection.localDescription });
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

  const handleMessage = (message: MessageEvent) => {
    try {
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

      const peerConnection = peers.get(peerId)?.peerConnection;

      if (peerConnection) {
        if (!!sdp) sendAnswer(peerId, sdp);
        if (!!ice) initIceCandidate(peerConnection, signal);
      } else {
        addNewPeer(peerId);
        send(peerId, { id });
      }
    } catch (error) {
      dispatchEvent('error', error);
    }
  };

  const checkPeerDisconnect = (peerId: string) => {
    const peerConnection = peers.get(peerId)?.peerConnection;
    const state = peerConnection?.iceConnectionState;

    if (
      state === ConnectionState.FAILED ||
      state === ConnectionState.CLOSED ||
      state === ConnectionState.DISCONNECT
    ) {
      peers.remove(peerId);
      dispatchEvent('peerDisconnected', peerId);
    }
  };

  useEffect(() => {
    signaling?.addEventListener('message', handleMessage);

    return () => {
      signaling?.removeEventListener('message', handleMessage);
    };
  }, [signaling]);

  return {
    connect,
    disconnect,
    sendToPeer: peers.sendTo,
    sendToAllPeers: peers.sendToAll,
    addTrack: peers.addTrack,
  };
};
