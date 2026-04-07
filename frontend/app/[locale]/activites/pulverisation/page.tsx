"use client";
/**
 * app/[locale]/activites/pulverisation/page.tsx
 * Thème identique à l'original (vert + jaune accent Pulvert)
 * VERSION DYNAMIQUE — produits depuis /api/produits?marque=pulvert
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence }       from "framer-motion";
import Link     from "next/link";
import Image    from "next/image";
import { useLocale } from "next-intl";
import { PhoneIcon, EnvelopeIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { getProduits, type ProduitPublic } from "@/lib/api";

// ─── Données statiques de l'original (fallback si DB vide) ────────
const STATIC = [
  { id:"pd-12",   name:"Pulvert Pro 12L",       format:"12L",   code:"PV-PD-12",   catName:"Pulvérisateurs à Dos",        catEmoji:"🎒",  catId:"pulve-dos",     desc:"Pulvérisateur à pression constante" },
  { id:"pd-16",   name:"Pulvert Pro 16L",        format:"16L",   code:"PV-PD-16",   catName:"Pulvérisateurs à Dos",        catEmoji:"🎒",  catId:"pulve-dos",     desc:"Grande capacité, sangle ergonomique" },
  { id:"pd-20",   name:"Pulvert Pro 20L",        format:"20L",   code:"PV-PD-20",   catName:"Pulvérisateurs à Dos",        catEmoji:"🎒",  catId:"pulve-dos",     desc:"Format professionnel, robuste" },
  { id:"pd-elec", name:"Pulvert Électrique 16L", format:"16L",   code:"PV-PDE-16",  catName:"Pulvérisateurs à Dos",        catEmoji:"🎒",  catId:"pulve-dos",     desc:"Batterie 12V, autonomie 4h" },
  { id:"pt-400",  name:"Pulvert Agri 400L",      format:"400L",  code:"PV-PT-400",  catName:"Pulvérisateurs sur Tracteur", catEmoji:"🚜",  catId:"pulve-tracteur",desc:"Rampe 6m, pompe centrifuge" },
  { id:"pt-800",  name:"Pulvert Agri 800L",      format:"800L",  code:"PV-PT-800",  catName:"Pulvérisateurs sur Tracteur", catEmoji:"🚜",  catId:"pulve-tracteur",desc:"Rampe 12m, agitateur hydraulique" },
  { id:"pt-1500", name:"Pulvert Agri 1500L",     format:"1500L", code:"PV-PT-1500", catName:"Pulvérisateurs sur Tracteur", catEmoji:"🚜",  catId:"pulve-tracteur",desc:"Rampe 18m, GPS ready" },
  { id:"b-anti",  name:"Buse Anti-dérive",       format:"TF-VP", code:"PV-B-AD",    catName:"Buses & Accessoires",         catEmoji:"⚙️", catId:"buses",         desc:"Réduction dérive 75%" },
  { id:"b-plat",  name:"Buse à Jet Plat",        format:"Teejet",code:"PV-B-JP",    catName:"Buses & Accessoires",         catEmoji:"⚙️", catId:"buses",         desc:"Répartition homogène" },
  { id:"pj-1",    name:"Garden Spray 1L",        format:"1L",    code:"PV-PJ-1",    catName:"Pulvérisateurs Jardin",       catEmoji:"🌿", catId:"pulve-jardin",  desc:"Usage domestique, déclencheur confort" },
  { id:"pj-5",    name:"Garden Pro 5L",          format:"5L",    code:"PV-PJ-5",    catName:"Pulvérisateurs Jardin",       catEmoji:"🌿", catId:"pulve-jardin",  desc:"Semi-professionnel, pompe facile" },
];

const DIVISIONS = [
  { id:"agricole", name:"Pulvert Agricole", subtitle:"Professionnels de l'Agriculture", gradient:"from-[#1D6B2A] to-[#27932F]", accent:"#F2C200" },
  { id:"garden",   name:"Pulvert Garden",   subtitle:"Jardin & Maison",                 gradient:"from-[#1D6B2A] to-[#3CB648]", accent:"#F2C200" },
];

export default function PulverisationPage() {
  const locale = useLocale();

  const [divKey,  setDivKey]  = useState<"agricole"|"garden">("agricole");
  const [selCat,  setSelCat]  = useState<string|null>(null);
  const [search,  setSearch]  = useState("");
  const [produits,setProduits]= useState<ProduitPublic[]>([]);
  const [loading, setLoading] = useState(true);

  const div    = DIVISIONS.find(d => d.id === divKey)!;
  const accent = div.accent;

  useEffect(() => {
    getProduits({ limit:100, marque:"pulvert" } as any).then(res => {
      if (res.success && res.data) setProduits(res.data);
      setLoading(false);
    });
  }, []);

  // Utiliser données dynamiques ou fallback statique
  const useStatic = !loading && produits.length === 0;

  // Catégories disponibles
  const categories = useMemo(() => {
    if (useStatic) {
      const map = new Map<string,{ id:string;name:string;emoji:string }>();
      STATIC.forEach(p => { if (!map.has(p.catId)) map.set(p.catId, { id:p.catId, name:p.catName, emoji:p.catEmoji }); });
      return Array.from(map.values());
    }
    const divisionProduits = produits.filter(p => p.division === divKey || p.division === "standard");
    const map = new Map<string,{ id:string;name:string;emoji:string }>();
    divisionProduits.forEach(p => { if (!map.has(p.categorie.slug)) map.set(p.categorie.slug, { id:p.categorie.slug, name:p.categorie.nom, emoji:"🌿" }); });
    return Array.from(map.values());
  }, [produits, useStatic, divKey]);

  // Produits affichés selon filtres
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (useStatic) {
      return STATIC.filter(p => {
        const mCat    = !selCat || p.catId === selCat;
        const mSearch = !q     || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
        return mCat && mSearch;
      });
    }
    const divisionProduits = produits.filter(p => p.division === divKey || p.division === "standard");
    return divisionProduits.filter(p => {
      const mCat    = !selCat || p.categorie.slug === selCat;
      const mSearch = !q     || p.nom.toLowerCase().includes(q);
      return mCat && mSearch;
    });
  }, [produits, useStatic, divKey, selCat, search]);

  return (
    <div className="min-h-screen bg-[#fffef0]">

      {/* HERO — identique à l'original */}
      <div className={`bg-gradient-to-br ${div.gradient} text-white`}>
        <div className="max-w-screen-xl mx-auto px-8 py-12">
          <p className="text-white/50 text-[11px] font-bold uppercase tracking-widest mb-2">Activité</p>
          <h1 className="text-4xl font-black mb-1">{div.name}</h1>
          <p className="text-white/70 mb-6">{div.subtitle} — Pulvérisateurs & Accessoires</p>
          {/* Sélecteur division */}
          <div className="flex gap-2">
            {DIVISIONS.map(d => (
              <button key={d.id} onClick={() => { setDivKey(d.id as any); setSelCat(null); setSearch(""); }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-2"
                style={d.id===divKey
                  ? { background:"rgba(255,255,255,0.95)", color:"#1D6B2A", borderColor:"white" }
                  : { background:"rgba(255,255,255,0.1)", color:"white", borderColor:"rgba(255,255,255,0.3)" }}>
                {d.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BARRE FILTRE — sticky comme l'original */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-[100]"
        style={{ boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
        <div className="max-w-screen-xl mx-auto px-8">
          <div className="flex items-center gap-2 py-3 flex-wrap">
            <button onClick={() => setSelCat(null)}
              className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background:!selCat ? accent : "transparent", color:!selCat ? "#1a1a1a" : "#9ca3af" }}>
              Tous <span className="text-[11px] px-1.5 py-0.5 rounded-full font-bold ml-1"
                style={{ background:!selCat ? "rgba(0,0,0,0.1)" : "#f3f4f6", color:!selCat ? "#1a1a1a" : "#9ca3af" }}>
                {filtered.length}
              </span>
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1"/>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelCat(cat.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background:selCat===cat.id ? accent : "transparent", color:selCat===cat.id ? "#1a1a1a" : "#6b7280" }}>
                <span>{cat.emoji}</span> {cat.name}
              </button>
            ))}
            <div className="ml-auto relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
              <input type="text" placeholder="Rechercher…" value={search} onChange={e=>setSearch(e.target.value)}
                className="pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm w-48 outline-none focus:w-60 transition-all"
                onFocus={e=>(e.target.style.borderColor=accent)} onBlur={e=>(e.target.style.borderColor="")}/>
              {search && (
                <button onClick={()=>setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <XMarkIcon className="w-3.5 h-3.5"/>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GRILLE */}
      <div className="max-w-screen-xl mx-auto px-8 py-8">
        <p className="text-sm text-gray-500 mb-6">
          <span className="font-black text-gray-900 text-2xl">{filtered.length}</span> produit{filtered.length>1?"s":""}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length:8 }).map((_,i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 h-52 animate-pulse"/>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={divKey+selCat+search} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(filtered as any[]).map((p: any) => {
                const isDynamic = "id_produit" in p;
                const dprod     = isDynamic ? p as ProduitPublic : null;
                const img       = dprod?.images?.[0];
                return (
                  <motion.div key={isDynamic ? dprod!.id_produit : p.id}
                    layout initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}
                    className="bg-white rounded-2xl border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all flex flex-col gap-3 overflow-hidden">
                    {img?.url ? (
                      <div className="relative h-28 bg-gray-50">
                        <Image src={img.url} alt={img.alt ?? dprod!.nom} fill className="object-contain p-3" sizes="260px"/>
                      </div>
                    ) : null}
                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm leading-snug">
                            {isDynamic ? dprod!.nom : p.name}
                          </h3>
                          <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                            {isDynamic ? dprod!.marque.nom : p.code}
                          </p>
                        </div>
                        <span className="flex-shrink-0 text-[11px] font-black text-white px-3 py-1.5 rounded-lg"
                          style={{ backgroundColor:accent }}>
                          {isDynamic ? dprod!.division.toUpperCase() : p.format}
                        </span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="text-[11px] px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full font-medium">
                          {isDynamic ? `${dprod!.categorie.nom}` : `${p.catEmoji} ${p.catName}`}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed flex-1">
                        {isDynamic
                          ? dprod!.description?.replace(/<[^>]+>/g,"").substring(0,80)
                          : p.desc}
                      </p>
                      <div className="flex gap-2 pt-1">
                        <a href="tel:+21671333858"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-white rounded-xl hover:opacity-90 transition-opacity"
                          style={{ backgroundColor:accent, color:"#1a1a1a" }}>
                          <PhoneIcon className="w-3.5 h-3.5"/> Appeler
                        </a>
                        {isDynamic ? (
                          <Link href={`/${locale}/produits/${dprod!.slug}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl border-2 hover:bg-gray-50 transition-all"
                            style={{ borderColor:accent, color:"#1D6B2A" }}>
                            Voir produit
                          </Link>
                        ) : (
                          <Link href={`/${locale}/contact?product=${encodeURIComponent(p.name)}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl border-2 hover:bg-gray-50 transition-all"
                            style={{ borderColor:accent, color:"#1D6B2A" }}>
                            <EnvelopeIcon className="w-3.5 h-3.5"/> Devis
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* FOOTER CTA */}
      <div className={`bg-gradient-to-br ${div.gradient} text-white py-14 mt-4`}>
        <div className="max-w-lg mx-auto px-8 text-center">
          <h2 className="text-2xl font-black mb-2">Besoin d'un conseil technique ?</h2>
          <p className="text-white/70 text-sm mb-8">Nos spécialistes en pulvérisation vous accompagnent dans vos choix.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+21671333858"
              className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white font-bold rounded-xl text-sm hover:bg-gray-50"
              style={{ color:accent=="#F2C200" ? "#1D6B2A" : accent }}>
              <PhoneIcon className="w-4 h-4"/> (+216) 71 333 858
            </a>
            <Link href={`/${locale}/contact`}
              className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 border-2 border-white/50 text-white font-bold rounded-xl text-sm hover:bg-white/20">
              <EnvelopeIcon className="w-4 h-4"/> Contactez-nous
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
