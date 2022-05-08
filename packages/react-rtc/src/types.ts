export type Metadata = Record<string, unknown>;

export type PeerConnection = Map<
  string,
  { displayName: string; pc: RTCPeerConnection; dataChannel: RTCDataChannel }
>;

export interface MessageData {
  message: string;
  id: string;
  displayName?: string;
  senderId: string;
  timestamp: number;
  event?: Event;
  metadata?: Metadata;
}

export interface ContextType {
  send: (inputValue: string) => void;
  onEnter: (displayName: string, userMetadata?: Metadata) => void;
  onLeave: () => void;
  state: { isEntered: boolean };
  messageData: MessageData[];
  connections: PeerConnection;
  error: string | null;
}

export interface User {
  displayName?: string;
  userMetadata?: Metadata;
}

export enum Event {
  HAS_JOINED = 'hasJoined',
  HAS_LEFT = 'hasLeft',
}

export enum ConnectionState {
  FAILED = 'failed',
  CLOSED = 'closed',
  DISCONNECT = 'disconnected',
}
