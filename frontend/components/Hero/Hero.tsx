"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowRightIcon, SparklesIcon, TruckIcon, ShieldCheckIcon,
  UserGroupIcon, EnvelopeIcon, ChevronLeftIcon, ChevronRightIcon,
} from "@heroicons/react/24/outline";

const SLIDE_CONFIGS = [
  { id:1, href:"/marques/fertivert?division=pro",    bg:"from-[#0f2a07] via-[#1a3d0a] to-[#2d5a1b]", accent:"#8cc63f",  emoji:"🌱", ctaKey:"s1_cta", badgeKey:"s1_badge", titleKey:"s1_title", subtitleKey:"s1_subtitle", tagKey:"s1_tag" },
  { id:2, href:"/contact",                           bg:"from-[#0d2744] via-[#0d3b6e] to-[#1a5fa8]", accent:"#60a5fa",  emoji:"🏢", ctaKey:"s2_cta", badgeKey:"s2_badge", titleKey:"s2_title", subtitleKey:"s2_subtitle", tagKey:"s2_tag" },
  { id:3, href:"/marques/fertivert?division=garden", bg:"from-[#3b1a04] via-[#7c2d12] to-[#c2410c]", accent:"#fb923c",  emoji:"🎉", ctaKey:"s3_cta", badgeKey:"s3_badge", titleKey:"s3_title", subtitleKey:"s3_subtitle", tagKey:"s3_tag" },
  { id:4, href:"/marques/matar",                     bg:"from-[#042f2e] via-[#134e4a] to-[#0f766e]", accent:"#34d399",  emoji:"💧", ctaKey:"s4_cta", badgeKey:"s4_badge", titleKey:"s4_title", subtitleKey:"s4_subtitle", tagKey:"s4_tag" },
  { id:5, href:"/contact",                           bg:"from-[#1e0a3c] via-[#2d1b69] to-[#4c1d95]", accent:"#a78bfa",  emoji:"🎓", ctaKey:"s5_cta", badgeKey:"s5_badge", titleKey:"s5_title", subtitleKey:"s5_subtitle", tagKey:"s5_tag" },
];

