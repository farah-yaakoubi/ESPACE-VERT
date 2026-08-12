"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Calendar,
  Compass,
  Handshake,
  Leaf,
  Lightbulb,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { AnimatedCount } from "@/components/qui-sommes-nous/AnimatedCount";
import AgenceSection from "@/components/qui-sommes-nous/AgenceSection";
import { SectionTitleLine } from "@/components/ui/SectionTitleIcon";
import type { IcoName } from "@/components/icons/AgriIcons";

const MISSION_IMAGE = "/images/notre-mission.webp";
const HISTORY_IMAGE = "/images/hero/semences-desktop.webp";

const BADGES = ["Semences", "Irrigation", "Fertilisation", "Principes", "Marques"];

const STATS = [
  { value: 1995, label: "Année de création",  icon: Calendar,   suffix: "" },
  { value: 100,  label: "Collaborateurs",      icon: Users,      suffix: "+" },
  { value: 5,    label: "Sociétés du groupe",  icon: Building2,  suffix: "" },
  { value: 30,   label: "Ans d'expérience",    icon: TrendingUp, suffix: "+" },
];

const PRINCIPLES = [
  { title: "Qualité & fiabilité",  text: "Des produits et services choisis pour leur performance et leur durabilité.", icon: ShieldCheck },
  { title: "Proximité",            text: "Une présence locale forte et un accompagnement terrain au quotidien.",        icon: Compass },
  { title: "Partenariats solides", text: "Des collaborations durables construites sur la confiance mutuelle.",          icon: Handshake },
  { title: "Innovation",           text: "Des solutions modernes adaptées aux enjeux agricoles d'aujourd'hui.",         icon: Lightbulb },
];

const HISTORY_STEPS = [
  { year: "1995",        title: "Fondation",          text: "Le groupe démarre autour des semences agricoles en Tunisie." },
  { year: "2000+",       title: "Expansion",          text: "Élargissement des gammes et développement de l'activité à l'échelle nationale." },
  { year: "2015",        title: "Diversification",    text: "Structuration des filiales spécialisées et lancement des marques propres." },
  { year: "Aujourd'hui", title: "Présence nationale", text: "Un groupe structuré, proche du terrain, reconnu et lisible." },
];

