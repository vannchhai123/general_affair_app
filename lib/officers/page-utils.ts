import type { Officer } from '@/lib/schemas';
import type { OfficerFormData } from '@/components/officers/officer-dialog';

export const OFFICERS_PAGE_SIZE = 5;
export const MAX_OFFICER_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_OFFICER_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export type OfficerStats = {
  total: number;
  active: number;
  inactive: number;
  onLeave: number;
};

export type OfficerStatusChartItem = {
  key: 'active' | 'onLeave' | 'inactive';
  label: string;
  value: number;
  fill: string;
};

export type DepartmentChartItem = {
  department: string;
  officers: number;
};

export function getOfficerFormData(officer: Officer): OfficerFormData & { id: number } {
  return {
    id: officer.id,
    first_name: officer.first_name,
    last_name: officer.last_name,
    sex: officer.sex || 'male',
    email: officer.email || '',
    position: officer.position,
    department: officer.department,
    phone: officer.phone || '',
    status: officer.status,
    officerCode: officer.officerCode || '',
  };
}

export function getOfficerPagination({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = total === 0 ? 0 : Math.min(currentPage * pageSize, total);

  return {
    totalPages,
    currentPage,
    startItem,
    endItem,
  };
}

export function getActiveOfficerFilterCount({
  search,
  department,
  status,
}: {
  search: string;
  department: string;
  status: string;
}) {
  return [search.length > 0, department !== 'all', status !== 'all'].filter(Boolean).length;
}

export function getOfficerStatusChartData(stats?: OfficerStats): OfficerStatusChartItem[] {
  return [
    {
      key: 'active',
      label: 'សកម្ម',
      value: stats?.active ?? 0,
      fill: 'var(--color-active)',
    },
    {
      key: 'onLeave',
      label: 'ច្បាប់ឈប់សម្រាក',
      value: stats?.onLeave ?? 0,
      fill: 'var(--color-onLeave)',
    },
    {
      key: 'inactive',
      label: 'មិនសកម្ម',
      value: stats?.inactive ?? 0,
      fill: 'var(--color-inactive)',
    },
  ];
}

export function getDepartmentChartData(officers: Officer[]): DepartmentChartItem[] {
  const distribution: Record<string, number> = {};

  for (const officer of officers) {
    const departmentName = officer.department?.trim() || 'មិនទាន់កំណត់';
    distribution[departmentName] = (distribution[departmentName] ?? 0) + 1;
  }

  return Object.entries(distribution)
    .map(([department, officersCount]) => ({
      department,
      officers: officersCount,
    }))
    .sort((left, right) => right.officers - left.officers)
    .slice(0, 6);
}
