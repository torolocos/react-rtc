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

1. Run [signaling](https://www.wowza.com/blog/webrtc-signaling-servers) server.

   - To use [WebRTC](https://webrtc.org/) you have to run [signaling](https://www.wowza.com/blog/webrtc-signaling-servers) server. Check out our [implementation](https://github.com/torolocos/react-rtc/tree/main/apps/signaling).

2. Wrap your top level component with `RtcProvider`.

```tsx
import { RtcProvider } from '@torolocos/react-rtc';
import Chat from './components/Chat';

const App = () => {
  return (
    <RtcProvider
      signalingServer="ws://localhost:8001/"
      iceServers={[{ urls: 'stun:stun.l.google.com:19302' }]}
    >
      <Chat />
    </RtcProvider>
  );
};

export default App;
```

3. Use `useRtc` hook in your components.

```tsx
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
  const username = useRef(Math.random().toPrecision(4).toString());

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

  const handleError = () => setError('Err');

  useEffect(() => {
    if (enter) enter();
    if (on) {
      on('receive', handleMessageReceived);
      on('send', handleMessageSent);
      on('error', handleError);
    }

    return () => {
      if (off) {
        off('receive', handleMessageReceived);
        off('send', handleMessageSent);
        off('error', handleError);
      }
      if (leave) leave();
    };
  }, []);

  return (
    <>
      {error && <div className="errorText">Something went wrong</div>}
      <div>
        {messageData.map(({ id, message, metadata }) => (
          <div key={id}>
            {metadata?.username}: {message}
          </div>
        ))}
      </div>
      <input
        value={inputValue}
        onChange={({ target: { value } }) => setInputValue(value)}
      />
      <button onClick={onMessageSend}>send</button>
    </>
  );
};

export default Chat;
```

> See the [example](https://github.com/torolocos/react-rtc/tree/main/apps/example) app.
