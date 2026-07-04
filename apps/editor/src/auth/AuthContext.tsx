import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { PublicUser } from "@nova/shared";
import { AuthApi, UsersApi } from "../api/endpoints";

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("nova_editor_token")) {
      setLoading(false);
      return;
    }
    UsersApi.me()
      .then(setUser)
      .catch(() => localStorage.removeItem("nova_editor_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    const res = await AuthApi.login(usernameOrEmail, password);
    localStorage.setItem("nova_editor_token", res.accessToken);
    setUser(await UsersApi.me());
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("nova_editor_token");
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
