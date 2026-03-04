"use client";

import {
  Bars3Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const NAV_H = 90;

// ─── ICÔNES SVG ───────────────────────────────────────────────────────────────
const Ico = {
  Search: (p: any) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <circle cx="10" cy="10" r="7" />
      <path d="M17 17l4 4" />
    </svg>
  ),
  Globe: (p: any) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" />
    </svg>
  ),
  Leaf: (p: any) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M20 5c0 0-8 0-13 5C4 13 4 19 4 19s6 0 9-3c5-5 5-11 7-11z" />
      <path d="M4 19l7-7" />
    </svg>
  ),
  Seed: (p: any) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M12 22V12M12 12C12 6 7 4 2 5c0 6 3 10 8 11 1 .3 2 0 2-4z" />
      <path d="M12 12c0-6 5-8 10-7-1 6-4 10-8 11-1 .3-2 0-2-4z" />
    </svg>
  ),
  Drop: (p: any) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M12 2L6 10a7 7 0 1 0 12 0L12 2z" />
    </svg>
  ),
  Tractor: (p: any) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <circle cx="6" cy="17" r="3" />
      <circle cx="16" cy="18" r="2" />
      <path d="M9 17h5V12L11 7H5v10M14 12h5l-2-5" />
    </svg>
  ),
  Wind: (p: any) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M3 8h13a4 4 0 1 0-4-4" />
      <path d="M3 12h10a3 3 0 1 1-3 3" />
    </svg>
  ),
  Shovel: (p: any) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M14 4l6 6-9 9H7v-4l9-9z" />
      <path d="M4 20l4-4" />
    </svg>
  ),
  Flask: (p: any) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M9 3h6M10 3v6L5 17a2 2 0 0 0 1.7 3h10.6A2 2 0 0 0 19 17l-5-8V3" />
      <path d="M7 16h10" />
    </svg>
  ),
  Sun: (p: any) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  Grass: (p: any) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M2 20h20M6 20V11c0-3 2-5 4-6M12 20V9c0-4 3-6 5-7M6 20V15" />
    </svg>
  ),
  Pot: (p: any) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M6 9h12l-2 9H8L6 9z" />
      <path d="M4 9h16M9 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  ),
  Recycle: (p: any) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M21 9l-3-6H6L3 9M3 9h18M8 9l-2 12h12L16 9" />
    </svg>
  ),
  Pump: (p: any) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <rect x="4" y="7" width="8" height="12" rx="1" />
      <path d="M12 10h4a2 2 0 0 1 2 2v5M18 17h2M4 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Pipe: (p: any) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M3 8h12a4 4 0 0 1 4 4v.5" />
      <path d="M3 8l3-3M3 8l3 3" />
      <circle cx="19" cy="14.5" r="1.5" />
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
  Cal: (p: any) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  Grid: (p: any) => (
    <svg
      {...p}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
};

// ─── DATA NAVIGATION ──────────────────────────────────────────────────────────
const ACTIVITIES = [
  {
    key: "seeds",
    href: "/activites/semences-et-plants",
    Icon: Ico.Seed,
    label: "Semences & Plants",
    desc: "Variétés maraîchères, fourragères, gazon",
    badge: "Calculateur IA",
    subs: [
      "Légumes & Maraîchage",
      "Arbres Fruitiers",
      "Semences Fourragères",
      "Gazon & Pelouse",
      "Plants de Pomme de Terre",
    ],
  },
  {
    key: "irrigation",
    href: "/activites/irrigation",
    Icon: Ico.Drop,
    label: "Irrigation",
    desc: "Goutte-à-goutte, aspersion, pompage",
    badge: "Bureau d'Étude",
    subs: [
      "Goutte-à-goutte",
      "Aspersion",
      "Pompes & Filtration",
      "Tuyaux & Raccords",
      "Fertirrigation",
    ],
  },
  {
    key: "fertilization",
    href: "/activites/fertilisation",
    Icon: Ico.Leaf,
    label: "Fertilisation",
    desc: "Engrais, biostimulants, correcteurs",
    subs: [
      "Engrais de Fond NPK",
      "Engrais Organiques",
      "Biostimulants",
      "Correcteurs de Carences",
    ],
  },
  {
    key: "machinery",
    href: "/activites/machinisme-et-jardinage",
    Icon: Ico.Tractor,
    label: "Machinisme",
    desc: "Matériel agricole et espaces verts",
    subs: [
      "Machinisme Agricole",
      "Matériel de Jardinage",
      "Équipements Espaces Verts",
      "Matériel de Récolte",
    ],
  },
  {
    key: "spraying",
    href: "/activites/pulverisation",
    Icon: Ico.Wind,
    label: "Pulvérisation",
    desc: "Pulvérisateurs, EPI, produits phyto",
    badge: "Gamme Bio",
    subs: [
      "Pulvérisateurs à Dos",
      "Pulvérisateurs Tracteur",
      "Buses & Accessoires",
      "EPI & Sécurité",
      "Produits Phytosanitaires",
    ],
  },
];

