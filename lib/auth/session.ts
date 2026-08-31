import {
  normalizeRole,
  sanitizePermissionsForRole,
  getRoleDisplayKm,
  getHighestHierarchyRole,
  PRESET_ROLES,
} from './permissions';

export interface UserRoleItem {
  id?: number;
  code: string;
  name_km?: string;
  nameKm?: string;
  hierarchy_level?: number;
  hierarchyLevel?: number;
}

export interface SessionUser {
  uuid: string;
  username?: string;
  fullName: string;
  role: string;
  roleNameKm?: string;
  roles: UserRoleItem[];
  roleCodes: string[];
  enabled: boolean;
  avatarUrl?: string;
  permissions: string[];
}

type AuthPayload = {
  uuid?: string;
  username?: string;
  fullName?: string;
  full_name?: string;
  role?: string | UserRoleItem;
  roles?: (string | UserRoleItem)[];
  roleNameKm?: string;
  role_name_km?: string;
  enabled?: boolean;
  avatarUrl?: string;
  avatar_url?: string;
  imageUrl?: string;
  image_url?: string;
  permissions?: string[];
};

export function normalizeSessionUser(payload: AuthPayload): SessionUser {
  // Extract and normalize roles array
  const rawRoles: (string | UserRoleItem)[] = [];
  if (Array.isArray(payload.roles) && payload.roles.length > 0) {
    rawRoles.push(...payload.roles);
  } else if (payload.role) {
    rawRoles.push(payload.role);
  }

  const roleCodes: string[] = [];
  const normalizedRoles: UserRoleItem[] = [];

  for (const r of rawRoles) {
    if (typeof r === 'string') {
      const code = normalizeRole(r);
      if (code && !roleCodes.includes(code)) {
        roleCodes.push(code);
        const preset = PRESET_ROLES.find((p) => p.code === code);
        normalizedRoles.push({
          id: preset?.id,
          code,
          nameKm: preset?.nameKm || getRoleDisplayKm(code),
          hierarchyLevel: preset?.hierarchyLevel || 10,
        });
      }
    } else if (r && typeof r === 'object') {
      const code = normalizeRole(r.code);
      if (code && !roleCodes.includes(code)) {
        roleCodes.push(code);
        normalizedRoles.push({
          id: r.id,
          code,
          nameKm: r.nameKm || r.name_km || getRoleDisplayKm(code),
          hierarchyLevel: r.hierarchyLevel || r.hierarchy_level || 10,
        });
      }
    }
  }

  // Fallback if no roles found
  if (roleCodes.length === 0) {
    roleCodes.push('ROLE_OFFICER');
    normalizedRoles.push({
      id: 7,
      code: 'ROLE_OFFICER',
      nameKm: 'មន្ត្រី',
      hierarchyLevel: 10,
    });
  }

  // Primary role is the highest hierarchy role
  const highestRolePreset = getHighestHierarchyRole(roleCodes);
  const primaryRoleCode = highestRolePreset.code;

  return {
    uuid: String(payload.uuid ?? ''),
    username: payload.username,
    fullName: payload.fullName ?? payload.full_name ?? payload.username ?? 'User',
    role: primaryRoleCode,
    roleNameKm: payload.roleNameKm ?? payload.role_name_km ?? highestRolePreset.nameKm,
    roles: normalizedRoles,
    roleCodes,
    enabled: payload.enabled ?? true,
    avatarUrl:
      payload.avatarUrl ?? payload.avatar_url ?? payload.imageUrl ?? payload.image_url ?? '',
    permissions: sanitizePermissionsForRole(roleCodes, payload.permissions),
  };
}

export function getSessionDisplayName(user: SessionUser | null) {
  return user?.fullName?.trim() || user?.username?.trim() || 'User';
}

export function getSessionRoleNameKm(user: SessionUser | null) {
  if (!user) return 'មន្ត្រី';
  if (user.roles?.length > 1) {
    return user.roles.map((r) => r.nameKm || r.name_km || getRoleDisplayKm(r.code)).join(' & ');
  }
  return user?.roleNameKm || getRoleDisplayKm(user?.role);
}
