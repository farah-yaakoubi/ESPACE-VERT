"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Wheat } from "lucide-react";
import { getProductHref } from "@/lib/product-url";
import { SeedImagePreview } from "./ProduitCard";
import type { ProduitCard } from "@/types/api";

const DIVISION_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  pro: { label: "Pro", bg: "#3b82f6", text: "#fff" },
};

export function SimilaireCard({ produit }: { produit: ProduitCard }) {
  const [hovered, setHovered] = useState(false);
  const mainImg = produit.images?.find((i: any) => i.is_principale) ?? produit.images?.[0];
  const badge   = DIVISION_BADGE[produit.division];
  const images  = produit.images?.length
    ? [mainImg, ...produit.images.filter((i) => i !== mainImg)]
    : [];

  return (
    <Link
      href={getProductHref(produit)}
      className="group flex h-full flex-col items-center text-center focus:outline-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Zone image — taille réelle, défile au survol si plusieurs photos */}
      <div className="relative w-full">
        {badge && (
          <span
            className="absolute top-0 right-0 z-10 text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: badge.bg, color: badge.text }}
          >
            {badge.label}
          </span>
        )}

        {images.length ? (
          <SeedImagePreview images={images} nom={produit.nom} active={hovered} />
        ) : (
          <div className="flex h-44 w-full items-center justify-center rounded-full bg-ev-50 text-3xl text-ev-300">
            <Wheat size={28} className="opacity-80" />
          </div>
        )}
      </div>

      {/* Infos */}
      <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {produit.categorie?.nom}
      </p>
      <p
        className="mt-1 text-[1.05rem] font-semibold leading-snug text-[#1b2118] transition-colors group-hover:text-ev-700"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {produit.nom}
      </p>

      {/* Bouton "Voir le produit" — plein, avec flèche qui glisse au survol */}
      <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ev-700 px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-white shadow-sm transition-all duration-300 group-hover:bg-ev-800 group-hover:shadow-md group-hover:-translate-y-0.5">
        Voir le produit
        <ChevronRight size={14} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}