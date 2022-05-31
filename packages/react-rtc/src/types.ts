import Message from './models/Message';

export interface Metadata extends Record<string, unknown> {
  event?: Event;
}

export type PeerConnection = Map<
  string,
  { displayName: string; pc: RTCPeerConnection; dataChannel: RTCDataChannel }
>;

export type Event = 'message' | 'connected' | 'disconnected';

export type On = <Type extends keyof EventsDetail>(
  type: Type,
  handler: EventHandler<Type>
) => void;

export type Off = On;

export type EventHandler<Type extends keyof EventsDetail> =
  EventListenerOrEventListenerObject &
    ((event: CustomEvent<EventsDetail[Type]>) => void);

export interface EventsDetail {
  message: Message;
  send: Message;
  error: unknown;
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
  on?: On;
  off?: Off;
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
