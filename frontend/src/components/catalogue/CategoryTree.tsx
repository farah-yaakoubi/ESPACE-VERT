"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ChevronRight, Search, SlidersHorizontal, X,
  Grid2X2, LayoutList, ChevronLeft, ChevronsLeft, ChevronsRight, Layers,
} from "lucide-react";
import { ProduitCard }   from "@/components/cards/ProduitCard";
import type { ProduitCard as ProduitCardType } from "@/types/api";
import type { CategorieNode, MarqueTree, ProduitInTree } from "@/types/catalogue";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

interface CategoryTreeProps {
  tree: MarqueTree;
  produitBasePath?: string;
  showProduits?: boolean;
}

/* ── Adapter ─────────────────────────────────────────────────────── */
function toProduitCard(p: ProduitInTree, categorieName: string, id_marque: number): ProduitCardType {
  return {
    id_produit: p.id_produit, id_categorie: p.id_categorie, id_marque,
    nom: p.nom, slug: p.slug, description: p.description,
    fiche_technique: null, division: p.division, tags: p.tags, created_at: "",
    categorie: { nom: categorieName, slug: "" }, images: p.images,
  };
}

function collectProduits(node: CategorieNode): { produit: ProduitInTree; catNom: string }[] {
  const own = node.produits.map(p => ({ produit: p, catNom: node.nom }));
  return [...own, ...node.sous_cats.flatMap(collectProduits)];
}

function countAll(node: CategorieNode): number {
  return node.produits.length + node.sous_cats.reduce((a, c) => a + countAll(c), 0);
}

function findNodeC(nodes: CategorieNode[], id: number): CategorieNode | null {
  for (const n of nodes) {
    if (n.id_categorie === id) return n;
    const found = findNodeC(n.sous_cats, id);
    if (found) return found;
  }
  return null;
}

/* ── Pagination ──────────────────────────────────────────────────── */
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
      <button onClick={() => onPageChange(1)} disabled={page===1} className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-all text-gray-400", page===1?"opacity-30 cursor-not-allowed":"hover:bg-ev-50 hover:text-ev-700")}><ChevronsLeft size={15}/></button>
      <button onClick={() => onPageChange(page-1)} disabled={page===1} className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-all text-gray-500", page===1?"opacity-30 cursor-not-allowed":"hover:bg-ev-50 hover:text-ev-700")}><ChevronLeft size={15}/></button>
      {pages.map((p,i) => p==="..." ? (
        <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">···</span>
      ) : (
        <button key={p} onClick={() => onPageChange(p as number)} className={cn("w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all", page===p?"bg-ev-700 text-white shadow-sm font-bold":"text-gray-600 hover:bg-ev-50 hover:text-ev-700")}>{p}</button>
      ))}
      <button onClick={() => onPageChange(page+1)} disabled={page===totalPages} className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-all text-gray-500", page===totalPages?"opacity-30 cursor-not-allowed":"hover:bg-ev-50 hover:text-ev-700")}><ChevronRight size={15}/></button>
      <button onClick={() => onPageChange(totalPages)} disabled={page===totalPages} className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-all text-gray-400", page===totalPages?"opacity-30 cursor-not-allowed":"hover:bg-ev-50 hover:text-ev-700")}><ChevronsRight size={15}/></button>
    </div>
  );
}

