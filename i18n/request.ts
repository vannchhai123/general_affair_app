import { getRequestConfig } from 'next-intl/server';

export const locales = ['km'] as const;
export const defaultLocale = 'km';
export type Locale = (typeof locales)[number];

function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export default getRequestConfig(async ({ locale, requestLocale }) => {
  const requestedLocale = locale ?? (await requestLocale);
  const resolvedLocale: Locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
  };
});
