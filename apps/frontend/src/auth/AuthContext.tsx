import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { PublicUser } from "@nova/shared";
import { AuthApi, UsersApi } from "../api/endpoints";

interface AuthContextValue {
  user: PublicUser | null;
  token: string | null;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("nova_token"));
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem("nova_token")) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await UsersApi.me();
      setUser(me);
    } catch {
      localStorage.removeItem("nova_token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    const res = await AuthApi.login(usernameOrEmail, password);
    localStorage.setItem("nova_token", res.accessToken);
    setToken(res.accessToken);
    const me = await UsersApi.me();
    setUser(me);
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const res = await AuthApi.register(username, email, password);
    localStorage.setItem("nova_token", res.accessToken);
    setToken(res.accessToken);
    const me = await UsersApi.me();
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("nova_token");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, token, loading, login, register, logout, refreshUser }), [user, token, loading, login, register, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
