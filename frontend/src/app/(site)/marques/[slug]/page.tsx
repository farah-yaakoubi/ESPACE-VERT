import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { marquesService } from "@/services";
import { CategoryTree } from "@/components/catalogue/CategoryTree";
import { fetchMarqueTree } from "@/lib/api/catalogue";
import { PageHeroStatic } from "@/components/sections/PageHeroStatic";
interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

function getMarqueHeroSettings(slug: string) {
  switch (slug) {
    case "matar":
      return {
        imagePosition: "center 34%",
        imagePositionTablet: "center 28%",
        imagePositionMobile: "center 22%",
      };
    case "fertivert":
      return {
        imagePosition: "center 39%",
        imagePositionTablet: "center 34%",
        imagePositionMobile: "center 27%",
      };
    case "pulvert":
      return {
        imagePosition: "center 36%",
        imagePositionTablet: "center 31%",
        imagePositionMobile: "center 25%",
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
  const marques = await marquesService.list();
  return marques.map((m) => ({ slug: m.slug }));
}

/* ── Metadata ────────────────────────────────────────────────────── */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const marque = await marquesService.bySlug(slug);
    return {
      title:       marque.nom,
      description: marque.description ?? `Produits ${marque.nom}`,
    };
  } catch {
    return { title: "Marque introuvable" };
  }
}

/* ── Page ────────────────────────────────────────────────────────── */
export default async function MarqueDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let marque;
  try {
    marque = await marquesService.bySlug(slug);
  } catch {
    notFound();
  }

  const tree    = await fetchMarqueTree(slug);
  const isMatar = marque.slug === "matar";
  const heroSettings = getMarqueHeroSettings(marque.slug);

  return (
    <>
      {/* ── Hero — récupère le slide "marque:{slug}" depuis l'admin Hero ── */}
      <PageHeroStatic
        page={`marque:${slug}`}
        eyebrow="Marque"
        title={marque.nom}
        subtitle={marque.description ?? undefined}
        fallbackImage="/images/hero/fertivert.webp"
        contentMaxWidth="44rem"
        {...heroSettings}
      />

      {/* CTA Matar RDV — affiché sous le hero si besoin */}
      {isMatar && (
        <div className="bg-sky-50 border-b border-sky-100 py-3">
          <div className="container-ev flex items-center justify-between gap-4">
            <p className="text-sm text-sky-800 font-medium">
              Solutions d&apos;irrigation Matar — Prenez rendez-vous avec un expert
            </p>
            <Link
              href="/rendez-vous"
              className="shrink-0 btn btn-sm bg-sky-500 text-white hover:bg-sky-600"
            >
              Prendre RDV
            </Link>
          </div>
        </div>
      )}

      {/* ── Categories quick nav ───────────────────────────────── */}
      {tree && tree.categories.length > 0 && (
        <section className="bg-white border-b border-sand-200">
          <div className="container-ev py-4">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-xs text-gray-400 font-medium shrink-0">Catégories :</span>
              {tree.categories.map((cat) => (
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

      {/* ── Arbre catégories / produits ────────────────────────── */}
      {tree && (
        <section className="bg-sand-50 border-b border-sand-200">
          <div className="container-ev py-8">
            <CategoryTree
              tree={tree}
              produitBasePath="/produits"
              showProduits={true}
            />
          </div>
        </section>
      )}
    </>
  );
}
