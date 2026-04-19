import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi } from '@/lib/api/fetcher';
import { reportDataSchema, type ReportData } from '@/lib/schemas';

export function useReports() {
  return useQuery({
    queryKey: queryKeys.reports.all,
    queryFn: () => fetchApi('/reports', reportDataSchema),
  });
}
