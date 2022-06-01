import React, { useEffect, useState } from 'react';
import { useRtc, type EventHandler } from '@torolocos/react-rtc';

import './styles.css';

const Chat = () => {
  const { send, enter, disconnect, state, on, off } = useRtc();
  const [inputValue, setInputValue] = useState('');
  const [messageData, setMessageData] = useState([]);
  const [error, setError] = useState('');
  const [, setChatOpen] = useState(false);
  const { isEntered } = state;

  const onStartChat = () => {
    enter(`${Math.random().toFixed(2)}`); //FIXME: tmp till we create valid Chat Screen

    //TODO: zkontrolovat jestli pripojeni probehlo uspesne
    setChatOpen(true);
  };

  const onEndChat = () => {
    disconnect();
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
    console.log('Peer connected', event.detail.displayName);

  const handlePeerDisconnected: EventHandler<'peerDisconnected'> = (event) =>
    console.log('Peer disconnected', event.detail.displayName);

  const handleError: EventHandler<'error'> = () => setError('Err');

  useEffect(() => {
    on('message', handleMessage);
    on('send', handleMessageSend);
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

  const handleMessage: EventHandler<'message'> = (event) =>
    setMessageData((messages) => [...messages, event.detail]);

  const handleMessageSend: EventHandler<'send'> = (event) =>
    setMessageData((messages) => [...messages, event.detail]);

  const handleError: EventHandler<'error'> = () => setError('Err');

  useEffect(() => {
    on('message', handleMessage);
    on('send', handleMessageSend);
    on('error', handleError);

    return () => {
      off('message', handleMessage);
      off('send', handleMessageSend);
      off('error', handleError);
      disconnect();
    };
  }, []);

  return (
    <div>
      <h2>Chat</h2>
      {error && <div className="errorText">Something went wrong</div>}
      <div>
        {messageData.map(({ id, message, displayName }) => (
          <div key={id}>
            {displayName}: {message}
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
