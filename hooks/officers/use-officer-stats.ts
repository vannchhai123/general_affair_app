import { fetchApi } from '@/lib/api/fetcher';
import { useQuery } from '@tanstack/react-query';
import z from 'zod';

const officerStatsResponseSchema = z.object({
  totalElements: z.number(),
  activeCount: z.number(),
  inactiveCount: z.number(),
  onLeaveCount: z.number(),
});

type OfficerStatsResponse = z.infer<typeof officerStatsResponseSchema>;

type OfficerStats = {
  total: number;
  active: number;
  inactive: number;
  onLeave: number;
};

export function useOfficerStats() {
  return useQuery<OfficerStats>({
    queryKey: ['officer-stats'],
    queryFn: async () => {
      const data = await fetchApi<OfficerStatsResponse, typeof officerStatsResponseSchema>(
        '/officer/stats',
        officerStatsResponseSchema,
      );

      return {
        total: data.totalElements,
        active: data.activeCount,
        inactive: data.inactiveCount,
        onLeave: data.onLeaveCount,
      };
    },
  });
}
