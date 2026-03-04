// ══════════════════════════════════════════════════════════════════════════════
// FILTER BAR COMPONENT — Barre de filtrage sticky en haut avec hover
// Compatible mobile et desktop — Full responsive
// ══════════════════════════════════════════════════════════════════════════════

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, ChevronDownIcon, FunnelIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { COLORS, hexToRgba } from "@/lib/colors";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FilterOption {
  id: string;
  label: string;
  count?: number;
  subcategories?: FilterOption[];
}

interface FilterBarProps {
  logo?: "/logos/LOGO FERTIVERT copy.webp"; // URL du logo à afficher
  logoAlt?: string;
  categories: FilterOption[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onReset: () => void;
  accentColor?: string; // Couleur d'accent personnalisée
  showProductCount?: boolean;
}

// ─── Composant principal ──────────────────────────────────────────────────────
export function FilterBar({
  logo,
  logoAlt = "Logo",
  categories,
  selectedCategoryId,
  onSelectCategory,
  onReset,
  accentColor = COLORS.fertivert.primary,
  showProductCount = true,
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Détection sticky au scroll
  useEffect(() => {
    const handleScroll = () => {
      if (barRef.current) {
        const rect = barRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fermer le menu au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isExpanded]);

  const hasActiveFilter = selectedCategoryId !== null;

  return (
    <div
      ref={barRef}
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isSticky ? "shadow-lg" : "shadow-md"
      }`}
      style={{
        backgroundColor: COLORS.neutral.white,
        borderBottom: `1px solid ${COLORS.neutral.gray200}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* ─── LOGO ─────────────────────────────────────────────────── */}
          {logo && (
            <div className="flex-shrink-0">
              <div className="relative h-10 w-32 sm:h-12 sm:w-40 lg:h-14 lg:w-48">
                <Image
                  src={logo}
                  alt={logoAlt}
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </div>
          )}

          {/* ─── DESKTOP: Filtres en ligne ───────────────────────────── */}
          <div className="hidden lg:flex items-center gap-2 flex-1 ml-8">
            {/* Bouton "Tous les produits" */}
            <button
              onClick={() => onSelectCategory(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: !hasActiveFilter
                  ? accentColor
                  : hexToRgba(accentColor, 0.06),
                color: !hasActiveFilter ? COLORS.neutral.white : COLORS.neutral.gray600,
                border: `1px solid ${!hasActiveFilter ? accentColor : 'transparent'}`,
              }}
            >
              <FunnelIcon className="w-4 h-4" />
              Tous les produits
            </button>

            {/* Catégories */}
            {categories.map((category) => {
              const isActive = selectedCategoryId === category.id;
              const isHovered = hoveredId === category.id;

              return (
                <div key={category.id} className="relative">
                  <button
                    onClick={() => onSelectCategory(category.id)}
                    onMouseEnter={() => setHoveredId(category.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
                    style={{
                      backgroundColor: isActive
                        ? accentColor
                        : isHovered
                        ? hexToRgba(accentColor, 0.08)
                        : 'transparent',
                      color: isActive ? COLORS.neutral.white : COLORS.neutral.gray700,
                      border: `1px solid ${isActive ? accentColor : 'transparent'}`,
                    }}
                  >
                    {category.label}
                    {showProductCount && category.count && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: isActive
                            ? hexToRgba(COLORS.neutral.white, 0.2)
                            : hexToRgba(accentColor, 0.15),
                          color: isActive ? COLORS.neutral.white : accentColor,
                        }}
                      >
                        {category.count}
                      </span>
                    )}
                  </button>

                  {/* Tooltip hover avec sous-catégories */}
                  <AnimatePresence>
                    {isHovered && category.subcategories && category.subcategories.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 min-w-[200px] rounded-xl shadow-2xl overflow-hidden"
                        style={{
                          backgroundColor: COLORS.neutral.white,
                          border: `1px solid ${COLORS.neutral.gray200}`,
                        }}
                      >
                        <div
                          className="px-3 py-2 text-xs font-black uppercase tracking-wider"
                          style={{
                            backgroundColor: hexToRgba(accentColor, 0.08),
                            color: COLORS.neutral.gray500,
                          }}
                        >
                          Sous-catégories
                        </div>
                        <div className="p-2 space-y-1">
                          {category.subcategories.map((sub) => (
                            <button
                              key={sub.id}
                              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all hover:translate-x-1"
                              style={{
                                color: COLORS.neutral.gray700,
                                backgroundColor: 'transparent',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = hexToRgba(accentColor, 0.08);
                                e.currentTarget.style.color = accentColor;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = COLORS.neutral.gray700;
                              }}
                            >
                              {sub.label}
                              {showProductCount && sub.count && (
                                <span className="ml-2 text-xs opacity-60">({sub.count})</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* ─── MOBILE: Bouton hamburger ────────────────────────────── */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              backgroundColor: hexToRgba(accentColor, 0.1),
              color: accentColor,
            }}
          >
            <FunnelIcon className="w-5 h-5" />
            Filtres
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>

          {/* ─── Bouton Reset (si filtre actif) ──────────────────────── */}
          {hasActiveFilter && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold transition-all hover:opacity-80 ml-2"
              style={{
                backgroundColor: hexToRgba(accentColor, 0.15),
                color: accentColor,
              }}
            >
              <XMarkIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Effacer</span>
            </button>
          )}
        </div>

        {/* ─── MOBILE: Menu déroulant ──────────────────────────────────── */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2 border-t" style={{ borderColor: COLORS.neutral.gray200 }}>
                {/* Tous les produits */}
                <button
                  onClick={() => {
                    onSelectCategory(null);
                    setIsExpanded(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: !hasActiveFilter
                      ? accentColor
                      : hexToRgba(accentColor, 0.06),
                    color: !hasActiveFilter ? COLORS.neutral.white : COLORS.neutral.gray700,
                  }}
                >
                  <span className="flex items-center gap-2">
                    <FunnelIcon className="w-4 h-4" />
                    Tous les produits
                  </span>
                </button>

                {/* Catégories */}
                {categories.map((category) => {
                  const isActive = selectedCategoryId === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        onSelectCategory(category.id);
                        setIsExpanded(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        backgroundColor: isActive
                          ? accentColor
                          : hexToRgba(accentColor, 0.06),
                        color: isActive ? COLORS.neutral.white : COLORS.neutral.gray700,
                      }}
                    >
                      <span>{category.label}</span>
                      {showProductCount && category.count && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: isActive
                              ? hexToRgba(COLORS.neutral.white, 0.2)
                              : hexToRgba(accentColor, 0.15),
                            color: isActive ? COLORS.neutral.white : accentColor,
                          }}
                        >
                          {category.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default FilterBar;