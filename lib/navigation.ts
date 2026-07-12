import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Building2,
  ClipboardCheck,
  KeyRound,
  LayoutDashboard,
  Mail,
  QrCode,
  Settings,
  Shield,
  ShieldCheck,
  Users,
  Workflow,
  FolderOpen,
} from 'lucide-react';
import { hasPermission, isSuperAdminRole } from '@/lib/auth/permissions';
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
    title: 'មន្ត្រី',
    href: '/dashboard/officers',
    icon: Users,
    permission: 'OFFICER_VIEW',
  },
  {
    title: 'Download ទិន្នន័យវត្តមាន',
    href: '/dashboard/attendance',
    icon: ClipboardCheck,
    permission: 'ATTENDANCE_VIEW',
  },
  {
    title: 'សង្ខេបវត្តមាន',
    href: '/dashboard/attendance-summary',
    icon: BarChart3,
    permission: 'ATTENDANCE_VIEW',
  },
  {
    title: 'លិខិតអញ្ជើញ គណៈអភិបាល',
    href: '/dashboard/invitations',
    icon: Mail,
  },
  {
    title: 'គ្រប់គ្រងឯកសារ',
    href: '/dashboard/document-management',
    icon: FolderOpen,
  },
  {
    title: 'QR Code វត្តមាន',
    href: '/dashboard/qr-sessions',
    icon: QrCode,
    roles: ['ROLE_ADMIN'],
    permission: 'QR_SESSION_VIEW',
  },
  {
    title: 'កំណត់ការចុះវត្តមាន',
    href: '/dashboard/shift-management',
    icon: Workflow,
    roles: ['ROLE_ADMIN'],
    permission: 'SHIFT_VIEW',
  },
  {
    title: 'ការិយាល័យ',
    href: '/dashboard/organization/departments',
    icon: Building2,
    roles: ['ROLE_ADMIN'],
    permission: 'ORGANIZATION_VIEW',
  },
  {
    title: 'កំណត់សិទ្ធិប្រើប្រាស់',
    href: '/dashboard/access-control/officer-permissions',
    icon: KeyRound,
    roles: ['ROLE_ADMIN'],
    permission: 'OFFICER_VIEW_PERMISSION',
  },
  {
    title: 'ប្រវត្តិរូប',
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

  if (pathname.startsWith('/dashboard/officers')) return 'មន្ត្រី';
  if (pathname.startsWith('/dashboard/invitations')) return 'ការអញ្ជើញ';
  if (pathname.startsWith('/dashboard/attendance')) return 'វត្តមាន';
  if (pathname.startsWith('/dashboard/qr-sessions')) return 'សម័យ QR';
  if (pathname.startsWith('/dashboard/shift-management')) return 'គ្រប់គ្រងវេន';
  if (pathname.startsWith('/dashboard/document-management')) return 'គ្រប់គ្រងឯកសារ';
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

  return 'Operational workspace for the General Affair System.';
}
