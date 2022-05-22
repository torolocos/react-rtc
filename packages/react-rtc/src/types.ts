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

export interface ContextType {
  send: (inputValue: string) => void;
  enter: (displayName: string, userMetadata?: Metadata) => void;
  disconnect: () => void;
  state: { isEntered: boolean };
  onMessage?: (handler: (event: CustomEvent<Message>) => void) => void;
  onSend?: (handler: (event: CustomEvent<Message>) => void) => void;
  onError?: (handler: (event: CustomEvent<unknown>) => void) => void;
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
