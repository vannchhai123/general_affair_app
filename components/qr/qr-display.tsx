'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { QRCodeSVG } from 'qrcode.react';

interface QRDisplayProps {
  errorMessage?: string;
  lastUpdatedAt: number;
  qrAvailable: boolean;
  qrToken: string;
  sessionId: string;
  sessionMessage?: string;
  timeRange?: string;
  isRefreshing: boolean;
  isLoading: boolean;
}

export function QRDisplay({
  errorMessage,
  lastUpdatedAt,
  qrAvailable,
  qrToken,
  sessionId,
  sessionMessage,
  timeRange,
  isRefreshing,
  isLoading,
}: QRDisplayProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-8">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="aspect-square w-64 rounded-2xl sm:w-80" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-8">
      <div className="flex flex-col items-center gap-6">
        {/* QR Code Wrapper with Glowing Backdrop Blur */}
        <div className="relative group">
          {/* Glowing blur background */}
          <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/20 via-sky-400/20 to-indigo-500/20 rounded-3xl blur-2xl opacity-100 animate-pulse pointer-events-none" />

          <div className="relative rounded-2xl bg-white p-6 shadow-inner border border-slate-100">
            {/* Scanner Corners */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top Left */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-black rounded-tl-md" />

              {/* Top Right */}
              <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-black rounded-tr-md" />

              {/* Bottom Left */}
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-black rounded-bl-md" />

              {/* Bottom Right */}
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-black rounded-br-md" />
            </div>
            <div
              key={lastUpdatedAt}
              className={`transition-all duration-500 ${
                isRefreshing ? 'scale-95 opacity-40' : 'scale-100 opacity-100'
              }`}
            >
              {qrAvailable ? (
                <>
                  <svg width="0" height="0" className="absolute">
                    <defs>
                      <linearGradient id="qr-gradient-display" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <QRCodeSVG
                    value={qrToken}
                    size={240}
                    level="H"
                    includeMargin
                    fgColor="url(#qr-gradient-display)"
                    className="h-full w-full"
                  />
                </>
              ) : (
                <div className="flex h-[240px] w-[240px] items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 px-6 text-center text-slate-600">
                  <div>
                    <p className="text-base font-semibold">មិនមាន QR</p>
                    <p className="mt-2 text-sm">
                      {errorMessage || 'កំពុងរង់ចាំ QR សម័យដែលមានសុពលភាព។'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Session Info */}
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-xs text-muted-foreground">
            លេខសម្គាល់សម័យ: <span className="font-mono">{sessionId || '---'}</span>
          </p>
          {(sessionMessage || timeRange) && (
            <p className="text-sm font-medium text-foreground">{sessionMessage}</p>
          )}
          {timeRange && <p className="text-xs text-muted-foreground">{timeRange}</p>}
          <p className="text-sm text-muted-foreground">មន្ត្រីស្កេន QR នេះដើម្បីកត់ត្រាវត្តមាន</p>
        </div>
      </div>
    </div>
  );
}
