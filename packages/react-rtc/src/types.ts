import Message from './models/Message';

export type Metadata = Record<string, unknown>;

export type Peer = {
  displayName: string;
  pc: RTCPeerConnection;
  dataChannel: RTCDataChannel;
};

export type AddEventListener = <Type extends keyof EventsDetail>(
  type: Type,
  handler: EventHandler<Type>,
  options?: AddEventListenerOptions
) => void;

export type RemoveEventListener = <Type extends keyof EventsDetail>(
  type: Type,
  handler: EventHandler<Type>,
  options?: EventListenerOptions
) => void;

export type EventHandler<Type extends keyof EventsDetail> =
  EventListenerOrEventListenerObject &
    ((event: CustomEvent<EventsDetail[Type]>) => void);

export interface EventsDetail {
  message: Message;
  send: Message;
  error: unknown;
  peerConnected: Peer;
  peerDisconnected: Peer;
}

export interface MessageData {
  message: string;
  id: string;
  displayName?: string;
  senderId: string;
  timestamp: number;
  metadata?: Metadata;
}

export interface ContextType {
  send?: (inputValue: string) => void;
  enter?: (displayName: string, userMetadata?: Metadata) => void;
  disconnect?: () => void;
  state?: { isEntered: boolean };
  on?: AddEventListener;
  off?: RemoveEventListener;
}

export interface User {
  displayName?: string;
  userMetadata?: Metadata;
}

export enum ConnectionState {
  FAILED = 'failed',
  CLOSED = 'closed',
  DISCONNECT = 'disconnected',
}

export interface Signal {
  uuid: string;
  displayName: string;
  dest: 'all' | string;
  sdp: RTCSessionDescriptionInit;
  ice: RTCIceCandidateInit | undefined;
}
