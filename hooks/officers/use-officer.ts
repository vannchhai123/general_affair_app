import { useQuery } from '@tanstack/react-query';
import { queryKeys, fetchApi, type ApiError } from '@/lib/api/fetcher';
import { officerSchema, type Officer } from '@/lib/schemas';
import { z } from 'zod';

export function useOfficer(id: number) {
  return useQuery<Officer, ApiError>({
    queryKey: queryKeys.officers.detail(id),
    queryFn: async () => {
      const rawData = await fetchApi<any, z.ZodType<any>>(`/officer/${id}`, z.any());
      const target = (rawData as any)?.data || (rawData as any)?.officer || rawData;

      const userId = target?.user_id || target?.userId || target?.user?.id;
      let userRoles =
        target?.roles || target?.user?.roles || target?.user_roles || target?.userRoles || [];

      // If officer doesn't have roles embedded, try to fetch user roles from super-admin/users/{userId}
      if ((!userRoles || userRoles.length === 0) && userId) {
        try {
          const userRaw = await fetchApi<any, z.ZodType<any>>(
            `/super-admin/users/${userId}`,
            z.any(),
          );
          const userData = (userRaw as any)?.data || userRaw;
          if (userData?.roles && Array.isArray(userData.roles)) {
            userRoles = userData.roles;
            target.roles = userData.roles;
          }
        } catch {
          // ignore if super-admin endpoint not accessible
        }
      }

      const parsed = officerSchema.safeParse({
        ...target,
        roles: userRoles.length > 0 ? userRoles : target?.roles,
      });

      if (parsed.success) {
        return parsed.data;
      }

      return {
        id: target?.id || id,
        user_id: userId || null,
        officerCode: target?.officerCode || target?.officer_code || String(target?.id || id),
        first_name_en: target?.first_name_en || target?.first_name || '',
        last_name_en: target?.last_name_en || target?.last_name || '',
        first_name: target?.first_name || target?.first_name_en || '',
        last_name: target?.last_name || target?.last_name_en || '',
        first_name_kh: target?.first_name_kh || target?.firstNameKh || '',
        last_name_kh: target?.last_name_kh || target?.lastNameKh || '',
        department: target?.department || target?.office || '',
        office: target?.office || target?.department || '',
        phone: target?.phone || '',
        position: target?.position || '',
        status: target?.status || 'ACTIVE',
        date_of_birth: target?.date_of_birth || '',
        national_id: target?.national_id || '',
        nationality: target?.nationality || '',
        ethnicity: target?.ethnicity || '',
        hire_date: target?.hire_date || '',
        contract_type: target?.contract_type || '',
        invitation_priority: Boolean(target?.invitation_priority),
        education_level: target?.education_level || '',
        roleCodes: userRoles?.map((r: any) => (typeof r === 'string' ? r : r.code)) || [
          'ROLE_OFFICER',
        ],
        roles: userRoles || [],
        permissions: target?.permissions || [],
      } as Officer;
    },
    enabled: !!id,
  });
}
