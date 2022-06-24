import { useEffect, useState } from 'react';
import { useRtc, type EventHandler, type Message } from '@torolocos/react-rtc';
import './styles.css';

const Chat = () => {
  const { send, enter, disconnect, state, on, off } = useRtc();
  const [inputValue, setInputValue] = useState('');
  const [user] = useState({ username: Math.random().toFixed(3) });
  const [messageData, setMessageData] = useState<
    Message<{ username: string }>[]
  >([]);
  const [error, setError] = useState('');
  const [, setChatOpen] = useState(false);
  const { isEntered } = state;

  const onStartChat = () => {
    enter(); //FIXME: tmp till we create valid Chat Screen

    //TODO: zkontrolovat jestli pripojeni probehlo uspesne
    setChatOpen(true);
  };

  const onEndChat = () => {
    disconnect();
    //TODO: zkontrolovat jestli pripojeni probehlo uspesne
    setChatOpen(false);
  };

  const onMessageSend = () => {
    send(inputValue, { username: user.username });

    setInputValue('');
  };

  const handleMessage: EventHandler<'message'> = (event) =>
    // @ts-ignore
    setMessageData((messages) => [...messages, event.detail]);

  const handleMessageSend: EventHandler<'send'> = (event) =>
    // @ts-ignore
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
      disconnect();
    };
  }, []);

  return (
    <div>
      <h2>Chat</h2>
      {error && <div className="errorText">Something went wrong</div>}
      <div>
        {messageData.map(({ id, message, metadata }) => (
          <div key={id}>
            {metadata.username}: {message}
          </div>
        ))}
      </div>
      {isEntered && (
        <>
          <input
            value={inputValue}
            onChange={({ target: { value } }) => setInputValue(value)}
          />
          <button onClick={onMessageSend}>send</button>
        </>
      )}
      <button onClick={!isEntered ? onStartChat : onEndChat}>
        {!isEntered ? 'join' : 'leave chat'}
      </button>
    </div>
  );
};

export default Chat;
