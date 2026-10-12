"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Droplets, Leaf, Flower2, Sprout } from "lucide-react";
import { useRef, useState } from "react";
import { Ico } from "@/components/icons/AgriIcons";
import { HomeSectionHeading } from "@/components/sections/HomeSectionHeading";
import { useI18n } from "@/i18n/I18nProvider";

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
    labelKey: "home.activity.seeds.label",
    tagline: "Des semences de qualité pour des cultures performantes",
    taglineKey: "home.activity.seeds.tagline",
    image: "/images/activites/semences-plants.webp",
    icon: Ico.SeedBag,
    accent: WHEAT,
  },
  {
    href: "/activites/fertilisation",
    label: "Fertilisation",
    labelKey: "home.activity.fertilization.label",
    tagline: "Des nutriments essentiels pour des plantes en pleine santé",
    taglineKey: "home.activity.fertilization.tagline",
    image: "/images/activites/fertilisation.webp",
    icon: Ico.WateringCan,
    accent: FOREST,
  },
  {
    href: "/activites/pollinisation-et-protection-des-plantes",
    label: "Pollinisation & Protection des plantes",
    labelKey: "home.activity.pollination.label",
    tagline: "Protéger vos cultures et favoriser la pollinisation naturelle",
    taglineKey: "home.activity.pollination.tagline",
    image: "/images/activites/pollinisation.webp",
    icon: Flower2,
    accent: AMBER,
  },
  {
    href: "/activites/irrigation",
    label: "Irrigation",
    labelKey: "home.activity.irrigation.label",
    tagline: "L'eau qu'il faut, quand il faut pour des rendements optimaux",
    taglineKey: "home.activity.irrigation.tagline",
    image: "/images/activites/irrigation.webp",
    icon: Ico.HoseCoil,
    accent: "#3f7bb0",
  },
  {
    href: "/activites/pulverisation",
    label: "Pulvérisation",
    labelKey: "home.activity.spraying.label",
    tagline: "Des solutions efficaces pour protéger vos cultures",
    taglineKey: "home.activity.spraying.tagline",
    image: "/images/activites/pulverisation.webp",
    icon: Ico.Spray,
    accent: SAGE,
  },
  {
    href: "/activites/machinisme-et-jardinage",
    label: "Machinisme",
    labelKey: "home.activity.machinery.label",
    tagline: "Des équipements fiables pour une agriculture performante",
    taglineKey: "home.activity.machinery.tagline",
    image: "/images/activites/machinisme.webp",
    icon: Ico.Tractor,
    accent: INK,
  },
];

const MARQUES = [
  {
    href: "/marques/fertivert",
    label: "Fertivert",
    logo: "/logos/LOGO FERTVERT copy.png",
    cover: "/images/hero/fertivert-marque.webp",
    themeLabel: "Fertilisation",
    tagline: "Nourrir chaque sol, chaque culture.",
    taglineKey: "home.brand.fertivert.tagline",
    accent: FOREST,
    tint: "#dff2d7",
    icon: Leaf,
  },
  {
    href: "/marques/pulvert",
    label: "Pulvert",
    logo: "/logos/PULVERT LOGO1.png",
    cover: "/images/activites/pulverisation.webp",
    themeLabel: "Pulvérisation",
    tagline: "Une protection précise, à chaque passage.",
    taglineKey: "home.brand.pulvert.tagline",
    accent: "#74a848",
    tint: "#e5f3df",
    icon: Ico.Spray,
  },
  {
    href: "/marques/matar",
    label: "Matar",
    logo: "/logos/matar.png",
    cover: "/images/hero/matar-desktop.webp",
    themeLabel: "Irrigation",
    tagline: "L'eau juste, au bon endroit.",
    taglineKey: "home.brand.matar.tagline",
    accent: "#3f7bb0",
    tint: "#dff0fb",
    icon: Droplets,
  },
  {
    href: "/marques/baddar-semences",
    label: "Baddar Semences",
    logo: "/logosPartenaires/baddar semences.png",
    cover: "/images/activites/semences-plants.webp",
    themeLabel: "Semences",
    tagline: "La première graine d'une bonne récolte.",
    taglineKey: "home.brand.baddar.tagline",
    accent: WHEAT,
    tint: "#f7ebc9",
    icon: Ico.SeedBag,
  },
  {
    href: "/marques/pepiniere takelsa",
    label: "Pépinière Takelsa",
    labelKey: "home.brand.takelsa.label",
    // TODO: déposer le logo réel dans /public/logos/ et corriger ce chemin
    logo: "/images/marques/TAKELSA.png",
    cover: "/images/marques/fond-marques.webp",
    themeLabel: "Pépinière",
    tagline: "Des plants sains, prêts pour la terre.",
    taglineKey: "home.brand.takelsa.tagline",
    accent: "#4d7c3f",
    tint: "#dfeee1",
    icon: Sprout,
  },
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
  const { t } = useI18n();
  const [hovered, setHovered] = useState(false);
  const label = t(item.labelKey, item.label);
  const tagline = t(item.taglineKey, item.tagline);

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
      <Link href={item.href} className="absolute inset-0 z-10" aria-label={label} />

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
              alt={label}
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
            {label}
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
          {tagline}
        </p>
        <motion.span
          className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1f4d34] shadow-[0_8px_24px_rgba(0,0,0,0.22)]"
          animate={{ x: hovered ? 6 : 0, opacity: hovered ? 1 : 0.86 }}
          transition={{ duration: 0.35, ease: EASE_SMOOTH }}
          aria-hidden="true"
        >
          <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

