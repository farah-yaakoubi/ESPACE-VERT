"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

/* ── Carousel images — affiché uniquement dans la zone image au hover ──────── */
function ImageCarousel({ images, nom }: { images: { url: string; alt: string | null }[]; nom: string }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (images.length < 2) return;
    timerRef.current = setInterval(() => setCurrent(c => mod(c + 1, images.length)), 2800);
  }, [images.length]);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => { start(); return stop; }, [start, stop]);

  const go = (dir: 1 | -1, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    stop();
    setCurrent(c => mod(c + dir, images.length));
    start();
  };

  if (images.length === 0) return null;

  return (
    <div className="relative w-full h-full bg-[#f0f0f0]">
      {/* Image active */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -18 }}
          transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.8 }}
          className="absolute inset-0"
        >
          <Image
            src={images[current].url}
            alt={images[current].alt ?? nom}
            fill
            className="object-contain p-2"
            sizes="(max-width:640px)100vw,(max-width:1024px)50vw,25vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Flèches — uniquement si > 1 image */}
      {images.length > 1 && (
        <>
          <button
            onClick={e => go(-1, e)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white transition-all text-gray-700 font-bold text-sm"
          >
            ‹
          </button>
          <button
            onClick={e => go(1, e)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white transition-all text-gray-700 font-bold text-sm"
          >
            ›
          </button>

          {/* Dots */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 pointer-events-none">
            {images.map((_, i) => (
              <span
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width:      i === current ? 14 : 5,
                  height:     5,
                  background: i === current ? "#1b5e38" : "rgba(0,0,0,0.18)",
                }}
              />
            ))}
          </div>
        </>
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
    const AMBER = "#c9a24a";
    const isNew =
      !!produit.created_at &&
      Date.now() - new Date(produit.created_at).getTime() < 1000 * 60 * 60 * 24 * 30;

    return (
      <Link href={href} className={cn("block group", className)}>
        <article
          className="relative flex w-full flex-col overflow-hidden rounded-2xl"
          style={{
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
            transition: "transform 0.26s ease, box-shadow 0.26s ease",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = "translateY(-5px)";
            el.style.boxShadow = "0 18px 38px rgba(15, 23, 42, 0.10)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = "translateY(0)";
            el.style.boxShadow = "0 10px 30px rgba(15, 23, 42, 0.06)";
          }}
        >
          {/* Image — taille/ratio naturel, non recadrée */}
          <div className="w-full" style={{ backgroundColor: "#f9fcf7" }}>
            <div className="relative w-full">
              {img ? (
                <Image
                  src={img.url}
                  alt={img.alt ?? nom}
                  width={800}
                  height={800}
                  className="block w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                  style={{ height: "auto" }}
                  sizes="(max-width:640px) 50vw, (max-width:1280px) 25vw, 20vw"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center text-5xl opacity-20">🌱</div>
              )}

              {isNew && (
                <span
                  className="absolute top-3 left-3 z-10 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
                  style={{ backgroundColor: AMBER }}
                >
                  Nouveau
                </span>
              )}
            </div>

            {/* Texte + CTA — juste sous l'image, ne recouvrent aucun pixel de la photo */}
            <div className="flex flex-col px-4 pb-4 pt-3">
              {produit.categorie?.nom && (
                <p className="text-[10px] font-bold uppercase tracking-wide text-ev-700 mb-1">
                  {produit.categorie.nom}
                </p>
              )}
              <h3
                className="text-[16px] sm:text-[17px] font-bold leading-tight text-[#162118]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {nom}
              </h3>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#162118]">Voir le produit</span>
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-200 group-hover:translate-x-0.5"
                  style={{ backgroundColor: "#2e6e1a" }}
                >
                  <ChevronRight size={14} strokeWidth={2.4} />
                </span>
              </div>
            </div>
          </div>
        </article>
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
                className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
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
    <Link href={href} className={cn("block group", className)}>
      <article
        className="produit-card-gradient relative flex h-full flex-col overflow-hidden rounded-[28px] p-4 sm:p-5"
        style={{
          background: "linear-gradient(160deg, #4f7a55 0%, #3d6647 100%)",
          transform: "translateY(0)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          boxShadow: "0 8px 20px rgba(31,77,52,0.18)",
        }}
        onMouseEnter={e => {
          setHovered(true);
          const el = e.currentTarget as HTMLElement;
          el.style.transform = "translateY(-8px)";
          el.style.boxShadow = "0 20px 40px rgba(31,77,52,0.28)";
        }}
        onMouseLeave={e => {
          setHovered(false);
          const el = e.currentTarget as HTMLElement;
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "0 8px 20px rgba(31,77,52,0.18)";
        }}
      >
        {/* ── Zone image — panneau blanc arrondi ── */}
        <div className="relative shrink-0 overflow-hidden rounded-2xl bg-white h-[200px] sm:h-[220px] lg:h-[240px]">

          {divBadge && (
            <span className={cn("absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase", divBadge.cls)}>
              {divBadge.label}
            </span>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {!hovered ? (
              <motion.div
                key="static"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0"
              >
                {img ? (
                  <Image
                    src={img.url}
                    alt={img.alt ?? nom}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width:640px)100vw,(max-width:1024px)50vw,25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">🌿</div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="carousel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0"
              >
                <ImageCarousel images={produit.images} nom={nom} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Texte ── */}
        <div className="flex flex-col items-center gap-1 px-2 pt-4 pb-1 text-center">
          <h3
            className="text-[1rem] sm:text-[1.05rem] font-bold leading-snug text-white line-clamp-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {nom}
          </h3>
        </div>

        {/* ── CTA — pilule blanche ── */}
        <div className="mt-auto flex justify-center px-2 pt-3 pb-1">
          <span
            className="produit-card-cta inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-5 py-2 text-[12.5px] font-semibold text-[#2f5c3e] transition-all duration-200 group-hover:gap-2.5"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Voir le produit <ChevronRight size={14} />
          </span>
        </div>
      </article>
    </Link>
  );
}