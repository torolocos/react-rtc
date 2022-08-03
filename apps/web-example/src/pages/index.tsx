import type { NextPage } from 'next';
import { useUser } from 'src/features/auth/contexts/user';
import { ChatPage } from 'src/features/chat/pages/ChatPage';

const Home: NextPage = () => {
  const { user } = useUser();

  if (user) {
    return <p>Please Log in</p>;
  }

  return <ChatPage />;
};

export default Home;
