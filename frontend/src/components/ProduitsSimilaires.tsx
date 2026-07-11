import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Wheat } from "lucide-react";
import { produitsService } from "@/services";
import { getProductHref } from "@/lib/product-url";
import type { ProduitCard } from "@/types/api";

const DIVISION_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  pro:    { label: "Pro",     bg: "#3b82f6", text: "#fff" },
  garden: { label: "Nouveau", bg: "#ef4444", text: "#fff" },
};

function SimilaireCard({ produit }: { produit: ProduitCard }) {
  const mainImg = produit.images?.find((i: any) => i.is_principale) ?? produit.images?.[0];
  const badge   = DIVISION_BADGE[produit.division];

  return (
    <Link href={getProductHref(produit)} className="group block">
      <article
        className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-green-300"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}
      >
        {/* Zone image */}
        <div className="relative h-44 sm:h-52"
          style={{ background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)" }}>
          {badge && (
            <span
              className="absolute top-3 right-3 z-10 text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: badge.bg, color: badge.text }}
            >
              {badge.label}
            </span>
          )}

          {mainImg ? (
            <Image
              src={mainImg.url}
              alt={mainImg.alt ?? produit.nom}
              fill
              className="object-contain p-6"
              sizes="(max-width:768px)100vw,33vw"
            />
          ) : (
            /* Placeholder icône */
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-ev-700 flex items-center justify-center">
                <Wheat size={28} className="text-white opacity-80" />
              </div>
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="px-5 pt-4 pb-3 space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {produit.categorie?.nom}
          </p>
          <h3
            className="text-[1rem] font-black text-gray-900 group-hover:text-ev-700 transition-colors leading-snug"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {produit.nom}
          </h3>
          {(produit as any).sku && (
            <p className="text-[11px] text-gray-400">Réf. {(produit as any).sku}</p>
          )}
        </div>

        {/* CTA */}
        <div className="px-5 pb-5 pt-2">
          <span
            className="flex items-center justify-center gap-1.5 w-full text-center text-[12.5px] font-semibold text-white rounded-xl py-2.5 transition-all duration-200 group-hover:opacity-90"
            style={{ background: "#1b5e38" }}
          >
            Voir le produit <ChevronRight size={13} />
          </span>
        </div>
      </article>
    </Link>
  );
}

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
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {produits.map(p => (
          <SimilaireCard key={p.id_produit} produit={p} />
        ))}
      </div>
    </section>
  );
}