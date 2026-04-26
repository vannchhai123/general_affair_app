'use client';

import { BarChart3, RefreshCw } from 'lucide-react';
import { AttendanceSummaryDashboard } from '@/components/attendance/attendance-summary-dashboard';
import { useAttendance } from '@/hooks/attendance/use-attendance';
import type { Attendance } from '@/lib/schemas';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AttendanceSummaryPage() {
  const { data, isLoading, error, refetch } = useAttendance({ page: 0, size: 200 });
  const records: Attendance[] = data?.content ?? [];

  return (
    <div className="mx-auto flex min-w-0 w-full max-w-7xl flex-col gap-6 overflow-x-hidden">
      <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">សង្ខេបវត្តមាន</h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              ផ្ទាំងគ្រប់គ្រងសម្រាប់អ្នកគ្រប់គ្រង ដើម្បីមើលសមត្ថភាពវត្តមាន ការមកទាន់ពេល
              ស្ថានភាពតាមនាយកដ្ឋាន និងសកម្មភាពវេន។
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          ផ្ទុកទិន្នន័យឡើងវិញ
        </Button>
      </div>

      {error ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-destructive/10 p-2 text-destructive">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base text-destructive">
                  មិនអាចផ្ទុកសង្ខេបវត្តមានបានទេ
                </CardTitle>
                <CardDescription className="text-destructive/80">{error.message}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => refetch()}>
              ព្យាយាមម្តងទៀត
            </Button>
          </CardContent>
        </Card>
      ) : (
        <AttendanceSummaryDashboard records={records} isLoading={isLoading} />
      )}
    </div>
  );
}
