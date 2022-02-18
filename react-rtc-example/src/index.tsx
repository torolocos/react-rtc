import ReactDOM from 'react-dom';
import { ChatProvider } from '@torolocos/react-rtc/src/context/Chat'; //TODO: fix path
import './index.css';
import App from './App';

ReactDOM.render(
  <ChatProvider
    signalingServer='ws://3.71.110.139:8001/' // TODO: hide this. Maybe create fetch request on BE
    iceServers={[{ urls: 'stun:stun.l.google.com:19302' }]}
  >
    <App />
  </ChatProvider>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
