import type Message from './models/Message';
import type Peer from './models/Peer';

export type Metadata = Record<string, unknown>;

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

export type EventHandler<Type extends keyof EventsDetail> = (
  event: CustomEvent<EventsDetail[Type]>
) => void;

export interface EventsDetail {
  message: Message;
  send: Message;
  error: unknown;
  peerConnected: Peer;
  peerDisconnected: Peer;
  leave: unknown;
}

export interface ContextType {
  send?: (inputValue: string) => void;
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
