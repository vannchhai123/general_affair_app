import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { fetchApi } from '@/lib/api/fetcher';
import { queryKeys } from '@/lib/api/query-keys';
import { toast } from '@/lib/toast';

export const assignedRoleSchema = z
  .object({
    id: z.union([z.number(), z.string()]).transform((v) => Number(v)),
    code: z.string().optional(),
    name: z.string().optional(),
    name_km: z.string().optional(),
    nameKm: z.string().optional(),
    permissions: z.array(z.string()).optional(),
  })
  .passthrough();

export const userAccessResponseSchema = z
  .object({
    officerId: z.union([z.number(), z.string()]).optional(),
    userId: z.union([z.number(), z.string()]).optional(),
    fullName: z.string().optional(),
    assignedRoles: z.array(assignedRoleSchema).optional(),
    roles: z.array(assignedRoleSchema).optional(),
    directPermissions: z.array(z.string()).optional(),
    effectivePermissions: z.array(z.string()).optional(),
    data: z.any().optional(),
  })
  .passthrough();

export type UserAccessData = {
  officerId?: number;
  userId?: number;
  assignedRoleIds: number[];
  assignedRoleCodes: string[];
  directPermissions: string[];
  effectivePermissions: string[];
};

export function useUserAccess(userId: number | string | null | undefined) {
  return useQuery<UserAccessData | null>({
    queryKey: ['user-access', userId],
    queryFn: async () => {
      if (!userId) return null;
      try {
        const res = await fetchApi<any, typeof userAccessResponseSchema>(
          `/super-admin/users/${userId}/access`,
          userAccessResponseSchema,
        );

        const payload = res?.data || res;
        const rawRoles = payload?.assignedRoles || payload?.roles || [];
        const assignedRoleIds: number[] = [];
        const assignedRoleCodes: string[] = [];

        rawRoles.forEach((r: any) => {
          const id = Number(r.id);
          if (!isNaN(id) && !assignedRoleIds.includes(id)) {
            assignedRoleIds.push(id);
          }
          const rawCode = r.code || r.role_name || r.name || '';
          if (rawCode) {
            const canonical = rawCode.toUpperCase().startsWith('ROLE_')
              ? rawCode.toUpperCase()
              : `ROLE_${rawCode.toUpperCase()}`;
            if (!assignedRoleCodes.includes(canonical)) {
              assignedRoleCodes.push(canonical);
            }
          }
        });

        const directPermissions = Array.isArray(payload?.directPermissions)
          ? payload.directPermissions.map((p: string) => p.toUpperCase())
          : [];

        const effectivePermissions = Array.isArray(payload?.effectivePermissions)
          ? payload.effectivePermissions.map((p: string) => p.toUpperCase())
          : [];

        return {
          officerId: payload?.officerId ? Number(payload.officerId) : undefined,
          userId: payload?.userId ? Number(payload.userId) : Number(userId),
          assignedRoleIds,
          assignedRoleCodes,
          directPermissions,
          effectivePermissions,
        };
      } catch (err) {
        console.warn('Could not fetch user access from backend:', err);
        return null;
      }
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

export interface UpdateUserAccessPayload {
  userId: number | string;
  roleIds: number[];
  directPermissions: string[];
  reason?: string;
}

export function useUpdateUserAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roleIds, directPermissions, reason }: UpdateUserAccessPayload) => {
      const res = await fetchApi(`/super-admin/users/${userId}/access`, z.any(), {
        method: 'PUT',
        body: JSON.stringify({
          roleIds,
          directPermissions,
          reason: reason || 'Updated roles and direct permissions',
        }),
      });
      return res;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-access', variables.userId] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.officers.detail(Number(variables.userId)),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.officers.all });
      toast.success('បានរក្សាទុកសិទ្ធិ និងតួនាទីជោគជ័យ!');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'បរាជ័យក្នុងការរក្សាទុកសិទ្ធិ និងតួនាទី');
    },
  });
}
