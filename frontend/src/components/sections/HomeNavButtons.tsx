"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Award, Leaf, Flower2, ShieldCheck, Users, Weight } from "lucide-react";
import { useRef, useState } from "react";
import { Ico } from "@/components/icons/AgriIcons";

// ─── Palette (lin / forêt / sauge / blé) ─────────────────────────────────
const INK = "#1b2118";
const FOREST = "#1f4d34";
const SAGE = "#7c8f6a";
const WHEAT = "#c9a24a";
const AMBER = "#b8863c";
const LINEN = "#f6f4ee";
const LINE = "#e1ddd2";
const BODY = "#5b655a";

// ─── Motion ───────────────────────────────────────────────────────────────
const EASE_SMOOTH = [0.25, 0.46, 0.45, 0.94] as const;
const EASE_LUXE = [0.16, 1, 0.3, 1] as const;

// ─── Data ───────────────────────────────────────────────────────────────
const ACTIVITES = [
  {
    href: "/activites/semences-et-plants",
    label: "Semences & Plants",
    tagline: "Des semences de qualité pour des cultures performantes",
    image: "/images/activites/semences-plants.webp",
    icon: Ico.SeedBag,
    accent: WHEAT,
  },
  {
    href: "/activites/fertilisation",
    label: "Fertilisation",
    tagline: "Des nutriments essentiels pour des plantes en pleine santé",
    image: "/images/activites/fertilisation.webp",
    icon: Ico.WateringCan,
    accent: FOREST,
  },
  {
    href: "/activites/pollinisation-et-protection-des-plantes",
    label: "Pollinisation & Protection des plantes",
    tagline: "Protéger vos cultures et favoriser la pollinisation naturelle",
    image: "/images/activites/pollinisation.webp",
    icon: Flower2,
    accent: AMBER,
  },
  {
    href: "/activites/irrigation",
    label: "Irrigation",
    tagline: "L'eau qu'il faut, quand il faut pour des rendements optimaux",
    image: "/images/activites/irrigation.webp",
    icon: Ico.HoseCoil,
    accent: "#3f7bb0",
  },
  {
    href: "/activites/pulverisation",
    label: "Pulvérisation",
    tagline: "Des solutions efficaces pour protéger vos cultures",
    image: "/images/activites/pulverisation.webp",
    icon: Ico.Spray,
    accent: SAGE,
  },
  {
    href: "/activites/machinisme-et-jardinage",
    label: "Machinisme",
    tagline: "Des équipements fiables pour une agriculture performante",
    image: "/images/activites/machinisme.webp",
    icon: Ico.Tractor,
    accent: INK,
  },
];

const MARQUES = [
  {
    href: "/marques/fertivert",
    label: "Fertivert",
    image: "/logos/LOGO FERTVERT copy.png",
    themeLabel: "Fertilisation",
    tagline: "Nourrir chaque sol, chaque culture.",
    accent: FOREST,
  },
  {
    href: "/marques/pulvert",
    label: "Pulvert",
    image: "/logos/PULVERT LOGO1.png",
    themeLabel: "Pulvérisation",
    tagline: "Une protection précise, à chaque passage.",
    accent: SAGE,
  },
  {
    href: "/marques/matar",
    label: "Matar",
    image: "/logos/matar.png",
    themeLabel: "Irrigation",
    tagline: "L'eau juste, au bon endroit.",
    accent: "#3f7bb0",
  },
  {
    href: "/marques/baddar-semences",
    label: "Baddar Semences",
    image: "/logosPartenaires/baddar semences.png",
    themeLabel: "Semences",
    tagline: "La première graine d'une bonne récolte.",
    accent: WHEAT,
  },
  {
    href: "/marques/pepiniere takelsa",
    label: "Pépinière Takelsa",
    // TODO: déposer le logo réel dans /public/logos/ et corriger ce chemin
    image: "/images/marques/TAKELSA.png",
    themeLabel: "Pépinière",
    tagline: "Des plants sains, prêts pour la terre.",
    accent: "#4d7c3f",
  },
];

const MARQUES_BG = "/images/marques/image.jpeg";

const VALEURS = [
  { icon: Leaf, label: "Innovation" },
  { icon: ShieldCheck, label: "Qualité" },
  { icon: Users, label: "Engagement" },
];

