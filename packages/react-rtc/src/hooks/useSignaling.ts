import { useRef, useEffect } from 'react';

export const useSignaling = (uuid: string) => {
  const signaling = useRef<WebSocket>();

  const send = (destination: string, data: Record<string, unknown>) => {
    const message = JSON.stringify({
      uuid,
      dest: destination,
      ...data,
    });

    signaling.current?.send(message);
  };

  const handleSignalingOpen = () => {
    send('all', { displayName: uuid });
  };

  useEffect(() => {
    signaling.current?.addEventListener('open', handleSignalingOpen);

    return () => {
      signaling.current?.removeEventListener('open', handleSignalingOpen);
    };
  }, [signaling.current]);

  return { send, signaling };
};