const FERTIVERT = [
  {
    id: "pro",
    label: "Fertivert Pro",
    subtitle: "Agriculture Professionnelle",
    href: "/marques/fertivert?division=pro",
    color: "#1a3d0a",
    accent: "#2d5a1b",
    light: "#f0f9eb",
    Icon: Ico.Leaf,
    cats: [
      {
        id: "support-culture-pro",
        label: "Support de Culture",
        Icon: Ico.Shovel,
        desc: "Substrats et supports organiques",
        subs: [
          "Terreau Professionnel 50L",
          "Fumier Composté 40kg",
          "Compost Végétal 50L",
        ],
      },
      {
        id: "engrais-fond-pro",
        label: "Engrais de Fond",
        Icon: Ico.Drop,
        desc: "Nutrition de base, démarrage optimal",
        subs: ["Ferti Fond NPK", "Ferti Fumure Organique"],
      },
      {
        id: "engrais-organique-pro",
        label: "Engrais Organique",
        Icon: Ico.Leaf,
        desc: "Stimulants biologiques & biostimulants",
        subs: [
          "Ferti Micro Granulé",
          "Ferti Micro Liquide",
          "Ferti Actif",
          "Ferti Fruit",
          "Ferti Leaf",
          "Ferti Go",
        ],
      },
      {
        id: "fertilisant-pro",
        label: "Fertilisant Spécialisé",
        Icon: Ico.Sun,
        desc: "Formules avancées haute performance",
        subs: [
          "Pouss Roots+",
          "Aminal+",
          "Fort Start+",
          "Oceano+",
          "Fulvical+",
          "Sweeter+",
          "CalciMag+",
          "Calcial+",
        ],
      },
    ],
  },
  {
    id: "garden",
    label: "Fertivert Garden",
    subtitle: "Jardin & Gazon",
    href: "/marques/fertivert?division=garden",
    color: "#2d5a1b",
    accent: "#4a7c2f",
    light: "#f5fdf0",
    Icon: Ico.Grass,
    cats: [
      {
        id: "gazon",
        label: "Gazon",
        Icon: Ico.Grass,
        desc: "Solutions complètes pour pelouses",
        subs: [
          "Terreau Gazon",
          "Fumier Gazon",
          "Ferti Fond Gazon",
          "Granulé Gazon",
          "FertiActif",
          "FertiGo",
        ],
      },
      {
        id: "support-culture-garden",
        label: "Support de Culture",
        Icon: Ico.Pot,
        desc: "Substrats pour jardinage amateur",
        subs: ["Terreau Universel", "Fumier Composté", "Compost Végétal"],
      },
      {
        id: "engrais-chimiques",
        label: "Engrais Chimiques",
        Icon: Ico.Flask,
        desc: "Granulés spécialisés par espèce",
        subs: [
          "Oliviers 2kg",
          "Agrumes 2kg",
          "Potager 2kg",
          "Fleurs 2kg",
          "Arbres 2kg",
          "Gazon 2kg",
        ],
      },
      {
        id: "soluble-garden",
        label: "Soluble",
        Icon: Ico.Drop,
        desc: "Hydrosoluble, dissolution instantanée",
        subs: [
          "Agrumes 750g",
          "Légumes 750g",
          "Fertivit 13.40.13",
          "Fertivit 20.20.20",
        ],
      },
      {
        id: "liquide-garden",
        label: "Liquide",
        Icon: Ico.Drop,
        desc: "Prêt à l'emploi, plantes d'intérieur",
        subs: [
          "Universel 1L",
          "Plantes Vertes 1L",
          "Palmiers 1L",
          "Cactées 1L",
          "Fleuries 1L",
          "Agrumes 1L",
        ],
      },
      {
        id: "engrais-organique-garden",
        label: "Engrais Organique",
        Icon: Ico.Recycle,
        desc: "Bio pour jardin naturel & écologique",
        subs: ["Ferti Fort 250g", "Ferti Micro 500g", "Ferti Max 1kg"],
      },
    ],
  },
];

const OTHER_BRANDS = [
  {
    key: "pulvert",
    href: "/marques/pulvert",
    color: "#134e4a",
    Icon: Ico.Pump,
    name: "Pulvert",
    sub: "Pulvérisateurs & Accessoires",
    tags: ["Agricole", "Garden", "SAV"],
  },
  {
    key: "matar",
    href: "/marques/matar",
    color: "#0e3a5f",
    Icon: Ico.Pipe,
    name: "Matar",
    sub: "Irrigation & Arrosage",
    tags: ["Drip", "Smart", "Filtration"],
  },
];

const LANGS = [
  { code: "fr", short: "FR", full: "Français", flag: "🇫🇷" },
  { code: "ar", short: "ع", full: "العربية", flag: "🇹🇳" },
  { code: "en", short: "EN", full: "English", flag: "🇬🇧" },
  { code: "it", short: "IT", full: "Italiano", flag: "🇮🇹" },
  { code: "es", short: "ES", full: "Español", flag: "🇪🇸" },
];

