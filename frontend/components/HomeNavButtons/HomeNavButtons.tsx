"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import Image from "next/image";

const GREEN_DARK = "#1D6B2A";
const GREEN_MAIN = "#3CB648";
const GREEN_LIME = "#68cc74";

const ChevronRight = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

const ACTIVITES = [
  { href:"/activites/semences-et-plants",      key:"semences",       fallback:"linear-gradient(170deg,#1a3d0a 0%,#2d6e1a 55%,#4a8f2a 100%)" },
  { href:"/activites/irrigation",              key:"irrigation",     fallback:"linear-gradient(170deg,#0D3D47 0%,#155B6A 55%,#1B6B7A 100%)" },
  { href:"/activites/fertilisation",           key:"fertilisation",  fallback:"linear-gradient(170deg,#0a1a10 0%,#14401e 55%,#1e6628 100%)" },
  { href:"/activites/machinisme-et-jardinage", key:"machinisme",     fallback:"linear-gradient(170deg,#3b1a04 0%,#7c2d12 55%,#c2410c 100%)" },
  { href:"/activites/pulverisation",           key:"pulverisation",  fallback:"linear-gradient(170deg,#1D6B2A 0%,#27932F 55%,#3CB648 100%)" },
];

const MARQUES = [
  { href:"/marques/fertivert", key:"fertivert", subKey:"fertivert_sub", descKey:"fertivert_desc", photo:"/logos/LOGO_FERTiVERT_white.png", fallback:"linear-gradient(135deg,#0d2106 0%,#1a3d0a 50%,#2d6e1a 100%)", accent:GREEN_MAIN, isLogo:true },
  { href:"/marques/pulvert",   key:"pulvert",   subKey:"pulvert_sub",   descKey:"pulvert_desc",   photo:"/images/marques/pulvert-bg.jpg",  fallback:"linear-gradient(135deg,#1D6B2A 0%,#F2C200 100%)", accent:"#F2C200", isLogo:false },
  { href:"/marques/matar",     key:"matar",     subKey:"matar_sub",     descKey:"matar_desc",     photo:"/images/marques/matar-bg.jpg",   fallback:"linear-gradient(135deg,#0D3D47 0%,#1B6B7A 100%)", accent:"#4BA8D8", isLogo:false },
];

function ActivityCard({ item, locale, index, label }: { item: typeof ACTIVITES[0]; locale: string; index: number; label: string; }) {
  const [imgError, setImgError] = useState(false);
  return (
    <motion.div
      initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
      transition={{ delay: index * 0.08, duration:0.55, ease:[0.22,1,0.36,1] }}
      className="flex-1 min-w-0" style={{ height:"clamp(300px,50vw,500px)" }}>
      <Link href={`/${locale}${item.href}`} className="group relative block w-full h-full overflow-hidden cursor-pointer">
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110 will-change-transform">
          {!imgError ? (
            <Image src={item.href} alt={label} fill className="object-cover" onError={() => setImgError(true)} sizes="20vw" />
          ) : (
            <div className="w-full h-full" style={{ background: item.fallback }} />
          )}
        </div>
        <div className="absolute inset-0 z-10" style={{ background:"linear-gradient(to top,rgba(0,0,0,0.80) 0%,rgba(0,0,0,0.25) 45%,transparent 80%)" }} />
        <div className="absolute bottom-0 left-0 right-0 z-20 p-5 flex items-end justify-between">
          <h3 className="text-white font-black leading-tight drop-shadow" style={{ fontSize:"clamp(14px,1.8vw,22px)" }}>{label}</h3>
          <motion.div className="flex-shrink-0 rounded-full flex items-center justify-center shadow-lg"
            style={{ width:48, height:48, background:GREEN_MAIN, boxShadow:`0 4px 18px rgba(60,182,72,0.55)` }}
            whileHover={{ scale:1.18 }} transition={{ type:"spring", stiffness:400, damping:18 }}>
            <motion.div animate={{ x:[0,5,0] }} transition={{ repeat:Infinity, duration:1.4, ease:"easeInOut", delay:index*0.25 }}>
              <ChevronRight />
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute inset-0 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow:`inset 0 0 0 3px ${GREEN_MAIN}` }} />
      </Link>
    </motion.div>
  );
}

