"use client";
/**
 * ProductFilter v2 — conforme à l'arborescence Fertivert
 * Hiérarchie: Division (Pro/Garden) → Activité → Catégorie → Sous-catégorie
 * Le backend gère le filtre hiérarchique (catégorie parent inclut ses enfants)
 */
import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronRight, SlidersHorizontal, X, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Categorie } from "@/types/api";

export type DivisionFilter = "all" | "pro" | "garden" | "standard";

interface ProductFilterProps {
  categories:      Categorie[];
  activeCatId:     number | null;
  onCatChange:     (id: number | null) => void;
  search:          string;
  onSearchChange:  (s: string) => void;
  totalCount:      number;
  filteredCount:   number;
  // Filtre division (optionnel — affiché si des produits ont division pro/garden)
  showDivision?:   boolean;
  activeDivision?: DivisionFilter;
  onDivisionChange?: (d: DivisionFilter) => void;
}

const DIVISION_LABELS: Record<DivisionFilter, string> = {
  all: "Tous", pro: "Pro", garden: "Garden", standard: "Standard",
};

const DIVISION_STYLES: Record<DivisionFilter, string> = {
  all:      "bg-ev-700 text-white",
  pro:      "bg-ev-900 text-white",
  garden:   "bg-leaf text-white",
  standard: "bg-gray-600 text-white",
};

