import { useContext } from 'react';
import { RtcContext } from './RtcContext';

export const useRtc = () => useContext(RtcContext);
