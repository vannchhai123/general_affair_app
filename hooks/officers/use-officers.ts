'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi } from '@/lib/api/fetcher';
import { officerSchema, type Officer } from '@/lib/schemas';
import { z } from 'zod';

const flexibleOfficersResponseSchema = z.union([
  z
    .object({
      content: z.array(z.any()),
      page: z.number().optional(),
      size: z.number().optional(),
      totalElements: z.number().optional(),
      totalPages: z.number().optional(),
      last: z.boolean().optional(),
    })
    .passthrough(),
  z
    .object({
      data: z.union([
        z.array(z.any()),
        z
          .object({
            content: z.array(z.any()).optional(),
            totalElements: z.number().optional(),
            totalPages: z.number().optional(),
          })
          .passthrough(),
      ]),
    })
    .passthrough(),
  z.array(z.any()),
]);

type OfficersQueryData = {
  officers: Officer[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
  last: boolean;
};

export function useOfficers(filters?: {
  search?: string;
  department?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const queryParams = new URLSearchParams();

  if (filters?.search) queryParams.set('search', filters.search);
  if (filters?.department) queryParams.set('department', filters.department);
  if (filters?.status) queryParams.set('status', filters.status);
  if (filters?.page !== undefined) {
    queryParams.set('page', String(filters.page - 1));
  }
  if (filters?.pageSize !== undefined) queryParams.set('size', String(filters.pageSize));
  // Default to newest first so recently created officers appear at the top
  queryParams.set('sort', 'id,desc');

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  const query = useQuery<OfficersQueryData>({
    queryKey: queryKeys.officers.list(
      Object.fromEntries(
        Object.entries({
          search: filters?.search,
          department: filters?.department,
          status: filters?.status,
          page: filters?.page?.toString(),
          pageSize: filters?.pageSize?.toString(),
        }).filter(([, v]) => v !== undefined && v !== null && v !== ''),
      ) as Record<string, string>,
    ),
    queryFn: async () => {
      const rawData = await fetchApi<any, typeof flexibleOfficersResponseSchema>(
        `/officer${queryString}`,
        flexibleOfficersResponseSchema,
      );

      let rawList: any[] = [];
      let total = 0;
      let totalPages = 1;
      let currentPage = 0;

      if (Array.isArray(rawData)) {
        rawList = rawData;
        total = rawData.length;
      } else if (rawData.content && Array.isArray(rawData.content)) {
        rawList = rawData.content;
        total = rawData.totalElements ?? rawData.content.length;
        totalPages = rawData.totalPages ?? Math.ceil(total / (filters?.pageSize ?? 10));
        currentPage = rawData.page ?? 0;
      } else if (rawData.data) {
        if (Array.isArray(rawData.data)) {
          rawList = rawData.data;
          total = rawData.data.length;
        } else if (rawData.data.content && Array.isArray(rawData.data.content)) {
          rawList = rawData.data.content;
          total = rawData.data.totalElements ?? rawData.data.content.length;
          totalPages = rawData.data.totalPages ?? Math.ceil(total / (filters?.pageSize ?? 10));
        }
      }

      const officers = rawList.map((item) => {
        const parsed = officerSchema.safeParse(item);
        if (parsed.success) {
          return parsed.data;
        }
        return {
          id: item.id || 0,
          user_id: item.user_id || item.userId || null,
          officerCode: item.officerCode || item.officer_code || String(item.id || ''),
          first_name_en: item.first_name_en || item.first_name || '',
          last_name_en: item.last_name_en || item.last_name || '',
          first_name: item.first_name || item.first_name_en || '',
          last_name: item.last_name || item.last_name_en || '',
          first_name_kh: item.first_name_kh || item.firstNameKh || '',
          last_name_kh: item.last_name_kh || item.lastNameKh || '',
          department: item.department || item.office || '',
          office: item.office || item.department || '',
          phone: item.phone || '',
          position: item.position || '',
          status: item.status || 'ACTIVE',
          date_of_birth: item.date_of_birth || '',
          national_id: item.national_id || '',
          nationality: item.nationality || '',
          ethnicity: item.ethnicity || '',
          hire_date: item.hire_date || '',
          contract_type: item.contract_type || '',
          invitation_priority: Boolean(item.invitation_priority),
          education_level: item.education_level || '',
          roleCodes: item.roles?.map((r: any) => (typeof r === 'string' ? r : r.code)) || [
            'ROLE_OFFICER',
          ],
          roles: item.roles || [],
          permissions: item.permissions || [],
        } as Officer;
      });

      return {
        officers,
        total: total || officers.length,
        page: currentPage,
        size: filters?.pageSize ?? 10,
        totalPages: totalPages || 1,
        last: currentPage + 1 >= totalPages,
      };
    },
  });

  return {
    ...query,
    officers: query.data?.officers ?? [],
    total: query.data?.total ?? 0,
    pagination: {
      page: query.data?.page ?? (filters?.page ?? 1) - 1,
      size: query.data?.size ?? filters?.pageSize ?? 10,
      totalPages: query.data?.totalPages ?? 0,
      last: query.data?.last ?? true,
    },
    mutate: query.refetch,
  };
}
