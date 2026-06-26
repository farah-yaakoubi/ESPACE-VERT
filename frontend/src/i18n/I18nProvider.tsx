"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { defaultLocale, getDirection, isLocale, type Locale } from "./config";
import { messages } from "./messages";

type I18nContextValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  initialLocale = defaultLocale,
  children,
}: {
  initialLocale?: Locale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    // Synchroniser cookie ET localStorage ensemble pour éviter le mismatch SSR/client
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    window.localStorage.setItem("locale", nextLocale);
  };

  useEffect(() => {
    // Lire localStorage seulement si différent du cookie SSR (évite le flash de traduction)
    const stored = window.localStorage.getItem("locale");
    if (isLocale(stored) && stored !== locale) {
      setLocaleState(stored);
      // Resynchroniser le cookie avec localStorage
      document.cookie = `NEXT_LOCALE=${stored}; path=/; max-age=31536000; SameSite=Lax`;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.localStorage.setItem("locale", locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = getDirection(locale);
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    const dict = messages[locale];
    return {
      locale,
      dir: getDirection(locale),
      setLocale,
      t: (key, fallback) => dict[key] ?? messages[defaultLocale][key] ?? fallback ?? key,
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
