import type { Officer } from '@/lib/schemas';
import type { OfficerFormData } from '@/components/officers/officer-dialog';

export const OFFICERS_PAGE_SIZE = 10;
export const MAX_OFFICER_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_OFFICER_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const OFFICER_CONTRACT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'] as const;

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

export function normalizeOfficerStatus(status?: string | null) {
  const normalized = status
    ?.trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  switch (normalized) {
    case 'active':
      return 'active';
    case 'on_leave':
    case 'leave':
      return 'on_leave';
    case 'inactive':
      return 'inactive';
    default:
      return normalized || '';
  }
}

export function getOfficerFormData(officer: Officer): OfficerFormData & { id: number } {
  const contractType = OFFICER_CONTRACT_TYPES.includes(
    officer.contract_type as (typeof OFFICER_CONTRACT_TYPES)[number],
  )
    ? (officer.contract_type as (typeof OFFICER_CONTRACT_TYPES)[number])
    : 'FULL_TIME';

  return {
    id: officer.id,
    officerCode: officer.officerCode || '',
    first_name_en: officer.first_name_en || officer.first_name || '',
    last_name_en: officer.last_name_en || officer.last_name || '',
    first_name_kh: officer.first_name_kh || '',
    last_name_kh: officer.last_name_kh || '',
    sex: officer.sex || 'male',
    date_of_birth: officer.date_of_birth || '',
    national_id: officer.national_id || '',
    nationality: officer.nationality || '',
    ethnicity: officer.ethnicity || '',
    email: officer.email || '',
    position_id: officer.position_id || 0,
    office_id: officer.office_id || 0,
    education_level: officer.education_level_id ? String(officer.education_level_id) : '',
    hire_date: officer.hire_date || '',
    contract_type: contractType,
    phone: officer.phone || '',
    status: normalizeOfficerStatus(officer.status) || 'active',
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
    .slice(0, 11);
}
