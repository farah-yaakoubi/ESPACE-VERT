"use client";

import { localeLabels, localeNames, locales } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      aria-label={t("lang.label")}
      className="flex items-center rounded-full border border-black/10 bg-white/80 p-1 shadow-sm backdrop-blur"
      dir="ltr"
    >
      {locales.map((item) => (
        <button
          key={item}
          type="button"
          title={localeNames[item]}
          aria-pressed={locale === item}
          onClick={() => setLocale(item)}
          className={[
            "h-7 rounded-full px-2.5 text-[11px] font-black transition",
            compact ? "min-w-8" : "min-w-9",
            locale === item ? "bg-[#2e7d4f] text-white" : "text-[#2e7d4f] hover:bg-[#e8f5ee]",
          ].join(" ")}
        >
          {localeLabels[item]}
        </button>
      ))}
    </div>
  );
}
