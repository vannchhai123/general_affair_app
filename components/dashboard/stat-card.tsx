import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { CardNumber } from '@/components/ui/card-number';
import { ArrowUpRight } from 'lucide-react';

export type DashboardStatCardProps = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtext?: string;
  tone: {
    chip: string;
    icon: string;
    value?: string;
  };
  href?: string;
  onClick?: () => void;
};

export function DashboardStatCard({
  title,
  value,
  icon: Icon,
  tone,
  subtext,
  href,
  onClick,
}: DashboardStatCardProps) {
  const isClickable = Boolean(href || onClick);

  const cardContent = (
    <Card
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable && !href ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`group relative gap-0 h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 ${
        isClickable
          ? 'cursor-pointer hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:scale-[0.99] select-none'
          : 'hover:shadow-md hover:border-slate-300'
      }`}
    >
      <div className="p-4 flex flex-col justify-between h-full">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-khmer-moul-light text-[11px] text-muted-foreground">{title}</p>
            <CardNumber
              value={value}
              className={`mt-2 block text-2xl font-semibold tracking-tight ${tone.value || 'text-slate-900'}`}
            />
          </div>
          <div className="flex items-center gap-1.5">
            {isClickable && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-400">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            )}
            <div className={`rounded-xl p-2.5 ${tone.chip}`}>
              <Icon className={`h-4.5 w-4.5 ${tone.icon}`} />
            </div>
          </div>
        </div>
        {subtext && (
          <p className="mt-2 text-[11px] text-muted-foreground truncate font-medium">{subtext}</p>
        )}
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
