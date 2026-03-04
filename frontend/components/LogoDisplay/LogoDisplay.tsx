// ══════════════════════════════════════════════════════════════════════════════
// LOGO DISPLAY COMPONENT — Affichage professionnel du logo avec animations
// ══════════════════════════════════════════════════════════════════════════════

"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { COLORS, hexToRgba } from "@/lib/colors";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LogoDisplayProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  variant?: 'default' | 'hero' | 'navbar' | 'footer';
  withGlow?: boolean;
  withBackground?: boolean;
  backgroundColor?: string;
  className?: string;
}

// ─── Composant principal ──────────────────────────────────────────────────────
export function LogoDisplay({
  src,
  alt,
  width,
  height,
  variant = 'default',
  withGlow = false,
  withBackground = false,
  backgroundColor = COLORS.neutral.white,
  className = '',
}: LogoDisplayProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Dimensions selon la variante
  const dimensions = {
    default: { w: 200, h: 80 },
    hero: { w: 400, h: 160 },
    navbar: { w: 180, h: 60 },
    footer: { w: 150, h: 60 },
  };

  const { w, h } = dimensions[variant];
  const finalWidth = width || w;
  const finalHeight = height || h;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.97 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`relative inline-block ${className}`}
      style={{
        width: finalWidth,
        height: finalHeight,
      }}
    >
      {/* Background avec ombre si activé */}
      {withBackground && (
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            backgroundColor: backgroundColor,
            boxShadow: withGlow
              ? `0 8px 32px ${hexToRgba(COLORS.espaceVert.forest, 0.15)}, 0 0 60px ${hexToRgba(COLORS.espaceVert.leaf, 0.1)}`
              : `0 4px 20px ${hexToRgba(COLORS.neutral.gray400, 0.1)}`,
          }}
        />
      )}

      {/* Glow effect */}
      {withGlow && (
        <motion.div
          animate={{
            opacity: [0.4, 0.7, 0.4],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-2xl blur-xl"
          style={{
            background: `radial-gradient(circle at center, ${hexToRgba(COLORS.espaceVert.leaf, 0.3)}, transparent 70%)`,
          }}
        />
      )}

      {/* Logo Image */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          onLoad={() => setIsLoaded(true)}
          priority={variant === 'hero' || variant === 'navbar'}
        />
      </div>

      {/* Loading skeleton */}
      {!isLoaded && (
        <div
          className="absolute inset-0 rounded-2xl animate-pulse"
          style={{ backgroundColor: COLORS.neutral.gray100 }}
        />
      )}
    </motion.div>
  );
}

// ─── Composant Double Logo (Espace Vert + Fertivert) ─────────────────────────
interface DualLogoDisplayProps {
  primaryLogo: string;
  secondaryLogo: string;
  primaryAlt: string;
  secondaryAlt: string;
  layout?: 'horizontal' | 'vertical';
  showDivider?: boolean;
  className?: string;
}

export function DualLogoDisplay({
  primaryLogo,
  secondaryLogo,
  primaryAlt,
  secondaryAlt,
  layout = 'horizontal',
  showDivider = true,
  className = '',
}: DualLogoDisplayProps) {
  return (
    <div
      className={`flex ${layout === 'horizontal' ? 'flex-row items-center' : 'flex-col items-start'} gap-6 ${className}`}
    >
      {/* Logo principal (Espace Vert) */}
      <LogoDisplay
        src={primaryLogo}
        alt={primaryAlt}
        variant="navbar"
        withBackground
        withGlow
      />

      {/* Divider */}
      {showDivider && (
        <div
          className={layout === 'horizontal' ? 'h-12 w-px' : 'w-full h-px'}
          style={{
            background: `linear-gradient(${layout === 'horizontal' ? 'to bottom' : 'to right'}, transparent, ${COLORS.neutral.gray300}, transparent)`,
          }}
        />
      )}

      {/* Logo secondaire (Fertivert) */}
      <LogoDisplay
        src={secondaryLogo}
        alt={secondaryAlt}
        variant="navbar"
        withBackground
        backgroundColor={COLORS.fertivert.pale}
      />
    </div>
  );
}

export default LogoDisplay;