// ─── HOOK HOVER AVEC DÉLAI ────────────────────────────────────────────────────
function useHover(delay = 180) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback(() => {
    timer.current && clearTimeout(timer.current);
    setOpen(true);
  }, []);
  const hide = useCallback(() => {
    timer.current = setTimeout(() => setOpen(false), delay);
  }, [delay]);
  const keep = useCallback(() => {
    timer.current && clearTimeout(timer.current);
  }, []);
  useEffect(
    () => () => {
      timer.current && clearTimeout(timer.current);
    },
    [],
  );
  return { open, show, hide, keep };
}

// ─── SEARCH OVERLAY ───────────────────────────────────────────────────────────
const SEARCH_IDX = [
  { label: "Fertivert Pro", href: "/marques/fertivert?division=pro", cat: "Marque" },
  { label: "Fertivert Garden", href: "/marques/fertivert?division=garden", cat: "Marque" },
  { label: "Pulvert", href: "/marques/pulvert", cat: "Marque" },
  { label: "Matar", href: "/marques/matar", cat: "Marque" },
  { label: "Nos Marques", href: "/marques", cat: "Page" },
  { label: "Contact", href: "/contact", cat: "Page" },
  { label: "Rendez-vous", href: "/rendez-vous", cat: "Page" },
  { label: "Qui Sommes-Nous", href: "/qui-sommes-nous", cat: "Page" },
  { label: "Irrigation", href: "/activites/irrigation", cat: "Activité" },
  { label: "Fertilisation", href: "/activites/fertilisation", cat: "Activité" },
  { label: "Semences & Plants", href: "/activites/semences-et-plants", cat: "Activité" },
  { label: "Pulvérisation", href: "/activites/pulverisation", cat: "Activité" },
  { label: "Machinisme", href: "/activites/machinisme-et-jardinage", cat: "Activité" },
];

const BADGE_COLORS: Record<string, string> = {
  Page: "bg-[#1a3d0a] text-white",
  Activité: "bg-[#2d5a1b] text-white",
  Marque: "bg-[#4a7c2f] text-white",
};

