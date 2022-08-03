class Message<Metadata = unknown> {
  id: string;
  senderId?: string;
  message: string;
  timestamp: number;
  metadata?: Metadata;

  constructor({
    message,
    senderId,
    timestamp,
    metadata,
  }: {
    message: string;
    senderId: string;
    timestamp: number;
    metadata?: Metadata;
  }) {
    this.id = crypto.randomUUID();
    this.message = message;
    this.senderId = senderId;
    this.timestamp = timestamp;
    this.metadata = metadata;
  }
}

export default Message;
