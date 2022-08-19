import { useEffect, useState, useRef } from 'react';
import { type RtcEvent, useRtc } from '@torolocos/react-rtc';
import './styles.css';

interface Message {
  id: string;
  from: string;
  message: string;
}

interface Peer {
  id: string;
  username: string;
}

const isObject = (object: unknown): object is object =>
  typeof object === 'object';

const isMessage = (message: unknown): message is Message =>
  isObject(message) && !!message && 'id' in message && 'message' in message;

const generateUserName = () => {
  const toUpperCaseFirstCharacter = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  const filterDuplicities = (text?: string[] | null) =>
    Array.from(new Set(text)).join('');

  const name = crypto.randomUUID().match(/[a-z]/gm);

  return toUpperCaseFirstCharacter(filterDuplicities(name).slice(0, 6));
};

const Chat = () => {
  const { sendToPeer, sendToAllPeers, enter, leave, on, off } = useRtc();
  const [inputValue, setInputValue] = useState('');
  const [messageData, setMessageData] = useState<Message[]>([]);
  const [error, setError] = useState('');
  const [isChatOpen, setChatOpen] = useState(false);
  const username = useRef(generateUserName());
  const [peers, setPeers] = useState<Peer[]>([]);

  const getPeerUsername = (id: string) =>
    peers.find((peer) => peer.id === id)?.username;

  const handleJoinPress = () => {
    if (enter) enter();
  };

  const handleLeavePress = () => {
    if (leave) leave();
  };

  const handleSendPress = () => {
    const message = {
      id: crypto.randomUUID(),
      from: '',
      message: inputValue,
    };

    if (sendToAllPeers) sendToAllPeers(JSON.stringify(message));
    setMessageData((messages) => [...messages, message]);
    setInputValue('');
  };

  const handleMessageReceived = (event: RtcEvent<'receive'>) => {
    const [from, payload] = event.detail;
    const data = JSON.parse(payload);

    if (isMessage(data)) {
      setMessageData((messages) => [...messages, { ...data, from }]);
    } else if (!peers.includes(data))
      setPeers((peersMap) => [...peersMap, { id: from, ...data }]);
  };

  const handleMessageSend = (event: RtcEvent<'send'>) => {
    const [to, data] = event.detail;
    const message = JSON.parse(data);

    if (isMessage(message))
      console.log(`Message: "${message.message}" to ${to} was delivered.`);
  };

  const handleEnter = () => setChatOpen(true);

  const handleLeave = () => setChatOpen(false);

  const handleError = () => setError('Something went wrong');

  const handleDataChannelOpen = (event: RtcEvent<'dataChannel'>) => {
    const id = event.detail;

    if (sendToPeer)
      sendToPeer(id, JSON.stringify({ username: username.current }));
  };

  useEffect(() => {
    if (on) {
      on('receive', handleMessageReceived);
      on('send', handleMessageSend);
      on('enter', handleEnter);
      on('leave', handleLeave);
      on('dataChannel', handleDataChannelOpen);
      on('error', handleError);
    }

    return () => {
      if (off) {
        off('receive', handleMessageReceived);
        off('send', handleMessageSend);
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
      {error && <div className="errorText">{error}</div>}
      <p>Peers connected: {peers.length}</p>
      <div>
        {messageData?.map(({ id, from, message }) => (
          <div key={id}>
            {from ? getPeerUsername(from) : username.current}: {message}
          </div>
        ))}
      </div>
      {isChatOpen && (
        <>
          <input
            value={inputValue}
            onChange={({ target: { value } }) => setInputValue(value)}
          />
          <button onClick={handleSendPress}>send</button>
        </>
      )}
      <button onClick={!isChatOpen ? handleJoinPress : handleLeavePress}>
        {!isChatOpen ? 'join' : 'leave chat'}
      </button>
    </>
  );
};

export default Chat;
