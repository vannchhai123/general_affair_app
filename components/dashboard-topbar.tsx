'use client';

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

export function DashboardHeaderToggle() {
  const { state } = useSidebar();

  if (state === 'collapsed') {
    return null;
  }

  return (
    <>
      <SidebarTrigger className="-ml-1 flex size-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-950 [&>svg]:size-6" />
      <Separator orientation="vertical" className="h-5 bg-slate-200" />
    </>
  );
}
