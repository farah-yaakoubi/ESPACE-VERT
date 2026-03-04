import Hero from "@/components/Hero/Hero";
import NewsCarousel from "@/components/NewsCarousel/NewsCarousel";
import SocialSidebar from "@/components/SocialSidebar/SocialSidebar";
import HomeNavButtons from "@/components/HomeNavButtons/HomeNavButtons";
import FloatingCallButton from "@/components/FloatingCallButton/FloatingCallButton"; // ← AJOUTER

export default function HomePage() {
  return (
    <div>
      {/* Barre réseaux sociaux fixe à gauche */}
      <SocialSidebar />

      {/* Bouton d'appel flottant fixe à droite */}
      <FloatingCallButton />
      {/* Hero */}
      <Hero />

      <div className="space-y-0">
        {/* Boutons de navigation vers les autres pages */}
        <HomeNavButtons />

        {/* Carousel actualités pleine largeur */}
        <NewsCarousel />

        {/* CTA Contact */}
       
      </div>
    </div>
  );
}