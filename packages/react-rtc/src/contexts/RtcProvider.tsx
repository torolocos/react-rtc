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
  const { dispatchEvent, on, off } = usePubSub();
  const {
    disconnect: leave,
    connect: enter,
    sendTo,
    sendToAll,
    addTrackToConnection,
    addDataChannel,
  } = usePeerConnection(dispatchEvent, signalingServer, iceServers);

  return (
    <RtcContext.Provider
      value={{
        enter,
        leave,
        sendTo,
        sendToAll,
        on,
        off,
        addTrack: addTrackToConnection,
        addDataChannel,
      }}
    >
      {children}
    </RtcContext.Provider>
  );
};