const SOCIETES = [
  { name: "",         image: "/logos/logo espace vert.png" },
  { name: "",           image: "/logos/FERTIVERT LOGO.png" },
  { name: "",              image: "/logosPartenaires/logo stajap.png" },
  { name: "", image: "/logosPartenaires/logo mendial irrigation.png" },
  { name: "",     image: "/logosPartenaires/agricole baddar.png" },
];

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({ label, light = false, icon }: { label: string; light?: boolean; icon?: IcoName }) {
  return (
    <div className="mb-6">
      <h2 className={`section-title text-[2rem] sm:text-[2.4rem] ${light ? "section-title--light" : ""}`}>
        {icon ? (
          <SectionTitleLine icon={icon} color={light ? "#9dce78" : "#5d8a45"} align="left">
            {label}
          </SectionTitleLine>
        ) : (
          label
        )}
      </h2>
      <div className={`mt-2.5 h-[3px] w-10 rounded-full ${light ? "bg-[#9dce78]" : "bg-[#5d8a45]"}`} />
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[#ddd5c4] bg-white p-7 shadow-[0_4px_24px_rgba(50,40,20,0.07)] sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

function LogoMarquee() {
  const items = [...SOCIETES, ...SOCIETES, ...SOCIETES];
  return (
    <>
      <style>{`
        @keyframes logoScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(calc(-100% / 3)); }
        }
        .logo-track { animation: logoScroll 32s linear infinite; }
        .logo-wrap:hover .logo-track { animation-play-state: paused; }
      `}</style>
      <div className="logo-wrap relative overflow-hidden py-3">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />
        <div className="logo-track flex w-max items-center gap-10">
          {items.map((s, i) => (
            <motion.div
              key={`${s.name}-${i}`}
              whileHover={{ scale: 1.08 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex-shrink-0 flex h-24 w-[200px] items-center justify-center"
            >
              <div className="h-full w-full rounded-2xl bg-white border-2 border-[#e8e2d8] flex flex-col items-center justify-center gap-2 px-5 py-3 shadow-[0_2px_12px_rgba(50,40,20,0.08)] hover:border-[#5d8a45] transition-colors duration-200">
                <Image
                  src={s.image}
                  alt={s.name}
                  width={160}
                  height={60}
                  className="h-14 w-auto max-w-full object-contain"
                />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8a7e72]">{s.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════ */
export default function QuiSommesNousPage() {
  return (
    <>
      <style>{`
        .qsn-root {
          background:
            radial-gradient(ellipse 80% 35% at 0% 15%, rgba(93,138,69,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 60% 40% at 100% 75%, rgba(93,138,69,0.08) 0%, transparent 55%),
            #f0ebe0;
          min-height: 100vh;
        }
        @media (min-width: 1280px) {
          .qsn-root {
            background:
              radial-gradient(ellipse 80% 35% at 0% 15%, rgba(93,138,69,0.12) 0%, transparent 55%),
              radial-gradient(ellipse 60% 40% at 100% 75%, rgba(93,138,69,0.08) 0%, transparent 55%),
              linear-gradient(90deg,
                #5d8245 0%, #5d8245 3%,
                #f0ebe0 3%, #f0ebe0 97%,
                #5d8245 97%, #5d8245 100%
              );
          }
        }
      `}</style>

      <div className="qsn-root">
        <div className="container-ev py-10 sm:py-16">

          {/* ══ HERO : titre seul, grand, aéré ══ */}
          <Reveal>
            <div className="mb-3">
              <p
                className="mb-3 text-[11px] font-black uppercase tracking-[0.25em] text-[#5d8a45]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Le groupe Espace Vert
              </p>
              <h1
                className="text-[clamp(4rem,9vw,7.5rem)] font-black leading-[0.85] tracking-[-0.06em] text-[#161616]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Qui sommes{" "}
                <span className="text-[#5d8a45]">nous?</span>
              </h1>
            </div>
          </Reveal>

          {/* ══ BANDEAU INTRO : sous-titre dans son propre espace ══ */}
          <Reveal delay={0.08}>
            <div className="mb-10 mt-6 rounded-2xl border border-[#c8dbb8] bg-[#eef6e7] px-7 py-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[1.15rem] leading-8 font-medium text-[#2a4a1e]">
                Un groupe tunisien qui réunit <span className="font-black text-[#5d8a45]">expertise terrain</span>,{" "}
                <span className="font-black text-[#5d8a45]">réseau d'agences</span> et{" "}
                <span className="font-black text-[#5d8a45]">solutions agricoles complètes</span>.
              </p>
              <div className="flex-shrink-0 flex items-center gap-2 mt-2 sm:mt-0">
                <div className="h-2 w-2 rounded-full bg-[#5d8a45]" />
                <span className="text-[0.85rem] font-semibold text-[#4a7236]">Depuis 1995 · Tunisie</span>
              </div>
            </div>
          </Reveal>

          {/* ── LIGNE 1 : Identité + Grande image ── */}
          <div className="grid gap-6 mb-6 md:grid-cols-[1fr_1.5fr]">

            <Reveal delay={0.03}>
              <Card className="h-full flex flex-col justify-between">
                <div className="flex items-start gap-5 mb-6">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border-2 border-[#c8dbb8] bg-[#eef6e7] text-[#5d8a45]"
                  >
                    <Leaf size={26} strokeWidth={1.8} />
                  </motion.div>
                  <div>
                    <p
                      className="text-[11px] font-black uppercase tracking-[0.18em] text-[#5d8a45] mb-2"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Groupe Espace Vert
                    </p>
                    <p className="text-[1.05rem] leading-7 text-[#4d463e]">
                      Fondé en 1995, nous accompagnons les agriculteurs tunisiens
                      avec des solutions intégrées — semences, irrigation, fertilisation.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {BADGES.map((b) => (
                    <span
                      key={b}
                      className="rounded-full border-2 border-[#c8dbb8] bg-[#eef6e7] px-4 py-1.5 text-[0.8rem] font-bold text-[#3a6228] tracking-wide"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </Card>
            </Reveal>

            <Reveal delay={0.05}>
              <motion.div
                initial={{ opacity: 0, scale: 1.04 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-2xl border-2 border-[#c8d8b4] shadow-[0_8px_32px_rgba(50,40,20,0.12)]"
                style={{ minHeight: 240 }}
              >
                <Image
                  src={HISTORY_IMAGE}
                  alt="Groupe Espace Vert"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 55vw"
                />
                {/* Overlay vert dégradé */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f3a1e]/70 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">Fondé en</p>
                    <p
                      className="text-[3rem] font-black text-white leading-none"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      1995
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#5d8a45]/80 px-4 py-2 backdrop-blur-sm">
                    <p className="text-[0.8rem] font-bold text-white">Groupe tunisien</p>
                    <p className="text-[0.72rem] text-white/80">Agriculture &amp; Solutions</p>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          </div>

          {/* ── LIGNE 2 : Mission + Histoire ── */}
          <div className="grid gap-6 mb-6 md:grid-cols-[1fr_1.5fr]">

            {/* Mission — fond vert foncé */}
            <Reveal delay={0.04}>
              <div className="h-full flex flex-col gap-0 rounded-2xl overflow-hidden border-2 border-[#1b5430] shadow-[0_4px_24px_rgba(15,58,30,0.15)]">
                {/* Header vert */}
                <div className="bg-[#1b5430] px-7 pt-7 pb-5">
                  <SectionTitle label="Notre mission" light icon="Sprout" />
                  <p className="text-[1.05rem] leading-8 text-white/85">
                    Accompagner les projets agricoles et faciliter leur performance
                    avec conseil, proximité et solutions complètes.
                  </p>
                </div>
                {/* Image */}
                <div className="relative flex-1 min-h-[180px]">
                  <Image src={MISSION_IMAGE} alt="Notre mission" fill className="object-cover" sizes="340px" />
                  <div className="absolute inset-0 bg-[#1b5430]/20" />
                </div>
              </div>
            </Reveal>

            {/* Histoire */}
            <Reveal delay={0.06}>
              <Card className="h-full">
                <SectionTitle label="Notre histoire" icon="Cal" />
                <div className="grid gap-5 sm:grid-cols-[1fr_1fr]">

                  {/* Timeline */}
                  <div className="space-y-0">
                    {HISTORY_STEPS.map((step, i) => (
                      <motion.div
                        key={step.year}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: i * 0.07 }}
                        className="flex gap-4"
                      >
                        <div className="flex flex-col items-center">
                          <div className="mt-[7px] h-3 w-3 flex-shrink-0 rounded-full bg-[#5d8a45] ring-[3px] ring-[#c8dbb8]" />
                          {i < HISTORY_STEPS.length - 1 && (
                            <div className="w-[2px] flex-1 bg-[#c8dbb8]" style={{ minHeight: 36 }} />
                          )}
                        </div>
                        <div className="pb-5">
                          <span
                            className="text-[11px] font-black uppercase tracking-widest text-[#5d8a45]"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {step.year}
                          </span>
                          <p className="text-[1.05rem] font-bold text-[#1a1a1a]">{step.title}</p>
                          <p className="text-[0.88rem] leading-6 text-[#726759] mt-0.5">{step.text}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Photos 2×2 */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {[HISTORY_IMAGE, MISSION_IMAGE, MISSION_IMAGE, HISTORY_IMAGE].map((src, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                        className="relative overflow-hidden rounded-xl border-2 border-[#d8cfbf]"
                        style={{ aspectRatio: "1/1" }}
                      >
                        <Image src={src} alt="" fill className="object-cover" sizes="140px" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
            </Reveal>
          </div>

          {/* ── LIGNE 3 : Chiffres + Principes ── */}
          <div className="grid gap-6 mb-6 md:grid-cols-2">

            {/* Chiffres — fond vert clair avec accent */}
            <Reveal delay={0.04}>
              <div className="rounded-2xl border-2 border-[#5d8a45] bg-[#f5faf0] p-7 sm:p-8 shadow-[0_4px_24px_rgba(93,138,69,0.12)]">
                <SectionTitle label="En chiffres" icon="GrassTuft" />
                <div className="grid grid-cols-2 gap-4">
                  {STATS.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.38, delay: i * 0.05 }}
                        whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(93,138,69,0.18)" }}
                        className="rounded-xl border-2 border-[#c8dbb8] bg-white p-4 transition-shadow"
                      >
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#5d8a45] text-white">
                          <Icon size={18} />
                        </div>
                        <p
                          className="text-[2.2rem] font-black leading-none tracking-[-0.04em] text-[#1b5430]"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          <AnimatedCount value={s.value} suffix={s.suffix} />
                        </p>
                        <p className="mt-1.5 text-[0.85rem] font-medium text-[#5a6e52]">{s.label}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            {/* Principes */}
            <Reveal delay={0.06}>
              <Card>
                <SectionTitle label="Nos principes" icon="Clover" />
                <div className="grid grid-cols-2 gap-4">
                  {PRINCIPLES.map((item, i) => {
                    const Icon = item.icon;
                    const colors = [
                      { bg: "bg-[#eef6e7]", icon: "text-[#5d8a45]", border: "border-[#c8dbb8]", title: "text-[#1b5430]" },
                      { bg: "bg-[#f0f7eb]", icon: "text-[#3a6228]", border: "border-[#b8d4a4]", title: "text-[#2a4a1e]" },
                      { bg: "bg-[#f5faf0]", icon: "text-[#5d8a45]", border: "border-[#c8dbb8]", title: "text-[#1b5430]" },
                      { bg: "bg-[#eef6e7]", icon: "text-[#3a6228]", border: "border-[#b8d4a4]", title: "text-[#2a4a1e]" },
                    ];
                    const c = colors[i];
                    return (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.38, delay: i * 0.05 }}
                        whileHover={{ y: -4 }}
                        className={`rounded-xl border-2 ${c.border} ${c.bg} p-5 text-center`}
                      >
                        <div className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-white ${c.icon} shadow-sm`}>
                          <Icon size={20} />
                        </div>
                        <p className={`text-[0.92rem] font-bold ${c.title} leading-tight`}>{item.title}</p>
                        <p className="mt-1.5 text-[0.8rem] leading-6 text-[#706456]">{item.text}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </Reveal>
          </div>

          {/* ── LIGNE 4 : Sociétés ── */}
          <Reveal delay={0.05}>
            <Card className="mb-6 border-2 border-[#ddd5c4]">
              <SectionTitle label="Nos sociétés" icon="Barn" />
              <LogoMarquee />
            </Card>
          </Reveal>

          {/* ── LIGNE 5 : CTA ── */}
          <Reveal delay={0.06}>
            <div className="relative mb-6 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0f3a1e_0%,#1b5430_55%,#1f6035_100%)] p-8 text-white shadow-[0_14px_40px_rgba(15,58,30,0.30)] sm:p-10">
              {/* Motif décoratif */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(120,180,90,0.22),transparent_50%)]" />
              <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full border-[3px] border-white/5" />
              <div className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 rounded-full border-[3px] border-white/8" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p
                    className="text-[11px] font-black uppercase tracking-[0.25em] text-[#9dce78] mb-3"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Partenaire de confiance
                  </p>
                  <h2
                    className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-black leading-tight tracking-[-0.03em] text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    <SectionTitleLine icon="Leaf" color="#9dce78" align="left">Cultivons la performance ensemble</SectionTitleLine>
                  </h2>
                  <p className="mt-3 text-[1.05rem] leading-8 text-white/75">
                    Ensemble, préparons l'agriculture de demain.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/activites"
                    className="inline-flex items-center gap-2 rounded-full bg-[#5d8a45] px-7 py-3.5 text-[0.95rem] font-bold text-white transition hover:bg-[#6e9858] shadow-[0_4px_14px_rgba(93,138,69,0.5)]"
                  >
                    Nos activités <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center rounded-full border-2 border-white/30 px-7 py-3.5 text-[0.95rem] font-semibold text-white transition hover:bg-white/10"
                  >
                    Nous contacter
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── AGENCES ── */}
          <Reveal delay={0.08}>
            <AgenceSection />
          </Reveal>

        </div>
      </div>
    </>
  );
}