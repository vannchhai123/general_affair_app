import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys, fetchApi, ApiError } from '@/lib/api/fetcher';
import { leaveRequestSchema, type LeaveRequest } from '@/lib/schemas';

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<LeaveRequest>) =>
      fetchApi('/leave-requests', leaveRequestSchema, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveRequests.all });
      toast.success('បង្កើតសំណើច្បាប់បានជោគជ័យ (Leave request created)');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'បង្កើតសំណើច្បាប់មិនបានសម្រេចទេ');
    },
  });
}

export function useUpdateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LeaveRequest> }) =>
      fetchApi(`/leave-requests/${id}`, leaveRequestSchema, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveRequests.all });
      const actionText =
        variables.data.status === 'Approved'
          ? 'បានអនុម័ត'
          : variables.data.status === 'Rejected'
            ? 'បានបដិសេធ'
            : 'បានធ្វើបច្ចុប្បន្នភាព';
      toast.success(`${actionText}សំណើច្បាប់រួចរាល់ (Status updated)`);
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'ធ្វើបច្ចុប្បន្នភាពសំណើច្បាប់មិនបានសម្រេចទេ');
    },
  });
}
