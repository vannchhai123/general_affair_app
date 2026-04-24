import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi, type ApiError } from '@/lib/api/fetcher';
import { reportDataSchema, type ReportData } from '@/lib/schemas';

export function useReports() {
  return useQuery<ReportData, ApiError>({
    queryKey: queryKeys.reports.all,
    queryFn: () => fetchApi('/reports', reportDataSchema),
  });
}
