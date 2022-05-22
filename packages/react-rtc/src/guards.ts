export const isCustomEvent = <EventType extends unknown>(
  event: object
): event is CustomEvent<EventType> => 'detail' in event;
