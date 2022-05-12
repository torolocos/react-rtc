import { createContext } from 'react';
import type { ContextType } from './types';

export const RtcContext = createContext<ContextType>({
  send: () => {},
  onEnter: () => {},
  onLeave: () => {},
  state: { isEntered: false },
  connections: new Map(),
  messageData: [],
  error: null,
});
