import type { NextPage } from 'next';
import { Chat, ChatHeader, ChatInput } from '../../components';

import { Container } from './styled';

export const ChatPage: NextPage = () => {
  return (
    <Container>
      <ChatHeader />
      <Chat />
      <ChatInput />
    </Container>
  );
};