function SearchOverlay({ open, onClose, locale }: { open: boolean; onClose: () => void; locale: string }) {
  const [q, setQ] = useState("");
  const [pages, setPages] = useState(SEARCH_IDX);
  const [editing, setEditing] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) { setQ(""); setTimeout(() => inputRef.current?.focus(), 60); }
  }, [open]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const results = q.length >= 1
    ? pages.filter(i => i.label.toLowerCase().includes(q.toLowerCase())).slice(0, 8)
    : pages.slice(0, 8);

  const go = (href: string) => { router.push(`/${locale}${href}`); onClose(); };

  const handleDelete = (href: string) => setPages(p => p.filter(x => x.href !== href));
  const handleEdit = (item: typeof SEARCH_IDX[0]) => { setEditing(item.href); setEditLabel(item.label); };
  const handleSave = (href: string) => {
    setPages(p => p.map(x => x.href === href ? { ...x, label: editLabel } : x));
    setEditing(null);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[200]"
        style={{ background: "rgba(5,15,5,0.82)", backdropFilter: "blur(18px)" }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: -28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="max-w-2xl mx-auto mt-[12vh] px-4"
        >
          {/* Input */}
          <div
            className="flex items-center gap-3 rounded-2xl px-5 py-4 mb-3"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1.5px solid rgba(140,198,63,0.35)",
              boxShadow: "0 0 0 6px rgba(140,198,63,0.07), 0 32px 64px rgba(0,0,0,0.4)",
            }}
          >
            <Ico.Search className="w-5 h-5 flex-shrink-0" style={{ color: "#8cc63f" }} />
            <input
              ref={inputRef}
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Rechercher un produit, une page, une activité…"
              className="flex-1 bg-transparent outline-none text-white text-base font-medium placeholder-white/30"
            />
            {q && (
              <button onClick={() => setQ("")} className="text-white/30 hover:text-white transition-colors">
                <Ico.X className="w-4 h-4" />
              </button>
            )}
            <kbd
              onClick={onClose}
              className="text-[11px] font-mono border border-white/15 rounded-lg px-2 py-1 text-white/25 cursor-pointer hover:text-white/50 transition-colors flex-shrink-0"
            >
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(12,25,8,0.92)",
              border: "1px solid rgba(140,198,63,0.12)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            }}
          >
            <div className="h-[3px]" style={{ background: "linear-gradient(90deg, #1a3d0a, #8cc63f, #1a3d0a)" }} />
            {results.length === 0 ? (
              <div className="py-12 text-center text-white/30 text-sm">
                Aucun résultat pour « {q} »
              </div>
            ) : (
              <ul>
                {results.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group border-b border-white/5 last:border-0"
                  >
                    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/5 transition-colors">
                      {editing === item.href ? (
                        <div className="flex-1 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <input
                            autoFocus
                            value={editLabel}
                            onChange={e => setEditLabel(e.target.value)}
                            className="flex-1 bg-white/10 border border-[#8cc63f]/40 rounded-lg px-3 py-1.5 text-sm text-white outline-none"
                          />
                          <button onClick={() => handleSave(item.href)} className="text-[#8cc63f] text-xs font-bold hover:text-[#aee065] transition-colors">Sauver</button>
                          <button onClick={() => setEditing(null)} className="text-white/30 text-xs hover:text-white transition-colors">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => go(item.href)} className="flex-1 text-left flex items-center gap-3">
                          <span className="text-sm font-semibold text-white/85 group-hover:text-white transition-colors">{item.label}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black flex-shrink-0 ${BADGE_COLORS[item.cat]}`}>{item.cat}</span>
                        </button>
                      )}
                      {editing !== item.href && (
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(item)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-[#8cc63f] hover:bg-[#8cc63f]/10 transition-all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item.href)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      )}
                      {editing !== item.href && (
                        <ChevronRightIcon className="w-4 h-4 text-white/15 group-hover:text-[#8cc63f]/50 transition-colors flex-shrink-0" />
                      )}
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
            <div className="px-5 py-2.5 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] text-white/20">{results.length} résultat{results.length !== 1 ? "s" : ""}</span>
              <span className="text-[11px] text-white/20">Survolez pour modifier · supprimer</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── SEARCH BAR ───────────────────────────────────────────────────────────────
function SearchBar({ dark, locale }: { dark: boolean; locale: string }) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} locale={locale} />
      <motion.button
        onClick={() => setSearchOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        title="Rechercher (⌘K)"
        className="relative flex items-center gap-2.5 rounded-xl px-4 py-2.5 transition-all group"
        style={{ border: "1.5px solid rgba(16,105,59,0.22)", background: "rgba(16,105,59,0.04)" }}
      >
        <Ico.Search className="w-[17px] h-[17px] text-gray-500 group-hover:text-[#10693B] transition-colors" />
        <span className="text-[13px] font-medium text-gray-400 group-hover:text-[#10693B] transition-colors hidden xl:block">
          Rechercher…
        </span>
        <kbd className="hidden xl:flex items-center gap-0.5 text-[10px] font-mono border border-gray-200 rounded px-1.5 py-0.5 text-gray-300 bg-gray-50">
          ⌘K
        </kbd>
      </motion.button>
    </>
  );
}

// ─── DROPDOWN ACTIVITÉS ───────────────────────────────────────────────────────
function ActivitesDropdown({
  locale,
  onClose,
}: {
  locale: string;
  onClose: () => void;
}) {
  const [hoveredAct, setHoveredAct] = useState<string | null>(null);
  const act = ACTIVITIES.find((a) => a.key === hoveredAct);

  return (
    <div className="flex" style={{ minWidth: 640 }}>
      {/* COL 1 — fond vert sombre */}
      <div
        className="w-64 py-3 border-r flex-shrink-0"
        style={{ background: "linear-gradient(180deg, #0d2106 0%, #1a3d0a 100%)", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="px-4 pb-2">
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#8cc63f" }}>
            Nos Activités
          </p>
        </div>
        {ACTIVITIES.map((a, i) => (
          <motion.div
            key={a.key}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              href={`/${locale}${a.href}`}
              onClick={onClose}
              onMouseEnter={() => setHoveredAct(a.key)}
              className="flex items-center gap-3 px-4 py-3 transition-all group"
              style={{
                backgroundColor: hoveredAct === a.key ? "rgba(140,198,63,0.15)" : "transparent",
                borderLeft: hoveredAct === a.key ? "3px solid #8cc63f" : "3px solid transparent",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: hoveredAct === a.key ? "#8cc63f" : "rgba(255,255,255,0.08)",
                  color: hoveredAct === a.key ? "#0d2106" : "rgba(255,255,255,0.7)",
                  transform: hoveredAct === a.key ? "scale(1.05)" : "scale(1)",
                }}
              >
                <a.Icon className="w-[18px] h-[18px]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[13px] font-black transition-colors"
                    style={{ color: hoveredAct === a.key ? "#fff" : "rgba(255,255,255,0.85)" }}
                  >
                    {a.label}
                  </span>
                  {a.badge && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "#8cc63f", color: "#0d2106" }}>
                      {a.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{a.desc}</p>
              </div>
              <ChevronRightIcon
                className="w-4 h-4 flex-shrink-0 transition-all"
                style={{
                  color: hoveredAct === a.key ? "#8cc63f" : "rgba(255,255,255,0.2)",
                  transform: hoveredAct === a.key ? "translateX(2px)" : "translateX(0)",
                }}
              />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* COL 2 — fond blanc cassé avec accent */}
      <div className="flex-1 py-3 px-4" style={{ background: "#fafdf7" }}>
        <AnimatePresence mode="wait">
          {act ? (
            <motion.div
              key={act.key}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
            >
              <div
                className="flex items-center gap-3 mb-4 pb-3 rounded-xl px-3 py-2.5 mb-3"
                style={{ background: "linear-gradient(135deg, #1a3d0a, #2d5a1b)" }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <act.Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">{act.label}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{act.desc}</p>
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 px-1" style={{ color: "#4a7c2f" }}>
                Sous-catégories
              </p>
              <div className="space-y-0.5">
                {act.subs.map((sub, i) => (
                  <motion.div
                    key={sub}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={`/${locale}${act.href}`}
                      onClick={onClose}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl group transition-all"
                      style={{ color: "#2d4a1a" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "#e8f5d8"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
                    >
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{ background: "#daf0c0" }}
                      >
                        <ChevronRightIcon className="w-3 h-3" style={{ color: "#2d5a1b" }} />
                      </div>
                      <span className="text-[13px] font-semibold">{sub}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
              <Link
                href={`/${locale}${act.href}`}
                onClick={onClose}
                className="mt-4 flex items-center gap-1.5 text-xs font-black transition-colors hover:opacity-70"
                style={{ color: "#1a3d0a" }}
              >
                Voir tout {act.label} <ChevronRightIcon className="w-3 h-3" />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex items-center justify-center text-center py-8"
            >
              <div>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "linear-gradient(135deg, #1a3d0a, #8cc63f)" }}
                >
                  <span className="text-2xl">🌾</span>
                </div>
                <p className="text-sm font-bold" style={{ color: "#2d5a1b" }}>Survolez une activité</p>
                <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>pour voir ses sous-catégories</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── DROPDOWN MARQUES ────────────────────────────────────────────────────────
const BRANDS_NAV = [
  {
    key: "fertivert",
    href: "/marques/fertivert",
    Icon: Ico.Leaf,
    name: "Fertivert",
    sub: "Fertilisation & Nutrition",
    color: "#1a3d0a",
    accent: "#2d5a1b",
    cats: [
      "Support de Culture",
      "Engrais de Fond",
      "Engrais Organique",
      "Fertilisant Spécialisé",
      "Gazon & Garden",
      "Soluble & Liquide",
    ],
  },
  {
    key: "pulvert",
    href: "/marques/pulvert",
    Icon: Ico.Pump,
    name: "Pulvert",
    sub: "Pulvérisateurs & Accessoires",
    color: "#134e4a",
    accent: "#1a6b65",
    cats: [
      "Pulvérisateurs à Dos",
      "Pulvérisateurs Tracteur",
      "Pulvérisateurs Jardin",
      "Buses & Accessoires",
      "EPI & Sécurité",
    ],
  },
  {
    key: "matar",
    href: "/marques/matar",
    Icon: Ico.Pipe,
    name: "Matar",
    sub: "Irrigation & Arrosage",
    color: "#0e3a5f",
    accent: "#1a5a8a",
    cats: [
      "Goutte-à-goutte",
      "Aspersion",
      "Pompes & Filtration",
      "Tuyaux & Raccords",
      "Matar Smart",
    ],
  },
];

function MarquesDropdown({
  locale,
  onClose,
}: {
  locale: string;
  onClose: () => void;
}) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const brand = BRANDS_NAV.find((b) => b.key === hoveredKey);

  return (
    <div className="flex" style={{ minWidth: 560 }}>
      {/* COL 1 — fond vert sombre */}
      <div
        className="w-60 py-3 border-r flex-shrink-0"
        style={{ background: "linear-gradient(180deg, #0d2106 0%, #1a3d0a 100%)", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="px-4 pb-2">
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#8cc63f" }}>
            Nos Marques
          </p>
        </div>
        {BRANDS_NAV.map((b) => (
          <Link
            key={b.key}
            href={`/${locale}${b.href}`}
            onClick={onClose}
            onMouseEnter={() => setHoveredKey(b.key)}
            className="flex items-center gap-3 px-4 py-3 transition-all"
            style={{
              backgroundColor: hoveredKey === b.key ? "rgba(140,198,63,0.15)" : "transparent",
              borderLeft: hoveredKey === b.key ? "3px solid #8cc63f" : "3px solid transparent",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: hoveredKey === b.key ? "#8cc63f" : "rgba(255,255,255,0.08)",
                color: hoveredKey === b.key ? "#0d2106" : "rgba(255,255,255,0.7)",
                transform: hoveredKey === b.key ? "scale(1.05)" : "scale(1)",
              }}
            >
              <b.Icon className="w-[18px] h-[18px]" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[13px] font-black transition-colors"
                style={{ color: hoveredKey === b.key ? "#fff" : "rgba(255,255,255,0.85)" }}
              >
                {b.name}
              </p>
              <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{b.sub}</p>
            </div>
            <ChevronRightIcon
              className="w-4 h-4 flex-shrink-0 transition-all"
              style={{
                color: hoveredKey === b.key ? "#8cc63f" : "rgba(255,255,255,0.2)",
                transform: hoveredKey === b.key ? "translateX(2px)" : "translateX(0)",
              }}
            />
          </Link>
        ))}
      </div>

      {/* COL 2 — fond clair teinté vert */}
      <div className="flex-1 py-3 px-4" style={{ background: "#fafdf7" }}>
        <AnimatePresence mode="wait">
          {brand ? (
            <motion.div
              key={brand.key}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.13 }}
            >
              <div
                className="flex items-center gap-3 mb-3 rounded-xl px-3 py-2.5"
                style={{ background: "linear-gradient(135deg, #1a3d0a, #2d5a1b)" }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <brand.Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">{brand.name}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{brand.sub}</p>
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 px-1" style={{ color: "#4a7c2f" }}>
                Catégories
              </p>
              <div className="space-y-0.5">
                {brand.cats.map((cat) => (
                  <Link
                    key={cat}
                    href={`/${locale}${brand.href}`}
                    onClick={onClose}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
                    style={{ color: "#2d4a1a" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "#e8f5d8"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: "#daf0c0" }}
                    >
                      <ChevronRightIcon className="w-3 h-3" style={{ color: "#2d5a1b" }} />
                    </div>
                    <span className="text-[13px] font-semibold">{cat}</span>
                  </Link>
                ))}
              </div>
              <Link
                href={`/${locale}${brand.href}`}
                onClick={onClose}
                className="mt-4 flex items-center gap-1.5 text-xs font-black transition-opacity hover:opacity-70"
                style={{ color: "#1a3d0a" }}
              >
                Voir tout {brand.name} <ChevronRightIcon className="w-3 h-3" />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex items-center justify-center text-center py-10"
            >
              <div>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "linear-gradient(135deg, #1a3d0a, #8cc63f)" }}
                >
                  <span className="text-2xl">🌿</span>
                </div>
                <p className="text-sm font-bold" style={{ color: "#2d5a1b" }}>Survolez une marque</p>
                <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>pour voir ses catégories</p>
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
  const t = useTranslations("nav");
  const params = useParams();
  const locale = (params?.locale as string) || "fr";
  const router = useRouter();
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);

  const marques = useHover(220);
  const acts = useHover(150);
  const lang = useHover(150);

  const isActive = (path: string) => pathname.includes(path);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const changeLocale = (code: string) =>
    router.push(`/${code}${pathname.replace(`/${locale}`, "")}`);
  const curLang = LANGS.find((l) => l.code === locale) ?? LANGS[0];

  // Scroll to section on homepage, or navigate to homepage first
  const scrollToSection = (sectionId: string) => {
    const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
    if (isHome) {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push(`/${locale}/#${sectionId}`);
    }
  };
  const dark = false;

  const lnk =
    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-semibold tracking-tight transition-all duration-150 text-[#1a3d0a] hover:text-[#006428] hover:bg-[#e8f5dc]";
  const lnkOn =
    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-bold tracking-tight text-[#006428] bg-[#d4edba]";
  const lnkActive =
    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-black tracking-tight text-[#006428] bg-[#c8e8a8]";

  return (
    <>
      {/* ── NAVBAR ─────────────────────────────────────────────────── */}
      <nav
        className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          boxShadow: scrolled
            ? "0 2px 24px rgba(16,105,59,0.10), 0 1px 0 rgba(16,105,59,0.08)"
            : "0 1px 0 rgba(16,105,59,0.07)",
        }}
      >
        <div
          className="absolute bottom-0 left-0 right-0 h-[2.5px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #10693B 25%, #8CC542 50%, #10693B 75%, transparent 100%)",
            opacity: scrolled ? 0.4 : 0.2,
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center h-[90px]">

            {/* ── LOGO — responsive ─────────────────────────────────── */}
            <Link
              href={`/${locale}`}
              className="flex items-center gap-3 flex-shrink-0 mr-3 lg:mr-6"
            >
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.025 }}
                /* Logo bien visible — hauteur augmentée */
                className="flex items-center h-[64px] sm:h-[70px] lg:h-[78px]"
              >
                <Image
                  src="/logos/LOGO ESPACE VERT.png"
                  alt="Espace Vert — الفضاء الأخضر"
                  width={400}
                  height={172}
                  className="h-full w-auto max-w-[260px] sm:max-w-[320px] lg:max-w-[400px] object-contain"
                  style={{
                    filter:
                      "drop-shadow(0 2px 6px rgba(0,100,40,0.22))",
                  }}
                  priority
                />
              </motion.div>
            </Link>
            {/* ──────────────────────────────────────────────────────── */}

            {/* MENU CENTRAL */}
            <div className="hidden lg:flex flex-1 items-center justify-center gap-0.5">
              <Link
                href={`/${locale}/qui-sommes-nous`}
                className={isActive("/qui-sommes-nous") ? lnkActive : lnk}
              >
                {t("about")}
              </Link>

              {/* ACTIVITÉS */}
              <div
                className="relative"
                onMouseEnter={acts.show}
                onMouseLeave={acts.hide}
              >
                <button
                  className={acts.open || isActive("/activites") ? lnkOn : lnk}
                  onClick={() => scrollToSection("nos-activites")}
                >
                  {t("activities")}
                  <motion.div
                    animate={{ rotate: acts.open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDownIcon className="w-4 h-4" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {acts.open && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.14 }}
                      onMouseEnter={acts.keep}
                      onMouseLeave={acts.hide}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 rounded-2xl overflow-hidden z-[60]"
                      style={{
                        boxShadow: "0 24px 64px rgba(13,33,6,0.25), 0 0 0 1px rgba(26,61,10,0.15)",
                      }}
                    >
                      <div className="h-[3px]" style={{ background: "linear-gradient(90deg, #8cc63f, #1a3d0a, #8cc63f)" }} />
                      <ActivitesDropdown locale={locale} onClose={acts.hide} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* MARQUES */}
              <div
                className="relative"
                onMouseEnter={marques.show}
                onMouseLeave={marques.hide}
              >
                <button
                  className={marques.open || isActive("/marques") ? lnkOn : lnk}
                  onClick={() => scrollToSection("nos-marques")}
                >
                  {t("brands")}
                  <motion.div
                    animate={{ rotate: marques.open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDownIcon className="w-4 h-4" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {marques.open && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.14 }}
                      onMouseEnter={marques.keep}
                      onMouseLeave={marques.hide}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 rounded-2xl overflow-hidden z-[60]"
                      style={{
                        boxShadow: "0 24px 64px rgba(13,33,6,0.25), 0 0 0 1px rgba(26,61,10,0.15)",
                      }}
                    >
                      <div className="h-[3px]" style={{ background: "linear-gradient(90deg, #8cc63f, #1a3d0a, #8cc63f)" }} />
                      <MarquesDropdown locale={locale} onClose={marques.hide} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>


              <Link
                href={`/${locale}/contact`}
                className={isActive("/contact") ? lnkActive : lnk}
              >
                {t("contact")}
              </Link>
            </div>

            {/* DROITE */}
            <div className="hidden lg:flex items-center gap-3 ml-auto">
              <SearchBar dark={dark} locale={locale} />
              <div className="w-px h-6 bg-gray-200" />

              {/* Langue */}
              <div
                className="relative"
                onMouseEnter={lang.show}
                onMouseLeave={lang.hide}
              >
                <button
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-[14px] transition-all text-gray-600 hover:text-[#10693B] hover:bg-[#f0f7f2]"
                  style={{ border: "1px solid rgba(16,105,59,0.18)" }}
                >
                  <Ico.Globe className="w-[17px] h-[17px]" />
                  {curLang.short}
                  <motion.div
                    animate={{ rotate: lang.open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDownIcon className="w-3.5 h-3.5" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {lang.open && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.14 }}
                      onMouseEnter={lang.keep}
                      onMouseLeave={lang.hide}
                      className="absolute top-full right-0 mt-2 w-44 bg-white rounded-xl overflow-hidden z-[60]"
                      style={{
                        boxShadow:
                          "0 16px 48px rgba(16,105,59,0.12), 0 0 0 1px rgba(16,105,59,0.07)",
                      }}
                    >
                      <div
                        className="h-[3px]"
                        style={{
                          background:
                            "linear-gradient(90deg, #10693B, #8CC542)",
                        }}
                      />
                      {LANGS.map((l) => (
                        <button
                          key={l.code}
                          onClick={() => changeLocale(l.code)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0 transition-colors ${
                            locale === l.code
                              ? "bg-[#f0f7f2]"
                              : "hover:bg-[#f0f7f2]"
                          }`}
                        >
                          <div
                            className="w-7 h-5 rounded text-[9px] font-black flex items-center justify-center text-white flex-shrink-0"
                            style={{
                              background:
                                locale === l.code ? "#10693B" : "#9ca3af",
                            }}
                          >
                            {l.short}
                          </div>
                          <span
                            className={`text-[13px] flex-1 text-left ${
                              locale === l.code
                                ? "font-bold text-[#10693B]"
                                : "font-normal text-gray-600"
                            }`}
                          >
                            {l.full}
                          </span>
                          {locale === l.code && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#8CC542]" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* BURGER MOBILE */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden ml-auto p-2.5 rounded-xl transition-all"
              style={{ background: "#f0f7f2", color: "#10693B" }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mobileOpen ? "x" : "bars"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {mobileOpen ? (
                    <XMarkIcon className="w-6 h-6" />
                  ) : (
                    <Bars3Icon className="w-6 h-6" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-x-0 z-40 bg-white border-t-2 border-[#1a3d0a] overflow-hidden"
            style={{ top: NAV_H, boxShadow: "0 20px 40px rgba(0,0,0,.12)" }}
          >
            <div className="p-4 max-h-[80vh] overflow-y-auto space-y-1">
              <Link
                href={`/${locale}/qui-sommes-nous`}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-[15px] font-bold text-[#1a3d0a] hover:bg-[#f0f9eb]"
              >
                {t("about")}
              </Link>

              {/* Activités mobile */}
              <div>
                <button
                  onClick={() =>
                    setMobileSection(mobileSection === "acts" ? null : "acts")
                  }
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-bold text-[#1a3d0a] hover:bg-[#f0f9eb]"
                >
                  {t("activities")}
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform ${mobileSection === "acts" ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {mobileSection === "acts" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {ACTIVITIES.map((a) => (
                        <div key={a.key}>
                          <Link
                            href={`/${locale}${a.href}`}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 ml-4 rounded-xl hover:bg-[#f0f9eb] group transition-colors border-l-2 border-[#e8f5e0]"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#f0f9eb] flex items-center justify-center text-[#2d5a1b] flex-shrink-0">
                              <a.Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-[14px] font-black text-gray-800">
                                {a.label}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {a.subs.slice(0, 3).map((s) => (
                                  <span
                                    key={s}
                                    className="text-[10px] text-gray-400"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <ChevronRightIcon className="w-4 h-4 ml-auto text-gray-300" />
                          </Link>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Marques mobile */}
              <div>
                <div className="flex items-center">
                  <Link
                    href={`/${locale}/marques`}
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 px-4 py-3 rounded-l-xl text-[15px] font-bold text-[#1a3d0a] hover:bg-[#f0f9eb]"
                  >
                    {t("brands")}
                  </Link>
                  <button
                    onClick={() =>
                      setMobileSection(
                        mobileSection === "brands" ? null : "brands",
                      )
                    }
                    className="px-4 py-3 rounded-r-xl text-[#1a3d0a] hover:bg-[#f0f9eb] border-l border-gray-100"
                  >
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform ${mobileSection === "brands" ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
                <AnimatePresence>
                  {mobileSection === "brands" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {FERTIVERT.map((d) => (
                        <div
                          key={d.id}
                          className="ml-4 mb-2 rounded-xl border border-gray-100 overflow-hidden"
                        >
                          <Link
                            href={`/${locale}${d.href}`}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3"
                            style={{ background: d.light }}
                          >
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                              style={{ background: d.color }}
                            >
                              <d.Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p
                                className="text-sm font-black"
                                style={{ color: d.color }}
                              >
                                {d.label}
                              </p>
                              <p className="text-xs text-gray-500">
                                {d.subtitle}
                              </p>
                            </div>
                            <ChevronRightIcon className="w-4 h-4 ml-auto text-gray-300" />
                          </Link>
                          {d.cats.map((c) => (
                            <Link
                              key={c.id}
                              href={`/${locale}/marques/fertivert?division=${d.id}&category=${c.id}`}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-3 px-5 py-2.5 border-t border-gray-50 hover:bg-[#f0f9eb] group transition-colors"
                            >
                              <div
                                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: `${d.accent}20`,
                                  color: d.accent,
                                }}
                              >
                                <c.Icon className="w-3.5 h-3.5" />
                              </div>
                              <p className="text-[13px] font-semibold text-gray-700 group-hover:text-[#1a3d0a]">
                                {c.label}
                              </p>
                              <div className="ml-auto flex gap-1 flex-wrap">
                                {c.subs.slice(0, 2).map((s) => (
                                  <span
                                    key={s}
                                    className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </Link>
                          ))}
                        </div>
                      ))}
                      {OTHER_BRANDS.map((b) => (
                        <Link
                          key={b.key}
                          href={`/${locale}${b.href}`}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 ml-4 px-4 py-3 rounded-xl border border-gray-100 hover:bg-[#f0f9eb] mb-2"
                        >
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                            style={{ background: b.color }}
                          >
                            <b.Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-800">
                              {b.name}
                            </p>
                            <p className="text-xs text-gray-400">{b.sub}</p>
                          </div>
                          <ChevronRightIcon className="w-4 h-4 ml-auto text-gray-300" />
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href={`/${locale}/rendez-vous`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#1a3d0a] text-white font-bold text-[15px]"
              >
                <Ico.Cal className="w-4 h-4" /> Prendre RDV
              </Link>
              <Link
                href={`/${locale}/contact`}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-[15px] font-bold text-[#1a3d0a] hover:bg-[#f0f9eb]"
              >
                {t("contact")}
              </Link>

              {/* Langues */}
              <div className="grid grid-cols-5 gap-2 pt-4 border-t border-gray-100">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      changeLocale(l.code);
                      setMobileOpen(false);
                    }}
                    className={`py-2 rounded-xl text-[12px] font-black transition-all flex flex-col items-center gap-0.5 ${
                      locale === l.code
                        ? "bg-[#1a3d0a] text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-[#e0f5d0] hover:text-[#1a3d0a]"
                    }`}
                  >
                    <span>{l.flag}</span>
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