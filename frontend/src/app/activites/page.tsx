import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Droplets, Leaf, Sprout, Wrench, Wind } from "lucide-react";
import { PageHero } from "@/components/sections/Hero";
import { activitesService } from "@/services";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Nos Activités",
  description: "Irrigation, fertilisation, semences & plants, machinisme et pulvérisation.",
};

const ICONS: Record<string, React.ReactNode> = {
  irrigation:                <Droplets size={32} />,
  fertilisation:             <Leaf     size={32} />,
  "semences-et-plants":      <Sprout   size={32} />,
  "machinisme-et-jardinage": <Wrench   size={32} />,
  pulverisation:             <Wind     size={32} />,
};

export default async function ActivitesPage() {
  const activites = await activitesService.list();

  return (
    <>
      <PageHero
        eyebrow="Domaines d'expertise"
        title="Nos activités"
        subtitle="Cinq pôles d'activité pour répondre à tous les besoins de l'agriculture moderne."
        imagePlaceholder
      />

      <section className="section">
        <div className="container-ev">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activites.map((act, i) => (
              <Link
                key={act.id_activite}
                href={`/activites/${act.slug}`}
                className="group flex gap-6 p-7 rounded-3xl bg-white border border-sand-200 hover:border-ev-200 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="relative w-24 h-24 rounded-2xl bg-ev-50 shrink-0 overflow-hidden flex items-center justify-center">
                  {act.image ? (
                    <Image
                      src={act.image}
                      alt={act.nom}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="96px"
                    />
                  ) : (
                    <span className="text-ev-600 group-hover:text-ev-800 transition-colors">
                      {ICONS[act.slug] ?? <Leaf size={32} />}
                    </span>
                  )}
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <h2 className="h-card text-ev-900 mb-1.5 group-hover:text-ev-700 transition-colors">
                    {act.nom}
                  </h2>
                  {act.description && (
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">
                      {act.description}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-ev-600">
                    Découvrir <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
