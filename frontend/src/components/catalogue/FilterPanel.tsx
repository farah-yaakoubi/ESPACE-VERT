"use client";
import {
  useState, useMemo, useCallback, useEffect, useRef,
} from "react";
import {
  Search, SlidersHorizontal, ChevronRight, ChevronDown,
  X, Layers, Tag, LayoutGrid, ArrowUpDown, Check, SlidersVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProduitCard } from "@/types/api";
import { useI18n } from "@/i18n/I18nProvider";
import { translatedField } from "@/i18n/translated-field";
import type { Locale } from "@/i18n/config";

export interface CatNode {
  id_categorie: number;
  nom:          string;
  slug:         string;
  parent_id:    number | null;
  parent_ids_extra?: number[];
  translations?: ProduitCard["translations"];
  ordre?:       number;
  created_at?:   string;
  image?:       string | null;
  sous_cats?:   CatNode[];
  children:     CatNode[];
}

export type SortKey = "nom_asc" | "nom_desc" | "newest";

export interface FilterState {
  categoryId: number | null;
  tags:       string[];
  divisions:  string[];
  sort:       SortKey;
  search:     string;
}

export const DEFAULT_FILTERS: FilterState = {
  categoryId: null,
  tags:       [],
  divisions:  [],
  sort:       "newest",
  search:     "",
};

