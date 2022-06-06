import { useRef } from 'react';
import type { EventsDetail, EventListener } from '../types';

export const usePubSub = () => {
  const eventTarget = useRef(new EventTarget());

  const dispatchEvent = <Type extends keyof EventsDetail>(
    type: Type,
    detail: EventsDetail[Type]
  ) => eventTarget.current.dispatchEvent(new CustomEvent(type, { detail }));

  const on: EventListener = (type, handler) =>
    eventTarget.current.addEventListener(type, handler);

  const once: EventListener = (type, handler) => {
    eventTarget.current.addEventListener(type, handler, { once: true });
  };

  const off: EventListener = (type, handler) =>
    eventTarget.current.removeEventListener(type, handler);

  return {
    dispatchEvent,
    on,
    once,
    off,
  };
};
