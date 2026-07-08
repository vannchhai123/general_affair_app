'use client';

import OrganizationPage from '@/app/dashboard/organization/page';
import { RequireAccess } from '@/components/auth/require-access';

export default function PositionsPage() {
  return (
    <RequireAccess roles={['ROLE_ADMIN']} permission="ORGANIZATION_VIEW">
      <OrganizationPage />
    </RequireAccess>
  );
}
