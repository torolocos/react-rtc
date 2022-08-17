# React-RTC

This library provides you simple and versatile wrapper around [WebRTC](https://webrtc.org/) technology in [React](https://reactjs.org/) ecosystem.

## Installation

#### Yarn

```shell
yarn add @torolocos/react-rtc
```

#### npm

```shell
npm install @torolocos/react-rtc
```

## Usage

1. To use [WebRTC](https://webrtc.org/) you have to run [signaling server](https://www.wowza.com/blog/webrtc-signaling-servers). Check out our [implementation](https://github.com/torolocos/react-rtc/tree/main/apps/signaling).

2. Wrap your app with `RtcProvider`

```jsx
import { RtcProvider } from '@torolocos/react-rtc';
import Chat from './components/Chat';

function App() {
  return (
    <RtcProvider
      signalingServer="ws://localhost:8001/"
      iceServers={[{ urls: 'stun:stun.l.google.com:19302' }]}
    >
      <Chat />
    </RtcProvider>
  );
}

export default App;
```

3. Use `useRtc` hook in your components.

```jsx
import { useEffect, useState, useRef } from 'react';
import { type RtcEvent, useRtc } from '@torolocos/react-rtc';

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

    setMessageData((messages) => [...messages, message]);
  };

  const handleEnter = () => setChatOpen(true);

  const handleLeave = () => setChatOpen(false);

  const handleError = () => setError('Err');

  useEffect(() => {
    if (on) {
      on('receive', handleMessageReceived);
      on('send', handleMessageSent);
      on('enter', handleEnter);
      on('leave', handleLeave);
      on('error', handleError);
    }

    return () => {
      if (off) {
        off('receive', handleMessageReceived);
        off('send', handleMessageSent);
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
```

> See the [example](https://github.com/torolocos/react-rtc/tree/main/apps/example) app.
