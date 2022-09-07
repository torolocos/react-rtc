import { useChat } from 'src/features/chat/contexts/chat';
import { useMessage } from 'src/features/chat/hooks/message';
import { Button, TextInput } from 'src/features/ui';
import { useCustomModal } from 'src/features/ui/Modal/contexts/modal';
import { Container } from './styled';

const LoginForm = () => {
  const { closeModal } = useCustomModal();
  const { register, handleSubmit } = useMessage();
  const { handleJoinPress } = useChat();

  const onSubmit = async ({ username }: { username: string }) => {
    handleJoinPress(username);
    closeModal();
  };

  return (
    <Container>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          label="username"
          {...register('username', { required: true })}
        />
        <Button size="lg" bg="primary">
          Login
        </Button>
      </form>
    </Container>
  );
};

export { LoginForm };
