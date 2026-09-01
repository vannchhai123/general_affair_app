import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { queryKeys, fetchApi } from '@/lib/api/fetcher';

export const dynamicRoleSchema = z
  .object({
    id: z.union([z.number(), z.string()]).transform((v) => Number(v)),
    name: z.string().optional(),
    role_name: z.string().optional(),
    roleName: z.string().optional(),
    code: z.string().optional(),
    description: z.string().nullable().optional(),
    name_km: z.string().nullable().optional(),
    nameKm: z.string().nullable().optional(),
    permissions: z.array(z.any()).nullable().optional(),
  })
  .passthrough();

export type DynamicRole = {
  id: number;
  code: string;
  name: string;
  nameKm: string;
  description: string;
  permissions?: string[];
};

export const dynamicRolesListSchema = z.union([
  z.array(dynamicRoleSchema),
  z.object({
    content: z.array(dynamicRoleSchema).optional(),
    data: z.array(dynamicRoleSchema).optional(),
    roles: z.array(dynamicRoleSchema).optional(),
  }),
]);

function normalizeRoleItem(item: z.infer<typeof dynamicRoleSchema>): DynamicRole {
  const rawCode = item.code || item.role_name || item.roleName || item.name || `ROLE_${item.id}`;
  const code = rawCode.toUpperCase().startsWith('ROLE_')
    ? rawCode.toUpperCase()
    : `ROLE_${rawCode.toUpperCase()}`;
  const name = item.name || item.role_name || item.roleName || rawCode;
  const nameKm = item.name_km || item.nameKm || item.name || rawCode;
  const description = item.description || '';

  const permissions: string[] = [];
  if (Array.isArray(item.permissions)) {
    item.permissions.forEach((p) => {
      if (typeof p === 'string') permissions.push(p);
      else if (p && typeof p === 'object' && (p.name || p.code || p.per_name)) {
        permissions.push(p.name || p.code || p.per_name);
      }
    });
  }

  return {
    id: item.id,
    code,
    name,
    nameKm,
    description,
    permissions,
  };
}

export function useRoles() {
  return useQuery<DynamicRole[]>({
    queryKey: queryKeys.roles.all,
    queryFn: async () => {
      // 1. Primary endpoint: /admin/roles
      try {
        const res = await fetchApi<any, typeof dynamicRolesListSchema>(
          '/admin/roles',
          dynamicRolesListSchema,
        );

        let list: any[] = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (res && typeof res === 'object') {
          list = res.content || res.data || res.roles || [];
        }

        if (list.length > 0) return list.map(normalizeRoleItem);
      } catch {
        // Continue to fallback
      }

      // 2. Fallback: /roles
      try {
        const res = await fetchApi<any, typeof dynamicRolesListSchema>(
          '/roles',
          dynamicRolesListSchema,
        );

        let list: any[] = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (res && typeof res === 'object') {
          list = res.content || res.data || res.roles || [];
        }

        if (list.length > 0) return list.map(normalizeRoleItem);
      } catch {
        // Continue to fallback
      }

      // 3. Fallback: /super-admin/roles
      try {
        const fallbackRes = await fetchApi<any, typeof dynamicRolesListSchema>(
          '/super-admin/roles',
          dynamicRolesListSchema,
        );
        let list: any[] = [];
        if (Array.isArray(fallbackRes)) {
          list = fallbackRes;
        } else if (fallbackRes && typeof fallbackRes === 'object') {
          list = fallbackRes.content || fallbackRes.data || fallbackRes.roles || [];
        }
        return list.map(normalizeRoleItem);
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
