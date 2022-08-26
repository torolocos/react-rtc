import { useEffect, useState, useRef, type FormEvent } from 'react';
import { type RtcEvent, useRtc } from '@torolocos/react-rtc';
import z from 'zod';

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

type Peer = z.infer<typeof Peer>;

const isMessage = (message: unknown): message is Message => {
  const { success } = Message.safeParse(message);

  return success;
};

const isPeer = (peer: unknown): peer is Peer => {
  const { success } = Peer.safeParse(peer);

  return success;
};

const generateUserName = () => {
  const toUpperCaseFirstCharacter = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  const filterDuplicities = (text?: string[] | null) =>
    Array.from(new Set(text)).join('');

  const name = crypto.randomUUID().match(/[a-z]/gm);

  return toUpperCaseFirstCharacter(filterDuplicities(name).slice(0, 6));
};

const Chat = () => {
  const { sendToPeer, sendToAllPeers, enter, leave, on, off, addTrack } =
    useRtc();
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string>();
  const [isConnected, setIsConnected] = useState(false);
  const [peers, setPeers] = useState<Peer[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const username = useRef(generateUserName());
  const mediaStream = useRef(new MediaStream());

  const getPeerUsername = (id: string) =>
    peers.find((peer) => peer.id === id)?.username;

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

    if (isPeer(data) && !peers.includes(data))
      setPeers((peersMap) => [...peersMap, { ...data, id: senderId }]);
  };

  const handleMessageSend = (event: RtcEvent<'send'>) => {
    const [to, data] = event.detail;
    const message = JSON.parse(data);

    if (isMessage(message))
      console.log(`Message: "${message.message}" to ${to} was delivered.`);
  };

  const handleEnter = () => setIsConnected(true);

  const handleLeave = () => setIsConnected(false);

  const handleError = () => setError('Something went wrong');

  const handleDataChannelOpen = (event: RtcEvent<'dataChannel'>) => {
    const id = event.detail;

    if (sendToPeer)
      sendToPeer(id, JSON.stringify({ id: '', username: username.current }));
  };

  const handleTrack = (event: RtcEvent<'track'>) => {
    if (videoRef.current) {
      mediaStream.current.addTrack(event.detail.track);
      videoRef.current.srcObject = mediaStream.current;
    }
  };

  const handleVideoClick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    if (addTrack)
      stream.getTracks().forEach((track) => addTrack(peers[0].id, track));
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
      <h1>Chat</h1>
      {error && <p>{error}</p>}
      <h2>Online: {peers.length}</h2>
      <button onClick={isConnected ? handleLeavePress : handleJoinPress}>
        {isConnected ? 'leave chat' : 'join'}
      </button>
      <ul>
        {peers.map(({ id }) => (
          <li key={id}>{id && getPeerUsername(id)}</li>
        ))}
      </ul>
      <hr />
      <video ref={videoRef} autoPlay={true} width="300" height="200"></video>
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
