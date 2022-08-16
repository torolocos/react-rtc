import { useRef } from 'react';
import { RtcContext } from './RtcContext';
import { usePubSub } from '../hooks/usePubSub';
import { usePeerConnection } from '../hooks/usePeerConnection';
import { useMessaging } from '../hooks/useMessaging';

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
  const localId = useRef(crypto.randomUUID());
  const { dispatchEvent, on, off } = usePubSub();
  const {
    peerConnections,
    disconnect: leave,
    connect: enter,
  } = usePeerConnection(
    localId.current,
    dispatchEvent,
    signalingServer,
    iceServers
  );
  const { send } = useMessaging(
    localId.current,
    peerConnections.sendToAll,
    dispatchEvent
  );

  return (
    <RtcContext.Provider
      value={{
        enter,
        leave,
        send,
        getAllPeers: peerConnections.getAll,
        on,
        off,
      }}
    >
      {children}
    </RtcContext.Provider>
  );
};
