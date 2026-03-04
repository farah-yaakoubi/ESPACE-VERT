import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['fr', 'ar', 'en', 'it', 'es'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // Await requestLocale for Next.js 15 compatibility
  let locale = await requestLocale;
  
  // Valider la locale
  if (!locale || !locales.includes(locale as Locale)) {
    locale = 'fr'; // Fallback to default
  }

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});