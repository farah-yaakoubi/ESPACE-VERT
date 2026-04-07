"use client";

// ─── SEULE MODIFICATION vs l'original :
//   • Le Spotlight charge les produits depuis le backend (/api/produits)
//     au lieu d'utiliser le tableau PRODUCTS statique codé en dur.
//   • La liste PRODUCTS statique est supprimée.
//   • Un hook useProduits() remplace la constante.
//   • La fonction score() et hl() restent identiques.
//   • Tout le reste du fichier (UI, animations, menus) est inchangé.
// ──────────────────────────────────────────────────────────────────────────

import {
  Bars3Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getProduits, type ProduitPublic } from "@/lib/api";

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const NAV_H    = 96;
const MAX_HIST = 5;

const C = {
  sage    : "#2e7d4f",
  sageDk  : "#1b5e38",
  sageMd  : "#5bab79",
  sageLt  : "#dff2e8",
  sagePop : "#38a169",
  stone   : "#f6f4f0",
  stone2  : "#ede9e3",
  line    : "rgba(46,125,79,0.12)",
  ink     : "#111816",
  ink2    : "#3d5248",
  ink3    : "#8da898",
  ink4    : "#bbd4c4",
  border  : "#c9e0d3",
  red     : "#d63031",
  redLt   : "#ffe5e5",
  markBg  : "#b5f0cc",
  markFg  : "#145c30",
  gold    : "#e8a020",
  gradA   : "#1b5e38",
  gradB   : "#38a169",
  gradC   : "#6fcf97",
};

const TY = {
  navLink    : { fontSize: 15.5, fontWeight: 500,  letterSpacing: "-0.01em" } as React.CSSProperties,
  navLinkOn  : { fontSize: 15.5, fontWeight: 700,  letterSpacing: "-0.01em" } as React.CSSProperties,
  brand      : { fontSize: 18,   fontWeight: 900,  letterSpacing: "-0.04em"  } as React.CSSProperties,
  eyebrow    : { fontSize: 9,    fontWeight: 700,  letterSpacing: "0.22em",  textTransform: "uppercase" as const } as React.CSSProperties,
  secLabel   : { fontSize: 9.5,  fontWeight: 700,  letterSpacing: "0.16em",  textTransform: "uppercase" as const } as React.CSSProperties,
  itemName   : { fontSize: 13.5, fontWeight: 600,  letterSpacing: "-0.018em" } as React.CSSProperties,
  itemDesc   : { fontSize: 11.5, fontWeight: 400,  letterSpacing: "-0.01em"  } as React.CSSProperties,
  ddItemName : { fontSize: 13.5, fontWeight: 600,  letterSpacing: "-0.018em" } as React.CSSProperties,
  ddItemDesc : { fontSize: 11.5, fontWeight: 400,  letterSpacing: "-0.01em"  } as React.CSSProperties,
  ddCatName  : { fontSize: 13.5, fontWeight: 600,  letterSpacing: "-0.018em" } as React.CSSProperties,
  ddCatDesc  : { fontSize: 11,   fontWeight: 400,  letterSpacing: "-0.01em"  } as React.CSSProperties,
  histTerm   : { fontSize: 13.5, fontWeight: 500,  letterSpacing: "-0.015em" } as React.CSSProperties,
  badge      : { fontSize: 10.5, fontWeight: 700,  letterSpacing: "0.01em"   } as React.CSSProperties,
  hint       : { fontSize: 11,   fontWeight: 400,  letterSpacing: "0"        } as React.CSSProperties,
  mobileLink : { fontSize: 15,   fontWeight: 600,  letterSpacing: "-0.02em"  } as React.CSSProperties,
  cta        : { fontSize: 14,   fontWeight: 700,  letterSpacing: "-0.01em"  } as React.CSSProperties,
  langBtn    : { fontSize: 13.5, fontWeight: 500,  letterSpacing: "-0.01em"  } as React.CSSProperties,
};

// ─── SVG SILHOUETTES ARBRES ──────────────────────────────────────────────────
function TreeSilhouettes({
  color = "rgba(46,125,79,0.07)",
  height = 64,
  variant = "pine",
}: {
  color?: string;
  height?: number;
  variant?: "pine" | "round";
}) {
  const pines = [
    { x: 0,   w: 18, h: 48 },{ x: 14,  w: 22, h: 60 },{ x: 30,  w: 16, h: 42 },
    { x: 44,  w: 24, h: 64 },{ x: 62,  w: 18, h: 50 },{ x: 76,  w: 20, h: 55 },
    { x: 92,  w: 15, h: 38 },{ x: 104, w: 26, h: 68 },{ x: 124, w: 18, h: 46 },
    { x: 138, w: 22, h: 58 },{ x: 154, w: 16, h: 40 },{ x: 166, w: 24, h: 62 },
    { x: 184, w: 20, h: 52 },{ x: 200, w: 18, h: 44 },{ x: 214, w: 26, h: 70 },
    { x: 234, w: 16, h: 36 },{ x: 246, w: 22, h: 56 },{ x: 262, w: 18, h: 48 },
    { x: 276, w: 24, h: 64 },{ x: 294, w: 20, h: 50 },
  ];

  if (variant === "pine") {
    return (
      <svg viewBox={`0 0 320 ${height}`} preserveAspectRatio="xMidYMax meet"
        style={{ width: "100%", height, display: "block" }} aria-hidden="true">
        {pines.map((p, i) => {
          const trunk = { w: p.w * 0.22, h: p.h * 0.18 };
          const tx = p.x + p.w / 2 - trunk.w / 2;
          return (
            <g key={i} fill={color}>
              <polygon points={`${p.x + p.w / 2},${height - p.h} ${p.x},${height - trunk.h} ${p.x + p.w},${height - trunk.h}`} />
              <rect x={tx} y={height - trunk.h} width={trunk.w} height={trunk.h} />
            </g>
          );
        })}
      </svg>
    );
  }
  return (
    <svg viewBox={`0 0 320 ${height}`} preserveAspectRatio="xMidYMax meet"
      style={{ width: "100%", height, display: "block" }} aria-hidden="true">
      {pines.map((p, i) => {
        const r = p.w * 0.52;
        const cx = p.x + p.w / 2;
        const cy = height - p.h * 0.55;
        const trunkW = p.w * 0.18;
        const trunkH = p.h * 0.2;
        return (
          <g key={i} fill={color}>
            <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.9} />
            <rect x={cx - trunkW / 2} y={height - trunkH} width={trunkW} height={trunkH} />
          </g>
        );
      })}
    </svg>
  );
}

