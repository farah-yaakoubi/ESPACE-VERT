"use client";
/**
 * MarqueProduitsSection — Catalogue produits d'une marque
 * Utilise FilterPanel pour le filtrage avancé (catégories, tags, division, tri, search)
 */
import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Package, ChevronRight, ArrowLeft,
  ChevronLeft, ChevronsLeft, ChevronsRight, X,
  SlidersHorizontal,
} from "lucide-react";
import { ProduitCard }   from "@/components/cards/ProduitCard";
import { GridSkeleton }  from "@/components/ui/Skeleton";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { useProducts }   from "@/hooks/useProducts";
import type { MarqueCategorie } from "@/types/api";
import { cn } from "@/lib/utils";
import {
  FilterPanel, applyFilters, DEFAULT_FILTERS,
  type FilterState, type CatNode,
} from "@/components/catalogue/FilterPanel";

const PAGE_SIZE = 12;

/* ── Build CatNode tree ─────────────────────────────────────────────────── */
function buildTree(cats: MarqueCategorie[]): CatNode[] {
  // Backend now returns roots with nested sous_cats (after the bug fix)
  const hasNested = cats.some(c => (c as any).sous_cats !== undefined);

  if (hasNested) {
    return cats
      .filter(c => !c.parent_id)
      .sort((a, b) => ((a as any).ordre ?? 0) - ((b as any).ordre ?? 0) || a.nom.localeCompare(b.nom, "fr"))
      .map(c => ({
        ...c,
        ordre:    (c as any).ordre ?? 0,
        children: ((c as any).sous_cats ?? [])
          .sort((a: any, b: any) => (a.ordre ?? 0) - (b.ordre ?? 0) || a.nom.localeCompare(b.nom, "fr"))
          .map((sc: any) => ({ ...sc, children: [] })),
      }));
  }

  // Fallback: flat list → build tree
  const map = new Map<number, CatNode>();
  cats.forEach(c => map.set(c.id_categorie, { ...c, ordre: (c as any).ordre ?? 0, children: [] }));
  const roots: CatNode[] = [];
  map.forEach(node => {
    if (node.parent_id && map.has(node.parent_id)) map.get(node.parent_id)!.children.push(node);
    else roots.push(node);
  });
  const sort = (nodes: CatNode[]) => {
    nodes.sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0) || a.nom.localeCompare(b.nom, "fr"));
    nodes.forEach(n => sort(n.children));
    return nodes;
  };
  return sort(roots);
}

/* ── Pagination ─────────────────────────────────────────────────────────── */
function Pagination({ page, totalPages, onPageChange }: {
  page: number; totalPages: number; onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages: (number | "...")[] = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const r: (number | "...")[] = [];
    if (page <= 4)                   r.push(1, 2, 3, 4, 5, "...", totalPages);
    else if (page >= totalPages - 3) r.push(1, "...", totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages);
    else                             r.push(1, "...", page-1, page, page+1, "...", totalPages);
    return r;
  })();
  return (
    <div className="flex items-center justify-center gap-1.5 mt-10 select-none">
      <button onClick={() => onPageChange(1)} disabled={page===1} className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-all text-gray-400", page===1?"opacity-30 cursor-not-allowed":"hover:bg-ev-50 hover:text-ev-700")}><ChevronsLeft size={15}/></button>
      <button onClick={() => onPageChange(page-1)} disabled={page===1} className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-all text-gray-500", page===1?"opacity-30 cursor-not-allowed":"hover:bg-ev-50 hover:text-ev-700")}><ChevronLeft size={15}/></button>
      {pages.map((p, i) => p==="..."
        ? <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">···</span>
        : <button key={p} onClick={() => onPageChange(p as number)} className={cn("w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all", page===p?"bg-ev-700 text-white shadow-sm font-bold":"text-gray-600 hover:bg-ev-50 hover:text-ev-700")}>{p}</button>
      )}
      <button onClick={() => onPageChange(page+1)} disabled={page===totalPages} className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-all text-gray-500", page===totalPages?"opacity-30 cursor-not-allowed":"hover:bg-ev-50 hover:text-ev-700")}><ChevronRight size={15}/></button>
      <button onClick={() => onPageChange(totalPages)} disabled={page===totalPages} className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-all text-gray-400", page===totalPages?"opacity-30 cursor-not-allowed":"hover:bg-ev-50 hover:text-ev-700")}><ChevronsRight size={15}/></button>
    </div>
  );
}

/* ── Helper ────────────────────────────────────────────────────────────── */
function findNode(nodes: CatNode[], id: number): CatNode | null {
  for (const n of nodes) {
    if (n.id_categorie === id) return n;
    const r = findNode(n.children ?? [], id);
    if (r) return r;
  }
  return null;
}

/* ── Props ──────────────────────────────────────────────────────────────── */
interface Props { id_marque: number; categories: MarqueCategorie[]; isMatar?: boolean; }

