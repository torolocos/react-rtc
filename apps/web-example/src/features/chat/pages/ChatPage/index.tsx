import type { NextPage } from 'next';
import { ChatHeader } from '../../components/ChatHeader';
import { Container } from './styled';

export const ChatPage: NextPage = () => (
  <Container>
    <ChatHeader />
  </Container>
);
