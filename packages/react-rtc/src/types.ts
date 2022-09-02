export type DispatchEvent = <Type extends keyof EventsDetail>(
  type: Type,
  detail?: EventsDetail[Type]
) => boolean;

export type AddEventListener = <Type extends keyof EventsDetail>(
  type: Type,
  handler: (event: RtcEvent<Type>) => void,
  options?: AddEventListenerOptions
) => void;

export type RemoveEventListener = <Type extends keyof EventsDetail>(
  type: Type,
  handler: (event: RtcEvent<Type>) => void,
  options?: EventListenerOptions
) => void;

export type RtcEvent<Type extends keyof EventsDetail> = CustomEvent<
  EventsDetail[Type]
>;

interface EventsDetail {
  receive: [string, string];
  send: [string, string];
  error: unknown;
  peerConnected: string;
  peerDisconnected: string;
  leave: unknown;
  enter: unknown;
  dataChannel: string;
  track: [string, MediaStreamTrack];
}

export interface ContextType {
  enter?: () => void;
  leave?: () => void;
  sendToPeer?: (id: string, data: string) => void;
  sendToAllPeers?: (data: string) => void;
  on?: AddEventListener;
  off?: RemoveEventListener;
  addTrack?: (id: string, track: MediaStreamTrack) => void;
}

export enum ConnectionState {
  FAILED = 'failed',
  CLOSED = 'closed',
  DISCONNECT = 'disconnected',
}

export interface Signal {
  id: string;
  destination: string;
  data: {
    sdp?: RTCSessionDescriptionInit;
    ice?: RTCIceCandidateInit;
  };
}

export interface Connection {
  id: string;
  peerConnection: RTCPeerConnection;
  dataChannel: RTCDataChannel;
}
