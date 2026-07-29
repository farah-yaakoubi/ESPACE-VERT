"use client";

/**
 * Ré-export — la page activité Fertilisation utilise désormais le hero
 * partagé FertilisantHeroShowcase (voir src/components/sections/), avec
 * son titre propre et ses catégories d'activité.
 */
import { FertilisantHeroShowcase } from "@/components/sections/FertilisantHeroShowcase";

interface FertilisationCategory {
  id_categorie: number;
  nom: string;
  image?: string | null;
}

export function FertilisationHeroShowcase({
  activiteSlug,
  categories = [],
}: {
  activiteSlug: string;
  categories?: FertilisationCategory[];
}) {
  return (
    <FertilisantHeroShowcase
      title="Optimisez vos récoltes avec nos engrais naturels"
      heroSlideKey={`activite:${activiteSlug}`}
      categories={categories}
      categoryAnchor="produits-activite"
      ctaHref="#produits-activite"
      fichesTechniquesHref="/rendez-vous"
    />
  );
}