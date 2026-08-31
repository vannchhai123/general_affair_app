'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { isSuperAdminRole } from '@/lib/auth/permissions';

export function RequireAccess({
  children,
  permission,
  roles,
  redirectTo = '/dashboard',
}: {
  children: ReactNode;
  permission?: string;
  roles?: string[];
  title?: string;
  description?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { user, hasPermission } = useAuth();

  const userRoles = user?.roleCodes?.length ? user.roleCodes : user?.role ? [user.role] : [];
  const isSuper = userRoles.some((r) => isSuperAdminRole(r));

  const roleAllowed = roles?.length ? roles.some((r) => userRoles.includes(r)) || isSuper : true;

  const permissionAllowed = permission ? hasPermission(permission) || isSuper : true;

  const isAllowed = Boolean(user && user.enabled && roleAllowed && permissionAllowed);

  useEffect(() => {
    if (user && !isAllowed) {
      router.replace(redirectTo);
    }
  }, [user, isAllowed, router, redirectTo]);

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
