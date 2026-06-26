"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
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
            className="object-contain p-6"
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
  variant?: "default" | "seed";
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
      <Link href={href} className={cn("block group", className)}>
        <article
          className="relative flex h-full flex-col overflow-hidden rounded-[26px] border border-[#edf1ec] bg-white"
          style={{
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
            transition: "transform 0.26s ease, box-shadow 0.26s ease, border-color 0.26s ease",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = "translateY(-5px)";
            el.style.boxShadow = "0 18px 38px rgba(15, 23, 42, 0.10)";
            el.style.borderColor = "#dbe7d4";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.transform = "translateY(0)";
            el.style.boxShadow = "0 10px 30px rgba(15, 23, 42, 0.06)";
            el.style.borderColor = "#edf1ec";
          }}
        >
          <div className="relative flex h-[190px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#f9fcf7_0%,#ffffff_76%)] px-5 pt-6 sm:h-[210px]">
            {img ? (
              <Image
                src={img.url}
                alt={img.alt ?? nom}
                fill
                className="object-contain p-5 transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width:640px)50vw,(max-width:1024px)33vw,300px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl opacity-20">🌱</div>
            )}
          </div>

          <div className="flex flex-1 flex-col px-6 pb-6 pt-1 text-left">
            <h3
              className="min-h-[2.9rem] text-[1rem] font-bold leading-snug text-[#162118] transition-colors group-hover:text-ev-700"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {nom}
            </h3>
            <p className="mt-2 line-clamp-2 text-[12.5px] leading-5 text-gray-400">
              {description ?? "Decouvrez cette reference semences adaptee a vos besoins de culture."}
            </p>
            <div className="mt-auto pt-4">
              <span
                className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#2e7d4f,#1f6a3e)] px-5 py-2.5 text-[12px] font-semibold text-white shadow-[0_10px_20px_rgba(46,125,79,0.18)] transition-all duration-200 group-hover:translate-y-[-1px] group-hover:shadow-[0_14px_28px_rgba(46,125,79,0.24)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Voir le produit
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={href} className={cn("block group", className)}>
      <article
        className="relative flex flex-col overflow-hidden rounded-2xl border border-sand-200 h-full"
        style={{
          background:  "white",
          boxShadow:   "0 1px 4px rgba(0,0,0,.06)",
          transform:   "translateY(0)",
          transition:  "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
        }}
        onMouseEnter={e => {
          setHovered(true);
          const el = e.currentTarget as HTMLElement;
          el.style.transform   = "translateY(-10px)";
          el.style.boxShadow   = "0 24px 48px rgba(61,165,53,0.20), 0 8px 20px rgba(61,165,53,0.12)";
          el.style.borderColor = "#7dc040";
        }}
        onMouseLeave={e => {
          setHovered(false);
          const el = e.currentTarget as HTMLElement;
          el.style.transform   = "translateY(0)";
          el.style.boxShadow   = "0 1px 4px rgba(0,0,0,.06)";
          el.style.borderColor = "";
        }}
      >
        {/* ── Zone image ── */}
        <div className="relative bg-[#f0f0f0] shrink-0 overflow-hidden h-[280px] sm:h-[300px] lg:h-[340px]">

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
                    className="object-contain p-6"
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

          {/* Shimmer bottom */}
          <div
            className="absolute inset-x-0 bottom-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
            style={{ background: "linear-gradient(to right, #7dc040, #3fa535, #7dc040)" }}
          />
        </div>

        {/* ── Texte ── */}
        <div className="flex flex-col flex-1 px-5 py-4 sm:px-6 sm:py-5 gap-1.5">
          <h3
            className="text-[1rem] sm:text-[1.05rem] font-bold leading-snug text-gray-900 group-hover:text-ev-700 transition-colors line-clamp-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {nom}
          </h3>
          {description && (
            <p className="text-[13.5px] text-gray-500 leading-relaxed line-clamp-3 mt-0.5">
              {description}
            </p>
          )}
        </div>

        {/* ── CTA ── */}
        <div className="px-5 pb-5 sm:px-6">
          <span
            className="block text-center text-[12.5px] font-semibold text-ev-700 border border-ev-200 rounded-xl py-2.5 transition-all duration-200 group-hover:bg-ev-700 group-hover:text-white group-hover:border-ev-700"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Voir le produit →
          </span>
        </div>
      </article>
    </Link>
  );
}
