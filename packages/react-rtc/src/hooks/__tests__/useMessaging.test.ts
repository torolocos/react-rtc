import { act, renderHook } from '@testing-library/react-hooks';
import { useMessaging } from '../useMessaging';

describe('useMessaging', () => {
  const peerConnections = new Map();
  const dispatchEvent = jest.fn();

  beforeAll(() => {
    jest.mock('crypto', () => ({ randomUUID: jest.fn() }));
  });

  it('should send a message', () => {
    const { result } = renderHook(() =>
      useMessaging('', peerConnections, dispatchEvent)
    );

    act(() => {
      result.current.send('test');
    });

    expect(dispatchEvent).toBeCalledWith('send');
  });
});
