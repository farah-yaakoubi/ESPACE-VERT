"use client";
/**
 * ActiviteProduitsSection v2 — utilise id_activite direct sur Produit
 * GET /api/produits?id_activite=X — filtre direct, N fetches parallèles éliminés
 */
import { useState, useEffect, useMemo } from "react";
import { Search, Package } from "lucide-react";
import { ProduitCard } from "@/components/cards/ProduitCard";
import { GridSkeleton } from "@/components/ui/Skeleton";
import { SectionHeader } from "@/components/sections/SectionHeader";
import type { Categorie, ProduitCard as ProduitCardType } from "@/types/api";
import { cn } from "@/lib/utils";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface Props {
  id_activite: number;
  categories:  Categorie[];
}

export function ActiviteProduitsSection({ id_activite, categories }: Props) {
  const [allProduits, setAllProduits] = useState<ProduitCardType[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [activeCatId, setActiveCatId] = useState<number | null>(null);
  const [search,      setSearch]      = useState("");

  useEffect(() => {
    if (!id_activite) { setLoading(false); return; }
    setLoading(true); setError(null);

    // Un seul fetch via id_activite direct
    fetch(`${BASE}/produits?id_activite=${id_activite}&limit=200`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        const produits: ProduitCardType[] = d.success && Array.isArray(d.data) ? d.data : [];
        setAllProduits(produits);
      })
      .catch(() => setError("Impossible de charger les produits."))
      .finally(() => setLoading(false));
  }, [id_activite]);

  const filtered = useMemo(() => {
    let list = allProduits;
    if (activeCatId !== null)
      list = list.filter(p => (p.categorie as any)?.id_categorie === activeCatId || (p as any).id_categorie === activeCatId);
    if (search.trim())
      list = list.filter(p => p.nom.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [allProduits, activeCatId, search]);

  if (loading) return <GridSkeleton cols={3} rows={2} />;
  if (error)   return <p className="text-red-500 text-sm py-8 text-center">{error}</p>;
  if (allProduits.length === 0) return (
    <div className="text-center py-16 text-gray-400">
      <Package size={40} className="mx-auto mb-3 opacity-30" />
      <p className="text-sm">Aucun produit pour cette activité.</p>
    </div>
  );

  return (
    <div>
      <SectionHeader title="Nos Produits" subtitle={`${allProduits.length} produit${allProduits.length > 1 ? "s" : ""} disponible${allProduits.length > 1 ? "s" : ""}`} />

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-8 items-center">
        {/* Barre de recherche */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un produit…"
            className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 bg-white"
          />
        </div>
        {/* Filtres catégories */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCatId(null)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
              activeCatId === null
                ? "bg-ev-600 text-white border-ev-600 shadow-sm"
                : "text-gray-600 border-gray-200 hover:border-ev-300 hover:text-ev-600"
            )}>
            Tous ({allProduits.length})
          </button>
          {categories.filter(c => !c.parent_id).map(cat => {
            const count = allProduits.filter(p =>
              (p.categorie as any)?.id_categorie === cat.id_categorie ||
              (p as any).id_categorie === cat.id_categorie
            ).length;
            if (count === 0) return null;
            return (
              <button key={cat.id_categorie}
                onClick={() => setActiveCatId(cat.id_categorie)}
                className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                  activeCatId === cat.id_categorie
                    ? "bg-ev-600 text-white border-ev-600 shadow-sm"
                    : "text-gray-600 border-gray-200 hover:border-ev-300 hover:text-ev-600"
                )}>
                {cat.nom} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grille produits */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Package size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aucun produit pour ce filtre.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => <ProduitCard key={p.id_produit} produit={p} />)}
        </div>
      )}
    </div>
  );
}
