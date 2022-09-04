import z from 'zod';

export const Message = z.object({
  id: z.string(),
  senderId: z.string(),
  message: z.string(),
});

const Peer = z.object({
  id: z.nullable(z.string()),
  username: z.string(),
});

export type Message = z.infer<typeof Message>;
export type Peer = z.infer<typeof Peer> & { stream: MediaStream };

export const isMessage = (message: unknown): message is Message => {
  const { success } = Message.safeParse(message);

  return success;
};

export const isPeer = (peer: unknown): peer is Peer => {
  const { success } = Peer.safeParse(peer);

  return success;
};
