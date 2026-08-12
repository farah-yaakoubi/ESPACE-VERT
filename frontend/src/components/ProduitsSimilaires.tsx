import Link from "next/link";
import { ChevronRight, Wheat } from "lucide-react";
import { produitsService } from "@/services";
import { SimilaireCard } from "@/components/cards/SimilaireCard";
import type { ProduitCard } from "@/types/api";

export async function ProduitsSimilaires({
  idCategorie,
  idProduitActuel,
  idCategorieParent,
  idActivite,
}: {
  idCategorie: number;
  idProduitActuel: number;
  idCategorieParent?: number | null;
  idActivite?: number | null;
}) {
  let produits: ProduitCard[] = [];
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
          Produits similaires
        </h2>
        <Link
          href="/produits"
          className="flex items-center gap-1 text-sm font-semibold text-ev-700 hover:text-ev-900 transition-colors"
        >
          Voir tout <ChevronRight size={14} />
        </Link>
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