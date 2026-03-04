"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLocale } from "next-intl";
import { PhoneIcon, EnvelopeIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

const divisions = [
  {
    id: "agricole",
    name: "Pulvert Agricole",
    subtitle: "Professionnels de l'Agriculture",
    gradient: "from-[#134e4a] to-[#0f766e]",
    accent: "#0f766e",
    categories: [
      {
        id: "pulve-dos",
        name: "Pulvérisateurs à Dos",
        emoji: "🎒",
        products: [
          { id: "pd-12", name: "Pulvert Pro 12L", format: "12L", code: "PV-PD-12", description: "Pulvérisateur à pression constante" },
          { id: "pd-16", name: "Pulvert Pro 16L", format: "16L", code: "PV-PD-16", description: "Grande capacité, sangle ergonomique" },
          { id: "pd-20", name: "Pulvert Pro 20L", format: "20L", code: "PV-PD-20", description: "Format professionnel, robuste" },
          { id: "pd-elec", name: "Pulvert Électrique 16L", format: "16L", code: "PV-PDE-16", description: "Batterie 12V, autonomie 4h" },
        ],
      },
      {
        id: "pulve-tracteur",
        name: "Pulvérisateurs sur Tracteur",
        emoji: "🚜",
        products: [
          { id: "pt-400", name: "Pulvert Agri 400L", format: "400L", code: "PV-PT-400", description: "Rampe 6m, pompe centrifuge" },
          { id: "pt-800", name: "Pulvert Agri 800L", format: "800L", code: "PV-PT-800", description: "Rampe 12m, agitateur hydraulique" },
          { id: "pt-1500", name: "Pulvert Agri 1500L", format: "1500L", code: "PV-PT-1500", description: "Rampe 18m, GPS ready" },
          { id: "pt-3000", name: "Pulvert Agri 3000L", format: "3000L", code: "PV-PT-3000", description: "Rampe 24m, section control" },
        ],
      },
      {
        id: "buses",
        name: "Buses & Accessoires",
        emoji: "⚙️",
        products: [
          { id: "b-anti", name: "Buse Anti-dérive", format: "TF-VP", code: "PV-B-AD", description: "Réduction dérive 75%" },
          { id: "b-plat", name: "Buse à Jet Plat", format: "Teejet", code: "PV-B-JP", description: "Répartition homogène" },
          { id: "filtres", name: "Filtres Inox", format: "50/80 mesh", code: "PV-F-INX", description: "Filtration haute performance" },
          { id: "manometre", name: "Manomètre Glycérine", format: "0-10 bar", code: "PV-M-GLY", description: "Précision 2.5%" },
        ],
      },
    ],
  },
  {
    id: "garden",
    name: "Pulvert Garden",
    subtitle: "Jardin & Maison",
    gradient: "from-[#0d3b6e] to-[#1a5fa8]",
    accent: "#1a5fa8",
    categories: [
      {
        id: "pulve-jardin",
        name: "Pulvérisateurs Jardin",
        emoji: "🌿",
        products: [
          { id: "pj-1", name: "Garden Spray 1L", format: "1L", code: "PV-PJ-1", description: "Usage domestique, déclencheur confort" },
          { id: "pj-2", name: "Garden Spray 2L", format: "2L", code: "PV-PJ-2", description: "Buse réglable multi-jets" },
          { id: "pj-5", name: "Garden Pro 5L", format: "5L", code: "PV-PJ-5", description: "Semi-professionnel, pompe facile" },
          { id: "pj-elec", name: "Garden Electric 8L", format: "8L", code: "PV-PJE-8", description: "Batterie Li-ion, 6h d'autonomie" },
        ],
      },
      {
        id: "accessoires-garden",
        name: "Accessoires",
        emoji: "🔧",
        products: [
          { id: "lance-tel", name: "Lance Télescopique", format: "80-140cm", code: "PV-LT-140", description: "Atteindre les parties hautes" },
          { id: "kit-buse", name: "Kit 5 Buses", format: "Universel", code: "PV-KB-5", description: "5 jets différents inclus" },
          { id: "courroie", name: "Sangle Confort", format: "Mousse", code: "PV-SC-M", description: "Anti-fatigue, réglable" },
        ],
      },
    ],
  },
];

export default function PulvertPage() {
  const locale = useLocale();
  const [divKey, setDivKey] = useState<"agricole" | "garden">("agricole");
  const [selCat, setSelCat] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const div = divisions.find((d) => d.id === divKey)!;
  const accent = div.accent;

  const allProducts = div.categories.flatMap((cat) =>
    cat.products.map((p) => ({ ...p, catName: cat.name, catEmoji: cat.emoji, catId: cat.id }))
  );

  const filtered = allProducts.filter((p) => {
    const q = search.toLowerCase();
    const mQ = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    const mC = !selCat || p.catId === selCat;
    return mQ && mC;
  });

  return (
    <div className="min-h-screen bg-[#f0fdfa]">
      {/* HERO */}
      <div className={`bg-gradient-to-br ${div.gradient} text-white`}>
        <div className="max-w-screen-xl mx-auto px-8 py-12">
          <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest mb-2">Marque</p>
          <h1 className="text-4xl font-black mb-1">{div.name}</h1>
          <p className="text-white/70 mb-8">{div.subtitle} — Pulvérisateurs & Accessoires</p>
        </div>
      </div>

      {/* FILTRE */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-[100]" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div className="max-w-screen-xl mx-auto px-8">
          <div className="flex items-center gap-2 py-3 flex-wrap">
            <button onClick={() => setSelCat(null)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${!selCat && !search ? "text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}
              style={!selCat && !search ? { backgroundColor: accent } : {}}>
              Tous <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ml-1 ${!selCat && !search ? "bg-white/25 text-white" : "bg-gray-100 text-gray-400"}`}>{allProducts.length}</span>
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            {div.categories.map((cat) => (
              <button key={cat.id} onClick={() => setSelCat(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${selCat === cat.id ? "text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}
                style={selCat === cat.id ? { backgroundColor: accent } : {}}>
                <span>{cat.emoji}</span> {cat.name}
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${selCat === cat.id ? "bg-white/25 text-white" : "bg-gray-100 text-gray-400"}`}>{cat.products.length}</span>
              </button>
            ))}
            <div className="ml-auto relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm w-48 outline-none focus:w-60 transition-all"
                onFocus={(e) => (e.target.style.borderColor = accent)} onBlur={(e) => (e.target.style.borderColor = "")} />
              {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"><XMarkIcon className="w-3.5 h-3.5" /></button>}
            </div>
          </div>
        </div>
      </div>

      {/* GRILLE */}
      <div className="max-w-screen-xl mx-auto px-8 py-8">
        <p className="text-sm text-gray-500 mb-6"><span className="font-black text-gray-900 text-2xl">{filtered.length}</span> produit{filtered.length > 1 ? "s" : ""}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <motion.div key={p.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm leading-snug">{p.name}</h3>
                  <p className="text-[11px] font-mono text-gray-400 mt-0.5">{p.code}</p>
                </div>
                <span className="flex-shrink-0 text-[11px] font-black text-white px-3 py-1.5 rounded-lg" style={{ backgroundColor: accent }}>{p.format}</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <span className="text-[11px] px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full font-medium">{p.catEmoji} {p.catName}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed flex-1">{p.description}</p>
              <div className="flex gap-2 pt-1">
                <a href="tel:+21671333858" className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-white rounded-xl hover:opacity-90 transition-opacity" style={{ backgroundColor: accent }}>
                  <PhoneIcon className="w-3.5 h-3.5" /> Appeler
                </a>
                <Link href={`/${locale}/contact?product=${encodeURIComponent(p.name)}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl border-2 hover:bg-gray-50 transition-all"
                  style={{ borderColor: accent, color: accent }}>
                  <EnvelopeIcon className="w-3.5 h-3.5" /> Devis
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className={`bg-gradient-to-br ${div.gradient} text-white py-14 mt-4`}>
        <div className="max-w-lg mx-auto px-8 text-center">
          <h2 className="text-2xl font-black mb-2">Besoin d'un conseil technique ?</h2>
          <p className="text-white/70 text-sm mb-8">Nos spécialistes en pulvérisation vous accompagnent dans vos choix.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+21671333858" className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white font-bold rounded-xl text-sm hover:bg-gray-50" style={{ color: accent }}>
              <PhoneIcon className="w-4 h-4" /> (+216) 71 333 858
            </a>
            <Link href={`/${locale}/contact`} className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 border-2 border-white/50 text-white font-bold rounded-xl text-sm hover:bg-white/20">
              <EnvelopeIcon className="w-4 h-4" /> Contactez-nous
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}