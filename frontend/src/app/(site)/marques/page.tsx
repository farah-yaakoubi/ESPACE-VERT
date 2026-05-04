import type { Metadata } from "next";
import { MarqueCard } from "@/components/cards/MarqueCard";
import { PageHero } from "@/components/sections/Hero";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { marquesService } from "@/services";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Nos Marques",
  description: "Découvrez les marques du Groupe Espace Vert : Fertivert, Pulvert et Matar.",
};

export default async function MarquesPage() {
  const marques = await marquesService.list();

  return (
    <>
      <PageHero
        eyebrow="Catalogue"
        title="Nos marques"
        subtitle="Trois marques, une expertise : des solutions adaptées à chaque besoin agricole."
      />

      <section className="section">
        <div className="container-ev">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {marques.map((m) => (
              <MarqueCard key={m.id_marque} marque={m} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
