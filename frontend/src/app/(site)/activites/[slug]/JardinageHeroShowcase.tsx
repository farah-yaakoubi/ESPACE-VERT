"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const FALLBACK_IMAGE = "/images/hero/bannerjardinage-machinisme.webp";
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/** Rouge / anthracite figés — volontairement hors palette `ev-*` afin de ne
 *  jamais être écrasés par une future évolution du thème `.theme-machinisme`. */
const RED      = "#e30613";
const RED_DARK = "#b3050f";
const INK      = "#0c0c0e";
const INK_2    = "#17181c";
/** Vert de la marque (logo Espace Vert). */
const GREEN    = "#3a9b4a";

/** Texte du slogan, animé en machine à écrire (même rythme
 *  que sur la page Semences & Plants). Le saut de ligne est préservé
 *  grâce à `white-space: pre-line` sur le conteneur. */
const TITLE_TEXT = "Notre collection\nPremium d'équipements..";
const TYPE_SPEED_MS = 90;

/** Effet machine à écrire : révèle le texte caractère par caractère. */
function useTypewriter(text: string, speedMs: number) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    if (!text) return;
    const id = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, speedMs);
    return () => clearInterval(id);
  }, [text, speedMs]);

  return { visible: text.slice(0, count), done: count >= text.length };
}

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
  const { visible: titleVisible, done: titleDone } = useTypewriter(TITLE_TEXT, TYPE_SPEED_MS);

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

  const whiteGlow = "0 0 18px rgba(255,255,255,0.55), 0 1px 6px rgba(0,0,0,0.35)";

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
          className="relative z-10 container-ev flex items-center justify-center w-full"
          style={{ paddingTop: "calc(var(--nav-h, 80px) + 28px)" }}
        >
          <motion.div
            className="max-w-2xl text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.p
              className="text-[12px] sm:text-[13px] font-extrabold tracking-[0.22em] uppercase mb-3"
              style={{ color: GREEN }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              Jardinage &amp; Machinisme
            </motion.p>

            <motion.h1
              className="font-black uppercase leading-[1.06] tracking-tight text-[clamp(2rem,4.2vw,3.1rem)] text-white min-h-[2.2em]"
              style={{ fontFamily: "var(--font-display)", textShadow: whiteGlow, whiteSpace: "pre-line" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
            >
              {titleVisible}
              <span
                aria-hidden="true"
                className="inline-block w-[3px] h-[0.85em] bg-white align-[-0.08em] ml-1"
                style={{ opacity: titleDone ? 0 : undefined, animation: titleDone ? "none" : "ev-caret-blink 0.9s steps(1) infinite" }}
              />
              <style>{`
                @keyframes ev-caret-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
              `}</style>
            </motion.h1>
          </motion.div>
        </div>

        {/* ── Bouton centré dans le hero ─────────────────────────────── */}
        <motion.div
          className="absolute left-0 right-0 bottom-8 lg:bottom-10 z-10 flex justify-center"
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
      </div>

    </section>
  );
}