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
export type AppRole = 'ROLE_ADMIN' | 'ROLE_HEAD_OFFICE' | string;

// ==========================================
// 🇰🇭 CAMBODIAN ADMINISTRATION PRESET ROLES
// ==========================================
export interface RolePreset {
  id: number;
  code: string;
  aliases?: string[];
  nameKm: string;
  nameEn: string;
  hierarchyLevel: number;
  description: string;
  permissions: string[];
}

export const PRESET_ROLES: RolePreset[] = [
  {
    id: 1,
    code: 'ROLE_GOVERNOR_DEP_1',
    aliases: ['ROLE_SUPER_ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'],
    nameKm: 'អភិបាលរងទី១',
    nameEn: '1st Deputy Governor',
    hierarchyLevel: 95,
    description: 'ដឹកនាំ និងត្រួតពិនិត្យការងាររដ្ឋបាលទូទៅ របាយការណ៍ និងបុគ្គលិក',
    permissions: [
      'DASHBOARD_VIEW',
      'OFFICER_VIEW',
      'OFFICER_VIEW_PERMISSION',
      'ATTENDANCE_VIEW',
      'ATTENDANCE_EXPORT',
      'ORGANIZATION_VIEW',
      'SHIFT_VIEW',
    ],
  },
  {
    id: 2,
    code: 'ROLE_ADMIN_DIRECTOR',
    aliases: ['ROLE_ADMIN', 'ADMIN', 'ROLE_SYSTEM_ADMIN'],
    nameKm: 'នាយករដ្ឋបាល',
    nameEn: 'Director of Administration',
    hierarchyLevel: 80,
    description: 'គ្រប់គ្រងមន្ត្រី បែងចែកវេនការងារ និងវត្តមានទូទៅ',
    permissions: [
      'DASHBOARD_VIEW',
      'OFFICER_VIEW',
      'OFFICER_CREATE',
      'OFFICER_UPDATE',
      'OFFICER_DELETE',
      'OFFICER_VIEW_PERMISSION',
      'OFFICER_ASSIGN_PERMISSION',
      'ATTENDANCE_VIEW',
      'ATTENDANCE_CREATE',
      'ATTENDANCE_UPDATE',
      'ATTENDANCE_EXPORT',
      'ATTENDANCE_IMPORT',
      'SHIFT_VIEW',
      'SHIFT_CREATE',
      'SHIFT_UPDATE',
      'SHIFT_DELETE',
      'SHIFT_ASSIGN',
      'QR_SESSION_VIEW',
      'QR_SESSION_CREATE',
      'QR_SESSION_UPDATE',
      'QR_SESSION_END',
      'ORGANIZATION_VIEW',
      'ORGANIZATION_CREATE',
      'ORGANIZATION_UPDATE',
    ],
  },
  {
    id: 3,
    code: 'ROLE_DEPUTY_ADMIN_DIRECTOR',
    aliases: ['ROLE_HEAD_OFFICE', 'HEAD_OFFICE', 'ROLE_HEADOFFICE'],
    nameKm: 'នាយករងរដ្ឋបាល',
    nameEn: 'Deputy Director of Administration',
    hierarchyLevel: 75,
    description: 'ជួយការងារនាយករដ្ឋបាលក្នុងការគ្រប់គ្រងវេន និងវត្តមាន',
    permissions: [
      'DASHBOARD_VIEW',
      'OFFICER_VIEW',
      'OFFICER_CREATE',
      'OFFICER_UPDATE',
      'OFFICER_VIEW_PERMISSION',
      'ATTENDANCE_VIEW',
      'ATTENDANCE_CREATE',
      'ATTENDANCE_UPDATE',
      'ATTENDANCE_EXPORT',
      'SHIFT_VIEW',
      'SHIFT_CREATE',
      'SHIFT_UPDATE',
      'SHIFT_ASSIGN',
      'QR_SESSION_VIEW',
      'QR_SESSION_CREATE',
      'ORGANIZATION_VIEW',
    ],
  },
  {
    id: 4,
    code: 'ROLE_DEPT_HEAD',
    aliases: ['ROLE_MANAGER', 'MANAGER', 'ROLE_DEPARTMENT_HEAD'],
    nameKm: 'ប្រធានផ្នែក',
    nameEn: 'Department Head',
    hierarchyLevel: 70,
    description: 'ដឹកនាំការងារតាមផ្នែក បែងចែកវេន និងត្រួតពិនិត្យសំណើ',
    permissions: [
      'DASHBOARD_VIEW',
      'OFFICER_VIEW',
      'ATTENDANCE_VIEW',
      'ATTENDANCE_SCAN',
      'ATTENDANCE_CREATE',
      'SHIFT_VIEW',
      'SHIFT_ASSIGN',
    ],
  },
  {
    id: 5,
    code: 'ROLE_OFFICE_CHIEF',
    aliases: ['ROLE_OFFICE_HEAD', 'ROLE_CHIEF_OFFICE'],
    nameKm: 'ប្រធានការិយាល័យ',
    nameEn: 'Office Chief',
    hierarchyLevel: 60,
    description: 'គ្រប់គ្រងវត្តមាន និងវេនការងារមន្ត្រីក្រោមឱវាទការិយាល័យ',
    permissions: [
      'DASHBOARD_VIEW',
      'OFFICER_VIEW',
      'ATTENDANCE_VIEW',
      'ATTENDANCE_SCAN',
      'ATTENDANCE_CREATE',
      'SHIFT_VIEW',
      'SHIFT_ASSIGN',
      'QR_SESSION_VIEW',
      'QR_SESSION_CHECKIN',
    ],
  },
  {
    id: 6,
    code: 'ROLE_DEPUTY_OFFICE_CHIEF',
    aliases: ['ROLE_DEPUTY_CHIEF', 'ROLE_DEPUTY_HEAD_OFFICE'],
    nameKm: 'អនុប្រធានការិយាល័យ',
    nameEn: 'Deputy Office Chief',
    hierarchyLevel: 50,
    description: 'ជួយការងារប្រធានការិយាល័យ និងកត់ត្រាវត្តមាន',
    permissions: [
      'DASHBOARD_VIEW',
      'OFFICER_VIEW',
      'ATTENDANCE_VIEW',
      'ATTENDANCE_SCAN',
      'SHIFT_VIEW',
      'QR_SESSION_VIEW',
    ],
  },
  {
    id: 7,
    code: 'ROLE_OFFICER',
    aliases: ['OFFICER', 'ROLE_USER', 'USER', 'STAFF'],
    nameKm: 'មន្ត្រី',
    nameEn: 'Officer',
    hierarchyLevel: 10,
    description: 'មន្ត្រីប្រតិបត្តិការទូទៅ ស្កេនវត្តមានផ្ទាល់ខ្លួន',
    permissions: ['ATTENDANCE_SCAN'],
  },
];

