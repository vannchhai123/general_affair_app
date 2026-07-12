import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/api/fetcher';
import { invitationApi } from '@/lib/api/invitations';
import { apiFetch } from '@/lib/client';
import type { InvitationFormValues } from '@/lib/schemas/invitation/invitation';

export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InvitationFormValues) => invitationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
      toast.success('បានបង្កើតលិខិតអញ្ជើញដោយជោគជ័យ');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InvitationFormValues> }) =>
      invitationApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
      toast.success('បានកែប្រែព័ត៌មានលិខិតអញ្ជើញដោយជោគជ័យ');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => invitationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all });
      toast.success('បានលុបលិខិតអញ្ជើញដោយជោគជ័យ');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUploadInvitationImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiFetch('/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to upload image');
      }

      return response.json() as Promise<{ id: number; fileName: string; url: string }>;
    },
  });
}
