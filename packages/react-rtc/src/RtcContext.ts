import { createContext } from 'react';
import type { ContextType } from './types';

export const RtcContext = createContext<ContextType>({
  send: () => undefined,
  onEnter: () => undefined,
  onLeave: () => undefined,
  state: { isEntered: false },
  connections: new Map(),
  messageData: [],
  error: null,
});