export function extractCanonicalRoleCode(r: any): string {
  if (!r) return 'ROLE_OFFICER';
  let raw = '';
  if (typeof r === 'string') {
    raw = r.trim().toUpperCase();
  } else if (typeof r === 'number') {
    const preset = PRESET_ROLES.find((p) => p.id === r);
    if (preset) return preset.code;
    raw = String(r);
  } else if (typeof r === 'object') {
    raw = String(
      r.code || r.roleCode || r.role_code || r.name || r.roleName || r.role_name || r.id || '',
    )
      .trim()
      .toUpperCase();
    if (r.id) {
      const preset = PRESET_ROLES.find((p) => p.id === Number(r.id));
      if (preset) return preset.code;
    }
  }

  if (!raw.startsWith('ROLE_') && !raw.startsWith('ID_')) {
    raw = `ROLE_${raw}`;
  }

  // Check exact code match
  const exact = PRESET_ROLES.find((p) => p.code === raw);
  if (exact) return exact.code;

  // Check alias match
  const alias = PRESET_ROLES.find(
    (p) => p.aliases?.includes(raw) || p.aliases?.includes(raw.replace('ROLE_', '')),
  );
  if (alias) return alias.code;

  return raw;
}

export function getRoleDisplayKm(roleCode?: string | null): string {
  if (!roleCode) return 'មន្ត្រី';
  const canonical = extractCanonicalRoleCode(roleCode);
  const found = PRESET_ROLES.find((r) => r.code === canonical);
  if (found) return found.nameKm;
  if (roleCode === 'ROLE_ADMIN' || roleCode === 'ADMIN') return 'អ្នកគ្រប់គ្រងប្រព័ន្ធ';
  if (roleCode === 'ROLE_SUPER_ADMIN') return 'អភិបាលជាន់ខ្ពស់';
  if (roleCode === 'ROLE_HEAD_OFFICE') return 'រដ្ឋបាលកណ្តាល';
  return roleCode;
}

