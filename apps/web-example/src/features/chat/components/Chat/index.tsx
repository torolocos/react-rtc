import { useChat } from '../../contexts/chat';
import Stream from '../Stream';
import { Container } from './styled';

export const Chat = () => {
  const { peers } = useChat();
  console.log({ peers });
  return (
    <Container>
      {peers.map(({ id, username, stream }) => (
        <Stream key={id} stream={stream} username={username} />
      ))}
    </Container>
  );
};
