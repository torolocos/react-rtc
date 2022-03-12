import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { v4 as uuid } from 'uuid';

export enum Event {
	HAS_JOINED = 'hasJoined',
	HAS_LEFT = 'hasLeft',
}
export interface MessageData {
	message: string;
	id: string;
	username: string;
	senderId: string;
	timestamp: number;
	avatar: string;
	event?: Event;
}

interface ContextType {
	onSend: (inputValue: string) => void;
	onEnterChat: ({ name, avatar }: { name: string; avatar: string }) => void;
	onLeaveChat: () => void;
	state: { isEntered: boolean };
	messageData: MessageData[]; // TODO: types
	connections: PeerConnection;
	error: string | null;
}

interface Props {
	children: JSX.Element;
	signalingServer: string;
	iceServers: { urls: string }[];
}

type PeerConnection = Map<string, { displayName: string; pc: RTCPeerConnection; dataChannel: RTCDataChannel }>;

const contextDefaults: ContextType = {
	onSend: () => {},
	onEnterChat: () => {},
	onLeaveChat: () => {},
	state: { isEntered: false },
	connections: new Map(),
	messageData: [],
	error: null,
};

export const ChatContext = createContext<ContextType>(contextDefaults);

export const ChatProvider = ({ children, signalingServer, iceServers }: Props) => {
	const [isEntered, setIsEntered] = useState(false); // TODO: Rename, leave there
	const localUuid = useRef(uuid()).current; // TODO: Remove current
	const [messageData, setMessageData] = useState<MessageData[]>([]); // TODO: Leave, check interface, remove: avatar, event, username
	const [error, setError] = useState<string>(''); //TODO: Remove error, use onError event instead
	const [user, setUser] = useState({ name: 'test', avatar: '' }); // TODO: Remove
	const signaling = useRef<WebSocket>(null);

	const peerConnections = useRef<PeerConnection>(new Map());

	const onSendEventMessage = (peer, event: Event) => {
		// FIXME: OHACK
		// TODO: Remove setter, add callback + metadata?
		if (peer.displayName.length <= 20) {
			setMessageData((prev) => [
				...prev,
				{
					id: uuid(),
					senderId: localUuid,
					username: peer.displayName,
					timestamp: Date.now(),
					avatar: user.avatar,
					message: '',
					event,
				},
			]);
		}
	};

	// TODO: Rename, messageSend, send, ...
	const onSend = (inputValue: string) => {
		try {
			const messageId = uuid();
			// TODO: Pull out, make it like addMessageData and use setter
			setMessageData((prev) => [
				...prev,
				{
					id: messageId,
					message: inputValue,
					username: 'Me',
					senderId: localUuid,
					timestamp: Date.now(),
					avatar: user.avatar,
				},
			]);

			// TODO: Pull outside
			peerConnections.current.forEach((connection) => {
				const message = JSON.stringify({
					id: messageId,
					senderId: localUuid,
					username: user.name,
					message: inputValue,
					timestamp: Date.now(),
					avatar: user.avatar,
				});

				connection?.dataChannel?.send(message);
			});
		} catch (e) {
			// TODO: Add error handler
			setError(e as string);
			console.warn(e);
		}
	};

	function checkPeerDisconnect(peerUuid: string) {
		const state = peerConnections.current.get(peerUuid)?.pc.iceConnectionState;

		// TODO: Make enum, or check native types
		if (state === 'failed' || state === 'closed' || state === 'disconnected') {
			onSendEventMessage(peerConnections.current.get(peerUuid), Event.HAS_LEFT);
			peerConnections.current.delete(peerUuid);
		}
	}

	function setUpPeer(peerUuid: string, displayName: string, initCall = false) {
		// TODO: Rename to peer connection
		const pc = new RTCPeerConnection({ iceServers });
		// TODO: Make better naming
		const dataChannel = pc.createDataChannel('test');

		// TODO: Pull it outside to separate file, use it as handleres
		pc.onicecandidate = (event) => gotIceCandidate(event, peerUuid);
		pc.oniceconnectionstatechange = () => checkPeerDisconnect(peerUuid);
		pc.addEventListener('datachannel', (event) =>
			Object.defineProperty(peerConnections.current.get(peerUuid), 'dataChannel', {
				value: event.channel,
			})
		);
		pc.addEventListener('connectionstatechange', () => {
			if (peerConnections.current.get(peerUuid)?.pc.connectionState === 'connected')
				onSendEventMessage(peerConnections.current.get(peerUuid), Event.HAS_JOINED);
		});

		// TODO: Parse message outside, add try catch, use addMessageData
		dataChannel.addEventListener('message', (event) => setMessageData((prev) => [...prev, JSON.parse(event.data)]));

		if (initCall) {
			pc.createOffer()
				.then((description) => createdDescription(description, peerUuid))
				// TODO: Add error handlerer
				.catch((e) => console.log({ e }));
		}

		peerConnections.current.set(peerUuid, { displayName, pc, dataChannel });
	}

	function gotIceCandidate(event: RTCPeerConnectionIceEvent, peerUuid: string) {
		if (event.candidate != null) {
			sendSignalingMessage(peerUuid, { ice: event.candidate });
		}
	}

	function createdDescription(description: RTCSessionDescriptionInit, peerUuid: string) {
		peerConnections.current
			.get(peerUuid)
			?.pc.setLocalDescription(description)
			.then(function () {
				sendSignalingMessage(peerUuid, { sdp: peerConnections.current.get(peerUuid)?.pc.localDescription });
			})
			// TODO: Add error handler
			.catch((e) => console.log(e));
	}

	// TODO: Check the logic, use better name
	function gotMessageFromServer(message: MessageEvent) {
		const signal = JSON.parse(message.data);
		const peerUuid = signal.uuid;

		// Ignore messages that are not for us or from ourselves
		if (peerUuid == localUuid || (signal.dest != localUuid && signal.dest != 'all')) return;

		if (signal.displayName && signal.dest == 'all') {
			// set up peer connection object for a newcomer peer
			setUpPeer(peerUuid, signal.displayName);
			sendSignalingMessage(peerUuid, { displayName: localUuid, uuid: localUuid });
		} else if (signal.displayName && signal.dest == localUuid) {
			// initiate call if we are the newcomer peer
			setUpPeer(peerUuid, signal.displayName, true);
		} else if (signal.sdp) {
			peerConnections.current
				.get(peerUuid)
				?.pc.setRemoteDescription(new RTCSessionDescription(signal.sdp))
				.then(function () {
					// Only create answers in response to offers
					if (signal.sdp.type == 'offer') {
						peerConnections.current
							.get(peerUuid)
							?.pc.createAnswer()
							.then((description) => createdDescription(description, peerUuid))
							.catch((e) => console.error(e));
					}
				})
				.catch((e) => console.error(e));
		} else if (signal.ice) {
			peerConnections.current
				.get(peerUuid)
				?.pc.addIceCandidate(new RTCIceCandidate(signal.ice))
				.catch((e) => console.error(e));
		}
	}

	// TODO: Remove avatar, rename name to displayName
	const onEnterChat = async ({ name, avatar }) => {
		signaling.current = new WebSocket(signalingServer);
		// TODO: Add callback, notifi user about event, remove setError,
		setError('');
		setUser({ name, avatar });

		setIsEntered(true);
	};

	const onLeaveChat = () => {
		signaling.current?.close();
		peerConnections.current.forEach((connection) => {
			connection.pc.close();
		});
		setIsEntered(false);
		// TODO: Add callback
	};

	const sendSignalingMessage = (dest: string, data: Record<string, unknown>) => {
		const message = JSON.stringify({ uuid: localUuid, dest, ...data });

		signaling.current.send(message);
	};

	const handleSignalingOpen = () => {
		sendSignalingMessage('all', { displayName: 'aaa' });
	};

	useEffect(() => {
		console.log(signaling);
		signaling.current?.addEventListener('message', gotMessageFromServer);
		signaling.current?.addEventListener('open', handleSignalingOpen);

		return () => {
			signaling.current?.removeEventListener('message', gotMessageFromServer);
			signaling.current?.removeEventListener('open', handleSignalingOpen);
		};
	}, [signaling.current]);

	const chatContext: ContextType = {
		onSend,
		onEnterChat,
		onLeaveChat,
		messageData,
		connections: peerConnections.current,
		state: { isEntered },
		error,
	};
	return <ChatContext.Provider value={chatContext}>{children}</ChatContext.Provider>;
};

// TODO: Pull it ouside to hook
export const useChat = () => useContext(ChatContext);
