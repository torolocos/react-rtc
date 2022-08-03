import type { AppProps } from 'next/app';
import { PageLayout } from 'src/components/PageLayout';
import { UserContextProvider } from 'src/features/auth/contexts/user';
import { globalStyles } from 'src/features/ui/theme';

function MyApp({ Component, pageProps }: AppProps) {
  // TODO: temporary
  globalStyles();
  return (
    <UserContextProvider>
      <PageLayout>
        <Component {...pageProps} />
      </PageLayout>
    </UserContextProvider>
  );
}

export default MyApp;
