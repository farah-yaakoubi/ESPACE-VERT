"use client";

import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Building2,
  Handshake,
  Leaf,
  ShieldCheck,
  Users2,
} from "lucide-react";

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
 * altération de couleur. Les logos "Groupe" (Espace Vert, Mondiale Irrigation,
 * Stajap, Baddar Agricole) sont déjà détourés (fond transparent dans le PNG).
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

/** Les 5 sociétés du groupe, disposées en alvéoles autour du hub central */
const SOCIETES = [
  {
    name: "Espace Vert",
    image: "/logos/logo espace vert.png",
    description: "Spécialisée dans les solutions agricoles et l'aménagement paysager depuis les origines du groupe.",
  },
  {
    name: "Mondiale Irrigation",
    image: "/logosPartenaires/logo mendial irrigation.png",
    description: "Expert en systèmes d'irrigation pour une gestion optimale de l'eau au champ.",
  },
  {
    name: "Fertivert",
    image: "/logos/LOGO FERTVERT copy.png",
    description: "Dédiée à la fertilisation et à la nutrition des sols pour des cultures plus saines et productives.",
  },
  {
    name: "Stajap",
    image: "/logosPartenaires/logo stajap.png",
    description: "Spécialiste des équipements et solutions pour l'agriculture professionnelle.",
  },
  {
    name: "Baddar Agricole",
    image: "/logosPartenaires/agricole baddar.png",
    description: "Fournisseur de semences et d'intrants agricoles de qualité pour les producteurs tunisiens.",
  },
];

/**
 * Position de chaque alvéole (en %) : Espace Vert au centre (société mère),
 * les 4 autres autour d'elle en croix.
 * Valeurs 8/92 (au lieu de 13/87) pour laisser plus d'air entre les alvéoles
 * et éviter tout chevauchement visuel avec le hub central.
 */
const HIVE_LAYOUT = [
  { x: 50, y: 50 }, // centre            → Espace Vert
  { x: 50, y: 8 },  // haut              → Mondiale Irrigation
  { x: 92, y: 50 }, // droite            → Fertivert
  { x: 50, y: 92 }, // bas               → Stajap
  { x: 8, y: 50 },  // gauche            → Baddar Agricole
];

