'use client';

import * as React from 'react';
import 'sonner/dist/styles.css';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      richColors
      duration={3000}
      closeButton
      visibleToasts={3}
      gap={10}
      icons={{
        success: <CheckCircle2 className="h-4 w-4" />,
        error: <AlertTriangle className="h-4 w-4" />,
        warning: <AlertCircle className="h-4 w-4" />,
        info: <Info className="h-4 w-4" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'rounded-2xl border bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 px-4 py-3 shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5',
          title: 'text-sm font-semibold',
          description: 'text-sm opacity-90',
          closeButton:
            'text-slate-500 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2',
          success: 'border-emerald-300 bg-emerald-50 text-emerald-900',
          error: 'border-rose-300 bg-rose-50 text-rose-900',
          warning: 'border-amber-300 bg-amber-50 text-amber-900',
          info: 'border-sky-300 bg-sky-50 text-sky-900',
        },
      }}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'var(--success-bg)',
          '--success-text': 'var(--success-text)',
          '--success-border': 'var(--success-border)',
          '--error-bg': 'var(--error-bg)',
          '--error-text': 'var(--error-text)',
          '--error-border': 'var(--error-border)',
          '--warning-bg': 'var(--warning-bg)',
          '--warning-text': 'var(--warning-text)',
          '--warning-border': 'var(--warning-border)',
          '--info-bg': 'var(--info-bg)',
          '--info-text': 'var(--info-text)',
          '--info-border': 'var(--info-border)',
        } as unknown as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
