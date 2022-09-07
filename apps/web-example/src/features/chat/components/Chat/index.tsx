import { useChat } from '../../contexts/chat';
import Stream from '../Stream';
import { Container } from './styled';

const fakePeers = [
  {
    id: 1,
    stream: '',
    username: 'Petr1',
    color: 'red',
  },
  {
    id: 2,
    stream: '',
    username: 'Petr2',
    color: 'green',
  },
  {
    id: 3,
    stream: '',
    username: 'Petr3',
    color: 'yellow',
  },
  {
    id: 4,
    stream: '',
    username: 'Petr4',
    color: 'blue',
  },
  {
    id: 5,
    stream: '',
    username: 'Petr5',
    color: 'violet',
  },
  {
    id: 4,
    stream: '',
    username: 'Petr4',
    color: 'blue',
  },
  {
    id: 5,
    stream: '',
    username: 'Petr5',
    color: 'violet',
  },
];

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
