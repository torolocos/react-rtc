import type { NextPage } from 'next';
import { useEffect } from 'react';
import { Chat, ChatHeader, ChatInput } from '../../components';
import { useChat } from '../../contexts/chat';

import { Container } from './styled';

export const ChatPage: NextPage = () => {
  const { handleLeavePress, isConnected, handleJoinPress } = useChat();

  useEffect(() => {
    handleJoinPress();
    return () => {
      if (isConnected) {
        handleLeavePress();
      }
    };
  }, []);

  return (
    <Container>
      <ChatHeader />
      <Chat />
      <ChatInput />
    </Container>
  );
};
