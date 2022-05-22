import { createContext } from 'react';
import type { ContextType } from './types';

export const RtcContext = createContext<ContextType>({
  send: () => {},
  disconnect: () => {},
  enter: () => {},
  state: { isEntered: false },
  onMessage: () => undefined,
  onSend: () => undefined,
});
