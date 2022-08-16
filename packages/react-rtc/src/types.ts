import type Message from './models/Message';

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
  receive: Message;
  send: Message;
  error: unknown;
  peerConnected: string;
  peerDisconnected: string;
  leave: unknown;
  enter: unknown;
}

export type Send = <Metadata = undefined>(
  data: string,
  metadata?: Metadata
) => void;

export interface ContextType {
  enter?: () => void;
  leave?: () => void;
  send?: Send;
  getAllPeers?: () => string[];
  on?: AddEventListener;
  off?: RemoveEventListener;
}

export enum ConnectionState {
  FAILED = 'failed',
  CLOSED = 'closed',
  DISCONNECT = 'disconnected',
}

export interface Signal {
  id: string;
  dest: 'all' | string;
  sdp?: RTCSessionDescriptionInit;
  ice?: RTCIceCandidateInit | undefined;
  newPeer?: boolean;
}

export interface Peer {
  id: string;
  peerConnection: RTCPeerConnection;
  dataChannel: RTCDataChannel;
}
