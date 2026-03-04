"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CalendarIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useLocale } from "next-intl";

const news = [
  {
    id: 1,
    title: "Nouvelle gamme de biostimulants innovants",
    excerpt: "Découvrez notre dernière innovation pour une agriculture plus durable.",
    date: "2026-02-10",
    category: "Innovation",
    bg: "linear-gradient(135deg, #1a3d0a, #4a7c2f)",
    emoji: "🌱",
  },
  {
    id: 2,
    title: "Ouverture d'une nouvelle agence à Sfax",
    excerpt: "Notre 5ème agence dans le sud tunisien avec des experts dédiés.",
    date: "2026-02-05",
    category: "Actualité",
    bg: "linear-gradient(135deg, #0d3b6e, #2980d4)",
    emoji: "🏢",
  },
  {
    id: 3,
    title: "Formation gratuite sur la fertilisation",
    excerpt: "Sessions gratuites pour maîtriser les techniques modernes.",
    date: "2026-01-28",
    category: "Formation",
    bg: "linear-gradient(135deg, #2d1b69, #7c5cbf)",
    emoji: "🎓",
  },
  {
    id: 4,
    title: "Promotion sur les engrais organiques",
    excerpt: "Profitez de -20% sur toute notre gamme bio jusqu'à fin du mois.",
    date: "2026-01-20",
    category: "Promotion",
    bg: "linear-gradient(135deg, #7c2d12, #ea580c)",
    emoji: "🎉",
  },
  {
    id: 5,
    title: "Nouvelle solution d'irrigation intelligente",
    excerpt: "Économisez jusqu'à 40% d'eau avec notre système connecté.",
    date: "2026-01-15",
    category: "Technologie",
    bg: "linear-gradient(135deg, #134e4a, #14b8a6)",
    emoji: "💧",
  },
  {
    id: 6,
    title: "Lancement Ferti Roots+ nouvelle formule",
    excerpt: "Stimulant racinaire nouvelle génération, résultats visibles en 7 jours.",
    date: "2026-01-08",
    category: "Produit",
    bg: "linear-gradient(135deg, #1a3d0a, #6b9e3e)",
    emoji: "⚡",
  },
];

// Dupliqué pour le défilement infini
const doubled = [...news, ...news];

export default function NewsCarousel() {
  const locale = useLocale();
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(0);

  // Auto-scroll continu
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf: number;
    let pos = 0;
    const CARD_W = 360 + 20; // largeur + gap
    const TOTAL = news.length * CARD_W;

    const step = () => {
      if (!paused) {
        pos += 0.6;
        if (pos >= TOTAL) pos = 0;
        track.style.transform = `translateX(-${pos}px)`;
        // Calcul slide active
        const idx = Math.round(pos / CARD_W) % news.length;
        setActive(idx);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  return (
    <section className="w-full overflow-hidden bg-[#f7faf5] py-0">

      {/* ── En-tête ── */}
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between"
        >
           <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-8 bg-[#2d5a1b] rounded-full" />
                      <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">Actualités</h2>
                    </div>
            <h2 className="text-4xl font-black text-gray-900">Restez Informés</h2>
          </div>
          <Link
            href={`/${locale}/actualites`}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a3d0a] text-white text-sm font-bold rounded-xl hover:bg-[#2d5a1b] transition-colors"
          >
            Toutes les actualités
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
      {/* ── Ruban défilant (pleine largeur, 0 padding) ── */}
      <div
        className="w-full overflow-hidden relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Dégradés de bord */}
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #f7faf5, transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #f7faf5, transparent)" }} />

        {/* Track */}
        <div
          ref={trackRef}
          className="flex gap-5 pb-6"
          style={{ width: "max-content", willChange: "transform", paddingLeft: 24 }}
        >
          {doubled.map((item, i) => (
            <Link
              key={`${item.id}-${i}`}
              href={`/${locale}/actualites/${item.id}`}
              className="flex-shrink-0 w-[360px] group"
            >
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow h-[220px] relative"
                style={{ background: item.bg }}
              >
                {/* Décoration */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />
                <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none" />

                {/* Contenu */}
                <div className="relative z-10 h-full flex flex-col justify-between p-6">
                  <div>
                    {/* Badge + date */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-black text-white/80 uppercase tracking-wider bg-white/15 px-2.5 py-1 rounded-full">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-white/60 text-[11px]">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {new Date(item.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </div>
                    </div>

                    {/* Titre */}
                    <h3 className="text-white font-black text-[17px] leading-snug line-clamp-2 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-white/70 text-[13px] leading-relaxed line-clamp-2">
                      {item.excerpt}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-white/80 group-hover:text-white transition-colors">
                      Lire la suite
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center transition-all group-hover:translate-x-0.5">
                      <ArrowRightIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Emoji déco */}
                <div className="absolute top-4 right-4 text-4xl opacity-20 group-hover:opacity-35 transition-opacity pointer-events-none select-none">
                  {item.emoji}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Indicateurs ── */}
      <div className="flex justify-center gap-2 pb-12 mt-2">
        {news.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: i === active ? 28 : 8,
              background: i === active ? "#1a3d0a" : "#d1d5db",
            }}
          />
        ))}
      </div>
    </section>
  );
}