/** Marques partenaires — chacune avec une icône et une teinte d'accent */
const PARTENAIRES = [
  { name: "Caussade Semences", image: "/logosPartenaires1/LOGO CORASEEDS.png" },
  { name: "elors plants", image: "/logosPartenaires1/elorn plants.png" },
  { name: "griffaton", image: "/logosPartenaires1/griffaton vert.png" },
  { name: "lidea", image: "/logosPartenaires1/LIDEA.png" },
  { name: "PANAM", image: "/logosPartenaires1/panam.png" },
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
  { name: "REVULIS", image: "/logosPartenaires1/REVILIS.png" },
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
      className={`flex flex-col items-center gap-3 text-center ${tight ? "pb-4" : "pb-12 sm:pb-14"}`}
    >
      <h2
        className="overflow-hidden text-[clamp(2.2rem,5.5vw,4rem)] font-light leading-[1] tracking-[-0.015em]"
        style={{ fontFamily: "var(--font-display)", color: dark ? "#ffffff" : INK }}
      >
        <motion.span
          className="inline-flex items-center gap-4"
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
      className="mx-5 flex h-24 w-[200px] shrink-0 snap-start items-center justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="relative h-14 w-full"
        style={{ willChange: "transform" }}
        animate={{ scale: hovered ? 1.1 : 1, y: hovered ? -3 : 0 }}
        transition={{ duration: 0.4, ease: EASE_SMOOTH }}
      >
        <Image src={item.image} alt={item.name} fill sizes="200px" className="object-contain" />
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

const HOLD_DURATION = 3.2;

// ─── Nid d'abeilles — hub central + 5 alvéoles fixes reliées par des racines ──
function SocietesHive() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % SOCIETES.length);
    }, HOLD_DURATION * 1000);
    return () => clearInterval(id);
  }, [inView, resetKey]);

  const handleSelect = (i: number) => {
    setActiveIndex(i);
    setResetKey((k) => k + 1);
  };

  const active = SOCIETES[activeIndex];

  return (
    <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-16">
      {/* ── Panneau description — à gauche, se met à jour toute seule ── */}
      <div className="order-2 lg:order-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.name}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.45, ease: EASE_SMOOTH }}
            className="relative flex min-h-[280px] flex-col overflow-hidden rounded-[1.75rem] border px-8 py-9 pl-9 sm:min-h-[300px]"
            style={{
              background: "rgba(246,244,238,0.92)",
              borderColor: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 24px 48px rgba(27,33,24,0.16)",
            }}
          >
            {/* Trait d'accent vertical */}
            <span
              className="absolute left-0 top-8 bottom-8 w-[3px] rounded-full"
              style={{ background: WHEAT }}
            />

            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 shrink-0">
                <TransparentLogo src={active.image} alt={active.name} className="h-full w-full object-contain" />
              </div>
              <div>
                <span className="text-[10px] font-light uppercase tracking-[0.28em]" style={{ color: SAGE }}>
                  Société du groupe
                </span>
                <h3
                  className="text-[1.55rem] font-light leading-tight"
                  style={{ color: FOREST, fontFamily: "var(--font-display)" }}
                >
                  {active.name}
                </h3>
              </div>
            </div>

            <p className="mt-5 text-[14px] font-light leading-relaxed" style={{ color: BODY }}>
              {active.description}
            </p>

            {/* Navigation — sélection manuelle, toujours ancrée en bas de la carte */}
            <div className="mt-auto flex items-center gap-2 pt-6">
              {SOCIETES.map((s, i) => (
                <button
                  key={s.name}
                  type="button"
                  aria-label={`Afficher ${s.name}`}
                  onClick={() => handleSelect(i)}
                  className="group relative h-2 rounded-full transition-all duration-500"
                  style={{
                    width: i === activeIndex ? 26 : 8,
                    background: i === activeIndex ? WHEAT : LINE,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Ruche — à droite ── */}
      <div className="order-1 flex justify-center lg:order-2" ref={ref}>
        <div className="relative aspect-square w-full max-w-[480px] sm:max-w-[580px] lg:max-w-[680px]">
          {/* Racines — lien visuel reliant Espace Vert (société mère) à chacune des 4 autres sociétés */}
          <svg
            aria-hidden
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {HIVE_LAYOUT.map((pos, i) => {
              if (i === 0) return null; // le centre ne se relie pas à lui-même
              const center = HIVE_LAYOUT[0];
              // Courbe légère façon racine plutôt qu'un trait rigide
              const mx = (center.x + pos.x) / 2;
              const my = (center.y + pos.y) / 2;
              const isLinked = activeIndex === i || activeIndex === 0;
              return (
                <path
                  key={`root-${i}`}
                  d={`M ${center.x} ${center.y} Q ${mx} ${my} ${pos.x} ${pos.y}`}
                  fill="none"
                  stroke={isLinked ? WHEAT : LINE}
                  strokeWidth={isLinked ? 0.9 : 0.5}
                  strokeLinecap="round"
                  style={{ transition: "stroke 1s ease, stroke-width 1s ease" }}
                />
              );
            })}
          </svg>

          {/* Halo qui glisse doucement d'une alvéole à l'autre — donne la sensation d'une rotation fine et continue */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "34%",
              height: "34%",
              background: `radial-gradient(circle, ${WHEAT}33 0%, ${WHEAT}00 72%)`,
              filter: "blur(2px)",
            }}
            animate={{ left: `${HIVE_LAYOUT[activeIndex].x}%`, top: `${HIVE_LAYOUT[activeIndex].y}%` }}
            transition={{ duration: 1.6, ease: EASE_SMOOTH }}
          />

          {/* Alvéoles — les 5 sociétés, Espace Vert au centre, en avant en tant que société mère */}
          {HIVE_LAYOUT.map((pos, i) => {
            const s = SOCIETES[i];
            const isActive = activeIndex === i;
            const isCenter = i === 0;
            const hexPath = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";
            return (
              <motion.div
                key={s.name}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, zIndex: isActive ? 20 : isCenter ? 15 : 10 }}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ duration: 1.1, ease: EASE_SMOOTH }}
                onClick={() => handleSelect(i)}
              >
                {/*
                  IMPORTANT : hauteur et largeur STRICTEMENT identiques à chaque
                  breakpoint. Le clip-path hexagonal est calculé en % par
                  rapport à la boîte — une boîte non carrée déforme l'hexagone
                  (c'était la cause du rendu "penché"/irrégulier).
                */}
                <div
                  className={
                    isCenter
                      ? "relative h-32 w-32 sm:h-40 sm:w-40 lg:h-44 lg:w-44"
                      : "relative h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32"
                  }
                >
                  {/* Fond plein de l'hexagone — sépare le logo de la photo derrière,
                      cohérent avec le style "verre dépoli" de la carte de description */}
                  <div
                    className="absolute inset-0"
                    style={{
                      clipPath: hexPath,
                      background: "rgba(246,244,238,0.92)",
                      backdropFilter: "blur(4px)",
                      transition: "background 0.6s ease",
                    }}
                  />

                  {/* Contour hexagonal */}
                  <svg
                    aria-hidden
                    className="absolute inset-0 h-full w-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    style={{
                      filter: isActive
                        ? "drop-shadow(0 10px 18px rgba(27,33,24,0.24))"
                        : "drop-shadow(0 6px 12px rgba(27,33,24,0.14))",
                      transition: "filter 1s ease",
                    }}
                  >
                    <polygon
                      points="25,0 75,0 100,50 75,100 25,100 0,50"
                      fill="none"
                      stroke={isActive ? WHEAT : FOREST}
                      strokeWidth={isCenter ? 3 : 2.4}
                      style={{ transition: "stroke 1s ease" }}
                    />
                  </svg>

                  {/* Logo — posé sur le fond clair, découpé à la forme hexagonale */}
                  <div
                    className="absolute inset-0 flex items-center justify-center p-5 sm:p-6"
                    style={{ clipPath: hexPath }}
                  >
                    <div className="relative h-full w-full">
                      <TransparentLogo src={s.image} alt={s.name} className="h-full w-full object-contain" />
                    </div>
                  </div>

                  {isCenter && (
                    <span
                      className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-light uppercase tracking-[0.2em]"
                      style={{ background: FOREST, color: "#fff" }}
                    >
                      Société mère
                    </span>
                  )}
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
      <path
        d="M0,75 C180,25 360,105 600,60 C840,15 1020,95 1200,50"
        fill="none"
        stroke={SAGE}
        strokeWidth="4"
        opacity="0.35"
      />
      <path
        d="M0,92 C180,45 360,120 600,75 C840,30 1020,110 1200,68"
        fill="none"
        stroke={FOREST}
        strokeWidth="4"
        opacity="0.6"
      />
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
              <p className="text-sm font-medium" style={{ color: INK }}>
                {c.title}
              </p>
              <p className="text-xs font-light" style={{ color: BODY }}>
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

      {/* ── Nos sociétés — même fond que "Nos activités", logos bien lisibles ── */}
      <section className="relative overflow-hidden py-20 sm:py-24" style={{ background: LINEN }}>
        <ActivitesWatermark />
        <DriftingLeaves />

        <div className="container-ev relative z-10">
          <LuxuryTitle icon={Building2} label="Nos sociétés" />
          <SocietesHive />
        </div>
      </section>

      {/* ── Marques partenaires — carrousel clair, logos sans cadre ── */}
      <section className="relative overflow-hidden py-20 sm:py-24" style={{ background: LINEN }}>
        <CornerLeaves corner="top-left" />
        <CornerLeaves corner="bottom-right" />
        <BottomWaves />

        <div className="container-ev relative z-10" ref={partnersRef}>
          <motion.div
            className="mb-4 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: partnersInView ? 1 : 0, scale: partnersInView ? 1 : 0.8 }}
            transition={{ duration: 0.6, ease: EASE_SMOOTH }}
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full border"
              style={{ borderColor: WHEAT }}
            >
              <Handshake className="h-6 w-6" strokeWidth={1.3} style={{ color: WHEAT }} />
            </div>
          </motion.div>

          <LuxuryTitle label="Nos marques partenaires" tight />

          <motion.div
            className="mx-auto mb-4 flex items-center justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: partnersInView ? 1 : 0 }}
            transition={{ duration: 0.6, ease: EASE_SMOOTH, delay: 0.3 }}
          >
            <span className="h-px w-24" style={{ background: LINE }} />
            <Leaf className="h-4 w-4" strokeWidth={1.5} style={{ color: WHEAT }} />
            <span className="h-px w-24" style={{ background: LINE }} />
          </motion.div>

          <motion.p
            className="mx-auto mb-10 max-w-md text-center text-sm font-light leading-7"
            style={{ color: BODY }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: partnersInView ? 0.9 : 0, y: partnersInView ? 0 : 12 }}
            transition={{ duration: 0.6, ease: EASE_SMOOTH, delay: 0.35 }}
          >
            Ils nous font confiance au quotidien, sur le terrain comme dans nos ateliers.
          </motion.p>

          <PartenairesCarousel />
          <LogosWave />
          <TrustBadges />
        </div>
      </section>
    </>
  );
}