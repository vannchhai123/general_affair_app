'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Mail,
  ClipboardCheck,
  FileBarChart,
  Target,
  CalendarOff,
  Clock,
  LogOut,
  Shield,
  ChevronDown,
  QrCode,
  User,
} from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const mainNav = [
  { title: 'ផ្ទាំងគ្រប់គ្រង', href: '/dashboard', icon: LayoutDashboard },
  { title: 'មន្ត្រី', href: '/dashboard/officers', icon: Users },
  { title: 'វត្តមាន', href: '/dashboard/attendance', icon: ClipboardCheck },
  { title: 'វត្តមាន QR', href: '/dashboard/qr-attendance', icon: QrCode },
  { title: 'លិខិតអញ្ជើញ', href: '/dashboard/invitations', icon: Mail },
];

const managementNav = [
  { title: 'បេសកកម្ម', href: '/dashboard/missions', icon: Target },
  { title: 'សំណើសុំឈប់សម្រាក', href: '/dashboard/leave-requests', icon: CalendarOff },
  { title: 'វេនការងារ', href: '/dashboard/shifts', icon: Clock },
];

const systemNav = [
  { title: 'របាយការណ៍', href: '/dashboard/reports', icon: FileBarChart },
  { title: 'សិទ្ធិប្រើប្រាស់', href: '/dashboard/permissions', icon: Shield },
];

interface AppSidebarProps {
  user: {
    full_name: string;
    role_name: string;
    avatar_url?: string;
  };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  const initials = user.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <Sidebar collapsible="icon" className="bg-white border-r border-gray-200 shadow-sm">
      <SidebarHeader className="border-b border-gray-200 bg-gradient-to-b from-blue-50 to-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="group hover:bg-blue-50 hover:text-gray-700 group-data-[collapsible=icon]:justify-center"
            >
              <Link href="/dashboard">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md transition-all group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                  <span className="font-bold text-gray-800 transition-colors group-hover:text-gray-700">
                    OMS Admin
                  </span>
                  <span className="text-xs font-medium text-gray-600 transition-colors group-hover:text-gray-500">
                    ផ្ទាំងគ្រប់គ្រង
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 font-bold uppercase tracking-wide text-xs">
            មេ
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className="hover:bg-blue-50 text-gray-600 hover:text-green-700 data-[active=true]:bg-blue-100 data-[active=true]:text-green-700 data-[active=true]:font-medium transition-all duration-200"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="font-semibold">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 font-bold uppercase tracking-wide text-xs">
            ការគ្រប់គ្រង
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className="hover:bg-blue-50 text-gray-600 hover:text-green-700 data-[active=true]:bg-blue-100 data-[active=true]:text-green-700 data-[active=true]:font-medium transition-all duration-200"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="font-semibold">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 font-bold uppercase tracking-wide text-xs">
            ប្រព័ន្ធ
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className="hover:bg-blue-50 text-gray-600 hover:text-green-700 data-[active=true]:bg-blue-100 data-[active=true]:text-green-700 data-[active=true]:font-medium transition-all duration-200"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="font-semibold">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-gradient-to-t from-gray-50 to-white border-t border-gray-200">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="hover:bg-gray-100">
                  <Avatar className="h-8 w-8 ring-2 ring-blue-100">
                    <AvatarImage src={user.avatar_url} alt={user.full_name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold shadow-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-bold text-sm text-gray-900">{user.full_name}</span>
                    <span className="text-xs text-gray-700 font-medium">{user.role_name}</span>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4 text-gray-700" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    គណនីរបស់ខ្ញុំ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
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
