import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthCredentials } from '@/types/telegram';
import { getStateInstance } from '@/api/greenApiTelegram';

interface AuthContextValue {
  credentials: AuthCredentials | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  authError: string | null;
  login: (creds: AuthCredentials) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'telegram-greenapi-credentials';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<AuthCredentials | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AuthCredentials;
        if (parsed.idInstance && parsed.apiTokenInstance) {
          setCredentials(parsed);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = useCallback(
    async (creds: AuthCredentials): Promise<boolean> => {
      setIsAuthenticating(true);
      setAuthError(null);
      try {
        const state = await getStateInstance(creds);
        if (state.stateInstance !== 'authorized') {
          setAuthError(
            `Instance is not authorized (state: ${state.stateInstance}).`,
          );
          return false;
        }
        setCredentials(creds);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Login failed';
        setAuthError(msg);
        return false;
      } finally {
        setIsAuthenticating(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setCredentials(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      credentials,
      isAuthenticated: credentials !== null,
      isAuthenticating,
      authError,
      login,
      logout,
    }),
    [credentials, isAuthenticating, authError, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
