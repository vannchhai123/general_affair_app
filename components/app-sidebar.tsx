'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Building2,
  CalendarOff,
  ChevronDown,
  ClipboardCheck,
  Clock,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  QrCode,
  Shield,
  User,
  Users,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  tone: string;
};

const navSections: Array<{ label: string; items: NavItem[] }> = [
  {
    label: 'មេ',
    items: [
      {
        title: 'ផ្ទាំងគ្រប់គ្រង',
        href: '/dashboard',
        icon: LayoutDashboard,
        tone: 'text-violet-600 bg-violet-50',
      },
      {
        title: 'មន្ត្រី',
        href: '/dashboard/officers',
        icon: Users,
        tone: 'text-sky-600 bg-sky-50',
      },
      {
        title: 'វត្តមាន',
        href: '/dashboard/attendance',
        icon: ClipboardCheck,
        tone: 'text-emerald-600 bg-emerald-50',
      },
      {
        title: 'វត្តមាន QR',
        href: '/dashboard/qr-attendance',
        icon: QrCode,
        tone: 'text-cyan-600 bg-cyan-50',
      },
    ],
  },
  {
    label: 'ការគ្រប់គ្រង',
    items: [
      {
        title: 'នាយកដ្ឋាន និងតួនាទី',
        href: '/dashboard/organization',
        icon: Building2,
        tone: 'text-indigo-600 bg-indigo-50',
      },
      {
        title: 'សំណើសុំឈប់សម្រាក',
        href: '/dashboard/leave-requests',
        icon: CalendarOff,
        tone: 'text-amber-600 bg-amber-50',
      },
      {
        title: 'វេនការងារ',
        href: '/dashboard/shifts',
        icon: Clock,
        tone: 'text-orange-600 bg-orange-50',
      },
    ],
  },
  {
    label: 'ប្រព័ន្ធ',
    items: [
      {
        title: 'សង្ខេបវត្តមាន',
        href: '/dashboard/attendance-summary',
        icon: BarChart3,
        tone: 'text-fuchsia-600 bg-fuchsia-50',
      },
      {
        title: 'របាយការណ៍',
        href: '/dashboard/reports',
        icon: FileBarChart,
        tone: 'text-rose-600 bg-rose-50',
      },
      {
        title: 'សិទ្ធិប្រើប្រាស់',
        href: '/dashboard/permissions',
        icon: Shield,
        tone: 'text-slate-600 bg-slate-100',
      },
    ],
  },
];

interface AppSidebarProps {
  user: {
    full_name: string;
    role_name: string;
    avatar_url?: string;
  };
}

function isActiveRoute(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavSection({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <SidebarGroup className="font-khmer-bokor px-3 py-1.5">
      <SidebarGroupLabel className="h-7 px-2 text-[10px] font-semibold tracking-[0.12em] text-slate-400 group-data-[collapsible=icon]:hidden">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="relative gap-1.5 before:absolute before:bottom-2 before:left-[1.18rem] before:top-2 before:w-px before:bg-slate-100 group-data-[collapsible=icon]:before:hidden">
          {items.map((item) => {
            const active = isActiveRoute(pathname, item.href);

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.title}
                  className={cn(
                    'relative h-11 rounded-2xl px-2.5 text-slate-600 transition-all duration-200',
                    'hover:bg-slate-50 hover:text-slate-950 hover:shadow-sm',
                    'data-[active=true]:bg-white data-[active=true]:font-semibold data-[active=true]:text-slate-950 data-[active=true]:shadow-[0_8px_22px_rgba(15,23,42,0.08)] data-[active=true]:ring-1 data-[active=true]:ring-slate-200/80',
                    'group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
                    active &&
                      'before:absolute before:left-0 before:top-1/2 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:bg-[#3C0366]',
                  )}
                >
                  <Link href={item.href} className="min-w-0">
                    <span
                      className={cn(
                        'relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition-all duration-200',
                        item.tone,
                        active && 'scale-105 shadow-sm',
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 truncate font-medium">{item.title}</span>
                    {active ? (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#3C0366] group-data-[collapsible=icon]:hidden" />
                    ) : null}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  const initials =
    user.full_name
      .split(' ')
      .filter(Boolean)
      .map((name) => name[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  return (
    <Sidebar
      collapsible="icon"
      className="font-khmer-bokor border-r border-slate-200/80 bg-white shadow-[8px_0_24px_rgba(15,23,42,0.04)]"
    >
      <SidebarHeader className="font-khmer-bokor border-b border-slate-200/80 bg-white p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="h-13 rounded-2xl border border-transparent px-2 transition hover:border-emerald-100 hover:bg-emerald-50/60 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
            >
              <Link href="/dashboard">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500/20 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="min-w-0 leading-none group-data-[collapsible=icon]:hidden">
                  <span className="block truncate text-sm font-bold text-slate-950">GAMS</span>
                  <span className="mt-1 block truncate text-xs font-medium text-slate-500">
                    ប្រព័ន្ធគ្រប់គ្រងកិច្ចការទូទៅ
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="font-khmer-bokor bg-white py-3">
        {navSections.map((section) => (
          <NavSection
            key={section.label}
            label={section.label}
            items={section.items}
            pathname={pathname}
          />
        ))}
      </SidebarContent>

      <SidebarFooter className="font-khmer-bokor border-t border-slate-200/80 bg-gradient-to-t from-slate-50 to-white p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-16 rounded-2xl border border-slate-200/80 bg-white px-3 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-md data-[state=open]:border-emerald-200 data-[state=open]:bg-emerald-50/60 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:shadow-none"
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10 ring-2 ring-emerald-100">
                      <AvatarImage src={user.avatar_url} alt={user.full_name} />
                      <AvatarFallback className="bg-emerald-600 text-xs font-semibold text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                  </div>
                  <div className="min-w-0 flex-1 leading-none group-data-[collapsible=icon]:hidden">
                    <span className="block truncate text-sm font-semibold text-slate-950">
                      {user.full_name}
                    </span>
                    <span className="mt-1.5 inline-flex max-w-full items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {user.role_name}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4 text-slate-400 transition-transform data-[state=open]:rotate-180 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="font-khmer-bokor w-64 rounded-2xl p-2"
              >
                <DropdownMenuLabel className="p-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url} alt={user.full_name} />
                      <AvatarFallback className="bg-emerald-600 text-xs font-semibold text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {user.full_name}
                      </p>
                      <p className="mt-1 truncate text-xs font-medium text-slate-500">
                        {user.role_name}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl py-2">
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    គណនីរបស់ខ្ញុំ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  variant="destructive"
                  className="rounded-xl py-2"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  ចាកចេញ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
