'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { RequireAccess } from '@/components/auth/require-access';
import { OfficerForm } from '@/components/officers/officer-form';
import { useDepartments, usePositions } from '@/hooks/organization';
import { useOfficer } from '@/hooks/officers/use-officer';
import { useUpdateOfficer } from '@/hooks/officers/use-officer-mutations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getOfficerFormData } from '@/lib/officers/page-utils';
import type { OfficerFormData } from '@/components/officers/officer-form';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function EditOfficerPage({ params }: EditPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = Number(resolvedParams.id);

  const {
    data: officer,
    isLoading: isOfficerLoading,
    isError: isOfficerError,
    refetch: refetchOfficer,
  } = useOfficer(id);
  const updateOfficer = useUpdateOfficer();

  const deptQuery = useDepartments({ page: 0, size: 100, status: 'active' });
  const posQuery = usePositions({ page: 0, size: 100, status: 'active' });

  const departments = deptQuery.departments ?? [];
  const positions = posQuery.positions ?? [];

  async function handleSubmit(data: OfficerFormData) {
    try {
      await updateOfficer.mutateAsync({ id, data });
      router.push(`/dashboard/officers/${id}`);
    } catch {
      // toast handled by mutation hook
    }
  }

  const isLoading = isOfficerLoading || deptQuery.isLoading || posQuery.isLoading;
  const isError = isOfficerError || deptQuery.isError || posQuery.isError;

  return (
    <RequireAccess permission="OFFICER_UPDATE">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title text-xl font-semibold tracking-tight text-slate-950">
              កែប្រែព័ត៌មានមន្រ្តី
            </h1>
          </div>
          <Button variant="outline" onClick={() => router.push(`/dashboard/officers/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              កំពុងផ្ទុកទិន្នន័យមន្ត្រី អង្គភាព និងមុខតំណែង...
            </div>
          ) : isError || !officer ? (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-destructive">
                មានបញ្ហាក្នុងការទាញទិន្នន័យមន្ត្រី/អង្គភាព/មុខតំណែង។
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    refetchOfficer();
                    deptQuery.mutate?.();
                    deptQuery.refetch?.();
                    posQuery.refetch?.();
                  }}
                >
                  ព្យាយាម​ឡើងវិញ
                </Button>
                <Button variant="ghost" onClick={() => router.push(`/dashboard/officers/${id}`)}>
                  ត្រឡប់
                </Button>
              </div>
            </div>
          ) : (
            <OfficerForm
              officer={officer}
              onSubmit={handleSubmit}
              submitLabel="រក្សាទុកការកែប្រែ"
              onCancel={() => router.push(`/dashboard/officers/${id}`)}
              departments={departments}
              positions={positions}
            />
          )}
        </Card>
      </div>
    </RequireAccess>
  );
}
