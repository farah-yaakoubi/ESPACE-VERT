"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Building2,
  Handshake,
  Leaf,
  ShieldCheck,
  Users2,
} from "lucide-react";
import { HomeSectionHeading } from "@/components/sections/HomeSectionHeading";

// ─── Palette (identique au reste du site : lin / forêt / sauge / blé) ────
const INK = "#1b2118";
const FOREST = "#1f4d34";
const SAGE = "#7c8f6a";
const WHEAT = "#c9a24a";
const LINEN = "#f6f4ee";
const LINE = "#e1ddd2";
const BODY = "#5b655a";

const EASE_SMOOTH = [0.25, 0.46, 0.45, 0.94] as const;

/**
 * Affiche le logo tel qu'il est réellement dans son fichier source, sans
 * altération de couleur. Les logos "Groupe" (Espace Vert, Stajap,
 * Baddar Agricole) sont déjà détourés (fond transparent dans le PNG).
 * Fertivert, lui, a un fond vert plein qui fait partie intégrante de son
 * identité visuelle — il ne doit donc jamais être traité comme un "fond à
 * retirer", sous peine de casser le logo (c'est ce qui causait le rendu
 * transparent/incomplet observé auparavant).
 */
function TransparentLogo({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />;
}

/** Les 5 sociétés du groupe, présentées en ordre chronologique */
const SOCIETES = [
  {
    name: "Espace Vert",
    image: "/logos/logo espace vert.png",
    description: "Spécialisée dans les solutions agricoles et l'aménagement paysager depuis les origines du groupe.",
    year: "1995",
    label: "Fondation",
  },
    {
    name: "Baddar Agricole",
    image: "/logosPartenaires/agricole baddar.png",
    description: "Fournisseur de semences et d'intrants agricoles de qualité pour les producteurs tunisiens.",
    year: "1999",
    compact: true,
  },
   {
    name: "Stajap",
    image: "/logosPartenaires/logo stajap.png",
    description: "Spécialiste des équipements et solutions pour l'agriculture professionnelle.",
    year: "2000",
  },
  {
    name: "Fertivert",
    image: "/logos/LOGO FERTVERT copy.png",
    description: "Dédiée à la fertilisation et à la nutrition des sols pour des cultures plus saines et productives.",
    year: "2001",
    compact: true,
  },
  {
    name: "Mondiale Irrigation",
    image: "/logosPartenaires/logo mendial irrigation.png",
    description: "Spécialiste des solutions d'irrigation pour l'agriculture et les espaces verts.",
    year: "2003",
    compact: true,
  }
];

/** Marques partenaires — chacune avec une icône et une teinte d'accent */
const PARTENAIRES = [
  { name: "Caussade Semences", image: "/logosPartenaires1/LOGO CORASEEDS.png" },
  { name: "elors plants", image: "/logosPartenaires1/elorn plants.png" },
  { name: "griffaton", image: "/logosPartenaires1/griffaton vert.png" },
  { name: "lidea", image: "/logosPartenaires1/LIDEA.png" },
  { name: "SEMINART", image: "/logosPartenaires1/SEMINART.png" },
  { name: "sem", image: "/logosPartenaires1/SEM.png" },
  { name: "services plus", image: "/logosPartenaires1/service plus.png" },
  { name: "southern", image: "/logosPartenaires1/SOUTHERN.png" },
  { name: "TERA SEEDS", image: "/logosPartenaires1/TERA SEEDS.png" },
  { name: "nexSEEDS", image: "/logosPartenaires1/logo nexeeds.png" },
  { name: "TOP GREEN", image: "/logosPartenaires1/top green.png" },
  { name: "turfline", image: "/logosPartenaires1/turfline.png" },
  { name: "etesia", image: "/logosPartenaires1/ETISIA LOGO.png" },
  { name: "AGRICUT", image: "/logosPartenaires1/LOGO AGRICUT.png" },
  { name: "staub", image: "/logosPartenaires1/LOGO STAUB.png" },
  { name: "WEIBANG", image: "/logosPartenaires1/LOGO WEIBANG.png" },
  { name: "WIEDNAMANN", image: "/logosPartenaires1/wiedenmann.png" },
  { name: "WOLF", image: "/logosPartenaires1/WOLF.png" },
  { name: "FISTA", image: "/logosPartenaires1/FISTA.png" },
  { name: "IDROLAND", image: "/logosPartenaires1/IDROLAND.png" },
  { name: "ZETA", image: "/logosPartenaires1/zeta-logo.png" },
];

const CONFIANCE = [
  { icon: ShieldCheck, title: "Qualité garantie", text: "Des partenaires de confiance" },
  { icon: Leaf, title: "Engagement durable", text: "Pour un avenir responsable" },
  { icon: Users2, title: "Collaboration solide", text: "Ensemble pour réussir" },
];

// ─── Titre de section — même format que "Nos activités" / "Nos marques" ──
function LuxuryTitle({
  icon: Icon,
  label,
  dark = false,
  tight = false,
}: {
  icon?: typeof Building2;
  label: string;
  dark?: boolean;
  tight?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 30 }}
      transition={{ duration: 0.8, ease: EASE_SMOOTH }}
      className={`flex flex-col items-center gap-3 text-center ${tight ? "pb-3" : "pb-5 sm:pb-6"}`}
    >
      <h2
        className="overflow-y-hidden max-w-full text-[clamp(1.5rem,5vw,2.75rem)] font-bold leading-[1.15] tracking-tight"
        style={{ fontFamily: "var(--font-body), Cairo, sans-serif", color: dark ? "#ffffff" : INK }}
      >
        <motion.span
          className="inline-flex items-center gap-2 sm:gap-4"
          initial={{ y: "120%" }}
          animate={{ y: inView ? "0%" : "120%" }}
          transition={{ duration: 1, ease: EASE_SMOOTH, delay: 0.1 }}
        >
          {Icon && (
            <motion.span
              animate={{ rotate: inView ? [0, 20, 0] : 0 }}
              transition={{ duration: 1.2, ease: EASE_SMOOTH, delay: 0.3 }}
            >
              <Icon
                className="h-7 w-7 sm:h-9 sm:w-9"
                strokeWidth={1.2}
                style={{ color: dark ? "#d8c98a" : FOREST }}
              />
            </motion.span>
          )}
          {label}
        </motion.span>
      </h2>
    </motion.div>
  );
}

