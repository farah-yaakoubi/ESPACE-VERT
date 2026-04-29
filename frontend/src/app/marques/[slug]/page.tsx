import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { marquesService } from "@/services";
import { CategoryTree } from "@/components/catalogue/CategoryTree";
import { fetchMarqueTree } from "@/lib/api/catalogue";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

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

  // Arbre de catégories pour CategoryTree
  const tree = await fetchMarqueTree(slug);

  /* Special rule: Matar + Irrigation → show RDV link */
  const isMatar = marque.slug === "matar";

  return (
    <>
      {/* ── Brand hero ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-ev-950 to-ev-800 py-16 md:py-24">
        <div className="container-ev">
          <div className="flex flex-col md:flex-row items-center gap-10">

            {/* Logo */}
            <div className="relative w-40 h-40 rounded-3xl bg-white/10 flex items-center justify-center shrink-0 overflow-hidden border border-white/15">
              {marque.logo ? (
                <Image
                  src={marque.logo}
                  alt={marque.nom}
                  fill
                  className="object-contain p-6"
                  priority
                />
              ) : (
                <span className="text-5xl font-bold text-white/30 font-display">
                  {marque.nom[0]}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="text-center md:text-left">
              <p className="eyebrow text-ev-300 mb-2">Marque</p>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-display">
                {marque.nom}
              </h1>
              {marque.description && (
                <p className="text-white/65 text-lg leading-relaxed max-w-2xl">
                  {marque.description}
                </p>
              )}

              {/* Matar: RDV CTA for Irrigation */}
              {isMatar && (
                <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                  <Link
                    href="/rendez-vous"
                    className="btn btn-lg bg-sky-500 text-white hover:bg-sky-600"
                  >
                    Prendre rendez-vous — Irrigation
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

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
