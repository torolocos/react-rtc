import type Message from './models/Message';
import type Peer from './models/Peer';

export type DispatchEvent = <Type extends EventsKeys>(
  type: Type,
  detail?: EventsDetail[Type]
) => boolean;

export type AddEventListener = <Type extends EventsKeys>(
  type: Type,
  handler: (event: RtcEvent<Type>) => void,
  options?: AddEventListenerOptions
) => void;

export type RemoveEventListener = <Type extends EventsKeys>(
  type: Type,
  handler: (event: RtcEvent<Type>) => void,
  options?: EventListenerOptions
) => void;

export type RtcEvent<Type extends EventsKeys> = CustomEvent<EventsDetail[Type]>;

type EventsKeys = keyof EventsDetail;

interface EventsDetail {
  receive: Message;
  send: Message;
  error: unknown;
  peerConnected: Peer;
  peerDisconnected: Peer;
  leave: unknown;
}

export type Send = <Metadata = undefined>(
  data: string,
  metadata?: Metadata
) => void;

export interface ContextType {
  send?: Send;
  enter?: () => void;
  leave?: () => void;
  state?: { isEntered: boolean };
  on?: AddEventListener;
  off?: RemoveEventListener;
}

export enum ConnectionState {
  FAILED = 'failed',
  CLOSED = 'closed',
  DISCONNECT = 'disconnected',
}

export interface Signal {
  uuid: string;
  dest: 'all' | string;
  sdp?: RTCSessionDescriptionInit;
  ice?: RTCIceCandidateInit | undefined;
  newPeer?: boolean;
}
