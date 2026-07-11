"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ChevronRight, Search, SlidersHorizontal, X,
  ChevronLeft, ChevronsLeft, ChevronsRight, Layers, Package,
} from "lucide-react";
import { ProduitCard }   from "@/components/cards/ProduitCard";
import type { ProduitCard as ProduitCardType } from "@/types/api";
import type { CategorieNode, MarqueTree, ProduitInTree } from "@/types/catalogue";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import { translatedField } from "@/i18n/translated-field";
import type { Locale } from "@/i18n/config";

const PAGE_SIZE = 12;

/* ── Helpers ──────────────────────────────────────────────────────── */
function toProduitCard(
  p: ProduitInTree,
  categorieName: string,
  marque: { id_marque: number; nom: string; slug: string; logo?: string | null },
): ProduitCardType {
  return {
    id_produit: p.id_produit, id_categorie: p.id_categorie, id_marque: p.id_marque ?? marque.id_marque,
    id_activite: p.id_activite,
    nom: p.nom, slug: p.slug, description: p.description, translations: p.translations,
    fiche_technique: null, division: p.division, tags: p.tags, created_at: "",
    categorie: { nom: categorieName, slug: "" },
    marque: p.marque ?? marque,
    activite: p.activite,
    images: p.images,
  };
}

function categoryLabel(cat: { nom: string; translations?: any }, locale: Locale) {
  return translatedField(cat as any, "nom", locale) || cat.nom;
}

function productLabel(product: { nom: string; translations?: any }, locale: Locale) {
  return translatedField(product as any, "nom", locale) || product.nom;
}

function productDescription(product: { description?: string | null; translations?: any }, locale: Locale) {
  return translatedField(product as any, "description", locale) || product.description || "";
}

function productWord(count: number, t: (key: string, fallback?: string) => string) {
  return count > 1 ? t("catalog.products", "produits") : t("catalog.product", "produit");
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
      <button onClick={() => onPageChange(1)} disabled={page===1} className={cn("w-9 h-9 flex items-center justify-center rounded-xl transition-all", page===1?"opacity-25 cursor-not-allowed":"hover:bg-ev-50 hover:text-ev-700 text-gray-400")}><ChevronsLeft size={15}/></button>
      <button onClick={() => onPageChange(page-1)} disabled={page===1} className={cn("w-9 h-9 flex items-center justify-center rounded-xl transition-all", page===1?"opacity-25 cursor-not-allowed":"hover:bg-ev-50 hover:text-ev-700 text-gray-500")}><ChevronLeft size={15}/></button>
      {pages.map((p,i) => p==="..." ? (
        <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">···</span>
      ) : (
        <button key={p} onClick={() => onPageChange(p as number)} className={cn("w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all", page===p?"bg-ev-700 text-white shadow-md":"text-gray-600 hover:bg-ev-50 hover:text-ev-700")}>{p}</button>
      ))}
      <button onClick={() => onPageChange(page+1)} disabled={page===totalPages} className={cn("w-9 h-9 flex items-center justify-center rounded-xl transition-all", page===totalPages?"opacity-25 cursor-not-allowed":"hover:bg-ev-50 hover:text-ev-700 text-gray-500")}><ChevronRight size={15}/></button>
      <button onClick={() => onPageChange(totalPages)} disabled={page===totalPages} className={cn("w-9 h-9 flex items-center justify-center rounded-xl transition-all", page===totalPages?"opacity-25 cursor-not-allowed":"hover:bg-ev-50 hover:text-ev-700 text-gray-400")}><ChevronsRight size={15}/></button>
    </div>
  );
}

