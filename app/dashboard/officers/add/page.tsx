'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { RequireAccess } from '@/components/auth/require-access';
import { OfficerForm } from '@/components/officers/officer-form';
import { useDepartments, usePositions } from '@/hooks/organization';
import type { OfficerFormData } from '@/components/officers/officer-dialog';
import { useCreateOfficer } from '@/hooks/officers/use-officer-mutations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function AddOfficerPage() {
  const router = useRouter();
  const createOfficer = useCreateOfficer();

  async function handleSubmit(data: OfficerFormData) {
    try {
      await createOfficer.mutateAsync(data);
      router.push('/dashboard/officers');
    } catch {
      // toast handled by mutation hook
    }
  }

  const deptQuery = useDepartments({ page: 0, size: 100, status: 'active' });
  const posQuery = usePositions({ page: 0, size: 100, status: 'active' });

  const departments = deptQuery.departments ?? [];
  const positions = posQuery.positions ?? [];

  return (
    <RequireAccess permission="OFFICER_CREATE">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title text-2xl font-semibold tracking-tight text-slate-950">
              បន្ថែមមន្រ្តីថ្មី
            </h1>
          </div>
          <Button variant="outline" onClick={() => router.push('/dashboard/officers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {deptQuery.isLoading || posQuery.isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              កំពុងផ្ទុកអង្គភាព និងមុខតំណែង...
            </div>
          ) : deptQuery.isError || posQuery.isError ? (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-destructive">
                មានបញ្ហាក្នុងការទាញទិន្នន័យ​អង្គភាព/មុខតំណែង។
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    deptQuery.mutate?.();
                    deptQuery.refetch?.();
                  }}
                >
                  ព្យាយាម​ឡើងវិញ
                </Button>
                <Button variant="ghost" onClick={() => router.push('/dashboard/officers')}>
                  ត្រឡប់
                </Button>
              </div>
              <pre className="mt-2 w-full overflow-auto text-xs text-slate-700">
                {JSON.stringify(
                  {
                    deptError: (deptQuery as any).error?.message,
                    posError: (posQuery as any).error?.message,
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          ) : (
            <OfficerForm
              onSubmit={handleSubmit}
              submitLabel="បង្កើត"
              onCancel={() => router.push('/dashboard/officers')}
              departments={departments}
              positions={positions}
            />
          )}
        </Card>
      </div>
    </RequireAccess>
  );
}