// ─── ICÔNES SVG ───────────────────────────────────────────────────────────────
const Ico = {
  Search: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <circle cx="10" cy="10" r="7"/><path d="M17 17l4 4"/>
    </svg>
  ),
  Close: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
  Clock: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
    </svg>
  ),
  Globe: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/>
    </svg>
  ),
  Leaf: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M20 5c0 0-8 0-13 5C4 13 4 19 4 19s6 0 9-3c5-5 5-11 7-11z"/><path d="M4 19l7-7"/>
    </svg>
  ),
  Seed: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M12 22V12M12 12C12 6 7 4 2 5c0 6 3 10 8 11 1 .3 2 0 2-4z"/>
      <path d="M12 12c0-6 5-8 10-7-1 6-4 10-8 11-1 .3-2 0-2-4z"/>
    </svg>
  ),
  Drop: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M12 2L6 10a7 7 0 1 0 12 0L12 2z"/>
    </svg>
  ),
  Tractor: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <circle cx="6" cy="17" r="3"/><circle cx="16" cy="18" r="2"/>
      <path d="M9 17h5V12L11 7H5v10M14 12h5l-2-5"/>
    </svg>
  ),
  Wind: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M3 8h13a4 4 0 1 0-4-4"/><path d="M3 12h10a3 3 0 1 1-3 3"/>
    </svg>
  ),
  Pump: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <rect x="4" y="7" width="8" height="12" rx="1"/>
      <path d="M12 10h4a2 2 0 0 1 2 2v5M18 17h2M4 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  Pipe: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M3 8h12a4 4 0 0 1 4 4v.5"/>
      <path d="M3 8l3-3M3 8l3 3"/><circle cx="19" cy="14.5" r="1.5"/>
    </svg>
  ),
  Cal: (p: React.SVGProps<SVGSVGElement>) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  ),
};

// ─── CONFIG NAVIGATION ────────────────────────────────────────────────────────
const ACTIVITIES_CFG = [
  { key:"seeds",   href:"/activites/semences-et-plants",      Icon:Ico.Seed,    navKey:"semences",      descKey:"seeds_desc",  badgeKey:"seeds_badge", subs:["seeds_sub1","seeds_sub2","seeds_sub3","seeds_sub4","seeds_sub5"] },
  { key:"irr",     href:"/activites/irrigation",              Icon:Ico.Drop,    navKey:"irrigation",    descKey:"irr_desc",    badgeKey:"irr_badge",   subs:["irr_sub1","irr_sub2","irr_sub3","irr_sub4","irr_sub5"] },
  { key:"fert",    href:"/activites/fertilisation",           Icon:Ico.Leaf,    navKey:"fertilisation", descKey:"fert_desc",   badgeKey:null,          subs:["fert_sub1","fert_sub2","fert_sub3","fert_sub4"] },
  { key:"machine", href:"/activites/machinisme-et-jardinage", Icon:Ico.Tractor, navKey:"machinisme",    descKey:"mach_desc",   badgeKey:null,          subs:["mach_sub1","mach_sub2","mach_sub3","mach_sub4"] },
  { key:"spray",   href:"/activites/pulverisation",           Icon:Ico.Wind,    navKey:"pulverisation", descKey:"spray_desc",  badgeKey:"spray_badge", subs:["spray_sub1","spray_sub2","spray_sub3","spray_sub4","spray_sub5"] },
];

const BRANDS_CFG = [
  { key:"fertivert", href:"/marques/fertivert", Icon:Ico.Leaf, name:"Fertivert", subKey:"fertivert_sub", catKeys:["brands_fv_cat1","brands_fv_cat2","brands_fv_cat3","brands_fv_cat4","brands_fv_cat5","brands_fv_cat6"] },
  { key:"pulvert",   href:"/marques/pulvert",   Icon:Ico.Pump, name:"Pulvert",   subKey:"pulvert_sub",   catKeys:["brands_pv_cat1","brands_pv_cat2","brands_pv_cat3","brands_pv_cat4","brands_pv_cat5"] },
  { key:"matar",     href:"/marques/matar",     Icon:Ico.Pipe, name:"Matar",     subKey:"matar_sub",     catKeys:["brands_mt_cat1","brands_mt_cat2","brands_mt_cat3","brands_mt_cat4","brands_mt_cat5"] },
];

const FERTIVERT_MOBILE = [
  {
    id:"pro", label:"Fertivert Pro", subKey:"fv_pro_sub",
    href:"/marques/fertivert?division=pro", color:"#2e7d4f", light:"#dff2e8", Icon:Ico.Leaf,
    cats:[
      { id:"support-culture-pro",   label:"Support de Culture",     subs:["Terreau Pro 50L","Fumier Composté 40kg","Compost Végétal 50L"] },
      { id:"engrais-fond-pro",      label:"Engrais de Fond",        subs:["Ferti Fond NPK","Fumure Organique"] },
      { id:"engrais-organique-pro", label:"Engrais Organique",      subs:["Ferti Micro Granulé","Ferti Actif","Ferti Fruit","Ferti Leaf"] },
      { id:"fertilisant-pro",       label:"Fertilisant Spécialisé", subs:["Pouss Roots+","Aminal+","Fort Start+","Oceano+"] },
    ],
  },
  {
    id:"garden", label:"Fertivert Garden", subKey:"fv_garden_sub",
    href:"/marques/fertivert?division=garden", color:"#1b6b3a", light:"#e6f5ec", Icon:Ico.Leaf,
    cats:[
      { id:"gazon",             label:"Gazon",             subs:["Terreau Gazon","Fumier Gazon","Granulé Gazon"] },
      { id:"engrais-chimiques", label:"Engrais Chimiques", subs:["Oliviers 2kg","Agrumes 2kg","Potager 2kg"] },
      { id:"liquide-garden",    label:"Liquide",           subs:["Universel 1L","Plantes Vertes 1L","Cactées 1L"] },
    ],
  },
];

const OTHER_BRANDS_CFG = [
  { key:"pulvert", href:"/marques/pulvert", color:"#3d6b3a", Icon:Ico.Pump, name:"Pulvert", subKey:"pulvert_sub" },
  { key:"matar",   href:"/marques/matar",   color:"#2a5f78", Icon:Ico.Pipe, name:"Matar",   subKey:"matar_sub"   },
];

const LANGS = [
  { code:"fr", short:"FR", full:"Français", flag:"🇫🇷" },
  { code:"ar", short:"ع",  full:"العربية",  flag:"🇹🇳" },
  { code:"en", short:"EN", full:"English",  flag:"🇬🇧" },
  { code:"it", short:"IT", full:"Italiano", flag:"🇮🇹" },
  { code:"es", short:"ES", full:"Español",  flag:"🇪🇸" },
];

// ─── TYPE PRODUIT SPOTLIGHT ───────────────────────────────────────────────────
// Adapté depuis ProduitPublic du backend
export type SpotlightProduct = {
  id:     number;
  name:   string;
  brand:  string;
  cat:    string;
  marque: string;
  div:    string | null;
  desc:   string;
  href:   string;
  icon:   string;
  tags:   string[];
};

const BRAND_META: Record<string, { color:string; bg:string; border:string }> = {
  fertivert: { color:"#1b5e38", bg:"#d4edde", border:"#86c9a0" },
  pulvert:   { color:"#3a5e1f", bg:"#deecd4", border:"#9ec986" },
  matar:     { color:"#1a4f78", bg:"#d4e8f5", border:"#86b8d9" },
};
const DIV_META: Record<string, { color:string; bg:string }> = {
  pro:    { color:"#1b5e38", bg:"#c8ebd8" },
  garden: { color:"#4a2d9c", bg:"#e0d8f8" },
};

