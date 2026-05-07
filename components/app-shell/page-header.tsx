import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between',
        className,
      )}
    >
      <div className="space-y-1.5">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            {eyebrow}
          </p>
        ) : null}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
          {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
