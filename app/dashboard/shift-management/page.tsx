'use client';

import ShiftsPage from '@/app/dashboard/shifts/page';
import { RequireAccess } from '@/components/auth/require-access';

export default function ShiftManagementPage() {
  return (
    <RequireAccess
      permission="SHIFT_VIEW"
      title="Shift management is restricted"
      description="You do not have permission to view or manage shifts."
    >
      <ShiftsPage />
    </RequireAccess>
  );
}
