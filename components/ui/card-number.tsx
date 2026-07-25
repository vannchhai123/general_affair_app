import { cn } from '@/lib/utils';

export function CardNumber({
  value,
  className,
}: {
  value: string | number | null | undefined;
  className?: string;
}) {
  return (
    <span className={cn('font-sans', className)}>
      {value === null || value === undefined ? '--' : String(value)}
    </span>
  );
}
