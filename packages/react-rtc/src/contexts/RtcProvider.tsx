import { useRef } from 'react';
import { RtcContext } from './RtcContext';
import { usePubSub } from '../hooks/usePubSub';
import { usePeerConnection } from '../hooks/usePeerConnection';

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
  const localUuid = useRef(crypto.randomUUID());
  const { dispatchEvent, on, off } = usePubSub();
  const {
    disconnect: leave,
    connect: enter,
    sendToPeer,
    sendToAllPeers,
    addTrack,
  } = usePeerConnection(
    localUuid.current,
    dispatchEvent,
    signalingServer,
    iceServers
  );

  return (
    <RtcContext.Provider
      value={{
        enter,
        leave,
        sendToPeer,
        sendToAllPeers,
        on,
        off,
        addTrack,
      }}
    >
      {children}
    </RtcContext.Provider>
  );
};
