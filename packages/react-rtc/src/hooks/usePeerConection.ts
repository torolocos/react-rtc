import { useRef } from 'react';
import { ConnectionState, Peer, Signal } from '../types';
import { usePubSub } from './usePubSub';
import { useSignaling } from './useSignaling';

export const usePeerConnection = (
  iceServers: { urls: string }[],
  handleError: (e: Error) => void
) => {
  const peerConnections = useRef<Map<string, Peer>>(new Map());
  const { dispatchEvent } = usePubSub();
  const localUuid = useRef(crypto.randomUUID());
  const { sendSignalingMessage } = useSignaling(localUuid.current);

  const initIceCandidate = (
    peerConnection: RTCPeerConnection,
    signal: Signal
  ) => {
    peerConnection
      .addIceCandidate(new RTCIceCandidate(signal.ice))
      .catch((e) => handleError(e));
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
      dispatchEvent('peerDisconnected', peer);
      peerConnections.current.delete(peerUuid);
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

  function gotIceCandidate(event: RTCPeerConnectionIceEvent, peerUuid: string) {
    if (event.candidate != null) {
      sendSignalingMessage(peerUuid, { ice: event.candidate });
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
        // TODO: Add error handlerer
        .catch((e) => handleError(e));
    }

    peerConnections.current.set(peerUuid, {
      displayName,
      pc: peerConnection,
      dataChannel,
    });
    // setIsEntered(true); // this will be probably removed
  }
  return { peerConnections, setUpPeer, initIceCandidate };
};
