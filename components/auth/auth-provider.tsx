'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { hasPermission, isAdminRole, isSuperAdminRole } from '@/lib/auth/permissions';
import type { SessionUser } from '@/lib/auth/session';

type AuthContextValue = {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
  hasPermission: (permission?: string | null) => boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: SessionUser | null;
  children: ReactNode;
}) {
  const [user, setUser] = useState<SessionUser | null>(initialUser);

  const value = useMemo<AuthContextValue>(() => {
    const userRoles = user?.roleCodes?.length ? user.roleCodes : user?.role ? [user.role] : [];
    return {
      user,
      setUser,
      hasPermission: (permission?: string | null) =>
        hasPermission(userRoles, user?.permissions, permission),
      isAdmin: userRoles.some((r) => isAdminRole(r)),
      isSuperAdmin: userRoles.some((r) => isSuperAdminRole(r)),
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