/* ══════════════════════════════════════════════════════════════════════════ */
export function MarqueProduitsSection({ id_marque, categories }: Props) {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat");

  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    categoryId: catParam ? parseInt(catParam, 10) : null,
  });
  const [page,    setPage]    = useState(1);

  useEffect(() => {
    const id = catParam ? parseInt(catParam, 10) : null;
    setFilters(f => ({ ...f, categoryId: id }));
    setPage(1);
  }, [catParam]);

  const { produits: allProduits, loading, error } = useProducts({ id_marque, limit: 500 });

  const tree = useMemo(() => buildTree(categories), [categories]);

  const filtered = useMemo(
    () => allProduits ? applyFilters(allProduits, filters, tree) : [],
    [allProduits, filters, tree]
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = useMemo(() => filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE), [filtered, page]);

  useEffect(() => { setPage(1); }, [filters]);

  const handleFiltersChange = useCallback((f: FilterState) => { setFilters(f); setPage(1); }, []);
  const handlePageChange    = useCallback((p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  const handleCategorySelect = useCallback((id: number | null) => {
    handleFiltersChange({ ...filters, categoryId: id });
  }, [filters, handleFiltersChange]);

  const activeNode = useMemo(() => {
    if (!filters.categoryId) return null;
    return findNode(tree, filters.categoryId);
  }, [filters.categoryId, tree]);

  const hasActiveFilters = filters.categoryId !== null || filters.tags.length > 0
    || filters.divisions.length > 0 || filters.search.trim() !== "";

  return (
    <section className="section">
      <div className="container-ev">
        <SectionHeader
          eyebrow="Catalogue"
          title="Nos produits"
          subtitle={
            hasActiveFilters
              ? `${filtered.length} produit${filtered.length > 1 ? "s" : ""} correspondent à votre recherche`
              : "Explorez notre gamme complète de produits."
          }
        />

        <div className="flex gap-8">

          {/* FilterPanel — sidebar desktop + drawer mobile */}
          <FilterPanel
            tree={tree}
            produits={allProduits ?? []}
            filters={filters}
            onChange={handleFiltersChange}
            totalAll={(allProduits ?? []).length}
            onCategoryClick={handleCategorySelect}
          />

          {/* Product grid */}
          <div className="flex-1 min-w-0">

            {/* Active filters bar */}
            {hasActiveFilters && (
              <div className="mb-4 flex items-center gap-2 flex-wrap">
                {filters.categoryId !== null && activeNode && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <button onClick={() => handleCategorySelect(null)} className="hover:text-ev-700 transition-colors flex items-center gap-1">
                      <ArrowLeft size={10} /> Tous
                    </button>
                    {activeNode.parent_id && (() => {
                      const parent = findNode(tree, activeNode.parent_id!);
                      return parent ? (
                        <>
                          <ChevronRight size={10} />
                          <button onClick={() => handleCategorySelect(parent.id_categorie)} className="hover:text-ev-700 transition-colors">
                            {parent.nom}
                          </button>
                        </>
                      ) : null;
                    })()}
                    <ChevronRight size={10} />
                    <span className="text-gray-800 font-semibold">{activeNode.nom}</span>
                  </div>
                )}
                {filters.tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ev-100 text-ev-800 text-xs font-medium">
                    {t}<button onClick={() => handleFiltersChange({ ...filters, tags: filters.tags.filter(x => x !== t) })}><X size={10}/></button>
                  </span>
                ))}
                {filters.divisions.map(d => (
                  <span key={d} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ev-100 text-ev-800 text-xs font-medium">
                    {d}<button onClick={() => handleFiltersChange({ ...filters, divisions: filters.divisions.filter(x => x !== d) })}><X size={10}/></button>
                  </span>
                ))}
                <span className="text-xs text-gray-400 ml-auto">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span>
                <button onClick={() => handleFiltersChange(DEFAULT_FILTERS)} className="text-xs text-gray-400 hover:text-ev-700 flex items-center gap-1 transition-colors">
                  <X size={10}/> Effacer
                </button>
              </div>
            )}

            {loading ? (
              <GridSkeleton count={8} />
            ) : error ? (
              <p className="text-center text-red-500 py-10">{error}</p>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 text-gray-400">
                <Package size={40} className="mx-auto mb-3 opacity-25" />
                <p className="text-sm font-medium text-gray-500 mb-1">Aucun produit trouvé</p>
                <p className="text-xs text-gray-400 mb-4">Essayez de modifier ou d&apos;effacer vos filtres.</p>
                <button onClick={() => handleFiltersChange(DEFAULT_FILTERS)} className="inline-flex items-center gap-1.5 text-xs text-ev-600 hover:text-ev-800 font-medium transition-colors">
                  <SlidersHorizontal size={12}/>Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {paginated.map(p => <ProduitCard key={p.id_produit} produit={p}/>)}
                </div>
                <div className="mt-2">
                  {totalPages > 1 && (
                    <p className="text-xs text-gray-400 text-center mb-1">
                      Page {page} sur {totalPages} · {filtered.length} produit{filtered.length > 1 ? "s" : ""}
                    </p>
                  )}
                  <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange}/>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
export function MarqueProduitsSectionWrapper(props: { id_marque: number; categories: any[]; isMatar?: boolean }) {
  return (
    <Suspense fallback={null}>
      <MarqueProduitsSection {...props} />
    </Suspense>
  );
}