'use client';

import { RequireAccess } from '@/components/auth/require-access';
import { RolePermissionsManagement } from '@/components/permissions/role-permissions-management';

export default function OfficerPermissionsPage() {
  return (
    <RequireAccess permission="OFFICER_VIEW_PERMISSION" redirectTo="/dashboard">
      <RolePermissionsManagement />
    </RequireAccess>
  );
}
