import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string | null | undefined, locale = "fr-FR"): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(locale, {
    year: "numeric", month: "long", day: "numeric",
  });
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}
