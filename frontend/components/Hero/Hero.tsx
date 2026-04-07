"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
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

// ─── Slides : chaque slide peut avoir une image ou un dégradé ────
const SLIDE_CONFIGS = [
  {
    id: 1,
    href: "/marques/fertivert?division=pro",
    bg: "from-[#edfbee] via-[#d0f0d4] to-[#b8e8c0]",
    accent: "#0a6030",
    textDark: true,
    // Chemin dans /public/images/hero/ — remplacez par vos vraies images
    image: "/images/hero/slide1.jpg",
    ctaKey: "s1_cta", badgeKey: "s1_badge", titleKey: "s1_title",
    subtitleKey: "s1_subtitle", tagKey: "s1_tag",
  },
  {
    id: 2,
    href: "/contact",
    bg: "from-[#eff8ff] via-[#d4eeff] to-[#b8dfff]",
    accent: "#1558c0",
    textDark: true,
    image: "/images/hero/slide2.jpg",
    ctaKey: "s2_cta", badgeKey: "s2_badge", titleKey: "s2_title",
    subtitleKey: "s2_subtitle", tagKey: "s2_tag",
  },
  {
    id: 3,
    href: "/marques/fertivert?division=garden",
    bg: "from-[#fff8ee] via-[#fde8c4] to-[#f8c890]",
    accent: "#b04010",
    textDark: true,
    image: "/images/hero/slide3.jpg",
    ctaKey: "s3_cta", badgeKey: "s3_badge", titleKey: "s3_title",
    subtitleKey: "s3_subtitle", tagKey: "s3_tag",
  },
  {
    id: 4,
    href: "/marques/matar",
    bg: "from-[#e0f8f6] via-[#b8ede8] to-[#90ddd6]",
    accent: "#1b6b7a",
    textDark: true,
    image: "/images/hero/slide4.jpg",
    ctaKey: "s4_cta", badgeKey: "s4_badge", titleKey: "s4_title",
    subtitleKey: "s4_subtitle", tagKey: "s4_tag",
  },
  {
    id: 5,
    href: "/contact",
    bg: "from-[#f0ecff] via-[#ddd4ff] to-[#c4b4ff]",
    accent: "#5020a0",
    textDark: true,
    image: "/images/hero/slide5.jpg",
    ctaKey: "s5_cta", badgeKey: "s5_badge", titleKey: "s5_title",
    subtitleKey: "s5_subtitle", tagKey: "s5_tag",
  },
];

