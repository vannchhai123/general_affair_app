'use client';

import { useSearchParams } from 'next/navigation';
import { QrScanKiosk } from '@/components/qr/qr-scan-kiosk';
import { useQrScanDisplay } from '@/hooks/qr-sessions/use-qr-scan-display';

export default function AttendanceDisplayPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId')?.trim() || '';
  const qrScanDisplay = useQrScanDisplay(sessionId);

  return <QrScanKiosk sessionId={sessionId} {...qrScanDisplay} />;
}
