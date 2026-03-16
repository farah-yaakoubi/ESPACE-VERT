"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  dark:    "#2C1A0E",      // brun terre foncé
  green:   "#3D6B21",      // vert feuille semences
  mid:     "#4E8A2A",      // vert moyen
  leaf:    "#6AB73D",      // vert clair
  lime:    "#8FCC55",      // lime
  pale:    "#F0F8E8",      // vert très pâle
  bg:      "#FAFAF6",      // blanc cassé chaud
  surface: "#FFFFFF",
  border:  "#DFF0C8",      // vert pâle border
  wheat:   "#C8A84B",      // blé doré
  earth:   "#8B6347",      // terre brune
  sand:    "#F5EDD5",      // sable chaud
};

// ─── Logos partenaires (text fallback si pas d'image) ────────────────────────
const BRAND_COLORS: Record<string, string> = {
  "TERA SEEDS":              "var(--primary)",
  "NEXEEDS":                 "#0e4a8a",
  "GRIFFATON":               "#8B1a1a",
  "SERVICE PLUS":            "#6b3fa0",
  "CORA SEEDS":              "#b45c00",
  "MEDITERRANEA SEMENTI":    "#005a8a",
  "LIDEA":                   "#8a5a00",
  "PANAM":                   "#005a44",
  "SOUTHERN SEED":           "#7a2a00",
  "ELORN PLANTS":            "#004a6a",
};

// ─── DATA ────────────────────────────────────────────────────────────────────
type Product = {
  id: string;
  name: string;
  variety?: string;
  brand: string;
  category: string;
  subcategory: string;
  type: "semence" | "plant";
  description: string;
  usage: string;
  conditions?: string;
  cycle?: string;
  badge?: string;
};

