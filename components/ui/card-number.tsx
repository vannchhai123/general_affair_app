import { cn, formatKhmerNumerals } from '@/lib/utils';

export function CardNumber({
  value,
  className,
}: {
  value: string | number | null | undefined;
  className?: string;
}) {
  return (
    <span className={cn('font-khmer-moul-light', className)}>
      {value === null || value === undefined ? '--' : formatKhmerNumerals(value)}
    </span>
  );
}
