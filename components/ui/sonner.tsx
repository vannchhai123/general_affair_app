'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
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
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
