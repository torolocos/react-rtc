import { useEffect, useState, useRef, type FormEvent } from 'react';
import { type RtcEvent, useRtc } from '@torolocos/react-rtc';
import z from 'zod';
import Stream from './Stream';
import { generateUserName } from '../utils';

const Message = z.object({
  id: z.string(),
  senderId: z.string(),
  message: z.string(),
});

const Peer = z.object({
  id: z.nullable(z.string()),
  username: z.string(),
});

type Message = z.infer<typeof Message>;
type Peer = z.infer<typeof Peer> & { stream: MediaStream };

const isMessage = (message: unknown): message is Message => {
  const { success } = Message.safeParse(message);

  return success;
};

const isPeer = (peer: unknown): peer is Peer => {
  const { success } = Peer.safeParse(peer);

  return success;
};

const Chat = () => {
  const { sendToPeer, sendToAllPeers, enter, leave, on, off, addTrack } =
    useRtc();
  const [messages, setMessages] = useState<Message[]>([]);
  const [connections, setConnections] = useState<Peer[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const username = useRef(generateUserName());

  const getPeerUsername = (id: string) =>
    connections.find((peer) => peer.id === id)?.username;

  const addPeer = (id: string, username: string) =>
    setConnections((currentPeers) => [
      ...currentPeers,
      { id, username, stream: new MediaStream() },
    ]);

  const handleJoinPress = () => {
    if (enter) enter();
  };

  const handleLeavePress = () => {
    if (leave) leave();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const message = inputRef.current?.value;

    if (message) {
      const data = {
        id: crypto.randomUUID(),
        senderId: '',
        message,
      };

      if (sendToAllPeers) sendToAllPeers(JSON.stringify(data));

      setMessages((currentMessages) => [...currentMessages, data]);
      inputRef.current.value = '';
    }
  };

  const handleMessageReceived = (event: RtcEvent<'receive'>) => {
    const [senderId, payload] = event.detail;
    const data = JSON.parse(payload);

    if (isMessage(data))
      setMessages((currentMessages) => [
        ...currentMessages,
        { ...data, senderId },
      ]);

    if (isPeer(data) && !connections.includes(data))
      addPeer(senderId, data.username);
  };

  const handleMessageSend = (event: RtcEvent<'send'>) => {
    const [to, data] = event.detail;
    const message = JSON.parse(data);

    if (isMessage(message))
      console.log(`Message: "${message.message}" to ${to} was delivered.`);
  };

  const handleEnter = () => setIsConnected(true);

  const handleLeave = () => setIsConnected(false);

  const handleError = (error: RtcEvent<'error'>) => console.error(error.detail);

  const handleDataChannelOpen = (event: RtcEvent<'dataChannel'>) => {
    const id = event.detail;

    if (sendToPeer)
      sendToPeer(id, JSON.stringify({ id: '', username: username.current }));
  };

  const handleTrack = (event: RtcEvent<'track'>) => {
    const [peerId, track] = event.detail;

    setConnections((currentPeers) => {
      const peerToAddTrack = currentPeers.find(({ id }) => id === peerId);

      if (peerToAddTrack) {
        const index = currentPeers.indexOf(peerToAddTrack);

        currentPeers[index].stream.addTrack(track);
      }

      return currentPeers;
    });
  };

  const handleVideoClick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const tracks = stream.getTracks();

    if (addTrack)
      connections.forEach(({ id }) => {
        if (id) tracks.forEach((track) => addTrack(id, track));
      });
  };

  useEffect(() => {
    if (on) {
      on('receive', handleMessageReceived);
      on('send', handleMessageSend);
      on('enter', handleEnter);
      on('leave', handleLeave);
      on('dataChannel', handleDataChannelOpen);
      on('error', handleError);
      on('track', handleTrack);
    }

    return () => {
      if (off) {
        off('receive', handleMessageReceived);
        off('send', handleMessageSend);
        off('enter', handleEnter);
        off('enter', handleLeave);
        off('dataChannel', handleDataChannelOpen);
        off('error', handleError);
        off('track', handleTrack);
      }
      if (leave) leave();
    };
  }, []);

  return (
    <main>
      <h1>Chat - Hello {username.current}!</h1>
      <h2>Online: {connections.length}</h2>
      <button onClick={isConnected ? handleLeavePress : handleJoinPress}>
        {isConnected ? 'leave chat' : 'join'}
      </button>
      <ul>
        {connections.map(({ id }) => (
          <li key={id}>{id && getPeerUsername(id)}</li>
        ))}
      </ul>
      <hr />
      <div>
        {connections.map(({ id, username, stream }) => (
          <Stream key={id} stream={stream} username={username} />
        ))}
      </div>
      <hr />
      <section>
        {messages?.map(({ id, senderId, message }) => (
          <div key={id}>
            {getPeerUsername(senderId) || 'You'}: {message}
          </div>
        ))}
      </section>
      {isConnected && (
        <>
          <hr />
          <form onSubmit={handleSubmit}>
            <input type="text" ref={inputRef} />
            <input type="submit" value="send" />
          </form>
          <button onClick={handleVideoClick}>Video</button>
        </>
      )}
    </main>
  );
};

export default Chat;
