'use client';

import QRAttendancePage from '@/app/dashboard/qr-attendance/page';
import { RequireAccess } from '@/components/auth/require-access';

export default function QRSessionsPage() {
  return (
    <RequireAccess
      permission="QR_SESSION_VIEW"
      title="QR sessions are restricted"
      description="You do not have permission to view or manage QR sessions."
    >
      <QRAttendancePage />
    </RequireAccess>
  );
}