interface FilterPanelProps {
  tree:             CatNode[];
  produits:         ProduitCard[];
  filters:          FilterState;
  onChange:         (f: FilterState) => void;
  totalAll:         number;
  onCategoryClick?: (id: number | null) => void; // intercept category selection
  hideCategoryTree?: boolean; // masque l'arbre de catégories (ex: page Semences, où les catégories sont déjà affichées en tuiles au-dessus)
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function collectIds(node: CatNode): Set<number> {
  const ids = new Set<number>([node.id_categorie]);
  (node.children ?? []).forEach(c => collectIds(c).forEach(id => ids.add(id)));
  return ids;
}

function findNode(nodes: CatNode[], id: number): CatNode | null {
  for (const n of nodes) {
    if (n.id_categorie === id) return n;
    const found = findNode(n.children ?? [], id);
    if (found) return found;
  }
  return null;
}

function extractTags(produits: ProduitCard[]): string[] {
  const set = new Set<string>();
  produits.forEach(p => {
    if (Array.isArray(p.tags)) (p.tags as string[]).forEach(t => set.add(t));
    else if (typeof p.tags === "string" && (p.tags as string).trim())
      (p.tags as string).split(",").map(t => t.trim()).filter(Boolean).forEach(t => set.add(t));
  });
  return [...set].sort((a, b) => a.localeCompare(b, "fr"));
}

function extractDivisions(produits: ProduitCard[]): string[] {
  const set = new Set<string>();
  produits.forEach(p => { if (p.division?.trim()) set.add(p.division.trim()); });
  return [...set].sort((a, b) => a.localeCompare(b, "fr"));
}

function labelOf(item: { nom: string; translations?: ProduitCard["translations"] | null }, locale: Locale) {
  return translatedField(item as any, "nom", locale) || item.nom;
}

function descriptionOf(item: { description?: string | null; translations?: ProduitCard["translations"] | null }, locale: Locale) {
  return translatedField(item as any, "description", locale) || item.description || "";
}

/* Count produits that would match a given cat (considering other filters too) */
function countForCat(
  produits: ProduitCard[],
  catIds: Set<number>,
  filters: FilterState,
  locale: Locale,
): number {
  return produits.filter(p => {
    if (!catIds.has((p as any).id_categorie)) return false;
    if (filters.tags.length > 0) {
      const ptags = Array.isArray(p.tags)
        ? (p.tags as string[])
        : typeof p.tags === "string" ? (p.tags as string).split(",").map(t => t.trim()) : [];
      if (!filters.tags.every(t => ptags.includes(t))) return false;
    }
    if (filters.divisions.length > 0 && !filters.divisions.includes(p.division)) return false;
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      const name = labelOf(p, locale).toLowerCase();
      const description = descriptionOf(p, locale).toLowerCase();
      if (!name.includes(q) && !description.includes(q)) return false;
    }
    return true;
  }).length;
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

/** Collapsible section in the sidebar */
function FilterSection({
  label, icon, children, defaultOpen = true, badge,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-3 text-left group"
      >
        <span className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-ev-700 transition-colors">
          {icon}
          {label}
          {badge !== undefined && badge > 0 && (
            <span className="bg-ev-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </span>
        <ChevronDown
          size={13}
          className={cn(
            "text-gray-400 transition-transform duration-200",
            open ? "rotate-180" : "rotate-0"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          open ? "max-h-[600px] opacity-100 pb-3" : "max-h-0 opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Single cat tree node */
function CatTreeNode({
  node, depth, activeCatId, openSet, produits, filters, locale, onSelect, onToggle,
}: {
  node:        CatNode;
  depth:       number;
  activeCatId: number | null;
  openSet:     Set<number>;
  produits:    ProduitCard[];
  filters:     FilterState;
  locale:      Locale;
  onSelect:    (id: number | null) => void;
  onToggle:    (id: number) => void;
}) {
  const hasKids  = (node.children ?? []).length > 0;
  const isOpen   = openSet.has(node.id_categorie);
  const isActive = activeCatId === node.id_categorie;
  const catIds   = useMemo(() => collectIds(node), [node]);
  const count    = useMemo(
    () => countForCat(produits, catIds, { ...filters, categoryId: null }, locale),
    [produits, catIds, filters, locale]
  );
  const label = labelOf(node, locale);

  const hasActiveChild = hasKids && activeCatId !== null && (() => {
    const ids = collectIds(node); ids.delete(node.id_categorie); return ids.has(activeCatId);
  })();

  return (
    <div>
      <div
        className={cn(
          "flex items-center justify-between rounded-xl transition-all group",
          depth === 0 ? "mb-0.5" : "mb-px",
        )}
      >
        {/* Select button */}
        <button
          onClick={() => onSelect(node.id_categorie)}
          className={cn(
            "flex-1 flex items-center gap-2 text-left rounded-xl transition-all px-2.5 py-2",
            depth > 0 ? "text-xs ml-3" : "text-sm",
            isActive
              ? "bg-ev-700 text-white font-semibold"
              : hasActiveChild
                ? "bg-ev-50 text-ev-800 font-semibold"
                : "text-gray-700 hover:bg-ev-50 hover:text-ev-800 font-medium",
          )}
        >
          <span className={cn(
            "shrink-0 rounded-full transition-colors",
            depth > 0 ? "w-1.5 h-1.5" : "w-2 h-2",
            isActive ? "bg-white" : hasActiveChild ? "bg-ev-500" : depth > 0 ? "bg-gray-300" : "bg-ev-500",
          )} />
          <span className="truncate flex-1">{label}</span>
        </button>

        {/* Toggle children */}
        {hasKids && (
          <button
            onClick={() => onToggle(node.id_categorie)}
            className={cn(
              "shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-all",
              isActive ? "hover:bg-white/20 text-white/70" : "hover:bg-ev-100 text-gray-400 hover:text-ev-600",
            )}
            title={isOpen ? "Réduire" : "Développer"}
          >
            <ChevronRight size={12} className={cn("transition-transform duration-200", isOpen ? "rotate-90" : "")} />
          </button>
        )}
      </div>

      {/* Children */}
      {hasKids && (
        <div className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out border-l-2 ml-4",
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
          isActive || hasActiveChild ? "border-ev-200" : "border-gray-100",
        )}>
          {(node.children ?? []).map(child => (
            <CatTreeNode
              key={child.id_categorie}
              node={child}
              depth={depth + 1}
              activeCatId={activeCatId}
              openSet={openSet}
              produits={produits}
              filters={filters}
              locale={locale}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Sort options ────────────────────────────────────────────────────────── */

const SORT_OPTIONS: { key: SortKey; labelKey: string; fallback: string }[] = [
  { key: "newest",   labelKey: "catalog.sort.newest", fallback: "Ajoutés en premier" },
  { key: "nom_asc",  labelKey: "catalog.sort.nameAsc", fallback: "Nom A → Z" },
  { key: "nom_desc", labelKey: "catalog.sort.nameDesc", fallback: "Nom Z → A" },
];

/* ── Main FilterPanel ────────────────────────────────────────────────────── */

export function FilterPanel({ tree, produits, filters, onChange, totalAll, onCategoryClick, hideCategoryTree = false }: FilterPanelProps) {
  const { locale, t } = useI18n();
  const [openSet,      setOpenSet]      = useState<Set<number>>(new Set());
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const drawerRef                        = useRef<HTMLDivElement>(null);

  /* Derived facets */
  const allTags      = useMemo(() => extractTags(produits),      [produits]);
  const allDivisions = useMemo(() => extractDivisions(produits), [produits]);

  /* Count active filters for badge */
  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.categoryId !== null) n++;
    n += filters.tags.length;
    n += filters.divisions.length;
    if (filters.sort !== "newest") n++;
    return n;
  }, [filters]);

  /* Close drawer on outside click */
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node))
        setMobileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  /* Prevent body scroll when drawer open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  /* Handlers */
  const handleCatSelect = useCallback((id: number | null) => {
    if (onCategoryClick) {
      onCategoryClick(id);
    } else {
      onChange({ ...filters, categoryId: id });
    }
    if (id !== null) setOpenSet(prev => { const n = new Set(prev); n.add(id); return n; });
  }, [filters, onChange, onCategoryClick]);

  const handleCatToggle = useCallback((id: number) => {
    setOpenSet(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  const toggleTag = useCallback((tag: string) => {
    const next = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags: next });
  }, [filters, onChange]);

  const toggleDivision = useCallback((div: string) => {
    const next = filters.divisions.includes(div)
      ? filters.divisions.filter(d => d !== div)
      : [...filters.divisions, div];
    onChange({ ...filters, divisions: next });
  }, [filters, onChange]);

  const handleReset = useCallback(() => {
    onChange(DEFAULT_FILTERS);
    setOpenSet(new Set());
  }, [onChange]);

  /* ── Sidebar inner content ──────────────────────────────────────────── */
  const SidebarContent = () => (
    <div className="space-y-0">

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-1">
        <div className="flex items-center gap-2">
          <SlidersVertical size={14} className="text-ev-600" />
          <span className="text-sm font-bold text-gray-800">{t("catalog.filters", "Filtres")}</span>
        </div>
        {activeCount > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-ev-700 transition-colors"
          >
            <X size={11} />
            {t("catalog.clearAll", "Tout effacer")}
          </button>
        )}
      </div>

      {/* Search */}
      <div className="pb-3 border-b border-gray-100 mb-1">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={e => onChange({ ...filters, search: e.target.value })}
            placeholder={t("catalog.searchProduct", "Rechercher un produit...")}
            className="w-full h-8 pl-8 pr-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ev-400 bg-white placeholder:text-gray-400"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: "" })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Tous les produits */}
      <div className="pb-2">
        <button
          onClick={() => onChange({ ...DEFAULT_FILTERS, sort: filters.sort, search: filters.search })}
          className={cn(
            "w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-sm font-semibold transition-all",
            filters.categoryId === null && filters.tags.length === 0 && filters.divisions.length === 0
              ? "bg-ev-700 text-white shadow-sm"
              : "text-gray-700 hover:bg-ev-50 hover:text-ev-700"
          )}
        >
          <Layers size={13} className={
            filters.categoryId === null && filters.tags.length === 0 && filters.divisions.length === 0
              ? "text-white/70" : "text-ev-500"
          } />
          <span className="flex-1 text-left">{t("catalog.allProducts", "Tous les produits")}</span>
        </button>
      </div>

      {/* Categories */}
      {!hideCategoryTree && tree.length > 0 && (
        <FilterSection label={t("catalog.categories", "Catégories")} icon={<LayoutGrid size={11} />}>
          <div className="space-y-0.5">
            {tree.map(node => (
              <CatTreeNode
                key={node.id_categorie}
                node={node}
                depth={0}
                activeCatId={filters.categoryId}
                openSet={openSet}
                produits={produits}
                filters={filters}
                locale={locale}
                onSelect={handleCatSelect}
                onToggle={handleCatToggle}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Divisions / Gammes */}
      {allDivisions.length > 1 && (
        <FilterSection label={t("catalog.range", "Gamme")} icon={<SlidersHorizontal size={11} />} defaultOpen={false}>
          <div className="space-y-1">
            {allDivisions.map(div => {
              const active = filters.divisions.includes(div);
              return (
                <button
                  key={div}
                  onClick={() => toggleDivision(div)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs transition-all",
                    active
                      ? "bg-ev-50 text-ev-800 font-semibold border border-ev-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800",
                  )}
                >
                  <span className={cn(
                    "w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition-all",
                    active ? "bg-ev-700 border-ev-700" : "border-gray-300 bg-white",
                  )}>
                    {active && <Check size={9} className="text-white" strokeWidth={3} />}
                  </span>
                  <span className="flex-1 text-left truncate">{div}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Tags */}
      {allTags.length > 0 && (
        <FilterSection label="Tags" icon={<Tag size={11} />} defaultOpen={false}>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map(tag => {
              const active = filters.tags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all",
                    active
                      ? "bg-ev-700 text-white border-ev-700 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-ev-300 hover:text-ev-700",
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Tri */}
        <FilterSection label={t("catalog.sortBy", "Trier par")} icon={<ArrowUpDown size={11} />} defaultOpen={false}>
        <div className="space-y-1">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => onChange({ ...filters, sort: opt.key })}
              className={cn(
                "w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs transition-all",
                filters.sort === opt.key
                  ? "bg-ev-50 text-ev-800 font-semibold"
                  : "text-gray-600 hover:bg-gray-50",
              )}
            >
              <span className={cn(
                "w-3.5 h-3.5 rounded-full border flex-shrink-0 transition-all",
                filters.sort === opt.key ? "bg-ev-700 border-ev-700" : "border-gray-300",
              )} />
              {t(opt.labelKey, opt.fallback)}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden md:block w-60 shrink-0">
        <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 max-h-[calc(100vh-7rem)] overflow-y-auto">
          <SidebarContent />
        </div>
      </aside>

      {/* ── Mobile: trigger button ──────────────────────────────────────── */}
      <div className="md:hidden mb-4 w-full">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 shadow-sm text-sm font-medium text-gray-700 hover:border-ev-300 hover:text-ev-700 transition-all shrink-0"
          >
            <SlidersVertical size={14} className="text-ev-600" />
            {t("catalog.filters", "Filtres")}
            {activeCount > 0 && (
              <span className="bg-ev-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {activeCount}
              </span>
            )}
          </button>
          {activeCount > 0 && (
            <button
              onClick={handleReset}
              className="ml-auto text-xs text-gray-400 hover:text-ev-700 flex items-center gap-1 shrink-0 transition-colors"
            >
              <X size={11} /> {t("catalog.clear", "Effacer")}
            </button>
          )}
        </div>

        {/* Active filter chips on mobile */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {filters.categoryId !== null && (() => {
            const node = findNode(tree, filters.categoryId);
            return node ? (
              <span key="cat" className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-ev-100 text-ev-800 text-xs font-medium border border-ev-200">
                {labelOf(node, locale)}
                <button onClick={() => onChange({ ...filters, categoryId: null })}><X size={10} /></button>
              </span>
            ) : null;
          })()}
          {filters.tags.map(t => (
            <span key={t} className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-ev-100 text-ev-800 text-xs font-medium border border-ev-200">
              {t}
              <button onClick={() => toggleTag(t)}><X size={10} /></button>
            </span>
          ))}
          {filters.divisions.map(d => (
            <span key={d} className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-ev-100 text-ev-800 text-xs font-medium border border-ev-200">
              {d}
              <button onClick={() => toggleDivision(d)}><X size={10} /></button>
            </span>
          ))}
        </div>
      </div>

      {/* ── Mobile: backdrop ────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          aria-hidden="true"
        />
      )}

      {/* ── Mobile: drawer ──────────────────────────────────────────────── */}
      <div
        ref={drawerRef}
        className={cn(
          "md:hidden fixed top-0 left-0 h-full w-[80vw] max-w-xs bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <SlidersVertical size={15} className="text-ev-600" />
            <span className="font-bold text-gray-800">{t("catalog.filters", "Filtres")}</span>
            {activeCount > 0 && (
              <span className="bg-ev-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {activeCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Drawer content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <SidebarContent />
        </div>

        {/* Drawer footer */}
        <div className="px-4 py-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={handleReset}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            {t("catalog.clear", "Effacer")}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex-1 py-2.5 rounded-xl bg-ev-700 text-white text-sm font-semibold hover:bg-ev-800 transition-colors"
          >
            {t("catalog.viewResults", "Voir les résultats")}
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Utility: apply filters + sort to a product list ────────────────────── */
export function applyFilters(
  produits:    ProduitCard[],
  filters:     FilterState,
  tree:        CatNode[],
  locale:      Locale = "fr",
): ProduitCard[] {
  let list = produits;

  // Category (includes children)
  if (filters.categoryId !== null) {
    const node = findNode(tree, filters.categoryId);
    const ids  = node ? collectIds(node) : new Set([filters.categoryId]);
    list = list.filter(p => ids.has((p as any).id_categorie));
  }

  // Tags
  if (filters.tags.length > 0) {
    list = list.filter(p => {
      const ptags = Array.isArray(p.tags)
        ? (p.tags as string[])
        : typeof p.tags === "string"
          ? (p.tags as string).split(",").map(t => t.trim()).filter(Boolean)
          : [];
      return filters.tags.every(t => ptags.includes(t));
    });
  }

  // Divisions
  if (filters.divisions.length > 0) {
    list = list.filter(p => filters.divisions.includes(p.division));
  }

  // Search
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    list = list.filter(p =>
      labelOf(p, locale).toLowerCase().includes(q) ||
      descriptionOf(p, locale).toLowerCase().includes(q)
    );
  }

  // Sort
  list = [...list];
  if (filters.sort === "nom_asc")  list.sort((a, b) => labelOf(a, locale).localeCompare(labelOf(b, locale), locale));
  if (filters.sort === "nom_desc") list.sort((a, b) => labelOf(b, locale).localeCompare(labelOf(a, locale), locale));
  if (filters.sort === "newest")   list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return list;
}
