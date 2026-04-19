import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/fetcher';
import { invitationApi } from '@/lib/api/invitations';

export function useInvitations() {
  return useQuery({
    queryKey: queryKeys.invitations.lists(),
    queryFn: invitationApi.list,
  });
}
