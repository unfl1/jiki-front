import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { login } from '@/features/auth/api';
import { clearSession, getSession, saveSession } from '@/features/auth/storage';
import { Session } from '@/features/auth/types';

type AuthContextValue = {
  session: Session | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void getSession().then(setSession).finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    isLoading,
    signIn: async (username, password) => {
      const nextSession = await login(username, password);
      await saveSession(nextSession);
      setSession(nextSession);
    },
    signOut: async () => {
      await clearSession();
      setSession(null);
    },
  }), [isLoading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
