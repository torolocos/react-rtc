import { MessageData } from '../types';

class Message {
  id: MessageData['id'] | undefined;
  message: MessageData['message'];
  displayName: MessageData['displayName'];
  senderId: MessageData['senderId'];
  timestamp: MessageData['timestamp'];
  metadata: MessageData['metadata'];

  constructor({
    id = crypto.randomUUID(),
    message,
    displayName,
    senderId,
    timestamp,
    metadata,
  }: Omit<MessageData, 'id'> & { id?: string }) {
    this.id = id;
    this.message = message;
    this.displayName = displayName;
    this.senderId = senderId;
    this.timestamp = timestamp;
    this.metadata = metadata;
  }
}

export default Message;
