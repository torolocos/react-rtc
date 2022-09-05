import { renderHook } from '@testing-library/react-hooks';
import { usePubSub } from '../usePubSub';

const events = new Map<string, () => void>();
const addEventListener = jest.fn((type: string, handler: () => void) =>
  events.set(type, handler)
);
const removeEventListener = jest.fn(() => {
  events.clear();
});
const dispatchEvent = jest.fn((event: CustomEvent) => {
  const handler = events.get(event.type);

  if (handler) handler();
});

Object.defineProperty(global, 'EventTarget', {
  value: class {
    dispatchEvent = dispatchEvent;
    addEventListener = addEventListener;
    removeEventListener = removeEventListener;
  },
});

Object.defineProperty(global, 'CustomEvent', {
  value: class {
    type: string;
    constructor(type: string) {
      this.type = type;
    }
  },
});

describe('usePubSub', () => {
  const handler = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should dispatch event', () => {
    const { result } = renderHook(() => usePubSub());

    result.current.dispatchEvent('enter');
    expect(dispatchEvent).toBeCalled();
  });

  it('should subscribe to an event', () => {
    const { result } = renderHook(() => usePubSub());

    result.current.on('enter', handler);
    result.current.dispatchEvent('enter');
    expect(addEventListener).toBeCalled();
    expect(handler).toBeCalled();
  });

  it('should unsubscribe to an event', () => {
    const { result } = renderHook(() => usePubSub());

    result.current.on('enter', handler);
    result.current.off('enter', handler);
    result.current.dispatchEvent('enter');
    expect(removeEventListener).toBeCalled();
    expect(handler).not.toBeCalled();
  });
});
