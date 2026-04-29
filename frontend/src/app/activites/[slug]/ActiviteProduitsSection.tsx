"use client";
/**
 * ActiviteProduitsSection — Filtrage hiérarchique + Pagination pro + Sous-catégories dynamiques
 *
 * Fonctionnalités :
 * - Clic sur une catégorie parent → affiche ses sous-catégories comme chips
 * - Pagination professionnelle avec navigation numérotée
 * - Arbre latéral avec état actif/ouvert
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, Package, ChevronDown, ChevronRight, Layers,
  ChevronLeft, ChevronsLeft, ChevronsRight, X, Tag,
} from "lucide-react";
import { ProduitCard }   from "@/components/cards/ProduitCard";
import { GridSkeleton }  from "@/components/ui/Skeleton";
import { SectionHeader } from "@/components/sections/SectionHeader";
import type { Categorie, ProduitCard as ProduitCardType } from "@/types/api";
import { cn } from "@/lib/utils";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/* ── Constante pagination ──────────────────────────────────────────── */
const PAGE_SIZE = 12;

/* ── Arbre de catégories ────────────────────────────────────────────── */
interface CatNode extends Categorie { children: CatNode[] }

function buildTree(cats: Categorie[]): CatNode[] {
  const map = new Map<number, CatNode>();
  cats.forEach(c => map.set(c.id_categorie, { ...c, children: [] }));
  const roots: CatNode[] = [];
  map.forEach(node => {
    if (node.parent_id && map.has(node.parent_id))
      map.get(node.parent_id)!.children.push(node);
    else roots.push(node);
  });
  return roots;
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

/* ── Nœud de l'arbre latéral ────────────────────────────────────────── */
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

  // Clic sur la catégorie : sélectionner ET ouvrir/fermer les enfants
  const handleClick = () => {
    onSelect(node.id_categorie);
    if (hasKids) onToggle(node.id_categorie);
  };

  const isSubCat = depth > 0;

  return (
    <div>
      {/* Bouton principal de la catégorie */}
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
          {/* Indicateur coloré */}
          <span className={cn(
            "shrink-0 rounded-full transition-all",
            isSubCat ? "w-1.5 h-1.5" : "w-2 h-2",
            isActive    ? "bg-white"   :
            hasActiveChild ? "bg-ev-500" :
            isSubCat    ? "bg-gray-300" : "bg-leaf"
          )} />
          <span className="truncate">{node.nom}</span>
        </span>

        {/* Chevron d'ouverture — visible seulement si enfants */}
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

      {/* Sous-catégories — s'affichent juste en dessous avec animation */}
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

/* ── Pagination ─────────────────────────────────────────────────────── */
function Pagination({
  page, totalPages, onPageChange,
}: {
  page: number; totalPages: number; onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const result: (number | "...")[] = [];
    if (page <= 4) {
      result.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (page >= totalPages - 3) {
      result.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      result.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    }
    return result;
  })();

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10 select-none">
      <button
        onClick={() => onPageChange(1)}
        disabled={page === 1}
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-lg transition-all text-gray-400",
          page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-ev-50 hover:text-ev-700"
        )}
        title="Première page"
      >
        <ChevronsLeft size={15} />
      </button>

      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-lg transition-all text-gray-500",
          page === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-ev-50 hover:text-ev-700"
        )}
        title="Page précédente"
      >
        <ChevronLeft size={15} />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">
            ···
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all",
              page === p
                ? "bg-ev-700 text-white shadow-sm font-bold"
                : "text-gray-600 hover:bg-ev-50 hover:text-ev-700"
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-lg transition-all text-gray-500",
          page === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-ev-50 hover:text-ev-700"
        )}
        title="Page suivante"
      >
        <ChevronRight size={15} />
      </button>

      <button
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages}
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-lg transition-all text-gray-400",
          page === totalPages ? "opacity-30 cursor-not-allowed" : "hover:bg-ev-50 hover:text-ev-700"
        )}
        title="Dernière page"
      >
        <ChevronsRight size={15} />
      </button>
    </div>
  );
}

/* ── Props ──────────────────────────────────────────────────────────── */
interface Props { id_activite: number; categories: Categorie[] }

