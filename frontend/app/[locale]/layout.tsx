import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import FloatingCallButton from "@/components/FloatingCallButton/FloatingCallButton";
import ScrollControls from "@/components/ScrollControls/ScrollControls";
import "../globals.css";
import SocialSidebar from "@/components/SocialSidebar/SocialSidebar";
import PromoPopup from "@/components/PromoPopup/PromoPopup";

const locales = ["fr", "en", "ar", "es", "it"];

export default async function LocaleLayout({
  children,
  params
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
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className="min-h-screen bg-gradient-to-br from-green-50 to-white">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
          <SocialSidebar />
          <main className="pt-20">
            {children}
          </main>
          <Footer />
          <FloatingCallButton />
          <ScrollControls />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}