const PRODUCTS: Product[] = [
  // ─── TOMATE ───
  {
    id: "t1", name: "PARMA F1", brand: "TERA SEEDS",
    category: "Légumes", subcategory: "Tomate", type: "semence",
    description: "Variété hybride F1 à gros fruits ronds, excellente productivité et bonne tenue en rayon.",
    usage: "Culture sous serre et plein champ", cycle: "75–85 jours", badge: "Pro",
  },
  {
    id: "t2", name: "ALYENTA F1", brand: "NEXEEDS",
    category: "Légumes", subcategory: "Tomate", type: "semence",
    description: "Tomate hybride à chair ferme, adaptée aux conditions chaudes, résistante au TYLCV.",
    usage: "Plein champ, culture intensive", cycle: "70–80 jours", badge: "Résistant",
  },
  {
    id: "t3", name: "PULIA F1", brand: "NEXEEDS",
    category: "Légumes", subcategory: "Tomate", type: "semence",
    description: "Hybride F1 productif, fruits allongés de type Roma, idéal pour la transformation.",
    usage: "Industrie et marché frais", cycle: "80–90 jours",
  },
  // ─── PETIT POIS ───
  {
    id: "pp1", name: "SULTANA", brand: "GRIFFATON",
    category: "Légumes", subcategory: "Petit Pois", type: "semence",
    description: "Variété à graine ronde, rustique, adaptée aux régions tempérées, rendement élevé.",
    usage: "Plein champ, récolte mécanisée", cycle: "65–75 jours",
  },
  {
    id: "pp2", name: "KHATMIA", brand: "SERVICE PLUS",
    category: "Légumes", subcategory: "Petit Pois", type: "semence",
    description: "Pois à cosses longues et remplissage dense, excellente qualité gustative.",
    usage: "Marché frais et surgélation", cycle: "60–70 jours", badge: "Qualité",
  },
  // ─── PASTÈQUE ───
  {
    id: "pa1", name: "SUNSWEET F1", brand: "CORA SEEDS",
    category: "Légumes", subcategory: "Pastèque", type: "semence",
    description: "Pastèque hybride à chair rouge vif, très sucrée (Brix > 12), résistante aux maladies.",
    usage: "Culture sous serre et plein champ", cycle: "75–85 jours", badge: "Top Brix",
  },
  {
    id: "pa2", name: "ROMINA F1", brand: "CORA SEEDS",
    category: "Légumes", subcategory: "Pastèque", type: "semence",
    description: "Fruits oblongs, 8–10 kg, excellente conservation post-récolte.",
    usage: "Export et marché local", cycle: "80–90 jours",
  },
  {
    id: "pa3", name: "CHARLY F1", brand: "NEXEEDS",
    category: "Légumes", subcategory: "Pastèque", type: "semence",
    description: "Variété précoce, chair ferme et croquante, idéale pour les marchés exigeants.",
    usage: "Plein champ", cycle: "70–78 jours", badge: "Précoce",
  },
  // ─── LUZERNE ───
  {
    id: "lu1", name: "GIULIA", brand: "MEDITERRANEA SEMENTI",
    category: "Fourrager", subcategory: "Luzerne", type: "semence",
    description: "Luzerne méditerranéenne à fort tallage, résistante à la sécheresse, 4–6 coupes/an.",
    usage: "Fourrage et pâturage", cycle: "Vivace",
  },
  // ─── MAÏS ───
  {
    id: "ma1", name: "FONDARI CS", brand: "LIDEA",
    category: "Grandes Cultures", subcategory: "Maïs", type: "semence",
    description: "Hybride de maïs grain, indice de précocité moyen, fort potentiel de rendement.",
    usage: "Grain et ensilage", cycle: "115–125 jours", badge: "Haut rendement",
  },
  // ─── AVOINE ───
  {
    id: "av1", name: "LUXURIAL", brand: "PANAM",
    category: "Grandes Cultures", subcategory: "Avoine", type: "semence",
    description: "Avoine de printemps, paille courte et résistante à la verse, bonne teneur en protéines.",
    usage: "Alimentation animale, cultures d'hiver", cycle: "130–140 jours",
  },
  {
    id: "av2", name: "DELUX", brand: "PANAM",
    category: "Grandes Cultures", subcategory: "Avoine", type: "semence",
    description: "Avoine rustique adaptée aux sols difficiles, rendement stable en conditions sèches.",
    usage: "Fourrage et grain", cycle: "125–135 jours",
  },
  // ─── PIMENT ───
  {
    id: "pi1", name: "MISTRAL F1", brand: "NEXEEDS",
    category: "Légumes", subcategory: "Piment Fort", type: "semence",
    description: "Piment fort allongé, couleur verte à rouge, très piquant, bonne résistance aux virus.",
    usage: "Marché frais et transformation", cycle: "70–80 jours", badge: "Fort",
  },
  {
    id: "pi2", name: "ALTAR F1", brand: "NEXEEDS",
    category: "Légumes", subcategory: "Piment Fort", type: "semence",
    description: "Hybride à fruits longs et brillants, productivité élevée, excellent pour l'export.",
    usage: "Export et marché local", cycle: "75–85 jours",
  },
  {
    id: "pi3", name: "ANTONIO F1 (new)", brand: "SOUTHERN SEED",
    category: "Légumes", subcategory: "Piment Fort", type: "semence",
    description: "Nouvelle variété 2024, fruits très allongés de calibre XXL, arôme prononcé.",
    usage: "Marché premium", cycle: "80–90 jours", badge: "Nouveau",
  },
  // ─── FENOUIL ───
  {
    id: "fe1", name: "ULISSE F1", brand: "CORA SEEDS",
    category: "Légumes", subcategory: "Fenouil", type: "semence",
    description: "Fenouil à bulbe rond et compact, faible montaison, idéal pour l'automne.",
    usage: "Marché frais", cycle: "90–100 jours",
  },
  {
    id: "fe2", name: "PERLA F1", brand: "CORA SEEDS",
    category: "Légumes", subcategory: "Fenouil", type: "semence",
    description: "Variété d'hiver à bulbe aplati, feuillage tendre, excellente saveur anisée.",
    usage: "Marché de niche et restauration", cycle: "95–110 jours", badge: "Qualité",
  },
  // ─── HARICOT ───
  {
    id: "ha1", name: "COCO ROSE", brand: "NEXEEDS",
    category: "Légumes", subcategory: "Haricot Coco", type: "semence",
    description: "Haricot à écosser, grains roses marbres, gros rendement, saveur douce.",
    usage: "Frais et sec", cycle: "65–80 jours",
  },
  {
    id: "ha2", name: "INNOVIAL", brand: "NEXEEDS",
    category: "Légumes", subcategory: "Haricot Vert", type: "semence",
    description: "Haricot vert fin, sans fil, très tendre, adapté à la récolte mécanisée.",
    usage: "Surgélation et frais", cycle: "55–65 jours", badge: "Top",
  },
  {
    id: "ha3", name: "SIDERAL", brand: "NEXEEDS",
    category: "Légumes", subcategory: "Haricot Vert", type: "semence",
    description: "Haricot vert extra-fin, rendements élevés, bonne tolérance aux maladies.",
    usage: "Surgélation et marché frais", cycle: "55–62 jours",
  },
  // ─── LAITUE ───
  {
    id: "la1", name: "IMMA", brand: "NEXEEDS",
    category: "Légumes", subcategory: "Laitue Iceberg", type: "semence",
    description: "Laitue iceberg compacte et bien pommée, feuilles craquantes, excellente conservation.",
    usage: "Grande distribution et restauration", cycle: "60–70 jours",
  },
  // ─── PLANTS ───
  {
    id: "pl1", name: "SYNERGY", brand: "ELORN PLANTS",
    category: "Pomme de Terre", subcategory: "Plants", type: "plant",
    description: "Plant certifié, variété de consommation à chair jaune, excellente tenue à la cuisson.",
    usage: "Culture commerciale", cycle: "90–105 jours", badge: "Certifié",
  },
  {
    id: "pl2", name: "SPUNTA", brand: "ELORN PLANTS",
    category: "Pomme de Terre", subcategory: "Plants", type: "plant",
    description: "Variété classique à peau jaune, très productive, excellente adaptation tunisienne.",
    usage: "Culture commerciale et autoconsommation", cycle: "85–100 jours",
  },
];

