"use client";

import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Package, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight,
  X, SlidersHorizontal, ArrowLeft, LayoutGrid,
} from "lucide-react";
import { ProduitCard }   from "@/components/cards/ProduitCard";
import { GridSkeleton }  from "@/components/ui/Skeleton";
import { useProducts }   from "@/hooks/useProducts";
import type { Categorie } from "@/types/api";
import { cn } from "@/lib/utils";
import {
  FilterPanel, applyFilters, DEFAULT_FILTERS,
  type FilterState, type CatNode,
} from "@/components/catalogue/FilterPanel";

const PAGE_SIZE = 12;

/* ── Helpers ────────────────────────────────────────────────────────────── */
function buildTree(cats: Categorie[]): CatNode[] {
  const map = new Map<number, CatNode>();
  cats.forEach(c => map.set(c.id_categorie, { ...c, children: [], ordre: c.ordre ?? 0 }));
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

function findNode(nodes: CatNode[], id: number): CatNode | null {
  for (const n of nodes) {
    if (n.id_categorie === id) return n;
    const r = findNode(n.children, id);
    if (r) return r;
  }
  return null;
}

function collectIds(node: CatNode): Set<number> {
  const ids = new Set([node.id_categorie]);
  (node.children ?? []).forEach(c => collectIds(c).forEach(id => ids.add(id)));
  return ids;
}

/* ── CatalogueCoverGrid ─────────────────────────────────────────────────── */
function CatalogueCoverGrid({
  node, allProduits, onSelectChild, onClose,
}: {
  node: CatNode;
  allProduits: import("@/types/api").ProduitCard[];
  onSelectChild: (id: number) => void;
  onClose: () => void;
}) {
  const children = node.children ?? [];
  if (children.length === 0) return null;

  function childCount(n: CatNode) {
    const ids = collectIds(n);
    return allProduits.filter(p => ids.has((p as any).id_categorie)).length;
  }
  function childPreview(n: CatNode) {
    const ids = collectIds(n);
    return allProduits.filter(p => ids.has((p as any).id_categorie)).slice(0, 4);
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={onClose}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-ev-700 transition-colors">
            <ArrowLeft size={14} /> Tous les produits
          </button>
          <span className="text-gray-300">/</span>
          <h2 className="font-bold text-ev-900 text-base">{node.nom}</h2>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
          {children.length} catégorie{children.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {children.map(child => {
          const count = childCount(child);
          const preview = childPreview(child);
          return (
            <button
              key={child.id_categorie}
              onClick={() => onSelectChild(child.id_categorie)}
              className="group flex flex-col rounded-2xl border border-gray-200 bg-white
                hover:border-ev-400 hover:shadow-lg transition-all duration-250 overflow-hidden text-left
                focus:outline-none focus:ring-2 focus:ring-ev-400"
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-ev-50 to-ev-100" style={{ aspectRatio: "4/3" }}>
                {child.image ? (
                  <Image src={child.image} alt={child.nom} fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw" />
                ) : preview.length > 0 ? (
                  <div className="absolute inset-0 grid grid-cols-2 gap-px p-3">
                    {preview.map(p => {
                      const img = p.images?.[0];
                      return (
                        <div key={p.id_produit} className="relative bg-white rounded-lg overflow-hidden">
                          {img
                            ? <Image src={img.url} alt={p.nom} fill className="object-contain p-1" sizes="80px" />
                            : <div className="absolute inset-0 flex items-center justify-center text-lg opacity-20">🌱</div>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-15 select-none">🌿</div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 right-2">
                  <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {count > 0 ? `${count} produit${count > 1 ? "s" : ""}` : "Voir"}
                  </span>
                </div>
              </div>
              <div className="px-3 py-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2 group-hover:text-ev-700 transition-colors">
                  {child.nom}
                </p>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-ev-500 flex-shrink-0 transition-colors" />
              </div>
              {child.image && preview.length > 0 && (
                <div className="px-3 pb-3 flex items-center gap-1.5 border-t border-gray-50 pt-2">
                  {preview.slice(0, 5).map(p => {
                    const img = p.images?.[0];
                    return (
                      <div key={p.id_produit} className="relative w-7 h-7 rounded-md bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                        {img
                          ? <Image src={img.url} alt={p.nom} fill className="object-contain p-0.5" sizes="28px" />
                          : <div className="absolute inset-0 flex items-center justify-center text-xs opacity-20">🌱</div>}
                      </div>
                    );
                  })}
                  {count > 5 && <span className="text-[10px] text-ev-600 font-semibold">+{count - 5}</span>}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
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
    <div className="flex items-center justify-center gap-1.5 mt-10 select-none flex-wrap">
      <button onClick={() => onPageChange(1)} disabled={page===1} className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-all", page===1?"opacity-30 cursor-not-allowed text-gray-400":"hover:bg-ev-50 hover:text-ev-700 text-gray-400")}><ChevronsLeft size={15}/></button>
      <button onClick={() => onPageChange(page-1)} disabled={page===1} className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-all", page===1?"opacity-30 cursor-not-allowed text-gray-500":"hover:bg-ev-50 hover:text-ev-700 text-gray-500")}><ChevronLeft size={15}/></button>
      {pages.map((p, i) => p==="..."
        ? <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">···</span>
        : <button key={p} onClick={() => onPageChange(p as number)} className={cn("w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all", page===p?"bg-ev-700 text-white shadow-sm font-bold":"text-gray-600 hover:bg-ev-50 hover:text-ev-700")}>{p}</button>
      )}
      <button onClick={() => onPageChange(page+1)} disabled={page===totalPages} className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-all", page===totalPages?"opacity-30 cursor-not-allowed text-gray-500":"hover:bg-ev-50 hover:text-ev-700 text-gray-500")}><ChevronRight size={15}/></button>
      <button onClick={() => onPageChange(totalPages)} disabled={page===totalPages} className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-all", page===totalPages?"opacity-30 cursor-not-allowed text-gray-400":"hover:bg-ev-50 hover:text-ev-700 text-gray-400")}><ChevronsRight size={15}/></button>
    </div>
  );
}

/* ── Props ──────────────────────────────────────────────────────────────── */
interface Props { id_activite: number; categories: Categorie[]; }

/* ══════════════════════════════════════════════════════════════════════════ */
function ActiviteProduitsSection({ id_activite, categories }: Props) {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat");

  const tree = useMemo(() => buildTree(categories), [categories]);

  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    categoryId: catParam ? parseInt(catParam, 10) : null,
  });
  const [page, setPage] = useState(1);

  const [catalogueCatId, setCatalogueCatId] = useState<number | null>(() => {
    if (!catParam) return null;
    const id   = parseInt(catParam, 10);
    const node = findNode(buildTree(categories), id);
    if (node && (node.children ?? []).length > 0) return id;
    return null;
  });

  useEffect(() => {
    const id = catParam ? parseInt(catParam, 10) : null;
    setFilters(f => ({ ...f, categoryId: id }));
    setPage(1);
    if (!id) { setCatalogueCatId(null); return; }
    const node = findNode(tree, id);
    if (node && (node.children ?? []).length > 0) setCatalogueCatId(id);
    else setCatalogueCatId(null);
  }, [catParam, tree]);

  const { produits: allProduits, loading, error } = useProducts({ id_activite, limit: 500 });

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
    if (!id) { setCatalogueCatId(null); handleFiltersChange({ ...filters, categoryId: null }); return; }
    const node = findNode(tree, id);
    if (node && (node.children ?? []).length > 0) {
      setCatalogueCatId(id); handleFiltersChange({ ...filters, categoryId: id });
    } else {
      setCatalogueCatId(null); handleFiltersChange({ ...filters, categoryId: id });
    }
  }, [filters, tree, handleFiltersChange]);

  const catalogueNode = useMemo(() => catalogueCatId ? findNode(tree, catalogueCatId) : null, [catalogueCatId, tree]);
  const activeNode    = useMemo(() => filters.categoryId ? findNode(tree, filters.categoryId) : null, [filters.categoryId, tree]);

  const showGrid        = !catalogueCatId;
  const hasActiveFilters = filters.categoryId !== null || filters.tags.length > 0
    || filters.divisions.length > 0 || filters.search.trim() !== "";

  const reset = useCallback(() => { setCatalogueCatId(null); handleFiltersChange(DEFAULT_FILTERS); }, [handleFiltersChange]);

  return (
    /* Même style que les pages marques : bg-sand-50, produits directs sans grand titre */
    <section className="bg-sand-50 border-b border-sand-200">
      <div className="container-ev py-8">
        <div className="flex gap-6 lg:gap-8">

          {/* FilterPanel */}
          <FilterPanel
            tree={tree}
            produits={allProduits ?? []}
            filters={filters}
            onChange={handleFiltersChange}
            totalAll={(allProduits ?? []).length}
            onCategoryClick={handleCategorySelect}
          />

          {/* Zone principale */}
          <div className="flex-1 min-w-0">

            {/* Breadcrumb filtres actifs */}
            {hasActiveFilters && (
              <div className="mb-4 flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <button onClick={reset}
                    className="hover:text-ev-700 transition-colors flex items-center gap-1 font-medium">
                    <LayoutGrid size={10} /> Tous
                  </button>
                  {activeNode && (
                    <>
                      {activeNode.parent_id && (() => {
                        const parent = findNode(tree, activeNode.parent_id!);
                        return parent ? (
                          <><ChevronRight size={10} />
                            <button onClick={() => handleCategorySelect(parent.id_categorie)}
                              className="hover:text-ev-700 transition-colors">{parent.nom}</button></>
                        ) : null;
                      })()}
                      <ChevronRight size={10} />
                      <span className="text-gray-800 font-semibold">{activeNode.nom}</span>
                    </>
                  )}
                </div>
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
                <span className="text-xs text-gray-400 ml-auto">
                  {showGrid ? `${filtered.length} résultat${filtered.length > 1 ? "s" : ""}` : ""}
                </span>
                <button onClick={reset} className="text-xs text-gray-400 hover:text-ev-700 flex items-center gap-1 transition-colors">
                  <X size={10}/> Effacer
                </button>
              </div>
            )}

            {/* Mode catalogue visuel */}
            {catalogueNode && (
              <CatalogueCoverGrid
                node={catalogueNode}
                allProduits={allProduits ?? []}
                onSelectChild={(id) => handleCategorySelect(id)}
                onClose={reset}
              />
            )}

            {/* Mode grille produits */}
            {showGrid && (
              <>
                {loading ? (
                  <GridSkeleton count={8}/>
                ) : error ? (
                  <p className="text-center text-red-500 py-10">{error}</p>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-24 text-gray-400">
                    <Package size={40} className="mx-auto mb-3 opacity-25"/>
                    <p className="text-sm font-medium text-gray-500 mb-1">Aucun produit trouvé</p>
                    <p className="text-xs text-gray-400 mb-4">Essayez de modifier ou d&apos;effacer vos filtres.</p>
                    <button onClick={reset}
                      className="inline-flex items-center gap-1.5 text-xs text-ev-600 hover:text-ev-800 font-medium transition-colors">
                      <SlidersHorizontal size={12}/> Réinitialiser les filtres
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
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
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ActiviteProduitsSectionWrapper(props: { id_activite: number; categories: any[] }) {
  return (
    <Suspense fallback={null}>
      <ActiviteProduitsSection {...props} />
    </Suspense>
  );
}
