import React from 'react';
import ReactDOM from 'react-dom';
import { RtcProvider } from '@torolocos/react-rtc';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
	<RtcProvider signalingServer="ws://localhost:8001/" iceServers={[{ urls: 'stun:stun.l.google.com:19302' }]}>
		<App />
	</RtcProvider>,
	document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
