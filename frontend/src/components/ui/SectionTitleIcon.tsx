"use client";

import { motion } from "framer-motion";
import { Ico, type IcoName } from "@/components/icons/AgriIcons";
import { cn } from "@/lib/utils";

/**
 * SectionTitleIcon — badge minimaliste placé en début de ligne des titres
 * de section, avec une entrée fondu + léger slide au scroll (smooth,
 * ressort doux, se joue une seule fois par section).
 *
 * Usage :
 *   <h2 className="section-title flex items-center gap-3">
 *     <SectionTitleIcon icon="Sprout" />
 *     Nos semences & plants
 *   </h2>
 */

const SIZE_MAP = {
  sm: { box: 32, ico: 16 },
  md: { box: 42, ico: 20 },
  lg: { box: 52, ico: 25 },
} as const;

export function SectionTitleIcon({
  icon,
  size = "md",
  tone = "solid",
  color,
  className,
}: {
  icon: IcoName;
  size?: keyof typeof SIZE_MAP;
  /** solid = pastille pleine couleur / outline = contour fin, fond transparent */
  tone?: "solid" | "outline";
  /** couleur d'accent (défaut : vert forêt marque) */
  color?: string;
  className?: string;
}) {
  const Icon = Ico[icon];
  const { box, ico } = SIZE_MAP[size];
  const accent = color ?? "#2f7a4d";

  return (
    <motion.span
      aria-hidden="true"
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full", className)}
      style={{
        width: box,
        height: box,
        background: tone === "solid" ? `linear-gradient(145deg, ${accent}, #1c4d30)` : "transparent",
        border: tone === "outline" ? `1.6px solid ${accent}` : "none",
        color: tone === "solid" ? "#fff" : accent,
        boxShadow: tone === "solid" ? "0 4px 14px rgba(28,77,48,0.28)" : "none",
      }}
      initial={{ opacity: 0, x: -14, scale: 0.85 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <Icon style={{ width: ico, height: ico }} />
    </motion.span>
  );
}

/**
 * SectionTitleLine — enveloppe un h2/h3 existant : place l'icône en début
 * de ligne et fait glisser tout le bloc (icône + texte) au scroll, avec un
 * léger décalage temporel entre l'icône et le texte pour un effet "smooth"
 * plus riche qu'un simple fade.
 */
export function SectionTitleLine({
  icon,
  size = "md",
  tone = "solid",
  color,
  align = "left",
  gap = "gap-3",
  className,
  children,
}: {
  icon: IcoName;
  size?: keyof typeof SIZE_MAP;
  tone?: "solid" | "outline";
  color?: string;
  align?: "left" | "center";
  gap?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center",
        gap,
        align === "center" ? "justify-center" : "justify-start",
        className
      )}
    >
      <SectionTitleIcon icon={icon} size={size} tone={tone} color={color} />
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}