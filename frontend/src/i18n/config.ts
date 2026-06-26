export const locales = ["fr", "ar", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export const localeLabels: Record<Locale, string> = {
  fr: "FR",
  ar: "AR",
  en: "EN",
};

export const localeNames: Record<Locale, string> = {
  fr: "Francais",
  ar: "العربية",
  en: "English",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}

export function getDirection(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}
