import { createContext } from 'react';
import type { ContextType } from './types';

export const RtcContext = createContext<ContextType>({
  send: () => undefined,
  disconnect: () => undefined,
  enter: () => undefined,
  state: { isEntered: false },
  onMessage: () => undefined,
  onSend: () => undefined,
});