export function getRolePresetByCode(roleCode?: string | null): RolePreset | undefined {
  if (!roleCode) return undefined;
  const canonical = extractCanonicalRoleCode(roleCode);
  return PRESET_ROLES.find((r) => r.code === canonical);
}

export function getRolePresetById(roleId?: number | null): RolePreset | undefined {
  if (!roleId) return undefined;
  return PRESET_ROLES.find((r) => r.id === roleId);
}

export function getPermissionsForRole(roleCode: string): string[] {
  const canonical = extractCanonicalRoleCode(roleCode);
  const found = PRESET_ROLES.find((r) => r.code === canonical);
  return found ? found.permissions : [...ADMIN_DEFAULT_PERMISSIONS];
}

/**
 * Merges permissions from multiple role codes into a single deduplicated set.
 */
export function getMergedPermissionsForRoles(roleCodes: string[]): string[] {
  const permissionsSet = new Set<string>();
  roleCodes.forEach((code) => {
    const perms = getPermissionsForRole(code);
    perms.forEach((p) => permissionsSet.add(p));
  });
  return Array.from(permissionsSet);
}

/**
 * Returns the highest hierarchy level role from a list of role codes.
 */
export function getHighestHierarchyRole(roleCodes: string[]): RolePreset {
  if (!roleCodes.length) return PRESET_ROLES[PRESET_ROLES.length - 1];
  let highest =
    PRESET_ROLES.find((r) => r.code === extractCanonicalRoleCode(roleCodes[0])) ||
    PRESET_ROLES[PRESET_ROLES.length - 1];
  for (const code of roleCodes) {
    const canonical = extractCanonicalRoleCode(code);
    const preset = PRESET_ROLES.find((r) => r.code === canonical);
    if (preset && preset.hierarchyLevel > highest.hierarchyLevel) {
      highest = preset;
    }
  }
  return highest;
}

const ADMIN_PERMISSION_SET = new Set<string>(ADMIN_DEFAULT_PERMISSIONS);

export function normalizeRole(role?: string | null): string {
  if (!role) return '';
  const normalized = role.toUpperCase();
  return normalized.startsWith('ROLE_') ? normalized : `ROLE_${normalized}`;
}

export function isAdminRole(role?: string | string[] | null) {
  if (Array.isArray(role)) {
    return role.some((r) => {
      const norm = normalizeRole(r);
      return norm === 'ROLE_HEAD_OFFICE' || norm === 'ROLE_ADMIN' || norm === 'ROLE_ADMIN_DIRECTOR';
    });
  }
  const norm = normalizeRole(role);
  return norm === 'ROLE_HEAD_OFFICE' || norm === 'ROLE_ADMIN' || norm === 'ROLE_ADMIN_DIRECTOR';
}

export function isSuperAdminRole(role?: string | string[] | null) {
  if (Array.isArray(role)) {
    return role.some((r) => {
      const norm = normalizeRole(r);
      return norm === 'ROLE_ADMIN' || norm === 'ROLE_SUPER_ADMIN' || norm === 'ROLE_GOVERNOR_DEP_1';
    });
  }
  const norm = normalizeRole(role);
  return norm === 'ROLE_ADMIN' || norm === 'ROLE_SUPER_ADMIN' || norm === 'ROLE_GOVERNOR_DEP_1';
}

export function sanitizePermissionsForRole(
  role?: string | string[] | null,
  permissions?: string[] | null,
) {
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
  role: string | string[] | null | undefined,
  permissions: string[] | undefined,
  required?: string | null,
) {
  if (!required) return true;
  if (isSuperAdminRole(role)) return true;
  return (permissions ?? []).includes(required);
}

export function hasAnyPermission(
  role: string | string[] | null | undefined,
  permissions: string[] | undefined,
  required: string[],
) {
  if (isSuperAdminRole(role)) return true;
  return required.some((permission) => (permissions ?? []).includes(permission));
}
