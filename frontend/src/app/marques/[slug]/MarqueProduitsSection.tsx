"use client";
/**
 * MarqueProduitsSection — Sidebar click = select + open sous-cats + pagination
 */
import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Search, Package, ChevronRight, Layers,
  ChevronLeft, ChevronsLeft, ChevronsRight, X,
} from "lucide-react";
import { ProduitCard }   from "@/components/cards/ProduitCard";
import { GridSkeleton }  from "@/components/ui/Skeleton";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { useProducts }   from "@/hooks/useProducts";
import type { MarqueCategorie } from "@/types/api";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

/* ── Types ─────────────────────────────────────────────────────── */
interface CatNode extends MarqueCategorie { children: CatNode[] }

/* ── Build tree ────────────────────────────────────────────────── */
function buildTree(cats: MarqueCategorie[]): CatNode[] {
  const map = new Map<number, CatNode>();
  cats.forEach(c => map.set(c.id_categorie, { ...c, children: [] }));
  const roots: CatNode[] = [];
  map.forEach(node => {
    if (node.parent_id && map.has(node.parent_id))
      map.get(node.parent_id)!.children.push(node);
    else roots.push(node);
  });
  const sort = (nodes: CatNode[]): CatNode[] => {
    nodes.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
    nodes.forEach(n => sort(n.children));
    return nodes;
  };
  return sort(roots);
}

function collectIds(node: CatNode): Set<number> {
  const ids = new Set<number>([node.id_categorie]);
  node.children.forEach(c => collectIds(c).forEach(id => ids.add(id)));
  return ids;
}

function findNode(nodes: CatNode[], id: number): CatNode | null {
  for (const n of nodes) {
    if (n.id_categorie === id) return n;
    const found = findNode(n.children, id);
    if (found) return found;
  }
  return null;
}

