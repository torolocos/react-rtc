import { useRef } from 'react';
import type { EventsDetail, On, Off } from '../types';

export const usePubSub = () => {
  const eventTarget = useRef(new EventTarget());

  const dispatchEvent = <Type extends keyof EventsDetail>(
    type: Type,
    detail: EventsDetail[Type]
  ) => eventTarget.current.dispatchEvent(new CustomEvent(type, { detail }));

  const on: On = (type, handler) =>
    eventTarget.current.addEventListener(type, handler);

  const off: Off = (type, handler) =>
    eventTarget.current.removeEventListener(type, handler);

  return {
    dispatchEvent,
    on,
    off,
  };
};