// ─── Marque — carte éditoriale, image métier + logo lisible ──────────────
function MarqueLogoItem({ item, index }: { item: (typeof MARQUES)[number]; index: number }) {
  const { t } = useI18n();
  const [hovered, setHovered] = useState(false);
  const featured = index === 0;
  const buttonShadow = `0 12px 26px ${item.accent}2e`;
  const label = item.labelKey ? t(item.labelKey, item.label) : item.label;
  const tagline = item.taglineKey ? t(item.taglineKey, item.tagline) : item.tagline;

  return (
    <motion.div
      className="group relative h-full overflow-hidden rounded-[18px] border bg-white shadow-[0_18px_52px_rgba(27,33,24,0.08)] transition-shadow duration-300 hover:shadow-[0_26px_70px_rgba(31,77,52,0.16)]"
      style={{ borderColor: featured ? "rgba(31,121,57,0.72)" : "rgba(225,221,210,0.8)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: EASE_LUXE },
        },
      }}
      animate={{ y: hovered ? -4 : 0 }}
      transition={{ duration: 0.4, ease: EASE_LUXE }}
    >
      <Link href={item.href} className="absolute inset-0 z-10" aria-label={label} />

      <div className="relative h-[182px] overflow-hidden sm:h-[190px]">
        <motion.div
          className="absolute inset-0"
          animate={{ scale: hovered ? 1.07 : 1 }}
          transition={{ duration: 0.8, ease: EASE_LUXE }}
        >
          <Image
            src={item.cover}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
            className="object-cover"
          />
        </motion.div>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.22) 48%, rgba(255,255,255,0) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute -right-12 -top-14 h-36 w-36 rounded-bl-[70%] rounded-br-[42%] rounded-tl-[42%] rounded-tr-[70%] opacity-80 blur-[1px]"
          style={{ background: `linear-gradient(135deg, ${item.tint}, rgba(255,255,255,0.2))` }}
        />
        <motion.div
          className="absolute left-7 top-7 h-20 w-[190px] sm:h-24"
          animate={{ scale: hovered ? 1.04 : 1 }}
          transition={{ duration: 0.5, ease: EASE_LUXE }}
          style={{ filter: "drop-shadow(0 8px 14px rgba(27,33,24,0.14))" }}
        >
          <Image
            src={item.logo}
            alt={label}
            fill
            sizes="190px"
            className="object-contain"
          />
        </motion.div>
      </div>

      <div
        className="flex min-h-[226px] flex-col px-7 py-6"
        style={{ fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif" }}
      >
        <h3
          className="text-[1.45rem] font-extrabold leading-tight normal-case sm:text-[1.55rem]"
          style={{
            color: "#173f2d",
            fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif",
            fontVariantCaps: "normal",
            textTransform: "none",
          }}
        >
          {label}
        </h3>

        <p className="mt-3 max-w-[14rem] text-[15px] font-medium leading-7" style={{ color: "#68746a" }}>
          {tagline}
        </p>

        <motion.span
          className="mt-auto inline-flex h-11 w-fit items-center gap-3 rounded-full border px-5 text-[14px] font-extrabold text-white shadow-[0_10px_22px_rgba(31,121,57,0.18)]"
          style={{
            borderColor: item.accent,
            backgroundColor: item.accent,
            backgroundImage: "none",
            color: "#ffffff",
            boxShadow: buttonShadow,
          }}
          animate={{ x: hovered ? 4 : 0, filter: hovered ? "brightness(0.94)" : "brightness(1)" }}
          transition={{ duration: 0.35, ease: EASE_SMOOTH }}
        >
          {t("home.discover", "Découvrir")}
          <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
        </motion.span>
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────
export default function HomeNavButtonsNewStyle() {
  const { t } = useI18n();
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <HomeSectionHeading
                eyebrow={t("home.activities.eyebrow", "Nos activités")}
                title={t("home.activities.title", "Nos activités")}
                subtitle={t("home.activities.subtitle", "Une solution claire pour chaque besoin agricole.")}
                icon={Leaf}
                inView={activitiesInView}
              />

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: activitiesInView ? 1 : 0, y: activitiesInView ? 0 : 12 }}
                transition={{ duration: 0.6, ease: EASE_SMOOTH, delay: 0.45 }}
              >
                <Link
                  href="/activites"
                  className="group inline-flex items-center gap-3 rounded-full border border-[#1f4d34]/20 bg-white/80 px-5 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-[#1f4d34] shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                >
                  <Ico.Barn className="h-4 w-4" />
                  {t("home.activities.browse", "Parcourir par activité")}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.4} />
                </Link>
              </motion.div>
            </div>
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
          NOS MARQUES — cartes sobres, logos lisibles
          ═══════════════════════════════════════════════════════════════════ */}
      <div
        id="nos-marques"
        className="relative overflow-hidden border-t border-[#e1ddd2]"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(125,192,64,0.11), transparent 34%), linear-gradient(180deg, #fbfdf8 0%, #f7faf2 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-12 top-6 h-36 w-56 rotate-[-24deg] rounded-[75%_15%_75%_15%] bg-[#7aa66f]/25 blur-[0.5px]" />
          <div className="absolute left-12 top-32 h-8 w-20 rotate-[-18deg] rounded-[75%_15%_75%_15%] bg-[#7aa66f]/28" />
          <div className="absolute -right-8 bottom-14 h-28 w-20 rotate-[42deg] rounded-[75%_15%_75%_15%] bg-[#7aa66f]/30" />
          <div
            className="absolute inset-x-0 bottom-0 h-36"
            style={{
              background:
                "linear-gradient(155deg, transparent 0 63%, rgba(159,190,146,0.16) 63.3% 100%)",
            }}
          />
        </div>

        <div className="container-ev relative z-10">
          <motion.div
            ref={marquesRef}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: marquesInView ? 1 : 0, y: marquesInView ? 0 : 40 }}
            transition={{ duration: 0.8, ease: EASE_SMOOTH }}
            className="pt-12 pb-7 text-center sm:pt-16 sm:pb-8"
          >
            <HomeSectionHeading
              eyebrow={t("home.brands.eyebrow", "Nos marques")}
              title={t("home.brands.title", "Nos marques")}
              subtitle={t("home.brands.subtitle", "Chaque marque porte une expertise précise du groupe.")}
              icon={Leaf}
              inView={marquesInView}
              align="center"
            />
          </motion.div>

          <div className="relative pb-14 sm:pb-16">
            <motion.div
              initial="hidden"
              animate={marquesInView ? "visible" : "hidden"}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } },
              }}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-[1.14fr_repeat(4,1fr)]"
            >
              {MARQUES.map((item, index) => (
                <MarqueLogoItem key={item.href} item={item} index={index} />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
