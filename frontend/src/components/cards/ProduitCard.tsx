"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronRight, Leaf, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getProductHref } from "@/lib/product-url";
import { useI18n } from "@/i18n/I18nProvider";
import { translatedField } from "@/i18n/translated-field";
import { stripHtml } from "@/lib/sanitize-html";
import type { ProduitCard as ProduitCardType } from "@/types/api";

const DIVISION_BADGE: Record<string, { label: string; cls: string }> = {
  pro:    { label: "Pro",    cls: "bg-ev-900 text-white" },
  garden: { label: "Garden", cls: "bg-[#7dc040] text-[#052e16]" },
};

function mod(n: number, m: number) { return ((n % m) + m) % m; }

/* ── Aperçu image — glisse (swipe) au survol du produit, flèches manuelles ── */
export function SeedImagePreview({
  images,
  nom,
  active = false,
}: {
  images: { url: string; alt: string | null }[];
  nom: string;
  active?: boolean;
}) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (timerRef.current || images.length < 2) return;
    timerRef.current = setInterval(() => {
      setCurrent((c) => mod(c + 1, images.length));
    }, 2200);
  }, [images.length]);

  // Piloté par le survol de toute la carte (prop `active`), pas seulement
  // de la zone image. Les photos multiples se révèlent en fondu doux au hover.
  useEffect(() => {
    if (active) {
      start();
    } else {
      clearTimer();
      setCurrent(0);
    }
    return clearTimer;
  }, [active, start, clearTimer]);

  const go = useCallback(
    (dir: 1 | -1, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      clearTimer();
      setCurrent((c) => mod(c + dir, images.length));
      start();
    },
    [clearTimer, start, images.length],
  );

  if (images.length === 0) {
    return (
      <div className="flex h-36 w-full items-center justify-center rounded-full bg-ev-50 text-3xl text-ev-300 sm:h-44">
        🌱
      </div>
    );
  }

  const variants = {
    enter:  { opacity: 0, scale: 0.985 },
    center: { opacity: 1, scale: 1 },
    exit:   { opacity: 0, scale: 1.015 },
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className={cn(
          "transition-transform ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          active ? "scale-[1.1] duration-[1800ms]" : "scale-100 duration-[1200ms]",
        )}
      >
        <div className="relative w-full">
          <img
            src={images[0].url}
            alt=""
            aria-hidden="true"
            className="block h-auto w-full object-contain opacity-0"
          />
          {images.map((image, i) => (
            <motion.img
              key={`${image.url}-${i}`}
              src={image.url}
              alt={i === current ? image.alt ?? nom : ""}
              aria-hidden={i !== current}
              initial={false}
              animate={{
                opacity: i === current ? 1 : 0,
                scale: i === current ? 1 : 1.01,
              }}
              transition={{
                scale: { type: "tween", duration: 1.1, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.65, ease: "easeInOut" },
              }}
              className="absolute inset-0 h-full w-full object-contain"
            />
          ))}
        </div>
      </div>

      {/* Flèches — uniquement si plusieurs photos, visibles quand la carte est survolée */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => go(-1, e)}
            aria-label="Photo précédente"
            className={cn(
              "absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-gray-700 shadow-md transition-opacity duration-200 hover:bg-white",
              active ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => go(1, e)}
            aria-label="Photo suivante"
            className={cn(
              "absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-gray-700 shadow-md transition-opacity duration-200 hover:bg-white",
              active ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            ›
          </button>
        </>
      )}

      {/* Points — indiquent qu'il y a plusieurs photos */}
      {images.length > 1 && (
        <div className="pointer-events-none absolute bottom-2 left-0 right-0 flex justify-center gap-1">
          {images.map((_, i) => (
            <span
              key={i}
              className="rounded-full transition-all duration-500"
              style={{
                width: i === current ? 12 : 4,
                height: 4,
                background: i === current ? "#1b5e38" : "rgba(0,0,0,0.15)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────── */
export function ProduitCard({
  produit,
  className,
  variant = "default",
}: {
  produit: ProduitCardType;
  className?: string;
  variant?: "default" | "seed" | "light" | "list";
}) {
  const { locale, t } = useI18n();
  const [hovered, setHovered] = useState(false);
  const img      = produit.images.find((i) => (i as any).is_principale) ?? produit.images[0];
  const divBadge = DIVISION_BADGE[produit.division];
  const href     = getProductHref(produit);
  const nom = translatedField(produit as any, "nom", locale) || produit.nom;
  const description = stripHtml(translatedField(produit as any, "description", locale) || produit.description);

  if (variant === "list") {
    return (
      <Link
        href={href}
        className={cn(
          "group flex items-center gap-4 rounded-[1.15rem] border border-[#dfe8dc] bg-white/95 p-3 shadow-[0_12px_34px_rgba(21,45,27,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#9bcf67] hover:shadow-[0_18px_46px_rgba(21,45,27,0.12)] sm:gap-6 sm:p-4",
          className
        )}
      >
        {/* Image — carrée, taille fixe, à gauche */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1rem] bg-gradient-to-br from-[#f8faf4] via-white to-[#eaf5df] ring-1 ring-[#dfe8dc] sm:h-28 sm:w-28">
          {img ? (
            <Image
              src={img.url}
              alt={img.alt ?? nom}
              fill
              className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
              sizes="112px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl opacity-20">🌱</div>
          )}
          {divBadge && (
            <span className={cn("absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wide uppercase", divBadge.cls)}>
              {divBadge.label}
            </span>
          )}
        </div>

        {/* Contenu — nom + description, prend l'espace restant */}
        <div className="min-w-0 flex-1">
          <p
            className="text-[0.9rem] font-bold leading-snug text-[#1b2118] line-clamp-2 transition-colors group-hover:text-ev-700 sm:text-[1rem] sm:line-clamp-1"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {nom}
          </p>
          {description && (
            <p className="mt-1 text-[12px] leading-5 text-gray-500 line-clamp-2 sm:text-[12.5px] sm:line-clamp-1">
              {description}
            </p>
          )}
        </div>

        {/* CTA — à droite, masqué sur mobile pour laisser de la place */}
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-[#103d24] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.04em] text-white shadow-sm transition-all duration-300 group-hover:bg-[#7dc040] group-hover:text-[#092715] group-hover:shadow-md sm:inline-flex">
          {t("catalog.viewProduct", "Voir le produit")}
          <ChevronRight size={13} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
        <ChevronRight size={18} className="shrink-0 text-gray-300 transition-colors group-hover:text-ev-600 sm:hidden" />
      </Link>
    );
  }
  if (variant === "seed") {
    return (
      <Link
        href={href}
        className={cn("group flex h-full flex-col items-center text-center focus:outline-none", className)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Zone image — taille réelle, non recadrée, non comprimée */}
        <SeedImagePreview
          images={produit.images.length ? [img, ...produit.images.filter((i) => i !== img)] : []}
          nom={nom}
          active={hovered}
        />

        <p
          className="mt-3 flex min-h-[2.7em] items-center justify-center text-[0.9rem] font-bold leading-snug text-[#1b2118] transition-colors group-hover:text-ev-700 sm:mt-4 sm:text-[0.98rem]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {nom}
        </p>

        {/* Bouton "Voir le produit" — plein, avec flèche qui glisse au survol */}
        <span className="mt-3 inline-flex max-w-full items-center justify-center gap-1.5 rounded-xl bg-ev-700 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.04em] text-white shadow-sm transition-all duration-300 group-hover:bg-ev-800 group-hover:shadow-md group-hover:-translate-y-0.5 sm:mt-4 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-[12px]">
          {t("catalog.viewProduct", "Voir le produit")}
          <ChevronRight size={14} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </Link>
    );
  }
  if (variant === "light") {
    const lightImages = produit.images?.length
      ? (img ? [img, ...produit.images.filter((i) => i !== img)] : produit.images)
      : [];
    return (
      <Link
        href={href}
        className={cn("block group", className)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <article className="relative flex h-full flex-col overflow-hidden rounded-[1.15rem] border border-[#dfe8dc] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#9bcf67] hover:shadow-[0_18px_46px_rgba(21,45,27,0.13)]">
          <div className="relative h-[150px] sm:h-[170px] bg-gradient-to-br from-[#f8faf4] via-white to-[#eaf5df] flex items-center justify-center overflow-hidden">
            {lightImages.length ? (
              <div className="w-full px-6">
                <SeedImagePreview images={lightImages} nom={nom} active={hovered} />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl opacity-20">🌿</div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2 px-4 py-3.5">
            <h3 className="text-[13.5px] font-bold leading-snug text-gray-900 line-clamp-2">
              {nom}
            </h3>
            <span className="mt-auto inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-[0.04em] text-[#245c34]">
              {t("catalog.viewProduct", "Voir le produit")} <ChevronRight size={13} />
            </span>
          </div>
        </article>
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className={cn("group block h-full focus:outline-none", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article className="relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-[#dfe8dc] bg-white shadow-[0_18px_55px_rgba(20,45,28,0.08)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#9bcf67] group-hover:shadow-[0_26px_70px_rgba(20,45,28,0.15)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f2f9e9] to-transparent" />

        <div className="relative px-4 pt-4">
          <div className="relative overflow-hidden rounded-[1.1rem] bg-gradient-to-br from-[#f8faf4] via-white to-[#e7f4dc] px-5 py-5 ring-1 ring-[#dfe8dc]">
            <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
              {divBadge && (
                <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.06em]", divBadge.cls)}>
                  {divBadge.label}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.06em] text-[#245c34] shadow-sm">
                <Sparkles size={11} strokeWidth={2.4} />
                {t("catalog.selection", "Sélection")}
              </span>
            </div>

            <SeedImagePreview
              images={produit.images?.length ? (img ? [img, ...produit.images.filter((i) => i !== img)] : produit.images) : []}
              nom={nom}
              active={hovered}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col px-5 pb-5 pt-4 text-left">
          <div className="mb-3 flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-[#6a7b66]">
            <Leaf size={13} strokeWidth={2.2} className="text-[#7dc040]" />
            {t("catalog.solution", "Solution Espace Vert")}
          </div>

          <h3
            className="min-h-[2.8em] text-[0.95rem] font-bold leading-snug text-[#172217] line-clamp-2 transition-colors group-hover:text-[#1f6b36] sm:text-[1.02rem]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {nom}
          </h3>

          {description && (
            <p className="mt-2 min-h-[3.1em] text-[12.5px] leading-5 text-[#64705f] line-clamp-2">
              {description}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 pt-4">
            <span className="inline-flex items-center rounded-full bg-[#eef8e4] px-3 py-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.06em] text-[#245c34]">
              {t("catalog.proAdvice", "Conseil pro")}
            </span>
            <span className="cta-voir-produit inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#103d24] text-white shadow-sm transition-all duration-300 group-hover:bg-[#7dc040] group-hover:text-[#092715] group-hover:shadow-md">
              <ChevronRight size={17} strokeWidth={2.7} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
