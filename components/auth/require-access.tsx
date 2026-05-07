'use client';

import type { ReactNode } from 'react';
import { AccessDenied } from './access-denied';
import { useAuth } from './auth-provider';

export function RequireAccess({
  children,
  permission,
  roles,
  title,
  description,
}: {
  children: ReactNode;
  permission?: string;
  roles?: string[];
  title?: string;
  description?: string;
}) {
  const { user, hasPermission } = useAuth();

  const roleBlocked = roles?.length ? !roles.includes(user?.role ?? '') : false;
  const permissionBlocked = permission ? !hasPermission(permission) : false;

  if (roleBlocked || permissionBlocked) {
    return <AccessDenied title={title} description={description} />;
  }

  return <>{children}</>;
}
