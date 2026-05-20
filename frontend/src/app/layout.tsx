// src/app/layout.tsx
import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const fontDisplay = Cairo({
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const fontBody = Cairo({
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Espace Vert — Solutions Agricoles", template: "%s | Espace Vert" },
  description: "Leader tunisien en irrigation, fertilisation, semences et machinisme agricole.",
  openGraph: { siteName: "Groupe Espace Vert", locale: "fr_TN", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`scroll-smooth ${fontDisplay.variable} ${fontBody.variable}`}>
      <body className="flex flex-col min-h-screen">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