// ─── Slide partenaire — juste le logo, posé simplement, sans carte ──────
function PartnerSlide({ item }: { item: (typeof PARTENAIRES)[number] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="mx-6 flex h-32 w-[240px] shrink-0 snap-start items-center justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="relative h-24 w-full"
        style={{ willChange: "transform" }}
        animate={{ scale: hovered ? 1.1 : 1, y: hovered ? -3 : 0 }}
        transition={{ duration: 0.4, ease: EASE_SMOOTH }}
      >
        <Image src={item.image} alt={item.name} fill sizes="220px" className="object-contain" />
      </motion.div>
    </div>
  );
}

// ─── Filigrane panoramique — identique à la section "Nos activités" ─────
function ActivitesWatermark() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.8, ease: EASE_SMOOTH }}
        viewport={{ once: true }}
        style={{
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 10%, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 10%, rgba(0,0,0,1) 90%, rgba(0,0,0,0) 100%)",
        }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1.08, 1.16, 1.08] }}
          transition={{ duration: 22, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
        >
          <Image
            src="/images/activites/watermark-panorama.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            style={{ filter: "saturate(0.9) contrast(0.95)", opacity: 0.55 }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Feuilles qui dérivent dans le vent, au-dessus de la photo ───────────
function DriftingLeaves() {
  const leaves = [
    { top: "6%", left: "88%", size: 22, delay: 0, dur: 9 },
    { top: "16%", left: "94%", size: 16, delay: 1.2, dur: 11 },
    { top: "2%", left: "78%", size: 14, delay: 2.4, dur: 8 },
    { top: "26%", left: "6%", size: 18, delay: 0.6, dur: 10 },
    { top: "70%", left: "4%", size: 14, delay: 1.8, dur: 9.5 },
    { top: "88%", left: "92%", size: 20, delay: 0.9, dur: 10.5 },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
      {leaves.map((leaf, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: leaf.top, left: leaf.left }}
          animate={{ x: [0, 26, -10, 0], y: [0, -16, 10, 0], rotate: [0, 40, -20, 0] }}
          transition={{ duration: leaf.dur, delay: leaf.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <Leaf
            style={{ width: leaf.size, height: leaf.size, color: WHEAT, opacity: 0.8 }}
            strokeWidth={1.3}
          />
        </motion.div>
      ))}
    </div>
  );
}

const SPOTLIGHT_HOLD = 2.6;

// ─── Timeline chronologique horizontale des sociétés du groupe ──────────
function SocietesTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [spotlight, setSpotlight] = useState(0);
  const [entryDone, setEntryDone] = useState(false);

  useEffect(() => {
    if (!inView) return;
    // Laisse d'abord voir toutes les sociétés ensemble, puis lance le spotlight
    const startDelay = 1.6;
    const startTimer = setTimeout(() => setEntryDone(true), startDelay * 1000);
    return () => clearTimeout(startTimer);
  }, [inView]);

  useEffect(() => {
    if (!entryDone) return;
    const id = setInterval(() => {
      setSpotlight((i) => (i + 1) % SOCIETES.length);
    }, SPOTLIGHT_HOLD * 1000);
    return () => clearInterval(id);
  }, [entryDone]);

  // Sur les écrans qui n'affichent pas les 5 sociétés d'un coup, le
  // spotlight fait aussi défiler la piste — ça révèle naturellement le
  // contenu caché, sans dépendre d'un geste de l'utilisateur.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !entryDone) return;
    const card = el.scrollWidth / SOCIETES.length;
    const target = card * spotlight - (el.clientWidth - card) / 2;
    el.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [spotlight, entryDone]);

  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.scrollWidth / SOCIETES.length), behavior: "smooth" });
  };

  return (
    <div ref={ref} className="relative mt-0">
      {/* Flèches de défilement manuel — visibles uniquement quand le contenu ne tient pas d'un coup */}
      <button
        type="button"
        aria-label="Société précédente"
        onClick={() => scrollByCard(-1)}
        className="absolute -left-1 top-[100px] z-20 hidden h-9 w-9 items-center justify-center rounded-full border bg-white/90 shadow-sm backdrop-blur-sm transition-opacity max-[919px]:flex sm:top-[128px]"
        style={{ borderColor: LINE, color: FOREST }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
      </button>
      <button
        type="button"
        aria-label="Société suivante"
        onClick={() => scrollByCard(1)}
        className="absolute -right-1 top-[100px] z-20 hidden h-9 w-9 items-center justify-center rounded-full border bg-white/90 shadow-sm backdrop-blur-sm transition-opacity max-[919px]:flex sm:top-[128px]"
        style={{ borderColor: LINE, color: FOREST }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
      </button>

      {/* Fondus de bord — signalent qu'il y a du contenu à faire défiler */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 max-[919px]:block hidden" style={{ background: `linear-gradient(90deg, ${LINEN}, transparent)` }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 max-[919px]:block hidden" style={{ background: `linear-gradient(270deg, ${LINEN}, transparent)` }} />

      <div ref={scrollRef} className="-mx-4 overflow-x-auto px-4 pb-4 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="relative grid grid-cols-5 gap-4 sm:gap-6" style={{ minWidth: 760 }}>
          {/* Ligne horizontale reliant les sociétés */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0.35 }}
            animate={{ scaleX: inView ? 1 : 0, opacity: inView ? 1 : 0.35 }}
            transition={{ duration: 2.2, ease: EASE_SMOOTH }}
            className="absolute left-0 right-0 top-[146px] h-px origin-left sm:top-[182px]"
            style={{ background: `linear-gradient(90deg, ${WHEAT} 0%, ${FOREST} 100%)` }}
          />

          {/* Faisceau de spotlight qui glisse d'une société à l'autre — effet "lumière de scène" */}
          {entryDone && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -top-10 z-0"
              style={{
                width: "calc(100% / 5)",
                height: 260,
                clipPath: "polygon(42% 0%, 58% 0%, 88% 100%, 12% 100%)",
                background: `linear-gradient(180deg, ${WHEAT}3d 0%, ${WHEAT}12 55%, ${WHEAT}00 100%)`,
              }}
              animate={{ left: `calc(${spotlight} * (100% / 5))` }}
              transition={{ duration: 0.9, ease: EASE_SMOOTH }}
            />
          )}

          {SOCIETES.map((s, i) => {
            const isSpot = entryDone ? i === spotlight : true;
            return (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 30, scale: 0.94 }}
                animate={{
                  opacity: inView ? 1 : 0,
                  y: inView ? 0 : 30,
                  scale: inView ? (entryDone && isSpot ? 1.07 : 1) : 0.94,
                }}
                transition={{
                  opacity: { duration: 0.7, ease: EASE_SMOOTH },
                  scale: { duration: 0.7, ease: EASE_SMOOTH },
                  y: { duration: 0.8, ease: EASE_SMOOTH },
                }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                {/* Même emplacement et mêmes dimensions pour les cinq logos. */}
                <div className="relative h-32 w-full sm:h-40">
                  <TransparentLogo src={s.image} alt={s.name} className="h-full w-full object-contain" />
                </div>

                {/* Point sur la ligne */}
                <span
                  className="relative z-10 my-3 block shrink-0 rounded-full border-2 bg-white transition-all duration-500 sm:my-4"
                  style={{
                    height: entryDone && isSpot ? 16 : 12,
                    width: entryDone && isSpot ? 16 : 12,
                    borderColor: isSpot ? WHEAT : FOREST,
                    boxShadow: entryDone && isSpot ? `0 0 0 6px ${WHEAT}30` : "none",
                  }}
                />

                {/* Contenu — carte pleine, opaque, lisible en toutes circonstances */}
                <div
                  className="relative h-[320px] w-full overflow-hidden rounded-[1.25rem] px-4 pb-5 pt-4 transition-all duration-700 sm:h-[340px] sm:px-5"
                  style={{
                    background: "#fdfbf6",
                    boxShadow:
                      entryDone && isSpot
                        ? `0 20px 46px rgba(27,33,24,0.24), 0 0 0 1.5px ${WHEAT}88`
                        : "0 8px 22px rgba(27,33,24,0.10)",
                  }}
                >
                  {/* Barre d'accent en haut de carte */}
                  <span
                    className="absolute inset-x-0 top-0 h-[3px] transition-opacity duration-700"
                    style={{
                      background: `linear-gradient(90deg, ${WHEAT}, ${FOREST})`,
                      opacity: entryDone && isSpot ? 1 : 0.35,
                    }}
                  />

                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className="inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]"
                      style={{ color: i === 0 ? "#8a6d1f" : FOREST, borderColor: i === 0 ? `${WHEAT}55` : `${FOREST}33` }}
                    >
                      {s.year}
                    </span>
                    <span className="min-h-[15px] text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: SAGE }}>
                      {s.label ?? " "}
                    </span>
                    <span
                      className="inline-flex min-h-[22px] items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
                      style={i === 0 ? { background: FOREST, color: "#fff" } : { visibility: "hidden" }}
                      aria-hidden={i !== 0}
                    >
                      Société mère
                    </span>

                    <h3
                      className="mt-1.5 min-h-[2.5rem] text-lg font-bold leading-tight sm:text-xl"
                      style={{ color: INK, fontFamily: "var(--font-body), Cairo, sans-serif" }}
                    >
                      {s.name}
                    </h3>

                    <span className="h-px w-8" style={{ background: `${FOREST}30` }} />

                    <p className="max-w-[200px] text-[15px] font-medium leading-relaxed" style={{ color: "#405447" }}>
                      {s.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LogosWave() {
  return (
    <svg
      aria-hidden
      className="mx-auto -mt-1 h-14 w-full max-w-4xl sm:h-20"
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
    >
      <line x1="0" y1="60" x2="1200" y2="60" stroke={FOREST} strokeWidth="4" opacity="0.5" />
    </svg>
  );
}

// ─── Défilement continu et fluide (marquee), pause au survol ────────────
function PartenairesCarousel() {
  const items = [...PARTENAIRES, ...PARTENAIRES, ...PARTENAIRES];
  return (
    <div className="partner-wrap relative overflow-hidden py-4">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24"
        style={{ background: `linear-gradient(90deg, ${LINEN}, transparent)` }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24"
        style={{ background: `linear-gradient(270deg, ${LINEN}, transparent)` }}
      />
      <div className="partner-track flex w-max items-center">
        {items.map((p, i) => (
          <PartnerSlide key={`${p.name}-${i}`} item={p} />
        ))}
      </div>
    </div>
  );
}

// ─── Badges de confiance ──────────────────────────────────────────────────
function TrustBadges() {
  return (
    <div
      className="mx-auto mt-14 flex max-w-3xl flex-col items-center gap-8 rounded-[2rem] px-8 py-8 sm:flex-row sm:justify-between sm:gap-4"
      style={{ background: "rgba(31,77,52,0.05)" }}
    >
      {CONFIANCE.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.title} className="flex items-center gap-4 text-left">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border"
              style={{ borderColor: FOREST }}
            >
              <Icon className="h-4.5 w-4.5" strokeWidth={1.5} style={{ color: FOREST }} />
            </div>
            <div>
              <p className="text-base font-semibold" style={{ color: INK }}>
                {c.title}
              </p>
              <p className="text-sm font-normal" style={{ color: BODY }}>
                {c.text}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Décor de coin — bouquet de feuilles vivant (balancement continu) ────
function CornerLeaves({ corner }: { corner: "top-left" | "bottom-right" }) {
  const flip = corner === "bottom-right";
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute z-0 h-40 w-40 sm:h-56 sm:w-56 ${
        corner === "top-left" ? "-left-6 -top-6" : "-right-6 -bottom-6"
      }`}
      style={{ transform: flip ? "rotate(180deg)" : undefined }}
    >
      {[
        { s: 68, t: 2, l: 4, r: -18, o: 0.85, dur: 5.5 },
        { s: 50, t: 22, l: 26, r: 12, o: 0.7, dur: 6.5 },
        { s: 38, t: 44, l: 8, r: -32, o: 0.6, dur: 4.8 },
        { s: 42, t: 8, l: 46, r: 30, o: 0.55, dur: 7 },
      ].map((leaf, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: leaf.t, left: leaf.l }}
          animate={{ rotate: [leaf.r - 6, leaf.r + 6, leaf.r - 6], y: [0, -4, 0] }}
          transition={{ duration: leaf.dur, repeat: Infinity, ease: "easeInOut" }}
        >
          <Leaf style={{ width: leaf.s, height: leaf.s, color: FOREST, opacity: leaf.o }} strokeWidth={1} />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Vagues de bas de section, façon référence ────────────────────────────
function BottomWaves() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-24 w-full sm:h-32"
      viewBox="0 0 1440 200"
      preserveAspectRatio="none"
    >
      <path d="M0,120 C280,40 520,180 820,90 C1000,40 1200,110 1440,60 L1440,200 L0,200 Z" fill={WHEAT} opacity="0.08" />
      <path d="M0,150 C260,90 560,190 900,110 C1100,70 1260,140 1440,100 L1440,200 L0,200 Z" fill={FOREST} opacity="0.95" />
    </svg>
  );
}

export default function GroupeEtPartenaires() {
  const partnersRef = useRef<HTMLDivElement>(null);
  const partnersInView = useInView(partnersRef, { once: true, margin: "-80px" });
  const societiesRef = useRef<HTMLDivElement>(null);
  const societiesInView = useInView(societiesRef, { once: true, margin: "-80px" });

  return (
    <>
      <style>{`
        @keyframes partnerScroll {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(calc(-100% / 3), 0, 0); }
        }
        .partner-track {
          animation: partnerScroll 34s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
        }
        .partner-wrap:hover .partner-track { animation-play-state: paused; }
      `}</style>

      {/* ── Marques partenaires — carrousel clair, logos sans cadre ── */}
      <section className="relative overflow-hidden py-20 sm:py-24" style={{ background: LINEN }}>
        <CornerLeaves corner="top-left" />
        <CornerLeaves corner="bottom-right" />
        <BottomWaves />

        <div className="container-ev relative z-10" ref={partnersRef}>
          <div className="mb-10">
            <HomeSectionHeading
              eyebrow=""
              title="Des partenaires"
              highlight="de confiance"
              subtitle="Ils nous accompagnent au quotidien, sur le terrain comme dans nos ateliers."
              icon={Handshake}
              inView={partnersInView}
              align="center"
            />
          </div>

          <PartenairesCarousel />
          <LogosWave />
          <TrustBadges />
        </div>
      </section>

      {/* ── Nos sociétés — même fond que "Nos activités", logos bien lisibles ── */}
      <section className="relative overflow-hidden py-20 sm:py-24" style={{ background: LINEN }}>
        <ActivitesWatermark />
        <DriftingLeaves />

        <div className="container-ev relative z-10" ref={societiesRef}>
          <div className="mb-8">
            <HomeSectionHeading
              eyebrow=""
              title="Un groupe,"
              highlight="plusieurs expertises"
              icon={Building2}
              inView={societiesInView}
              align="center"
            />
          </div>
          <SocietesTimeline />
        </div>
      </section>
    </>
  );
}
