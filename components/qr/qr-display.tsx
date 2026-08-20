'use client';

import { Clock, QrCode } from 'lucide-react';
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
      <div className="rounded-xl border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center gap-5">
          <Skeleton className="aspect-square w-64 rounded-3xl sm:w-72" />
          <Skeleton className="h-5 w-48 rounded-full" />
          <Skeleton className="h-4 w-36 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col items-center gap-6">
        {/* QR Code Card Wrapper */}
        <div className="relative group">
          {/* Glowing backdrop blur */}
          <div className="absolute -inset-3 bg-gradient-to-r from-indigo-500/20 via-sky-400/20 to-blue-600/20 rounded-[2.5rem] blur-2xl opacity-100 animate-pulse pointer-events-none" />

          <div className="relative rounded-3xl bg-white p-6 shadow-md border border-slate-100">
            {/* Scanner Bracket Accents */}
            <div className="absolute inset-2 pointer-events-none">
              <div className="absolute top-2 left-2 w-6 h-6 border-t-3 border-l-3 border-indigo-600 rounded-tl-lg" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t-3 border-r-3 border-indigo-600 rounded-tr-lg" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-3 border-l-3 border-indigo-600 rounded-bl-lg" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-3 border-r-3 border-indigo-600 rounded-br-lg" />
            </div>

            <div
              key={lastUpdatedAt}
              className={`transition-all duration-500 ${
                isRefreshing ? 'scale-95 opacity-40' : 'scale-100 opacity-100'
              }`}
            >
              {qrAvailable ? (
                <QRCodeSVG
                  value={qrToken}
                  size={240}
                  level="H"
                  includeMargin
                  fgColor="#000000"
                  className="h-[240px] w-[240px] sm:h-[260px] sm:w-[260px]"
                />
              ) : (
                <div className="flex h-[240px] w-[240px] sm:h-[260px] sm:w-[260px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 text-center text-slate-600">
                  <div>
                    <p className="text-base font-semibold">មិនមាន QR</p>
                    <p className="mt-1.5 text-xs text-slate-500">
                      {errorMessage || 'កំពុងរង់ចាំ QR សម័យដែលមានសុពលភាព។'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Structured Session Details */}
        <div className="flex flex-col items-center gap-3 text-center w-full max-w-sm">
          {timeRange && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
              <Clock className="h-3.5 w-3.5" />
              <span>{timeRange}</span>
            </div>
          )}

          <div className="mt-1 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 font-medium">
            <QrCode className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
            <span>មន្ត្រីស្កេន QR នេះដើម្បីកត់ត្រាវត្តមាន</span>
          </div>
        </div>
      </div>
    </div>
  );
}
