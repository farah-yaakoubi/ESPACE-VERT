"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Truck } from "lucide-react";

const FALLBACK_IMAGE = "/images/hero/machinisme.jpeg";
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/** Rouge / anthracite figés — volontairement hors palette `ev-*` afin de ne
 *  jamais être écrasés par une future évolution du thème `.theme-machinisme`. */
const RED      = "#e30613";
const RED_DARK = "#b3050f";
const INK      = "#0c0c0e";
const INK_2    = "#17181c";

interface JardinageHeroCategory {
  id_categorie: number;
  nom: string;
}

interface JardinageHeroShowcaseProps {
  activiteSlug: string;
  fallbackImage?: string;
  ctaHref?: string;
  categories?: JardinageHeroCategory[];
}

export function JardinageHeroShowcase({
  activiteSlug,
  fallbackImage = FALLBACK_IMAGE,
  ctaHref = "#produits-activite",
  categories = [],
}: JardinageHeroShowcaseProps) {
  const [image, setImage] = useState<string>(fallbackImage);

  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE}/hero-slides?page=activite:${activiteSlug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { image: string; actif: boolean; ordre: number }[]) => {
        if (cancelled) return;
        const first = data.filter((s) => s.actif).sort((a, b) => a.ordre - b.ordre)[0];
        if (first?.image) setImage(first.image);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [activiteSlug]);

  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: INK }}>
      <div className="relative min-h-[560px] lg:min-h-[620px] flex items-stretch pb-10 lg:pb-12">
        {/* ── Photo plein format ─────────────────────────────────────── */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Équipements de jardinage et machinisme" className="h-full w-full object-cover" />
        </div>

        {/* ── Contenu texte ───────────────────────────────────────────── */}
        <div
          className="relative z-10 container-ev flex items-center w-full"
          style={{ paddingTop: "calc(var(--nav-h, 80px) + 28px)" }}
        >
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.p
              className="text-[12px] sm:text-[13px] font-extrabold tracking-[0.22em] uppercase mb-3"
              style={{ color: RED }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              Matériel professionnel, location
            </motion.p>

            <motion.h1
              className="font-black uppercase leading-[1.06] tracking-tight text-[clamp(2rem,4.2vw,3.1rem)]"
              style={{ fontFamily: "var(--font-display)" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
            >
              <span className="block text-white">Notre collection</span>
              <span className="block" style={{ color: RED }}>Premium d&apos;équipements..</span>
            </motion.h1>

            <motion.p
              className="mt-4 text-[13.5px] sm:text-sm font-medium text-white/70 max-w-md"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
            >
              Tondeuses, motoculture, outillage thermique et électrique — le matériel où les
              professionnels et les particuliers exigeants trouvent robustesse et performance.
            </motion.p>

            <motion.div
              className="mt-7 flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <a
                href={ctaHref}
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-[13.5px] font-bold text-white uppercase tracking-wide transition-colors duration-200"
                style={{ backgroundColor: RED }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = RED_DARK)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = RED)}
              >
                Voir le catalogue
                <ArrowRight size={16} />
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Carte produit vedette flottante ─────────────────────────── */}
        <div className="absolute right-5 bottom-32 sm:bottom-36 lg:bottom-40 z-10 hidden sm:flex items-center gap-3 rounded-xl bg-white/95 backdrop-blur-sm px-4 py-3 shadow-2xl max-w-[260px]">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full shrink-0"
            style={{ backgroundColor: RED }}
          >
            <Truck size={18} strokeWidth={2.2} className="text-white" />
          </span>
          <div>
            <p className="text-[12.5px] font-bold text-gray-900 leading-tight">Livraison rapide</p>
          </div>
        </div>
      </div>

    </section>
  );
}