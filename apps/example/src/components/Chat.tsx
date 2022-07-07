import { useEffect, useState } from 'react';
import { useRtc, type EventHandler, type Message } from '@torolocos/react-rtc';
import './styles.css';

const Chat = () => {
  const { send, enter, leave, on, off } = useRtc();
  const [inputValue, setInputValue] = useState('');
  const [messageData, setMessageData] = useState<Message[]>([]);
  const [error, setError] = useState('');
  const [isChatOpen, setChatOpen] = useState(false);

  const onStartChat = () => {
    enter();

    //TODO: zkontrolovat jestli pripojeni probehlo uspesne
    setChatOpen(true);
  };

  const onEndChat = () => {
    leave();
    //TODO: zkontrolovat jestli pripojeni probehlo uspesne
    setChatOpen(false);
  };

  const onMessageSend = () => {
    send(inputValue);

    setInputValue('');
  };

  const handleMessage: EventHandler<'message'> = (event) =>
    setMessageData((messages) => [...messages, event.detail]);

  const handleMessageSend: EventHandler<'send'> = (event) =>
    setMessageData((messages) => [...messages, event.detail]);

  const handlePeerConnected: EventHandler<'peerConnected'> = (event) =>
    console.log('Peer connected', event.detail.uuid);

  const handlePeerDisconnected: EventHandler<'peerDisconnected'> = (event) =>
    console.log('Peer disconnected', event.detail.uuid);

  const handleError: EventHandler<'error'> = () => setError('Err');

  useEffect(() => {
    on('message', handleMessage);
    on('send', handleMessageSend);
    on('send', () => console.log('first message sended'), { once: true });
    on('peerConnected', handlePeerConnected);
    on('peerDisconnected', handlePeerDisconnected);
    on('error', handleError);

    return () => {
      off('message', handleMessage);
      off('send', handleMessageSend);
      off('peerConnected', handlePeerConnected);
      off('peerDisconnected', handlePeerDisconnected);
      off('error', handleError);
      leave();
    };
  }, []);

  return (
    <div>
      <h2>Chat</h2>
      {error && <div className="errorText">Something went wrong</div>}
      <div>
        {messageData.map(({ id, message, senderId }) => (
          <div key={id}>
            {senderId}: {message}
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
    </div>
  );
};

export default Chat;
