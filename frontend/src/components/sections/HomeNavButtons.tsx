"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useState, useRef } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const GREEN_DARK = "#0a6030";
const GREEN_MAIN = "#7dc040";

const ACTIVITES = [
  { href: "/activites/semences-et-plants",      label: "Semences & Plants",     image: "/images/activites/SEMENCES.webp" },
  { href: "/activites/irrigation",              label: "Irrigation",             image: "/images/activites/MATAR.webp" },
  { href: "/activites/fertilisation",           label: "Fertilisation",          image: "/images/activites/FERTVERT.webp" },
  { href: "/activites/machinisme-et-jardinage", label: "Machinisme & Jardinage", image: "/images/activites/JARDINAGE.webp" },
  { href: "/activites/pulverisation",           label: "Pulvérisation",          image: "/images/activites/PULVERT.webp" },
];
const MARQUES = [
  { href: "/marques/fertivert", label:"", image: "/logos/FERTIVERT LOGO.png" },
  { href: "/marques/pulvert",   label: "",   image: "/logos/PULVERT LOGO1.png" },
  { href: "/marques/matar",     label: "",     image: "/logos/MATAR LOGO1.png"},
];

function ArrowThin({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 7H26M26 7L20 1M26 7L20 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ActivityCard({ item, index }: { item: typeof ACTIVITES[0]; index: number }) {
  const [imgError, setImgError] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      /*
       * Responsive :
       * - Mobile (< 640px)  : pleine largeur, 2 par ligne à partir de 480px
       * - Tablette (640-1023px) : 2-3 colonnes selon la place
       * - Desktop (≥ 1024px) : 5 colonnes égales flex-1
       */
      className="w-full sm:w-[calc(50%-1px)] md:w-[calc(33.333%-2px)] lg:flex-1 lg:min-w-0"
      style={{ height: "clamp(180px,28vw,360px)" }}
    >
      <Link href={item.href} className="group relative block w-full h-full overflow-hidden cursor-pointer">
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform">
          {!imgError ? (
            <Image
              src={item.image} alt={item.label} fill
              className="object-cover object-center"
              sizes="(max-width:480px)100vw,(max-width:640px)50vw,(max-width:768px)50vw,(max-width:1024px)33vw,20vw"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-[#1a3a20]" />
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10 h-28 bg-gradient-to-t from-black/65 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 py-4 flex items-end justify-between">
          <span className="text-white font-bold leading-tight drop-shadow-sm text-sm lg:text-[clamp(12px,1.1vw,15px)]">
            {item.label}
          </span>
          <motion.div
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{
              width: 36, height: 36,
              background: "rgba(255,255,255,0.12)",
              border: "1.5px solid rgba(255,255,255,0.35)",
              backdropFilter: "blur(6px)",
            }}
            whileHover={{ scale: 1.12, background: GREEN_MAIN, borderColor: GREEN_MAIN }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            <ArrowThin className="w-5 h-[10px] text-white transition-transform duration-300 group-hover:translate-x-0.5" />
          </motion.div>
        </div>
        <div className="absolute inset-0 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `inset 0 0 0 3px ${GREEN_MAIN}` }} />
      </Link>
    </motion.div>
  );
}

function BrandCard({ item, index }: { item: typeof MARQUES[0]; index: number }) {
  const [imgErr,  setImgErr]  = useState(false);
  const [logoErr, setLogoErr] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay: 0.1 + index * 0.09, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      /*
       * Responsive :
       * - Mobile  : pleine largeur, hauteur réduite
       * - sm+ : 3 colonnes égales
       */
      className="w-full sm:flex-1 sm:min-w-0"
      style={{ height: "clamp(140px,18vw,200px)" }}
    >
      <Link href={item.href} className="group relative block w-full h-full overflow-hidden cursor-pointer">
        {/* Image de fond */}
        <div className="absolute inset-0">
          {!imgErr ? (
            <Image
              src={item.image} alt={item.label} fill
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 will-change-transform"
              sizes="(max-width:640px)100vw,33vw"
              onError={() => setImgErr(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-[#1a3a20] flex items-center justify-center">
              <span className="text-4xl font-black text-white/20"
                style={{ fontFamily: "var(--font-display)" }}>
                {item.label[0]}
              </span>
            </div>
          )}
        </div>

        {/* Overlay dégradé permanent (léger) + renforcé au hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent transition-opacity duration-300 group-hover:from-black/70" />

        {/* Label bas + flèche */}
        <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between
                        opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
                        transition-all duration-300">
          <span className="text-white text-sm font-bold drop-shadow">{item.label}</span>
          <div className="flex items-center gap-1.5 text-white">
            <span className="text-[11px] font-semibold tracking-wide">Voir</span>
            <ArrowThin className="w-6 h-[9px]" />
          </div>
        </div>

        {/* Outline vert au hover */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `inset 0 0 0 3px ${GREEN_MAIN}` }}
        />
      </Link>
    </motion.div>
  );
}

function SectionHeader({ eyebrow, title, accent, href, linkLabel }: {
  eyebrow: string; title: string; accent: string; href: string; linkLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-80px" });

  return (
    <div ref={ref} className="container-ev pt-12 pb-5 flex items-end justify-between">
      <div>
        <motion.p
          animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : -40 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ color: GREEN_MAIN, fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 6 }}
        >
          {eyebrow}
        </motion.p>
        <motion.h2
          animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : -48 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl sm:text-4xl md:text-[clamp(2rem,3.5vw,2.8rem)]"
          style={{ color: "#0d1f0d", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.1 }}
        >
          {title} <span style={{ color: GREEN_DARK }}>{accent}</span>
        </motion.h2>
        <div style={{ marginTop: 10, width: 48, height: 4, borderRadius: 4, overflow: "hidden", background: "#e8f5ee" }}>
          <motion.div
            animate={{ scaleX: inView ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: "100%", borderRadius: 4, background: `linear-gradient(90deg,${GREEN_MAIN},${GREEN_DARK})`, transformOrigin: "left" }}
          />
        </div>
      </div>
      <Link href={href} className="hidden sm:flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: GREEN_DARK }}>
        {linkLabel} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default function HomeNavButtons() {
  return (
    <section style={{ background: "#ffffff" }}>
      {/* ── Activités ── */}
      <SectionHeader eyebrow="Notre expertise" title="Nos activités" accent="agricoles" href="/activites" linkLabel="Voir tout" />

      {/* Grille responsive activités — pleine largeur intentionnelle (galerie visuelle) */}
      <div
        id="nos-activites"
        className="flex flex-wrap lg:flex-nowrap w-full"
        style={{ gap: 2 }}
      >
        {ACTIVITES.map((item, i) => (
          <ActivityCard key={item.href} item={item} index={i} />
        ))}
      </div>

      {/* Lien mobile "Voir tout" activités */}
      <div className="sm:hidden px-4 pt-4 pb-2">
        <Link href="/activites"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold border-2"
          style={{ color: GREEN_DARK, borderColor: GREEN_DARK }}>
          Voir toutes les activités <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ── Marques ── */}
      <div id="nos-marques">
        <SectionHeader eyebrow="Nos marques" title="Trois marques," accent="une expertise" href="/marques" linkLabel="Voir tout" />
      </div>

      {/* Grille responsive marques */}
      <div
        className="flex flex-col sm:flex-row pb-10 sm:pb-14 w-full"
        style={{ gap: 2 }}
      >
        {MARQUES.map((m, i) => (
          <BrandCard key={m.href} item={m} index={i} />
        ))}
      </div>

      {/* Lien mobile "Voir tout" marques */}
      <div className="sm:hidden px-4 pb-6">
        <Link href="/marques"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold border-2"
          style={{ color: GREEN_DARK, borderColor: GREEN_DARK }}>
          Voir toutes les marques <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}