// ─── Categories ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all", label: "Tout", icon: "🌱" },
  { id: "Légumes", label: "Légumes", icon: "🥬" },
  { id: "Grandes Cultures", label: "Grandes Cultures", icon: "🌾" },
  { id: "Fourrager", label: "Fourrager", icon: "🌿" },
  { id: "Pomme de Terre", label: "Pomme de Terre", icon: "🥔" },
];

const SUBCATEGORIES: Record<string, string[]> = {
  all: [],
  "Légumes": ["Tomate", "Petit Pois", "Pastèque", "Piment Fort", "Fenouil", "Haricot Coco", "Haricot Vert", "Laitue Iceberg"],
  "Grandes Cultures": ["Maïs", "Avoine"],
  "Fourrager": ["Luzerne"],
  "Pomme de Terre": ["Plants"],
};

// ─── BrandBadge ──────────────────────────────────────────────────────────────
function BrandBadge({ brand }: { brand: string }) {
  const color = BRAND_COLORS[brand] ?? "var(--primary)";
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide text-white"
      style={{ background: color, boxShadow: `0 1px 6px ${color}44` }}
    >
      {brand}
    </span>
  );
}

// ─── ProductCard ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const isPlant = product.type === "plant";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: C.surface,
        border: `1.5px solid ${C.border}`,
        boxShadow: "0 2px 12px rgba(0,40,16,0.06)",
      }}
      onClick={() => setOpen(!open)}
    >
      {/* Header coloré */}
      <div
        className="px-4 pt-4 pb-3"
        style={{
          background: isPlant
            ? "linear-gradient(135deg, #004a6a 0%, #0e3a5f 100%)"
            : "linear-gradient(135deg, #002810 0%, #006428 100%)",
        }}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
              {product.subcategory}
            </p>
            <h3 className="text-white font-black text-lg leading-tight">{product.name}</h3>
          </div>
          <div className="flex flex-col gap-1 items-end flex-shrink-0">
            {product.badge && (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: C.leaf, color: C.dark }}>
                {product.badge}
              </span>
            )}
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white/80">
              {isPlant ? "🥔 Plant" : "🌱 Semence"}
            </span>
          </div>
        </div>
        <BrandBadge brand={product.brand} />
      </div>

      {/* Corps */}
      <div className="px-4 py-3">
        <p className="text-[13px] text-gray-600 leading-relaxed mb-3">{product.description}</p>
        <div className="flex flex-wrap gap-2">
          {product.cycle && (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500">
              <span>⏱</span> {product.cycle}
            </div>
          )}
          <div className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: C.green }}>
            <span>🎯</span> {product.usage}
          </div>
        </div>
      </div>

      {/* Expand */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t" style={{ borderColor: C.border, background: C.pale }}>
              <p className="text-[12px] font-bold mt-3 mb-1" style={{ color: C.dark }}>Usage détaillé</p>
              <p className="text-[12px] text-gray-600">{product.usage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 pb-3 flex items-center justify-between">
        <span className="text-[11px] text-gray-400 font-medium">
          {open ? "Masquer ▲" : "Voir plus ▼"}
        </span>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
          style={{ background: C.pale, color: C.green }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d={open ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}


// ─── HERO ────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      className="relative overflow-hidden flex flex-col items-center justify-center text-center"
      style={{
        minHeight: "58vh",
        background: "linear-gradient(158deg, #1A2C0A 0%, #2C4A14 30%, #3D6B21 65%, #4E8A2A 100%)",
      }}
    >
      {/* Grain */}
      <div className="absolute inset-0 pointer-events-none" style={{
        opacity: 0.09,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }} />
      {/* Halo */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.2, 0.45, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(200,168,75,0.20) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-[11px] font-black uppercase tracking-widest"
            style={{ background: "rgba(140,198,63,0.18)", border: "1px solid rgba(140,198,63,0.35)", color: "var(--primary-soft)" }}>
            🌱 Activité Espace Vert
          </div>
          <h1 className="text-white font-black mb-4" style={{ fontSize: "clamp(32px, 5vw, 58px)", lineHeight: 1.1 }}>
            Semences & <span style={{ color: "var(--primary-soft)" }}>Plants</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8" style={{ lineHeight: 1.6 }}>
            Sélection rigoureuse des meilleures variétés hybrides F1 pour maraîchers, céréaliers et arboriculteurs professionnels.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: "🏆", label: "Marques partenaires de référence" },
              { icon: "🧬", label: "Variétés hybrides F1 certifiées" },
              
            ].map(b => (
              <div key={b.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold text-white/80"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                {b.icon} {b.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Vague */}
      <div className="absolute bottom-0 inset-x-0">
        <svg viewBox="0 0 1440 52" preserveAspectRatio="none" style={{ width: "100%", height: 52, display: "block" }}>
          <path d="M0,28 C240,52 480,4 720,24 C900,40 1100,6 1300,22 C1380,30 1420,14 1440,28 L1440,52 L0,52 Z" fill="#FAFAF6" />
        </svg>
      </div>
    </section>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function SemencesEtPlantsPage() {
  const locale = useLocale();
  const [catFilter, setCatFilter] = useState("all");
  const [subFilter, setSubFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "semence" | "plant">("all");
  const [search, setSearch] = useState("");

  const allBrands = Array.from(new Set(PRODUCTS.map(p => p.brand))).sort();

  const filtered = PRODUCTS.filter(p => {
    if (catFilter !== "all" && p.category !== catFilter) return false;
    if (subFilter !== "all" && p.subcategory !== subFilter) return false;
    if (brandFilter !== "all" && p.brand !== brandFilter) return false;
    if (typeFilter !== "all" && p.type !== typeFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.brand.toLowerCase().includes(search.toLowerCase()) &&
        !p.subcategory.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const currentSubs = catFilter !== "all" ? (SUBCATEGORIES[catFilter] || []) : [];

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      <Hero />

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ─── SIDEBAR FILTRES ─── */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-4">

            {/* Recherche */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: C.surface, border: `1.5px solid ${C.border}`, boxShadow: "0 2px 12px rgba(0,40,16,0.05)" }}
            >
              <div className="p-4">
                <p className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: C.green }}>Recherche</p>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nom, marque, culture…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl text-[13px] outline-none"
                    style={{ background: C.pale, color: C.dark, border: `1px solid ${C.border}` }}
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                </div>
              </div>
            </div>

            {/* Type */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: C.surface, border: `1.5px solid ${C.border}` }}
            >
              <div className="p-4">
                <p className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: C.green }}>Type</p>
                <div className="flex gap-2">
                  {[
                    { val: "all", label: "Tous" },
                    { val: "semence", label: "🌱 Semences" },
                    { val: "plant", label: "🥔 Plants" },
                  ].map(t => (
                    <button
                      key={t.val}
                      onClick={() => setTypeFilter(t.val as any)}
                      className="flex-1 py-2 rounded-xl text-[11px] font-black transition-all"
                      style={{
                        background: typeFilter === t.val ? C.green : C.pale,
                        color: typeFilter === t.val ? "white" : C.dark,
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Catégories */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: C.surface, border: `1.5px solid ${C.border}` }}
            >
              <div
                className="px-4 py-3"
                style={{ background: "linear-gradient(135deg, #2C1A0E, #3D6B21)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
              >
                <p className="text-[11px] font-black uppercase tracking-widest text-white/60">Catégories</p>
              </div>
              <div className="p-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setCatFilter(cat.id); setSubFilter("all"); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                    style={{
                      background: catFilter === cat.id ? C.pale : "transparent",
                      borderLeft: catFilter === cat.id ? `3px solid ${C.leaf}` : "3px solid transparent",
                    }}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-[13px] font-bold" style={{ color: catFilter === cat.id ? C.dark : "#4a6b4e" }}>
                      {cat.label}
                    </span>
                    <span
                      className="ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-md"
                      style={{ background: catFilter === cat.id ? C.leaf : "#f0f0f0", color: catFilter === cat.id ? "white" : "#888" }}
                    >
                      {cat.id === "all" ? PRODUCTS.length : PRODUCTS.filter(p => p.category === cat.id).length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Sous-catégories */}
              <AnimatePresence>
                {currentSubs.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="px-4 py-2 border-t border-b text-[10px] font-black uppercase tracking-widest"
                      style={{ borderColor: C.border, color: C.mid }}
                    >
                      Variétés
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => setSubFilter("all")}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all mb-0.5"
                        style={{
                          background: subFilter === "all" ? C.pale : "transparent",
                          color: subFilter === "all" ? C.dark : "#6b8a6e",
                        }}
                      >
                        Toutes
                      </button>
                      {currentSubs.map(sub => (
                        <button
                          key={sub}
                          onClick={() => setSubFilter(sub)}
                          className="w-full text-left px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all mb-0.5 flex items-center justify-between"
                          style={{
                            background: subFilter === sub ? C.pale : "transparent",
                            color: subFilter === sub ? C.dark : "#6b8a6e",
                          }}
                        >
                          {sub}
                          <span className="text-[10px] text-gray-400">
                            {PRODUCTS.filter(p => p.subcategory === sub).length}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Marques */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: C.surface, border: `1.5px solid ${C.border}` }}
            >
              <div
                className="px-4 py-3"
                style={{ background: "linear-gradient(135deg, #2C1A0E, #3D6B21)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
              >
                <p className="text-[11px] font-black uppercase tracking-widest text-white/60">Marques Partenaires</p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => setBrandFilter("all")}
                  className="w-full text-left px-3 py-2 rounded-xl text-[12px] font-bold transition-all mb-0.5"
                  style={{ background: brandFilter === "all" ? C.pale : "transparent", color: brandFilter === "all" ? C.dark : "#6b8a6e" }}
                >
                  Toutes les marques
                </button>
                {allBrands.map(brand => (
                  <button
                    key={brand}
                    onClick={() => setBrandFilter(brand)}
                    className="w-full text-left px-3 py-2 rounded-xl text-[11px] font-semibold transition-all mb-0.5 flex items-center gap-2"
                    style={{ background: brandFilter === brand ? C.pale : "transparent", color: brandFilter === brand ? C.dark : "#6b8a6e" }}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: BRAND_COLORS[brand] ?? C.green }}
                    />
                    {brand}
                    <span className="ml-auto text-[10px] text-gray-400">
                      {PRODUCTS.filter(p => p.brand === brand).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

           
          </aside>

          {/* ─── CONTENU PRINCIPAL ─── */}
          <div className="flex-1 min-w-0">
            {/* Barre contrôle */}
            <div
              className="rounded-2xl px-4 py-3 mb-5 flex flex-wrap gap-3 items-center"
              style={{ background: C.surface, border: `1.5px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,40,16,0.05)" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-black" style={{ color: C.dark }}>
                  {filtered.length} produit{filtered.length !== 1 ? "s" : ""}
                </span>
                {filtered.length !== PRODUCTS.length && (
                  <button
                    onClick={() => { setCatFilter("all"); setSubFilter("all"); setBrandFilter("all"); setTypeFilter("all"); setSearch(""); }}
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors hover:opacity-70"
                    style={{ background: C.pale, color: C.green }}
                  >
                    ✕ Réinitialiser
                  </button>
                )}
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-2 text-[12px] font-semibold text-gray-500">
                <span>🌱 Semences & Plants — {new Date().getFullYear()}</span>
              </div>
            </div>

            {/* Grille produits */}
            <AnimatePresence mode="wait">
              {filtered.length > 0 ? (
                <motion.div
                  key={`${catFilter}-${subFilter}-${brandFilter}-${typeFilter}-${search}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                >
                  {filtered.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-24 rounded-2xl"
                  style={{ background: C.surface, border: `1.5px solid ${C.border}` }}
                >
                  <div className="text-5xl mb-4">🌱</div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: C.dark }}>Aucun produit trouvé</h3>
                  <p className="text-sm text-gray-500 mb-4">Essayez de modifier vos critères de recherche</p>
                  <button
                    onClick={() => { setCatFilter("all"); setSubFilter("all"); setBrandFilter("all"); setTypeFilter("all"); setSearch(""); }}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: C.green }}
                  >
                    Voir tous les produits
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}