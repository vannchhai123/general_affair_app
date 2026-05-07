'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { getPageTitle, getVisibleNavigation } from '@/lib/navigation';
import { cn } from '@/lib/utils';

function isActiveRoute(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  const items = getVisibleNavigation(user);

  return (
    <>
      {items.map((item) => {
        const active = isActiveRoute(pathname, item.href);

        return (
          <SidebarGroup key={item.href} className="px-2 py-0.5">
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={item.title}
                    className={cn(
                      'min-h-[2.5rem] rounded-[2rem] px-4 py-4 text-slate-800 transition-colors [WebkitTapHighlightColor:transparent]',
                      'hover:bg-slate-100 hover:text-slate-950',
                      'active:bg-emerald-50 active:text-emerald-800',
                      'focus-visible:ring-2 focus-visible:ring-emerald-200',
                      'data-[active=true]:bg-emerald-100 data-[active=true]:font-semibold data-[active=true]:text-emerald-900',
                      'group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:min-h-0 group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0',
                    )}
                  >
                    <Link href={item.href} className="flex min-w-0 items-center gap-3">
                      <item.icon className="h-[1.1rem] w-[1.1rem] shrink-0 text-current" />
                      <span className="truncate text-[1.05rem] font-medium leading-[1.7]">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {item.children?.length ? (
                  <div className="ml-4 space-y-1.5 border-l border-slate-200 pl-4 group-data-[collapsible=icon]:hidden">
                    {item.children.map((child) => {
                      const childActive = isActiveRoute(pathname, child.href);

                      return (
                        <SidebarMenuItem key={child.href}>
                          <SidebarMenuButton
                            asChild
                            isActive={childActive}
                            className={cn(
                              'min-h-[2.75rem] rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors [WebkitTapHighlightColor:transparent]',
                              'hover:bg-slate-100 hover:text-slate-900',
                              'active:bg-emerald-50 active:text-emerald-800',
                              'focus-visible:ring-2 focus-visible:ring-emerald-200',
                              'data-[active=true]:bg-emerald-50 data-[active=true]:font-semibold data-[active=true]:text-emerald-900',
                            )}
                          >
                            <Link href={child.href} className="block w-full truncate">
                              <span className="text-[0.98rem] leading-[1.65]">{child.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </div>
                ) : null}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        );
      })}
    </>
  );
}

export function PageHeaderShell() {
  const pathname = usePathname();

  return (
    <div className="min-w-0">
      <h1 className="truncate text-sm font-semibold text-slate-950">{getPageTitle(pathname)}</h1>
    </div>
  );
}

export function AppSidebar() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  }

  const initials =
    (user?.fullName ?? 'User')
      .split(' ')
      .filter(Boolean)
      .map((name) => name[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 bg-white">
      <SidebarHeader className="border-b border-slate-200 bg-white px-4 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="h-14 rounded-2xl border border-transparent px-3 transition hover:bg-slate-50 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
            >
              <Link href="/dashboard">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9">
                  <Image
                    src="/images/images.jpg"
                    alt="General Affair logo"
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
                <div className="min-w-0 leading-none group-data-[collapsible=icon]:hidden">
                  <span className="block truncate text-sm font-bold text-slate-950">
                    ប្រព័ន្ធរដ្ឋបាលទូទៅ
                  </span>
                  <span className="mt-1 block truncate text-xs font-medium text-slate-600">
                    ផ្ទាំងប្រតិបត្តិការរដ្ឋបាល
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-white py-3">
        <SidebarNavigation />
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 bg-white px-4 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-16 rounded-2xl border border-slate-200 bg-white px-3 shadow-sm transition hover:bg-slate-50 data-[state=open]:bg-slate-50 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:shadow-none"
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10 ring-2 ring-slate-100">
                      <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
                      <AvatarFallback className="bg-slate-900 text-xs font-semibold text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                  </div>
                  <div className="min-w-0 flex-1 leading-none group-data-[collapsible=icon]:hidden">
                    <span className="block truncate text-sm font-semibold text-slate-950">
                      {user?.fullName}
                    </span>
                    <span className="mt-1.5 inline-flex max-w-full items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4 text-slate-500 transition-transform data-[state=open]:rotate-180 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-64 rounded-2xl p-2">
                <DropdownMenuLabel className="p-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
                      <AvatarFallback className="bg-slate-900 text-xs font-semibold text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {user?.fullName}
                      </p>
                      <p className="mt-1 truncate text-xs font-medium text-slate-600">
                        {user?.role}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl py-2">
                  <Link href="/dashboard/settings">
                    <User className="mr-2 h-4 w-4" />
                    ប្រវត្តិរូប / ការកំណត់
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
