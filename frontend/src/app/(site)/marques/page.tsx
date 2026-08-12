import type { Metadata } from "next";
import { MarqueCard } from "@/components/cards/MarqueCard";
import { Hero } from "@/components/sections/Hero";
import { Reveal } from "@/components/ui/Reveal";
import { marquesService } from "@/services";
import { SectionTitleLine } from "@/components/ui/SectionTitleIcon";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Nos Marques",
  description:
    "Découvrez les marques du Groupe Espace Vert et nos marques partenaires.",
};

// Les 4 slugs fixes du groupe — tout le reste est partenaire
const SLUGS_GROUPE = new Set(["baddar-semences", "matar", "fertivert", "pulvert"]);

export default async function MarquesPage() {
  const marques = await marquesService.list();

  const marquesGroupe     = marques.filter((m) => SLUGS_GROUPE.has(m.slug));
  const marquesPartenaire = marques.filter((m) => !SLUGS_GROUPE.has(m.slug));

  return (
    <>
      <Hero />

      {/* ── Marques du Groupe ────────────────────────────────────────────── */}
      <section className="section bg-white border-b border-sand-200">
        <div className="container-ev">
          <Reveal className="mb-8">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-ev-500 bg-ev-50 px-3 py-1 rounded-full mb-3">
              Groupe Espace Vert
            </span>
            <h2 className="section-title text-[2rem] sm:text-[2.4rem]">
              <SectionTitleLine icon="Leaf" align="left">Nos marques du groupe</SectionTitleLine>
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              Marques développées et détenues par le Groupe Espace Vert.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {marquesGroupe.map((m) => (
              <MarqueCard key={m.id_marque} marque={m} />
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Marques Partenaires ──────────────────────────────────────────── */}
      {marquesPartenaire.length > 0 && (
        <section className="section bg-sand-50">
          <div className="container-ev">
            <Reveal className="mb-8">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full mb-3">
                Partenaires
              </span>
              <h2 className="section-title text-[2rem] sm:text-[2.4rem]">
                <SectionTitleLine icon="Barn" color="#d97706" align="left">Nos marques partenaires</SectionTitleLine>
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                Marques distribuées et représentées par Espace Vert.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {marquesPartenaire.map((m) => (
                <MarqueCard key={m.id_marque} marque={m} compactLogo />
              ))}
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}