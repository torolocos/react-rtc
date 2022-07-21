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
