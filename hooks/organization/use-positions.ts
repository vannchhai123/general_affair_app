'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/api/fetcher';
import {
  getPositionFieldErrors,
  organizationApi,
  type PositionListParams,
} from '@/lib/api/organization.api';
import { ApiError } from '@/lib/api/fetcher';
import type {
  DeleteMessageResponse,
  PositionFormValues,
  PositionsListResponse,
} from '@/lib/schemas';

function toFilterRecord(filters: PositionListParams) {
  return Object.fromEntries(
    Object.entries({
      search: filters.search?.trim(),
      departmentId: filters.departmentId?.toString(),
      status: filters.status,
      page: filters.page?.toString(),
      size: filters.size?.toString(),
    }).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as Record<string, string>;
}

export function usePositions(filters: PositionListParams = {}) {
  const query = useQuery<PositionsListResponse, ApiError>({
    queryKey: queryKeys.organization.positions.list(toFilterRecord(filters)),
    queryFn: () => organizationApi.getPositions(filters),
  });

  return {
    ...query,
    positions: query.data?.content ?? [],
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

export function usePosition(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.organization.positions.detail(id),
    queryFn: () => organizationApi.getPosition(id),
    enabled,
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: PositionFormValues) => {
      const validation = organizationApi.validatePosition(values);

      if (!validation.success) {
        throw new ApiError('Please correct the highlighted position fields.', 400, 'Bad Request', {
          status: 400,
          message: 'Please correct the highlighted position fields.',
          error: 'Validation Error',
          path: '/organizations/position',
          timestamp: new Date().toISOString(),
          errors: validation.fieldErrors,
        });
      }

      return organizationApi.createPosition(validation.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.positions.all });
      toast.success('Position saved successfully.');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: number; values: PositionFormValues }) => {
      const validation = organizationApi.validatePosition(values);

      if (!validation.success) {
        throw new ApiError('Please correct the highlighted position fields.', 400, 'Bad Request', {
          status: 400,
          message: 'Please correct the highlighted position fields.',
          error: 'Validation Error',
          path: `/organizations/position/${id}`,
          timestamp: new Date().toISOString(),
          errors: validation.fieldErrors,
        });
      }

      return organizationApi.updatePosition(id, validation.data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.positions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.positions.detail(id) });
      toast.success('Position updated successfully.');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useDeletePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => organizationApi.deletePosition(id),
    onSuccess: (response: DeleteMessageResponse) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.positions.all });
      toast.success(response.message || 'Position deleted successfully.');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export { getPositionFieldErrors };
