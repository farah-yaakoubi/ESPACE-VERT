"use client";
import { getActivityHrefBySlug } from "@/lib/activity-links";
import { localeLabels, localeNames, locales } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ProduitSearch } from "./ProduitSearch";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Ico } from "@/components/icons/AgriIcons";

const NAV_H = 80;
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const C = {
  sage: "#2e7d4f",
  sageDk: "#1b5e38",
  sageMd: "#5bab79",
  sageLt: "#dff2e8",
  logo: "#7dc040",
  logoDk: "#5f972d",
  logoLt: "#eef8e4",
  logoBorder: "#cfe5b5",
  sagePastel: "#e8f5ee",
  sagePastel2: "#c8eada",
  sageIcon: "#a8d5b8",
  stone: "#f6f4f0",
  stone2: "#ede9e3",
  line: "rgba(46,125,79,0.12)",
  ink: "#111816",
  ink2: "#3d5248",
  ink3: "#8da898",
  ink4: "#bbd4c4",
  border: "#c9e0d3",
  gradA: "#1b5e38",
  gradB: "#38a169",
  gradC: "#6fcf97",
  ddBg: "#f4faf7",
  ddBgSide: "linear-gradient(180deg,#edf8f2,#dff2e8 60%,#caebd8 100%)",
  darkMenuBg: "#162117",
  darkMenuBorder: "rgba(255,255,255,0.07)",
  darkInk: "#e8f0ea",
  darkInk2: "rgba(232,240,234,0.7)",
  darkInk3: "rgba(232,240,234,0.4)",
};

const TY = {
  navLink: {
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: "0.02em",
  } as React.CSSProperties,
  navLinkOn: {
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: "0.02em",
  } as React.CSSProperties,
  ddItemName: {
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: "-0.01em",
  } as React.CSSProperties,
  ddItemDesc: {
    fontSize: 12,
    fontWeight: 400,
    letterSpacing: "0em",
  } as React.CSSProperties,
  secLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
  } as React.CSSProperties,
  cta: {
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: "0.02em",
  } as React.CSSProperties,
  mobileLink: {
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: "0.01em",
  } as React.CSSProperties,
};

interface CatItem {
  id_categorie: number;
  nom: string;
  slug: string;
  parent_id: number | null;
  ordre: number;
  sous_cats?: CatItem[];
}
interface Activite {
  id_activite: number;
  nom: string;
  slug: string;
  description: string | null;
  image: string | null;
  categories?: CatItem[];
}
interface Marque {
  id_marque: number;
  nom: string;
  slug: string;
  logo: string | null;
  description: string | null;
  categories?: CatItem[];
  type_marque: "groupe" | "partenaire";
}

const SLUGS_GROUPE = new Set([
  "baddar-semences",
  "matar",
  "fertivert",
  "pulvert",
]);

/* ── Classification des marques par activité ───────────────────────────── */
const BRAND_GROUPS: { label: string; match: string[] }[] = [
  { label: "Semences & Plants", match: [
    "baddarsemences", "caussadesemences", "coraseeds", "elornplants", "griffaton",
    "lidea", "nexeeds", "sem", "seminart", "serviceplus", "southernseed",
    "teraseeds", "turflinebydlf", "topgreen",
  ]},
  { label: "Jardinage & Machinisme", match: [
    "weibang", "wiedenmann", "staub", "etesia", "active", "agricut", "outilswolf",
  ]},
  { label: "Irrigation", match: ["matar", "rivulis", "idroland", "zeta"] },
  { label: "Pulvérisation", match: ["pulvert"] },
  { label: "Fertilisation", match: ["fertivert"] },
];

