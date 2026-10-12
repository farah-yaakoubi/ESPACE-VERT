"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { defaultLocale, getDirection, isLocale, type Locale } from "./config";
import { messages } from "./messages";
import { buildDomTranslationMap } from "./dom-translations";

type I18nContextValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const TRANSLATABLE_ATTRS = ["placeholder", "title", "aria-label", "alt"] as const;
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CODE", "PRE"]);

function translateDom(locale: Locale) {
  if (typeof document === "undefined" || !document.body) return;

  const lookup = buildDomTranslationMap(locale);
  const preserveWhitespace = (source: string, translated: string) => {
    const leading = source.match(/^\s*/)?.[0] ?? "";
    const trailing = source.match(/\s*$/)?.[0] ?? "";
    return `${leading}${translated}${trailing}`;
  };
  const translateValue = (value: string) => {
    const translated = lookup.get(value.replace(/\s+/g, " ").trim());
    return translated ? preserveWhitespace(value, translated) : value;
  };

  const shouldSkip = (node: Node) => {
    const parent = node.parentElement;
    return !parent || SKIP_TAGS.has(parent.tagName) || parent.closest("[data-no-translate]");
  };

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

  for (const node of textNodes) {
    if (shouldSkip(node)) continue;
    const next = translateValue(node.nodeValue ?? "");
    if (next !== node.nodeValue) node.nodeValue = next;
  }

  for (const el of Array.from(document.body.querySelectorAll<HTMLElement>("*"))) {
    if (el.closest("[data-no-translate]") || SKIP_TAGS.has(el.tagName)) continue;
    for (const attr of TRANSLATABLE_ATTRS) {
      const value = el.getAttribute(attr);
      if (!value) continue;
      const next = translateValue(value);
      if (next !== value) el.setAttribute(attr, next);
    }
  }
}

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
    document.documentElement.dataset.locale = locale;
  }, [locale]);

  useEffect(() => {
    let frame = 0;
    const run = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => translateDom(locale));
    };

    run();
    const observer = new MutationObserver(run);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TRANSLATABLE_ATTRS],
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
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
