import { fetchApi } from '@/lib/api/fetcher';
import { useQuery } from '@tanstack/react-query';
import z from 'zod';

export function useOfficerStats() {
  return useQuery({
    queryKey: ['officer-stats'],
    queryFn: async () => {
      return await fetchApi(
        '/officer/stats',
        z.object({
          total: z.number(),
          active: z.number(),
          inactive: z.number(),
          onLeave: z.number(),
        }),
      );
    },
  });
}
