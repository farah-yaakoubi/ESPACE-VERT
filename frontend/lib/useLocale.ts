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
    // Remplace /locale_actuelle/ par /nouvelle_locale/ dans le chemin
    const newPath = pathname.replace(/^\/[a-z]{2}(\/|$)/, `/${newLocale}$1`);
    router.push(newPath || `/${newLocale}`);
  };

  return { locale, setLocale };
}