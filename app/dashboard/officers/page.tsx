'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RequireAccess } from '@/components/auth/require-access';
import { useAuth } from '@/components/auth/auth-provider';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  OfficersAnalyticsCard,
  OfficersDeleteDialog,
  OfficersDirectoryCard,
  OfficersPageHeader,
  OfficersSummaryCards,
} from '@/components/officers';
import {
  useCreateOfficer,
  useDeleteOfficer,
  useUpdateOfficer,
  useUploadOfficerImage,
} from '@/hooks/officers/use-officer-mutations';
import { useOfficerStats } from '@/hooks/officers/use-officer-stats';
import { useOfficers } from '@/hooks/officers/use-officers';
import { useDepartments } from '@/hooks/organization/use-departments';
import { usePositions } from '@/hooks/organization/use-positions';
import {
  ACCEPTED_OFFICER_IMAGE_TYPES,
  MAX_OFFICER_IMAGE_SIZE_BYTES,
  OFFICERS_PAGE_SIZE,
  getDepartmentChartData,
  getOfficerFormData,
  getOfficerPagination,
  normalizeOfficerStatus,
  type DepartmentChartItem,
} from '@/lib/officers/page-utils';
import type { Officer } from '@/lib/schemas';
import { Users } from 'lucide-react';

export default function OfficersPage() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteOfficerData, setDeleteOfficerData] = useState<Officer | null>(null);

  const { data: stats, isLoading: statsLoading } = useOfficerStats();
  const { departments = [] } = useDepartments({ page: 0, size: 100 });
  const { positions = [] } = usePositions({ page: 0, size: 200 });
  const {
    officers = [],
    mutate,
    isLoading,
    isError,
    error,
  } = useOfficers({
    page: 1,
    pageSize: 1000,
  });

  const deleteOfficer = useDeleteOfficer();
  const uploadOfficerImage = useUploadOfficerImage();
  const filteredOfficers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return officers.filter((officer: Officer) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          officer.first_name,
          officer.last_name,
          officer.first_name_kh,
          officer.last_name_kh,
          officer.email,
          officer.officerCode,
          officer.phone,
          officer.position,
          officer.department,
          officer.office,
        ]
          .filter((value): value is string => Boolean(value))
          .some((value: string) => value.toLowerCase().includes(normalizedSearch));

      const matchesDepartment =
        department === 'all' || officer.department === department || officer.office === department;
      const matchesPosition =
        positionFilter === 'all' || officer.position === positionFilter;
      const normalizedStatus = normalizeOfficerStatus(officer.status);
      const matchesStatus = status === 'all' || normalizedStatus === status;

      return matchesSearch && matchesDepartment && matchesPosition && matchesStatus;
    });
  }, [department, officers, positionFilter, search, status]);
  const pagination = getOfficerPagination({
    page,
    pageSize: OFFICERS_PAGE_SIZE,
    total: filteredOfficers.length,
  });
  const paginatedOfficers = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * OFFICERS_PAGE_SIZE;
    return filteredOfficers.slice(startIndex, startIndex + OFFICERS_PAGE_SIZE);
  }, [filteredOfficers, pagination.currentPage]);

  const departmentChartData = useMemo(
    () => getDepartmentChartData(filteredOfficers),
    [filteredOfficers],
  );

  const { maleCount, femaleCount, permanentChartData, contractChartData } = useMemo(() => {
    let maleCount = 0;
    let femaleCount = 0;

    const permanentChartData = [
      { key: 'male', label: 'ប្រុស', value: 0, fill: '#0088FE' },
      { key: 'female', label: 'ស្រី', value: 0, fill: '#800080' },
    ];

    const contractChartData = [
      { key: 'male', label: 'ប្រុស', value: 0, fill: '#0088FE' },
      { key: 'female', label: 'ស្រី', value: 0, fill: '#800080' },
    ];

    for (const officer of filteredOfficers) {
      const isFemale = officer.sex === 'female';
      const sexKey = isFemale ? 'female' : 'male';

      if (isFemale) {
        femaleCount += 1;
      } else {
        maleCount += 1;
      }

      const isContract =
        officer.contract_type === 'CONTRACT' || officer.contract_type === 'INTERNSHIP';
      const targetChart = isContract ? contractChartData : permanentChartData;
      const slice = targetChart.find((entry) => entry.key === sexKey);
      if (slice) {
        slice.value += 1;
      }
    }

    return { maleCount, femaleCount, permanentChartData, contractChartData };
  }, [filteredOfficers]);
  const canCreate = hasPermission('OFFICER_CREATE');
  const canUpdate = hasPermission('OFFICER_UPDATE');
  const canDelete = hasPermission('OFFICER_DELETE');
  const canUploadImage = hasPermission('OFFICER_UPDATE');

  function resetPage() {
    setPage(1);
  }

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const editId = params.get('edit');
      if (editId) {
        router.replace(`/dashboard/officers/${editId}/edit`);
      }
    }
  }, [router]);

  function handleAdd() {
    router.push('/dashboard/officers/add');
  }

  function handleEdit(officer: Officer) {
    router.push(`/dashboard/officers/${officer.id}/edit`);
  }

  async function confirmDelete() {
    if (!deleteOfficerData) return;

    await deleteOfficer.mutateAsync(deleteOfficerData.id);
    mutate();
    setDeleteOfficerData(null);
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
    <RequireAccess permission="OFFICER_VIEW">
      <div className="flex w-full min-w-0 flex-col gap-5">
        <OfficersPageHeader
          isRefreshing={isLoading}
          onRefresh={() => mutate()}
          onAdd={canCreate ? handleAdd : undefined}
        />

        <OfficersSummaryCards stats={stats} isLoading={statsLoading || !stats} />

        <div className="flex flex-col gap-5">
          <OfficersAnalyticsCard
            departmentChartData={departmentChartData}
            permanentChartData={permanentChartData}
            contractChartData={contractChartData}
            maleCount={maleCount}
            femaleCount={femaleCount}
          />

          <OfficersDirectoryCard
            officers={paginatedOfficers}
            total={filteredOfficers.length}
            isLoading={isLoading}
            search={search}
            department={department}
            position={positionFilter}
            status={status}
            departments={departments}
            positions={positions}
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
            onPositionChange={(value) => {
              setPositionFilter(value);
              resetPage();
            }}
            onStatusChange={(value) => {
              setStatus(value);
              resetPage();
            }}
            onPageChange={setPage}
            onView={(officer) => router.push(`/dashboard/officers/${officer.id}`)}
            onEdit={canUpdate ? handleEdit : undefined}
            onDelete={canDelete ? (officer) => setDeleteOfficerData(officer) : undefined}
            onUploadImage={canUploadImage ? handleUploadImage : undefined}
          />
        </div>

        <OfficersDeleteDialog
          officer={deleteOfficerData}
          onOpenChange={(open) => !open && setDeleteOfficerData(null)}
          onConfirm={confirmDelete}
        />
      </div>
    </RequireAccess>
  );
}
