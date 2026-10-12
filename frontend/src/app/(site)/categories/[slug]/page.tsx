import type { Metadata } from "next";
import { notFound }      from "next/navigation";
import Image             from "next/image";
import Link              from "next/link";
import { ChevronRight, Package, Layers } from "lucide-react";
import type { CategorieDetail } from "@/types/api";
import { CategorieCatalogSection } from "@/components/CategorieCatalogSection";
import { getProductHref } from "@/lib/product-url";

// API_URL (serveur-only) évite les ECONNREFUSED en SSR quand le backend
// est sur un réseau interne différent de localhost côté navigateur.
const BACKEND =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000/api";

async function getCat(slug: string): Promise<CategorieDetail | null> {
  try {
    const res = await fetch(`${BACKEND}/categories/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? json) as CategorieDetail;
  } catch {
    return null;
  }
}

/**
 * Remonte toute la chaîne de catégories parentes (jusqu'à la racine) pour
 * construire un fil d'Ariane complet — utile pour les arborescences
 * profondes (ex: Semences et Plants > Semences Maraîchère > Pro >
 * Semences Hybride > Tomate > Alyenta) où seul le parent direct était
 * affiché auparavant. Bornée à 8 niveaux par sécurité.
 */
async function getAncestors(cat: CategorieDetail): Promise<{ nom: string; slug: string }[]> {
  const chain: { nom: string; slug: string }[] = [];
  let current = cat.parent;
  let guard = 0;
  while (current && guard < 8) {
    chain.unshift(current);
    const parentCat = await getCat(current.slug);
    current = parentCat?.parent ?? null;
    guard++;
  }
  return chain;
}

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCat(slug);
  if (!cat) return { title: "Catégorie introuvable" };
  return {
    title:       cat.nom,
    description: cat.description ?? `Découvrez notre gamme ${cat.nom}`,
  };
}

export default async function CategorieDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const cat = await getCat(slug);
  if (!cat) return notFound();

  const ancestors = await getAncestors(cat);
  const hasSousCats = (cat.sous_cats ?? []).length > 0;
  const hasProduits = (cat.produits  ?? []).length > 0;

  return (
    <main className="min-h-screen bg-white">

      {/* Breadcrumb — chemin complet depuis la racine */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container-ev py-3 flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <Link href="/" className="hover:text-ev-700 transition-colors shrink-0">Accueil</Link>
          {ancestors.map(a => (
            <span key={a.slug} className="flex items-center gap-2 shrink-0">
              <ChevronRight size={13} className="text-gray-300" />
              <Link href={`/categories/${a.slug}`} className="hover:text-ev-700 transition-colors">{a.nom}</Link>
            </span>
          ))}
          <ChevronRight size={13} className="text-gray-300 shrink-0" />
          <span className="text-gray-800 font-medium">{cat.nom}</span>
        </div>
      </div>

      {/* Titre */}
      <div className="container-ev pt-10 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Layers size={20} className="text-ev-600" />
          <h1 className="text-3xl font-bold text-gray-900">{cat.nom}</h1>
        </div>
        {cat.description && (
          <p className="text-gray-500 max-w-2xl leading-relaxed">{cat.description}</p>
        )}
      </div>

      {/* ── Sous-catégories → chaque carte navigue vers /categories/{slug} ── */}
      {hasSousCats && (
        <CategorieCatalogSection cat={cat} />
      )}

      {/* ── Produits directs (catégorie sans sous-catégories) ── */}
      {hasProduits && !hasSousCats && (
        <section className="container-ev pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {cat.produits.map(p => {
              const img = p.images?.[0];
              return (
                <Link key={p.id_produit} href={getProductHref(p)}
                  className="group block rounded-2xl border border-gray-100 hover:border-ev-200
                    hover:shadow-lg transition-all duration-300 overflow-hidden bg-white">
                  <div className="relative h-48 bg-gray-50">
                    {img
                      ? <Image src={img.url} alt={img.alt ?? p.nom} fill
                          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width:640px)100vw,(max-width:1024px)50vw,25vw" />
                      : <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-10">🌱</div>
                    }
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-gray-800 text-sm leading-snug group-hover:text-ev-700 transition-colors">
                      {p.nom}
                    </p>
                    {p.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.description}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
      {/* ── Vide ── */}
      {!hasSousCats && !hasProduits && (
        <div className="container-ev py-24 flex flex-col items-center gap-3 text-gray-400">
          <Package size={40} strokeWidth={1.5} />
          <p className="text-sm">Aucun produit dans cette catégorie pour le moment.</p>
        </div>
      )}
    </main>
  );
}