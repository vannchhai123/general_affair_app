'use client';

import { Suspense } from 'react';
import { QrScanKiosk } from '@/components/qr/qr-scan-kiosk';
import { useQrScanDisplay } from '@/hooks/qr-sessions/use-qr-scan-display';

function AttendanceDisplayFallback() {
  return (
    <QrScanKiosk
      countdown={0}
      errorMessage=""
      lastUpdatedAt={0}
      qrAvailable={false}
      qrToken=""
      sessionId=""
      sessionName=""
      sessionStatus="loading"
      statusDisplay={{ label: 'កំពុងផ្ទុក', color: 'bg-slate-500' }}
    />
  );
}

function AttendanceDisplayContent() {
  const qrScanDisplay = useQrScanDisplay();

  return <QrScanKiosk {...qrScanDisplay} />;
}

export default function AttendanceDisplayPage() {
  return (
    <div className="fixed inset-0 h-screen h-[100dvh] w-screen overflow-hidden bg-slate-950">
      <Suspense fallback={<AttendanceDisplayFallback />}>
        <AttendanceDisplayContent />
      </Suspense>
    </div>
  );
}
