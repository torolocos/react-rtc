import React, { useEffect, useState } from 'react';
import { useRtc, Event } from '@torolocos/react-rtc';

import './styles.css';

const Chat = () => {
  const { send, onEnter, onLeave, state, messageData, error } = useRtc();
  const [inputValue, setInputValue] = useState('');
  const [, setChatOpen] = useState(false);
  const { isEntered } = state;

  useEffect(() => {
    return () => {
      onLeave();
    };
  }, []);

  const onStartChat = () => {
    onEnter(`${Math.random().toFixed(2)}`); //FIXME: tmp till we create valid Chat Screen

    //TODO: zkontrolovat jestli pripojeni probehlo uspesne
    setChatOpen(true);
  };

  const onEndChat = () => {
    onLeave();
    //TODO: zkontrolovat jestli pripojeni probehlo uspesne
    setChatOpen(false);
  };

  const onMessageSend = () => {
    send(inputValue);

    setInputValue('');
  };

  const getMessageFromEvent = (event: Event, message: string) => {
    if (event !== 'message') return event;
    return message;
  };

  return (
    <div>
      <h2>Chat</h2>
      {error && <div className='errorText'>Something went wrong</div>}
      <div>
        {messageData.map(
          ({ id, message, displayName, metadata: { event } }) => (
            <div key={id}>
              {displayName}: {getMessageFromEvent(event, message)}
            </div>
          ),
        )}
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
