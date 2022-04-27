import { MessageData, User, Metadata, ConnectionState, Event } from './types';

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react';

interface ContextType {
  send: (inputValue: string) => void;
  onEnterChat: (displayName: string, userMetadata?: Metadata) => void;
  onLeaveChat: () => void;
  state: { isConnected: boolean };
  messageData: MessageData[];
  connections: PeerConnection;
  error: string | null;
}

interface Props {
  children: JSX.Element;
  signalingServer: string;
  iceServers: { urls: string }[];
}

type PeerConnection = Map<
  string,
  { displayName: string; pc: RTCPeerConnection; dataChannel: RTCDataChannel }
>;

const contextDefaults: ContextType = {
  send: () => {},
  onEnterChat: () => {},
  onLeaveChat: () => {},
  state: { isConnected: false },
  connections: new Map(),
  messageData: [],
  error: null,
};

export const ChatContext = createContext<ContextType>(contextDefaults);

export const ChatProvider = ({
  children,
  signalingServer,
  iceServers,
}: Props) => {
  const [isConnected, setIsConnected] = useState(false);
  const localUuid = useRef(crypto.randomUUID());
  const [messageData, setMessageData] = useState<MessageData[]>([]); // TODO: Leave, check interface, remove: avatar, event, displayName
  const [error, setError] = useState<string>(''); // TODO: Remove error, use onError event instead
  const [user, setUser] = useState<User>({
    displayName: undefined,
    userMetadata: undefined,
  });
  const signaling = useRef<WebSocket>(null);

  const peerConnections = useRef<PeerConnection>(new Map());

  const onSendEventMessage = (
    peer: {
      pc: RTCPeerConnection;
      dataChannel: RTCDataChannel;
      displayName: string;
    },

    event: Event
  ) => {
    // FIXME: OHACK
    // TODO: Remove setter, add callback + metadata?
    if (peer.displayName.length <= 20) {
      setMessageData((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),

          senderId: localUuid.current,
          displayName: peer.displayName,
          timestamp: Date.now(),
          message: '',
          event,
        },
      ]);
    }
  };

  // TODO: Rename, messageSend, send, ...

  const send = (inputValue: string, metadata?: Metadata) => {
    try {
      const messageId = crypto.randomUUID();
      // TODO: Pull out, make it like addMessageData and use setter
      setMessageData((prev) => [
        ...prev,
        {
          id: messageId,
          message: inputValue,

          displayName: user.displayName,
          senderId: localUuid.current,
          timestamp: Date.now(),
          metadata,
        },
      ]);

      // TODO: Pull outside
      peerConnections.current.forEach((connection) => {
        const message = JSON.stringify({
          id: messageId,

          senderId: localUuid.current,
          displayName: user.displayName,
          message: inputValue,
          timestamp: Date.now(),
          metadata,
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
    const peer = peerConnections.current.get(peerUuid);

    if (
      peer &&
      (state === ConnectionState.FAILED ||
        state === ConnectionState.CLOSED ||
        state === ConnectionState.DISCONNECT)
    ) {
      onSendEventMessage(peer, Event.HAS_LEFT);
      peerConnections.current.delete(peerUuid);
    }
  }

  function setUpPeer(peerUuid: string, displayName: string, initCall = false) {
    const peerConnection = new RTCPeerConnection({ iceServers });
    // TODO: Make better naming
    const dataChannel = peerConnection.createDataChannel('test');

    // TODO: Pull it outside to separate file, use it as handleres
    peerConnection.onicecandidate = (event) => gotIceCandidate(event, peerUuid);
    peerConnection.oniceconnectionstatechange = () =>
      checkPeerDisconnect(peerUuid);
    peerConnection.addEventListener('datachannel', (event) =>
      Object.defineProperty(
        peerConnections.current.get(peerUuid),
        'dataChannel',
        {
          value: event.channel,
        }
      )
    );
    peerConnection.addEventListener('connectionstatechange', () => {
      const peer = peerConnections.current.get(peerUuid);
      if (peer && peer.pc.connectionState === 'connected')
        onSendEventMessage(peer, Event.HAS_JOINED);
    });

    // TODO: Parse message outside, add try catch, use addMessageData
    dataChannel.addEventListener('message', (event) =>
      setMessageData((prev) => [...prev, JSON.parse(event.data)])
    );

    if (initCall) {
      peerConnection
        .createOffer()
        .then((description) => createdDescription(description, peerUuid))
        // TODO: Add error handlerer
        .catch((e) => console.log({ e }));
    }

    peerConnections.current.set(peerUuid, {
      displayName,
      pc: peerConnection,
      dataChannel,
    });
  }

  function gotIceCandidate(event: RTCPeerConnectionIceEvent, peerUuid: string) {
    if (event.candidate != null) {
      sendSignalingMessage(peerUuid, { ice: event.candidate });
    }
  }

  function createdDescription(
    description: RTCSessionDescriptionInit,

    peerUuid: string
  ) {
    peerConnections.current
      .get(peerUuid)
      ?.pc.setLocalDescription(description)

      .then(() => {
        sendSignalingMessage(peerUuid, {
          sdp: peerConnections.current.get(peerUuid)?.pc.localDescription,
        });
      })
      // TODO: Add error handler
      .catch((e) => console.log(e));
  }

  // TODO: Check the logic, use better name
  function gotMessageFromServer(message: MessageEvent) {
    const signal = JSON.parse(message.data);
    const peerUuid = signal.uuid;

    // Ignore messages that are not for us or from ourselves
    if (
      peerUuid == localUuid.current ||
      (signal.dest != localUuid.current && signal.dest != 'all')
    )
      return;

    if (signal.displayName && signal.dest == 'all') {
      // set up peer connection object for a newcomer peer
      setUpPeer(peerUuid, signal.displayName);
      sendSignalingMessage(peerUuid, {
        displayName: localUuid.current,
        uuid: localUuid.current,
      });
    } else if (signal.displayName && signal.dest == localUuid.current) {
      // initiate call if we are the newcomer peer
      setUpPeer(peerUuid, signal.displayName, true);
    } else if (signal.sdp) {
      peerConnections.current
        .get(peerUuid)
        ?.pc.setRemoteDescription(new RTCSessionDescription(signal.sdp))

        .then(() => {
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

  const onEnterChat = async (displayName: string, userMetadata?: Metadata) => {
    // TODO: Fix this ignore

    // @ts-ignore
    signaling.current = new WebSocket(signalingServer);
    // TODO: Add callback, notifi user about event, remove setError,
    setError('');
    setUser({ displayName, userMetadata });

    setIsConnected(true);
  };

  const onLeaveChat = () => {
    signaling.current?.close();
    peerConnections.current.forEach((connection) => {
      connection.pc.close();
    });
    setIsConnected(false);
    // TODO: Add callback
  };

  const sendSignalingMessage = (
    dest: string,

    data: Record<string, unknown>
  ) => {
    const message = JSON.stringify({ uuid: localUuid.current, dest, ...data });

    signaling.current?.send(message);
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
    send,

    onEnterChat,
    onLeaveChat,
    messageData,
    connections: peerConnections.current,
    state: { isConnected },
    error,
  };
  return (
    <ChatContext.Provider value={chatContext}>{children}</ChatContext.Provider>
  );
};

// TODO: Pull it ouside to hook
export const useChat = () => useContext(ChatContext);
