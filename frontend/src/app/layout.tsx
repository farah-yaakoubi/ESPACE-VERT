// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Espace Vert — Solutions Agricoles", template: "%s | Espace Vert" },
  description: "Leader tunisien en irrigation, fertilisation, semences et machinisme agricole.",
  openGraph: { siteName: "Groupe Espace Vert", locale: "fr_TN", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="flex flex-col min-h-screen">
        {children}
      </body>
    </html>
  );
}