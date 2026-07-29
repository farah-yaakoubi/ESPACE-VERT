"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import { translatedField } from "@/i18n/translated-field";
import type { Locale } from "@/i18n/config";

const WHEAT = "#c9a24a";

export interface SemencesCategoryItem {
  id_categorie: number;
  nom: string;
  translations?: unknown;
  image?: string | null;
}

function labelOf(item: SemencesCategoryItem, locale: Locale) {
  return translatedField(item as any, "nom", locale) || item.nom;
}

/** Bandeau "Par catégorie" — carrousel de cartes carrées avec libellé en
 *  incrustation, dans les proportions et le cadre de la maquette de
 *  référence, adapté à la palette du site (vert forêt / lin / blé). */
export function SemencesCategoryShowcase({
  categories,
}: {
  categories: SemencesCategoryItem[];
}) {
  const { locale } = useI18n();
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (categories.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <section className="py-12 md:py-16" style={{ backgroundColor: "#f3ecd9" }}>
      <div className="container-ev">
        <p className="text-center text-[12px] font-extrabold tracking-[0.24em] uppercase mb-8 text-[#1b2118]/70">
          Parcourir par catégorie :
        </p>

        <div className="relative">
          {/* Flèches */}
          <button
            type="button"
            aria-label="Précédent"
            onClick={() => scrollBy(-1)}
            className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full bg-white shadow-md text-[#1b2118] hover:bg-sand-50 transition-colors"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            aria-label="Suivant"
            onClick={() => scrollBy(1)}
            className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full bg-white shadow-md text-[#1b2118] hover:bg-sand-50 transition-colors"
          >
            <ChevronRight size={17} />
          </button>

          <div
            ref={scrollerRef}
            className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-none scroll-smooth pb-1"
          >
            {categories.map((cat) => (
              <a
                key={cat.id_categorie}
                href={`?cat=${cat.id_categorie}#produits-activite`}
                className={cn(
                  "group relative shrink-0 w-[180px] sm:w-[200px] aspect-square overflow-hidden rounded-2xl",
                  "bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                )}
              >
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={labelOf(cat, locale)}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="200px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-ev-50">
                    <Sprout size={36} strokeWidth={1.6} className="text-ev-700/60" />
                  </div>
                )}

                {/* Voile + libellé incrusté (bas de carte) */}
                <div
                  className="absolute inset-x-0 bottom-0 pt-10 pb-3.5 px-3.5"
                  style={{
                    background: "linear-gradient(to top, rgba(27,33,24,0.88) 0%, rgba(27,33,24,0) 100%)",
                  }}
                >
                  <p className="text-[13.5px] font-bold text-white leading-snug text-left">
                    {labelOf(cat, locale)}
                  </p>
                </div>

                <span
                  className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: WHEAT }}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}