import { createContext } from 'react';
import type { ContextType } from './types';

export const RtcContext = createContext<ContextType>({});
