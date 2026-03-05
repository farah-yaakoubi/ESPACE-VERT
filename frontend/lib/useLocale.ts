'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';

export function useLocale() {
  const params   = useParams();
  const router   = useRouter();
  const pathname = usePathname();

  // Locale vient toujours du segment URL : /ar/marques → "ar"
  // Synchronisé avec next-intl qui charge les messages depuis la même URL
  const locale = (params?.locale as string) || 'fr';

  const setLocale = (newLocale: string) => {
  const newPath = pathname.replace(/^\/[a-z]{2}(\/|$)/, `/${newLocale}$1`);
  window.location.href = newPath || `/${newLocale}`;
};

  return { locale, setLocale };
}