// src/app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { I18nProvider } from "@/i18n/I18nProvider";
import { defaultLocale, getDirection, isLocale, type Locale } from "@/i18n/config";
import "./globals.css";

/**
 * Cairo — unique typographie du site (latin + arabe natifs dans chaque fichier).
 * Toutes les graisses (200 à 900) sont chargées une seule fois ici ; la hiérarchie
 * visuelle (titres, sous-titres, corps de texte, ex-titre manuscrit "Alex Brush")
 * se fait désormais uniquement via la taille et la graisse — cf. les bonnes
 * pratiques de typographie (un seul caractère, contraste par poids/échelle plutôt
 * que par mélange de polices).
 */
const cairo = localFont({
  src: [
    { path: "../../public/fonts/cairo/Cairo-ExtraLight.ttf", weight: "200", style: "normal" },
    { path: "../../public/fonts/cairo/Cairo-Light.ttf",      weight: "300", style: "normal" },
    { path: "../../public/fonts/cairo/Cairo-Regular.ttf",    weight: "400", style: "normal" },
    { path: "../../public/fonts/cairo/Cairo-SemiBold.ttf",   weight: "600", style: "normal" },
    { path: "../../public/fonts/cairo/Cairo-Bold.ttf",       weight: "700", style: "normal" },
    { path: "../../public/fonts/cairo/Cairo-Black.ttf",      weight: "900", style: "normal" },
  ],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Espace Vert — Solutions Agricoles", template: "%s | Espace Vert" },
  description: "Leader tunisien en irrigation, fertilisation, semences et machinisme agricole.",
  openGraph: { siteName: "Groupe Espace Vert", locale: "fr_TN", type: "website" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  return (
    <html lang={locale} dir={getDirection(locale)} data-scroll-behavior="smooth" className={`scroll-smooth ${cairo.variable}`}>
      <body className="flex flex-col min-h-screen">
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}