/* ── Nœud sidebar redesigné ──────────────────────────────────────── */
function SidebarNode({
  node, depth, selectedId, openIds, onSelect, onToggle,
}: {
  node: CategorieNode;
  depth: number;
  selectedId: number | null;
  openIds: Set<number>;
  onSelect: (id: number) => void;
  onToggle: (id: number) => void;
}) {
  const { locale } = useI18n();
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

  const isRoot = depth === 0;

  return (
    <div className="select-none">
      <div
        className={cn(
          "group flex items-center gap-0 rounded-xl transition-all duration-150",
          isSelected
            ? "bg-ev-700 shadow-sm"
            : hasSelectedChild
              ? "bg-ev-50"
              : "hover:bg-stone-50",
        )}
        style={{ paddingLeft: 10 + depth * 14 }}
      >
        {/* Bouton label — sélectionne */}
        <button
          onClick={() => onSelect(node.id_categorie)}
          className="flex items-center gap-2.5 flex-1 min-w-0 py-2.5 pr-1 text-left"
        >
          {/* Indicateur couleur */}
          <span className={cn(
            "shrink-0 rounded-full transition-all",
            isRoot ? "w-2 h-2" : "w-1.5 h-1.5",
            isSelected       ? "bg-white"    :
            hasSelectedChild ? "bg-ev-400"   :
            isRoot           ? "bg-ev-500"   : "bg-gray-300"
          )} />

          {/* Image catégorie si présente */}
          {node.image && (
            <Image src={node.image} alt={categoryLabel(node, locale)} width={18} height={18}
              className="rounded-md shrink-0 object-cover opacity-80" />
          )}

          {/* Nom */}
          <span className={cn(
            "truncate leading-snug",
            isRoot ? "text-[14px] font-semibold" : "text-[13px] font-medium",
            isSelected       ? "text-white"      :
            hasSelectedChild ? "text-ev-800"     :
            isRoot           ? "text-gray-800"   : "text-gray-600",
            !isSelected && "group-hover:text-ev-800",
          )}>
            {categoryLabel(node, locale)}
          </span>

          {/* Compteur */}
          {total > 0 && (
            <span className={cn(
              "ml-auto shrink-0 text-[11px] font-semibold px-1.5 py-0.5 rounded-full",
              isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-ev-100 group-hover:text-ev-600"
            )}>
              {total}
            </span>
          )}
        </button>

        {/* Bouton flèche — ouvre/ferme UNIQUEMENT */}
        {hasChildren && (
          <button
            onClick={e => { e.stopPropagation(); onToggle(node.id_categorie); }}
            className={cn(
              "shrink-0 w-7 h-7 flex items-center justify-center rounded-lg mr-1 transition-all",
              isSelected
                ? "text-white/70 hover:bg-white/20"
                : "text-gray-400 hover:bg-ev-100 hover:text-ev-600"
            )}
            title={isOpen ? "Réduire" : "Développer"}
          >
            <ChevronRight size={14} className={cn("transition-transform duration-200", isOpen ? "rotate-90" : "rotate-0")} />
          </button>
        )}
      </div>

      {/* Sous-catégories — transition CSS fluide */}
      {hasChildren && (
        <div className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          (isOpen || isSelected || hasSelectedChild) ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        )}>
          <div className={cn(
            "ml-5 border-l-2 mt-0.5 mb-1 space-y-0.5",
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
                onToggle={onToggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Grille visuelle unifiée (racine ou sous-catégories) ─────────── */
function CatVisualGrid({
  nodes,
  allProduitsFlat,
  onSelect,
  parentNode,
  onBack,
}: {
  nodes: CategorieNode[];
  allProduitsFlat: { produit: ProduitInTree; catNom: string }[];
  onSelect: (id: number) => void;
  parentNode?: CategorieNode | null;
  onBack?: () => void;
}) {
  const { locale, t } = useI18n();
  function nodeCount(n: CategorieNode) {
    const ids = new Set<number>();
    function collect(node: CategorieNode) { ids.add(node.id_categorie); node.sous_cats.forEach(collect); }
    collect(n);
    return allProduitsFlat.filter(({ produit }) => ids.has(produit.id_categorie)).length;
  }

  function nodeFirstImage(n: CategorieNode): string | null {
    const ids = new Set<number>();
    function collect(node: CategorieNode) { ids.add(node.id_categorie); node.sous_cats.forEach(collect); }
    collect(n);
    const first = allProduitsFlat.find(({ produit }) => ids.has(produit.id_categorie) && produit.images?.[0]);
    return first?.produit.images?.[0]?.url ?? null;
  }

  return (
    <div className="mb-8">
      {/* Breadcrumb si on est dans une sous-catégorie */}
      {parentNode && onBack && (
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-ev-700 transition-colors"
            >
              <ChevronLeft size={14} /> {t("catalog.categories", "Catégories")}
            </button>
            <span className="text-gray-300">/</span>
            <h2 className="font-bold text-ev-900 text-base">{categoryLabel(parentNode, locale)}</h2>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            {nodes.length} {t("catalog.categories", "Catégories").toLowerCase()}
          </span>
        </div>
      )}

      {(() => {
        const visibleNodes = nodes.filter(node => !!node.image);
        const n = visibleNodes.length;
        const gridClass =
          n === 1 ? "flex justify-center" :
          n === 2 ? "grid grid-cols-2 gap-5" :
          n === 3 ? "grid grid-cols-3 gap-5" :
          n === 4 ? "grid grid-cols-2 sm:grid-cols-4 gap-5" :
          "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5";
        return (
        <div className={gridClass}>
        {visibleNodes.map(node => {
          const count  = nodeCount(node);
          const imgSrc = node.image;

          return (
            <button
              key={node.id_categorie}
              onClick={() => onSelect(node.id_categorie)}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ev-400 focus:ring-offset-2 text-left"
              aria-label={`${t("catalog.viewProducts", "Voir produits")} ${categoryLabel(node, locale)}`}
            >
              {/* Zone image */}
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/3", background: "linear-gradient(145deg,#f0faf2,#e6f4ea)" }}>
                {/* Cercle déco */}
                <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full opacity-30 transition-all duration-500 group-hover:opacity-60 group-hover:scale-110"
                  style={{ background: "radial-gradient(circle,#7dc040,transparent 70%)" }} />

                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={categoryLabel(node, locale)}
                    fill
                    className="object-contain p-4 drop-shadow-lg transition-transform duration-500 group-hover:scale-105 relative z-10"
                    sizes="(max-width:640px) 50vw, (max-width:1280px) 35vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-15 z-10">🌿</div>
                )}

                {/* Badge */}
                <span className="absolute top-3 left-3 z-20 rounded-full bg-ev-700/90 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-bold text-white shadow">
                  {count} {productWord(count, t)}
                </span>
              </div>

              {/* Bas de carte */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-stone-50">
                <p className="text-[15px] font-bold text-gray-900 group-hover:text-ev-700 transition-colors">
                  {categoryLabel(node, locale)}
                </p>
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-ev-50 group-hover:bg-ev-700 transition-colors shrink-0">
                  <ChevronRight size={13} className="text-ev-700 group-hover:text-white transition-colors" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
        );
      })()}
    </div>
  );
}

/* ── Vue grille sous-catégories (legacy stub, replaced by CatVisualGrid) ── */
function SousCatGrid({
  node,
  onSelect,
  marque,
}: {
  node: CategorieNode;
  onSelect: (id: number) => void;
  marque: MarqueTree;
}) {
  const { locale, t } = useI18n();
  const avecImage   = node.sous_cats.filter(sc => !!sc.image && sc.image.trim() !== "");
  const sansImage   = node.sous_cats.filter(sc => !sc.image || sc.image.trim() === "");

  return (
    <div>
      {/* Sous-catégories AVEC image → cartes cliquables */}
      {avecImage.length > 0 && (
        <div className={[
          "mb-10",
          avecImage.length === 1 ? "flex justify-center" :
          avecImage.length === 2 ? "grid grid-cols-2 max-w-2xl mx-auto gap-6" :
          avecImage.length === 3 ? "grid grid-cols-3 max-w-3xl mx-auto gap-6" :
          "grid grid-cols-1 sm:grid-cols-2 gap-6",
        ].join(" ")}>
          {avecImage.map(sc => (
            <button
              key={sc.id_categorie}
              onClick={() => onSelect(sc.id_categorie)}
              style={{
                background: "white",
                borderRadius: "1rem",
                border: "1px solid #f0f0f0",
                boxShadow: "0 1px 4px rgba(0,0,0,.06)",
                transform: "translateY(0)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease",
                overflow: "hidden",
                textAlign: "left",
                width: "100%",
                display: "block",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(-10px)";
                el.style.boxShadow = "0 24px 48px rgba(61,165,53,0.20), 0 8px 20px rgba(61,165,53,0.12)";
                el.style.background = "linear-gradient(160deg, #e8f8e8 0%, #ffffff 60%)";
                el.style.borderColor = "#7dc040";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "0 1px 4px rgba(0,0,0,.06)";
                el.style.background = "white";
                el.style.borderColor = "#f0f0f0";
              }}
            >
              <div className="relative h-56 sm:h-64 bg-gradient-to-br from-ev-50 to-ev-100 group-hover:from-[#e8f8e8] group-hover:to-[#f0faf0] overflow-hidden transition-all duration-300">
                <Image
                  src={sc.image!}
                  alt={categoryLabel(sc, locale)}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width:640px)100vw,(max-width:1024px)50vw,50vw"
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                <p className="absolute bottom-4 left-4 right-4 text-white font-bold text-base leading-tight drop-shadow">
                  {categoryLabel(sc, locale)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Sous-catégories SANS image → produits affichés directement */}
      {sansImage.map(sc => {
        const produits = collectProduits(sc);
        if (produits.length === 0) return null;
        return (
          <div key={sc.id_categorie} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Package size={15} className="text-ev-600 shrink-0" />
              <h3 className="text-base font-bold text-gray-800">{categoryLabel(sc, locale)}</h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {produits.length} {productWord(produits.length, t)}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {produits.map(({ produit }) => (
                <ProduitCard
                  key={produit.id_produit}
                  produit={toProduitCard(produit, sc.nom, marque)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}


interface CategoryTreeProps {
  tree: MarqueTree;
  produitBasePath?: string;
  showProduits?: boolean;
}

export function CategoryTree({ tree }: CategoryTreeProps) {
  const { locale, t } = useI18n();
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const catFromUrl  = searchParams.get("cat")  ? Number(searchParams.get("cat"))  : null;
  const pageFromUrl = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

  const [search,      setSearch]      = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openIds,     setOpenIds]     = useState<Set<number>>(() => {
    const s = new Set<number>();
    if (catFromUrl) s.add(catFromUrl);
    return s;
  });

  const navigate = useCallback((cat: number | null, page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) params.set("cat", String(cat)); else params.delete("cat");
    if (page > 1) params.set("page", String(page)); else params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  const handleSelect = useCallback((id: number) => {
    const newCat = catFromUrl === id ? null : id;
    setOpenIds(prev => {
      const next = new Set(prev);
      if (newCat) next.add(newCat);
      return next;
    });
    navigate(newCat, 1);
    setSidebarOpen(false);
  }, [catFromUrl, navigate]);

  const handleToggle = useCallback((id: number) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handlePageChange = useCallback((p: number) => {
    navigate(catFromUrl, p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [catFromUrl, navigate]);

  const handleReset = useCallback(() => {
    navigate(null, 1);
    setSearch("");
    setOpenIds(new Set());
  }, [navigate]);

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
      `${productLabel(produit, locale)} ${productDescription(produit, locale)}`.toLowerCase().includes(q)
    );
  }, [catFromUrl, search, tree, locale]);

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

      {/* ── Sidebar redesignée ──────────────────────────────────── */}
      <aside className={`
        fixed lg:sticky top-0 lg:top-20 z-50 lg:z-auto h-screen lg:h-[calc(100vh-5rem)]
        w-72 lg:w-64 xl:w-72 bg-white border-r border-stone-100 flex flex-col
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        shrink-0 overflow-hidden rounded-none lg:rounded-2xl lg:border lg:shadow-sm
      `}>

        {/* En-tête sidebar */}
        <div className="px-4 pt-5 pb-4 border-b border-stone-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-ev-700 flex items-center justify-center">
                <SlidersHorizontal size={12} className="text-white" />
              </div>
              <span className="text-[15px] font-bold text-gray-900 tracking-tight">{t("catalog.categories", "Catégories")}</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Recherche dans la sidebar */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); navigate(catFromUrl, 1); }}
              placeholder={t("catalog.searchProduct", "Rechercher un produit...")}
              className="w-full h-9 pl-8 pr-8 text-[13px] border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:border-ev-400 focus:ring-1 focus:ring-ev-100 transition-all placeholder:text-gray-400"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Bouton "Tous les produits" */}
        <div className="px-3 pt-3">
          <button
            onClick={handleReset}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-semibold transition-all duration-150",
              !catFromUrl && !search
                ? "bg-ev-700 text-white shadow-sm"
                : "text-gray-700 hover:bg-stone-50 hover:text-ev-800 group"
            )}
          >
            <div className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all",
              !catFromUrl && !search ? "bg-white/20" : "bg-ev-50 group-hover:bg-ev-100"
            )}>
              <Layers size={14} className={!catFromUrl && !search ? "text-white" : "text-ev-600"} />
            </div>
            <span className="flex-1 text-left">{t("catalog.allProducts", "Tous les produits")}</span>
            <span className={cn(
              "text-[11px] font-bold px-2 py-0.5 rounded-full",
              !catFromUrl && !search ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
            )}>
              {totalAll}
            </span>
          </button>
        </div>

        {/* Séparateur */}
        <div className="mx-4 mt-3 mb-1 border-t border-stone-100" />

        {/* Arbre */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
          {tree.categories.map(cat => (
            <SidebarNode
              key={cat.id_categorie}
              node={cat}
              depth={0}
              selectedId={catFromUrl}
              openIds={openIds}
              onSelect={handleSelect}
              onToggle={handleToggle}
            />
          ))}
        </div>

        {/* Footer sidebar */}
        {catFromUrl && selectedNode && (
          <div className="px-3 pb-3 pt-2 border-t border-stone-100">
            <div className="bg-ev-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-ev-500 shrink-0" />
              <span className="text-[12px] font-medium text-ev-800 flex-1 truncate">{categoryLabel(selectedNode, locale)}</span>
              <button onClick={handleReset} className="text-ev-400 hover:text-ev-700 transition-colors">
                <X size={13} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* ── Zone principale ─────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col lg:pl-6">

        {/* Barre filtres */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">

          {/* Bouton ouvrir sidebar (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-[13px] font-medium text-gray-700 hover:border-ev-400 hover:text-ev-700 transition-all shadow-sm"
          >
            <SlidersHorizontal size={14} />
            {t("catalog.filters", "Filtres")}
            {catFromUrl && <span className="w-1.5 h-1.5 rounded-full bg-ev-500 ml-0.5" />}
          </button>

          {/* Badge catégorie active */}
          {catFromUrl && selectedNode && (
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] text-gray-400 font-medium">{t("catalog.categories", "Catégories")} :</span>
              <span className="flex items-center gap-1.5 bg-ev-700 text-white text-[12px] font-semibold px-3 py-1.5 rounded-full shadow-sm">
                {categoryLabel(selectedNode, locale)}
                <button onClick={handleReset} className="opacity-70 hover:opacity-100 transition-opacity ml-0.5">
                  <X size={11} />
                </button>
              </span>
            </div>
          )}

          {/* Recherche */}
          <div className="relative flex-1 min-w-[200px] max-w-sm ml-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); navigate(catFromUrl, 1); }}
              placeholder={t("catalog.searchProduct", "Rechercher un produit...")}
              className="w-full h-10 pl-9 pr-9 text-[14px] border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-ev-400 focus:ring-2 focus:ring-ev-100 shadow-sm transition-all placeholder:text-gray-400"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Compteur — masqué en vue grille catégories */}
          {(catFromUrl || search) && (
            <span className="text-[12px] text-gray-400 font-medium whitespace-nowrap">
              <span className="text-gray-700 font-semibold">{allProduits.length}</span> {productWord(allProduits.length, t)}
              {totalPages > 1 && <span className="text-gray-400"> · p.{page}/{totalPages}</span>}
            </span>
          )}
        </div>

        {/* Grille visuelle catégories racines (premier chargement) */}
        {!catFromUrl && !search && tree.categories.filter(n => !!n.image).length > 0 ? (
          <CatVisualGrid
            nodes={tree.categories}
            allProduitsFlat={tree.categories.flatMap(collectProduits)}
            onSelect={handleSelect}
          />
        ) : selectedNode && selectedNode.sous_cats.filter(n => !!n.image).length > 0 && !search ? (
          /* ── Sous-catégories avec images → grille visuelle ── */
          <CatVisualGrid
            nodes={selectedNode.sous_cats}
            allProduitsFlat={tree.categories.flatMap(collectProduits)}
            onSelect={handleSelect}
            parentNode={selectedNode}
            onBack={handleReset}
          />
        ) : allProduits.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
                <Package size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-500 text-[15px] font-medium mb-1">{t("catalog.noProducts", "Aucun produit trouvé")}</p>
              <p className="text-gray-400 text-[13px]">{t("catalog.tryFilters", "Essayez de modifier ou d'effacer vos filtres.")}</p>
              {(catFromUrl || search) && (
                <button onClick={handleReset} className="mt-4 text-[13px] font-semibold text-ev-600 hover:text-ev-800 hover:underline transition-colors">
                  {t("catalog.resetFilters", "Réinitialiser les filtres")}
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {paginated.map(({ produit, catNom }) => (
                <ProduitCard key={produit.id_produit} produit={toProduitCard(produit, catNom, tree)} />
              ))}
            </div>
            <div className="mt-4">
              {totalPages > 1 && (
                <p className="text-[12px] text-gray-400 text-center mb-2 font-medium">
                  Page <span className="text-gray-600 font-semibold">{page}</span> sur {totalPages}
                </p>
              )}
              <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}