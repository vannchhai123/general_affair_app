import { normalizeRole, sanitizePermissionsForRole } from './permissions';

export interface SessionUser {
  uuid: string;
  username?: string;
  fullName: string;
  role: string;
  enabled: boolean;
  avatarUrl?: string;
  permissions: string[];
}

type AuthPayload = {
  uuid?: string;
  username?: string;
  fullName?: string;
  full_name?: string;
  role?: string;
  enabled?: boolean;
  avatarUrl?: string;
  avatar_url?: string;
  imageUrl?: string;
  image_url?: string;
  permissions?: string[];
};

export function normalizeSessionUser(payload: AuthPayload): SessionUser {
  const role = normalizeRole(payload.role);
  return {
    uuid: String(payload.uuid ?? ''),
    username: payload.username,
    fullName: payload.fullName ?? payload.full_name ?? payload.username ?? 'User',
    role,
    enabled: payload.enabled ?? true,
    avatarUrl:
      payload.avatarUrl ?? payload.avatar_url ?? payload.imageUrl ?? payload.image_url ?? '',
    permissions: sanitizePermissionsForRole(role, payload.permissions),
  };
}

export function getSessionDisplayName(user: SessionUser | null) {
  return user?.fullName?.trim() || user?.username?.trim() || 'User';
}
