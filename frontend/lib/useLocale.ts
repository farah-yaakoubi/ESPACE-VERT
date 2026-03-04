'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useLocale() {
  const router = useRouter();
  const [locale, setLocaleState] = useState('fr');

  useEffect(() => {
    const storedLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1] || 'fr';
    
    setLocaleState(storedLocale);
  }, []);

  const setLocale = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLocale;
    setLocaleState(newLocale);
    router.refresh();
  };

  return { locale, setLocale };
}