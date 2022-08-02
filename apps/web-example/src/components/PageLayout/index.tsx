import { FC, ReactNode } from 'react';
import { Layout } from './styled';

type Props = {
  children: NonNullable<ReactNode>;
};

export const PageLayout: FC<Props> = ({ children }) => {
  return (
    <Layout>
      <h1>Layout page</h1>
      {children}
    </Layout>
  );
};
