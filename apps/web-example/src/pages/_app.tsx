import type { AppProps } from 'next/app';
import { RtcProvider } from '@torolocos/react-rtc';
import { PageLayout } from 'src/components/PageLayout';
import { UserContextProvider } from 'src/features/auth/contexts/user';
import { globalStyles } from 'src/features/ui/theme';
import { ChatContextProvider } from 'src/features/chat/contexts/chat';

function MyApp({ Component, pageProps }: AppProps) {
  // TODO: temporary
  globalStyles();
  return (
    <RtcProvider
      signalingServer="ws://localhost:8001/"
      iceServers={[{ urls: 'stun:stun.l.google.com:19302' }]}
    >
      <UserContextProvider>
        <ChatContextProvider>
          <PageLayout>
            <Component {...pageProps} />
          </PageLayout>
        </ChatContextProvider>
      </UserContextProvider>
    </RtcProvider>
  );
}

export default MyApp;
