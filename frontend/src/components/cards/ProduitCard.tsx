"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getProductHref } from "@/lib/product-url";
import { useI18n } from "@/i18n/I18nProvider";
import { translatedField } from "@/i18n/translated-field";
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
      <div className="flex h-44 w-full items-center justify-center rounded-full bg-ev-50 text-3xl text-ev-300">
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
  variant?: "default" | "seed" | "light";
}) {
  const { locale } = useI18n();
  const [hovered, setHovered] = useState(false);
  const img      = produit.images.find((i) => (i as any).is_principale) ?? produit.images[0];
  const divBadge = DIVISION_BADGE[produit.division];
  const href     = getProductHref(produit);
  const nom = translatedField(produit as any, "nom", locale) || produit.nom;
  const description = translatedField(produit as any, "description", locale) || produit.description;

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
          className="mt-4 text-[1.05rem] font-semibold leading-snug text-[#1b2118] transition-colors group-hover:text-ev-700"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {nom}
        </p>

        {/* Bouton "Voir le produit" — plein, avec flèche qui glisse au survol */}
        <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ev-700 px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-white shadow-sm transition-all duration-300 group-hover:bg-ev-800 group-hover:shadow-md group-hover:-translate-y-0.5">
          Voir le produit
          <ChevronRight size={14} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </Link>
    );
  }

  if (variant === "light") {
    return (
      <Link href={href} className={cn("block group", className)}>
        <article className="relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[#f7c9a0]">
          <div className="relative h-[150px] sm:h-[170px] bg-[#f7f7f5] flex items-center justify-center overflow-hidden">
            {img ? (
              <Image
                src={img.url}
                alt={img.alt ?? nom}
                fill
                className="object-contain p-6 transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
                sizes="(max-width:640px)50vw,(max-width:1024px)33vw,25vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl opacity-20">🌿</div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2 px-4 py-3.5">
            <h3 className="text-[14px] font-semibold leading-snug text-gray-900 line-clamp-2">
              {nom}
            </h3>
            <span className="mt-auto inline-flex items-center gap-1 text-[12.5px] font-medium text-[#c94e03]">
              Voir le produit <ChevronRight size={13} />
            </span>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn("group flex h-full flex-col items-center text-center focus:outline-none", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Zone image — même comportement que les autres pages (swipe + zoom au survol) ── */}
      <div className="relative w-full">
        {divBadge && (
          <span className={cn("absolute top-0 left-0 z-10 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase", divBadge.cls)}>
            {divBadge.label}
          </span>
        )}

        <SeedImagePreview
          images={produit.images?.length ? (img ? [img, ...produit.images.filter((i) => i !== img)] : produit.images) : []}
          nom={nom}
          active={hovered}
        />
      </div>

      {/* ── Nom ── */}
      <p
        className="mt-4 text-[1.05rem] font-semibold leading-snug text-[#1b2118] line-clamp-2 transition-colors group-hover:text-ev-700"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {nom}
      </p>

      {/* ── Bouton "Voir le produit" — plein, avec flèche qui glisse au survol ── */}
      <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ev-700 px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-white shadow-sm transition-all duration-300 group-hover:bg-ev-800 group-hover:shadow-md group-hover:-translate-y-0.5">
        Voir le produit
        <ChevronRight size={14} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
