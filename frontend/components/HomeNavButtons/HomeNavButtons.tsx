"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useState } from "react";
import Image from "next/image";

// ─── Palette exacte logos (extraite pixel par pixel) ─────────────────────────
const GREEN_DARK   = "#006428";   // Espace Vert foncé
const GREEN_MAIN   = "#28b43c";   // Fertivert vert vif
const GREEN_LIME   = "#8cb43c";   // Espace Vert lime

// ─── Flèche ──────────────────────────────────────────────────────────────────
const ChevronRight = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

// ─── ACTIVITÉS ───────────────────────────────────────────────────────────────
// ⚠️  IMAGES : place tes photos dans /public/images/activites/
//     Format recommandé : JPG ou WebP, 800×1100px minimum (portrait)
//     Les noms de fichiers sont indiqués dans le champ `photo` ci-dessous.
//     Si aucune photo n'existe encore, le dégradé de secours s'affiche.
const ACTIVITES = [
  {
    href:    "/activites/semences-et-plants",
    label:   "Semences & plants",
    // ⚠️  PHOTO 1 — place ton image ici : /public/images/activites/pesticides.jpg
    photo:   "/images/activites/pesticides.jpg",
    fallback:"linear-gradient(170deg,#1a3d0a 0%,#2d6e1a 55%,#4a8f2a 100%)",
  },
  {
    href:    "/activites/irrigation",
    label:   "Irrigation",
    // ⚠️  PHOTO 2 — place ton image ici : /public/images/activites/engrais.jpg
    photo:   "/images/activites/engrais.jpg",
    fallback:"linear-gradient(170deg,#2a1a00 0%,#6b4a10 55%,#a07830 100%)",
  },
  {
    href:    "/activites/fertilisation",
    label:   "Fertilisation",
    // ⚠️  PHOTO 3 — place ton image ici : /public/images/activites/semences.jpg
    photo:   "/images/activites/semences.jpg",
    fallback:"linear-gradient(170deg,#0a1a10 0%,#14401e 55%,#1e6628 100%)",
  },
  {
    href:    "/activites/jardinage",
    label:   "jardinage et machinisme",
    // ⚠️  PHOTO 4 — place ton image ici : /public/images/activites/biostimulants.jpg
    photo:   "/images/activites/biostimulants.jpg",
    fallback:"linear-gradient(170deg,#0a2010 0%,#1a4a20 55%,#2d7a3a 100%)",
  },
   {
    href:    "/activites/pulverisation",
    label:   "Pulvérisation",
    // ⚠️  PHOTO 5 — place ton image ici : /public/images/activites/pulverisation.jpg
    photo:   "/images/activites/pulverisation.jpg",
    fallback:"linear-gradient(170deg,#0a2010 0%,#1a4a20 55%,#2d7a3a 100%)",
  }
];

// ─── Card activité ────────────────────────────────────────────────────────────
function ActivityCard({ item, locale, index }: {
  item: typeof ACTIVITES[0];
  locale: string;
  index: number;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 min-w-0"
      style={{ height: "clamp(320px, 52vw, 520px)" }}
    >
      <Link
        href={`/${locale}${item.href}`}
        className="group relative block w-full h-full overflow-hidden cursor-pointer"
      >
        {/* ── Photo pleine — zoom au hover ── */}
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110 will-change-transform">
          {!imgError ? (
            <Image
              src={item.photo}
              alt={item.label}
              fill
              className="object-cover"
              onError={() => setImgError(true)}
              sizes="(max-width: 768px) 50vw, 20vw"
            />
          ) : (
            <div className="w-full h-full" style={{ background: item.fallback }} />
          )}
        </div>

        {/* overlay progressif bas */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.30) 45%, rgba(0,0,0,0.06) 75%, transparent 100%)",
          }}
        />

        {/* contenu bas */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-5 flex items-end justify-between">
          <h3
            className="text-white font-black leading-tight drop-shadow"
            style={{ fontSize: "clamp(16px, 2vw, 24px)" }}
          >
            {item.label}
          </h3>

          {/* bouton rond vert animé */}
          <motion.div
            className="flex-shrink-0 rounded-full flex items-center justify-center shadow-lg"
            style={{
              width: 48, height: 48,
              background: GREEN_MAIN,
              boxShadow: `0 4px 18px rgba(40,180,60,0.55)`,
            }}
            whileHover={{ scale: 1.18 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: index * 0.25 }}
            >
              <ChevronRight />
            </motion.div>
          </motion.div>
        </div>

        {/* bordure verte hover */}
        <div
          className="absolute inset-0 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `inset 0 0 0 3px ${GREEN_MAIN}` }}
        />
      </Link>
    </motion.div>
  );
}

