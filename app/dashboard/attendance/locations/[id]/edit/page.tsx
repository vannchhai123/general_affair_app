'use client';

import { use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RequireAccess } from '@/components/auth/require-access';
import { LocationFormPage } from '@/components/attendance/location-form-page';
import {
  useAttendanceLocations,
  useUpdateAttendanceLocation,
} from '@/hooks/attendance/use-attendance-locations';
import type {
  CreateAttendanceLocationRequest,
  AttendanceLocation,
} from '@/lib/schemas/attendance/attendance-location.schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

interface EditLocationPageProps {
  params: Promise<{ id: string }>;
}

export default function EditAttendanceLocationPage({ params }: EditLocationPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const rawId = resolvedParams.id;
  const numericId = Number(rawId);

  const { data: locations = [], isLoading, isError, refetch } = useAttendanceLocations();

  const updateLocation = useUpdateAttendanceLocation();

  const location = useMemo<AttendanceLocation | undefined>(() => {
    return locations.find(
      (loc) =>
        (loc.id !== undefined && loc.id === numericId) ||
        String(loc.id) === rawId ||
        encodeURIComponent(loc.name) === rawId ||
        loc.name === decodeURIComponent(rawId),
    );
  }, [locations, numericId, rawId]);

  const handleSubmit = async (data: CreateAttendanceLocationRequest) => {
    try {
      await updateLocation.mutateAsync({
        id: location?.id ?? numericId,
        data,
      });
      router.push('/dashboard/attendance');
    } catch {
      // Toast handled by mutation hook
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-2xl border bg-card py-20 text-center">
        <CardContent className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">កំពុងផ្ទុកទិន្នន័យទីតាំង...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError || !location) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/attendance')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          ត្រឡប់ទៅកាន់ទំព័រវត្តមាន
        </Button>
        <Card className="rounded-2xl border border-destructive/30 p-8 text-center bg-destructive/5">
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <h3 className="text-base font-bold text-foreground">រកមិនឃើញទីតាំងដែលបានជ្រើសរើសទេ</h3>
            <p className="text-xs text-muted-foreground max-w-md">
              ទីតាំងនេះអាចត្រូវបានលុប ឬកូដសម្គាល់មិនត្រឹមត្រូវ។
            </p>
            <Button variant="outline" size="sm" onClick={() => void refetch()} className="mt-2">
              ព្យាយាមផ្ទុកឡើងវិញ
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <RequireAccess permission="ATTENDANCE_VIEW">
      <LocationFormPage
        initialData={location}
        pageTitle={`កែប្រែទីតាំង៖ ${location.name}`}
        onSubmit={handleSubmit}
        isLoading={updateLocation.isPending}
        isEditing={true}
      />
    </RequireAccess>
  );
}
