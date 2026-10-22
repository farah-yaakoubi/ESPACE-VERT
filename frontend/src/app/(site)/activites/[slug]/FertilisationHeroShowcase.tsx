"use client";

/**
 * Hero de la page activité Fertilisation : exactement le même design que
 * la page Semences & plants (photo plein format, titre animé, deux boutons),
 * avec ses propres textes et sa propre image.
 */
import { SemencesHeroShowcase } from "./SemencesHeroShowcase";

export function FertilisationHeroShowcase({
  activiteSlug,
}: {
  activiteSlug: string;
  /** Conservé pour compatibilité avec les anciens appels (non utilisé) */
  categories?: unknown[];
}) {
  return (
    <SemencesHeroShowcase
      activiteSlug={activiteSlug}
      image="/images/hero/BANNEQR.webp"
      imageAlt="Fertilisation"
      eyebrow="Fertilisation"
      titleLines={["Nourrissez vos sols.", "Optimisez vos récoltes."]}
      subtitle="Des engrais naturels et des solutions de fertilisation durables pour une croissance exceptionnelle, du sol à la récolte."
      ctaLabel="Voir le catalogue"
    />
  );
}
