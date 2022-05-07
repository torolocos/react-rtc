import { ConfigData } from '../types';

export const defaultConfig: ConfigData = {
  onError: (error?: string) => {
    const errorMessage = error || 'Something went Wrong';
    console.warn(errorMessage);
    return { errorMessage };
  },
  onSuccess: (data?: Record<string, unknown>) => data,
};