/* ── Pagination ─────────────────────────────────────────────────── */
function Pagination({ page, totalPages, onPageChange }: {
  page: number; totalPages: number; onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const r: (number | "...")[] = [];
    if (page <= 4)               r.push(1, 2, 3, 4, 5, "...", totalPages);
    else if (page >= totalPages - 3) r.push(1, "...", totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages);
    else                         r.push(1, "...", page-1, page, page+1, "...", totalPages);
    return r;
  })();

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10 select-none">
      <button onClick={() => onPageChange(1)} disabled={page === 1}
        className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-all text-gray-400",
          page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-ev-50 hover:text-ev-700")}>
        <ChevronsLeft size={15} />
      </button>
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
        className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-all text-gray-500",
          page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-ev-50 hover:text-ev-700")}>
        <ChevronLeft size={15} />
      </button>
      {pages.map((p, i) => p === "..." ? (
        <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">···</span>
      ) : (
        <button key={p} onClick={() => onPageChange(p as number)}
          className={cn("w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all",
            page === p ? "bg-ev-700 text-white shadow-sm font-bold" : "text-gray-600 hover:bg-ev-50 hover:text-ev-700")}>
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
        className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-all text-gray-500",
          page === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-ev-50 hover:text-ev-700")}>
        <ChevronRight size={15} />
      </button>
      <button onClick={() => onPageChange(totalPages)} disabled={page === totalPages}
        className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-all text-gray-400",
          page === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-ev-50 hover:text-ev-700")}>
        <ChevronsRight size={15} />
      </button>
    </div>
  );
}

/* ── Composant nœud sidebar ──────────────────────────────────────── */
function CatTreeNode({
  node, depth, activeCatId, openSet, onSelect, onToggle,
}: {
  node: CatNode; depth: number; activeCatId: number | null;
  openSet: Set<number>; onSelect: (id: number) => void; onToggle: (id: number) => void;
}) {
  const hasKids  = node.children.length > 0;
  const isOpen   = openSet.has(node.id_categorie);
  const isActive = activeCatId === node.id_categorie;

  const hasActiveChild = hasKids && activeCatId !== null && (() => {
    const ids = collectIds(node);
    ids.delete(node.id_categorie);
    return ids.has(activeCatId);
  })();

  // Clic = sélectionner ET ouvrir/fermer enfants
  const handleClick = () => {
    onSelect(node.id_categorie);
    if (hasKids) onToggle(node.id_categorie);
  };

  const isSubCat = depth > 0;

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          "w-full flex items-center justify-between gap-2 rounded-xl text-sm transition-all group",
          isSubCat ? "px-3 py-2 ml-2 text-xs" : "px-3 py-2.5",
          isActive
            ? "bg-ev-700 text-white font-semibold shadow-sm"
            : hasActiveChild
              ? "bg-ev-50 text-ev-800 font-semibold"
              : isSubCat
                ? "text-gray-500 hover:bg-sand-50 hover:text-ev-700"
                : "text-gray-700 font-medium hover:bg-ev-50 hover:text-ev-800"
        )}
        title={node.nom}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className={cn(
            "shrink-0 rounded-full transition-all",
            isSubCat ? "w-1.5 h-1.5" : "w-2 h-2",
            isActive       ? "bg-white"   :
            hasActiveChild ? "bg-ev-500"  :
            isSubCat       ? "bg-gray-300": "bg-leaf"
          )} />
          <span className="truncate">{node.nom}</span>
        </span>

        {hasKids && (
          <span className={cn(
            "shrink-0 transition-transform duration-200",
            isOpen ? "rotate-90" : "rotate-0",
            isActive ? "text-white/70" : "text-gray-400 group-hover:text-ev-600"
          )}>
            <ChevronRight size={13} />
          </span>
        )}
      </button>

      {/* Sous-catégories inline */}
      {hasKids && isOpen && (
        <div className={cn(
          "mt-0.5 mb-1 space-y-0.5 border-l-2 ml-4",
          isActive || hasActiveChild ? "border-ev-200" : "border-gray-100"
        )}>
          {node.children.map(child => (
            <CatTreeNode
              key={child.id_categorie}
              node={child}
              depth={depth + 1}
              activeCatId={activeCatId}
              openSet={openSet}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Props ─────────────────────────────────────────────────────── */
interface Props {
  id_marque:  number;
  categories: MarqueCategorie[];
  isMatar?:   boolean;
}

/* ════════════════════════════════════════════════════════════════ */
export function MarqueProduitsSection({ id_marque, categories }: Props) {
  const [activeCatId, setActiveCatId] = useState<number | null>(null);
  const [openSet,     setOpenSet]     = useState<Set<number>>(new Set());
  const [searchLocal, setSearchLocal] = useState("");
  const [page,        setPage]        = useState(1);

  const { produits: allProduits, loading, error, setSearch: setApiSearch } =
    useProducts({ id_marque, limit: 500 });

  const tree = useMemo(() => buildTree(categories), [categories]);

  const activeCatIds = useMemo<Set<number> | null>(() => {
    if (activeCatId === null) return null;
    const node = findNode(tree, activeCatId);
    return node ? collectIds(node) : new Set([activeCatId]);
  }, [activeCatId, tree]);

  const filtered = useMemo(() => {
    let list = allProduits ?? [];
    if (activeCatIds !== null)
      list = list.filter(p => activeCatIds.has((p as any).id_categorie));
    if (searchLocal.trim())
      list = list.filter(p =>
        p.nom.toLowerCase().includes(searchLocal.toLowerCase()) ||
        (p.description ?? "").toLowerCase().includes(searchLocal.toLowerCase())
      );
    return list;
  }, [allProduits, activeCatIds, searchLocal]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  useEffect(() => { setPage(1); }, [activeCatId, searchLocal]);

  const handleSelect = useCallback((id: number) => {
    setActiveCatId(id);
    setPage(1);
    setOpenSet(prev => { const next = new Set(prev); next.add(id); return next; });
  }, []);

  const handleToggle = useCallback((id: number) => {
    setOpenSet(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleSearch = useCallback((v: string) => {
    setSearchLocal(v);
    setApiSearch(v);
    setPage(1);
  }, [setApiSearch]);

  const handleReset = useCallback(() => {
    setActiveCatId(null);
    setOpenSet(new Set());
    handleSearch("");
  }, [handleSearch]);

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const activeNode = useMemo(() =>
    activeCatId ? findNode(tree, activeCatId) : null,
    [activeCatId, tree]
  );

  return (
    <section className="section">
      <div className="container-ev">
        <SectionHeader
          eyebrow="Catalogue"
          title="Nos produits"
          subtitle={
            activeCatId !== null
              ? `${filtered.length} produit${filtered.length > 1 ? "s" : ""} dans cette catégorie`
              : "Sélectionnez une catégorie ou recherchez un produit."
          }
        />

        <div className="flex gap-8">

          {/* ── Sidebar desktop ───────────────────────────────────── */}
          {tree.length > 0 && (
            <aside className="hidden md:block w-56 shrink-0">
              <div className="sticky top-24 space-y-3">
                {/* Recherche */}
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchLocal}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder="Rechercher…"
                    className="w-full h-8 pl-8 pr-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ev-400 bg-white"
                  />
                </div>

                {/* Tous */}
                <button
                  onClick={handleReset}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                    activeCatId === null && !searchLocal
                      ? "bg-ev-700 text-white shadow-sm"
                      : "text-gray-700 hover:bg-ev-50 hover:text-ev-700"
                  )}
                >
                  <Layers size={13} className={activeCatId === null ? "text-white/70" : "text-leaf"} />
                  <span className="flex-1 text-left">Tous les produits</span>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    activeCatId === null ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500")}>
                    {(allProduits ?? []).length}
                  </span>
                </button>

                {/* Arbre */}
                <div className="space-y-0.5">
                  {tree.map(node => (
                    <CatTreeNode
                      key={node.id_categorie}
                      node={node}
                      depth={0}
                      activeCatId={activeCatId}
                      openSet={openSet}
                      onSelect={handleSelect}
                      onToggle={handleToggle}
                    />
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* ── Grille + filtres mobile ───────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Filtres mobiles */}
            <div className="md:hidden mb-5 space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={searchLocal} onChange={e => handleSearch(e.target.value)}
                  placeholder="Rechercher un produit…"
                  className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 bg-white" />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={handleReset}
                  className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    activeCatId === null ? "bg-ev-700 text-white border-ev-700" : "bg-white border-sand-200 text-gray-600")}>
                  Tous
                </button>
                {tree.map(c => (
                  <button key={c.id_categorie} onClick={() => handleSelect(c.id_categorie)}
                    className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      activeCatId === c.id_categorie ? "bg-ev-700 text-white border-ev-700" : "bg-white border-sand-200 text-gray-600 hover:border-ev-300")}>
                    {c.nom}
                  </button>
                ))}
              </div>
            </div>

            {/* Breadcrumb */}
            {activeCatId !== null && activeNode && (
              <div className="mb-4 flex items-center gap-1.5 text-xs text-gray-400">
                <button onClick={handleReset} className="hover:text-ev-700 transition-colors">Tous</button>
                <ChevronRight size={10} />
                <span className="text-gray-700 font-medium">{activeNode.nom}</span>
                {filtered.length > 0 && (
                  <span className="ml-1 text-gray-400">· {filtered.length} produit{filtered.length > 1 ? "s" : ""}</span>
                )}
                <button onClick={handleReset} className="ml-1 p-0.5 text-gray-400 hover:text-gray-600 rounded">
                  <X size={11} />
                </button>
              </div>
            )}

            {loading ? (
              <GridSkeleton count={8} />
            ) : error ? (
              <p className="text-center text-red-500 py-10">{error}</p>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Package size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucun produit trouvé.</p>
                {(activeCatId !== null || searchLocal) && (
                  <button onClick={handleReset} className="mt-3 text-xs text-ev-600 hover:underline">
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {paginated.map(p => <ProduitCard key={p.id_produit} produit={p} />)}
                </div>

                <div className="mt-2">
                  {totalPages > 1 && (
                    <p className="text-xs text-gray-400 text-center mb-1">
                      Page {page} sur {totalPages} · {filtered.length} produit{filtered.length > 1 ? "s" : ""}
                    </p>
                  )}
                  <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}