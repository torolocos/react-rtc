import { TextInput } from 'src/features/ui';
import { Container } from './styled';

export const ChatInput = () => {
  return (
    <Container>
      <TextInput label="Type a message....." />
    </Container>
  );
};
