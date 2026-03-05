import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import FloatingCallButton from "@/components/FloatingCallButton/FloatingCallButton";
import ScrollControls from "@/components/ScrollControls/ScrollControls";
import HashScrollHandler from "@/components/HashScrollHandler/HashScrollHandler";
import SocialSidebar from "@/components/SocialSidebar/SocialSidebar";
import PromoPopup from "@/components/PromoPopup/PromoPopup";
import "../globals.css";

const locales = ["fr", "en", "ar", "es", "it"];

export const metadata: Metadata = {
  title: "Espace Vert",
  description: "Site officiel Espace Vert — Solutions agricoles en Tunisie",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Lora:ital,wght@0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
          <SocialSidebar />
          <HashScrollHandler />
          <main className="pt-20">
            {children}
          </main>
          <Footer />
          <FloatingCallButton />
          <ScrollControls />
          <PromoPopup />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
