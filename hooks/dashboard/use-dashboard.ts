import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi, type ApiError } from '@/lib/api/fetcher';
import { dashboardStatsSchema, type DashboardStats } from '@/lib/schemas';

export function useDashboard() {
  return useQuery<DashboardStats, ApiError>({
    queryKey: queryKeys.dashboard.all,
    queryFn: () => fetchApi('/dashboard', dashboardStatsSchema),
  });
}
