import { useEffect, useState, useRef } from 'react';
import { type RtcEvent, useRtc } from '@torolocos/react-rtc';
import './styles.css';

interface Message {
  id: string;
  message: string;
  metadata: {
    username: string;
    time: number;
  };
}

const Chat = () => {
  const { sendToAllPeers, enter, leave, on, off, getAllPeers } = useRtc();
  const [inputValue, setInputValue] = useState('');
  const [messageData, setMessageData] = useState<Message[]>([]);
  const [error, setError] = useState('');
  const [isChatOpen, setChatOpen] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const username = useRef(Math.random().toPrecision(4).toString());

  const onStartChat = () => {
    if (enter) enter();
  };

  const onEndChat = () => {
    if (leave) leave();
  };

  const onMessageSend = () => {
    const message: Message = {
      id: crypto.randomUUID(),
      message: inputValue,
      metadata: {
        username: username.current,
        time: Date.now(),
      },
    };

    if (sendToAllPeers) sendToAllPeers(JSON.stringify(message));

    setInputValue('');
  };

  const handleMessageReceived = (event: RtcEvent<'receive'>) => {
    const message: Message = JSON.parse(event.detail);

    setMessageData((messages) => [...messages, message]);
  };

  const handleMessageSent = (event: RtcEvent<'send'>) => {
    const message: Message = JSON.parse(event.detail);

    console.log(message, event.detail);

    setMessageData((messages) => [...messages, message]);
  };

  const handlePeerConnected = (event: RtcEvent<'peerConnected'>) => {
    if (getAllPeers) setUserCount(getAllPeers().length);
    console.log('Peer connected', event.detail.uuid);
  };

  const handlePeerDisconnected = (event: RtcEvent<'peerDisconnected'>) => {
    if (getAllPeers) setUserCount(getAllPeers().length);
    console.log('Peer disconnected', event.detail.uuid);
  };

  const handleEnter = () => setChatOpen(true);

  const handleLeave = () => setChatOpen(false);

  const handleError = () => setError('Err');

  useEffect(() => {
    if (on) {
      on('receive', handleMessageReceived);
      on('send', handleMessageSent);
      on('send', () => console.log('first message sended'), { once: true });
      on('peerConnected', handlePeerConnected);
      on('peerDisconnected', handlePeerDisconnected);
      on('enter', handleEnter);
      on('leave', handleLeave);
      on('error', handleError);
    }

    return () => {
      if (off) {
        off('receive', handleMessageReceived);
        off('send', handleMessageSent);
        off('peerConnected', handlePeerConnected);
        off('peerDisconnected', handlePeerDisconnected);
        off('enter', handleEnter);
        off('enter', handleLeave);
        off('error', handleError);
      }
      if (leave) leave();
    };
  }, []);

  return (
    <>
      <h2>Chat</h2>
      {error && <div className="errorText">Something went wrong</div>}
      <p>User coount: {userCount}</p>
      <div>
        {messageData.map(({ id, message, metadata }) => (
          <div key={id}>
            {metadata?.username}: {message}
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
