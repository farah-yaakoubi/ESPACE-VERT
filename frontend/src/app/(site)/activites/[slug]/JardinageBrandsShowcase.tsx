"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Marque } from "@/types/api";
import { SectionTitleLine } from "@/components/ui/SectionTitleIcon";

const RED = "#e30613";

/** Slugs des marques rattachées à l'activité Jardinage & Machinisme
 *  (même liste que BRAND_GROUPS dans components/layout/Navbar.tsx). */
const JARDINAGE_BRAND_SLUGS = [
  "weibang",
  "agricut",
  "wiedenmann",
  "staub",
  "etesia",
  "outilswolf",
  "active",
];

function normKey(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function JardinageBrandsShowcase({ marques }: { marques: Marque[] }) {
  const slugSet = new Set(JARDINAGE_BRAND_SLUGS.map(normKey));
  const brands = marques.filter((m) => slugSet.has(normKey(m.slug)));

  // Marque "active" déduite de l'URL courante (/marques/<slug>) : permet de
  // garder toute la grille affichée tout en mettant en avant (zoom) la
  // marque consultée et en grisant les autres — qui reprennent leur aspect
  // normal au survol.
  const pathname = usePathname();
  const activeSlug = pathname?.match(/^\/marques\/([^/]+)/)?.[1] ?? null;
  const activeKey = activeSlug ? normKey(activeSlug) : null;

  if (brands.length === 0) return null;

  return (
    <section className="py-14 md:py-20" style={{ backgroundColor: "#f2f3f8" }}>
      <div className="container-ev">
        {/* Eyebrow + titre */}
        <div className="text-center mb-10 md:mb-12">
          <p
            className="text-[12px] font-extrabold tracking-[0.22em] uppercase mb-3"
            style={{ color: RED }}
          >
            Trouvez votre équipement par marque
          </p>
          <h2
            className="text-3xl md:text-[2.35rem] font-black text-[#0c0c0e]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <SectionTitleLine icon="Tractor" color={RED} align="center">Parcourir par marques</SectionTitleLine>
          </h2>
        </div>

        {/* Grille de marques */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5">
          {brands.map((marque) => {
            const isSelected = activeKey != null && normKey(marque.slug) === activeKey;
            const isDimmed   = activeKey != null && !isSelected;
            return (
              <Link
                key={marque.id_marque}
                href={`/marques/${marque.slug}`}
                className={
                  "group flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-100 bg-white px-4 py-9 shadow-[0_2px_10px_rgba(15,15,20,0.04)] transition-all duration-300 hover:border-[#e30613] hover:shadow-[0_16px_32px_rgba(0,0,0,0.10)] " +
                  (isSelected
                    ? "scale-110 border-[#e30613] shadow-[0_16px_32px_rgba(0,0,0,0.10)] z-10"
                    : isDimmed
                      ? "opacity-40 grayscale scale-95 hover:opacity-100 hover:grayscale-0 hover:scale-100"
                      : "hover:-translate-y-1")
                }
              >
                <span className="relative flex h-14 w-full items-center justify-center overflow-hidden">
                  {marque.logo ? (
                    <Image
                      src={marque.logo}
                      alt={marque.nom}
                      fill
                      className="object-contain transition-all duration-300"
                      sizes="120px"
                    />
                  ) : (
                    <span
                      className="text-xl font-black text-gray-300 select-none group-hover:text-[color:var(--jm-red)]"
                      style={{ fontFamily: "var(--font-display)", ["--jm-red" as any]: RED }}
                    >
                      {marque.nom[0]}
                    </span>
                  )}
                </span>
                <span className="text-[13.5px] font-bold text-gray-800 text-center transition-colors">
                  {marque.nom}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}