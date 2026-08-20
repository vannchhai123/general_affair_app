'use client';

import { useRouter } from 'next/navigation';
import { RequireAccess } from '@/components/auth/require-access';
import { LocationFormPage } from '@/components/attendance/location-form-page';
import { useCreateAttendanceLocation } from '@/hooks/attendance/use-attendance-locations';
import type { CreateAttendanceLocationRequest } from '@/lib/schemas/attendance/attendance-location.schema';

export default function AddQrAttendanceLocationPage() {
  const router = useRouter();
  const createLocation = useCreateAttendanceLocation();

  const handleSubmit = async (data: CreateAttendanceLocationRequest) => {
    try {
      await createLocation.mutateAsync(data);
      router.push('/dashboard/qr-sessions');
    } catch {
      // Toast is handled in mutation hook
    }
  };

  return (
    <RequireAccess permission="QR_SESSION_VIEW">
      <LocationFormPage
        pageTitle="បន្ថែមទីតាំងវត្តមានថ្មី"
        onSubmit={handleSubmit}
        isLoading={createLocation.isPending}
        isEditing={false}
      />
    </RequireAccess>
  );
}
