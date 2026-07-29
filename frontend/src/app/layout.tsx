// src/app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Fraunces } from "next/font/google";
import { cookies } from "next/headers";
import { I18nProvider } from "@/i18n/I18nProvider";
import { defaultLocale, getDirection, isLocale, type Locale } from "@/i18n/config";
import "./globals.css";

const fontDisplay = localFont({
  src: [
    { path: "../../public/fonts/cairo-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/cairo-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/cairo-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/cairo-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/cairo-latin-800-normal.woff2", weight: "800", style: "normal" },
    { path: "../../public/fonts/cairo-arabic-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/cairo-arabic-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/cairo-arabic-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/cairo-arabic-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/cairo-arabic-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

const fontBody = localFont({
  src: [
    { path: "../../public/fonts/cairo-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/cairo-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/cairo-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/cairo-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/cairo-arabic-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/cairo-arabic-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/cairo-arabic-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/cairo-arabic-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});

const fontSerif = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
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
    <html lang={locale} dir={getDirection(locale)} data-scroll-behavior="smooth" className={`scroll-smooth ${fontDisplay.variable} ${fontBody.variable} ${fontSerif.variable}`}>
      <body className="flex flex-col min-h-screen">
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
