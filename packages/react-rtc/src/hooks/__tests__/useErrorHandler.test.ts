import { renderHook } from '@testing-library/react-hooks';
import { useErrorHandler } from '../useErrorHandler';

describe('useErrorHandler', () => {
  const dispatchEvent = jest.fn();
  const error = 'error';

  it('should handler error', () => {
    const { result } = renderHook(() => useErrorHandler(dispatchEvent));

    result.current(error);
    expect(dispatchEvent).toBeCalledWith('error', error);
  });
});
