import { DispatchEvent } from '../types';

export const useErrorHandler =
  (dispatchEvent: DispatchEvent) => (error: unknown) =>
    dispatchEvent('error', error);