// ─── Activity Tile — galerie immersive, sans cadre, collée aux voisines ──
const AREA_CLASSES = [
  "lg:[grid-area:a]",
  "lg:[grid-area:b]",
  "lg:[grid-area:c]",
  "lg:[grid-area:d]",
  "lg:[grid-area:e]",
  "lg:[grid-area:f]",
] as const;

function ActivityTile({
  item,
  areaClass,
  index,
}: {
  item: (typeof ACTIVITES)[number];
  areaClass: string;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  // Durée et délai légèrement différents par tuile
  // pour que le "souffle" de zoom ne soit jamais parfaitement synchronisé.
  const breatheDuration = 9 + index * 1.3;
  const breatheDelay = index * 0.6;

  return (
    <motion.div
      className={`group relative h-full min-h-[280px] w-full overflow-hidden ${areaClass}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.8, ease: EASE_SMOOTH } },
      }}
    >
      <Link href={item.href} className="absolute inset-0 z-10" aria-label={item.label} />

      {/* Entrée — révélation en un temps (Ken Burns d'ouverture) */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.15 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.6, ease: EASE_SMOOTH }}
      >
        {/* Respiration continue façon GIF — va-et-vient infini, très doux */}
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1, 1.09, 1] }}
          transition={{
            duration: breatheDuration,
            delay: breatheDelay,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.9, ease: EASE_LUXE }}
          >
            <Image
              src={item.image}
              alt={item.label}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Dégradé sombre en bas — pas de boîte, juste assez pour la lisibilité */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(16,24,18,0) 50%, rgba(16,24,18,0.72) 100%)",
        }}
      />

      {/* Titre — icône + label gras + trait + légende, comme la maquette de référence */}
      <motion.div
        className="absolute bottom-0 left-0 p-6 sm:p-8"
        animate={{ opacity: hovered ? 1 : 0.95, y: hovered ? -4 : 6 }}
        transition={{ duration: 0.5, ease: EASE_SMOOTH }}
      >
        <div className="mb-2 flex items-center gap-2.5">
          <item.icon
            className="h-5 w-5 sm:h-6 sm:w-6 shrink-0"
            strokeWidth={1.8}
            style={{ color: item.accent === INK ? WHEAT : "#ffffff" }}
          />
          <h3
            className="text-[1.25rem] font-semibold leading-tight tracking-[0.015em] text-white sm:text-[1.55rem]"
            style={{
              fontFamily: "var(--font-display), 'Cairo', sans-serif",
              textShadow: "0 2px 18px rgba(0,0,0,0.35)",
            }}
          >
            {item.label}
          </h3>
        </div>
        <motion.div
          className="h-px"
          style={{ background: WHEAT }}
          animate={{ width: hovered ? 60 : 28, opacity: hovered ? 1 : 0.65 }}
          transition={{ duration: 0.5, ease: EASE_SMOOTH }}
        />
        <p
          className="mt-2 max-w-[15rem] text-[13px] font-light leading-snug text-white/90 sm:max-w-[17rem] sm:text-[13.5px]"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.35)" }}
        >
          {item.tagline}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Marque — logo posé directement sur la photo, sans cadre ────────────
function MarqueLogoItem({ item, index }: { item: (typeof MARQUES)[number]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="group relative flex basis-[12rem] flex-col items-center gap-4 text-center sm:basis-[14.5rem] lg:basis-auto lg:w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: EASE_LUXE },
        },
      }}
      animate={{ y: hovered ? -4 : 0 }}
      transition={{ duration: 0.4, ease: EASE_LUXE }}
    >
      <Link href={item.href} className="absolute inset-0 z-10" aria-label={item.label} />

      <motion.div
        className="relative flex h-20 w-48 items-center justify-center sm:h-24 sm:w-56 lg:h-24 lg:w-56"
        animate={{ scale: hovered ? 1.07 : 1 }}
        transition={{ duration: 0.5, ease: EASE_LUXE }}
        style={{ filter: "drop-shadow(0 6px 14px rgba(27,33,24,0.12))" }}
      >
        <Image
          src={item.image}
          alt={item.label}
          fill
          sizes="(max-width: 1024px) 45vw, 260px"
          className="object-contain"
        />
      </motion.div>

      <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/75 px-4 py-3 backdrop-blur-sm">
        <motion.span
          className="text-[12.5px] font-bold uppercase tracking-[0.24em]"
          style={{ color: INK }}
          animate={{ opacity: hovered ? 1 : 0.9 }}
          transition={{ duration: 0.3, ease: EASE_SMOOTH }}
        >
          {item.themeLabel}
        </motion.span>

        <p
          className="flex max-w-[13rem] items-start justify-center text-[15px] font-normal leading-relaxed sm:max-w-[14.5rem]"
          style={{ color: INK }}
        >
          {item.tagline}
        </p>
      </div>

      <motion.div
        className="h-px"
        style={{ background: item.accent }}
        animate={{ width: hovered ? 40 : 20, opacity: hovered ? 1 : 0.6 }}
        transition={{ duration: 0.4, ease: EASE_SMOOTH }}
      />
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────
export default function HomeNavButtonsNewStyle() {
  const activitiesRef = useRef<HTMLDivElement>(null);
  const activitiesInView = useInView(activitiesRef, { once: true, margin: "-80px" });
  const marquesRef = useRef<HTMLDivElement>(null);
  const marquesInView = useInView(marquesRef, { once: true, margin: "-80px" });

  return (
    <section style={{ background: LINEN }}>
      {/* ═══════════════════════════════════════════════════════════════════
          NOS ACTIVITÉS — grille bento, cartes séparées
          ═══════════════════════════════════════════════════════════════════ */}
      <div id="nos-activites" className="relative overflow-hidden" style={{ background: LINEN }}>
        {/* Filigrane panoramique — couvre toute la largeur de la section, respire lentement */}
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
              transition={{
                duration: 22,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror",
              }}
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

        <div className="container-ev relative">
          {/* Header */}
          <motion.div
            ref={activitiesRef}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: activitiesInView ? 1 : 0, y: activitiesInView ? 0 : 40 }}
            transition={{ duration: 0.8, ease: EASE_SMOOTH }}
            className="flex flex-col gap-6 pt-10 sm:pt-12 pb-5 sm:pb-6"
          >
            <h2
              className="section-title overflow-y-hidden"
              style={{ color: INK }}
            >
              <motion.span
                className="inline-flex items-center gap-2 sm:gap-4"
                initial={{ y: "120%" }}
                animate={{ y: activitiesInView ? "0%" : "120%" }}
                transition={{ duration: 0.9, ease: EASE_SMOOTH, delay: 0.1 }}
              >
                <motion.span
                  animate={{ rotate: activitiesInView ? [0, 20, 0] : 0 }}
                  transition={{ duration: 1.2, ease: EASE_SMOOTH, delay: 0.3 }}
                >
                  <Leaf className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={1.2} style={{ color: FOREST }} />
                </motion.span>
                Une solution pour
              </motion.span>{" "}
              <motion.span
                className="inline-block font-bold"
                style={{ color: FOREST }}
                initial={{ y: "120%", opacity: 0 }}
                animate={{
                  y: activitiesInView ? "0%" : "120%",
                  opacity: activitiesInView ? 1 : 0,
                }}
                transition={{ duration: 0.9, ease: EASE_SMOOTH, delay: 0.35 }}
              >
                chaque besoin
              </motion.span>
            </h2>
          </motion.div>
        </div>

        {/* Galerie bento — plein largeur, trait blanc de 2mm entre les images */}
        <motion.div
          initial="hidden"
          animate={activitiesInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06, delayChildren: 0.7 } },
          }}
          className="relative grid grid-cols-1 gap-1 bg-white p-1 sm:grid-cols-2 lg:grid-cols-4 lg:[grid-template-rows:minmax(280px,1fr)_minmax(280px,1fr)_minmax(240px,1fr)] lg:[grid-template-areas:'a_a_b_c'_'a_a_d_c'_'e_e_f_f']"
        >
          {ACTIVITES.map((item, index) => (
            <ActivityTile key={item.href} item={item} areaClass={AREA_CLASSES[index]} index={index} />
          ))}
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          NOS MARQUES — logos posés sur une photo de champ, sans cadre
          ═══════════════════════════════════════════════════════════════════ */}
      <div id="nos-marques" className="relative overflow-hidden" style={{ background: LINEN }}>
        {/* Photo de fond — nouvelle illustration à 5 bandes (une par marque), léger souffle */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <motion.div
            className="absolute inset-0"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{
              duration: 24,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror",
            }}
          >
            <Image src={MARQUES_BG} alt="" fill sizes="100vw" className="object-cover" priority={false} />
          </motion.div>
        </div>

        <div className="container-ev relative z-10">
          <motion.div
            ref={marquesRef}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: marquesInView ? 1 : 0, y: marquesInView ? 0 : 40 }}
            transition={{ duration: 0.8, ease: EASE_SMOOTH }}
            className="flex flex-col items-center gap-3 pt-8 pb-3 text-center sm:pt-9 sm:pb-4"
          >
            <motion.span
              animate={{ rotate: marquesInView ? [0, 20, 0] : 0 }}
              transition={{ duration: 1.2, ease: EASE_SMOOTH, delay: 0.3 }}
            >
              <Award className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={1.2} style={{ color: FOREST }} />
            </motion.span>

            <h2
              className="section-title overflow-y-hidden"
              style={{ color: INK }}
            >
              <motion.span
                initial={{ y: "120%" }}
                animate={{ y: marquesInView ? "0%" : "120%" }}
                transition={{ duration: 0.9, ease: EASE_SMOOTH, delay: 0.1 }}
                className="inline-block"
              >
                Chaque marque,{" "}
              </motion.span>
              <motion.span
                initial={{ y: "120%", opacity: 0 }}
                animate={{
                  y: marquesInView ? "0%" : "120%",
                  opacity: marquesInView ? 1 : 0,
                }}
                transition={{ duration: 0.9, ease: EASE_SMOOTH, delay: 0.35 }}
                className="inline-block font-bold"
                style={{ color: FOREST }}
              >
                une expertise
              </motion.span>
            </h2>

            <motion.p
              className="mx-auto max-w-md text-center text-[15px] leading-8 font-light"
              style={{ color: INK }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: marquesInView ? 1 : 0, y: marquesInView ? 0 : 16 }}
              transition={{ duration: 0.7, ease: EASE_SMOOTH, delay: 0.3 }}
            >
              Cinq marques complémentaires, chacune spécialisée sur un maillon de la chaîne agricole.
            </motion.p>

            {/* Séparateur — trait, feuille, trait */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: marquesInView ? 1 : 0, scale: marquesInView ? 1 : 0.8 }}
              transition={{ duration: 0.6, ease: EASE_SMOOTH, delay: 0.45 }}
            >
              <span className="h-px w-8" style={{ background: FOREST, opacity: 0.4 }} />
              <Leaf className="h-4 w-4" strokeWidth={1.4} style={{ color: FOREST }} />
              <span className="h-px w-8" style={{ background: FOREST, opacity: 0.4 }} />
            </motion.div>
          </motion.div>

          {/* Rangée des logos — posés directement sur la photo, sans cadre ni fond */}
          <motion.div
            initial="hidden"
            animate={marquesInView ? "visible" : "hidden"}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } },
            }}
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-10 pt-4 pb-14 sm:gap-x-10 sm:pb-16 lg:grid lg:grid-cols-5 lg:items-center lg:justify-items-center lg:gap-x-4 xl:gap-x-6"
          >
            {MARQUES.map((item, index) => (
              <MarqueLogoItem key={item.href} item={item} index={index} />
            ))}
          </motion.div>

          {/* Bandeau de valeurs — pilule avec cadre, entrée en cascade + interaction au survol */}
          <motion.div
            initial="hidden"
            animate={marquesInView ? "visible" : "hidden"}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12, delayChildren: 0.8 } },
            }}
            className="mx-auto mb-14 sm:mb-16 flex w-fit flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-full border px-10 py-5 shadow-sm sm:gap-x-12 sm:px-12 sm:py-6"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(10px)",
              borderColor: LINE,
            }}
          >
            {VALEURS.map((valeur, index) => (
              <motion.div
                key={valeur.label}
                className="flex items-center gap-6 sm:gap-9"
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_SMOOTH } },
                }}
              >
                {index > 0 && <span className="h-5 w-px" style={{ background: LINE }} />}
                <motion.div
                  className="flex items-center gap-2.5"
                  whileHover="hover"
                  initial="rest"
                  animate="rest"
                >
                  <motion.span
                    className="flex items-center"
                    variants={{
                      rest: { rotate: 0, scale: 1 },
                      hover: { rotate: [0, -12, 12, 0], scale: 1.15 },
                    }}
                    transition={{ duration: 0.5, ease: EASE_SMOOTH }}
                  >
                    <valeur.icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.6} style={{ color: FOREST }} />
                  </motion.span>
                  <motion.span
                    className="text-base sm:text-lg font-bold"
                    style={{ color: INK }}
                    variants={{
                      rest: { color: INK },
                      hover: { color: FOREST },
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {valeur.label}
                  </motion.span>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}