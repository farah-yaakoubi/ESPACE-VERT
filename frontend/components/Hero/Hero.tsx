"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowRightIcon,
  SparklesIcon,
  TruckIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  EnvelopeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const slides = [
  {
    id: 1,
    badge: "Nouveauté 2026",
    title: "Biostimulants\nNouvelle Génération",
    subtitle: "Gamme Ferti Roots+ reformulée — résultats visibles en 7 jours, certifiée agriculture durable.",
    cta: { label: "Découvrir la gamme", href: "/marques/fertivert?division=pro" },
    bg: "from-[#0f2a07] via-[#1a3d0a] to-[#2d5a1b]",
    accent: "#8cc63f",
    emoji: "🌱",
    tag: "Innovation",
  },
  {
    id: 2,
    badge: "Ouverture",
    title: "Nouvelle Agence\nà Sfax",
    subtitle: "Notre 5ème agence dans le sud tunisien. Équipe d'experts locaux pour vous accompagner.",
    cta: { label: "Nous contacter", href: "/contact" },
    bg: "from-[#0d2744] via-[#0d3b6e] to-[#1a5fa8]",
    accent: "#60a5fa",
    emoji: "🏢",
    tag: "Actualité",
  },
  {
    id: 3,
    badge: "Promotion",
    title: "−20% sur toute\nla gamme Bio",
    subtitle: "Profitez de nos engrais organiques certifiés à prix réduit jusqu'à fin mars 2026.",
    cta: { label: "Voir les offres", href: "/marques/fertivert?division=garden" },
    bg: "from-[#3b1a04] via-[#7c2d12] to-[#c2410c]",
    accent: "#fb923c",
    emoji: "🎉",
    tag: "Offre",
  },
  {
    id: 4,
    badge: "Technologie",
    title: "Irrigation\nIntelligente",
    subtitle: "Économisez jusqu'à 40% d'eau avec notre nouveau système connecté Matar Smart.",
    cta: { label: "En savoir plus", href: "/marques/matar" },
    bg: "from-[#042f2e] via-[#134e4a] to-[#0f766e]",
    accent: "#34d399",
    emoji: "💧",
    tag: "Technologie",
  },
  {
    id: 5,
    badge: "Formation",
    title: "Sessions\nGratuites",
    subtitle: "Maîtrisez les techniques modernes de fertilisation avec nos experts certifiés.",
    cta: { label: "S'inscrire", href: "/contact" },
    bg: "from-[#1e0a3c] via-[#2d1b69] to-[#4c1d95]",
    accent: "#a78bfa",
    emoji: "🎓",
    tag: "Événement",
  },
];

const features = [
  { icon: TruckIcon, title: "Livraison Rapide", description: "Dans toute la Tunisie" },
  { icon: ShieldCheckIcon, title: "Qualité Garantie", description: "Produits certifiés" },
  { icon: UserGroupIcon, title: "Support Expert", description: "Conseils personnalisés" },
  { icon: SparklesIcon, title: "Innovation", description: "Solutions modernes" },
];

export default function Hero() {
  const locale = useLocale();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };
  const prev = () => { setDirection(-1); setCurrent((c) => (c - 1 + slides.length) % slides.length); };
  const next = () => { setDirection(1); setCurrent((c) => (c + 1) % slides.length); };

  const slide = slides[current];

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 80 : -80 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -80 : 80 }),
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Fond animé selon slide */}
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id + "-bg"}
          className={`absolute inset-0 bg-gradient-to-br ${slide.bg}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>

      {/* Texture points */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Cercles déco */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/4"
        style={{ backgroundColor: slide.accent + "40" }}
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4"
        style={{ backgroundColor: slide.accent + "30" }}
      />

      {/* CONTENU PRINCIPAL */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-32 w-full">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={slide.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            >
              {/* GAUCHE */}
              <div>
                {/* Badge */}
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-7 backdrop-blur-sm border border-white/20"
                  style={{ backgroundColor: slide.accent + "25" }}
                >
                  <SparklesIcon className="w-4 h-4" style={{ color: slide.accent }} />
                  <span className="text-sm font-bold text-white/90">{slide.badge}</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: slide.accent }}>
                    {slide.tag}
                  </span>
                </div>

                {/* Titre */}
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-5 leading-tight whitespace-pre-line">
                  {slide.title}
                </h1>

                {/* Sous-titre */}
                <p className="text-lg text-white/75 mb-9 leading-relaxed max-w-lg">{slide.subtitle}</p>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3 mb-14">
                  <Link
                    href={`/${locale}${slide.cta.href}`}
                    className="group px-7 py-3.5 font-bold rounded-xl shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 text-white"
                    style={{ backgroundColor: slide.accent + "cc", boxShadow: `0 8px 24px ${slide.accent}40` }}
                  >
                    {slide.cta.label}
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href={`/${locale}/contact`}
                    className="group px-7 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/25 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <EnvelopeIcon className="w-4 h-4" />
                    Demander un devis
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { val: "30+", label: "Années d'expérience" },
                    { val: "5000+", label: "Clients satisfaits" },
                    { val: "100+", label: "Produits disponibles" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/8 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <div className="text-2xl font-black" style={{ color: slide.accent }}>{s.val}</div>
                      <div className="text-xs text-white/60 font-medium mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DROITE */}
              <div className="relative hidden lg:flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute w-80 h-80 rounded-full border"
                  style={{ borderColor: slide.accent + "30" }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute w-56 h-56 rounded-full border-2"
                  style={{ borderColor: slide.accent + "20" }}
                />
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl text-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                    className="mb-4 flex items-center justify-center"
                  >
                    <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
                      style={{ background: slide.accent + "25", border: "2px solid " + slide.accent + "40" }}>
                      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke={slide.accent} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22V12M12 12C12 6 7 4 2 5c0 6 3 10 8 11 1 .3 2 0 2-4z"/>
                        <path d="M12 12c0-6 5-8 10-7-1 6-4 10-8 11-1 .3-2 0-2-4z"/>
                      </svg>
                    </div>
                  </motion.div>
                  <p className="text-white font-black text-xl">{slide.badge}</p>
                  <p className="text-white/60 text-sm mt-1">Espace Vert — الفضاء الأخضر</p>
                  {/* Indicateurs */}
                  <div className="flex justify-center gap-1.5 mt-6">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goTo(i)}
                        className="rounded-full transition-all duration-500"
                        style={{
                          width: i === current ? 24 : 8,
                          height: 8,
                          backgroundColor: i === current ? slide.accent : "rgba(255,255,255,0.3)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Flèches */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>

      {/* BARRE FEATURES */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-5"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 group cursor-pointer">
                <div className="w-11 h-11 bg-gradient-to-br from-[#e8f5d9] to-[#d0edb5] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5 text-[#2d5a1b]" />
                </div>
                <div>
                  <p className="font-black text-gray-900 text-sm group-hover:text-[#2d5a1b] transition-colors">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}