/* ── Composant principal ────────────────────────────────────────────── */
export function ActiviteProduitsSection({ id_activite, categories }: Props) {
  const [allProduits, setAllProduits] = useState<ProduitCardType[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [activeCatId, setActiveCatId] = useState<number | null>(null);
  const [openSet,     setOpenSet]     = useState<Set<number>>(new Set());
  const [search,      setSearch]      = useState("");
  const [page,        setPage]        = useState(1);

  /* ── Chargement produits ────────────────────────────────────────── */
  useEffect(() => {
    if (!id_activite) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    fetch(`${BASE}/produits?id_activite=${id_activite}&limit=500`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data)) {
          setAllProduits(d.data);
        } else {
          const catIds = categories.map(c => c.id_categorie);
          if (catIds.length === 0) { setAllProduits([]); return; }
          const requests = catIds.map(id =>
            fetch(`${BASE}/produits?id_categorie=${id}&limit=200`, { cache: "no-store" })
              .then(r => r.json())
              .then(d2 => (d2.success && Array.isArray(d2.data) ? d2.data : []) as ProduitCardType[])
              .catch(() => [] as ProduitCardType[])
          );
          return Promise.all(requests).then(results => {
            const seen = new Set<number>();
            const merged: ProduitCardType[] = [];
            for (const list of results) {
              for (const p of list) {
                if (!seen.has(p.id_produit)) { seen.add(p.id_produit); merged.push(p); }
              }
            }
            setAllProduits(merged);
          });
        }
      })
      .catch(() => setError("Impossible de charger les produits."))
      .finally(() => setLoading(false));
  }, [id_activite, categories]);

  const tree = useMemo(() => buildTree(categories), [categories]);

  /* ── IDs actifs (catégorie + descendants) ───────────────────────── */
  const activeCatIds = useMemo<Set<number> | null>(() => {
    if (activeCatId === null) return null;
    const node = findNode(tree, activeCatId);
    return node ? collectIds(node) : new Set([activeCatId]);
  }, [activeCatId, tree]);

  /* ── Nœud actif ─────────────────────────────────────────────────── */
  const activeNode = useMemo(() => {
    if (activeCatId === null) return null;
    return findNode(tree, activeCatId);
  }, [activeCatId, tree]);

  /* ── Nœud parent du nœud actif (pour remonter les sous-cats) ───── */
  const parentNode = useMemo(() => {
    if (!activeNode || !activeNode.parent_id) return null;
    return findNode(tree, activeNode.parent_id);
  }, [activeNode, tree]);

  /* ── Filtrage ───────────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    let list = allProduits;
    if (activeCatIds !== null)
      list = list.filter(p => activeCatIds.has((p as any).id_categorie));
    if (search.trim())
      list = list.filter(p =>
        p.nom.toLowerCase().includes(search.toLowerCase()) ||
        (p.description ?? "").toLowerCase().includes(search.toLowerCase())
      );
    return list;
  }, [allProduits, activeCatIds, search]);

  /* ── Pagination ─────────────────────────────────────────────────── */
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  /* ── Handlers ───────────────────────────────────────────────────── */
  const handleSelect = useCallback((id: number) => {
    setActiveCatId(id);
    setPage(1);
    setOpenSet(prev => { const next = new Set(prev); next.add(id); return next; });
  }, []);

  const handleToggle = useCallback((id: number) => setOpenSet(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  }), []);

  const handleReset = useCallback(() => {
    setActiveCatId(null);
    setSearch("");
    setPage(1);
  }, []);

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => { setPage(1); }, [activeCatId, search]);

  /* ── Rendu états ────────────────────────────────────────────────── */
  if (loading) return <GridSkeleton count={8} />;
  if (error)   return <p className="text-red-500 text-sm py-8 text-center">{error}</p>;
  if (allProduits.length === 0) return (
    <div className="text-center py-16 text-gray-400">
      <Package size={40} className="mx-auto mb-3 opacity-30" />
      <p className="text-sm">Aucun produit pour cette activité.</p>
    </div>
  );

  /* Sous-catégories à afficher dans les chips :
     - Si nœud actif a des enfants → ses enfants
     - Si nœud actif est une feuille et a un parent → frères (siblings)
     - Sinon → rien
  */
  const subCatsToShow: CatNode[] = (() => {
    if (!activeNode) return [];
    if (activeNode.children.length > 0) return activeNode.children;
    if (parentNode) return parentNode.children;
    return [];
  })();

  const chipParentNode = activeNode?.children.length === 0 ? parentNode : activeNode;

  return (
    <div>
      <SectionHeader
        title="Nos Produits"
        subtitle={`${allProduits.length} produit${allProduits.length > 1 ? "s" : ""} disponible${allProduits.length > 1 ? "s" : ""}`}
      />
      <div className="flex gap-8">

        {/* ── Sidebar catégories ─────────────────────────────────── */}
        {tree.length > 0 && (
          <aside className="hidden md:block w-56 shrink-0">
            <div className="sticky top-24 space-y-3">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Rechercher…"
                  className="w-full h-8 pl-8 pr-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ev-400 bg-white"
                />
              </div>

              <button
                onClick={handleReset}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                  activeCatId === null && !search
                    ? "bg-ev-700 text-white"
                    : "text-gray-500 hover:bg-sand-100"
                )}
              >
                <Layers size={13} />
                <span className="flex-1 text-left">Tous ({allProduits.length})</span>
              </button>

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

        {/* ── Zone principale ────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* ── Filtres mobiles ──────────────────────────────────── */}
          <div className="md:hidden mb-4 space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Rechercher…"
                className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 bg-white"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleReset}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  activeCatId === null
                    ? "bg-ev-700 text-white border-ev-700"
                    : "bg-white border-sand-200 text-gray-600"
                )}
              >
                Tous
              </button>
              {tree.map(c => (
                <button
                  key={c.id_categorie}
                  onClick={() => handleSelect(c.id_categorie)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    activeCatId === c.id_categorie
                      ? "bg-ev-700 text-white border-ev-700"
                      : "bg-white border-sand-200 text-gray-600 hover:border-ev-300"
                  )}
                >
                  {c.nom}
                </button>
              ))}
            </div>
          </div>

          {/* ── Fil d'Ariane + Sous-catégories ───────────────────── */}
          {activeCatId !== null && activeNode && (
            <div className="mb-5 space-y-3">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <button onClick={handleReset} className="hover:text-ev-700 transition-colors">
                  Tous
                </button>
                {parentNode && (
                  <>
                    <ChevronRight size={10} />
                    <button
                      onClick={() => handleSelect(parentNode.id_categorie)}
                      className="hover:text-ev-700 transition-colors"
                    >
                      {parentNode.nom}
                    </button>
                  </>
                )}
                <ChevronRight size={10} />
                <span className="text-gray-700 font-semibold">{activeNode.nom}</span>
                <span className="text-gray-400">
                  · {filtered.length} produit{filtered.length > 1 ? "s" : ""}
                </span>
                <button
                  onClick={handleReset}
                  className="ml-1 p-0.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
                  title="Effacer le filtre"
                >
                  <X size={11} />
                </button>
              </div>

              {/* Chips sous-catégories */}
              {subCatsToShow.length > 0 && chipParentNode && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium shrink-0">
                    <Tag size={11} />
                    Sous-catégories :
                  </span>

                  {/* Chip "Tous" dans la catégorie parente des chips */}
                  <button
                    onClick={() => handleSelect(chipParentNode.id_categorie)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all",
                      activeCatId === chipParentNode.id_categorie
                        ? "bg-ev-700 text-white border-ev-700 shadow-sm"
                        : "bg-white border-sand-200 text-gray-600 hover:border-ev-400 hover:text-ev-700"
                    )}
                  >
                    <Layers size={10} />
                    Tous
                  </button>

                  {subCatsToShow.map(sub => (
                    <button
                      key={sub.id_categorie}
                      onClick={() => handleSelect(sub.id_categorie)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                        activeCatId === sub.id_categorie
                          ? "bg-ev-600 text-white border-ev-600 shadow-sm"
                          : "bg-white border-sand-200 text-gray-600 hover:border-ev-400 hover:text-ev-700 hover:bg-ev-50"
                      )}
                    >
                      {sub.nom}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Grille produits ────────────────────────────────────── */}
          {paginated.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun produit pour cette sélection.</p>
              <button onClick={handleReset} className="mt-3 text-xs text-ev-600 hover:underline">
                Réinitialiser
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginated.map(p => <ProduitCard key={p.id_produit} produit={p} />)}
              </div>

              {/* ── Barre de pagination ─────────────────────────── */}
              <div className="mt-2">
                <p className="text-xs text-gray-400 text-center mb-1">
                  {totalPages > 1 && <>Page {page} sur {totalPages} · </>}
                  {filtered.length} produit{filtered.length > 1 ? "s" : ""}
                  {allProduits.length > filtered.length && <> sur {allProduits.length}</>}
                </p>
                <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}