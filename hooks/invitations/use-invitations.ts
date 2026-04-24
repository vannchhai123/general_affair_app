import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/fetcher';
import { invitationApi } from '@/lib/api/invitations';
import type { InvitationsResponse } from '@/lib/schemas';

export function useInvitations() {
  return useQuery<InvitationsResponse, Error>({
    queryKey: queryKeys.invitations.lists(),
    queryFn: invitationApi.list,
  });
}
