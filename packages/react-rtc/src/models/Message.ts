import { Metadata } from '../types';

class Message {
  id: string;
  senderId?: string;
  message: string;
  displayName?: string;
  timestamp: number;
  metadata?: Metadata;

  constructor({
    message,
    displayName,
    senderId,
    timestamp,
    metadata,
  }: {
    message: string;
    displayName?: string;
    senderId: string;
    timestamp: number;
    metadata?: Metadata;
  }) {
    this.id = crypto.randomUUID();
    this.message = message;
    this.displayName = displayName;
    this.senderId = senderId;
    this.timestamp = timestamp;
    this.metadata = metadata;
  }
}

export default Message;
