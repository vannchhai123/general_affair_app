import { redirect } from 'next/navigation';
import { getSession } from '@/lib/api/auth';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect('/');
  }

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          full_name: session.full_name,
          role_name: session.role_name,
          avatar_url: session.avatar_url,
        }}
      />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 !h-4" />
          <span className="text-sm font-medium text-muted-foreground">
            Officer Management System
          </span>
        </header>
        <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          {children}
        </div>
        <Toaster richColors />
      </SidebarInset>
    </SidebarProvider>
  );
}
