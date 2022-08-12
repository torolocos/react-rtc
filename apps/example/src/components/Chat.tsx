import { useEffect, useState, useRef } from 'react';
import { type RtcEvent, Message, useRtc } from '@torolocos/react-rtc';
import './styles.css';

type MessageMetadata = { username?: string };

const isMessage = (message: unknown): message is Message<MessageMetadata> => {
  return (
    message instanceof Message &&
    'username' in message.metadata &&
    typeof message.metadata.username === 'string'
  );
};

const Chat = () => {
  const { send, enter, leave, on, off } = useRtc();
  const [inputValue, setInputValue] = useState('');
  const [messageData, setMessageData] = useState<Message<MessageMetadata>[]>(
    []
  );
  const [error, setError] = useState('');
  const [isChatOpen, setChatOpen] = useState(false);
  const username = useRef(Math.random().toPrecision(4).toString());

  const onStartChat = () => {
    if (enter) enter();
  };

  const onEndChat = () => {
    if (leave) leave();
  };

  const onMessageSend = () => {
    if (send) send<MessageMetadata>(inputValue, { username: username.current });

    setInputValue('');
  };

  const handleMessageReceived = (event: RtcEvent<'receive'>) => {
    if (isMessage(event.detail)) {
      const message = event.detail;

      setMessageData((messages) => [...messages, message]);
    }
  };

  const handleMessageSent = (event: RtcEvent<'send'>) => {
    if (isMessage(event.detail)) {
      const message = event.detail;

      setMessageData((messages) => [...messages, message]);
    }
  };

  const handlePeerConnected = (event: RtcEvent<'peerConnected'>) =>
    console.log('Peer connected', event.detail.uuid);

  const handlePeerDisconnected = (event: RtcEvent<'peerDisconnected'>) =>
    console.log('Peer disconnected', event.detail.uuid);

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
