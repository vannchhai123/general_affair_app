import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import './globals.css';
import QueryProvider from '@/providers/query-provider';

const khmerFont = localFont({
  src: '../public/fonts/KhmerOSSiemreap.ttf',
  variable: '--font-khmer',
  display: 'swap',
});

const khmerMoulLightFont = localFont({
  src: '../public/fonts/KhmerOSMoulLight.ttf',
  variable: '--font-khmer-moul-light',
  display: 'swap',
});

const khmerBokorFont = localFont({
  src: '../public/fonts/KhmerOSBokor.ttf',
  variable: '--font-khmer-bokor',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const messages = await getMessages();
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
    generator: 'v0.app',
    icons: {
      icon: [
        {
          url: '/icon-light-32x32.png',
          media: '(prefers-color-scheme: light)',
        },
        {
          url: '/icon-dark-32x32.png',
          media: '(prefers-color-scheme: dark)',
        },
        {
          url: '/icon.svg',
          type: 'image/svg+xml',
        },
      ],
      apple: '/apple-icon.png',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html lang="km" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${khmerFont.variable} ${khmerMoulLightFont.variable} ${khmerBokorFont.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>{children}</QueryProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
