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
    ? 'មិនមានសម័យសកម្ម'
    : sessionStatus === 'error'
      ? errorMessage || 'មិនអាចផ្ទុក QR បានទេ'
      : sessionStatus === 'inactive'
        ? 'សម័យមិនសកម្ម'
        : 'ស្កេនដើម្បីឆែកចូល';

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.12),_transparent_30%)]" />
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
        <div className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur md:p-12">
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <p className="text-xs font-semibold tracking-[0.4em] text-white/45 uppercase">
              ប្រព័ន្ធកិច្ចការទូទៅ
            </p>
            <div className="flex items-center gap-3">
              <div className={`h-3.5 w-3.5 rounded-full ${statusDisplay.color}`} />
              <span className="text-sm font-semibold tracking-[0.28em] text-white/80">
                {statusDisplay.label}
              </span>
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                ផ្ទាំងបង្ហាញវត្តមាន QR
              </h1>
              <p className="mt-2 text-sm text-white/70 md:text-base">
                {sessionName ||
                  (sessionId ? `លេខសម្គាល់សម័យ: ${sessionId}` : 'មិនបានជ្រើសសម័យសកម្ម')}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-6">
            <div className="relative group">
              {/* Glowing blur background */}
              <div className="absolute -inset-4 bg-gradient-to-r from-sky-400/35 via-blue-500/35 to-indigo-500/35 rounded-[2.5rem] blur-3xl opacity-100 animate-pulse pointer-events-none" />

              <div
                key={lastUpdatedAt}
                className="relative flex h-[320px] w-[320px] items-center justify-center rounded-3xl bg-white p-5 shadow-xl transition-all duration-500 motion-safe:animate-in motion-safe:fade-in md:h-[400px] md:w-[400px]"
              >
                {qrAvailable ? (
                  <QRCodeSVG
                    value={qrToken}
                    size={320}
                    level="M"
                    includeMargin
                    fgColor="#000000"
                    className="h-full w-full"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100 px-6 text-center text-slate-600">
                    <div>
                      <p className="text-lg font-semibold">{helperText}</p>
                      <p className="mt-2 text-sm">
                        {sessionStatus === 'error'
                          ? 'សូមទុកអេក្រង់នេះបើក ខណៈប្រព័ន្ធព្យាយាមឡើងវិញដោយស្វ័យប្រវត្តិ។'
                          : 'ផ្ទាំងបង្ហាញនេះនឹងធ្វើបច្ចុប្បន្នភាពដោយស្វ័យប្រវត្តិ នៅពេលមានសម័យដែលមានសុពលភាព។'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 text-center">
              <p className="text-2xl font-semibold text-white/95 md:text-3xl">{helperText}</p>
              <p className="text-sm text-white/60 md:text-base">
                អេក្រង់នេះធ្វើបច្ចុប្បន្នភាពដោយស្វ័យប្រវត្តិ និងត្រូវបានរៀបចំសម្រាប់ការបង្ហាញ Kiosk។
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
