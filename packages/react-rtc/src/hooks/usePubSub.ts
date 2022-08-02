import { useRef } from 'react';
import type {
  EventsDetail,
  AddEventListener,
  RemoveEventListener,
} from '../types';

export const usePubSub = () => {
  const eventTarget = useRef(new EventTarget());

  const dispatchEvent = <Type extends keyof EventsDetail>(
    type: Type,
    detail: EventsDetail[Type]
  ) => eventTarget.current.dispatchEvent(new CustomEvent(type, { detail }));

  const on: AddEventListener = (type, handler, options) =>
    eventTarget.current.addEventListener(
      type,
      handler as EventListenerOrEventListenerObject,
      options
    );

  const off: RemoveEventListener = (type, handler) =>
    eventTarget.current.removeEventListener(
      type,
      handler as EventListenerOrEventListenerObject
    );

  return {
    dispatchEvent,
    on,
    off,
  };
};
