'use client';

import ShiftsPage from '@/app/dashboard/shifts/page';
import { RequireAccess } from '@/components/auth/require-access';

export default function ShiftManagementPage() {
  return (
    <RequireAccess
      permission="SHIFT_VIEW"
      roles={['ROLE_SUPER_ADMIN']}
      title="Shift management is restricted"
      description="Only super administrators can manage shifts."
    >
      <ShiftsPage />
    </RequireAccess>
  );
}