function BrandCard({ item, locale, index, label, sub, desc }: { item: typeof MARQUES[0]; locale: string; index: number; label: string; sub: string; desc: string; }) {
  const [imgError, setImgError] = useState(false);
  return (
    <motion.div
      initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
      transition={{ delay: 0.1 + index * 0.1, duration:0.5, ease:[0.22,1,0.36,1] }}
      style={{ height:260 }}>
      <Link href={`/${locale}${item.href}`} className="group relative block w-full h-full overflow-hidden cursor-pointer">
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110 will-change-transform">
          {item.isLogo ? (
            <>
              <div className="w-full h-full" style={{ background: item.fallback }} />
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <Image src={item.photo} alt={label} width={240} height={120}
                  className="object-contain w-full max-w-[240px] max-h-[120px]"
                  style={{ filter:"drop-shadow(0 4px 24px rgba(60,182,72,0.55)) brightness(1.15)" }}
                  onError={() => setImgError(true)} />
              </div>
            </>
          ) : !imgError ? (
            <Image src={item.photo} alt={label} fill className="object-cover" onError={() => setImgError(true)} sizes="33vw" />
          ) : (
            <div className="w-full h-full" style={{ background: item.fallback }} />
          )}
        </div>
        <div className="absolute inset-0 z-10" style={{ background:"linear-gradient(to top,rgba(0,0,0,0.84) 0%,rgba(0,0,0,0.28) 55%,rgba(0,0,0,0.04) 100%)" }} />
        {index < MARQUES.length - 1 && (
          <div className="absolute top-0 right-0 bottom-0 z-20 w-px" style={{ background:"rgba(255,255,255,0.12)" }} />
        )}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-5 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: item.accent }}>{sub}</p>
            <h3 className="text-white font-black text-2xl leading-none drop-shadow mb-1">{label}</h3>
            <p className="text-white/55 text-[12px]">{desc}</p>
          </div>
          <motion.div className="flex-shrink-0 rounded-full flex items-center justify-center shadow-lg"
            style={{ width:44, height:44, background:item.accent, boxShadow:`0 4px 16px ${item.accent}66` }}
            whileHover={{ scale:1.12 }} transition={{ type:"spring", stiffness:400, damping:18 }}>
            <motion.div animate={{ x:[0,5,0] }} transition={{ repeat:Infinity, duration:1.4, ease:"easeInOut", delay:index*0.3 }}>
              <ChevronRight />
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute inset-0 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow:`inset 0 0 0 3px ${item.accent}` }} />
      </Link>
    </motion.div>
  );
}

export default function HomeNavButtons() {
  const locale = useLocale();
  const t  = useTranslations("home");
  const ta = useTranslations("home.activities");
  const tb = useTranslations("home.brands");

  return (
    <section style={{ background:"#ffffff" }}>
      {/* Header Activités */}
      <div className="px-6 pt-12 pb-5 max-w-[1400px] mx-auto flex items-end justify-between">
        <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color:GREEN_LIME }}>{t("expertiseTag")}</p>
          <h2 className="text-3xl font-black" style={{ color:"#0d1a0d" }}>
            {t("activitiesTitle")} <span style={{ color:GREEN_DARK }}>{t("activitiesBold")}</span>
          </h2>
        </motion.div>
        <Link href={`/${locale}/activites`} className="hidden sm:flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color:GREEN_DARK }}>
          {t("viewAll")}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>

      {/* Grille activités */}
      <div className="flex" style={{ gap:0 }}>
        {ACTIVITES.map((item, i) => (
          <ActivityCard key={item.href} item={item} locale={locale} index={i} label={ta(item.key as any)} />
        ))}
      </div>

      {/* Header Marques */}
      <div id="nos-marques" className="px-6 pt-12 pb-4 max-w-[1400px] mx-auto flex items-end justify-between">
        <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color:GREEN_LIME }}>{t("brandsTag")}</p>
          <h2 className="text-3xl font-black" style={{ color:"#0d1a0d" }}>
            {t("brandsTitle")} <span style={{ color:GREEN_DARK }}>{t("brandsBold")}</span>
          </h2>
        </motion.div>
        <Link href={`/${locale}/marques`} className="hidden sm:flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color:GREEN_DARK }}>
          {t("allBrands")}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>

      {/* Grille marques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 pb-12" style={{ gap:0 }}>
        {MARQUES.map((m, i) => (
          <BrandCard key={m.href} item={m} locale={locale} index={i}
            label={m.key.charAt(0).toUpperCase() + m.key.slice(1)}
            sub={tb(m.subKey as any)} desc={tb(m.descKey as any)} />
        ))}
      </div>
    </section>
  );
}