export default function Hero() {
  const locale = useLocale();
  const t  = useTranslations("home");
  const ts = useTranslations("home.slides");

  const [current,    setCurrent]   = useState(0);
  const [direction,  setDirection] = useState(1);
  // Suivi des images qui ont échoué à charger (on bascule sur le dégradé)
  const [imgErrors,  setImgErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent(c => (c + 1) % SLIDE_CONFIGS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };
  const prev = () => {
    setDirection(-1);
    setCurrent(c => (c - 1 + SLIDE_CONFIGS.length) % SLIDE_CONFIGS.length);
  };
  const next = () => {
    setDirection(1);
    setCurrent(c => (c + 1) % SLIDE_CONFIGS.length);
  };

  const cfg = SLIDE_CONFIGS[current];
  const hasImage = cfg.image && !imgErrors.has(cfg.id);

  const variants = {
    enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 80 : -80 }),
    center: { opacity: 1, x: 0 },
    exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -80 : 80 }),
  };

  const featureIcons    = [TruckIcon, ShieldCheckIcon, UserGroupIcon, SparklesIcon];
  const featureKeys     = ["fastDelivery","qualityGuarantee","expertSupport","innovation"] as const;
  const featureDescKeys = ["fastDeliveryDesc","qualityGuaranteeDesc","expertSupportDesc","innovationDesc"] as const;

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">

      {/* ── Fond : IMAGE ou DÉGRADÉ ──────────────────────────────── */}
      <AnimatePresence mode="sync">
        {hasImage ? (
          <motion.div
            key={cfg.id + "-img"}
            className="absolute inset-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src={cfg.image!}
              alt={ts(cfg.badgeKey as any)}
              fill
              priority={current === 0}
              className="object-cover object-center"
              sizes="100vw"
              onError={() => setImgErrors(s => new Set(s).add(cfg.id))}
            />
            {/* Overlay dégradé sur l'image pour lisibilité du texte */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${cfg.accent}dd 0%, ${cfg.accent}88 50%, transparent 100%)`,
              }}
            />
          </motion.div>
        ) : (
          /* Dégradé de secours */
          <motion.div
            key={cfg.id + "-bg"}
            className={`absolute inset-0 bg-gradient-to-br ${cfg.bg}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>

      {/* Motif grid décoratif */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)"/>
        </svg>
      </div>

      {/* ── Contenu slides ────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-28 pb-8 w-full">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={cfg.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              {/* GAUCHE — texte */}
              <div>
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-7 backdrop-blur-sm border border-white/20"
                  style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>
                  <SparklesIcon className="w-4 h-4 text-white" />
                  <span className="text-sm font-bold text-white">{ts(cfg.badgeKey as any)}</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: "rgba(255,255,255,0.25)" }}>
                    {ts(cfg.tagKey as any)}
                  </span>
                </div>

                <h1 className={`text-5xl lg:text-6xl xl:text-7xl font-black mb-5 leading-tight whitespace-pre-line ${hasImage ? "text-white drop-shadow-lg" : ""}`}
                  style={!hasImage ? { color: cfg.accent } : undefined}>
                  {ts(cfg.titleKey as any)}
                </h1>
                <p className={`text-lg mb-9 leading-relaxed max-w-lg ${hasImage ? "text-white/85" : ""}`}
                  style={!hasImage ? { color: cfg.accent + "cc" } : undefined}>
                  {ts(cfg.subtitleKey as any)}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-14">
                  <Link href={`/${locale}${cfg.href}`}
                    className="group px-7 py-3.5 font-bold rounded-xl shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 text-white"
                    style={{ backgroundColor: hasImage ? "rgba(255,255,255,0.2)" : cfg.accent + "cc", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }}>
                    {ts(cfg.ctaKey as any)}
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href={`/${locale}/contact`}
                    className="group px-7 py-3.5 bg-white/90 hover:bg-white backdrop-blur-sm border font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                    style={{ color: cfg.accent }}>
                    <EnvelopeIcon className="w-4 h-4" />
                    {t("requestQuote")}
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {([ ["30+","yearsExp"], ["5000+","happyClients"], ["100+","productsAvail"] ] as const).map(([val,key],i) => (
                    <div key={i} className="bg-white/85 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                      <div className="text-2xl font-black" style={{ color: cfg.accent }}>{val}</div>
                      <div className="text-xs font-medium mt-0.5 text-gray-600">{t(key)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DROITE — logo animé */}
              <div className="relative hidden lg:flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute w-80 h-80 rounded-full border-2 border-white/20" />
                <motion.div animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute w-56 h-56 rounded-full border border-white/15" />
                <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-12 border border-white/40 shadow-2xl text-center">
                  <motion.div animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3.5, repeat: Infinity }}
                    className="mb-4 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
                      style={{ background: cfg.accent + "25", border: "2px solid " + cfg.accent + "40" }}>
                      <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
                        stroke={cfg.accent} strokeWidth="1.4" strokeLinecap="round">
                        <path d="M12 22V12M12 12C12 6 7 4 2 5c0 6 3 10 8 11 1 .3 2 0 2-4z"/>
                        <path d="M12 12c0-6 5-8 10-7-1 6-4 10-8 11-1 .3-2 0-2-4z"/>
                      </svg>
                    </div>
                  </motion.div>
                  <p className="font-black text-xl" style={{ color: cfg.accent }}>{ts(cfg.badgeKey as any)}</p>
                  <p className="text-sm mt-1 text-gray-400">Espace Vert — الفضاء الأخضر</p>
                  {/* Dots navigation */}
                  <div className="flex justify-center gap-1.5 mt-6">
                    {SLIDE_CONFIGS.map((_, i) => (
                      <button key={i} onClick={() => goTo(i)}
                        className="rounded-full transition-all duration-500"
                        style={{
                          width: i === current ? 24 : 8,
                          height: 8,
                          backgroundColor: i === current ? cfg.accent : cfg.accent + "44"
                        }} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Flèches navigation ────────────────────────────────────── */}
      <button onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm border flex items-center justify-center transition-all hover:scale-110 shadow-md">
        <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
      </button>
      <button onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm border flex items-center justify-center transition-all hover:scale-110 shadow-md">
        <ChevronRightIcon className="w-5 h-5 text-gray-700" />
      </button>

      {/* ── Barre features ────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-5"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {featureIcons.map((Icon, i) => (
              <div key={i} className="flex items-center gap-3 group cursor-pointer">
                <div className="w-11 h-11 bg-gradient-to-br from-[#e8f5d9] to-[#d0edb5] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-[#2d5a1b]" />
                </div>
                <div>
                  <p className="font-black text-gray-900 text-sm group-hover:text-[#2d5a1b] transition-colors">
                    {t(featureKeys[i])}
                  </p>
                  <p className="text-xs text-gray-500">{t(featureDescKeys[i])}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