// ─── HOOK : charge les produits depuis le backend pour le Spotlight ───────────
function useSpotlightProducts() {
  const [products, setProducts] = useState<SpotlightProduct[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getProduits({ limit: 200 })
      .then((res) => {
        if (res.success && res.data) {
          const mapped: SpotlightProduct[] = res.data.map((p) => ({
            id:     p.id_produit,
            name:   p.nom,
            brand:  p.marque?.nom ?? "",
            cat:    p.categorie?.nom ?? "",
            marque: p.marque?.slug ?? "",
            div:    p.division ?? null,
            desc:   p.description ?? "",
            href:   `/marques/${p.marque?.slug ?? ""}`,
            icon:   "🌿",
            tags:   Array.isArray(p.tags) ? (p.tags as string[]) : [],
          }));
          setProducts(mapped);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { products, loading };
}

// ─── SCORING ──────────────────────────────────────────────────────────────────
function score(p: SpotlightProduct, q: string): number {
  const lq = q.toLowerCase().trim();
  if (!lq) return 1;
  let s = 0;
  if (p.name.toLowerCase().startsWith(lq))  s += 20;
  if (p.name.toLowerCase().includes(lq))    s += 10;
  if (p.cat.toLowerCase().includes(lq))     s += 6;
  if (p.brand.toLowerCase().includes(lq))   s += 5;
  if (p.desc.toLowerCase().includes(lq))    s += 4;
  p.tags.forEach((t) => { if (t.includes(lq)) s += 3; });
  lq.split(" ").forEach((w) => {
    if (w.length < 2) return;
    if (p.name.toLowerCase().includes(w)) s += 2;
    p.tags.forEach((t) => { if (t.includes(w)) s += 1; });
  });
  return s;
}

function hl(text: string, q: string): React.ReactNode {
  if (!q || q.trim().length < 1) return <>{text}</>;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return (
    <>
      {text.split(re).map((p, i) =>
        re.test(p)
          ? <mark key={i} style={{ background: C.markBg, color: C.markFg, borderRadius: 3, padding: "0 2px" }}>{p}</mark>
          : p
      )}
    </>
  );
}

// ─── HOOK HOVER ───────────────────────────────────────────────────────────────
function useHover(delay = 180) {
  const [open, setOpen] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback(() => { t.current && clearTimeout(t.current); setOpen(true); }, []);
  const hide = useCallback(() => { t.current = setTimeout(() => setOpen(false), delay); }, [delay]);
  const keep = useCallback(() => { t.current && clearTimeout(t.current); }, []);
  useEffect(() => () => { t.current && clearTimeout(t.current); }, []);
  return { open, show, hide, keep };
}

// ─── SEARCH ICON BUTTON ───────────────────────────────────────────────────────
function SearchIconBtn({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <motion.button onClick={onClick} title="Rechercher ⌘K" whileTap={{ scale: 0.88 }}
      style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        border: `2px solid ${isOpen ? C.sageMd : C.border}`,
        background: isOpen ? `linear-gradient(135deg, ${C.sageLt}, #c8f0d8)` : "#fff",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
        transition: "background 0.2s, border-color 0.2s",
        boxShadow: isOpen ? `0 0 0 3px rgba(46,125,79,0.15)` : "none",
      }}>
      <motion.span animate={{ opacity: isOpen ? 0 : 1, rotate: isOpen ? 45 : 0, scale: isOpen ? 0.5 : 1 }}
        transition={{ duration: 0.25 }} style={{ position: "absolute", display: "flex" }}>
        <Ico.Search style={{ width: 16, height: 16, color: C.ink2 }} />
      </motion.span>
      <motion.span animate={{ opacity: isOpen ? 1 : 0, rotate: isOpen ? 0 : -45, scale: isOpen ? 1 : 0.5 }}
        transition={{ duration: 0.25 }} style={{ position: "absolute", display: "flex" }}>
        <Ico.Close style={{ width: 16, height: 16, color: C.sage }} />
      </motion.span>
    </motion.button>
  );
}

// ─── LOGO ESPACE VERT ─────────────────────────────────────────────────────────
function EspaceVertLogo() {
  const [imgError, setImgError] = useState(false);
  if (!imgError) {
    return (
      <Image src="/logos/LOGO ESPACE VERT.png" alt="Espace Vert" width={280} height={80}
        style={{ objectFit: "contain", height: 80, width: "auto", maxWidth: 280, display: "block" }}
        onError={() => setImgError(true)} priority />
    );
  }
  return (
    <div style={{
      width: 56, height: 56, borderRadius: 12,
      background: `linear-gradient(140deg, ${C.gradA}, ${C.gradB})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 3px 10px rgba(46,125,79,0.35)`, flexShrink: 0,
    }}>
      <Ico.Leaf style={{ width: 28, height: 28, color: "rgba(255,255,255,0.95)" }} />
    </div>
  );
}

// ─── SPOTLIGHT (RECHERCHE DYNAMIQUE BACKEND) ──────────────────────────────────
function Spotlight({ open, onClose, locale }: { open: boolean; onClose: () => void; locale: string }) {
  const { products, loading: productsLoading } = useSpotlightProducts();

  const [q, setQ]           = useState("");
  const [active, setActive] = useState(-1);
  const [hist, setHist]     = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);
  const router   = useRouter();

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem("ev_hist") || "[]");
      if (Array.isArray(s)) setHist(s);
    } catch {}
  }, []);

  const saveHist = (term: string) => {
    const next = [term, ...hist.filter((h) => h.toLowerCase() !== term.toLowerCase())].slice(0, MAX_HIST);
    setHist(next);
    try { localStorage.setItem("ev_hist", JSON.stringify(next)); } catch {}
  };

  const removeHist = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = hist.filter((h) => h !== term);
    setHist(next);
    try { localStorage.setItem("ev_hist", JSON.stringify(next)); } catch {}
  };

  const clearHist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHist([]);
    try { localStorage.removeItem("ev_hist"); } catch {}
  };

  useEffect(() => {
    if (open) { setQ(""); setActive(-1); setTimeout(() => inputRef.current?.focus(), 60); }
  }, [open]);
  useEffect(() => { setActive(-1); }, [q]);

  // CORRECTION : utilise les produits du backend au lieu de PRODUCTS statique
  const results: SpotlightProduct[] = q.trim().length >= 1
    ? products.map((p) => ({ p, s: score(p, q) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 8).map((x) => x.p)
    : [];

  const showResults = q.trim().length >= 1;
  const showHist    = !showResults && hist.length > 0;
  const itemCount   = showResults ? results.length : hist.length;

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, itemCount - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActive((i) => Math.max(i - 1, -1)); }
      if (e.key === "Enter") {
        e.preventDefault();
        if (showResults && results[active]) go(results[active].href, results[active].name);
        else if (showHist && hist[active])  setQ(hist[active]);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, active, results, hist, showResults, showHist, itemCount]);

  useEffect(() => {
    if (!listRef.current || active < 0) return;
    (listRef.current.querySelector(`[data-i="${active}"]`) as HTMLElement)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [active]);

  const go = (href: string, name: string) => {
    saveHist(name); router.push(`/${locale}${href}`); onClose();
  };

  const itemBase: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 12,
    padding: "9px 12px", margin: "1px 4px", borderRadius: 10,
    cursor: "pointer", transition: "background 0.1s, border-color 0.1s",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }} className="fixed inset-0 z-[199]"
            style={{ background: "rgba(10,28,18,0.65)", backdropFilter: "blur(10px)" }}
            onMouseDown={onClose} />

          <motion.div key="modal" initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ type: "spring", stiffness: 520, damping: 40, mass: 0.55 }}
            className="fixed inset-x-0 top-0 z-[200] mx-auto px-4" style={{ maxWidth: 700 }}
            onMouseDown={(e) => e.stopPropagation()}>
            <div style={{
              background: "#fff", borderRadius: "0 0 20px 20px",
              boxShadow: "0 28px 80px rgba(0,0,0,0.22), 0 0 0 1.5px rgba(46,125,79,0.18)",
              overflow: "hidden",
            }}>
              <div style={{ height: 3, background: `linear-gradient(90deg, ${C.gradA}, ${C.gradB}, ${C.gradC})` }} />

              {/* Input bar */}
              <div style={{
                display: "flex", alignItems: "center", height: 64,
                borderBottom: `1.5px solid ${C.stone2}`,
                background: `linear-gradient(180deg, rgba(223,242,232,0.25), transparent)`,
                position: "relative",
              }}>
                <div style={{ width: 56, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Ico.Search style={{ width: 18, height: 18, color: C.sageMd }} />
                </div>
                <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
                  placeholder="Rechercher un produit…"
                  style={{
                    flex: 1, border: "none", outline: "none", background: "transparent",
                    fontSize: 15, fontWeight: 500, letterSpacing: "-0.018em",
                    color: C.ink, caretColor: C.sage,
                  }}
                  className="placeholder:text-[#a8bfb0]" />
                <AnimatePresence>
                  {q && (
                    <motion.button initial={{ opacity: 0, scale: 0.4, rotate: -90 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.4, rotate: 90 }}
                      transition={{ type: "spring", stiffness: 500, damping: 28 }}
                      onMouseDown={(e) => { e.stopPropagation(); setQ(""); inputRef.current?.focus(); }}
                      whileHover={{ scale: 1.12, background: "#f0f0f0", rotate: 90 }} whileTap={{ scale: 0.85 }}
                      style={{
                        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                        background: "#e8e8e8", border: `1.5px solid #d0d0d0`,
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                      <Ico.Close style={{ width: 11, height: 11, color: "#222" }} />
                    </motion.button>
                  )}
                </AnimatePresence>
                <motion.button onMouseDown={(e) => { e.stopPropagation(); onClose(); }}
                  whileHover={{ rotate: 90, scale: 1.1, background: "#e8e8e8" }} whileTap={{ scale: 0.85 }}
                  title="Fermer"
                  style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    background: "#f2f2f2", border: `1.5px solid #d8d8d8`,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 12px 0 8px",
                  }}>
                  <Ico.Close style={{ width: 13, height: 13, color: "#111" }} />
                </motion.button>
              </div>

              {/* Body */}
              <div ref={listRef} style={{
                maxHeight: 380, overflowY: "auto", padding: "6px 0 10px",
                position: "relative",
                background: !showResults && !showHist ? `linear-gradient(180deg, #fff 60%, ${C.sageLt} 100%)` : "#fff",
              }}>
                {!showResults && !showHist && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, opacity: 0.5, pointerEvents: "none" }}>
                    <TreeSilhouettes color="rgba(46,125,79,0.12)" height={60} variant="pine" />
                  </div>
                )}

                {/* Loading produits */}
                {showResults && productsLoading && (
                  <div style={{ padding: "28px 20px", textAlign: "center" }}>
                    <p style={{ ...TY.itemDesc, color: C.ink3 }}>Chargement des produits…</p>
                  </div>
                )}

                {/* Historique */}
                {showHist && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px 4px" }}>
                      <span style={{ ...TY.secLabel, color: C.ink3 }}>Récent</span>
                      <motion.button onClick={clearHist} whileHover={{ color: C.red }}
                        style={{ ...TY.hint, fontSize: 12, fontWeight: 700, color: C.ink3, background: "none", border: "none", cursor: "pointer" }}>
                        Tout effacer
                      </motion.button>
                    </div>
                    {hist.map((term, i) => {
                      const isOn = i === active;
                      return (
                        <motion.div key={term} data-i={i} layout
                          initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 12, transition: { duration: 0.15 } }}
                          transition={{ delay: i * 0.03 }}
                          onMouseEnter={() => setActive(i)}
                          onMouseDown={(e) => { e.stopPropagation(); setQ(term); inputRef.current?.focus(); }}
                          style={{ ...itemBase, background: isOn ? C.sageLt : "transparent", borderLeft: `2.5px solid ${isOn ? C.sage : "transparent"}` }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                            background: isOn ? `linear-gradient(135deg, ${C.sageLt}, #c8f0d8)` : C.stone,
                            border: `1.5px solid ${isOn ? C.sageMd : C.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <Ico.Clock style={{ width: 14, height: 14, color: isOn ? C.sage : C.ink3 }} />
                          </div>
                          <span style={{ ...TY.histTerm, flex: 1, color: isOn ? C.ink : C.ink2 }}>{term}</span>
                          <motion.button onMouseDown={(e) => removeHist(term, e)}
                            whileHover={{ rotate: 90, scale: 1.15, background: C.redLt }} whileTap={{ scale: 0.85 }}
                            style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Ico.Close style={{ width: 10, height: 10, color: C.red }} />
                          </motion.button>
                        </motion.div>
                      );
                    })}
                  </>
                )}

                {/* Aucun résultat */}
                {showResults && !productsLoading && results.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ padding: "28px 20px", textAlign: "center" }}>
                    <p style={{ ...TY.itemName, color: C.ink2, marginBottom: 5 }}>Aucun produit pour « {q} »</p>
                    <p style={{ ...TY.itemDesc, color: C.ink3 }}>Essayez ferti, gazon, drip, npk, tuyau…</p>
                  </motion.div>
                )}

                {/* Résultats */}
                {showResults && !productsLoading && results.length > 0 && (
                  <>
                    <div style={{ ...TY.secLabel, color: C.ink3, padding: "8px 16px 4px" }}>
                      {results.length} produit{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
                    </div>
                    {results.map((p, i) => {
                      const isOn = i === active;
                      return (
                        <motion.div key={p.id} data-i={i}
                          initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.025, duration: 0.13 }}
                          onMouseEnter={() => setActive(i)}
                          onMouseDown={(e) => { e.stopPropagation(); go(p.href, p.name); }}
                          style={{ ...itemBase, background: isOn ? `linear-gradient(90deg, ${C.sageLt}, #e8f8ef)` : "transparent", borderLeft: `2.5px solid ${isOn ? C.sage : "transparent"}` }}>
                          <div style={{
                            width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                            background: isOn ? `linear-gradient(135deg, ${C.sage}, ${C.sageMd})` : C.stone,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 19, transition: "background 0.15s",
                            boxShadow: isOn ? `0 4px 12px rgba(46,125,79,0.28)` : "none",
                          }}>
                            <span style={{ filter: isOn ? "brightness(10)" : "none" }}>{p.icon}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ ...TY.itemName, color: isOn ? C.sage : C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {hl(p.name, q)}
                            </p>
                            <p style={{ ...TY.itemDesc, color: C.ink3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                              {p.desc}
                            </p>
                          </div>
                          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                            {p.div && (
                              <span style={{ ...TY.badge, padding: "2px 8px", borderRadius: 5, background: DIV_META[p.div]?.bg, color: DIV_META[p.div]?.color }}>
                                {p.div === "pro" ? "Pro" : "Garden"}
                              </span>
                            )}
                            <span style={{ ...TY.badge, padding: "2px 8px", borderRadius: 5, background: BRAND_META[p.marque]?.bg, color: BRAND_META[p.marque]?.color, border: `1.5px solid ${BRAND_META[p.marque]?.border}` }}>
                              {p.brand.split(" ")[0]}
                            </span>
                          </div>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
                            style={{ width: 13, height: 13, flexShrink: 0, color: isOn ? C.sage : C.ink4, transform: isOn ? "translateX(2px)" : "none" }}>
                            <path d="M9 18l6-6-6-6"/>
                          </svg>
                        </motion.div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Footer */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 14px",
                borderTop: `1.5px solid ${C.stone2}`,
                background: `linear-gradient(180deg, ${C.stone} 0%, #edf8f2 100%)`,
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, opacity: 0.35, pointerEvents: "none" }}>
                  <TreeSilhouettes color={C.sageMd} height={22} variant="pine" />
                </div>
                <div style={{ display: "flex", gap: 10, position: "relative", zIndex: 1 }}>
                  {[["↑↓", "naviguer"], ["↵", "ouvrir"], ["esc", "fermer"]].map(([k, l]) => (
                    <span key={k} style={{ ...TY.hint, color: C.ink3, display: "flex", alignItems: "center", gap: 3 }}>
                      <kbd style={{ border: `1.5px solid ${C.border}`, borderRadius: 4, padding: "1px 5px", background: "#fff", fontFamily: "monospace", fontSize: 9.5, color: C.ink2, boxShadow: `0 1.5px 0 ${C.border}` }}>{k}</kbd>
                      {l}
                    </span>
                  ))}
                </div>
                <span style={{ ...TY.hint, color: C.ink3, position: "relative", zIndex: 1 }}>
                  {productsLoading ? "Chargement…" : `${products.length} produits indexés`}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── DROPDOWN ACTIVITÉS ───────────────────────────────────────────────────────
function ActivitesDropdown({ locale, onClose }: { locale: string; onClose: () => void }) {
  const t = useTranslations("nav");
  const ACTIVITIES = ACTIVITIES_CFG.map((a) => ({
    ...a,
    label: t(a.navKey as any),
    desc:  t(a.descKey as any),
    badge: a.badgeKey ? t(a.badgeKey as any) : undefined,
    subs:  a.subs.map((s) => t(s as any)),
  }));
  const [hov, setHov] = useState<string | null>(null);
  const act = ACTIVITIES.find((a) => a.key === hov);

  const sideItem = (a: typeof ACTIVITIES[0]) => {
    const on = hov === a.key;
    return (
      <motion.div key={a.key} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ACTIVITIES.indexOf(a) * 0.04 }}>
        <Link href={`/${locale}${a.href}`} onClick={onClose} onMouseEnter={() => setHov(a.key)}
          style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 14px",
            borderLeft: `3px solid ${on ? C.sage : "transparent"}`,
            background: on ? `linear-gradient(90deg, ${C.sageLt}, #e8f8ef)` : "transparent",
            transition: "all 0.12s", textDecoration: "none",
          }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: on ? `linear-gradient(135deg, ${C.sage}, ${C.sageMd})` : "#e2ede7",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.12s",
            boxShadow: on ? `0 3px 8px rgba(46,125,79,0.3)` : "none",
          }}>
            <a.Icon style={{ width: 13, height: 13, color: on ? "#fff" : C.ink3 }} />
          </div>
          <div>
            <p style={{ ...TY.ddItemName, color: on ? C.sage : C.ink }}>{a.label}</p>
            <p style={{ ...TY.ddItemDesc, color: C.ink3 }}>{a.desc}</p>
          </div>
        </Link>
      </motion.div>
    );
  };

  return (
    <div style={{ display: "flex", minWidth: 620 }}>
      <div style={{
        width: 206, flexShrink: 0, padding: "10px 0",
        background: `linear-gradient(180deg, #f0faf4 0%, #dff2e8 60%, #c8ebd8 100%)`,
        borderRight: `1.5px solid ${C.line}`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, pointerEvents: "none" }}>
          <TreeSilhouettes color="rgba(46,125,79,0.1)" height={70} variant="pine" />
        </div>
        <p style={{ ...TY.secLabel, color: C.sage, padding: "4px 16px 10px", position: "relative", zIndex: 1 }}>Activités</p>
        <div style={{ position: "relative", zIndex: 1 }}>{ACTIVITIES.map(sideItem)}</div>
      </div>

      <div style={{ flex: 1, padding: "16px 20px", background: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: 0, right: 0, left: 0, opacity: 0.06, pointerEvents: "none" }}>
          <TreeSilhouettes color={C.sage} height={80} variant="round" />
        </div>
        <AnimatePresence mode="wait">
          {act ? (
            <motion.div key={act.key} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.13 }} style={{ position: "relative", zIndex: 1 }}>
              <p style={{ ...TY.secLabel, color: C.ink3, marginBottom: 12 }}>Sous-catégories · {act.label}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {act.subs.map((sub, i) => (
                  <motion.div key={sub} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Link href={`/${locale}${act.href}`} onClick={onClose}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 9px", borderRadius: 8, textDecoration: "none", transition: "background 0.1s" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = C.sageLt; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: `linear-gradient(135deg, ${C.sage}, ${C.sageMd})`, flexShrink: 0 }} />
                      <span style={{ ...TY.ddCatName, color: C.ink }}>{sub}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
              <Link href={`/${locale}${act.href}`} onClick={onClose}
                style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 14, paddingTop: 12, borderTop: `1.5px solid ${C.line}`, ...TY.cta, color: C.sage, textDecoration: "none" }}>
                Voir tout · {act.label}
                <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M9 18l6-6-6-6"/></svg>
              </Link>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", paddingBlock: 32, position: "relative", zIndex: 1 }}>
              <div>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${C.sageLt}, #c8f0d8)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", boxShadow: `0 4px 12px rgba(46,125,79,0.2)` }}>
                  <Ico.Leaf style={{ width: 22, height: 22, color: C.sage }} />
                </div>
                <p style={{ ...TY.ddItemName, color: C.ink2 }}>{t("hoverActivity")}</p>
                <p style={{ ...TY.ddItemDesc, color: C.ink3, marginTop: 3 }}>pour voir les sous-catégories</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── DROPDOWN MARQUES ─────────────────────────────────────────────────────────
function MarquesDropdown({ locale, onClose }: { locale: string; onClose: () => void }) {
  const t = useTranslations("nav");
  const BRANDS = BRANDS_CFG.map((b) => ({
    ...b,
    sub:  t(b.subKey as any),
    cats: (b as any).catKeys.map((k: string) => t(k as any)),
  }));
  const [hov, setHov] = useState<string | null>(null);
  const brand = BRANDS.find((b) => b.key === hov);

  return (
    <div style={{ display: "flex", minWidth: 580 }}>
      <div style={{
        width: 196, flexShrink: 0, padding: "10px 0",
        background: `linear-gradient(180deg, #edf9f3 0%, #d8f0e4 60%, #bfe6d1 100%)`,
        borderRight: `1.5px solid ${C.line}`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, pointerEvents: "none" }}>
          <TreeSilhouettes color="rgba(46,125,79,0.12)" height={65} variant="round" />
        </div>
        <p style={{ ...TY.secLabel, color: C.sage, padding: "4px 16px 10px", position: "relative", zIndex: 1 }}>{t("ourBrands")}</p>
        <div style={{ position: "relative", zIndex: 1 }}>
          {BRANDS.map((b) => {
            const on = hov === b.key;
            return (
              <Link key={b.key} href={`/${locale}${b.href}`} onClick={onClose} onMouseEnter={() => setHov(b.key)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderLeft: `3px solid ${on ? C.sage : "transparent"}`, background: on ? `linear-gradient(90deg, ${C.sageLt}, #e8f8ef)` : "transparent", transition: "all 0.12s", textDecoration: "none" }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: on ? `linear-gradient(135deg, ${C.sage}, ${C.sageMd})` : "#e2ede7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.12s", boxShadow: on ? `0 3px 8px rgba(46,125,79,0.3)` : "none" }}>
                  <b.Icon style={{ width: 13, height: 13, color: on ? "#fff" : C.ink3 }} />
                </div>
                <div>
                  <p style={{ ...TY.ddItemName, color: on ? C.sage : C.ink }}>{b.name}</p>
                  <p style={{ ...TY.ddItemDesc, color: C.ink3 }}>{(b as any).sub}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, padding: "16px 20px", background: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: 0, right: 0, left: 0, opacity: 0.06, pointerEvents: "none" }}>
          <TreeSilhouettes color={C.sage} height={80} variant="pine" />
        </div>
        <AnimatePresence mode="wait">
          {brand ? (
            <motion.div key={brand.key} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.13 }} style={{ position: "relative", zIndex: 1 }}>
              <p style={{ ...TY.secLabel, color: C.ink3, marginBottom: 12 }}>Catégories · {brand.name}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {brand.cats.map((cat: string) => (
                  <Link key={cat} href={`/${locale}${brand.href}`} onClick={onClose}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 9px", borderRadius: 8, textDecoration: "none", transition: "background 0.1s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = C.sageLt; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: `linear-gradient(135deg, ${C.sage}, ${C.sageMd})`, flexShrink: 0 }} />
                    <span style={{ ...TY.ddCatName, color: C.ink }}>{cat}</span>
                  </Link>
                ))}
              </div>
              <Link href={`/${locale}${brand.href}`} onClick={onClose}
                style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 14, paddingTop: 12, borderTop: `1.5px solid ${C.line}`, ...TY.cta, color: C.sage, textDecoration: "none" }}>
                Voir tout · {brand.name}
                <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M9 18l6-6-6-6"/></svg>
              </Link>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", paddingBlock: 32, position: "relative", zIndex: 1 }}>
              <div>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${C.sageLt}, #c8f0d8)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", boxShadow: `0 4px 12px rgba(46,125,79,0.2)` }}>
                  <Ico.Leaf style={{ width: 22, height: 22, color: C.sage }} />
                </div>
                <p style={{ ...TY.ddItemName, color: C.ink2 }}>{t("hoverBrand")}</p>
                <p style={{ ...TY.ddItemDesc, color: C.ink3, marginTop: 3 }}>pour voir les catégories</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── NAVBAR PRINCIPALE ────────────────────────────────────────────────────────
export default function Navbar() {
  const t        = useTranslations("nav");
  const locale   = useLocale();
  const router   = useRouter();
  const pathname = usePathname();

  const ACTIVITIES = ACTIVITIES_CFG.map((a) => ({
    ...a, label: t(a.navKey as any), desc: t(a.descKey as any),
    badge: a.badgeKey ? t(a.badgeKey as any) : undefined,
    subs: a.subs.map((s) => t(s as any)),
  }));
  const OTHER_BRANDS = OTHER_BRANDS_CFG.map((b) => ({ ...b, sub: t(b.subKey as any) }));

  const [scrolled,   setScrolled]   = useState(false);
  const [spOpen,     setSpOpen]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSec,  setMobileSec]  = useState<string | null>(null);

  const acts    = useHover(150);
  const marques = useHover(220);
  const lang    = useHover(150);

  const isActive = (p: string) => pathname.includes(p);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    fn(); window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setMobileOpen(false); setSpOpen(false); }, [pathname]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSpOpen((v) => !v); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const changeLocale = (code: string) => {
    const segs = pathname.split("/"); segs[1] = code;
    window.location.href = segs.join("/") || `/${code}`;
  };
  const curLang = LANGS.find((l) => l.code === locale) ?? LANGS[0];

  const scrollTo = (id: string) => {
    const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
    if (isHome) document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    else router.push(`/${locale}/#${id}`);
  };

  const nlBase: React.CSSProperties = {
    ...TY.navLink, color: C.ink, padding: "8px 16px", borderRadius: 0,
    cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
    textDecoration: "none", transition: "color 0.15s",
    border: "none", background: "transparent",
    borderBottom: "2.5px solid transparent", position: "relative" as const,
  };
  const nlOn: React.CSSProperties  = { ...nlBase, ...TY.navLinkOn, color: C.sage, borderBottom: `2.5px solid ${C.sage}` };
  const nlBtn: React.CSSProperties = { ...nlBase, fontFamily: "inherit" };

  const dropShadow = "0 20px 60px rgba(0,0,0,0.13), 0 0 0 1.5px rgba(46,125,79,0.14)";

  return (
    <>
      <Spotlight open={spOpen} onClose={() => setSpOpen(false)} locale={locale} />

      <nav className="fixed inset-x-0 top-0 z-50"
        style={{
          background: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.93)",
          backdropFilter: "blur(28px)",
          borderBottom: `1.5px solid ${scrolled ? "rgba(46,125,79,0.15)" : C.line}`,
          boxShadow: scrolled ? `0 2px 24px rgba(46,125,79,0.1)` : "none",
          transition: "box-shadow 0.3s, border-color 0.3s, background 0.3s",
        }}>
        <div style={{ height: 2.5, background: `linear-gradient(90deg, ${C.gradA} 0%, ${C.gradB} 50%, ${C.gradC} 100%)` }} />

        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div style={{ display: "flex", alignItems: "center", height: NAV_H }}>

            {/* Logo */}
            <Link href={`/${locale}`}
              style={{ display: "flex", alignItems: "center", marginRight: 48, flexShrink: 0, textDecoration: "none", lineHeight: 0 }}>
              <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.02 }} style={{ lineHeight: 0 }}>
                <EspaceVertLogo />
              </motion.div>
            </Link>

            {/* Liens centraux */}
            <div className="hidden lg:flex" style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 4, height: "100%" }}>
              <Link href={`/${locale}/qui-sommes-nous`} style={isActive("/qui-sommes-nous") ? nlOn : nlBase} className="hover:text-[#2e7d4f]">
                {t("about")}
              </Link>

              {/* Activités */}
              <div style={{ position: "relative" }} onMouseEnter={acts.show} onMouseLeave={acts.hide}>
                <button style={acts.open || isActive("/activites") ? nlOn : nlBtn} className="hover:text-[#2e7d4f]"
                  onClick={() => scrollTo("nos-activites")}>
                  {t("activities")}
                  <motion.span animate={{ rotate: acts.open ? 180 : 0 }} transition={{ duration: 0.22 }} style={{ display: "flex", alignItems: "center" }}>
                    <ChevronDownIcon style={{ width: 12, height: 12, opacity: 0.5 }} />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {acts.open && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }}
                      onMouseEnter={acts.keep} onMouseLeave={acts.hide}
                      style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: 8, borderRadius: 18, overflow: "hidden", zIndex: 60, boxShadow: dropShadow }}>
                      <ActivitesDropdown locale={locale} onClose={acts.hide} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Marques */}
              <div style={{ position: "relative" }} onMouseEnter={marques.show} onMouseLeave={marques.hide}>
                <button style={marques.open || isActive("/marques") ? nlOn : nlBtn} className="hover:text-[#2e7d4f]"
                  onClick={() => scrollTo("nos-marques")}>
                  {t("brands")}
                  <motion.span animate={{ rotate: marques.open ? 180 : 0 }} transition={{ duration: 0.22 }} style={{ display: "flex", alignItems: "center" }}>
                    <ChevronDownIcon style={{ width: 12, height: 12, opacity: 0.5 }} />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {marques.open && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }}
                      onMouseEnter={marques.keep} onMouseLeave={marques.hide}
                      style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: 8, borderRadius: 18, overflow: "hidden", zIndex: 60, boxShadow: dropShadow }}>
                      <MarquesDropdown locale={locale} onClose={marques.hide} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href={`/${locale}/contact`} style={isActive("/contact") ? nlOn : nlBase} className="hover:text-[#2e7d4f]">
                {t("contact")}
              </Link>
            </div>

            {/* Droite */}
            <div className="hidden lg:flex" style={{ alignItems: "center", gap: 9, marginLeft: "auto" }}>
              <SearchIconBtn isOpen={spOpen} onClick={() => setSpOpen((v) => !v)} />
              <div style={{ width: 1, height: 22, background: C.border }} />

              {/* Langue */}
              <div style={{ position: "relative" }} onMouseEnter={lang.show} onMouseLeave={lang.hide}>
                <button style={{ ...nlBtn, ...TY.langBtn, color: C.ink2, border: `1.5px solid ${C.border}`, padding: "6px 11px", borderRadius: 9 }}
                  className="hover:border-[#5bab79] hover:text-[#2e7d4f]">
                  <Ico.Globe style={{ width: 13, height: 13 }} />
                  {curLang.short}
                  <motion.span animate={{ rotate: lang.open ? 180 : 0 }} transition={{ duration: 0.22 }} style={{ display: "flex", alignItems: "center", opacity: 0.45 }}>
                    <ChevronDownIcon style={{ width: 11, height: 11 }} />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {lang.open && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.13 }}
                      onMouseEnter={lang.keep} onMouseLeave={lang.hide}
                      style={{ position: "absolute", top: "100%", right: 0, marginTop: 8, width: 175, background: "#fff", borderRadius: 14, overflow: "hidden", zIndex: 60, boxShadow: dropShadow }}>
                      <div style={{ height: 3, background: `linear-gradient(90deg, ${C.gradA}, ${C.gradB}, ${C.gradC})` }} />
                      {LANGS.map((l) => (
                        <button key={l.code} onClick={() => changeLocale(l.code)}
                          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderBottom: `1px solid ${C.stone}`, transition: "background 0.12s", background: locale === l.code ? C.sageLt : "#fff", border: "none", cursor: "pointer" }}
                          className="last:border-0 hover:bg-[#edf8f3]">
                          <div style={{ width: 28, height: 19, borderRadius: 4, background: locale === l.code ? `linear-gradient(135deg, ${C.sage}, ${C.sageMd})` : "#d0d0d0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>{l.short}</span>
                          </div>
                          <span style={{ ...TY.ddItemName, fontSize: 13, color: locale === l.code ? C.sage : C.ink2, flex: 1, textAlign: "left" }}>{l.full}</span>
                          {locale === l.code && <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.sageMd }} />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CTA */}
              <motion.button whileHover={{ scale: 1.03, boxShadow: `0 6px 20px rgba(46,125,79,0.4)` }} whileTap={{ scale: 0.96 }}
                onClick={() => router.push(`/${locale}/rendez-vous`)}
                style={{
                  ...TY.cta, color: "#fff",
                  background: `linear-gradient(135deg, ${C.gradA}, ${C.gradB})`,
                  padding: "9px 18px", borderRadius: 9, border: "none", cursor: "pointer",
                  boxShadow: `0 3px 10px rgba(46,125,79,0.3)`,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                <Ico.Cal style={{ width: 14, height: 14 }} />
                {t("bookRdv")}
              </motion.button>
            </div>

            {/* Burger mobile */}
            <button onClick={() => setMobileOpen((v) => !v)} className="lg:hidden ml-auto p-2.5 rounded-xl"
              style={{ background: C.sageLt, color: C.sage, border: `1.5px solid ${C.border}`, cursor: "pointer" }}>
              <AnimatePresence mode="wait">
                <motion.div key={mobileOpen ? "x" : "bars"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  {mobileOpen ? <XMarkIcon style={{ width: 22, height: 22 }} /> : <Bars3Icon style={{ width: 22, height: 22 }} />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}
            className="fixed inset-x-0 z-40 bg-white overflow-hidden"
            style={{ top: NAV_H + 2.5, borderTop: `1.5px solid ${C.line}`, boxShadow: "0 24px 48px rgba(0,0,0,0.12)" }}>
            <div className="p-4 max-h-[80vh] overflow-y-auto" style={{ display: "flex", flexDirection: "column", gap: 2 }}>

              <Link href={`/${locale}/qui-sommes-nous`} onClick={() => setMobileOpen(false)}
                style={{ ...TY.mobileLink, color: C.ink, padding: "11px 16px", borderRadius: 10, display: "block", textDecoration: "none", transition: "background 0.12s" }}
                className="hover:bg-[#edf8f3] hover:text-[#2e7d4f]">
                {t("about")}
              </Link>

              {/* Activités mobile */}
              <div>
                <button onClick={() => setMobileSec(mobileSec === "acts" ? null : "acts")}
                  style={{ ...TY.mobileLink, color: C.ink, padding: "11px 16px", borderRadius: 10, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", cursor: "pointer" }}
                  className="hover:bg-[#edf8f3]">
                  {t("activities")}
                  <ChevronDownIcon style={{ width: 16, height: 16, transition: "transform 0.2s", transform: mobileSec === "acts" ? "rotate(180deg)" : "none", color: C.ink3 }} />
                </button>
                <AnimatePresence>
                  {mobileSec === "acts" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                      {ACTIVITIES.map((a) => (
                        <Link key={a.key} href={`/${locale}${a.href}`} onClick={() => setMobileOpen(false)}
                          style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 16px 9px 28px", borderRadius: 9, textDecoration: "none", transition: "background 0.11s" }}
                          className="hover:bg-[#dff2e8]">
                          <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg, ${C.sageLt}, #c8f0d8)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1.5px solid ${C.border}` }}>
                            <a.Icon style={{ width: 14, height: 14, color: C.sage }} />
                          </div>
                          <div>
                            <p style={{ ...TY.mobileLink, fontSize: 14, color: C.ink }}>{a.label}</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 2 }}>
                              {a.subs.slice(0, 3).map((s) => <span key={s} style={{ fontSize: 11, color: C.ink3 }}>{s}</span>)}
                            </div>
                          </div>
                          <ChevronRightIcon style={{ width: 14, height: 14, color: C.ink4, marginLeft: "auto", flexShrink: 0 }} />
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Marques mobile */}
              <div>
                <div style={{ display: "flex" }}>
                  <Link href={`/${locale}/marques`} onClick={() => setMobileOpen(false)}
                    style={{ ...TY.mobileLink, color: C.ink, padding: "11px 16px", borderRadius: "10px 0 0 10px", flex: 1, textDecoration: "none", display: "block", transition: "background 0.12s" }}
                    className="hover:bg-[#edf8f3]">
                    {t("brands")}
                  </Link>
                  <button onClick={() => setMobileSec(mobileSec === "brands" ? null : "brands")}
                    style={{ padding: "11px 14px", borderRadius: "0 10px 10px 0", background: "transparent", border: "none", borderLeft: `1.5px solid ${C.line}`, cursor: "pointer", color: C.ink3 }}
                    className="hover:bg-[#edf8f3]">
                    <ChevronDownIcon style={{ width: 16, height: 16, transition: "transform 0.2s", transform: mobileSec === "brands" ? "rotate(180deg)" : "none" }} />
                  </button>
                </div>
                <AnimatePresence>
                  {mobileSec === "brands" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                      {FERTIVERT_MOBILE.map((d) => (
                        <div key={d.id} style={{ marginLeft: 12, marginBottom: 8, borderRadius: 12, border: `1.5px solid ${C.line}`, overflow: "hidden" }}>
                          <Link href={`/${locale}${d.href}`} onClick={() => setMobileOpen(false)}
                            style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 14px", background: d.light, textDecoration: "none" }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: `linear-gradient(135deg, ${d.color}, ${C.sageMd})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 3px 8px rgba(46,125,79,0.25)` }}>
                              <d.Icon style={{ width: 16, height: 16, color: "rgba(255,255,255,0.95)" }} />
                            </div>
                            <div>
                              <p style={{ ...TY.mobileLink, fontSize: 14, color: d.color }}>{d.label}</p>
                              <p style={{ fontSize: 11.5, color: C.ink3 }}>{t(d.subKey as any)}</p>
                            </div>
                            <ChevronRightIcon style={{ width: 14, height: 14, color: C.ink4, marginLeft: "auto" }} />
                          </Link>
                          {d.cats.map((c) => (
                            <Link key={c.id} href={`/${locale}/marques/fertivert?division=${d.id}&category=${c.id}`} onClick={() => setMobileOpen(false)}
                              style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px 8px 18px", borderTop: `1px solid ${C.stone}`, textDecoration: "none", transition: "background 0.1s" }}
                              className="hover:bg-[#edf8f3]">
                              <div style={{ width: 6, height: 6, borderRadius: "50%", background: `linear-gradient(135deg, ${C.sage}, ${C.sageMd})`, flexShrink: 0 }} />
                              <p style={{ ...TY.ddCatName, color: C.ink, flex: 1 }}>{c.label}</p>
                              <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                                {c.subs.slice(0, 2).map((s) => <span key={s} style={{ fontSize: 10, padding: "1px 6px", background: C.sageLt, color: C.sage, borderRadius: 4, fontWeight: 600 }}>{s}</span>)}
                              </div>
                            </Link>
                          ))}
                        </div>
                      ))}
                      {OTHER_BRANDS.map((b) => (
                        <Link key={b.key} href={`/${locale}${b.href}`} onClick={() => setMobileOpen(false)}
                          style={{ display: "flex", alignItems: "center", gap: 11, marginLeft: 12, padding: "10px 14px", borderRadius: 12, border: `1.5px solid ${C.line}`, marginBottom: 8, textDecoration: "none", background: "#fff", transition: "background 0.11s" }}
                          className="hover:bg-[#edf8f3]">
                          <div style={{ width: 36, height: 36, borderRadius: 9, background: `linear-gradient(135deg, ${b.color}, ${C.sageMd})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 3px 8px rgba(0,0,0,0.15)` }}>
                            <b.Icon style={{ width: 16, height: 16, color: "rgba(255,255,255,0.92)" }} />
                          </div>
                          <div>
                            <p style={{ ...TY.mobileLink, fontSize: 14, color: C.ink }}>{b.name}</p>
                            <p style={{ fontSize: 11.5, color: C.ink3 }}>{b.sub}</p>
                          </div>
                          <ChevronRightIcon style={{ width: 14, height: 14, color: C.ink4, marginLeft: "auto" }} />
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href={`/${locale}/contact`} onClick={() => setMobileOpen(false)}
                style={{ ...TY.mobileLink, color: C.ink, padding: "11px 16px", borderRadius: 10, display: "block", textDecoration: "none" }}
                className="hover:bg-[#edf8f3] hover:text-[#2e7d4f]">
                {t("contact")}
              </Link>

              <button onClick={() => { setSpOpen(true); setMobileOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderRadius: 10, background: C.stone, border: `1.5px solid ${C.border}`, cursor: "pointer", width: "100%", marginTop: 4 }}>
                <Ico.Search style={{ width: 15, height: 15, color: C.sageMd }} />
                <span style={{ ...TY.mobileLink, fontSize: 14, color: C.ink3, fontWeight: 400 }}>Rechercher un produit…</span>
              </button>

              <Link href={`/${locale}/rendez-vous`} onClick={() => setMobileOpen(false)}
                style={{ ...TY.cta, color: "#fff", background: `linear-gradient(135deg, ${C.gradA}, ${C.gradB})`, padding: "12px 16px", borderRadius: 10, display: "flex", alignItems: "center", gap: 8, marginTop: 4, textDecoration: "none", boxShadow: `0 4px 14px rgba(46,125,79,0.3)` }}>
                <Ico.Cal style={{ width: 16, height: 16 }} /> {t("bookRdv")}
              </Link>

              {/* Langues */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6, paddingTop: 14, borderTop: `1.5px solid ${C.line}`, marginTop: 6 }}>
                {LANGS.map((l) => (
                  <button key={l.code} onClick={() => { changeLocale(l.code); setMobileOpen(false); }}
                    style={{
                      padding: "8px 0", borderRadius: 9, border: "none", cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                      transition: "all 0.12s", fontSize: 11.5, fontWeight: 700,
                      background: locale === l.code ? `linear-gradient(135deg, ${C.sage}, ${C.sageMd})` : C.stone,
                      color: locale === l.code ? "#fff" : C.ink2,
                      boxShadow: locale === l.code ? `0 3px 8px rgba(46,125,79,0.3)` : "none",
                    }}>
                    <span style={{ fontSize: 16 }}>{l.flag}</span>
                    <span>{l.short}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}