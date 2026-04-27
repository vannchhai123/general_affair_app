import { AlertCircle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatKhmerNumerals } from '@/lib/dashboard/utils';

export function DashboardStatsLoading() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="rounded-lg border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-36" />
              </div>
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
            <Skeleton className="mt-4 h-1.5 w-full rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DashboardLoading() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <DashboardStatsLoading />
      <div className="grid gap-5 xl:grid-cols-2">
        <Skeleton className="h-[380px] rounded-lg" />
        <Skeleton className="h-[380px] rounded-lg" />
      </div>
      <Skeleton className="h-[380px] rounded-lg" />
    </div>
  );
}

export function DashboardError({
  message,
  onRetry,
  isFetching,
  title,
  description,
  responseLabel,
  retryLabel,
}: {
  message?: string;
  onRetry: () => void;
  isFetching: boolean;
  title: string;
  description: React.ReactNode;
  responseLabel: string;
  retryLabel: string;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <Card className="border-red-200 bg-red-50/60 shadow-sm">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-red-100 p-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base text-red-950">{title}</CardTitle>
              <CardDescription className="mt-1 text-red-800">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {message ? (
            <div className="rounded-md border border-red-200 bg-white p-3 text-sm text-red-900">
              {formatKhmerNumerals(message)}
            </div>
          ) : null}

          <div className="rounded-md border bg-white p-4">
            <p className="text-sm font-medium text-slate-950">{responseLabel}</p>
            <pre className="mt-3 overflow-x-auto rounded-md bg-slate-950 p-4 text-xs text-slate-50">
              {formatKhmerNumerals(`{
  "officers": { "total": 0, "active": 0, "on_leave": 0, "inactive": 0 },
  "attendance": { "total": 0, "approved": 0, "pending": 0, "absent": 0 },
  "invitations": { "total": 0, "active": 0, "completed": 0 },
  "missions": { "total": 0, "approved": 0, "pending": 0 },
  "leave_requests": { "total": 0, "approved": 0, "pending": 0 },
  "recent_attendance": []
}`)}
            </pre>
          </div>

          <Button variant="outline" onClick={onRetry} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            {retryLabel}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
