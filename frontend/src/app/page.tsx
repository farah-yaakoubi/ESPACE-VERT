// app/page.tsx — Homepage Server Component
// Le Hero charge les slides depuis le backend; fallback si vide = fond vert pur

import HomeNavButtons from "@/components/sections/HomeNavButtons";
import NewsCarousel   from "@/components/sections/NewsCarousel";
import { Hero }       from "@/components/sections/Hero";
import type { HeroSlide } from "@/components/sections/Hero";

export const revalidate = 60; // ISR toutes les 60s

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function fetchHeroSlides(): Promise<HeroSlide[]> {
  try {
    // Endpoint à créer côté backend: GET /api/hero ou GET /api/slides
    // Retourne: [{ id, image, titre, sous_titre, cta_label, cta_href, ordre }]
    const res = await fetch(`${API}/hero`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? json ?? []) as HeroSlide[];
  } catch {
    // Backend sans endpoint /hero → fallback silencieux
    return [];
  }
}

export default async function HomePage() {
  const slides = await fetchHeroSlides();

  return (
    <>
      {/* ── Hero plein écran — images depuis backend */}
      {/* Si slides vides: fond vert pur sans texte statique */}
      {/* Pour ajouter des slides: créer l'endpoint GET /api/hero côté backend */}
      <Hero slides={slides} height="100vh" />

      {/* ── Activités panoramiques + logos marques */}
      <section id="nos-activites">
        <HomeNavButtons />
      </section>

      {/* ── Carrousel actualités */}
      <NewsCarousel />
    </>
  );
}
