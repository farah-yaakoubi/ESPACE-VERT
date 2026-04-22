"use client";
/**
 * MarqueProduitsSection — CORRIGÉ
 *
 * BUG CORRIGÉ : L'ancienne version passait `id_marque` mais le useProducts
 * ne re-fetchair pas correctement car les dépendances étaient instables.
 * De plus, sans id_marque passé en paramètre stable, l'API pouvait retourner
 * les produits de la première marque en base (Fertivert).
 *
 * La correction : s'assurer que id_marque est TOUJOURS transmis et stable.
 * Si categorie est sélectionnée, on filtre par id_categorie ET id_marque
 * pour garantir qu'on ne sort pas des produits de cette marque.
 */
import { Search } from "lucide-react";
import { ProduitCard } from "@/components/cards/ProduitCard";
import { Pagination } from "@/components/ui/Pagination";
import { GridSkeleton } from "@/components/ui/Skeleton";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { useProducts } from "@/hooks/useProducts";
import type { MarqueCategorie } from "@/types/api";
import { cn } from "@/lib/utils";

interface Props {
  id_marque:  number;
  categories: MarqueCategorie[];
  isMatar:    boolean;
}

export function MarqueProduitsSection({ id_marque, categories, isMatar }: Props) {
  // ⚠️ id_marque est TOUJOURS transmis — c'est la garantie que seuls les produits
  // de cette marque sont affichés. Le hook useProducts corrigé le traite
  // comme une valeur primitive stable.
  const { produits, meta, loading, error, page, setPage, setSearch, setCategorie } =
    useProducts({ id_marque, limit: 12 });

  return (
    <section className="section">
      <div className="container-ev">
        <SectionHeader
          eyebrow="Catalogue"
          title="Nos produits"
          subtitle="Utilisez la recherche ou filtrez par catégorie."
        />

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Rechercher un produit…"
              onChange={(e) => setSearch(e.target.value)}
              className="field pl-9"
            />
          </div>

          {categories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCategorie(undefined)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-ev-700 text-white"
              >
                Tous
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id_categorie}
                  onClick={() => setCategorie(cat.id_categorie)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                    "bg-white border-sand-200 text-gray-700 hover:border-ev-300 hover:text-ev-700"
                  )}
                >
                  {cat.nom}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <GridSkeleton count={8} />
        ) : error ? (
          <p className="text-center text-red-500 py-10">{error}</p>
        ) : produits.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🌿</p>
            <p>Aucun produit trouvé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produits.map((p) => (
              <ProduitCard key={p.id_produit} produit={p} />
            ))}
          </div>
        )}

        {meta && <Pagination meta={meta} onPageChange={setPage} />}
      </div>
    </section>
  );
}
