import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ProduitCard as ProduitCardType } from "@/types/api";

const DIVISION_BADGE: Record<string, { label: string; cls: string }> = {
  pro:    { label: "Pro",    cls: "bg-ev-900 text-white" },
  garden: { label: "Garden", cls: "bg-[#7dc040] text-[#052e16]" },
};

export function ProduitCard({ produit, className }: { produit: ProduitCardType; className?: string }) {
  const img     = produit.images.find((i) => (i as any).is_principale) ?? produit.images[0];
  const divBadge = DIVISION_BADGE[produit.division];

  return (
    <Link href={`/produits/${produit.slug}`} className={cn("block group", className)}>
      <article className="card card-hover h-full flex flex-col overflow-hidden">

        {/* Image */}
        <div className="relative h-48 bg-sand-100 overflow-hidden shrink-0">
          {img ? (
            <Image
              src={img.url} alt={img.alt ?? produit.nom} fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width:640px)100vw,(max-width:1024px)50vw,25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-15 select-none">🌿</div>
          )}
          {divBadge && (
            <span className={cn("absolute top-3 right-3 px-2.5 py-0.5 rounded-lg text-[11px] font-bold", divBadge.cls)}>
              {divBadge.label}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          <p className="text-xs font-medium mb-1.5" style={{ color: "#7dc040", fontFamily: "var(--font-display)" }}>
            {produit.categorie.nom}
          </p>
          <h3
            className="text-base font-bold leading-snug mb-2 line-clamp-2 group-hover:text-ev-700 transition-colors"
            style={{ fontFamily: "var(--font-display)", color: "#111" }}
          >
            {produit.nom}
          </h3>
          {produit.description && (
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">
              {produit.description}
            </p>
          )}
          <div className="mt-4 pt-3 border-t border-sand-200 flex items-center justify-between">
            <span
              className="text-xs font-bold text-ev-600 group-hover:gap-2 transition-all"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Voir le produit →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
