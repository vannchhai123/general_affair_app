'use client';

import dynamic from 'next/dynamic';
import { Timer } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import QRCode to avoid SSR issues
const QRCode = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeCanvas), {
  ssr: false,
});

interface QRDisplayProps {
  sessionId: string;
  countdown: number;
  isRefreshing: boolean;
  isLoading: boolean;
}

export function QRDisplay({ sessionId, countdown, isRefreshing, isLoading }: QRDisplayProps) {
  const isExpired = countdown <= 0;

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
        {/* QR Code */}
        <div className="relative rounded-2xl bg-white p-6 shadow-inner">
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
            className={`transition-all duration-500 ${
              isRefreshing ? 'scale-95 opacity-40' : 'scale-100 opacity-100'
            }`}
          >
            <QRCode value={`attendance://${sessionId}`} size={240} level="H" includeMargin />
          </div>

          {/* Expired Overlay */}
          {isExpired && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm">
              <p className="text-sm font-semibold text-red-500">QR Expired</p>
            </div>
          )}
        </div>

        {/* Countdown & Session Info */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-muted-foreground" />
            <p className="text-lg font-semibold">Expires in {countdown}s</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Session ID: <span className="font-mono">{sessionId || '---'}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Employees scan this QR code to mark attendance
          </p>
        </div>
      </div>
    </div>
  );
}
