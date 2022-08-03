import { FC, ReactNode } from 'react';
import { Layout } from './styled';

type Props = {
  children: NonNullable<ReactNode>;
};

export const PageLayout: FC<Props> = ({ children }) => {
  return (
    <Layout>
      <h1>Navigation panel</h1>
      {children}
    </Layout>
  );
};
