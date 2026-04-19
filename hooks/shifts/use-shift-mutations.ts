import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys, fetchApi, ApiError } from '@/lib/api/fetcher';
import { shiftSchema, successResponseSchema, type Shift } from '@/lib/schemas';

export function useCreateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Shift>) =>
      fetchApi('/shifts', shiftSchema, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shifts.all });
      toast.success('Shift created');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Shift> }) =>
      fetchApi(`/shifts/${id}`, shiftSchema, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shifts.all });
      toast.success('Shift updated');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      fetchApi(`/shifts/${id}`, successResponseSchema, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shifts.all });
      toast.success('Shift deleted');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}
