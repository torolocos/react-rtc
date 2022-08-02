import type { FC, ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

import type { User } from '../types';

type ContextValue = {
  user: User | null;
  setUser: (user: User) => void;
};

export const UserContext = createContext<ContextValue>({
  user: null,
  setUser: () => {},
});

export const UserContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const value = useMemo(
    () => ({
      user,
      setUser,
    }),
    [user]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  return useContext(UserContext);
};
