import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi } from '@/lib/api/fetcher';
import { dashboardStatsSchema, type DashboardStats } from '@/lib/schemas';

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.all,
    queryFn: () => fetchApi('/dashboard', dashboardStatsSchema),
  });
}
