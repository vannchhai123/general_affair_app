'use client';

import OrganizationPage from '@/app/dashboard/organization/page';
import { RequireAccess } from '@/components/auth/require-access';

export default function DepartmentsPage() {
  return (
    <RequireAccess permission="ORGANIZATION_VIEW">
      <OrganizationPage />
    </RequireAccess>
  );
}
