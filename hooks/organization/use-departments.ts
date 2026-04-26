'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/api/fetcher';
import {
  getDepartmentFieldErrors,
  organizationApi,
  type DepartmentListParams,
} from '@/lib/api/organization.api';
import { ApiError } from '@/lib/api/fetcher';
import type {
  DeleteMessageResponse,
  DepartmentFormValues,
  DepartmentsListResponse,
} from '@/lib/schemas';

function toFilterRecord(filters: DepartmentListParams) {
  return Object.fromEntries(
    Object.entries({
      search: filters.search?.trim(),
      status: filters.status,
      page: filters.page?.toString(),
      size: filters.size?.toString(),
    }).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as Record<string, string>;
}

export function useDepartments(filters: DepartmentListParams = {}) {
  const query = useQuery<DepartmentsListResponse, ApiError>({
    queryKey: queryKeys.organization.departments.list(toFilterRecord(filters)),
    queryFn: () => organizationApi.getDepartments(filters),
  });

  return {
    ...query,
    departments: query.data?.content ?? [],
    pagination: query.data
      ? {
          page: query.data.page,
          size: query.data.size,
          totalElements: query.data.totalElements,
          totalPages: query.data.totalPages,
          last: query.data.last,
        }
      : {
          page: filters.page ?? 0,
          size: filters.size ?? 10,
          totalElements: 0,
          totalPages: 0,
          last: true,
        },
    total: query.data?.totalElements ?? 0,
    mutate: query.refetch,
  };
}

export function useDepartment(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.organization.departments.detail(id),
    queryFn: () => organizationApi.getDepartment(id),
    enabled,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: DepartmentFormValues) => {
      const validation = organizationApi.validateDepartment(values);

      if (!validation.success) {
        throw new ApiError('សូមកែតម្រូវវាលនាយកដ្ឋានដែលបានបន្លិច។', 400, 'Bad Request', {
          status: 400,
          message: 'សូមកែតម្រូវវាលនាយកដ្ឋានដែលបានបន្លិច។',
          error: 'Validation Error',
          path: '/organizations/department',
          timestamp: new Date().toISOString(),
          errors: validation.fieldErrors,
        });
      }

      return organizationApi.createDepartment(validation.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.departments.all });
      toast.success('បានរក្សាទុកនាយកដ្ឋានដោយជោគជ័យ។');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: number; values: DepartmentFormValues }) => {
      const validation = organizationApi.validateDepartment(values);

      if (!validation.success) {
        throw new ApiError('សូមកែតម្រូវវាលនាយកដ្ឋានដែលបានបន្លិច។', 400, 'Bad Request', {
          status: 400,
          message: 'សូមកែតម្រូវវាលនាយកដ្ឋានដែលបានបន្លិច។',
          error: 'Validation Error',
          path: `/organizations/department/${id}`,
          timestamp: new Date().toISOString(),
          errors: validation.fieldErrors,
        });
      }

      return organizationApi.updateDepartment(id, validation.data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.departments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.departments.detail(id) });
      toast.success('បានកែប្រែនាយកដ្ឋានដោយជោគជ័យ។');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => organizationApi.deleteDepartment(id),
    onSuccess: (response: DeleteMessageResponse) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.departments.all });
      toast.success(response.message || 'បានលុបនាយកដ្ឋានដោយជោគជ័យ។');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export { getDepartmentFieldErrors };