function normKey(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function getBrandGroupLabel(m: Marque): string {
  const slugKey = normKey(m.slug);
  const nameKey = normKey(m.nom);
  for (const g of BRAND_GROUPS) {
    if (g.match.some((k) => k === slugKey || k === nameKey)) return g.label;
  }
  return "Autres marques";
}

function TreePines({
  color = "#e2ede7",
  h = 60,
}: {
  color?: string;
  h?: number;
}) {
  const pines = [
    { x: 0, w: 18, h: 48 },
    { x: 14, w: 22, h: 60 },
    { x: 30, w: 16, h: 42 },
    { x: 44, w: 24, h: 64 },
    { x: 62, w: 18, h: 50 },
    { x: 76, w: 20, h: 55 },
    { x: 92, w: 15, h: 38 },
    { x: 104, w: 26, h: 68 },
    { x: 124, w: 18, h: 46 },
    { x: 138, w: 22, h: 58 },
    { x: 154, w: 16, h: 40 },
    { x: 166, w: 24, h: 62 },
    { x: 184, w: 20, h: 52 },
    { x: 200, w: 18, h: 44 },
    { x: 214, w: 26, h: 70 },
    { x: 234, w: 16, h: 36 },
    { x: 246, w: 22, h: 56 },
    { x: 262, w: 18, h: 48 },
    { x: 276, w: 24, h: 64 },
    { x: 294, w: 20, h: 50 },
  ];
  return (
    <svg
      viewBox={`0 0 320 ${h}`}
      preserveAspectRatio="xMidYMax meet"
      style={{ width: "100%", height: h, display: "block" }}
      aria-hidden="true"
    >
      {pines.map((p, i) => {
        const tw = p.w * 0.22,
          th = p.h * 0.18,
          tx = p.x + p.w / 2 - tw / 2;
        return (
          <g key={i} fill={color}>
            <polygon
              points={`${p.x + p.w / 2},${h - p.h} ${p.x},${h - th} ${p.x + p.w},${h - th}`}
            />
            <rect x={tx} y={h - th} width={tw} height={th} />
          </g>
        );
      })}
    </svg>
  );
}

function useHover(delay = 180) {
  const [open, setOpen] = useState(false);
  const t = useRef<any>(null);
  const show = useCallback(() => {
    t.current && clearTimeout(t.current);
    setOpen(true);
  }, []);
  const hide = useCallback(() => {
    t.current = setTimeout(() => setOpen(false), delay);
  }, [delay]);
  const keep = useCallback(() => {
    t.current && clearTimeout(t.current);
  }, []);
  useEffect(
    () => () => {
      t.current && clearTimeout(t.current);
    },
    [],
  );
  return { open, show, hide, keep };
}

/* ── Palette icônes — charte stricte : blanc + les 2 verts du logo ────────── */
const BRAND_DARK = "#0f693a";
const BRAND_LIME = "#8bc541";
const BRAND_BG = "#eef8e4";

const ACT_PALETTE = [
  { accent: BRAND_DARK, bg: BRAND_BG, Icon: Ico.SeedBag },
  { accent: BRAND_DARK, bg: BRAND_BG, Icon: Ico.HoseCoil },
  { accent: BRAND_DARK, bg: BRAND_BG, Icon: Ico.WateringCan },
  { accent: BRAND_DARK, bg: BRAND_BG, Icon: Ico.Spray },
  { accent: BRAND_DARK, bg: BRAND_BG, Icon: Ico.Tractor },
];

function getActVisual(a: Activite, idx: number) {
  const s = `${a.slug ?? ""} ${a.nom ?? ""}`.toLowerCase();
  if (s.includes("semence") || s.includes("plant")) return ACT_PALETTE[0];
  if (s.includes("irrigation")) return ACT_PALETTE[1];
  if (s.includes("fertili")) return ACT_PALETTE[2];
  if (s.includes("pulveris") || s.includes("pulvér") || s.includes("pulver")) return ACT_PALETTE[3];
  if (s.includes("jardinage") || s.includes("machin")) return ACT_PALETTE[4];
  return ACT_PALETTE[idx % ACT_PALETTE.length];
}

/* ── ActivitesDropdown — design pro vert/blanc ─────────────────────────────── */
function ActivitesDropdown({
  activites,
  onClose,
  isDark,
}: {
  activites: Activite[];
  onClose: () => void;
  isDark: boolean;
}) {
  const { t } = useI18n();
  const [selectedAct, setSelectedAct] = useState<number | null>(null);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [swipeDir, setSwipeDir] = useState<1 | -1>(1);
  const [listHovering, setListHovering] = useState(false);
  const [col2Top, setCol2Top] = useState(0);
  const [col2MaxHeight, setCol2MaxHeight] = useState<number | undefined>(undefined);

  const col1ContainerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const act = activites.find((a) => a.id_activite === selectedAct);
  const hasCategories = (act?.categories?.length ?? 0) > 0;

  // Aligne le haut de la colonne 2 sur le haut de l'activité survolée dans la colonne 1.
  // La borne n'est PAS la hauteur de la colonne 1 (sinon, sur la dernière activité, la
  // colonne 2 se retrouve poussée AU-DESSUS du point survolé, cassant l'alignement) :
  // la vraie limite, c'est le bas visible de l'écran. On aligne toujours sur le survol,
  // et on ne borne/scrolle que si ça dépasserait réellement le viewport.
  const MIN_COL2_VISIBLE = 160;
  const SAFE_BOTTOM_MARGIN = 24;

  useEffect(() => {
    if (selectedAct == null) return;

    const recompute = () => {
      const containerEl = col1ContainerRef.current;
      const itemEl = itemRefs.current[selectedAct];
      if (!containerEl || !itemEl) return;
      const containerTop = containerEl.getBoundingClientRect().top;
      const itemTop = itemEl.getBoundingClientRect().top;
      const rawTop = Math.max(0, itemTop - containerTop);

      const availableBelow = window.innerHeight - containerTop - SAFE_BOTTOM_MARGIN;
      const maxTop = Math.max(0, availableBelow - MIN_COL2_VISIBLE);
      const top = Math.min(rawTop, maxTop);

      setCol2Top(top);
      setCol2MaxHeight(Math.max(MIN_COL2_VISIBLE, availableBelow - top));
    };

    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [selectedAct]);

  const handleSelectAct = (id: number) => {
    setListHovering(true);
    if (selectedAct !== null) {
      const prevIdx = activites.findIndex(a => a.id_activite === selectedAct);
      const nextIdx = activites.findIndex(a => a.id_activite === id);
      setSwipeDir(nextIdx > prevIdx ? 1 : -1);
    }
    setSelectedAct(id);
  };

  useEffect(() => { setSelectedCat(null); }, [selectedAct]);

  const CAT_ICONS = [Ico.Sprout, Ico.GrassTuft, Ico.Cattail, Ico.Clover, Ico.Sunflower, Ico.Carrot];

  const COL1 = 300;
  const COL2 = 380;

  const actVisual = act ? getActVisual(act, activites.findIndex(x => x.id_activite === act.id_activite)) : ACT_PALETTE[0];

  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      width: COL1 + (hasCategories ? COL2 : 0),
      transition: "width 0.22s cubic-bezier(.4,0,.2,1)",
      borderRadius: 20,
      overflow: "hidden",
      background: "#eef8e4",
      boxShadow: "0 28px 64px rgba(31,26,14,0.14), 0 0 0 1px rgba(207,229,181,0.7)",
    }}>

      {/* ── COL 1 — liste activités — cartes "sachet de graines" ── */}
      <div
        ref={col1ContainerRef}
        style={{
          width: COL1, flexShrink: 0,
          display: "flex", flexDirection: "column",
          padding: "8px 8px",
        }}
        onMouseLeave={() => setListHovering(false)}
      >
        {activites.length === 0 ? (
          <p style={{ padding: "10px 12px", color: "#9ca3af", fontSize: 13 }}>
            {t("nav.loading")}
          </p>
        ) : (
          activites.map((a, i) => {
            const on = selectedAct === a.id_activite;
            const dim = listHovering && !on;
            const href = getActivityHrefBySlug(a.slug);
            const v = getActVisual(a, i);
            const Icon = v.Icon;
            const isImgUrl = !!a.image && (a.image.startsWith("/") || a.image.startsWith("http"));
            const isEmoji = !!a.image && !isImgUrl;
            return (
              <motion.div
                key={a.id_activite}
                ref={(el) => { itemRefs.current[a.id_activite] = el as HTMLDivElement | null; }}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
              >
                <button
                  type="button"
                  onMouseEnter={() => handleSelectAct(a.id_activite)}
                  onClick={() => { onClose(); window.location.href = href; }}
                  style={{
                    display: "flex", width: "100%", alignItems: "stretch", gap: 12,
                    padding: "10px 12px",
                    margin: "3px 0",
                    borderRadius: 16,
                    cursor: "pointer",
                    border: `1px solid ${on ? `${v.accent}3a` : "#eee7d3"}`,
                    borderLeft: `4px solid ${on ? v.accent : "#eee7d3"}`,
                    fontFamily: "inherit", textAlign: "left",
                    background: on ? "#fff" : "#fffdf9",
                    boxShadow: on ? `0 10px 22px ${v.accent}26` : "0 1px 2px rgba(31,26,14,0.03)",
                    opacity: dim ? 0.35 : 1,
                    filter: dim ? "grayscale(45%)" : "none",
                    transform: dim ? "scale(0.97)" : on ? "translateX(2px) scale(1)" : "scale(1)",
                    transition: "opacity 0.22s ease, filter 0.22s ease, transform 0.18s ease, background 0.15s ease, border-color 0.15s ease, box-shadow 0.18s ease",
                    position: "relative",
                  }}
                >
                  {/* Icône — hauteur "auto" pour épouser exactement la hauteur du bloc texte (titre + description) */}
                  <div style={{
                    width: 44, height: "auto", alignSelf: "stretch", borderRadius: 13, flexShrink: 0,
                    background: on
                      ? `radial-gradient(circle at 30% 25%, ${v.accent}, ${v.accent}dd)`
                      : `linear-gradient(155deg, ${v.bg}, #fff)`,
                    border: on ? "none" : `1px solid ${v.accent}22`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden",
                    transition: "all 0.18s",
                    transform: on ? "scale(1.05) rotate(-2deg)" : "scale(1)",
                  }}>
                    {isImgUrl ? (
                      <img src={a.image!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : isEmoji ? (
                      <span style={{ fontSize: 21, lineHeight: 1 }}>{a.image}</span>
                    ) : (
                      <Icon style={{ width: 22, height: 22, color: on ? "#fff" : v.accent }} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      display: "block", fontSize: 15.5, fontWeight: 600, lineHeight: 1.25,
                      color: "#000", whiteSpace: "normal", wordBreak: "break-word",
                      letterSpacing: "-0.01em",
                    }}>
                      {a.nom}
                    </span>
                    {a.description ? (
                      <span style={{
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                        fontSize: 11.5, fontWeight: 400, lineHeight: 1.35,
                        color: "#948d78", marginTop: 2, overflow: "hidden",
                      } as React.CSSProperties}>
                        {a.description}
                      </span>
                    ) : (
                      <span style={{ display: "block", fontSize: 11, fontWeight: 500,
                        color: "#b7ae90", marginTop: 2, letterSpacing: "0.02em" }}>
                        Découvrir la gamme
                      </span>
                    )}
                  </div>

                  {(a.categories?.length ?? 0) > 0 && (
                    <span style={{
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                      alignSelf: "center",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: on ? v.accent : "transparent",
                      transition: "all 0.15s",
                    }}>
                      <Ico.ChevR style={{
                        width: 11, height: 11,
                        color: on ? "#fff" : v.accent,
                      }} />
                    </span>
                  )}
                </button>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ── COL 2 — catégories en LISTE, sous-catégories dépliées sous chacune ── */}
      {hasCategories && (
        <div style={{
          width: COL2, flexShrink: 0,
          height: "auto", alignSelf: "flex-start",
          display: "flex", flexDirection: "column",
          marginTop: col2Top,
          maxHeight: col2MaxHeight,
          transition: "margin-top 0.22s cubic-bezier(.4,0,.2,1), max-height 0.22s cubic-bezier(.4,0,.2,1)",
          overflow: "hidden",
        }}>
          <AnimatePresence mode="wait" custom={swipeDir}>
            {act && (
              <motion.div
                key={act.id_activite}
                custom={swipeDir}
                initial={{ opacity: 0, y: swipeDir * 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: swipeDir * -12 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                style={{ display: "flex", flexDirection: "column", minHeight: 0, maxHeight: col2MaxHeight }}
              >
                <div
                  style={{
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "8px 8px 8px",
                    scrollbarWidth: "thin",
                  }}
                >
                  {act.categories?.map((c, ci) => {
                    const expanded = selectedCat === c.slug;
                    const hasSub = (c.sous_cats?.length ?? 0) > 0;
                    const CatIcon = CAT_ICONS[ci % CAT_ICONS.length];
                    return (
                      <motion.div
                        key={c.slug}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: ci * 0.03 }}
                        style={{ marginBottom: 6 }}
                      >
                        <div style={{
                          borderRadius: 14,
                          border: `1px solid ${expanded ? BRAND_DARK : "#efe8d6"}`,
                          background: "#fff",
                          overflow: "hidden",
                          boxShadow: expanded ? `0 8px 18px ${BRAND_DARK}1c` : "0 1px 2px rgba(31,26,14,0.03)",
                          transition: "border-color 0.16s ease, box-shadow 0.16s ease",
                        }}>
                          <div style={{ position: "relative", overflow: "hidden" }}>
                            {expanded && (
                              <motion.div
                                layoutId="catHoverSwipe"
                                transition={{ type: "spring", stiffness: 420, damping: 36 }}
                                style={{
                                  position: "absolute", inset: 0,
                                  background: `linear-gradient(115deg, ${BRAND_DARK}1a 0%, ${BRAND_LIME}26 100%)`,
                                }}
                              />
                            )}
                            <button
                              type="button"
                              onMouseEnter={() => { if (hasSub) setSelectedCat(c.slug); }}
                              onClick={() => { onClose(); window.location.href = `/activites/${act.slug}?cat=${c.id_categorie}`; }}
                              style={{
                                position: "relative", zIndex: 1,
                                display: "flex", width: "100%", alignItems: "center", gap: 10,
                                padding: "10px 12px",
                                cursor: "pointer", border: "none", fontFamily: "inherit",
                                textAlign: "left", background: "transparent",
                              }}
                            >
                              <div style={{
                                width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                                background: expanded ? "#fff" : `${BRAND_LIME}30`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "background 0.15s ease",
                              }}>
                                <CatIcon style={{ width: 15, height: 15, color: BRAND_DARK }} />
                              </div>
                              <span style={{
                                fontSize: 14, fontWeight: 500, lineHeight: 1.3,
                                color: "#000", flex: 1,
                                whiteSpace: "normal", wordBreak: "break-word",
                              }}>
                                {c.nom}
                              </span>
                              {hasSub && (
                                <span style={{
                                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  background: expanded ? BRAND_DARK : `${BRAND_DARK}14`,
                                  transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                                  transition: "all 0.18s ease",
                                }}>
                                  <Ico.ChevR style={{
                                    width: 10, height: 10,
                                    color: expanded ? "#fff" : BRAND_DARK,
                                  }} />
                                </span>
                              )}
                            </button>
                          </div>

                          {/* Sous-catégories dépliées sous la catégorie */}
                          <AnimatePresence initial={false}>
                            {hasSub && expanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                                style={{ overflow: "hidden" }}
                              >
                                <div style={{
                                  padding: "2px 10px 8px 46px",
                                  display: "flex", flexDirection: "column", gap: 2,
                                }}>
                                  {c.sous_cats!.map((sc, si) => (
                                    <Link
                                      key={sc.slug}
                                      href={`/activites/${act.slug}?cat=${sc.id_categorie}`}
                                      onClick={onClose}
                                      style={{
                                        display: "flex", alignItems: "center", gap: 7,
                                        padding: "6px 8px", borderRadius: 8,
                                        textDecoration: "none",
                                        color: "#5a6357", transition: "all 0.12s",
                                      }}
                                      onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLElement).style.background = actVisual.bg;
                                        (e.currentTarget as HTMLElement).style.color = actVisual.accent;
                                      }}
                                      onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLElement).style.background = "transparent";
                                        (e.currentTarget as HTMLElement).style.color = "#5a6357";
                                      }}
                                    >
                                      <span style={{
                                        width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
                                        background: BRAND_LIME, display: "inline-block",
                                      }} />
                                      <span style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.4,
                                        whiteSpace: "normal", wordBreak: "break-word" }}>
                                        {sc.nom}
                                      </span>
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* ── MarquesDropdown — LOGOS HORIZONTAUX avec zoom au survol ─────── */
function MarquesDropdown({
  marques,
  onClose,
  isDark,
}: {
  marques: Marque[];
  onClose: () => void;
  isDark: boolean;
}) {
  const isGroup = (m: Marque) => SLUGS_GROUPE.has(m.slug);
  const groupedEntries = BRAND_GROUPS
    .map((g) => ({ label: g.label, items: marques.filter((m) => getBrandGroupLabel(m) === g.label) }))
    .filter((g) => g.items.length > 0);
  const others = marques.filter((m) => getBrandGroupLabel(m) === "Autres marques");
  if (others.length > 0) groupedEntries.push({ label: "Autres marques", items: others });

  const titleColor = "#948d78";
  const textColor = "#20291f";
  const col1W = 660;

  return (
    <div
      style={{
        display: "flex",
        background: "#eef8e4",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 28px 64px rgba(31,26,14,0.14), 0 0 0 1px rgba(207,229,181,0.7)",
        width: col1W,
      }}
    >
      <div
        style={{
          width: col1W,
          flexShrink: 0,
          padding: "16px",
          maxHeight: "calc(100vh - 150px)",
          overflowY: "auto",
        }}
      >
        {marques.length === 0 ? (
          <p style={{ padding: "10px 14px", ...TY.ddItemDesc, color: titleColor }}>
            Chargement...
          </p>
        ) : (
          groupedEntries.map((group, gi) => (
            <div key={group.label} style={{ marginBottom: gi < groupedEntries.length - 1 ? 16 : 4 }}>
              {/* Étiquette de classification — pas d'entête, juste un repère discret */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 4px 8px" }}>
                <span style={{
                  width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
                  background: BRAND_LIME, display: "inline-block",
                }} />
                <span style={{
                  fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: BRAND_DARK,
                }}>
                  {group.label}
                </span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {group.items.map((m, i) => (
                  <motion.div
                    key={m.id_marque}
                    initial={{ opacity: 0, x: -3 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    whileHover={{ y: -2 }}
                    style={{ width: 138 }}
                  >
                    <Link
                      href={`/marques/${m.slug}`}
                      onClick={onClose}
                      style={{
                        display: "flex",
                        position: "relative",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        gap: 6,
                        width: "100%",
                        padding: "8px 6px",
                        borderRadius: 12,
                        cursor: "pointer",
                        textAlign: "center",
                        textDecoration: "none",
                        transition: "background 0.14s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "#ffffffb0";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      {isGroup(m) && (
                        <span style={{
                          position: "absolute", top: 4, right: 4,
                          fontSize: 8.5, fontWeight: 800, letterSpacing: "0.04em",
                          textTransform: "uppercase", color: "#fff",
                          background: BRAND_DARK, borderRadius: 99,
                          padding: "2px 6px", lineHeight: 1.4,
                        }}>
                          Groupe
                        </span>
                      )}

                      {/* Logo affiché tel quel : sans cadre, sans fond coloré */}
                      <div
                        style={{
                          width: "100%",
                          height: 56,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {m.logo ? (
                          <Image
                            src={m.logo}
                            alt={m.nom}
                            width={112}
                            height={56}
                            style={{
                              objectFit: "contain",
                              width: "100%",
                              height: "100%",
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: BRAND_DARK,
                              textAlign: "center",
                            }}
                          >
                            {m.nom.slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          ...TY.ddItemName,
                          fontSize: 12,
                          color: textColor,
                          margin: 0,
                          width: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {m.nom}
                      </p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
        <Link
          href="/marques"
          onClick={onClose}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            marginTop: 8,
            padding: "10px 14px",
            borderRadius: 12,
            background: BRAND_BG,
            color: BRAND_DARK,
            fontSize: 12,
            fontWeight: 700,
            textDecoration: "none",
            border: `1px solid ${BRAND_DARK}22`,
          }}
        >
          Voir toutes les marques
          <Ico.ChevR style={{ width: 9, height: 9 }} />
        </Link>
      </div>
    </div>
  );
}

/* ── LangDropdown — sélecteur de langue avec icône globe ─────────────────── */
function LangDropdown({ onHero }: { onHero: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const btnColor = onHero ? "rgba(255,255,255,0.9)" : C.ink;
  const borderColor = onHero ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.1)";
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        aria-label={t("lang.label")}
        onClick={() => setOpen(v => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "7px 10px", borderRadius: 10, cursor: "pointer",
          background: onHero ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.85)",
          border: `1.5px solid ${borderColor}`,
          color: btnColor, fontWeight: 700, fontSize: 12,
          backdropFilter: "blur(8px)",
          transition: "all 0.15s",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        <span style={{ letterSpacing: "0.04em" }}>{locale.toUpperCase()}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", opacity: 0.6 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: "#fff", borderRadius: 12, overflow: "hidden",
          border: "1.5px solid rgba(0,0,0,0.08)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          minWidth: 110, zIndex: 100,
        }}>
          {locales.map(item => (
            <button
              key={item}
              type="button"
              onClick={() => { setLocale(item); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                width: "100%", padding: "9px 14px",
                background: locale === item ? "#edf8f2" : "transparent",
                border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: locale === item ? 700 : 500,
                color: locale === item ? C.sageDk : C.ink,
                transition: "background 0.1s",
              }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: 6, background: locale === item ? C.sage : "#f0f0f0",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 900, color: locale === item ? "#fff" : C.ink2,
                flexShrink: 0,
              }}>{localeLabels[item]}</span>
              {localeNames[item]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Navbar principale ────────────────────────────────────────── */
export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, t } = useI18n();
  const isHome = pathname === "/";
  const isDark = false;

  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSec, setMobileSec] = useState<string | null>(null);
  const [logoErr, setLogoErr] = useState(false);
  const [activites, setActivites] = useState<Activite[]>([]);
  const [marques, setMarques] = useState<Marque[]>([]);
  const acts = useHover(150);
  const marquesH = useHover(220);

  const scrollToSection = (id: string) => {
    if (pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/#${id}`);
    }
  };

  useEffect(() => {
    const sortCats = (cats: CatItem[]) =>
      [...cats].sort(
        (a, b) =>
          (a.ordre ?? 0) - (b.ordre ?? 0) || a.nom.localeCompare(b.nom, locale),
      );

    // Déduplique par slug pour éviter les doublons issus du seed
    const dedupBySlug = (cats: CatItem[]): CatItem[] => {
      const seen = new Set<string>();
      return cats.filter((c) => {
        if (seen.has(c.slug)) return false;
        seen.add(c.slug);
        return true;
      });
    };

    const buildRoots = (all: CatItem[]): CatItem[] =>
      sortCats(dedupBySlug(all.filter((c) => !c.parent_id))).map((c) => ({
        ...c,
        sous_cats: sortCats(
          dedupBySlug(all.filter((sc) => sc.parent_id === c.id_categorie)),
        ),
      }));

    fetch(`${BASE}/activites?lang=${locale}`)
      .then((r) => r.json())
      .then((j) => {
        const data: Activite[] = j.data ?? j ?? [];
        // Dédupliquer les activités par slug
        const seen = new Set<string>();
        const uniqueData = data.filter((a) => {
          if (seen.has(a.slug)) return false;
          seen.add(a.slug);
          return true;
        });
        Promise.all(
          uniqueData.map((a) =>
            fetch(`${BASE}/categories?id_activite=${a.id_activite}&lang=${locale}`)
              .then((r) => r.json())
              .then((d) => {
                const all: CatItem[] = d.data ?? d ?? [];
                return { ...a, categories: buildRoots(all) };
              })
              .catch(() => a),
          ),
        ).then(setActivites);
      })
      .catch(() => {});

    fetch(`${BASE}/marques?lang=${locale}`)
      .then((r) => r.json())
      .then((j) => {
        const data: Marque[] = j.data ?? j ?? [];
        // Dédupliquer les marques par slug
        const seenM = new Set<string>();
        const uniqueMarques = data.filter((m) => {
          if (seenM.has(m.slug)) return false;
          seenM.add(m.slug);
          return true;
        });
        Promise.all(
          uniqueMarques.map((m) =>
            fetch(`${BASE}/marques/${m.slug}`)
              .then((r) => r.json())
              .then((d) => {
                const seenC = new Set<string>();
                const sortCats2 = (cats: CatItem[]) =>
                  [...cats].sort(
                    (a, b) =>
                      (a.ordre ?? 0) - (b.ordre ?? 0) ||
                a.nom.localeCompare(b.nom, locale),
                  );
                const cats: CatItem[] = (
                  d.data?.categories ??
                  d?.categories ??
                  []
                )
                  .filter((cat: any) => {
                    if (seenC.has(cat.slug)) return false;
                    seenC.add(cat.slug);
                    return true;
                  })
                  .map((cat: any) => ({
                    ...cat,
                    sous_cats: sortCats2(cat.sous_cats ?? []),
                  }));
                return { ...m, categories: sortCats2(cats) };
              })
              .catch(() => m),
          ),
        ).then(setMarques);
      })
      .catch(() => {});
  }, [locale]);

  useEffect(() => {
    setMounted(true);
    /* Seuil adapté au type de hero :
       - homepage     -> 90% vh  (hero 100vh)
       - pages slider -> 52% vh  (hero 68vh)
       - pages static -> 40% vh  (hero 55vh)  */
    const SLIDER_P = ["/marques", "/activites"];
    const STATIC_P = ["/contact", "/qui-sommes-nous", "/rendez-vous"];
    const getThreshold = () => {
      const p = window.location.pathname;
      if (p === "/") return window.innerHeight * 0.9;
      if (SLIDER_P.some((s) => p.startsWith(s)))
        return window.innerHeight * 0.52;
      if (STATIC_P.some((s) => p.startsWith(s)))
        return window.innerHeight * 0.4;
      return 0;
    };
    const fn = () => setScrolled(window.scrollY > getThreshold());
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
    setMobileSec(null);
  }, [pathname]);

  const isActive = (p: string) =>
    p === "/" ? pathname === "/" : pathname?.startsWith(p);
  const dropShadow =
    "0 20px 60px rgba(0,0,0,0.13),0 0 0 1.5px rgba(46,125,79,0.14)";

  const path = pathname ?? "";
  const hasPageHero =
    path === "/marques" ||
    path === "/activites" ||
    path === "/contact" ||
    path === "/rendez-vous" ||
    /^\/marques\/[^/]+$/.test(path) ||
    /^\/activites\/[^/]+$/.test(path);
  const onHero = (isHome || hasPageHero) && !scrolled;
  const navTextColor = onHero ? "#ffffff" : isDark ? C.darkInk2 : C.ink;
  const navActiveColor = onHero ? "#ffffff" : C.sage;
  const navBorderActive = onHero ? "#7dc040" : C.sage;
  const mobileMenuBg = isDark ? C.darkMenuBg : "#ffffff";
  const mobileMenuBorder = isDark ? C.darkMenuBorder : C.line;
  const mobileLinkColor = isDark ? C.darkInk : C.ink;
  const mobileHoverClass = isDark ? "hover:bg-[#1e2d22]" : "hover:bg-[#edf8f3]";
  const mobileSubHover = isDark ? "hover:bg-[#243520]" : "hover:bg-[#dff2e8]";

  const nlBase: React.CSSProperties = {
    ...TY.navLink,
    color: navTextColor,
    padding: "8px 4px",
    borderRadius: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 5,
    textDecoration: "none",
    border: "none",
    background: "transparent",
    position: "relative",
  };
  const nlOn: React.CSSProperties = {
    ...nlBase,
    ...TY.navLinkOn,
    color: navActiveColor,
  };
  const nlBtn: React.CSSProperties = { ...nlBase, fontFamily: "inherit" };

  /* Wrapper avec effet hover soulignement glissant */
  const NavItem = ({
    href, active, onClick, children,
  }: { href?: string; active: boolean; onClick?: () => void; children: React.ReactNode }) => {
    const [hovered, setHovState] = React.useState(false);
    const showBadge = active || hovered;
    // Badge arrondi plein (comme la forme du logo) au lieu du soulignement.
    const badgeBg = onHero ? "rgba(255,255,255,0.2)" : C.sageDk;
    const wrapStyle: React.CSSProperties = {
      ...(active ? nlOn : nlBase),
      padding: "8px 10px",
      borderRadius: 12,
      background: showBadge ? badgeBg : "transparent",
      color: showBadge ? "#ffffff" : active ? navActiveColor : navTextColor,
      transform: hovered ? "scale(1.05)" : "scale(1)",
      transition:
        "background 0.22s cubic-bezier(.34,1.56,.64,1), color 0.15s, transform 0.2s cubic-bezier(.34,1.56,.64,1)",
    };
    const inner = <>{children}</>;
    if (href) return (
      <Link href={href} style={wrapStyle}
        onMouseEnter={() => setHovState(true)}
        onMouseLeave={() => setHovState(false)}>
        {inner}
      </Link>
    );
    return (
      <button style={{ ...wrapStyle, fontFamily: "inherit" }}
        onMouseEnter={() => setHovState(true)}
        onMouseLeave={() => setHovState(false)}
        onClick={onClick}>
        {inner}
      </button>
    );
  };

  const navBg = onHero
    ? "transparent"
    : isDark
      ? "rgba(13,24,16,0.97)"
      : "rgba(255,255,255,0.98)";

  return (
    <>
      <nav
        className="fixed inset-x-0 top-0 z-50"
        style={{
          background: navBg,
          backdropFilter: onHero ? "none" : "blur(20px)",
          borderBottom: onHero
            ? "none"
            : `1.5px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(46,125,79,0.18)"}`,
          boxShadow: onHero
            ? "none"
            : `0 2px 20px rgba(46,125,79,${isDark ? "0.08" : "0.12"})`,
          transition: "all 0.3s",
        }}
      >
        <div
          style={{
            height: 2.5,
            background: `linear-gradient(90deg,${C.gradA},${C.gradB},${C.gradC})`,
          }}
        />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: NAV_H }}>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                marginRight: "clamp(6px,1vw,16px)",
                flexShrink: 0,
                textDecoration: "none",
                lineHeight: 0,
              }}
            >
              {!logoErr ? (
                <Image
                  src="/logos/logo espace vert.png"
                  alt="Espace Vert"
                  width={300}
                  height={150}
                  style={{
                    objectFit: "contain",
                    height: "clamp(54px,7vw,90px)",
                    width: "auto",
                    display: "block",
                  }}
                  onError={() => setLogoErr(true)}
                  priority
                />
              ) : (
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    fontSize: "1.2rem",
                    color: onHero ? "#fff" : C.sageDk,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Espace
                  <span
                    style={{ color: onHero ? "rgba(255,255,255,0.7)" : C.sage }}
                  >
                    Vert
                  </span>
                </span>
              )}
            </Link>

            <div
              className="hidden xl:flex"
              style={{
                // La pilule s'ajuste à son contenu (liens + CTA) et la ligne
                // parente (space-between) l'ancre au bord droit du conteneur,
                // exactement comme le logo est ancré au bord gauche : plus de
                // grande bande vide à droite sur les larges écrans.
                flex: "0 0 auto",
                // Espace MINIMUM entre le logo et le début de la navbar : sert
                // de garde-fou quand l'écran est étroit, sinon c'est
                // justify-content: space-between (sur la ligne parente) qui
                // répartit l'espace disponible.
                marginLeft: "clamp(12px, 1.5vw, 28px)",
                alignItems: "center",
                height: "clamp(33px,4.4vw,57px)",
                position: "relative",
                minWidth: 0,
                // nav.png ne s'affiche QUE sur le hero (onHero) : c'est un
                // habillage du menu qui se pose sur la photo hero. Une fois
                // qu'on scrolle, le <nav> a déjà son fond blanc/normal
                // (navBg) et il ne doit plus rester aucune trace de vert
                // derrière les liens — donc pas d'image du tout ici.
                ...(onHero
                  ? {
                      backgroundImage: "url(/images/nav.png)",
                      backgroundSize: "auto 100%",
                      backgroundPosition: "right center",
                      backgroundRepeat: "no-repeat",
                    }
                  : {
                      backgroundImage: "none",
                    }),
                borderRadius: "999px 0 0 999px",
                // (overflow retiré : "hidden" ici coupait aussi les menus
                // déroulants "Nos activités"/"Nos marques" qui s'ouvrent sous
                // la pilule au survol — le fond décoratif reste cadré par le
                // border-radius sans avoir besoin de overflow:hidden.)
                // Padding gauche réduit au minimum : nav.png ne couvre que sa
                // largeur naturelle (ancrée à droite) — moins l'ensemble
                // liens+CTA est large, plus "Qui sommes-nous" reste à
                // l'intérieur de la zone verte couverte par l'image.
                padding: "0 130px 0 6px",
                // Le contenu (liens + CTA) démarre juste après le logo, collé au
                // bord GAUCHE de la pilule : ça supprime le vide vert mort entre
                // le logo et "Qui sommes-nous".
                justifyContent: "flex-start",
                gap: "clamp(4px, 0.6vw, 10px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "clamp(4px, 0.6vw, 10px)",
                  height: "100%",
                  flex: "0 0 auto",
                  minWidth: 0,
                  position: "relative",
                  zIndex: 2,
                }}
              >
              <NavItem href="/qui-sommes-nous" active={isActive("/qui-sommes-nous")}>
                {t("nav.about")}
              </NavItem>

              {/* Activités */}
              <div
                style={{ position: "relative" }}
                onMouseEnter={acts.show}
                onMouseLeave={acts.hide}
              >
                <NavItem active={acts.open || isActive("/activites")} onClick={() => scrollToSection("nos-activites")}>
                  {t("nav.activities")}
                  <motion.span
                    animate={{ rotate: acts.open ? 180 : 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <ChevronDownIcon
                      style={{ width: 12, height: 12, opacity: 0.5 }}
                    />
                  </motion.span>
                </NavItem>
                <AnimatePresence>
                  {acts.open && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      onMouseEnter={acts.keep}
                      onMouseLeave={acts.hide}
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        marginTop: 10,
                        zIndex: 60,
                        maxWidth: "calc(100vw - 32px)",
                      }}
                    >
                      <ActivitesDropdown
                        activites={activites}
                        onClose={acts.hide}
                        isDark={isDark}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Marques */}
              <div
                style={{ position: "relative" }}
                onMouseEnter={marquesH.show}
                onMouseLeave={marquesH.hide}
              >
                <NavItem active={marquesH.open || isActive("/marques")} onClick={() => scrollToSection("nos-marques")}>
                  {t("nav.brands")}
                  <motion.span
                    animate={{ rotate: marquesH.open ? 180 : 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <ChevronDownIcon
                      style={{ width: 12, height: 12, opacity: 0.5 }}
                    />
                  </motion.span>
                </NavItem>
                <AnimatePresence>
                  {marquesH.open && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      onMouseEnter={marquesH.keep}
                      onMouseLeave={marquesH.hide}
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        marginTop: 10,
                        zIndex: 60,
                        maxWidth: "calc(100vw - 32px)",
                      }}
                    >
                      <MarquesDropdown
                        marques={marques}
                        onClose={marquesH.hide}
                        isDark={isDark}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavItem href="/contact" active={isActive("/contact")}>
                {t("nav.contact")}
              </NavItem>
              </div>

              {/* Right CTAs */}
              <div
                style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, position: "relative", zIndex: 2 }}
              >
              <ProduitSearch onHero={onHero} navTextColor={navTextColor} />
              <LangDropdown onHero={onHero} />

              <Link
                href="/rendez-vous"
                aria-label={t("nav.appointment")}
                title={t("nav.appointment")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: onHero
                    ? "rgba(255,255,255,0.18)"
                    : `linear-gradient(135deg,${C.logoDk},${C.logo})`,
                  border: onHero
                    ? "1.5px solid rgba(255,255,255,0.35)"
                    : "none",
                  color: "#fff",
                  textDecoration: "none",
                  boxShadow: onHero
                    ? "none"
                    : `0 3px 10px rgba(125,192,64,0.3)`,
                  transition: "all 0.3s",
                  flexShrink: 0,
                }}
              >
                <Ico.Cal style={{ width: 16, height: 16 }} />
              </Link>
              </div>
            </div>

            {/* Burger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="xl:hidden ml-auto p-2.5 rounded-xl"
              style={{
                background: onHero
                  ? "rgba(255,255,255,0.15)"
                  : isDark
                    ? "rgba(255,255,255,0.08)"
                    : C.sageLt,
                color: onHero ? "#fff" : isDark ? C.darkInk : C.sage,
                border: `1.5px solid ${onHero ? "rgba(255,255,255,0.3)" : isDark ? "rgba(255,255,255,0.12)" : C.border}`,
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mobileOpen ? "x" : "bars"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {mobileOpen ? (
                    <Ico.X style={{ width: 22, height: 22 }} />
                  ) : (
                    <Ico.Menu style={{ width: 22, height: 22 }} />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* Menu mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-x-0 z-40 overflow-hidden xl:hidden"
            style={{
              top: NAV_H + 2.5,
              borderTop: `1.5px solid ${mobileMenuBorder}`,
              boxShadow: "0 24px 48px rgba(0,0,0,0.12)",
              background: mobileMenuBg,
            }}
          >
            <div className="p-4 max-h-[calc(100dvh-5.5rem)] overflow-y-auto flex flex-col gap-2">
              <div className="flex justify-end px-1 pb-1">
                <LanguageSwitcher />
              </div>
              <Link
                href="/qui-sommes-nous"
                onClick={() => setMobileOpen(false)}
                style={{
                  ...TY.mobileLink,
                  color: mobileLinkColor,
                  padding: "11px 16px",
                  borderRadius: 10,
                  display: "block",
                  textDecoration: "none",
                }}
                className={mobileHoverClass}
              >
                {t("nav.about")}
              </Link>

              {/* Activités mobile */}
              <div>
                <div style={{ display: "flex" }}>
                  <button
                    onClick={() => {
                      scrollToSection("nos-activites");
                      setMobileOpen(false);
                    }}
                    style={{
                      ...TY.mobileLink,
                      color: mobileLinkColor,
                      padding: "11px 16px",
                      borderRadius: "10px 0 0 10px",
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                    }}
                    className={mobileHoverClass}
                  >
                    {t("nav.activities")}
                  </button>
                  <button
                    onClick={() =>
                      setMobileSec(mobileSec === "acts" ? null : "acts")
                    }
                    style={{
                      padding: "11px 14px",
                      borderRadius: "0 10px 10px 0",
                      background: "transparent",
                      border: "none",
                      borderLeft: `1.5px solid ${mobileMenuBorder}`,
                      cursor: "pointer",
                      color: isDark ? C.darkInk3 : C.ink3,
                    }}
                    className={mobileHoverClass}
                  >
                    <ChevronDownIcon
                      style={{
                        width: 16,
                        height: 16,
                        transition: "transform 0.2s",
                        transform:
                          mobileSec === "acts" ? "rotate(180deg)" : "none",
                      }}
                    />
                  </button>
                </div>
                <AnimatePresence>
                  {mobileSec === "acts" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: "hidden" }}
                    >
                      {activites.map((a) => (
                        <Link
                          key={a.id_activite}
                          href={getActivityHrefBySlug(a.slug)}
                          onClick={() => setMobileOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 11,
                            padding: "9px 16px 9px 28px",
                            borderRadius: 9,
                            textDecoration: "none",
                            color: mobileLinkColor,
                          }}
                          className={mobileSubHover}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 9,
                              background: C.sagePastel,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              border: `1.5px solid ${C.sageIcon}`,
                              overflow: "hidden",
                            }}
                          >
                            {a.image ? (
                              <Image
                                src={a.image}
                                alt={a.nom}
                                width={32}
                                height={32}
                                style={{
                                  objectFit: "cover",
                                  width: "100%",
                                  height: "100%",
                                }}
                              />
                            ) : (
                              <Ico.Leaf
                                style={{
                                  width: 14,
                                  height: 14,
                                  color: C.sageMd,
                                }}
                              />
                            )}
                          </div>
                          <p
                            style={{
                              ...TY.mobileLink,
                              fontSize: 14,
                              color: mobileLinkColor,
                              margin: 0,
                              minWidth: 0,
                            }}
                          >
                            {a.nom}
                          </p>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Marques mobile */}
              <div>
                <div style={{ display: "flex" }}>
                  <button
                    onClick={() => {
                      scrollToSection("nos-marques");
                      setMobileOpen(false);
                    }}
                    style={{
                      ...TY.mobileLink,
                      color: mobileLinkColor,
                      padding: "11px 16px",
                      borderRadius: "10px 0 0 10px",
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                    }}
                    className={mobileHoverClass}
                  >
                    {t("nav.brands")}
                  </button>
                  <button
                    onClick={() =>
                      setMobileSec(mobileSec === "brands" ? null : "brands")
                    }
                    style={{
                      padding: "11px 14px",
                      borderRadius: "0 10px 10px 0",
                      background: "transparent",
                      border: "none",
                      borderLeft: `1.5px solid ${mobileMenuBorder}`,
                      cursor: "pointer",
                      color: isDark ? C.darkInk3 : C.ink3,
                    }}
                    className={mobileHoverClass}
                  >
                    <ChevronDownIcon
                      style={{
                        width: 16,
                        height: 16,
                        transition: "transform 0.2s",
                        transform:
                          mobileSec === "brands" ? "rotate(180deg)" : "none",
                      }}
                    />
                  </button>
                </div>
                <AnimatePresence>
                  {mobileSec === "brands" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: "hidden", paddingBottom: 4 }}
                    >
                      {marques
                        .filter((m) => SLUGS_GROUPE.has(m.slug))
                        .map((m) => (
                          <Link
                            key={m.id_marque}
                            href={`/marques/${m.slug}`}
                            onClick={() => setMobileOpen(false)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 11,
                              marginLeft: 12,
                              marginRight: 12,
                              padding: "9px 14px",
                              borderRadius: 10,
                              border: `1.5px solid ${mobileMenuBorder}`,
                              marginBottom: 6,
                              textDecoration: "none",
                              background: isDark
                                ? "rgba(255,255,255,0.04)"
                                : "#fff",
                            }}
                            className={mobileHoverClass}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: C.sagePastel,
                                border: `1.5px solid ${C.sageIcon}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                              }}
                            >
                              {m.logo ? (
                                <Image
                                  src={m.logo}
                                  alt={m.nom}
                                  width={32}
                                  height={32}
                                  style={{ objectFit: "contain", padding: 3 }}
                                />
                              ) : (
                                <Ico.Leaf
                                  style={{
                                    width: 14,
                                    height: 14,
                                    color: C.sageMd,
                                  }}
                                />
                              )}
                            </div>
                            <p
                              style={{
                                ...TY.mobileLink,
                                fontSize: 13.5,
                                color: mobileLinkColor,
                                margin: 0,
                                fontWeight: 700,
                              }}
                            >
                              {m.nom}
                            </p>
                          </Link>
                        ))}

                      {marques
                        .filter((m) => !SLUGS_GROUPE.has(m.slug))
                        .map((m) => (
                          <Link
                            key={m.id_marque}
                            href={`/marques/${m.slug}`}
                            onClick={() => setMobileOpen(false)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 11,
                              marginLeft: 12,
                              marginRight: 12,
                              padding: "8px 14px",
                              borderRadius: 10,
                              border: `1.5px solid ${mobileMenuBorder}`,
                              marginBottom: 5,
                              textDecoration: "none",
                              background: isDark
                                ? "rgba(255,255,255,0.02)"
                                : "#fafafa",
                            }}
                            className={mobileHoverClass}
                          >
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 7,
                                background: C.sagePastel,
                                border: `1.5px solid ${C.sageIcon}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                              }}
                            >
                              {m.logo ? (
                                <Image
                                  src={m.logo}
                                  alt={m.nom}
                                  width={28}
                                  height={28}
                                  style={{ objectFit: "contain", padding: 2 }}
                                />
                              ) : (
                                <Ico.Leaf
                                  style={{
                                    width: 12,
                                    height: 12,
                                    color: C.sageMd,
                                  }}
                                />
                              )}
                            </div>
                            <p
                              style={{
                                ...TY.mobileLink,
                                fontSize: 13,
                                color: mobileLinkColor,
                                margin: 0,
                              }}
                            >
                              {m.nom}
                            </p>
                          </Link>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                style={{
                  ...TY.mobileLink,
                  color: mobileLinkColor,
                  padding: "11px 16px",
                  borderRadius: 10,
                  display: "block",
                  textDecoration: "none",
                }}
                className={mobileHoverClass}
              >
                {t("nav.contact")}
              </Link>
              <Link
                href="/rendez-vous"
                onClick={() => setMobileOpen(false)}
                style={{
                  ...TY.cta,
                  color: "#fff",
                  background: `linear-gradient(135deg,${C.logoDk},${C.logo})`,
                  padding: "12px 16px",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 4,
                  textDecoration: "none",
                }}
              >
                <Ico.Cal style={{ width: 16, height: 16 }} />
                {t("nav.appointmentFull")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}