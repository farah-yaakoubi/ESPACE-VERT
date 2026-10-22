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
type TranslationState = { source: string; rendered: string };
const textState = new WeakMap<Text, TranslationState>();
const attributeState = new WeakMap<Element, Map<string, TranslationState>>();
const translationCache = new Map<string, string>();
const inFlight = new Set<string>();

async function translateDom(locale: Locale) {
  if (typeof document === "undefined" || !document.body) return;

  const lookup = buildDomTranslationMap(locale);
  const preserveWhitespace = (source: string, translated: string) => {
    const leading = source.match(/^\s*/)?.[0] ?? "";
    const trailing = source.match(/\s*$/)?.[0] ?? "";
    return `${leading}${translated}${trailing}`;
  };
  const pending = new Map<string, Array<() => void>>();

  const shouldSkip = (node: Node) => {
    const parent = node.parentElement;
    return !parent || SKIP_TAGS.has(parent.tagName) || parent.closest("[data-no-translate]");
  };

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

  for (const node of textNodes) {
    if (shouldSkip(node)) continue;
    const current = node.nodeValue ?? "";
    const state = textState.get(node);
    const source = state && current === state.rendered ? state.source : current;
    const normalized = source.replace(/\s+/g, " ").trim();
    if (!normalized) continue;
    if (locale === "fr") {
      if (current !== source) node.nodeValue = source;
      textState.set(node, { source, rendered: source });
      continue;
    }
    const known = lookup.get(normalized);
    const cached = translationCache.get(`${locale}:${normalized}`);
    const translated = known ?? cached;
    if (translated) {
      const rendered = preserveWhitespace(source, translated);
      if (rendered !== current) node.nodeValue = rendered;
      textState.set(node, { source, rendered });
    } else if (!inFlight.has(`${locale}:${normalized}`)) {
      const key = `${locale}:${normalized}`;
      const setter = () => {
        const latest = node.nodeValue ?? "";
        const latestState = textState.get(node);
        const latestSource = latestState && latest === latestState.rendered ? latestState.source : latest;
        if (latestSource.replace(/\s+/g, " ").trim() !== normalized) return;
        const rendered = preserveWhitespace(latestSource, translationCache.get(key) ?? latestSource);
        if (rendered !== latest) node.nodeValue = rendered;
        textState.set(node, { source: latestSource, rendered });
      };
      const setters = pending.get(normalized) ?? [];
      setters.push(setter);
      pending.set(normalized, setters);
    }
  }

  for (const el of Array.from(document.body.querySelectorAll<HTMLElement>("*"))) {
    if (el.closest("[data-no-translate]") || SKIP_TAGS.has(el.tagName)) continue;
    for (const attr of TRANSLATABLE_ATTRS) {
      const current = el.getAttribute(attr);
      if (!current) continue;
      const states = attributeState.get(el) ?? new Map<string, TranslationState>();
      const state = states.get(attr);
      const source = state && current === state.rendered ? state.source : current;
      const normalized = source.replace(/\s+/g, " ").trim();
      if (locale === "fr") {
        if (current !== source) el.setAttribute(attr, source);
        states.set(attr, { source, rendered: source });
        attributeState.set(el, states);
        continue;
      }
      const known = lookup.get(normalized);
      const cached = translationCache.get(`${locale}:${normalized}`);
      const translated = known ?? cached;
      if (translated) {
        const rendered = preserveWhitespace(source, translated);
        if (rendered !== current) el.setAttribute(attr, rendered);
        states.set(attr, { source, rendered });
        attributeState.set(el, states);
      } else if (normalized && !inFlight.has(`${locale}:${normalized}`)) {
        const key = `${locale}:${normalized}`;
        const setters = pending.get(normalized) ?? [];
        setters.push(() => {
          const latest = el.getAttribute(attr) ?? "";
          const latestStates = attributeState.get(el) ?? new Map<string, TranslationState>();
          const latestState = latestStates.get(attr);
          const latestSource = latestState && latest === latestState.rendered ? latestState.source : latest;
          if (latestSource.replace(/\s+/g, " ").trim() !== normalized) return;
          const rendered = preserveWhitespace(latestSource, translationCache.get(key) ?? latestSource);
          if (rendered !== latest) el.setAttribute(attr, rendered);
          latestStates.set(attr, { source: latestSource, rendered });
          attributeState.set(el, latestStates);
        });
        pending.set(normalized, setters);
      }
    }
  }

  const entries = [...pending.entries()];
  for (let start = 0; start < entries.length; start += 40) {
    const batch = entries.slice(start, start + 40);
    batch.forEach(([value]) => inFlight.add(`${locale}:${value}`));
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, texts: batch.map(([value]) => value) }),
      });
      if (!response.ok) continue;
      const result = await response.json() as { translations?: unknown };
      if (!Array.isArray(result.translations) || result.translations.length !== batch.length) continue;
      batch.forEach(([source, setters], index) => {
        const translated = result.translations![index];
        if (typeof translated !== "string" || !translated.trim()) return;
        translationCache.set(`${locale}:${source}`, translated);
        setters.forEach((setter) => setter());
      });
    } catch {
      // Keep the source text visible when the translation service is unavailable.
    } finally {
      batch.forEach(([value]) => inFlight.delete(`${locale}:${value}`));
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
      frame = requestAnimationFrame(() => { void translateDom(locale); });
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
