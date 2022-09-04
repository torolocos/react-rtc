import type { NextPage } from 'next';
import { useEffect } from 'react';
import { Chat, ChatHeader, ChatInput } from '../../components';
import { useChat } from '../../contexts/chat';

import { Container } from './styled';

export const ChatPage: NextPage = () => {
  const { handleJoinPress, handleLeavePress, isConnected } = useChat();

  useEffect(() => {
    handleJoinPress();

    return () => handleLeavePress();
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
