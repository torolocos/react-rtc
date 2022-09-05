import { useChat } from 'src/features/chat/contexts/chat';
import { Button, TextInput } from 'src/features/ui';
import { useCustomModal } from 'src/features/ui/Modal/contexts/modal';
import { useUser } from '../../contexts/user';
import { Container } from './styled';

const LoginForm = () => {
  const { handleJoinPress } = useChat();
  const { setUser } = useUser();
  const { closeModal } = useCustomModal();

  const onSubmit = () => {
    handleJoinPress();
    setUser({ name: Math.random().toString() });
    closeModal();
  };
  return (
    <Container>
      <TextInput label="username" />
      <Button size="lg" bg="primary" onClick={onSubmit}>
        Login
      </Button>
    </Container>
  );
};

export { LoginForm };
