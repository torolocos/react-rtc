import type { FC, ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { type RtcEvent, useRtc } from '@torolocos/react-rtc';
import { Message, Peer } from '../types';
import { useUser } from 'src/features/auth/contexts/user';

interface ContextValue {
  handleLeavePress: () => void;
  handleJoinPress: (username: string) => void;
  peers: Peer[];
  isConnected: boolean;
  startStream: () => void;
}

export const ChatContext = createContext<ContextValue>({
  handleLeavePress: () => {},
  handleJoinPress: () => {},
  peers: [],
  isConnected: false,
  startStream: () => {},
});

export const ChatContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { sendTo, enter, leave, on, off, addTrack } = useRtc();
  const [peers, setPeers] = useState<Peer[]>([]);
  const [, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);
  // const username = Math.random();

  useEffect(() => {
    if (isConnected) startStream();
  }, [isConnected]);
  const handleJoinPress = (name: string) => {
    setUsername(name);
    if (enter) enter();
  };

  const handleLeavePress = () => {
    if (leave) leave();
  };

  const addPeer = (id: string, username: string) =>
    setPeers((currentPeers) => [
      ...currentPeers,
      { id, username, stream: new MediaStream() },
    ]);

  const handleMessageReceived = (event: RtcEvent<'receive'>) => {
    const [senderId, payload] = event.detail;
    const data = JSON.parse(payload);

    setMessages((currentMessages) => [
      ...currentMessages,
      { ...data, senderId },
    ]);
    console.log({ data });
    if (!peers.includes(data)) addPeer(senderId, data.username);
  };

  const handleMessageSend = (event: RtcEvent<'send'>) => {
    const [to, data] = event.detail;
    const message = JSON.parse(data);

    console.log(`Message: "${message.message}" to ${to} was delivered.`);
  };

  const handleDataChannelOpen = (event: RtcEvent<'dataChannel'>) => {
    const id = event.detail;
    if (sendTo) sendTo(id, JSON.stringify({ id: '', username: username }));
  };

  const handleTrack = (event: RtcEvent<'track'>) => {
    const [peerId, track] = event.detail;

    setPeers((currentPeers) => {
      const peerToAddTrack = currentPeers.find(({ id }) => id === peerId);

      if (peerToAddTrack) {
        const index = currentPeers.indexOf(peerToAddTrack);

        currentPeers[index].stream.addTrack(track);
      }

      return currentPeers;
    });
  };

  const startStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const tracks = stream.getTracks();

    if (addTrack)
      peers.forEach(({ id }) => {
        if (id) tracks.forEach((track) => addTrack(id, track));
      });
  };

  const handleEnter = () => {
    // startStream();
    setIsConnected(true);
  };

  const handleLeave = () => setIsConnected(false);

  const handleError = (error: RtcEvent<'error'>) => console.error(error.detail);

  useEffect(() => {
    if (on) {
      on('send', handleMessageSend);
      on('receive', handleMessageReceived);
      on('enter', handleEnter);
      on('leave', handleLeave);
      on('dataChannel', handleDataChannelOpen);
      on('error', handleError);
      on('track', handleTrack);
    }

    return () => {
      if (off) {
        off('receive', handleMessageReceived);
        off('enter', handleEnter);
        off('send', handleMessageSend);
        off('leave', handleLeave);
        off('error', handleError);
        off('track', handleTrack);
      }
      if (leave) leave();
    };
  }, []);

  const value = {
    handleLeavePress,
    handleJoinPress,
    peers,
    isConnected,
    startStream,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error('useChat must be used within ChatContextProvider');
  }

  return context;
};
