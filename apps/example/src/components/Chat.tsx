import { useEffect, useState, useRef } from 'react';
import { type RtcEvent, useRtc } from '@torolocos/react-rtc';
import './styles.css';

interface Message {
  id: string;
  from: string;
  message: string;
}

interface Peer {
  username: string;
}

const isMessage = (message: unknown): message is Message =>
  typeof message === 'object' &&
  !!message &&
  'id' in message &&
  'message' in message;

const Chat = () => {
  const { sendToPeer, sendToAllPeers, enter, leave, on, off } = useRtc();
  const [inputValue, setInputValue] = useState('');
  const [messageData, setMessageData] = useState<Message[]>([]);
  const [error, setError] = useState('');
  const [isChatOpen, setChatOpen] = useState(false);
  const peer = useRef({ username: Math.random().toPrecision(4).toString() });
  const [peers, setPeers] = useState(new Map<string, Peer>());

  const getPeerUsername = (id: string) => peers.get(id)?.username;

  const onStartChat = () => {
    if (enter) enter();
  };

  const onEndChat = () => {
    if (leave) leave();
  };

  const onMessageSend = () => {
    const message = {
      id: crypto.randomUUID(),
      message: inputValue,
    };

    if (sendToAllPeers) sendToAllPeers(JSON.stringify(message));
    setMessageData((messages) => {
      return [...messages, { ...message, from: peer.current.username }];
    });

    setInputValue('');
  };

  const handleMessageReceived = (event: RtcEvent<'receive'>) => {
    const [from, data] = event.detail;
    const message = JSON.parse(data);

    if (!isMessage(message)) {
      if (!peers.has(from)) setPeers((peersMap) => peersMap.set(from, message));
      else if (sendToPeer) sendToPeer(from, peer.current.username);
    } else {
      setMessageData((messages) => [...messages, { ...message, from }]);
    }
  };

  const handleMessageSent = (event: RtcEvent<'send'>) => {
    const [to, data] = event.detail;
    const message = JSON.parse(data);

    if (isMessage(message))
      console.log(
        `Message: "${message.message}" to ${getPeerUsername(to)} was delivered.`
      );
  };

  const handleEnter = () => setChatOpen(true);

  const handleLeave = () => setChatOpen(false);

  const handleError = () => setError('Err');

  const handleDataChannelOpen = (event: RtcEvent<'dataChannel'>) => {
    const id = event.detail;

    if (sendToPeer)
      sendToPeer(id, JSON.stringify({ username: peer.current.username }));
  };

  useEffect(() => {
    if (on) {
      on('receive', handleMessageReceived);
      on('send', handleMessageSent);
      on('enter', handleEnter);
      on('leave', handleLeave);
      on('dataChannel', handleDataChannelOpen);
      on('error', handleError);
    }

    return () => {
      if (off) {
        off('receive', handleMessageReceived);
        off('send', handleMessageSent);
        off('enter', handleEnter);
        off('enter', handleLeave);
        off('dataChannel', handleDataChannelOpen);
        off('error', handleError);
      }
      if (leave) leave();
    };
  }, []);

  return (
    <>
      <h2>Chat</h2>
      {error && <div className="errorText">Something went wrong</div>}
      <p>Peers connected: {peers.size}</p>
      <div>
        {messageData?.map(({ id, from, message }) => (
          <div key={id}>
            {getPeerUsername(from) || from}: {message}
          </div>
        ))}
      </div>
      {isChatOpen && (
        <>
          <input
            value={inputValue}
            onChange={({ target: { value } }) => setInputValue(value)}
          />
          <button onClick={onMessageSend}>send</button>
        </>
      )}
      <button onClick={!isChatOpen ? onStartChat : onEndChat}>
        {!isChatOpen ? 'join' : 'leave chat'}
      </button>
    </>
  );
};

export default Chat;
