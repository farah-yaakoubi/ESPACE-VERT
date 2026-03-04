import Hero from "@/components/Hero/Hero";
import NewsCarousel from "@/components/NewsCarousel/NewsCarousel";
import SocialSidebar from "@/components/SocialSidebar/SocialSidebar";
import HomeNavButtons from "@/components/HomeNavButtons/HomeNavButtons";
import FloatingCallButton from "@/components/FloatingCallButton/FloatingCallButton";
import PartnersLogoStrip from "@/components/PartnersLogoStrip/PartnersLogoStrip";

export default function HomePage() {
  return (
    <div>
      {/* Barre réseaux sociaux fixe à gauche */}
      <SocialSidebar />
      {/* Hero */}
      <Hero />
      <div className="space-y-0">
        {/* Section Nos Activités — ID pour scroll depuis navbar */}
        <section id="nos-activites">
          <HomeNavButtons />
        </section>
        {/* Carousel actualités pleine largeur */}
        <NewsCarousel />
      </div>
    </div>
  );
}