import { defaultLocale, type Locale } from "./config";

export type TranslatedFields = Partial<Record<Locale, Record<string, string | null | undefined>>>;

export type TranslatableRecord = {
  translations?: TranslatedFields | string | null;
  [key: string]: unknown;
};

export function translatedField<T extends TranslatableRecord>(
  item: T | null | undefined,
  field: string,
  locale: Locale,
): string {
  if (!item) return "";

  // Certains drivers MySQL (mysql2) renvoient les colonnes JSON sous forme de string
  // On parse défensivement pour garantir un objet utilisable
  let trans = item.translations;
  if (typeof trans === "string") {
    try { trans = JSON.parse(trans) as TranslatedFields; } catch { trans = null; }
  }

  const translated = (trans as TranslatedFields | null | undefined)?.[locale]?.[field];
  if (typeof translated === "string" && translated.trim()) return translated;

  const fallback = (trans as TranslatedFields | null | undefined)?.[defaultLocale]?.[field];
  if (typeof fallback === "string" && fallback.trim()) return fallback;

  const value = item[field];
  return typeof value === "string" ? value : "";
}
