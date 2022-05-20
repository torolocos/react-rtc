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
  onEnter: (displayName: string, userMetadata?: Metadata) => void;
  onLeave: () => void;
  state: { isEntered: boolean };
  messageData: Message[];
  connections: PeerConnection;
  error: string | null;
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
