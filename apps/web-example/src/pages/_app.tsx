import type { AppProps } from 'next/app';
import { PageLayout } from 'src/components/PageLayout';
import { globalStyles } from 'src/features/ui/theme';

function MyApp({ Component, pageProps }: AppProps) {
  // TODO: temporary
  globalStyles();
  return (
    <PageLayout>
      <Component {...pageProps} />;
    </PageLayout>
  );
}

export default MyApp;
