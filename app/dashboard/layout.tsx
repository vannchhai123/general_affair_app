import { redirect } from 'next/navigation';
import { getSession } from '@/lib/api/auth';
import { AuthProvider } from '@/components/auth/auth-provider';
import { AppSidebar, PageHeaderShell } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect('/');
  }

  return (
    <AuthProvider initialUser={session}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-slate-50">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-slate-200 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/90 md:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 !h-4" />
            <PageHeaderShell />
          </header>
          <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
            {children}
          </div>
          <Toaster richColors />
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
}