export function ProductFilter({
  categories, activeCatId, onCatChange,
  search, onSearchChange, totalCount, filteredCount,
  showDivision = false, activeDivision = "all", onDivisionChange,
}: ProductFilterProps) {
  const [openCats,   setOpenCats]   = useState<Set<number>>(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);

  // Séparer catégories racines et enfants
  const roots      = useMemo(() => categories.filter(c => !c.parent_id), [categories]);
  const childrenOf = (id: number) => categories.filter(c => c.parent_id === id);

  // Grouper les racines par activité
  const grouped = useMemo(() => {
    const groups: { activiteId: number | null; activiteNom: string | null; cats: Categorie[] }[] = [];
    const seen = new Map<number | null, Categorie[]>();
    roots.forEach(cat => {
      const aid = cat.id_activite;
      if (!seen.has(aid)) seen.set(aid, []);
      seen.get(aid)!.push(cat);
    });
    // Activités connues → chercher le nom depuis les catégories elles-mêmes
    // (on n'a pas le nom de l'activité dans le type Categorie, mais id_activite suffit pour le groupement)
    seen.forEach((cats, activiteId) => {
      groups.push({ activiteId, activiteNom: null, cats });
    });
    // Trier: activités en premier, sans activité en dernier
    groups.sort((a, b) => (a.activiteId ?? 999) - (b.activiteId ?? 999));
    return groups;
  }, [roots]);

  const toggle = (id: number) =>
    setOpenCats(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const select = (id: number | null) => { onCatChange(id); setMobileOpen(false); };
  const reset  = () => { select(null); onSearchChange(""); onDivisionChange?.("all"); };

  const hasFilter = activeCatId !== null || search || activeDivision !== "all";

  const FilterContent = () => (
    <div className="space-y-1">

      {/* Division */}
      {showDivision && onDivisionChange && (
        <div className="mb-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 mb-2">Division</p>
          <div className="grid grid-cols-2 gap-1.5">
            {(["all", "pro", "garden"] as DivisionFilter[]).map(d => (
              <button key={d} onClick={() => onDivisionChange(d)}
                className={cn(
                  "px-2 py-2 rounded-xl text-xs font-bold transition-all",
                  activeDivision === d
                    ? DIVISION_STYLES[d]
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}>
                {DIVISION_LABELS[d]}
              </button>
            ))}
          </div>
          <div className="h-px bg-gray-100 mt-4 mb-2" />
        </div>
      )}

      {/* Tous les produits */}
      <button
        onClick={() => select(null)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
          activeCatId === null
            ? "bg-ev-700 text-white shadow-sm"
            : "text-gray-700 hover:bg-ev-50 hover:text-ev-800"
        )}
      >
        <span className="flex items-center gap-2.5">
          <Layers size={13} className={activeCatId === null ? "text-white/70" : "text-leaf"} />
          Tous les produits
        </span>
        <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-bold",
          activeCatId === null ? "bg-white/20 text-white" : "bg-ev-100 text-ev-700")}>
          {totalCount}
        </span>
      </button>

      {/* Catégories groupées par activité */}
      {grouped.map(({ activiteId, cats }) => (
        <div key={activiteId ?? "none"}>
          {/* Séparateur de groupe si plusieurs activités */}
          {grouped.length > 1 && (
            <div className="flex items-center gap-2 mt-3 mb-1.5 px-1">
              <div className="h-px flex-1 bg-gradient-to-r from-ev-100 to-transparent" />
            </div>
          )}

          {cats.map(cat => {
            const children    = childrenOf(cat.id_categorie);
            const hasKids     = children.length > 0;
            const isOpen      = openCats.has(cat.id_categorie);
            const isActive    = activeCatId === cat.id_categorie;
            const childActive = children.some(c => c.id_categorie === activeCatId);

            return (
              <div key={cat.id_categorie}>
                <div className={cn(
                  "flex items-center rounded-xl transition-all",
                  (isActive || childActive) ? "bg-ev-50" : "hover:bg-sand-50"
                )}>
                  <button
                    onClick={() => select(cat.id_categorie)}
                    className={cn(
                      "flex-1 flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors",
                      isActive ? "text-ev-800 font-bold" : childActive ? "text-ev-700 font-semibold" : "text-gray-700 font-medium"
                    )}
                  >
                    <span className={cn(
                      "w-2 h-2 rounded-full shrink-0 transition-all",
                      isActive    ? "bg-ev-600 scale-125" :
                      childActive ? "bg-leaf" : "bg-sand-300"
                    )} />
                    {cat.nom}
                  </button>
                  {hasKids && (
                    <button onClick={() => toggle(cat.id_categorie)}
                      className="p-2.5 text-gray-400 hover:text-ev-600 transition-colors">
                      {isOpen
                        ? <ChevronDown size={13} className="text-ev-500" />
                        : <ChevronRight size={13} />}
                    </button>
                  )}
                </div>

                {/* Sous-catégories */}
                {hasKids && isOpen && (
                  <div className="ml-5 mt-0.5 mb-1.5 pl-3 border-l-2 border-ev-100 space-y-0.5">
                    {children.map(sub => {
                      const grandChildren = childrenOf(sub.id_categorie);
                      const subHasKids    = grandChildren.length > 0;
                      const subOpen       = openCats.has(sub.id_categorie);
                      const subActive     = activeCatId === sub.id_categorie;
                      const grandActive   = grandChildren.some(g => g.id_categorie === activeCatId);

                      return (
                        <div key={sub.id_categorie}>
                          <div className={cn("flex items-center rounded-lg transition-all",
                            (subActive || grandActive) ? "bg-ev-50" : "hover:bg-sand-50")}>
                            <button onClick={() => select(sub.id_categorie)}
                              className={cn(
                                "flex-1 flex items-center gap-2 px-2.5 py-2 text-[13px] text-left transition-colors",
                                subActive ? "text-ev-800 font-bold" : grandActive ? "text-ev-700 font-semibold" : "text-gray-600"
                              )}>
                              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                                subActive ? "bg-ev-600" : grandActive ? "bg-leaf" : "bg-sand-200")} />
                              {sub.nom}
                            </button>
                            {subHasKids && (
                              <button onClick={() => toggle(sub.id_categorie)}
                                className="p-2 text-gray-400 hover:text-ev-600">
                                {subOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                              </button>
                            )}
                          </div>

                          {/* Niveau 3 */}
                          {subHasKids && subOpen && (
                            <div className="ml-4 mt-0.5 pl-2.5 border-l border-ev-100 space-y-0.5">
                              {grandChildren.map(g => (
                                <button key={g.id_categorie} onClick={() => select(g.id_categorie)}
                                  className={cn(
                                    "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] transition-all text-left",
                                    activeCatId === g.id_categorie
                                      ? "bg-ev-600 text-white font-bold"
                                      : "text-gray-500 hover:bg-ev-50 hover:text-ev-700"
                                  )}>
                                  <span className={cn("w-1 h-1 rounded-full shrink-0",
                                    activeCatId === g.id_categorie ? "bg-white" : "bg-sand-200")} />
                                  {g.nom}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────── */}
      <aside className="hidden lg:block w-60 shrink-0">
        <div className="sticky top-28 space-y-3">
          {/* Recherche */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="search" value={search} onChange={e => onSearchChange(e.target.value)}
              placeholder="Rechercher…"
              className="w-full h-10 pl-10 pr-9 text-sm border border-sand-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-ev-400/30 focus:border-ev-400 transition-all" />
            {search && (
              <button onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-sand-200 shadow-card overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-ev-50 to-sand-50 border-b border-sand-200 flex items-center justify-between">
              <h3 className="text-[10px] font-black text-ev-800 uppercase tracking-widest flex items-center gap-1.5">
                <SlidersHorizontal size={11} />Filtrer
              </h3>
              {hasFilter && (
                <button onClick={reset}
                  className="text-[10px] text-ev-600 hover:text-ev-800 font-bold flex items-center gap-1">
                  <X size={10} />Effacer tout
                </button>
              )}
            </div>
            <div className="p-3 max-h-[65vh] overflow-y-auto">
              <FilterContent />
            </div>
          </div>

          {/* Compteur résultats */}
          {hasFilter && filteredCount !== totalCount && (
            <p className="text-xs text-center text-ev-600 font-semibold">
              {filteredCount} produit{filteredCount !== 1 ? "s" : ""} affiché{filteredCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </aside>

      {/* ── Mobile bar ────────────────────────────────────────────── */}
      <div className="lg:hidden mb-5 flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="search" value={search} onChange={e => onSearchChange(e.target.value)}
            placeholder="Rechercher un produit…"
            className="w-full h-10 pl-10 pr-4 text-sm border border-sand-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-ev-400/30" />
        </div>
        <button onClick={() => setMobileOpen(true)}
          className={cn("flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-bold border transition-all shrink-0",
            hasFilter ? "bg-ev-700 text-white border-ev-700" : "bg-white text-gray-700 border-sand-200 hover:border-ev-300")}>
          <SlidersHorizontal size={14} />
          {hasFilter ? "Filtrés" : "Filtrer"}
        </button>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[82vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-sand-200 shrink-0">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-ev-600" />Filtrer les produits
              </h3>
              <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4"><FilterContent /></div>
            {hasFilter && (
              <div className="p-4 border-t border-sand-100 shrink-0">
                <button onClick={reset} className="w-full h-10 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-50 font-medium">
                  Effacer tous les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
