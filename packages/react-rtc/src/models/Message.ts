class Message<
  MetadaType extends Record<string, unknown> = Record<string, never>
> {
  id: string;
  senderId?: string;
  message: string;
  timestamp: number;
  metadata?: MetadaType;

  constructor({
    message,
    senderId,
    timestamp,
    metadata,
  }: {
    message: string;
    senderId: string;
    timestamp: number;
    metadata?: MetadaType;
  }) {
    this.id = crypto.randomUUID();
    this.message = message;
    this.senderId = senderId;
    this.timestamp = timestamp;
    this.metadata = metadata;
  }
}

export default Message;
