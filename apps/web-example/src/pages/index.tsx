import type { NextPage } from 'next';
import { useEffect } from 'react';
import { LoginForm } from 'src/features/auth';
import { useUser } from 'src/features/auth/contexts/user';
import { ChatPage } from 'src/features/chat/pages/ChatPage';
import { useCustomModal } from 'src/features/ui/Modal/contexts/modal';

const Home: NextPage = () => {
  const { user } = useUser();
  const { showModal, modal } = useCustomModal();

  useEffect(() => {
    if (!modal && !user) {
      showModal(<LoginForm />);
    }
  }, []);

  return <ChatPage />;
};

export default Home;
