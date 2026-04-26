'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { organizationApi } from '@/lib/api/organization.api';
import { fetchApi, queryKeys } from '@/lib/api/fetcher';
import { shiftManagementService } from '@/lib/shifts/service';
import { createOptimisticStatusState } from '@/lib/shifts/utils';
import {
  officerSchema,
  shiftSchema,
  type Department,
  type Position,
  type Officer,
  type ShiftListResponse,
  type Shift,
  type ShiftAssignmentScope,
  type ShiftFormInput,
  type WeeklyTemplate,
} from '@/lib/schemas';
import { z } from 'zod';

type ShiftListFilters = {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  page?: number;
  size?: number;
};

const paginatedOfficersResponseSchema = z.object({
  content: z.array(officerSchema),
});

export function useShiftList(filters: ShiftListFilters) {
  const filterKey = Object.fromEntries(
    Object.entries({
      search: filters.search,
      status: filters.status,
      page: filters.page?.toString(),
      size: filters.size?.toString(),
    }).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as Record<string, string>;

  return useQuery({
    queryKey: queryKeys.shifts.list(filterKey),
    queryFn: () => shiftManagementService.listShifts(filters),
  });
}

export function useShiftDetail(id?: number) {
  return useQuery({
    queryKey: queryKeys.shifts.detail(id ?? 0),
    queryFn: () => shiftManagementService.getShift(id as number),
    enabled: Boolean(id),
  });
}

export function useShiftAssignments(scope: ShiftAssignmentScope, id?: number) {
  return useQuery({
    queryKey: queryKeys.shifts.assignments(scope, id),
    queryFn: () => shiftManagementService.listTemplates(scope, id),
    enabled: Boolean(id),
  });
}

export function useShiftAudit(id?: number) {
  return useQuery({
    queryKey: [...queryKeys.shifts.detail(id ?? 0), 'audit'],
    queryFn: () => shiftManagementService.getShiftAudit(id as number),
    enabled: Boolean(id),
  });
}

export function useShiftReferenceData() {
  return useQuery({
    queryKey: queryKeys.shifts.references(),
    queryFn: async () => {
      const [departmentsResult, positionsResult, officersResult] = await Promise.allSettled([
        organizationApi.getDepartments({ page: 0, size: 100 }) as Promise<{
          content: Department[];
        }>,
        organizationApi.getPositions({ page: 0, size: 100 }) as Promise<{ content: Position[] }>,
        fetchApi('/officer?page=0&size=100', paginatedOfficersResponseSchema) as Promise<{
          content: Officer[];
        }>,
      ]);

      return {
        departments:
          departmentsResult.status === 'fulfilled' ? departmentsResult.value.content : [],
        positions: positionsResult.status === 'fulfilled' ? positionsResult.value.content : [],
        employees: officersResult.status === 'fulfilled' ? officersResult.value.content : [],
      };
    },
  });
}

export function useCreateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ShiftFormInput) => shiftManagementService.createShift(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shifts.all });
      toast.success('Shift created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create shift');
    },
  });
}

export function useUpdateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ShiftFormInput }) =>
      shiftManagementService.updateShift(id, input),
    onSuccess: (shift) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shifts.all });
      if (shift) {
        queryClient.setQueryData(queryKeys.shifts.detail(shift.id), shiftSchema.parse(shift));
      }
      toast.success('Shift updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update shift');
    },
  });
}

export function useToggleShiftStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: Shift['status'] }) =>
      shiftManagementService.updateShiftStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.shifts.all });
      const snapshots = queryClient.getQueriesData({
        queryKey: queryKeys.shifts.lists(),
      });

      snapshots.forEach(([key, value]) => {
        const data = value as ShiftListResponse | undefined;

        if (!data || typeof data !== 'object' || !('content' in data)) return;

        queryClient.setQueryData(key, {
          ...data,
          content: createOptimisticStatusState(data.content, id, status),
        });
      });

      return { snapshots };
    },
    onError: (error: Error, _variables, context) => {
      context?.snapshots.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
      toast.error(error.message || 'Failed to update status');
    },
    onSuccess: (shift) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shifts.all });
      if (shift) {
        queryClient.setQueryData(queryKeys.shifts.detail(shift.id), shift);
      }
      toast.success('Shift status updated');
    },
  });
}

export function useDeleteShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => shiftManagementService.deleteShift(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shifts.all });
      toast.success('Shift deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete shift');
    },
  });
}

export function useSaveShiftTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (template: WeeklyTemplate) => shiftManagementService.saveTemplate(template),
    onSuccess: (_template, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.shifts.assignments(variables.scope, variables.scopeId),
      });
      toast.success('Shift assignment template saved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save template');
    },
  });
}
