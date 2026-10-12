import Link from "next/link";
import { cookies } from "next/headers";
import { ChevronRight, Wheat } from "lucide-react";
import { categoriesService, produitsService } from "@/services";
import { SimilaireCard } from "@/components/cards/SimilaireCard";
import type { ProduitCard } from "@/types/api";
import { getActivityCategoryHrefById } from "@/lib/category-url";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { messages } from "@/i18n/messages";

export async function ProduitsSimilaires({
  idCategorie,
  idProduitActuel,
  idCategorieParent,
  idActivite,
  activiteSlug,
}: {
  idCategorie: number;
  idProduitActuel: number;
  idCategorieParent?: number | null;
  idActivite?: number | null;
  /** Slug de l'activité (ex. "semences-et-plants") — permet de construire
   *  un lien "Voir tout" valide vers l'URL lisible de la catégorie.
   *  Sans ça, il n'existe aucune page `/produits` listant tous les produits
   *  du site : ce lien renvoyait vers une page inexistante (404). */
  activiteSlug?: string | null;
}) {
  const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const t = (key: string, fallback: string) => messages[locale]?.[key] ?? messages[defaultLocale]?.[key] ?? fallback;
  let produits: ProduitCard[] = [];
  let voirToutHref = activiteSlug ? `/activites/${activiteSlug}` : null;
  try {
    // 1. Même catégorie directe
    const res = await produitsService.list({ id_categorie: idCategorie, limit: 10 });
    produits = res.data.filter(p => p.id_produit !== idProduitActuel).slice(0, 3);

    // 2. Si moins de 3 → catégorie parente (même famille)
    if (produits.length < 3 && idCategorieParent) {
      const res2 = await produitsService.list({ id_categorie: idCategorieParent, limit: 20 });
      const ids = new Set([idProduitActuel, ...produits.map(p => p.id_produit)]);
      const extra = res2.data
        .filter(p => !ids.has(p.id_produit))
        .slice(0, 3 - produits.length);
      produits = [...produits, ...extra];
    }

    // 3. Si toujours moins de 3 → même activité
    if (produits.length < 3 && idActivite) {
      const res3 = await produitsService.list({ id_activite: idActivite, limit: 20 });
      const ids = new Set([idProduitActuel, ...produits.map(p => p.id_produit)]);
      const extra = res3.data
        .filter(p => !ids.has(p.id_produit))
        .slice(0, 3 - produits.length);
      produits = [...produits, ...extra];
    }

    if (activiteSlug && idActivite) {
      const categories = await categoriesService.list({ id_activite: idActivite });
      voirToutHref = getActivityCategoryHrefById(activiteSlug, categories, idCategorie);
    }
  } catch { /* silencieux */ }

  if (!produits.length) return null;

  return (
    <section className="mt-14">
      {/* Titre section */}
      <div className="flex items-center justify-between mb-6">
        <h2
          className="flex items-center gap-2.5 text-xl sm:text-2xl font-black text-ev-900"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <Wheat size={20} className="text-ev-600" />
          {t("catalog.similar", "Produits similaires")}
        </h2>
        {voirToutHref && (
          <Link
            href={voirToutHref}
            className="flex items-center gap-1 text-sm font-semibold text-ev-700 hover:text-ev-900 transition-colors"
          >
            {t("catalog.viewAll", "Voir tout")} <ChevronRight size={14} />
          </Link>
        )}
      </div>

      {/* Grille */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {produits.map(p => (
          <SimilaireCard key={p.id_produit} produit={p} />
        ))}
      </div>
    </section>
  );
}
