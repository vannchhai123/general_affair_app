'use client';

import { forwardRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, LogOut, User, Menu } from 'lucide-react';
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { getPageTitle, getVisibleNavigation } from '@/lib/navigation';
import { cn } from '@/lib/utils';

function isActiveRoute(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNavigation({ mounted }: { mounted: boolean }) {
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
                    tooltip={mounted ? item.title : undefined}
                    className={cn(
                      'min-h-[2.5rem] rounded-xl px-4 py-4 text-slate-800 transition-all duration-200 [WebkitTapHighlightColor:transparent]',
                      'hover:bg-slate-100 hover:text-slate-950',
                      'active:bg-emerald-50 active:text-emerald-800',
                      'focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-emerald-200',
                      'data-[active=true]:bg-emerald-100 data-[active=true]:font-semibold data-[active=true]:text-emerald-900',
                      'group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:min-h-0 group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0 group-data-[collapsible=icon]:rounded-lg',
                    )}
                  >
                    <Link
                      href={item.href}
                      className="flex min-w-0 items-center gap-3 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:h-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-0"
                    >
                      <item.icon className="h-[1.1rem] w-[1.1rem] shrink-0 text-current" />
                      <span className="truncate text-[1.05rem] font-medium leading-[1.7]">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                  {item.children?.length ? (
                    <SidebarMenuSub className="ml-4 space-y-1.5 border-slate-200 pl-4">
                      {item.children.map((child) => {
                        const childActive = isActiveRoute(pathname, child.href);

                        return (
                          <SidebarMenuSubItem key={child.href}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={childActive}
                              className={cn(
                                'min-h-[2.75rem] rounded-xl px-3 py-2 text-slate-700 transition-colors [WebkitTapHighlightColor:transparent]',
                                'hover:bg-slate-100 hover:text-slate-900',
                                'active:bg-emerald-50 active:text-emerald-800',
                                'focus-visible:ring-2 focus-visible:ring-emerald-200',
                                'data-[active=true]:bg-emerald-50 data-[active=true]:font-semibold data-[active=true]:text-emerald-900',
                              )}
                            >
                              <Link href={child.href} className="block w-full truncate">
                                <span className="text-[0.98rem] leading-[1.65]">{child.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
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
  const pageTitle = getPageTitle(pathname);

  return (
    <div className="min-w-0">
      <h1 className="truncate text-base font-semibold tracking-tight text-slate-900">
        {pageTitle}
      </h1>
    </div>
  );
}

const SidebarUserSummary = forwardRef<
  HTMLButtonElement,
  {
    fullName?: string;
    role?: string;
    avatarUrl?: string;
    initials: string;
    withOpenState: boolean;
  }
>(({ fullName, role, avatarUrl, initials, withOpenState }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'w-full h-14 rounded-lg border border-slate-200 bg-white px-3 shadow-sm transition-all duration-200 hover:bg-slate-50 flex items-center gap-3 cursor-pointer group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:shadow-none',
        withOpenState && 'data-[state=open]:bg-slate-50',
      )}
    >
      <div className="relative shrink-0 pointer-events-none">
        <Avatar className="h-10 w-10 ring-2 ring-slate-100">
          <AvatarImage src={avatarUrl} alt={fullName} />
          <AvatarFallback className="bg-slate-900 text-xs font-semibold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 group-data-[collapsible=icon]:h-2 group-data-[collapsible=icon]:w-2" />
      </div>
      <div className="min-w-0 flex-1 leading-none group-data-[collapsible=icon]:hidden pointer-events-none">
        <span className="block truncate text-sm font-semibold text-slate-950">{fullName}</span>
        <span className="mt-1.5 inline-flex max-w-full items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
          {role}
        </span>
      </div>
      <ChevronDown
        className={cn(
          'ml-auto h-4 w-4 text-slate-500 group-data-[collapsible=icon]:hidden pointer-events-none',
          withOpenState && 'transition-transform data-[state=open]:rotate-180',
        )}
      />
    </button>
  );
});

SidebarUserSummary.displayName = 'SidebarUserSummary';

export function AppSidebar() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        <div className="flex items-center justify-center">
          {/* Sidebar-local toggle: visible only when collapsed (replaces logo visually) */}
          <div className="hidden group-data-[collapsible=icon]:block">
            <SidebarTrigger className="ml-0 size-8 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors [&>svg]:size-6" />
          </div>

          {/* Logo (hidden in collapsed/icon mode) */}
          <Link href="/dashboard" className="block group-data-[collapsible=icon]:hidden">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9">
              <Image
                src="/images/images.jpg"
                alt="General Affair logo"
                width={40}
                height={40}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white py-3">
        <div className="px-2 pb-3 overflow-y-auto">
          <SidebarNavigation mounted={mounted} />
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 bg-white px-4 py-3">
        <div className="flex">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-red-50 transition-colors text-red-600 font-medium group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:border-slate-200"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm group-data-[collapsible=icon]:hidden">ចាកចេញ</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
