import React, { useEffect, useState } from 'react';
import { useChat } from '@torolocos/react-rtc';

import './styles.css';

const Chat = () => {
  const { send, onEnterChat, onLeaveChat, state, messageData, error } =
    useChat();
  const [inputValue, setInputValue] = useState('');
  const [, setChatOpen] = useState(false);
  const { isConnected } = state;

  useEffect(() => {
    return () => {
      onLeaveChat();
    };
  }, []);

  const onStartChat = () => {
    onEnterChat(`${Math.random().toFixed(2)}`); //FIXME: tmp till we create valid Chat Screen

    //TODO: zkontrolovat jestli pripojeni probehlo uspesne
    setChatOpen(true);
  };

  const onEndChat = () => {
    onLeaveChat();
    //TODO: zkontrolovat jestli pripojeni probehlo uspesne
    setChatOpen(false);
  };

  const onMessageSend = () => {
    send(inputValue);

    setInputValue('');
  };

  return (
    <div>
      <h2>Chat</h2>
      {error && <div className='errorText'>Something went wrong</div>}
      <div>
        {messageData.map(({ message, displayName, event }) => (
          <div>
            {displayName}: {event || message}
          </div>
        ))}
      </div>
      {isConnected && (
        <>
          <input
            value={inputValue}
            onChange={({ target: { value } }) => setInputValue(value)}
          />
          <button onClick={onMessageSend}>send</button>
        </>
      )}
      <button onClick={!isConnected ? onStartChat : onEndChat}>
        {!isConnected ? 'join' : 'leave chat'}
      </button>
    </div>
  );
};

export default Chat;
