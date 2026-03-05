"use client";

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
const ACTIVITIES_CONFIG = [
  { key: "seeds",         href: "/activites/semences-et-plants",      Icon: Ico.Seed,    navKey: "semences",      descKey: "seeds_desc",  badgeKey: "seeds_badge",  subs: ["seeds_sub1","seeds_sub2","seeds_sub3","seeds_sub4","seeds_sub5"] },
  { key: "irrigation",    href: "/activites/irrigation",              Icon: Ico.Drop,    navKey: "irrigation",    descKey: "irr_desc",    badgeKey: "irr_badge",    subs: ["irr_sub1","irr_sub2","irr_sub3","irr_sub4","irr_sub5"] },
  { key: "fertilization", href: "/activites/fertilisation",           Icon: Ico.Leaf,    navKey: "fertilisation", descKey: "fert_desc",   badgeKey: null,           subs: ["fert_sub1","fert_sub2","fert_sub3","fert_sub4"] },
  { key: "machinery",     href: "/activites/machinisme-et-jardinage", Icon: Ico.Tractor, navKey: "machinisme",    descKey: "mach_desc",   badgeKey: null,           subs: ["mach_sub1","mach_sub2","mach_sub3","mach_sub4"] },
  { key: "spraying",      href: "/activites/pulverisation",           Icon: Ico.Wind,    navKey: "pulverisation", descKey: "spray_desc",  badgeKey: "spray_badge",  subs: ["spray_sub1","spray_sub2","spray_sub3","spray_sub4","spray_sub5"] },
];

