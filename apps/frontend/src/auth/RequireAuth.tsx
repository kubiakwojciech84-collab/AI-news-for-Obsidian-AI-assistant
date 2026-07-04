import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { UserRole } from "@nova/shared";
import { useAuth } from "./AuthContext";

export function RequireAuth({ children, roles }: { children: ReactNode; roles?: UserRole[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="page-loading">Ladowanie...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
