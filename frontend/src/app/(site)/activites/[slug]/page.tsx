import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { activitesService, categoriesService } from "@/services";
import { ActiviteProduitsSectionWrapper } from "./ActiviteProduitsSection";
import { PageHeroStatic } from "@/components/sections/PageHeroStatic";
import { SemencesRecommandation } from "./SemencesRecommandation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

function getActiviteHeroSettings(slug: string) {
  switch (slug) {
    case "irrigation":
      return {
        imagePosition: "center 34%",
        imagePositionTablet: "center 28%",
        imagePositionMobile: "center 22%",
      };
    case "semences-et-plants":
      return {
        imagePosition: "center 36%",
        imagePositionTablet: "center 30%",
        imagePositionMobile: "center 24%",
      };
    case "fertilisation":
      return {
        imagePosition: "center 38%",
        imagePositionTablet: "center 34%",
        imagePositionMobile: "center 27%",
      };
    default:
      return {
        imagePosition: "center 35%",
        imagePositionTablet: "center 30%",
        imagePositionMobile: "center 24%",
      };
  }
}

/* ── Static params ───────────────────────────────────────────────── */
export async function generateStaticParams() {
  const acts = await activitesService.list();
  return acts.map((a) => ({ slug: a.slug }));
}

/* ── Metadata ────────────────────────────────────────────────────── */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const acts = await activitesService.list();
    const act  = acts.find((a) => a.slug === slug);
    return act
      ? { title: act.nom, description: act.description ?? `Produits ${act.nom}` }
      : { title: "Activité introuvable" };
  } catch {
    return { title: "Activité introuvable" };
  }
}

/* ── Page ────────────────────────────────────────────────────────── */
export default async function ActiviteDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const acts = await activitesService.list();
  const act  = acts.find((a) => a.slug === slug);
  if (!act) notFound();

  const activite = act!;

  /* Fetch categories for this activite (includes hierarchy / parent_id) */
  const categories = await categoriesService.list({ id_activite: activite.id_activite });

  /* Root-level categories for quick-nav pills */
  const rootCategories = categories.filter((c) => !c.parent_id);

  /* Règles spéciales */
  const isIrrigation = activite.slug === "irrigation";
  const isSemences = activite.slug === "semences-et-plants";
  const heroSettings = getActiviteHeroSettings(activite.slug);

  return (
    <>
      {/* ── Hero ── */}
      <PageHeroStatic
        page={`activite:${activite.slug}`}
        eyebrow="Activité"
        title={activite.nom}
        subtitle={activite.description ?? undefined}
        fallbackImage={(activite as any).banniere || activite.image || "/images/hero/fertivert.webp"}
        contentMaxWidth="44rem"
        {...heroSettings}
      />

      {/* CTA Irrigation / Matar */}
      {isIrrigation && (
        <div className="bg-sky-50 border-b border-sky-100 py-3">
          <div className="container-ev flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CalendarDays size={18} className="text-sky-600 shrink-0" />
              <p className="text-sm text-sky-800 font-medium">
                Solutions d&apos;irrigation Matar — Prenez rendez-vous avec un expert pour un audit personnalisé.
              </p>
            </div>
            <Link href="/rendez-vous" className="shrink-0 btn btn-sm bg-sky-500 text-white hover:bg-sky-400">
              Prendre RDV
            </Link>
          </div>
        </div>
      )}

      {/* ── Widget recommandations IA (semences uniquement) ─────── */}
      {isSemences && <SemencesRecommandation />}

      {/* ── Categories quick nav ─────────────────────────────────── */}
      {rootCategories.length > 0 && (
        <section className="bg-white border-b border-sand-200">
          <div className="container-ev py-4">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-xs text-gray-400 font-medium shrink-0">Catégories :</span>
              {rootCategories.map((cat) => (
                <a
                  key={cat.id_categorie}
                  href={`#cat-${cat.id_categorie}`}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-ev-50 text-ev-700 border border-ev-100 whitespace-nowrap"
                >
                  {cat.nom}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Products section (client component) ─────────────────── */}
      <ActiviteProduitsSectionWrapper
        id_activite={activite.id_activite}
        categories={categories}
      />
    </>
  );
}
