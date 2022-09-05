import type { NextPage } from 'next';
import { useEffect } from 'react';
import { Chat, ChatHeader, ChatInput } from '../../components';
import { useChat } from '../../contexts/chat';

import { Container } from './styled';

export const ChatPage: NextPage = () => {
  const { handleLeavePress, isConnected } = useChat();

  useEffect(() => {
    return () => {
      if (isConnected) handleLeavePress();
    };
  }, []);

  console.log({ isConnected });
  return (
    <Container>
      <ChatHeader />
      <Chat />
      <ChatInput />
    </Container>
  );
};
