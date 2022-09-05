import { useChat } from 'src/features/chat/contexts/chat';
import { Button, TextInput } from 'src/features/ui';
import { useCustomModal } from 'src/features/ui/Modal/contexts/modal';
import { useUser } from '../../contexts/user';
import { Container } from './styled';

const LoginForm = () => {
  const { setUser } = useUser();
  const { closeModal } = useCustomModal();
  const { startStream } = useChat();

  const onSubmit = async () => {
    setUser({ name: Math.random().toString() });
    startStream();
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
