import Message from './models/Message';

export interface Metadata extends Record<string, unknown> {
  event?: Event;
}

export type PeerConnection = Map<
  string,
  { displayName: string; pc: RTCPeerConnection; dataChannel: RTCDataChannel }
>;

export type Event = 'message' | 'connected' | 'disconnected';

export interface MessageData {
  message: string;
  id: string;
  displayName?: string;
  senderId: string;
  timestamp: number;
  metadata?: Metadata;
}

export interface Events {
  message: (event: CustomEvent<Message>) => void;
  send: (event: CustomEvent<Message>) => void;
  error: (event: CustomEvent<unknown>) => void;
}

export interface ContextType {
  send?: (inputValue: string) => void;
  enter?: (displayName: string, userMetadata?: Metadata) => void;
  disconnect?: () => void;
  state?: { isEntered: boolean };
  on?: <
    Type extends keyof Events,
    Handler extends Events[Type] & EventListenerOrEventListenerObject
  >(
    type: Type,
    handler: Handler
  ) => void;
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
