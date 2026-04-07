"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { motion, AnimatePresence }  from "framer-motion";
import Link          from "next/link";
import Image         from "next/image";
import { useLocale } from "next-intl";
import {
  MagnifyingGlassIcon, FunnelIcon, XMarkIcon,
  ArrowRightIcon, TagIcon, BuildingStorefrontIcon,
  Squares2X2Icon, ListBulletIcon, DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  getProduits, getMarques, getCategories,
  type ProduitPublic, type MarquePublic, type CategoriePublic,
} from "@/lib/api";
import { useDebounce, useUrlFilters, buildPages } from "@/lib/usePagination";
import PageHero from "@/components/PageHero/PageHero";

const EV = { forest:"#0a6030", leaf:"#7dc040", sage:"#4a9060", foam:"#e6f7e8", cream:"#f2faf3" };
const LIMIT = 12;

// ─── Skeleton card ────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-48 bg-gray-100" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-5 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    </div>
  );
}

// ─── Card grille ──────────────────────────────────────────────────
function ProduitCard({ produit, locale }: { produit: ProduitPublic; locale: string }) {
  const img = produit.images?.[0];
  return (
    <motion.div layout initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
      whileHover={{ y:-3 }}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="relative h-48 overflow-hidden flex-shrink-0"
        style={{ background:"linear-gradient(135deg,#e6f7e8,#c8eccc)" }}>
        {img?.url ? (
          <Image src={img.url} alt={img.alt ?? produit.nom} fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width:640px)100vw,(max-width:1024px)50vw,25vw" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-25">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={EV.forest} strokeWidth="1.2" strokeLinecap="round">
              <path d="M12 22V12M12 12C12 6 7 4 2 5c0 6 3 10 8 11 1 .3 2 0 2-4z"/>
              <path d="M12 12c0-6 5-8 10-7-1 6-4 10-8 11-1 .3-2 0-2-4z"/>
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1 text-xs font-bold" style={{ color:EV.forest }}>
          {produit.marque.nom}
        </div>
        {produit.division !== "standard" && (
          <div className="absolute top-3 right-3 rounded-lg px-2.5 py-1 text-xs font-black text-white" style={{ backgroundColor:EV.leaf }}>
            {produit.division.toUpperCase()}
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color:EV.sage }}>
          <TagIcon className="w-3.5 h-3.5" />{produit.categorie.nom}
        </p>
        <h3 className="font-black text-gray-900 text-base leading-snug mb-2 group-hover:text-[#0a6030] transition-colors line-clamp-2">
          {produit.nom}
        </h3>
        {produit.description && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3 flex-1">
            {produit.description.replace(/<[^>]+>/g,"")}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          {produit.fiche_technique && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <DocumentTextIcon className="w-3.5 h-3.5"/>Fiche
            </span>
          )}
          <Link href={`/${locale}/produits/${produit.slug}`}
            className="ml-auto flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl text-white hover:scale-105 transition-all"
            style={{ backgroundColor:EV.forest }}>
            Voir <ArrowRightIcon className="w-3.5 h-3.5"/>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Row liste ─────────────────────────────────────────────────────
function ProduitRow({ produit, locale }: { produit: ProduitPublic; locale: string }) {
  const img = produit.images?.[0];
  return (
    <motion.div layout initial={{ opacity:0,x:-12 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0 }}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex gap-4 p-4 items-center">
      <div className="relative w-20 h-16 rounded-xl overflow-hidden flex-shrink-0"
        style={{ background:"linear-gradient(135deg,#e6f7e8,#c8eccc)" }}>
        {img?.url ? (
          <Image src={img.url} alt={img.alt ?? produit.nom} fill className="object-contain p-1.5" sizes="80px"/>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-25">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={EV.forest} strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 22V12M12 12C12 6 7 4 2 5c0 6 3 10 8 11 1 .3 2 0 2-4z"/>
              <path d="M12 12c0-6 5-8 10-7-1 6-4 10-8 11-1 .3-2 0-2-4z"/>
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor:EV.foam, color:EV.sage }}>{produit.marque.nom}</span>
          <span className="text-xs text-gray-400">{produit.categorie.nom}</span>
        </div>
        <h3 className="font-black text-gray-900 text-sm leading-snug group-hover:text-[#0a6030] transition-colors truncate">{produit.nom}</h3>
        {produit.description && (
          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{produit.description.replace(/<[^>]+>/g,"")}</p>
        )}
      </div>
      <Link href={`/${locale}/produits/${produit.slug}`}
        className="flex-shrink-0 flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl text-white hover:scale-105 transition-all"
        style={{ backgroundColor:EV.forest }}>
        Détail <ArrowRightIcon className="w-3.5 h-3.5"/>
      </Link>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════
export default function ProduitsPage() {
  const locale = useLocale();
  const { get, getNum, set } = useUrlFilters();

  // ─── Filtres depuis URL ───────────────────────────────────────
  const [searchInput,  setSearchInput]  = useState(get("search"));
  const [selMarque,    setSelMarque]    = useState(getNum("marque"));
  const [selCategorie, setSelCategorie] = useState(getNum("categorie"));
  const [selDivision,  setSelDivision]  = useState(get("division") || undefined);
  const [page,         setPage]         = useState(Number(get("page", "1")));
  const [viewMode,     setViewMode]     = useState<"grid"|"list">("grid");
  const [showFilters,  setShowFilters]  = useState(false);

  // ─── Données ─────────────────────────────────────────────────
  const [produits,   setProduits]   = useState<ProduitPublic[]>([]);
  const [marques,    setMarques]    = useState<MarquePublic[]>([]);
  const [categories, setCategories] = useState<CategoriePublic[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [total,      setTotal]      = useState(0);
  const [pages,      setPages]      = useState(1);
  const [isPending,  startTransition] = useTransition();

  // Debounce de la recherche (350ms)
  const debouncedSearch = useDebounce(searchInput, 350);

  // Chargement des filtres référentiels une seule fois
  useEffect(() => {
    getMarques().then(r   => { if (r.success && r.data) setMarques(r.data); });
    getCategories().then(r => { if (r.success && r.data) setCategories(r.data); });
  }, []);

  // Fetch produits — déclenché à chaque changement de filtre
  const fetchProduits = useCallback(async (p: number) => {
    setLoading(true);
    const res = await getProduits({
      page:        p,
      limit:       LIMIT,
      id_marque:   selMarque,
      id_categorie:selCategorie,
      division:    selDivision,
      search:      debouncedSearch || undefined,
    });
    if (res.success && res.data) {
      setProduits(res.data);
      setTotal(res.meta?.total ?? res.data.length);
      setPages(res.meta?.pages ?? 1);
    }
    setLoading(false);
  }, [selMarque, selCategorie, selDivision, debouncedSearch]);

  useEffect(() => {
    startTransition(() => { fetchProduits(page); });
  }, [fetchProduits, page]);

  // Sync URL
  useEffect(() => {
    set({ search: debouncedSearch, marque: selMarque, categorie: selCategorie, division: selDivision, page });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selMarque, selCategorie, selDivision, page]);

  const resetPage   = () => setPage(1);
  const resetAll    = () => { setSearchInput(""); setSelMarque(undefined); setSelCategorie(undefined); setSelDivision(undefined); setPage(1); };
  const hasFiltres  = !!(selMarque || selCategorie || selDivision || debouncedSearch);
  const DIVISIONS   = ["pro", "garden", "standard"];

  return (
    <div className="min-h-screen" style={{ backgroundColor:EV.cream }}>

      {/* HERO */}
      <PageHero title="Nos Produits" subtitle="Catalogue complet — fertilisants, irrigation, semences et machinisme."
        gradientFrom="#0a6030" gradientTo="#2d6e45"
        badge="Catalogue complet" badgeColor="#7dc040" size="md"
        breadcrumbs={[{ label:"Produits" }]}>
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl max-w-lg">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 flex-shrink-0"/>
          <input type="text" value={searchInput}
            onChange={e => { setSearchInput(e.target.value); resetPage(); }}
            placeholder="Rechercher un produit…"
            className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm font-medium"/>
          {searchInput && (
            <button onClick={() => { setSearchInput(""); resetPage(); }}>
              <XMarkIcon className="w-4 h-4 text-gray-400 hover:text-gray-600"/>
            </button>
          )}
        </div>
      </PageHero>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">

        {/* Barre outils */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilters(v => !v)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all"
              style={showFilters ? { backgroundColor:EV.forest, color:"#fff", borderColor:EV.forest } : { borderColor:"#e5e7eb", color:"#374151" }}>
              <FunnelIcon className="w-4 h-4"/>
              Filtres
              {hasFiltres && <span className="w-2 h-2 rounded-full" style={{ backgroundColor:EV.leaf }}/>}
            </button>
            {hasFiltres && (
              <button onClick={resetAll} className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition-colors">
                <XMarkIcon className="w-4 h-4"/> Effacer
              </button>
            )}
            <span className="text-sm text-gray-400">
              {loading ? "Chargement…" : `${total} produit${total>1?"s":""}`}
            </span>
          </div>
          <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1 gap-1">
            {(["grid","list"] as const).map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                className="p-2 rounded-lg transition-all"
                style={viewMode===m ? { backgroundColor:EV.forest, color:"#fff" } : { color:"#9ca3af" }}>
                {m==="grid" ? <Squares2X2Icon className="w-4 h-4"/> : <ListBulletIcon className="w-4 h-4"/>}
              </button>
            ))}
          </div>
        </div>

        {/* Filtres panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
              className="overflow-hidden mb-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    <BuildingStorefrontIcon className="w-3.5 h-3.5 inline mr-1"/>Marque
                  </label>
                  <select value={selMarque??""} onChange={e => { setSelMarque(e.target.value ? Number(e.target.value) : undefined); resetPage(); }}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a6030]/30 bg-gray-50">
                    <option value="">Toutes les marques</option>
                    {marques.map(m => <option key={m.id_marque} value={m.id_marque}>{m.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    <TagIcon className="w-3.5 h-3.5 inline mr-1"/>Catégorie
                  </label>
                  <select value={selCategorie??""} onChange={e => { setSelCategorie(e.target.value ? Number(e.target.value) : undefined); resetPage(); }}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a6030]/30 bg-gray-50">
                    <option value="">Toutes les catégories</option>
                    {categories.map(c => <option key={c.id_categorie} value={c.id_categorie}>{c.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Division</label>
                  <div className="flex gap-2">
                    {DIVISIONS.map(div => (
                      <button key={div} onClick={() => { setSelDivision(selDivision===div ? undefined : div); resetPage(); }}
                        className="flex-1 py-2 rounded-xl text-sm font-bold capitalize border-2 transition-all"
                        style={selDivision===div ? { borderColor:EV.forest, backgroundColor:EV.forest, color:"#fff" } : { borderColor:"#e5e7eb", color:"#6b7280" }}>
                        {div}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grille / Liste */}
        {loading ? (
          <div className={viewMode==="grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" : "flex flex-col gap-3"}>
            {Array.from({ length: LIMIT }).map((_,i) =>
              viewMode==="grid"
                ? <SkeletonCard key={i}/>
                : <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse"/>
            )}
          </div>
        ) : produits.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor:EV.foam }}>
              <MagnifyingGlassIcon className="w-9 h-9" style={{ color:EV.sage }}/>
            </div>
            <h3 className="text-xl font-black text-gray-700 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-400 mb-6">Essayez d'autres critères.</p>
            <button onClick={resetAll} className="px-6 py-3 rounded-xl font-bold text-white hover:scale-105 transition-all"
              style={{ backgroundColor:EV.forest }}>Réinitialiser</button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={`${page}-${viewMode}`} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className={viewMode==="grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5" : "flex flex-col gap-3"}>
              {produits.map(p =>
                viewMode==="grid"
                  ? <ProduitCard key={p.id_produit} produit={p} locale={locale}/>
                  : <ProduitRow  key={p.id_produit} produit={p} locale={locale}/>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {pages > 1 && !loading && (
          <nav className="flex items-center justify-center gap-1.5 mt-12 flex-wrap">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-gray-500 hover:border-[#0a6030] hover:text-[#0a6030] disabled:opacity-30 transition-all">‹</button>
            {buildPages(page, pages).map((item, i) =>
              item === "…" ? (
                <span key={`e${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400">…</span>
              ) : (
                <button key={item} onClick={() => setPage(item as number)}
                  className="w-10 h-10 rounded-xl text-sm font-bold transition-all hover:scale-105"
                  style={item===page ? { backgroundColor:EV.forest, color:"#fff" } : { backgroundColor:"#fff", color:"#374151", border:"1px solid #e5e7eb" }}>
                  {item}
                </button>
              )
            )}
            <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page===pages}
              className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-gray-500 hover:border-[#0a6030] hover:text-[#0a6030] disabled:opacity-30 transition-all">›</button>
            <span className="text-xs text-gray-400 ml-2 hidden sm:block">
              Page {page}/{pages} — {total} produit{total>1?"s":""}
            </span>
          </nav>
        )}
      </div>
    </div>
  );
}
