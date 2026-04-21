'use client';

import { QRCodeSVG } from 'qrcode.react';
import type { QrScanSessionStatus } from '@/hooks/qr-sessions/use-qr-scan-display';

interface QrScanKioskProps {
  countdown: number;
  errorMessage: string;
  lastUpdatedAt: number;
  qrAvailable: boolean;
  qrToken: string;
  sessionId: string;
  sessionName: string;
  sessionStatus: QrScanSessionStatus;
  statusDisplay: {
    label: string;
    color: string;
  };
}

export function QrScanKiosk({
  countdown: _countdown,
  errorMessage,
  lastUpdatedAt,
  qrAvailable,
  qrToken,
  sessionId,
  sessionName,
  sessionStatus,
  statusDisplay,
}: QrScanKioskProps) {
  const helperText = !sessionId
    ? 'No active session'
    : sessionStatus === 'error'
      ? errorMessage || 'Unable to load QR'
      : sessionStatus === 'inactive'
        ? 'Session inactive'
        : 'Scan to check in';

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.12),_transparent_30%)]" />
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
        <div className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur md:p-12">
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <p className="text-xs font-semibold tracking-[0.4em] text-white/45 uppercase">
              General Affair System
            </p>
            <div className="flex items-center gap-3">
              <div className={`h-3.5 w-3.5 rounded-full ${statusDisplay.color}`} />
              <span className="text-sm font-semibold tracking-[0.28em] text-white/80">
                {statusDisplay.label}
              </span>
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                QR Attendance Display
              </h1>
              <p className="mt-2 text-sm text-white/70 md:text-base">
                {sessionName ||
                  (sessionId ? `Session ID: ${sessionId}` : 'No active session selected')}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-6">
            <div
              key={lastUpdatedAt}
              className="flex h-[320px] w-[320px] items-center justify-center rounded-3xl bg-white p-5 shadow-xl transition-all duration-500 motion-safe:animate-in motion-safe:fade-in md:h-[400px] md:w-[400px]"
            >
              {qrAvailable ? (
                <QRCodeSVG
                  value={qrToken}
                  size={340}
                  level="M"
                  includeMargin
                  className="h-full w-full"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100 px-6 text-center text-slate-600">
                  <div>
                    <p className="text-lg font-semibold">{helperText}</p>
                    <p className="mt-2 text-sm">
                      {sessionStatus === 'error'
                        ? 'Please keep this screen open while it retries automatically.'
                        : 'This display will update automatically when a valid session is available.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 text-center">
              <p className="text-2xl font-semibold text-white/95 md:text-3xl">{helperText}</p>
              <p className="text-sm text-white/60 md:text-base">
                This screen refreshes automatically and is optimized for kiosk display.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