const FERTIVERT = [
  {
    id: "pro",
    label: "Fertivert Pro",
    subKey: "fv_pro_sub",
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
    subKey: "fv_garden_sub",
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

const OTHER_BRANDS_CONFIG = [
  { key: "pulvert", href: "/marques/pulvert", color: "#1D6B2A", Icon: Ico.Pump, name: "Pulvert", subKey: "pulvert_sub", tags: ["Agricole", "Garden", "SAV"] },
  { key: "matar",   href: "/marques/matar",   color: "#1B6B7A", Icon: Ico.Pipe, name: "Matar",   subKey: "matar_sub",   tags: ["Drip", "Smart", "Filtration"] },
];

const LANGS = [
  { code: "fr", short: "FR", full: "Français",  flag: "🇫🇷" },
  { code: "ar", short: "ع",  full: "العربية",   flag: "🇹🇳" },
  { code: "en", short: "EN", full: "English",   flag: "🇬🇧" },
  { code: "it", short: "IT", full: "Italiano",  flag: "🇮🇹" },
  { code: "es", short: "ES", full: "Español",   flag: "🇪🇸" },
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

// ─── SEARCH INDEX — swap data source here when moving to DB ──────────────────
// Shape: { label, href, cat, desc, icon, tags[] }
// When using a DB: fetch this array from /api/search-index and pass it in.
export type SearchItem = {
  label: string;
  href: string;
  cat: string;
  desc: string;
  icon: string;
  tags: string[];
};

const SEARCH_IDX: SearchItem[] = [
  // ── Pages
  { label: "Accueil",           href: "/",                  cat: "Page",     icon: "🏠", desc: "Page principale",                          tags: ["home","accueil","principal"] },
  { label: "Qui Sommes-Nous",   href: "/qui-sommes-nous",   cat: "Page",     icon: "🏢", desc: "Notre histoire, valeurs et équipe",         tags: ["about","histoire","équipe","mission","valeurs"] },
  { label: "Nos Marques",       href: "/marques",           cat: "Page",     icon: "🏷️", desc: "Toutes nos marques partenaires",            tags: ["marques","brands","fertivert","pulvert","matar"] },
  { label: "Contact",           href: "/contact",           cat: "Page",     icon: "✉️", desc: "Formulaire de contact et agences",          tags: ["contact","email","téléphone","agence","adresse"] },
  { label: "Rendez-vous",       href: "/rendez-vous",       cat: "Page",     icon: "📅", desc: "Prendre un rendez-vous avec un expert",     tags: ["rdv","rendez-vous","appointment","expert","visite"] },

  // ── Activités
  { label: "Irrigation",            href: "/activites/irrigation",              cat: "Activité", icon: "💦", desc: "Goutte-à-goutte, aspersion, pompage",          tags: ["irrigation","eau","tuyau","drip","aspersion","pompe","filtre","fertigation"] },
  { label: "Fertilisation",         href: "/activites/fertilisation",           cat: "Activité", icon: "🌾", desc: "Engrais organiques, NPK, biostimulants",        tags: ["fertilisation","engrais","npk","organique","biostimulant","sol","nutrition","ferti"] },
  { label: "Semences & Plants",     href: "/activites/semences-et-plants",      cat: "Activité", icon: "🌰", desc: "Graines, plants maraîchers, gazon, fourrages",  tags: ["semences","plants","graines","maraîcher","gazon","fourrage","pomme de terre","arbres"] },
  { label: "Pulvérisation",         href: "/activites/pulverisation",           cat: "Activité", icon: "🔬", desc: "Pulvérisateurs, buses, protection des cultures", tags: ["pulvérisation","pulvérisateur","traitement","buse","protection","phytosanitaire","pesticide"] },
  { label: "Machinisme & Jardinage",href: "/activites/machinisme-et-jardinage", cat: "Activité", icon: "🚜", desc: "Matériel agricole et espaces verts",             tags: ["machinisme","jardinage","tracteur","outillage","matériel","espaces verts","récolte","tondeuse"] },

  // ── Marques
  { label: "Fertivert",         href: "/marques/fertivert",                   cat: "Marque", icon: "🌿", desc: "Fertilisation Pro & Garden",                   tags: ["fertivert","engrais","fertilisant","biostimulant","terreau","fumier","compost","ferti"] },
  { label: "Fertivert Pro",     href: "/marques/fertivert?division=pro",      cat: "Marque", icon: "🌿", desc: "Solutions de fertilisation professionnelle",    tags: ["fertivert pro","professionnel","npk","organique","biostimulant","ferti roots","ferti micro"] },
  { label: "Fertivert Garden",  href: "/marques/fertivert?division=garden",   cat: "Marque", icon: "🌱", desc: "Engrais et substrats pour jardin & gazon",      tags: ["garden","gazon","jardin","plantes","terreau","liquide","soluble","fleurs","agrumes","oliviers"] },
  { label: "Pulvert",           href: "/marques/pulvert",                     cat: "Marque", icon: "💧", desc: "Pulvérisateurs agricoles et de jardin",         tags: ["pulvert","pulvérisateur","dos","tracteur","jardin","buses","protection","sav"] },
  { label: "Matar",             href: "/marques/matar",                       cat: "Marque", icon: "🚿", desc: "Systèmes d'irrigation connectés",               tags: ["matar","irrigation","drip","smart","filtration","goutte-à-goutte","connecté","tuyau"] },

  // ── Produits Fertivert Pro
  { label: "Terreau Professionnel",  href: "/marques/fertivert?division=pro&cat=support-culture-pro",  cat: "Produit", icon: "🪴", desc: "Substrat professionnel 50L",                    tags: ["terreau","substrat","professionnel","culture","sol"] },
  { label: "Fumier Composté",        href: "/marques/fertivert?division=pro&cat=support-culture-pro",  cat: "Produit", icon: "♻️", desc: "Amendement organique 40kg",                     tags: ["fumier","compost","organique","amendement","sol"] },
  { label: "Ferti Fond NPK",         href: "/marques/fertivert?division=pro&cat=engrais-fond-pro",     cat: "Produit", icon: "🌾", desc: "Engrais de fond minéral NPK",                   tags: ["npk","fond","minéral","engrais","nutrition"] },
  { label: "Ferti Micro Granulé",    href: "/marques/fertivert?division=pro&cat=engrais-organique-pro",cat: "Produit", icon: "🔵", desc: "Biostimulant micro-granulé",                    tags: ["micro","granulé","biostimulant","organique","ferti"] },
  { label: "Ferti Micro Liquide",    href: "/marques/fertivert?division=pro&cat=engrais-organique-pro",cat: "Produit", icon: "💧", desc: "Biostimulant liquide",                          tags: ["micro","liquide","biostimulant","organique","ferti"] },
  { label: "Ferti Actif",            href: "/marques/fertivert?division=pro&cat=engrais-organique-pro",cat: "Produit", icon: "⚡", desc: "Activateur de sol biologique",                 tags: ["actif","activateur","sol","biologique","ferti"] },
  { label: "Ferti Fruit",            href: "/marques/fertivert?division=pro&cat=engrais-organique-pro",cat: "Produit", icon: "🍎", desc: "Nutrition floraison & fructification",          tags: ["fruit","floraison","fructification","potassium","ferti"] },
  { label: "Ferti Leaf",             href: "/marques/fertivert?division=pro&cat=engrais-organique-pro",cat: "Produit", icon: "🍃", desc: "Nutrition foliaire",                            tags: ["leaf","foliaire","feuilles","microéléments","ferti"] },
  { label: "Ferti Go",               href: "/marques/fertivert?division=pro&cat=engrais-organique-pro",cat: "Produit", icon: "🚀", desc: "Stimulant de démarrage rapide",                 tags: ["go","démarrage","starter","germination","ferti"] },
  { label: "Pouss Roots+",           href: "/marques/fertivert?division=pro&cat=fertilisant-pro",      cat: "Produit", icon: "🌱", desc: "Enracinement renforcé",                         tags: ["roots","racines","enracinement","rhizosphère","pouss"] },
  { label: "Aminal+",                href: "/marques/fertivert?division=pro&cat=fertilisant-pro",      cat: "Produit", icon: "🐾", desc: "Acides aminés & peptides",                      tags: ["aminal","acides aminés","peptides","stress","nutrition"] },
  { label: "Fort Start+",            href: "/marques/fertivert?division=pro&cat=fertilisant-pro",      cat: "Produit", icon: "💪", desc: "Starter NPK haute concentration",               tags: ["start","démarrage","npk","starter","fort"] },
  { label: "Oceano+",                href: "/marques/fertivert?division=pro&cat=fertilisant-pro",      cat: "Produit", icon: "🌊", desc: "Extrait d'algues marines",                      tags: ["algues","marines","ocean","biostimulant","stress"] },
  { label: "Fulvical+",              href: "/marques/fertivert?division=pro&cat=fertilisant-pro",      cat: "Produit", icon: "🟡", desc: "Acides fulviques & humiques + calcium",         tags: ["fulvique","humique","calcium","sol","correcteur"] },
  { label: "Sweeter+",               href: "/marques/fertivert?division=pro&cat=fertilisant-pro",      cat: "Produit", icon: "🍬", desc: "Qualité des fruits — sucre & couleur",          tags: ["sucre","couleur","qualité","fruits","sweeter"] },
  { label: "CalciMag+",              href: "/marques/fertivert?division=pro&cat=fertilisant-pro",      cat: "Produit", icon: "🦴", desc: "Calcium + Magnésium équilibrés",                tags: ["calcium","magnésium","carence","correcteur","calcimag"] },
  { label: "Calcial+",               href: "/marques/fertivert?division=pro&cat=fertilisant-pro",      cat: "Produit", icon: "⬜", desc: "Calcium pur haute disponibilité",               tags: ["calcium","correcteur","carence","fermeté","calcial"] },

  // ── Produits Fertivert Garden
  { label: "Terreau Gazon",          href: "/marques/fertivert?division=garden&cat=gazon",             cat: "Produit", icon: "🌿", desc: "Substrat spécial pelouse",                      tags: ["gazon","pelouse","terreau","substrat","jardin"] },
  { label: "Ferti Fond Gazon",       href: "/marques/fertivert?division=garden&cat=gazon",             cat: "Produit", icon: "🌾", desc: "Engrais de fond pour gazon",                    tags: ["gazon","fond","engrais","pelouse","ferti"] },
  { label: "Granulé Gazon",          href: "/marques/fertivert?division=garden&cat=gazon",             cat: "Produit", icon: "🔵", desc: "Engrais granulé longue durée",                  tags: ["granulé","gazon","longue durée","pelouse","ferti"] },
  { label: "Engrais Oliviers 2kg",   href: "/marques/fertivert?division=garden&cat=engrais-chimiques", cat: "Produit", icon: "🫒", desc: "Granulés spéciaux oliviers",                    tags: ["oliviers","engrais","granulés","jardin","fruitiers"] },
  { label: "Engrais Agrumes 2kg",    href: "/marques/fertivert?division=garden&cat=engrais-chimiques", cat: "Produit", icon: "🍊", desc: "Granulés spéciaux agrumes",                     tags: ["agrumes","oranges","citrons","engrais","granulés"] },
  { label: "Engrais Potager 2kg",    href: "/marques/fertivert?division=garden&cat=engrais-chimiques", cat: "Produit", icon: "🥕", desc: "Granulés légumes & potager",                    tags: ["potager","légumes","tomates","engrais","granulés"] },
  { label: "Engrais Fleurs 2kg",     href: "/marques/fertivert?division=garden&cat=engrais-chimiques", cat: "Produit", icon: "🌸", desc: "Granulés spéciaux fleurs",                      tags: ["fleurs","floraison","engrais","granulés","jardin"] },
  { label: "Fertivit 20.20.20",      href: "/marques/fertivert?division=garden&cat=soluble-garden",    cat: "Produit", icon: "💊", desc: "Engrais hydrosoluble équilibré",                tags: ["soluble","hydrosoluble","npk","20.20.20","fertivit"] },
  { label: "Fertivit 13.40.13",      href: "/marques/fertivert?division=garden&cat=soluble-garden",    cat: "Produit", icon: "💊", desc: "Engrais hydrosoluble riche en phosphore",       tags: ["soluble","phosphore","floraison","fertivit","13.40.13"] },
  { label: "Engrais Universel 1L",   href: "/marques/fertivert?division=garden&cat=liquide-garden",    cat: "Produit", icon: "🧴", desc: "Engrais liquide universel",                     tags: ["liquide","universel","toutes plantes","prêt emploi","jardin"] },
  { label: "Engrais Plantes Vertes", href: "/marques/fertivert?division=garden&cat=liquide-garden",    cat: "Produit", icon: "🪴", desc: "Engrais liquide plantes d'intérieur",            tags: ["intérieur","plantes vertes","liquide","pot","appartement"] },
  { label: "Engrais Cactées 1L",     href: "/marques/fertivert?division=garden&cat=liquide-garden",    cat: "Produit", icon: "🌵", desc: "Engrais liquide cactées & succulentes",         tags: ["cactées","succulentes","liquidie","intérieur","jardin"] },
  { label: "Ferti Fort 250g",        href: "/marques/fertivert?division=garden&cat=engrais-organique-garden", cat: "Produit", icon: "💪", desc: "Engrais organique concentré",             tags: ["bio","organique","concentré","naturel","ferti"] },

  // ── Pulvert produits
  { label: "Pulvérisateur à dos",    href: "/marques/pulvert",  cat: "Produit", icon: "🎒", desc: "Pulvérisateur dorsal manuel",                   tags: ["dos","manuel","dorsal","traitement","pulvérisateur"] },
  { label: "Pulvérisateur tracteur", href: "/marques/pulvert",  cat: "Produit", icon: "🚜", desc: "Pulvérisateur porté pour tracteur",              tags: ["tracteur","porté","grandes cultures","traitement","pulvert"] },
  { label: "Buses & Accessoires",    href: "/marques/pulvert",  cat: "Produit", icon: "🔩", desc: "Buses, jets, pièces de rechange",               tags: ["buse","jet","accessoire","pièce","rechange","pulvert"] },

  // ── Matar produits
  { label: "Irrigation Goutte-à-goutte", href: "/marques/matar", cat: "Produit", icon: "💧", desc: "Systèmes drip professionnels",                 tags: ["drip","goutte","tuyau","goutteur","matar","irrigation"] },
  { label: "Matar Smart",               href: "/marques/matar", cat: "Produit", icon: "📱", desc: "Irrigation connectée et automatisée",           tags: ["smart","connecté","automatique","iot","matar","application"] },
  { label: "Pompes & Filtration",       href: "/marques/matar", cat: "Produit", icon: "⚙️", desc: "Pompes, filtres, régulateurs de pression",     tags: ["pompe","filtre","pression","débit","matar","irrigation"] },
];

function SearchOverlay({ open, onClose, locale }: { open: boolean; onClose: () => void; locale: string }) {
  const t = useTranslations("nav");
  const [q, setQ] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // ── Fuse.js instance (lazy-loaded to avoid SSR issues)
  const fuseRef = useRef<any>(null);
  useEffect(() => {
    import("fuse.js").then(({ default: Fuse }) => {
      fuseRef.current = new Fuse(SEARCH_IDX, {
        keys: [
          { name: "label", weight: 3 },
          { name: "desc",  weight: 2 },
          { name: "tags",  weight: 1.5 },
          { name: "cat",   weight: 0.5 },
        ],
        threshold: 0.35,      // 0 = exact, 1 = match anything
        includeScore: true,
        minMatchCharLength: 2,
        ignoreLocation: true,
      });
    });
  }, []);

  useEffect(() => {
    if (open) { setQ(""); setActiveIdx(0); setTimeout(() => inputRef.current?.focus(), 60); }
  }, [open]);

  useEffect(() => { setActiveIdx(0); }, [q]);

  // ── Compute results
  const results: SearchItem[] = q.trim().length >= 2
    ? (fuseRef.current
        ? fuseRef.current.search(q).slice(0, 10).map((r: any) => r.item)
        : SEARCH_IDX.filter(i =>
            i.label.toLowerCase().includes(q.toLowerCase()) ||
            i.tags.some(tag => tag.includes(q.toLowerCase()))
          ).slice(0, 10)
      )
    : SEARCH_IDX.filter(i => ["Page","Activité","Marque"].includes(i.cat)).slice(0, 6);

  // ── Keyboard navigation
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape")    { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      if (e.key === "Enter")     { e.preventDefault(); if (results[activeIdx]) go(results[activeIdx].href); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, activeIdx, results]);

  const go = (href: string) => { router.push(`/${locale}${href}`); onClose(); };

  // ── Group by category, preserving score order
  const CAT_ORDER = ["Page", "Activité", "Marque", "Produit"];
  const grouped = results.reduce<Record<string, SearchItem[]>>((acc, item) => {
    (acc[item.cat] = acc[item.cat] || []).push(item);
    return acc;
  }, {});
  const sortedCats = Object.keys(grouped).sort(
    (a, b) => CAT_ORDER.indexOf(a) - CAT_ORDER.indexOf(b)
  );

  const CAT_META: Record<string, { color: string; bg: string; border: string; label: string }> = {
    Page:     { color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE", label: "Pages" },
    Activité: { color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0", label: "Activités" },
    Marque:   { color: "#92400E", bg: "#FFFBEB", border: "#FDE68A", label: "Marques" },
    Produit:  { color: "#6B21A8", bg: "#FAF5FF", border: "#E9D5FF", label: "Produits" },
  };

  // flat list for keyboard nav
  const flatResults = sortedCats.flatMap(cat => grouped[cat]);

  // highlight matched text
  const highlight = (text: string) => {
    if (!q || q.trim().length < 2) return text;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part)
        ? <mark key={i} style={{ background: "#bbf7d0", color: "#14532d", borderRadius: 3, padding: "0 1px" }}>{part}</mark>
        : part
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="sb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[199]"
            style={{ background: "rgba(0,0,0,0.40)", backdropFilter: "blur(8px)" }}
            onMouseDown={onClose}
          />

          {/* ── Panel ── */}
          <motion.div
            key="sp"
            initial={{ opacity: 0, scale: 0.97, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: "spring", stiffness: 500, damping: 38 }}
            className="fixed inset-x-0 z-[200] mx-auto px-4"
            style={{ maxWidth: 600, top: "8vh" }}
            onMouseDown={e => e.stopPropagation()}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "#fff",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.07), 0 40px 100px rgba(0,0,0,0.25)",
              }}
            >
              {/* ── Input ── */}
              <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid #f1f5f9" }}>
                <Ico.Search className="w-5 h-5 flex-shrink-0 text-gray-400" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  style={{ background: "transparent", outline: "none", color: "#0f172a", width: "100%", fontSize: 15, fontWeight: 500 }}
                  className="flex-1 placeholder-gray-400"
                />
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {q && (
                    <button
                      onMouseDown={e => { e.stopPropagation(); setQ(""); inputRef.current?.focus(); }}
                      className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <Ico.X className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                  <kbd
                    onMouseDown={e => { e.stopPropagation(); onClose(); }}
                    className="cursor-pointer text-[11px] font-mono border border-gray-200 rounded-md px-1.5 py-0.5 text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors leading-tight"
                  >ESC</kbd>
                </div>
              </div>

              {/* ── Results ── */}
              <div className="overflow-y-auto" style={{ maxHeight: 440 }}>
                {results.length === 0 && q.trim().length >= 2 ? (
                  <div className="py-12 flex flex-col items-center gap-2">
                    <span className="text-3xl">🌾</span>
                    <p className="text-sm font-semibold text-gray-600">Aucun résultat pour « {q} »</p>
                    <p className="text-xs text-gray-400">Essayez « engrais », « irrigation », « fertivert »…</p>
                  </div>
                ) : (
                  <div className="py-1.5">
                    {/* Section label when no query */}
                    {!q && (
                      <p className="px-4 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Navigation rapide
                      </p>
                    )}
                    {sortedCats.map(cat => (
                      <div key={cat}>
                        {/* Category pill header */}
                        {q && (
                          <div className="flex items-center gap-2 px-4 pt-2.5 pb-1">
                            <span
                              className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                              style={{
                                background: CAT_META[cat]?.bg,
                                color: CAT_META[cat]?.color,
                                border: `1px solid ${CAT_META[cat]?.border}`,
                              }}
                            >
                              {CAT_META[cat]?.label ?? cat}
                            </span>
                            <div className="flex-1 h-px" style={{ background: CAT_META[cat]?.border }} />
                          </div>
                        )}
                        {/* Items */}
                        {grouped[cat].map(item => {
                          const fi = flatResults.indexOf(item);
                          const active = fi === activeIdx;
                          return (
                            <div
                              key={item.href + item.label}
                              onMouseEnter={() => setActiveIdx(fi)}
                              onMouseDown={e => { e.stopPropagation(); go(item.href); }}
                              className="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                              style={{
                                background: active ? "#f0fdf4" : "transparent",
                                borderLeft: active ? "2px solid #10693B" : "2px solid transparent",
                              }}
                            >
                              {/* Icon bubble */}
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base transition-all"
                                style={{ background: active ? "#10693B" : CAT_META[cat]?.bg ?? "#f3f4f6" }}
                              >
                                <span style={{ fontSize: 16, filter: active ? "brightness(10)" : "none" }}>
                                  {item.icon}
                                </span>
                              </div>
                              {/* Text */}
                              <div className="flex-1 min-w-0">
                                <p className="text-[13.5px] font-semibold text-gray-900 truncate leading-snug">
                                  {highlight(item.label)}
                                </p>
                                <p className="text-[11px] text-gray-400 truncate mt-px">
                                  {highlight(item.desc)}
                                </p>
                              </div>
                              {/* Cat badge (only when no query grouping) */}
                              {!q && (
                                <span
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                                  style={{ background: CAT_META[cat]?.bg, color: CAT_META[cat]?.color }}
                                >
                                  {cat}
                                </span>
                              )}
                              <ChevronRightIcon
                                className="w-3.5 h-3.5 flex-shrink-0 transition-all"
                                style={{ color: active ? "#10693B" : "#cbd5e1", transform: active ? "translateX(1px)" : "none" }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Footer ── */}
              <div
                className="flex items-center justify-between px-4 py-2"
                style={{ borderTop: "1px solid #f1f5f9", background: "#fafafa" }}
              >
                <div className="flex items-center gap-3">
                  {[["↑↓","naviguer"],["↵","ouvrir"],["ESC","fermer"]].map(([k, l]) => (
                    <span key={k} className="flex items-center gap-1 text-[11px] text-gray-400">
                      <kbd className="border border-gray-200 rounded px-1.5 py-0.5 bg-white font-mono text-[10px] text-gray-500 shadow-sm leading-tight">{k}</kbd>
                      {l}
                    </span>
                  ))}
                </div>
                <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10693B] inline-block" />
                  Espace Vert
                </span>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── SEARCH BAR ───────────────────────────────────────────────────────────────
function SearchBar({ dark, locale }: { dark: boolean; locale: string }) {
  const t = useTranslations("nav"); // ← FIX: added missing hook
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
          {t("search")}
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
  const t = useTranslations("nav");
  const ACTIVITIES = ACTIVITIES_CONFIG.map(a => ({
    ...a,
    label: t(a.navKey as any),
    desc:  t(a.descKey as any),
    badge: a.badgeKey ? t(a.badgeKey as any) : undefined,
    subs:  a.subs.map(s => t(s as any)),
  }));
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
                {t("viewAll_act")} {act.label} <ChevronRightIcon className="w-3 h-3" />
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
                <p className="text-sm font-bold" style={{ color: "#2d5a1b" }}>{t("hoverActivity")}</p>
                <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>pour voir ses sous-catégories</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── DROPDOWN MARQUES ─────────────────────────────────────────────────────────
const BRANDS_NAV_CONFIG = [
  {
    key: "fertivert",
    href: "/marques/fertivert",
    Icon: Ico.Leaf,
    name: "Fertivert",
    subKey: "fertivert_sub",
    color: "#1a3d0a",
    accent: "#3CB648",
    catKeys: ["brands_fv_cat1","brands_fv_cat2","brands_fv_cat3","brands_fv_cat4","brands_fv_cat5","brands_fv_cat6"],
  },
  {
    key: "pulvert",
    href: "/marques/pulvert",
    Icon: Ico.Pump,
    name: "Pulvert",
    subKey: "pulvert_sub",
    color: "#1D6B2A",
    accent: "#F2C200",
    catKeys: ["brands_pv_cat1","brands_pv_cat2","brands_pv_cat3","brands_pv_cat4","brands_pv_cat5"],
  },
  {
    key: "matar",
    href: "/marques/matar",
    Icon: Ico.Pipe,
    name: "Matar",
    subKey: "matar_sub",
    color: "#1B6B7A",
    accent: "#4BA8D8",
    catKeys: ["brands_mt_cat1","brands_mt_cat2","brands_mt_cat3","brands_mt_cat4","brands_mt_cat5"],
  },
];

function MarquesDropdown({
  locale,
  onClose,
}: {
  locale: string;
  onClose: () => void;
}) {
  const t = useTranslations("nav");
  const BRANDS_NAV = BRANDS_NAV_CONFIG.map(b => ({
    ...b,
    sub:  t(b.subKey as any),
    cats: (b as any).catKeys.map((k: string) => t(k as any)),
  }));
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
            {t("ourBrands")}
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
              <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{(b as any).sub}</p>
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
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{t((brand as any).subKey as any)}</p>
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 px-1" style={{ color: "#4a7c2f" }}>
                Catégories
              </p>
              <div className="space-y-0.5">
                {brand.cats.map((cat:string) => (
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
                {t("viewAll_brand")} {brand.name} <ChevronRightIcon className="w-3 h-3" />
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
                <p className="text-sm font-bold" style={{ color: "#2d5a1b" }}>{t("hoverBrand")}</p>
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
  const ACTIVITIES = ACTIVITIES_CONFIG.map(a => ({
    ...a,
    label: t(a.navKey as any),
    desc:  t(a.descKey as any),
    badge: a.badgeKey ? t(a.badgeKey as any) : undefined,
    subs:  a.subs.map(s => t(s as any)),
  }));
  const OTHER_BRANDS = OTHER_BRANDS_CONFIG.map(b => ({
    ...b,
    sub: t(b.subKey as any),
  }));
  const locale = useLocale();
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

  const changeLocale = (code: string) => {
    const segments = pathname.split("/");
    segments[1] = code;
    window.location.href = segments.join("/") || `/${code}`;
  };
  const curLang = LANGS.find((l) => l.code === locale) ?? LANGS[0];

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

            {/* ── LOGO ─────────────────────────────────────────────── */}
            <Link
              href={`/${locale}`}
              className="flex items-center gap-3 flex-shrink-0 mr-3 lg:mr-6"
            >
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.025 }}
                className="flex items-center h-[64px] sm:h-[70px] lg:h-[78px]"
              >
                <Image
                  src="/logos/LOGO ESPACE VERT.png"
                  alt="Espace Vert — الفضاء الأخضر"
                  width={400}
                  height={172}
                  className="h-full w-auto max-w-[260px] sm:max-w-[320px] lg:max-w-[400px] object-contain"
                  style={{ filter: "drop-shadow(0 2px 6px rgba(0,100,40,0.22))" }}
                  priority
                />
              </motion.div>
            </Link>

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
                        boxShadow: "0 16px 48px rgba(16,105,59,0.12), 0 0 0 1px rgba(16,105,59,0.07)",
                      }}
                    >
                      <div
                        className="h-[3px]"
                        style={{ background: "linear-gradient(90deg, #10693B, #8CC542)" }}
                      />
                      {LANGS.map((l) => (
                        <button
                          key={l.code}
                          onClick={() => changeLocale(l.code)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0 transition-colors ${
                            locale === l.code ? "bg-[#f0f7f2]" : "hover:bg-[#f0f7f2]"
                          }`}
                        >
                          <div
                            className="w-7 h-5 rounded text-[9px] font-black flex items-center justify-center text-white flex-shrink-0"
                            style={{ background: locale === l.code ? "#10693B" : "#9ca3af" }}
                          >
                            {l.short}
                          </div>
                          <span
                            className={`text-[13px] flex-1 text-left ${
                              locale === l.code ? "font-bold text-[#10693B]" : "font-normal text-gray-600"
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
                  onClick={() => setMobileSection(mobileSection === "acts" ? null : "acts")}
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
                              <p className="text-[14px] font-black text-gray-800">{a.label}</p>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {a.subs.slice(0, 3).map((s) => (
                                  <span key={s} className="text-[10px] text-gray-400">{s}</span>
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
                    onClick={() => setMobileSection(mobileSection === "brands" ? null : "brands")}
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
                        <div key={d.id} className="ml-4 mb-2 rounded-xl border border-gray-100 overflow-hidden">
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
                              <p className="text-sm font-black" style={{ color: d.color }}>{d.label}</p>
                              <p className="text-xs text-gray-500">{t(d.subKey as any)}</p>
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
                                style={{ background: `${d.accent}20`, color: d.accent }}
                              >
                                <c.Icon className="w-3.5 h-3.5" />
                              </div>
                              <p className="text-[13px] font-semibold text-gray-700 group-hover:text-[#1a3d0a]">{c.label}</p>
                              <div className="ml-auto flex gap-1 flex-wrap">
                                {c.subs.slice(0, 2).map((s) => (
                                  <span key={s} className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded">{s}</span>
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
                            <p className="text-sm font-black text-gray-800">{b.name}</p>
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
                <Ico.Cal className="w-4 h-4" /> {t("bookRdv")}
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
                    onClick={() => { changeLocale(l.code); setMobileOpen(false); }}
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