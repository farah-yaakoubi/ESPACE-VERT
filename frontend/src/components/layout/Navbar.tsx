"use client";
import { getActivityHrefBySlug } from "@/lib/activity-links";
import { useI18n } from "@/i18n/I18nProvider";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProduitSearch } from "./ProduitSearch";
import { LanguageSwitcher } from "./LanguageSwitcher";

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

const Ico = {
  Leaf: (p: any) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    >
      <path d="M20 5c0 0-8 0-13 5C4 13 4 19 4 19s6 0 9-3c5-5 5-11 7-11z" />
      <path d="M4 19l7-7" />
    </svg>
  ),
  Cal: (p: any) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  Menu: (p: any) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  ),
  X: (p: any) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  ChevR: (p: any) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  ),
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

/* ── ActivitesDropdown — style minimaliste vert/blanc/noir ─────────────────── */
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

  const act = activites.find((a) => a.id_activite === selectedAct);
  const hasCategories = (act?.categories?.length ?? 0) > 0;

  useEffect(() => {
    setSelectedCat(null);
  }, [selectedAct]);

  const cat = act?.categories?.find((c) => c.slug === selectedCat);
  const hasSousCats = cat?.sous_cats && cat.sous_cats.length > 0;

  /* shared row styles */
  const col1W = 172;
  const col2W = 192;
  const col3W = 176;
  const panelBg = isDark ? "#162117" : "#fff";
  const panelAltBg = isDark ? "#1e2d22" : "#fafafa";
  const panelBorder = isDark ? "rgba(255,255,255,0.08)" : "#111816";
  const mutedBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(17,24,22,0.1)";
  const titleColor = isDark ? C.darkInk3 : C.ink3;
  const textColor = isDark ? C.darkInk : C.ink;
  const softTextColor = isDark ? C.darkInk2 : C.ink2;
  const rowHoverBg = isDark ? "#243520" : "#f5f5f5";
  const shadow = isDark
    ? "0 24px 60px rgba(0,0,0,0.38),0 0 0 1px rgba(255,255,255,0.03)"
    : "4px 4px 0px #111816";

  return (
    <div
      style={{
        display: "flex",
        width: col1W + (hasCategories ? col2W : 0) + (hasSousCats ? col3W : 0),
        transition: "width 0.18s cubic-bezier(.4,0,.2,1)",
        background: panelBg,
        borderRadius: 14,
        overflow: "hidden",
        border: `1.5px solid ${panelBorder}`,
        boxShadow: shadow,
      }}
    >
      {/* ── Col 1 — activités ── */}
      <div
        style={{
          width: col1W,
          flexShrink: 0,
          borderRight: `1.5px solid ${panelBorder}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
          {activites.length === 0 ? (
            <p
              style={{
                padding: "10px 14px",
                ...TY.ddItemDesc,
                color: titleColor,
              }}
            >
              {t("nav.loading")}
            </p>
          ) : (
            activites.map((a, i) => {
              const on = selectedAct === a.id_activite;
              const href = getActivityHrefBySlug(a.slug);
              const canExpand = (a.categories?.length ?? 0) > 0;
              return (
                <motion.div
                  key={a.id_activite}
                  initial={{ opacity: 0, x: -3 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.035 }}
                >
                  <button
                    type="button"
                    onMouseEnter={() => setSelectedAct(a.id_activite)}
                    onClick={() => {
                      onClose();
                      window.location.href = href;
                    }}
                    style={{
                      display: "flex",
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px 8px 14px",
                      cursor: "pointer",
                      background: on ? C.sage : "transparent",
                      border: "none",
                      transition: "background 0.12s",
                      textDecoration: "none",
                      fontFamily: "inherit",
                      textAlign: "left",
                    }}
                  >
                    <p
                      style={{
                        ...TY.ddItemName,
                        fontSize: 13,
                        color: on ? "#fff" : textColor,
                        margin: 0,
                        transition: "color 0.12s",
                        flex: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {a.nom}
                    </p>
                    {canExpand && (
                      <Ico.ChevR
                        style={{
                          width: 11,
                          height: 11,
                          color: on ? "rgba(255,255,255,0.7)" : titleColor,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </button>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Col 2 — catégories ── */}
      {hasCategories && (
        <div
          style={{
            width: col2W,
            flexShrink: 0,
            borderRight: hasSousCats ? `1.5px solid ${panelBorder}` : "none",
            display: "flex",
            flexDirection: "column",
            background: panelBg,
          }}
        >
          <AnimatePresence mode="wait">
            {act ? (
              <motion.div
                key={act.id_activite}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.11 }}
                style={{ display: "flex", flexDirection: "column", flex: 1 }}
              >
                <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
                  {act.categories && act.categories.length > 0
                    ? act.categories.map((c) => {
                        const onC = selectedCat === c.slug;
                        const canExpandCat = (c.sous_cats?.length ?? 0) > 0;
                        return (
                          <button
                            type="button"
                            key={c.slug}
                            onMouseEnter={() => setSelectedCat(c.slug)}
                            onClick={() => {
                              onClose();
                              window.location.href = `/activites/${act.slug}?cat=${c.id_categorie}`;
                            }}
                            style={{
                              display: "flex",
                              width: "100%",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 10px 8px 14px",
                              cursor: "pointer",
                              background: onC ? rowHoverBg : "transparent",
                              border: "none",
                              borderLeft: `2.5px solid ${onC ? C.sage : "transparent"}`,
                              transition: "all 0.1s",
                              fontFamily: "inherit",
                              textAlign: "left",
                            }}
                          >
                            <span
                              style={{
                              ...TY.ddItemName,
                              fontSize: 13,
                              color: onC ? C.sage : textColor,
                              transition: "color 0.1s",
                              flex: 1,
                              minWidth: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            >
                              {c.nom}
                            </span>
                            {canExpandCat && (
                              <Ico.ChevR
                                style={{
                                  width: 10,
                                  height: 10,
                                  color: onC ? C.sage : titleColor,
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </button>
                        );
                      })
                    : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      )}

      {/* ── Col 3 — sous-catégories ── */}
      <AnimatePresence>
        {hasSousCats && cat && act && (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: col3W }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            style={{
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              background: panelAltBg,
              overflow: "hidden",
              marginTop: 14,
              marginBottom: 10,
              borderTop: `1px solid ${mutedBorder}`,
            }}
          >
            <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
              {cat.sous_cats!.map((sc, i) => (
                <motion.div
                  key={sc.slug}
                  initial={{ opacity: 0, x: 4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    href={`/activites/${act.slug}?cat=${sc.id_categorie}`}
                    onClick={onClose}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "7px 12px 7px 14px",
                      textDecoration: "none",
                      color: softTextColor,
                      transition: "all 0.1s",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = isDark ? "#243520" : C.sageLt;
                      el.style.color = C.sage;
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = "transparent";
                      el.style.color = softTextColor;
                    }}
                  >
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: C.sageMd,
                        flexShrink: 0,
                        display: "inline-block",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {sc.nom}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  const marquesGroupe = marques.filter((m) => SLUGS_GROUPE.has(m.slug));
  const marquesPartenaire = marques.filter((m) => !SLUGS_GROUPE.has(m.slug));
  const orderedMarques = [...marquesGroupe, ...marquesPartenaire];

  const panelBg = isDark ? "#162117" : "#fff";
  const panelBorder = isDark ? "rgba(255,255,255,0.08)" : "#111816";
  const mutedBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(17,24,22,0.1)";
  const titleColor = isDark ? C.darkInk3 : C.ink3;
  const textColor = isDark ? C.darkInk : C.ink;
  const shadow = isDark
    ? "0 24px 60px rgba(0,0,0,0.38),0 0 0 1px rgba(255,255,255,0.03)"
    : "4px 4px 0px #111816";
  const col1W = 640;

  return (
    <div
      style={{
        display: "flex",
        background: panelBg,
        borderRadius: 14,
        overflow: "hidden",
        border: `1.5px solid ${panelBorder}`,
        boxShadow: shadow,
        width: col1W,
      }}
    >
      <div
        style={{
          width: col1W,
          flexShrink: 0,
          padding: "14px",
          maxHeight: "calc(100vh - 150px)",
          overflowY: "auto",
        }}
      >
        {orderedMarques.length === 0 ? (
          <p style={{ padding: "10px 14px", ...TY.ddItemDesc, color: titleColor }}>
            Chargement...
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 10,
            }}
          >
            {orderedMarques.map((m, i) => {
          const isGroup = SLUGS_GROUPE.has(m.slug);
          return (
          <motion.div
            key={m.id_marque}
            initial={{ opacity: 0, x: -3 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.025 }}
            whileHover={{ y: -2 }}
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
                gap: 7,
                width: "100%",
                minHeight: 122,
                padding: "10px 8px",
                cursor: "pointer",
                background: isDark ? "#1e2d22" : "#fff",
                border: `1.5px solid ${isDark ? "rgba(255,255,255,0.1)" : C.border}`,
                borderRadius: 12,
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(17,24,22,0.06)",
                textDecoration: "none",
                transition: "background 0.14s, border-color 0.14s, box-shadow 0.14s",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: 64,
                  borderRadius: 10,
                  background: isDark ? "#1e2d22" : "#fff",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(17,24,22,0.08)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {m.logo ? (
                  <Image
                    src={m.logo}
                    alt={m.nom}
                    width={112}
                    height={64}
                    style={{
                      objectFit: "contain",
                      width: "100%",
                      height: "100%",
                      padding: 6,
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.sage,
                      textAlign: "center",
                    }}
                  >
                    {m.nom.slice(0, 2)}
                  </span>
                )}
              </div>
              <div style={{ width: "100%", minWidth: 0 }}>
                <p
                  style={{
                    ...TY.ddItemName,
                    fontSize: 12.5,
                    color: textColor,
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {m.nom}
                </p>
                <p
                  style={{
                    ...TY.ddItemDesc,
                    fontSize: 10.5,
                    color: titleColor,
                    margin: "2px 0 0",
                  }}
                >
                  {isGroup ? "Groupe" : "Partenaire"}
                </p>
              </div>
            </Link>
          </motion.div>
        )})}
          </div>
        )}
        <Link
          href="/marques"
          onClick={onClose}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 10,
            background: isDark ? "#1e2d22" : C.sageLt,
            color: C.sage,
            fontSize: 12,
            fontWeight: 700,
            textDecoration: "none",
            border: `1px solid ${mutedBorder}`,
          }}
        >
          Voir toutes les marques
          <Ico.ChevR style={{ width: 9, height: 9 }} />
        </Link>
      </div>
    </div>
  );
}

/* ── Navbar principale — INCHANGÉE ────────────────────────────────────────── */
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
    padding: "8px 14px",
    borderRadius: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 5,
    textDecoration: "none",
    transition: "color 0.15s",
    border: "none",
    background: "transparent",
    borderBottom: "2.5px solid transparent",
  };
  const nlOn: React.CSSProperties = {
    ...nlBase,
    ...TY.navLinkOn,
    color: navActiveColor,
    borderBottom: `2.5px solid ${navBorderActive}`,
  };
  const nlBtn: React.CSSProperties = { ...nlBase, fontFamily: "inherit" };

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
          <div style={{ display: "flex", alignItems: "center", height: NAV_H }}>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                marginRight: "clamp(16px,3vw,40px)",
                flexShrink: 0,
                textDecoration: "none",
                lineHeight: 0,
              }}
            >
              {!logoErr ? (
                <Image
                  src="/logos/logo-espace-vert.png"
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
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                gap: 0,
                height: "100%",
              }}
            >
              <Link
                href="/qui-sommes-nous"
                style={isActive("/qui-sommes-nous") ? nlOn : nlBase}
              >
                {t("nav.about")}
              </Link>

              {/* Activités */}
              <div
                style={{ position: "relative" }}
                onMouseEnter={acts.show}
                onMouseLeave={acts.hide}
              >
                <button
                  onClick={() => scrollToSection("nos-activites")}
                  style={acts.open || isActive("/activites") ? nlOn : nlBtn}
                >
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
                </button>
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
                <button
                  onClick={() => scrollToSection("nos-marques")}
                  style={marquesH.open || isActive("/marques") ? nlOn : nlBtn}
                >
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
                </button>
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

              <Link
                href="/contact"
                style={isActive("/contact") ? nlOn : nlBase}
              >
                {t("nav.contact")}
              </Link>
            </div>

            {/* Right CTAs */}
            <div
              className="hidden xl:flex"
              style={{ alignItems: "center", gap: 8, marginLeft: "auto" }}
            >
              <ProduitSearch onHero={onHero} navTextColor={navTextColor} />
              <LanguageSwitcher compact />

              <Link
                href="/rendez-vous"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 18px",
                  borderRadius: 10,
                  background: onHero
                    ? "rgba(255,255,255,0.18)"
                    : `linear-gradient(135deg,${C.logoDk},${C.logo})`,
                  border: onHero
                    ? "1.5px solid rgba(255,255,255,0.35)"
                    : "none",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13.5,
                  letterSpacing: "-0.01em",
                  textDecoration: "none",
                  boxShadow: onHero
                    ? "none"
                    : `0 3px 10px rgba(125,192,64,0.3)`,
                  transition: "all 0.3s",
                  whiteSpace: "nowrap",
                }}
              >
                <Ico.Cal style={{ width: 14, height: 14 }} />
                {t("nav.appointment")}
              </Link>
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
