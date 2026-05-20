import type { Metadata } from "next";
import { ActiviteCard } from "@/components/cards/ActiviteCard";
import { PageHeroStatic } from "@/components/sections/PageHeroStatic";
import { activitesService } from "@/services";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Nos Activites",
  description: "Decouvrez les activites du Groupe Espace Vert : semences, irrigation, fertilisation, jardinage et pulverisation.",
};

export default async function ActivitesPage() {
  const activites = await activitesService.list();
  const ordered = [...activites]
    .filter((activite) => activite.actif)
    .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0) || a.nom.localeCompare(b.nom, "fr"));

  return (
    <>
      <PageHeroStatic
        page="activites"
        eyebrow="Groupe Espace Vert"
        title="Nos activites"
        subtitle="Explorez nos domaines d'expertise pour accompagner chaque etape de votre production agricole."
        fallbackImage="/images/hero/semences.webp"
        imagePosition="center 36%"
        imagePositionTablet="center 31%"
        imagePositionMobile="center 24%"
        contentMaxWidth="42rem"
      />

      <section className="section">
        <div className="container-ev">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {ordered.map((activite) => (
              <ActiviteCard key={activite.id_activite} activite={activite} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
