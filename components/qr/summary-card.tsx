'use client';

import type { ComponentType } from 'react';

interface SummaryCardProps {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

export function SummaryCard({ label, value, icon: Icon, color, bg }: SummaryCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${bg} shadow-sm transition-shadow hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