export default function Hero() {
  const locale  = useLocale();
  const t       = useTranslations("home");
  const ts      = useTranslations("home.slides");

  const [current, setCurrent]   = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => { setDirection(1); setCurrent(c => (c + 1) % SLIDE_CONFIGS.length); }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (idx: number) => { setDirection(idx > current ? 1 : -1); setCurrent(idx); };
  const prev = () => { setDirection(-1); setCurrent(c => (c - 1 + SLIDE_CONFIGS.length) % SLIDE_CONFIGS.length); };
  const next = () => { setDirection(1);  setCurrent(c => (c + 1) % SLIDE_CONFIGS.length); };

  const cfg = SLIDE_CONFIGS[current];
  const variants = {
    enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 80 : -80 }),
    center: { opacity: 1, x: 0 },
    exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -80 : 80 }),
  };

  const featureIcons = [TruckIcon, ShieldCheckIcon, UserGroupIcon, SparklesIcon];
  const featureKeys  = ["fastDelivery","qualityGuarantee","expertSupport","innovation"] as const;
  const featureDescKeys = ["fastDeliveryDesc","qualityGuaranteeDesc","expertSupportDesc","innovationDesc"] as const;

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Fond animé */}
      <AnimatePresence mode="sync">
        <motion.div
          key={cfg.id + "-bg"}
          className={`absolute inset-0 bg-gradient-to-br ${cfg.bg}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px)", backgroundSize:"32px 32px" }} />

      <motion.div animate={{ scale:[1,1.2,1], opacity:[0.15,0.3,0.15] }} transition={{ duration:8, repeat:Infinity }}
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/4"
        style={{ backgroundColor: cfg.accent + "40" }} />

      {/* CONTENU */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-32 w-full">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={cfg.id} custom={direction} variants={variants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            >
              <div>
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-7 backdrop-blur-sm border border-white/20"
                  style={{ backgroundColor: cfg.accent + "25" }}>
                  <SparklesIcon className="w-4 h-4" style={{ color: cfg.accent }} />
                  <span className="text-sm font-bold text-white/90">{ts(cfg.badgeKey as any)}</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: cfg.accent }}>
                    {ts(cfg.tagKey as any)}
                  </span>
                </div>

                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-5 leading-tight whitespace-pre-line">
                  {ts(cfg.titleKey as any)}
                </h1>
                <p className="text-lg text-white/75 mb-9 leading-relaxed max-w-lg">{ts(cfg.subtitleKey as any)}</p>

                <div className="flex flex-col sm:flex-row gap-3 mb-14">
                  <Link href={`/${locale}${cfg.href}`}
                    className="group px-7 py-3.5 font-bold rounded-xl shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 text-white"
                    style={{ backgroundColor: cfg.accent + "cc", boxShadow:`0 8px 24px ${cfg.accent}40` }}>
                    {ts(cfg.ctaKey as any)}
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href={`/${locale}/contact`}
                    className="group px-7 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/25 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                    <EnvelopeIcon className="w-4 h-4" />
                    {t("requestQuote")}
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {([["30+","yearsExp"],["5000+","happyClients"],["100+","productsAvail"]] as const).map(([val,key],i) => (
                    <div key={i} className="bg-white/8 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <div className="text-2xl font-black" style={{ color: cfg.accent }}>{val}</div>
                      <div className="text-xs text-white/60 font-medium mt-0.5">{t(key)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DROITE */}
              <div className="relative hidden lg:flex items-center justify-center">
                <motion.div animate={{ rotate:360 }} transition={{ duration:30, repeat:Infinity, ease:"linear" }}
                  className="absolute w-80 h-80 rounded-full border" style={{ borderColor: cfg.accent + "30" }} />
                <motion.div animate={{ rotate:-360 }} transition={{ duration:20, repeat:Infinity, ease:"linear" }}
                  className="absolute w-56 h-56 rounded-full border-2" style={{ borderColor: cfg.accent + "20" }} />
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl text-center">
                  <motion.div animate={{ scale:[1,1.05,1] }} transition={{ duration:3.5, repeat:Infinity }} className="mb-4 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
                      style={{ background: cfg.accent + "25", border:"2px solid " + cfg.accent + "40" }}>
                      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke={cfg.accent} strokeWidth="1.4" strokeLinecap="round">
                        <path d="M12 22V12M12 12C12 6 7 4 2 5c0 6 3 10 8 11 1 .3 2 0 2-4z"/>
                        <path d="M12 12c0-6 5-8 10-7-1 6-4 10-8 11-1 .3-2 0-2-4z"/>
                      </svg>
                    </div>
                  </motion.div>
                  <p className="text-white font-black text-xl">{ts(cfg.badgeKey as any)}</p>
                  <p className="text-white/60 text-sm mt-1">Espace Vert — الفضاء الأخضر</p>
                  <div className="flex justify-center gap-1.5 mt-6">
                    {SLIDE_CONFIGS.map((_, i) => (
                      <button key={i} onClick={() => goTo(i)} className="rounded-full transition-all duration-500"
                        style={{ width: i===current ? 24 : 8, height:8, backgroundColor: i===current ? cfg.accent : "rgba(255,255,255,0.3)" }} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Flèches nav */}
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110">
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110">
        <ChevronRightIcon className="w-5 h-5" />
      </button>

      {/* FEATURES BAR */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-8 w-full">
        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.8 }}
          className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {featureIcons.map((Icon, i) => (
              <div key={i} className="flex items-center gap-3 group cursor-pointer">
                <div className="w-11 h-11 bg-gradient-to-br from-[#e8f5d9] to-[#d0edb5] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-[#2d5a1b]" />
                </div>
                <div>
                  <p className="font-black text-gray-900 text-sm group-hover:text-[#2d5a1b] transition-colors">{t(featureKeys[i])}</p>
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
