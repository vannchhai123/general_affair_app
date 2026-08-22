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
    <main className="fixed inset-0 h-screen h-[100dvh] w-screen overflow-hidden bg-slate-950 text-white select-none flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Background radial gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.12),_transparent_30%)]" />

      {/* Main card container (locked inside viewport, no scrolling) */}
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur max-h-[92vh]">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center shrink-0">
          <p className="text-xs font-semibold tracking-[0.4em] text-white/45 uppercase">
            ប្រព័ន្ធកិច្ចការទូទៅ
          </p>
          <div className="flex items-center gap-2.5">
            <div className={`h-3 w-3 rounded-full ${statusDisplay.color} animate-pulse`} />
            <span className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-white/80">
              {statusDisplay.label}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/70 truncate max-w-lg mt-0.5">
            {sessionName || (sessionId ? `លេខសម្គាល់សម័យ: ${sessionId}` : 'មិនបានជ្រើសសម័យសកម្ម')}
          </p>
        </div>

        {/* QR Code Container */}
        <div className="my-4 sm:my-6 flex flex-col items-center justify-center shrink-0">
          <div className="relative group">
            {/* Glowing blur background */}
            <div className="absolute -inset-4 bg-gradient-to-r from-sky-400/35 via-blue-500/35 to-indigo-500/35 rounded-[2.5rem] blur-3xl opacity-100 animate-pulse pointer-events-none" />

            <div
              key={lastUpdatedAt}
              className="relative flex h-[240px] w-[240px] sm:h-[300px] sm:w-[300px] md:h-[350px] md:w-[350px] max-h-[46vh] max-w-[46vh] aspect-square items-center justify-center rounded-3xl bg-white p-4 sm:p-5 shadow-xl transition-all duration-500 motion-safe:animate-in motion-safe:fade-in"
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
                <div className="flex h-full w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100 p-4 text-center text-slate-600">
                  <div>
                    <p className="text-base font-semibold leading-relaxed">{helperText}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {sessionStatus === 'error'
                        ? 'សូមទុកអេក្រង់នេះបើក ខណៈប្រព័ន្ធព្យាយាមឡើងវិញដោយស្វ័យប្រវត្តិ។'
                        : 'ផ្ទាំងបង្ហាញនេះនឹងធ្វើបច្ចុប្បន្នភាពដោយស្វ័យប្រវត្តិ នៅពេលមានសម័យដែលមានសុពលភាព។'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info text */}
        <div className="text-center shrink-0">
          <p className="text-xl sm:text-2xl font-semibold text-white/95 leading-relaxed font-khmer-moul-light">
            {helperText}
          </p>
        </div>
      </div>
    </main>
  );
}