// ─── MARQUES ──────────────────────────────────────────────────────────────────
// ⚠️  IMAGES MARQUES : place tes logos/visuels dans /public/images/marques/
const MARQUES = [
  {
    href:    "/marques/fertivert",
    label:   "Fertivert",
    sub:     "Pro & Garden",
    desc:    "Engrais organiques & biostimulants",
    // ⚠️  PHOTO MARQUE 1 — /public/logos/LOGO_FERTiVERT.webp
    photo:   "/logos/LOGO_FERTiVERT.webp",
    fallback:"linear-gradient(135deg,#0d2106 0%,#1a3d0a 50%,#2d6e1a 100%)",
    accent:  GREEN_MAIN,
  },
  {
    href:    "/marques/pulvert",
    label:   "Pulvert",
    sub:     "Agricole & Garden",
    desc:    "Pulvérisation & équipements",
    // ⚠️  PHOTO MARQUE 2 — /public/images/marques/pulvert-bg.jpg
    photo:   "/images/marques/pulvert-bg.jpg",
    fallback:"linear-gradient(135deg,#042726 0%,#134e4a 50%,#1a7a74 100%)",
    accent:  "#34c4ba",
  },
  {
    href:    "/marques/matar",
    label:   "Matar",
    sub:     "Irrigation & Smart",
    desc:    "Systèmes d'irrigation connectés",
    // ⚠️  PHOTO MARQUE 3 — /public/images/marques/matar-bg.jpg
    photo:   "/images/marques/matar-bg.jpg",
    fallback:"linear-gradient(135deg,#040d1c 0%,#0e3a5f 50%,#1a5fa8 100%)",
    accent:  "#60a5fa",
  },
];

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function HomeNavButtons() {
  const locale = useLocale();

  return (
    <section style={{ background: "#ffffff" }}>

      {/* ══ NOS ACTIVITÉS ══════════════════════════════════════════════════════
          4 grands panneaux côte à côte pleine hauteur, photos réelles
      ════════════════════════════════════════════════════════════════════════ */}

      {/* Header */}
      <div className="px-6 pt-12 pb-5 max-w-[1400px] mx-auto flex items-end justify-between">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-1"
            style={{ color: GREEN_LIME }}
          >
            Expertise agricole
          </p>
          <h2 className="text-3xl font-black" style={{ color: "#0d1a0d" }}>
            Nos <span style={{ color: GREEN_DARK }}>Activités</span>
          </h2>
        </motion.div>
        <Link
          href={`/${locale}/activites`}
          className="hidden sm:flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity"
          style={{ color: GREEN_DARK }}
        >
          Voir tout
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      {/* Grille 4 panneaux plein écran — comme la référence */}
      <div className="flex" style={{ gap: 0 }}>
        {ACTIVITES.map((item, i) => (
          <ActivityCard key={item.href} item={item} locale={locale} index={i} />
        ))}
      </div>

      {/* ══ NOS MARQUES ════════════════════════════════════════════════════════ */}
      <div id="nos-marques" className="px-6 pt-12 pb-4 max-w-[1400px] mx-auto flex items-end justify-between">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-1"
            style={{ color: GREEN_LIME }}
          >
            Marques maison
          </p>
          <h2 className="text-3xl font-black" style={{ color: "#0d1a0d" }}>
            Nos <span style={{ color: GREEN_DARK }}>Marques</span>
          </h2>
        </motion.div>
        <Link
          href={`/${locale}/marques`}
          className="hidden sm:flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity"
          style={{ color: GREEN_DARK }}
        >
          Toutes les marques
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 pb-12" style={{ gap: 0 }}>
        {MARQUES.map((m, i) => (
          <BrandCard key={m.href} item={m} locale={locale} index={i} />
        ))}
      </div>

    </section>
  );
}

// ─── Card marque ──────────────────────────────────────────────────────────────
function BrandCard({ item, locale, index }: {
  item: typeof MARQUES[0];
  locale: string;
  index: number;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: 260 }}
    >
      <Link
        href={`/${locale}${item.href}`}
        className="group relative block w-full h-full overflow-hidden cursor-pointer"
      >
        {/* ── Fond / image pleine — zoom au hover ── */}
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110 will-change-transform">
          {item.label === "Fertivert" ? (
            <>
              <div className="w-full h-full" style={{ background: item.fallback }} />
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <Image
                  src={item.photo}
                  alt={item.label}
                  width={240} height={120}
                  className="object-contain w-full max-w-[240px] max-h-[120px]"
                  style={{ filter: "drop-shadow(0 4px 24px rgba(40,180,60,0.55)) brightness(1.15)" }}
                  onError={() => setImgError(true)}
                />
              </div>
            </>
          ) : !imgError ? (
            <Image
              src={item.photo}
              alt={item.label}
              fill
              className="object-cover"
              onError={() => setImgError(true)}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="w-full h-full" style={{ background: item.fallback }} />
          )}
        </div>

        {/* overlay */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.84) 0%, rgba(0,0,0,0.30) 55%, rgba(0,0,0,0.04) 100%)",
          }}
        />

        {/* séparateur droite */}
        {index < MARQUES.length - 1 && (
          <div className="absolute top-0 right-0 bottom-0 z-20 w-px" style={{ background: "rgba(255,255,255,0.12)" }} />
        )}

        {/* contenu */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-5 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: item.accent }}>
              {item.sub}
            </p>
            <h3 className="text-white font-black text-2xl leading-none drop-shadow mb-1">
              {item.label}
            </h3>
            <p className="text-white/55 text-[12px]">{item.desc}</p>
          </div>

          <motion.div
            className="flex-shrink-0 rounded-full flex items-center justify-center shadow-lg"
            style={{
              width: 44, height: 44,
              background: item.accent,
              boxShadow: `0 4px 16px ${item.accent}66`,
            }}
            whileHover={{ scale: 1.12 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: index * 0.3 }}
            >
              <ChevronRight />
            </motion.div>
          </motion.div>
        </div>

        {/* bordure hover */}
        <div
          className="absolute inset-0 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `inset 0 0 0 3px ${item.accent}` }}
        />
      </Link>
    </motion.div>
  );
}