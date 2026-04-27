'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  OfficerDetailDialog,
  OfficerDialog,
  OfficersAnalyticsCard,
  OfficersDeleteDialog,
  OfficersDirectoryCard,
  OfficersPageHeader,
  OfficersSummaryCards,
  type OfficerFormData,
} from '@/components/officers';
import {
  useCreateOfficer,
  useDeleteOfficer,
  useUpdateOfficer,
  useUploadOfficerImage,
} from '@/hooks/officers/use-officer-mutations';
import { useOfficerStats } from '@/hooks/officers/use-officer-stats';
import { useOfficers } from '@/hooks/officers/use-officers';
import {
  ACCEPTED_OFFICER_IMAGE_TYPES,
  MAX_OFFICER_IMAGE_SIZE_BYTES,
  OFFICERS_PAGE_SIZE,
  getActiveOfficerFilterCount,
  getDepartmentChartData,
  getOfficerFormData,
  getOfficerPagination,
  getOfficerStatusChartData,
} from '@/lib/officers/page-utils';
import type { Officer } from '@/lib/schemas';
import { Users } from 'lucide-react';

export default function OfficersPage() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<
    (OfficerFormData & { id: number }) | undefined
  >();
  const [viewingOfficer, setViewingOfficer] = useState<Officer | null>(null);
  const [deleteOfficerData, setDeleteOfficerData] = useState<Officer | null>(null);

  const { data: stats, isLoading: statsLoading } = useOfficerStats();
  const {
    officers = [],
    total = 0,
    mutate,
    isLoading,
    isError,
    error,
  } = useOfficers({
    search,
    department: department === 'all' ? undefined : department,
    status: status === 'all' ? undefined : status,
    page,
    pageSize: OFFICERS_PAGE_SIZE,
  });

  const createOfficer = useCreateOfficer();
  const updateOfficer = useUpdateOfficer();
  const deleteOfficer = useDeleteOfficer();
  const uploadOfficerImage = useUploadOfficerImage();

  const pagination = getOfficerPagination({
    page,
    pageSize: OFFICERS_PAGE_SIZE,
    total,
  });
  const activeFilterCount = getActiveOfficerFilterCount({ search, department, status });
  const statusChartData = useMemo(() => getOfficerStatusChartData(stats), [stats]);
  const departmentChartData = useMemo(() => getDepartmentChartData(officers), [officers]);

  function resetPage() {
    setPage(1);
  }

  function resetFilters() {
    setSearch('');
    setDepartment('all');
    setStatus('all');
    resetPage();
  }

  function handleAdd() {
    setEditingOfficer(undefined);
    setDialogOpen(true);
  }

  function handleEdit(officer: Officer) {
    setEditingOfficer(getOfficerFormData(officer));
    setDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deleteOfficerData) return;

    await deleteOfficer.mutateAsync(deleteOfficerData.id);
    mutate();
    setDeleteOfficerData(null);
  }

  async function handleSubmit(data: OfficerFormData) {
    if (editingOfficer) {
      await updateOfficer.mutateAsync({ id: editingOfficer.id, data });
    } else {
      await createOfficer.mutateAsync(data);
    }

    mutate();
  }

  function handleUploadImage(officer: Officer) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ACCEPTED_OFFICER_IMAGE_TYPES.join(',');

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (!ACCEPTED_OFFICER_IMAGE_TYPES.includes(file.type)) {
        toast.error('សូមជ្រើសរើសរូបភាពប្រភេទ JPG, PNG ឬ WEBP');
        return;
      }

      if (file.size > MAX_OFFICER_IMAGE_SIZE_BYTES) {
        toast.error('ទំហំរូបភាពត្រូវតែ 5MB ឬតូចជាងនេះ');
        return;
      }

      try {
        await uploadOfficerImage.mutateAsync({ id: officer.id, file });
        mutate();
      } catch {
        // Mutation hook already displays the failure toast.
      }
    };

    input.click();
  }

  if (isError) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader className="gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-destructive/10 p-2 text-destructive">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base text-destructive">
                មិនអាចទាញយកទិន្នន័យមន្ត្រី
              </CardTitle>
              <CardDescription className="text-destructive/80">{error?.message}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <OfficersPageHeader isRefreshing={isLoading} onRefresh={() => mutate()} onAdd={handleAdd} />

      <OfficersSummaryCards stats={stats} isLoading={statsLoading || !stats} />

      <div className="flex flex-col gap-5">
        <OfficersDirectoryCard
          officers={officers}
          total={total}
          isLoading={isLoading}
          search={search}
          department={department}
          status={status}
          activeFilterCount={activeFilterCount}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          startItem={pagination.startItem}
          endItem={pagination.endItem}
          onSearchChange={(value) => {
            setSearch(value);
            resetPage();
          }}
          onDepartmentChange={(value) => {
            setDepartment(value);
            resetPage();
          }}
          onStatusChange={(value) => {
            setStatus(value);
            resetPage();
          }}
          onResetFilters={resetFilters}
          onPageChange={setPage}
          onView={setViewingOfficer}
          onEdit={handleEdit}
          onDelete={setDeleteOfficerData}
          onUploadImage={handleUploadImage}
        />

        <OfficersAnalyticsCard
          statusChartData={statusChartData}
          departmentChartData={departmentChartData}
        />
      </div>

      <OfficerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        officer={editingOfficer}
        onSubmit={handleSubmit}
      />

      <OfficerDetailDialog
        open={!!viewingOfficer}
        onOpenChange={(open) => {
          if (!open) setViewingOfficer(null);
        }}
        officer={viewingOfficer}
        onUploadImage={handleUploadImage}
      />

      <OfficersDeleteDialog
        officer={deleteOfficerData}
        onOpenChange={(open) => !open && setDeleteOfficerData(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
