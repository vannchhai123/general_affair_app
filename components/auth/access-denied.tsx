import Link from 'next/link';
import { LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function AccessDenied({
  title = 'Access denied',
  description = 'You do not have permission to view this page or perform this action.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-xl border-slate-200 shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 px-8 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-700">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">403</p>
            <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">Return to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
