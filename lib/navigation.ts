import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  ClipboardCheck,
  KeyRound,
  LayoutDashboard,
  QrCode,
  Settings,
  Shield,
  ShieldCheck,
  Users,
  Workflow,
} from 'lucide-react';
import { hasPermission, isAdminRole, isSuperAdminRole } from '@/lib/auth/permissions';
import type { SessionUser } from '@/lib/auth/session';

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
  permission?: string;
  children?: NavItem[];
};

export const appNavigation: NavItem[] = [
  {
    title: 'ផ្ទាំងគ្រប់គ្រង',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: 'DASHBOARD_VIEW',
  },
  {
    title: 'មន្រ្តី',
    href: '/dashboard/officers',
    icon: Users,
    permission: 'OFFICER_VIEW',
  },
  {
    title: 'វត្តមាន',
    href: '/dashboard/attendance',
    icon: ClipboardCheck,
    permission: 'ATTENDANCE_VIEW',
  },
  {
    title: 'សម័យ QR',
    href: '/dashboard/qr-sessions',
    icon: QrCode,
    roles: ['ROLE_SUPER_ADMIN'],
    permission: 'QR_SESSION_VIEW',
  },
  {
    title: 'គ្រប់គ្រងវេន',
    href: '/dashboard/shift-management',
    icon: Workflow,
    roles: ['ROLE_SUPER_ADMIN'],
    permission: 'SHIFT_VIEW',
  },
  {
    title: 'ចាត់តាំងវេន',
    href: '/dashboard/shift-assignments',
    icon: Workflow,
    roles: ['ROLE_SUPER_ADMIN'],
    permission: 'SHIFT_ASSIGN',
  },
  {
    title: 'អង្គភាព',
    href: '/dashboard/organization/departments',
    icon: Building2,
    permission: 'ORGANIZATION_VIEW',
    children: [
      {
        title: 'នាយកដ្ឋាន',
        href: '/dashboard/organization/departments',
        icon: Building2,
        permission: 'ORGANIZATION_VIEW',
      },
      {
        title: 'តួនាទី',
        href: '/dashboard/organization/positions',
        icon: Building2,
        permission: 'ORGANIZATION_VIEW',
      },
    ],
  },
  {
    title: 'សិទ្ធិប្រើប្រាស់',
    href: '/dashboard/access-control/permissions',
    icon: Shield,
    roles: ['ROLE_SUPER_ADMIN'],
    permission: 'PERMISSION_VIEW',
    children: [
      {
        title: 'សិទ្ធិ',
        href: '/dashboard/access-control/permissions',
        icon: Shield,
        roles: ['ROLE_SUPER_ADMIN'],
        permission: 'PERMISSION_VIEW',
      },
      {
        title: 'សិទ្ធិតាមតួនាទី',
        href: '/dashboard/access-control/role-permissions',
        icon: ShieldCheck,
        roles: ['ROLE_SUPER_ADMIN'],
        permission: 'ROLE_ASSIGN_PERMISSION',
      },
      {
        title: 'សិទ្ធិមន្រ្តី',
        href: '/dashboard/access-control/officer-permissions',
        icon: KeyRound,
        permission: 'OFFICER_VIEW_PERMISSION',
      },
    ],
  },
  {
    title: 'សិទ្ធិមន្រ្តី',
    href: '/dashboard/access-control/officer-permissions',
    icon: KeyRound,
    roles: ['ROLE_ADMIN'],
    permission: 'OFFICER_VIEW_PERMISSION',
  },
  {
    title: 'ប្រវត្តិរូប / ការកំណត់',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function canAccessNavItem(user: SessionUser | null, item: NavItem) {
  if (!user || !user.enabled) return false;
  if (item.roles?.length && !item.roles.includes(user.role)) return false;
  return hasPermission(user.role, user.permissions, item.permission);
}

export function getVisibleNavigation(user: SessionUser | null) {
  return appNavigation
    .filter((item) => canAccessNavItem(user, item))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => canAccessNavItem(user, child)),
    }));
}

export function getPageTitle(pathname: string) {
  for (const item of appNavigation) {
    if (pathname === item.href) return item.title;
    for (const child of item.children ?? []) {
      if (pathname === child.href) return child.title;
    }
  }

  if (pathname.startsWith('/dashboard/officers')) return 'មន្រ្តី';
  if (pathname.startsWith('/dashboard/attendance')) return 'វត្តមាន';
  if (pathname.startsWith('/dashboard/qr-sessions')) return 'សម័យ QR';
  if (pathname.startsWith('/dashboard/shift-management')) return 'គ្រប់គ្រងវេន';
  if (pathname.startsWith('/dashboard/shift-assignments')) return 'ចាត់តាំងវេន';
  if (pathname.startsWith('/dashboard/organization')) return 'អង្គភាព';
  if (pathname.startsWith('/dashboard/access-control')) return 'សិទ្ធិប្រើប្រាស់';
  if (pathname.startsWith('/dashboard/settings')) return 'ប្រវត្តិរូប / ការកំណត់';

  return 'ប្រព័ន្ធរដ្ឋបាលទូទៅ';
}

export function getPageDescription(pathname: string, user: SessionUser | null) {
  if (pathname === '/dashboard') {
    return isSuperAdminRole(user?.role)
      ? 'System-wide operational overview, access control, and shift administration.'
      : 'Daily operations overview for officers, attendance, QR sessions, and organization data.';
  }

  if (
    pathname.startsWith('/dashboard/access-control/officer-permissions') &&
    isAdminRole(user?.role)
  ) {
    return 'Read-only officer permission assignments available to daily operations administrators.';
  }

  return 'Operational workspace for the General Affair System.';
}
