import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys, fetchApi, ApiError } from '@/lib/api/fetcher';
import { leaveRequestSchema, type LeaveRequest } from '@/lib/schemas';

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<LeaveRequest>) =>
      fetchApi('/api/leave-requests', leaveRequestSchema, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveRequests.all });
      toast.success('Leave request created');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LeaveRequest> }) =>
      fetchApi(`/api/leave-requests/${id}`, leaveRequestSchema, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveRequests.all });
      toast.success('Leave request updated');
    },
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}
