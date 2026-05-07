'use client';

import QRAttendancePage from '@/app/dashboard/qr-attendance/page';
import { RequireAccess } from '@/components/auth/require-access';

export default function QRSessionsPage() {
  return (
    <RequireAccess
      permission="QR_SESSION_VIEW"
      roles={['ROLE_SUPER_ADMIN']}
      title="QR sessions are restricted"
      description="Only super-admins can manage QR sessions."
    >
      <QRAttendancePage />
    </RequireAccess>
  );
}
