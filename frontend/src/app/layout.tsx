import type { Metadata } from "next";
import "./globals.css";
import { Navbar }           from "@/components/layout/Navbar";
import { Footer }           from "@/components/layout/Footer";
import { VisiteurTracker }  from "@/components/VisiteurTracker";
import SocialSidebar        from "@/components/layout/SocialSidebar";
import ScrollControls       from "@/components/layout/ScrollControls";
import FloatingCallButton   from "@/components/layout/FloatingCallButton";

export const metadata: Metadata = {
  title: { default: "Espace Vert — Solutions Agricoles", template: "%s | Espace Vert" },
  description: "Leader tunisien en irrigation, fertilisation, semences et machinisme agricole.",
  openGraph: { siteName: "Groupe Espace Vert", locale: "fr_TN", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="flex flex-col min-h-screen">
        {/* Fixed elements */}
        <SocialSidebar />        {/* Réseaux sociaux fixes à gauche */}
        <ScrollControls />       {/* Boutons scroll haut/bas à droite */}
        <FloatingCallButton />   {/* Bouton téléphone flottant bas-droit */}

        <Navbar />
        {/*
          VisiteurTracker — FIX: les visiteurs n'apparaissaient pas en base
          car ce composant était absent. Il POST /api/visiteurs/track à chaque page.
        */}
        <VisiteurTracker />

        <main className="flex-1 pt-[80px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
