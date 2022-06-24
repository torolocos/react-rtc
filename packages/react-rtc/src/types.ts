import Message from './models/Message';
import Peer from './models/Peer';

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

export interface ContextType {
  send?: <MetadataType extends Record<string, unknown>>(
    inputValue: string,
    metadata?: MetadataType
  ) => void;
  enter?: <MetadataType extends Record<string, never>>(
    userMetadata?: MetadataType
  ) => void;
  disconnect?: () => void;
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
