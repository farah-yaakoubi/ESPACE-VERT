"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";
import { useLocale } from "next-intl";

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeroProps {
  /** Titre principal */
  title: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** URL de l'image de fond (public/images/...) */
  imageSrc?: string;
  /** Dégradé de couleur overlay (défaut : vert forêt) */
  gradientFrom?: string;
  gradientTo?: string;
  /** Fil d'Ariane */
  breadcrumbs?: Breadcrumb[];
  /** Badge coloré au-dessus du titre */
  badge?: string;
  badgeColor?: string;
  /** Hauteur (default: md) */
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

const sizes = {
  sm: "min-h-[280px]",
  md: "min-h-[380px]",
  lg: "min-h-[500px]",
};

export default function PageHero({
  title,
  subtitle,
  imageSrc,
  gradientFrom = "#0a6030",
  gradientTo   = "#2d6e45",
  breadcrumbs  = [],
  badge,
  badgeColor   = "#7dc040",
  size         = "md",
  children,
}: PageHeroProps) {
  const locale = useLocale();

  return (
    <section
      className={`relative w-full ${sizes[size]} flex flex-col justify-end overflow-hidden`}
    >
      {/* ── Image de fond ─────────────────────────────────────────── */}
      {imageSrc ? (
        <>
          <Image
            src={imageSrc}
            alt={title}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Overlay dégradé sur l'image */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${gradientFrom}e6 0%, ${gradientTo}99 60%, transparent 100%)`,
            }}
          />
        </>
      ) : (
        /* Fond dégradé pur si pas d'image */
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
            }}
          />
          {/* Motif décoratif SVG */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.06]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="hero-grid"
                width="48"
                height="48"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 48 0 L 0 0 0 48"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
          {/* Cercles décoratifs */}
          <div
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
            style={{ backgroundColor: "#fff" }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-10"
            style={{ backgroundColor: "#7dc040" }}
          />
        </>
      )}

      {/* ── Contenu ───────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-10 pt-28 w-full">
        {/* Fil d'Ariane */}
        {breadcrumbs.length > 0 && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-1.5 mb-5 flex-wrap"
          >
            <Link
              href={`/${locale}`}
              className="flex items-center gap-1 text-white/70 hover:text-white text-sm transition-colors"
            >
              <HomeIcon className="w-3.5 h-3.5" />
              <span>Accueil</span>
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRightIcon className="w-3.5 h-3.5 text-white/40" />
                {crumb.href ? (
                  <Link
                    href={`/${locale}${crumb.href}`}
                    className="text-white/70 hover:text-white text-sm transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white text-sm font-semibold">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </motion.nav>
        )}

        {/* Badge */}
        {badge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
            style={{ backgroundColor: badgeColor + "33", color: badgeColor, border: `1px solid ${badgeColor}55` }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: badgeColor }}
            />
            {badge}
          </motion.div>
        )}

        {/* Titre */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 drop-shadow-lg"
        >
          {title}
        </motion.h1>

        {/* Sous-titre */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}

        {/* Slot enfant (boutons, etc.) */}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-6"
          >
            {children}
          </motion.div>
        )}
      </div>

      {/* Bord bas arrondi */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-white"
        style={{ borderRadius: "2rem 2rem 0 0" }} />
    </section>
  );
}
