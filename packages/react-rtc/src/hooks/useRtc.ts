import { useContext } from 'react';
import { RtcContext } from '../contexts/RtcContext';

export const useRtc = () => useContext(RtcContext);
