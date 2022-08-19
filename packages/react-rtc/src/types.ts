import type Peer from './models/Peer';

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
  receive: [string, string];
  send: [string, string];
  error: unknown;
  peerConnected: Peer;
  peerDisconnected: Peer;
  leave: unknown;
  enter: unknown;
  dataChannelOpen: string;
}

export interface ContextType {
  enter?: () => void;
  leave?: () => void;
  sendToPeer?: (id: string, data: string) => void;
  sendToAllPeers?: (data: string) => void;
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
