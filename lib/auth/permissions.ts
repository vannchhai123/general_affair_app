export const ADMIN_DEFAULT_PERMISSIONS = [
  'DASHBOARD_VIEW',
  'OFFICER_VIEW',
  'OFFICER_CREATE',
  'OFFICER_UPDATE',
  'OFFICER_DELETE',
  'OFFICER_VIEW_PERMISSION',
  'ATTENDANCE_VIEW',
  'ATTENDANCE_CREATE',
  'ATTENDANCE_UPDATE',
  'ATTENDANCE_EXPORT',
  'ATTENDANCE_IMPORT',
  'ATTENDANCE_SCAN',
  'ORGANIZATION_VIEW',
  'ORGANIZATION_CREATE',
  'ORGANIZATION_UPDATE',
  'ORGANIZATION_DELETE',
] as const;

export const SUPER_ADMIN_ONLY_PERMISSIONS = [
  'QR_SESSION_VIEW',
  'QR_SESSION_CREATE',
  'QR_SESSION_UPDATE',
  'QR_SESSION_END',
  'QR_SESSION_CHECKIN',
  'SHIFT_VIEW',
  'SHIFT_CREATE',
  'SHIFT_UPDATE',
  'SHIFT_DELETE',
  'SHIFT_ASSIGN',
  'PERMISSION_VIEW',
  'PERMISSION_CREATE',
  'PERMISSION_UPDATE',
  'PERMISSION_DELETE',
  'ROLE_ASSIGN_PERMISSION',
  'OFFICER_ASSIGN_PERMISSION',
] as const;

export const KNOWN_PERMISSIONS = [
  ...ADMIN_DEFAULT_PERMISSIONS,
  ...SUPER_ADMIN_ONLY_PERMISSIONS,
] as const;

export type AppPermission = (typeof KNOWN_PERMISSIONS)[number];
export type AppRole = 'ROLE_ADMIN' | 'ROLE_SUPER_ADMIN';

const ADMIN_PERMISSION_SET = new Set<string>(ADMIN_DEFAULT_PERMISSIONS);

export function normalizeRole(role?: string | null): string {
  if (!role) return '';
  const normalized = role.toUpperCase();
  return normalized.startsWith('ROLE_') ? normalized : `ROLE_${normalized}`;
}

export function isAdminRole(role?: string | null) {
  return normalizeRole(role) === 'ROLE_ADMIN';
}

export function isSuperAdminRole(role?: string | null) {
  return normalizeRole(role) === 'ROLE_SUPER_ADMIN';
}

export function sanitizePermissionsForRole(role?: string | null, permissions?: string[] | null) {
  if (isSuperAdminRole(role)) {
    return Array.from(
      new Set((permissions ?? []).filter(Boolean).map((item) => item.toUpperCase())),
    );
  }

  if (!isAdminRole(role)) {
    return Array.from(
      new Set((permissions ?? []).filter(Boolean).map((item) => item.toUpperCase())),
    );
  }

  const source = permissions?.length ? permissions : [...ADMIN_DEFAULT_PERMISSIONS];
  return Array.from(
    new Set(
      source
        .filter(Boolean)
        .map((item) => item.toUpperCase())
        .filter((item) => ADMIN_PERMISSION_SET.has(item)),
    ),
  );
}

export function hasPermission(
  role: string | null | undefined,
  permissions: string[] | undefined,
  required?: string | null,
) {
  if (!required) return true;
  if (isSuperAdminRole(role)) return true;
  return (permissions ?? []).includes(required);
}

export function hasAnyPermission(
  role: string | null | undefined,
  permissions: string[] | undefined,
  required: string[],
) {
  if (isSuperAdminRole(role)) return true;
  return required.some((permission) => (permissions ?? []).includes(permission));
}