/* ── Nœud sidebar ────────────────────────────────────────────────── */
function SidebarNode({
  node, depth, selectedId, openIds, onSelect,
}: {
  node: CategorieNode;
  depth: number;
  selectedId: number | null;
  openIds: Set<number>;
  onSelect: (id: number) => void;
}) {
  const total       = countAll(node);
  const hasChildren = node.sous_cats.length > 0;
  const isSelected  = selectedId === node.id_categorie;
  const isOpen      = openIds.has(node.id_categorie);

  const hasSelectedChild = useMemo(() => {
    if (!selectedId || !hasChildren) return false;
    function check(n: CategorieNode): boolean {
      if (n.id_categorie === selectedId) return true;
      return n.sous_cats.some(check);
    }
    return node.sous_cats.some(check);
  }, [selectedId, hasChildren, node]);

  if (total === 0 && !hasChildren) return null;

  return (
    <div>
      <button
        onClick={() => onSelect(node.id_categorie)}
        style={{ paddingLeft: 12 + depth * 14 }}
        className={cn(
          "w-full flex items-center gap-2 pr-3 py-2.5 text-left rounded-xl transition-all group text-sm",
          isSelected
            ? "bg-ev-700 text-white font-semibold shadow-sm"
            : hasSelectedChild
              ? "bg-ev-50 text-ev-800 font-semibold"
              : depth === 0
                ? "text-gray-900 font-semibold hover:bg-ev-50 hover:text-ev-800"
                : "text-gray-600 hover:bg-ev-50 hover:text-ev-700"
        )}
      >
        <span className={cn("shrink-0 rounded-full transition-all",
          depth === 0 ? "w-2 h-2" : "w-1.5 h-1.5",
          isSelected ? "bg-white" : hasSelectedChild ? "bg-ev-500" : depth === 0 ? "bg-leaf" : "bg-gray-300"
        )} />
        {node.image && <Image src={node.image} alt={node.nom} width={16} height={16} className="rounded shrink-0 object-cover" />}
        <span className="flex-1 truncate">{node.nom}</span>
        {total > 0 && (
          <span className={cn("text-[10px] rounded-full px-1.5 py-0.5 shrink-0 font-normal",
            isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400")}>
            {total}
          </span>
        )}
        {hasChildren && (
          <span className={cn("shrink-0 transition-transform duration-200",
            isOpen ? "rotate-90" : "rotate-0",
            isSelected ? "text-white/70" : "text-gray-400 group-hover:text-ev-600"
          )}>
            <ChevronRight size={13} />
          </span>
        )}
      </button>

      {/* Sous-catégories — visibles si sélectionné OU un enfant est sélectionné OU isOpen */}
      {hasChildren && (isOpen || isSelected || hasSelectedChild) && (
        <div className={cn("mt-0.5 mb-1 space-y-0.5 border-l-2 ml-5",
          isSelected || hasSelectedChild ? "border-ev-200" : "border-gray-100"
        )}>
          {node.sous_cats.map(child => (
            <SidebarNode
              key={child.id_categorie}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              openIds={openIds}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Composant principal ─────────────────────────────────────────── */
export function CategoryTree({ tree }: CategoryTreeProps) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  // Lire cat et page depuis l'URL
  const catFromUrl  = searchParams.get("cat")  ? Number(searchParams.get("cat"))  : null;
  const pageFromUrl = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

  const [search,      setSearch]      = useState("");
  const [gridCols,    setGridCols]    = useState<3 | 4>(3);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // openIds : ensemble des catégories ouvertes manuellement (en plus de auto-ouverture)
  const [openIds,     setOpenIds]     = useState<Set<number>>(() => {
    // Auto-ouvrir la catégorie sélectionnée au chargement
    const s = new Set<number>();
    if (catFromUrl) s.add(catFromUrl);
    return s;
  });

  // Naviguer = mettre à jour l'URL
  const navigate = useCallback((cat: number | null, page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) params.set("cat", String(cat)); else params.delete("cat");
    if (page > 1) params.set("page", String(page)); else params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  const handleSelect = useCallback((id: number) => {
    // Si déjà sélectionné → reset
    const newCat = catFromUrl === id ? null : id;
    // Ouvrir/fermer dans le set local
    setOpenIds(prev => {
      const next = new Set(prev);
      if (newCat) next.add(newCat);
      return next;
    });
    navigate(newCat, 1);
    setSidebarOpen(false);
  }, [catFromUrl, navigate]);

  const handlePageChange = useCallback((p: number) => {
    navigate(catFromUrl, p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [catFromUrl, navigate]);

  const handleReset = useCallback(() => {
    navigate(null, 1);
    setSearch("");
    setOpenIds(new Set());
  }, [navigate]);

  // Sync openIds quand l'URL change (ex: navigation bouton retour)
  useEffect(() => {
    if (catFromUrl) setOpenIds(prev => { const n = new Set(prev); n.add(catFromUrl); return n; });
  }, [catFromUrl]);

  const allProduits = useMemo(() => {
    const source = catFromUrl
      ? (() => { const n = findNodeC(tree.categories, catFromUrl); return n ? collectProduits(n) : []; })()
      : tree.categories.flatMap(collectProduits);
    const q = search.trim().toLowerCase();
    if (!q) return source;
    return source.filter(({ produit }) =>
      `${produit.nom} ${produit.description ?? ""}`.toLowerCase().includes(q)
    );
  }, [catFromUrl, search, tree]);

  const totalAll   = tree.categories.reduce((a, c) => a + countAll(c), 0);
  const totalPages = Math.ceil(allProduits.length / PAGE_SIZE);
  const page       = Math.min(pageFromUrl, Math.max(totalPages, 1));
  const paginated  = useMemo(
    () => allProduits.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [allProduits, page]
  );

  const selectedNode = catFromUrl ? findNodeC(tree.categories, catFromUrl) : null;

  return (
    <div className="flex gap-0 min-h-[600px] relative">

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside className={`
        fixed lg:sticky top-0 lg:top-20 z-50 lg:z-auto h-screen lg:h-[calc(100vh-5rem)]
        w-72 lg:w-64 xl:w-72 bg-white border-r border-gray-100 flex flex-col
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        shrink-0 overflow-hidden rounded-none lg:rounded-2xl lg:border
      `}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-ev-600" />
            <span className="text-sm font-bold text-gray-900">Catégories</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-gray-700 rounded"><X size={16} /></button>
        </div>

        <div className="px-3 pt-3">
          <button onClick={handleReset} className={cn(
            "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
            !catFromUrl && !search ? "bg-ev-700 text-white shadow-sm" : "text-gray-700 hover:bg-ev-50 hover:text-ev-700"
          )}>
            <span className="flex items-center gap-2">
              <Layers size={13} className={!catFromUrl ? "text-white/70" : "text-leaf"} />
              Tous les produits
            </span>
            <span className={cn("text-[10px] rounded-full px-1.5 py-0.5 font-bold",
              !catFromUrl ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400")}>
              {totalAll}
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {tree.categories.map(cat => (
            <SidebarNode
              key={cat.id_categorie}
              node={cat}
              depth={0}
              selectedId={catFromUrl}
              openIds={openIds}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </aside>

      {/* ── Zone principale ───────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-ev-400">
            <SlidersHorizontal size={14} />Filtrer
          </button>

          {catFromUrl && selectedNode && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Catégorie :</span>
              <span className="flex items-center gap-1.5 bg-ev-50 text-ev-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-ev-100">
                {selectedNode.nom}
                <button onClick={handleReset}><X size={11} /></button>
              </span>
            </div>
          )}

          <div className="relative flex-1 min-w-[180px] max-w-sm ml-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => { setSearch(e.target.value); navigate(catFromUrl, 1); }}
              placeholder="Rechercher un produit..."
              className="w-full h-9 pl-8 pr-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-ev-400 focus:ring-1 focus:ring-ev-200" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={12} /></button>}
          </div>

          <div className="hidden sm:flex items-center gap-1 border border-gray-200 rounded-xl p-1">
            <button onClick={() => setGridCols(3)} className={cn("p-1.5 rounded-lg transition-colors", gridCols===3?"bg-ev-700 text-white":"text-gray-400 hover:text-gray-700")}><Grid2X2 size={14}/></button>
            <button onClick={() => setGridCols(4)} className={cn("p-1.5 rounded-lg transition-colors", gridCols===4?"bg-ev-700 text-white":"text-gray-400 hover:text-gray-700")}><LayoutList size={14}/></button>
          </div>

          <span className="text-xs text-gray-400 whitespace-nowrap">
            {allProduits.length} produit{allProduits.length !== 1 ? "s" : ""}
            {totalPages > 1 && <> · p.{page}/{totalPages}</>}
          </span>
        </div>

        {allProduits.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-24">
            <div className="text-center">
              <div className="text-5xl mb-4 opacity-20">🌿</div>
              <p className="text-gray-400 text-sm">Aucun produit trouvé</p>
              {(catFromUrl || search) && <button onClick={handleReset} className="mt-3 text-xs text-ev-600 hover:underline">Réinitialiser</button>}
            </div>
          </div>
        ) : (
          <>
            <div className={cn("grid gap-5", gridCols===3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4")}>
              {paginated.map(({ produit, catNom }) => (
                <ProduitCard key={produit.id_produit} produit={toProduitCard(produit, catNom, tree.id_marque)} />
              ))}
            </div>
            <div className="mt-2">
              {totalPages > 1 && <p className="text-xs text-gray-400 text-center mb-1">Page {page} sur {totalPages} · {allProduits.length} produit{allProduits.length!==1?"s":""}</p>}
              <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}