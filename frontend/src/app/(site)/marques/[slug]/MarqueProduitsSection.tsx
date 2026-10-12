"use client";
/**
 * MarqueProduitsSection — Catalogue produits d'une marque
 * - Affiche une grille visuelle des catégories racines (avec images) quand aucune n'est sélectionnée
 * - Après clic sur une catégorie → affiche les produits filtrés + FilterPanel latéral
 * Logique identique à ActiviteProduitsSection (Matar / irrigation)
 */
import { ProduitCard } from "@/components/cards/ProduitCard";
import {
  applyFilters,
  DEFAULT_FILTERS,
  FilterPanel,
  type CatNode,
  type FilterState,
} from "@/components/catalogue/FilterPanel";
import { GridSkeleton } from "@/components/ui/Skeleton";
import { useProducts } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";
import type { MarqueCategorie } from "@/types/api";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LayoutGrid,
  Package,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState, useRef} from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { translatedField } from "@/i18n/translated-field";
import type { Locale } from "@/i18n/config";

const PAGE_SIZE = 12;

/* ── Build CatNode tree ─────────────────────────────────────────────────── */
function buildTree(cats: MarqueCategorie[]): CatNode[] {
  const hasNested = cats.some((c) => (c as any).sous_cats !== undefined);
  if (hasNested) {
    return cats
      .filter((c) => !c.parent_id)
      .sort(
        (a, b) =>
          ((a as any).ordre ?? 0) - ((b as any).ordre ?? 0) ||
          a.nom.localeCompare(b.nom, "fr"),
      )
      .map((c) => ({
        ...c,
        ordre: (c as any).ordre ?? 0,
        children: ((c as any).sous_cats ?? [])
          .sort(
            (a: any, b: any) =>
              (a.ordre ?? 0) - (b.ordre ?? 0) ||
              a.nom.localeCompare(b.nom, "fr"),
          )
          .map((sc: any) => ({ ...sc, children: [] })),
      }));
  }
  const map = new Map<number, CatNode>();
  cats.forEach((c) =>
    map.set(c.id_categorie, {
      ...c,
      ordre: (c as any).ordre ?? 0,
      children: [],
    }),
  );
  const roots: CatNode[] = [];
  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id))
      map.get(node.parent_id)!.children.push(node);
    else roots.push(node);
  });
  const sort = (nodes: CatNode[]) => {
    nodes.sort(
      (a, b) =>
        (a.ordre ?? 0) - (b.ordre ?? 0) || a.nom.localeCompare(b.nom, "fr"),
    );
    nodes.forEach((n) => sort(n.children));
    return nodes;
  };
  return sort(roots);
}

function findNode(nodes: CatNode[], id: number): CatNode | null {
  for (const n of nodes) {
    if (n.id_categorie === id) return n;
    const r = findNode(n.children ?? [], id);
    if (r) return r;
  }
  return null;
}

/** Une catégorie mérite une grille de couverture (photos des
 *  sous-catégories) si au moins l'un de ses enfants directs est illustré —
 *  sinon on passe directement à l'affichage des produits. */
function shouldUseCatalogueView(node: CatNode | null) {
  if (!node || (node.children ?? []).length === 0) return false;
  return (node.children ?? []).some((child) => !!child.image);
}

/** Descend automatiquement à travers une chaîne de catégories à enfant
 *  unique (ex. une catégorie qui n'a qu'une seule sous-catégorie) pour
 *  éviter d'afficher une grille de couverture qui ne contiendrait qu'une
 *  seule tuile. Renvoie `null` si la chaîne se termine sur une catégorie
 *  sans sous-catégorie illustrée : il n'y a alors rien à montrer en grille
 *  et on affiche directement les produits. */
function resolveCoverNode(node: CatNode | null): CatNode | null {
  if (!node) return null;
  let current = node;
  while ((current.children ?? []).length === 1) {
    current = current.children![0];
  }
  const kids = current.children ?? [];
  if (kids.length === 0 || !kids.some((child) => !!child.image)) return null;
  return current;
}

function collectIds(node: CatNode): Set<number> {
  const ids = new Set([node.id_categorie]);
  (node.children ?? []).forEach((c) =>
    collectIds(c).forEach((id) => ids.add(id)),
  );
  return ids;
}

function catLabel(cat: { nom: string; translations?: any }, locale: Locale) {
  return translatedField(cat as any, "nom", locale) || cat.nom;
}

function productWord(count: number, t: (key: string, fallback?: string) => string) {
  return count > 1 ? t("catalog.products", "produits") : t("catalog.product", "produit");
}

/* ── Grille visuelle catégories racines ─────────────────────────────────── */
function CategoriesGrid({
  nodes,
  allProduits,
  onSelect,
}: {
  nodes: CatNode[];
  allProduits: any[];
  onSelect: (id: number) => void;
}) {
  const { locale, t } = useI18n();
  if (nodes.length === 0) return null;

  function nodeFirstImage(n: CatNode) {
    const ids = collectIds(n);
    const first = allProduits.find(
      (p) => ids.has((p as any).id_categorie) && p.images?.[0],
    );
    return first?.images?.[0] ?? null;
  }

  return (
    <div className="mb-8 flex flex-wrap justify-center gap-x-6 gap-y-10">
      {nodes.map((node) => {
        const fallback = nodeFirstImage(node);
        const imgSrc = node.image || fallback?.url || null;

        return (
          <button
            key={node.id_categorie}
            onClick={() => onSelect(node.id_categorie)}
            className="group flex w-full max-w-xs flex-col items-center text-center focus:outline-none sm:w-[calc(50%-8px)] sm:max-w-none lg:w-[calc(25%-12px)]"
            aria-label={`${t("catalog.viewProducts", "Voir produits")} ${catLabel(node, locale)}`}
          >
            <div className="relative flex h-36 w-full items-center justify-center sm:h-44">
              {imgSrc ? (
                <Image
                  src={imgSrc}
                  alt={catLabel(node, locale)}
                  fill
                  className="object-contain transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.06]"
                  sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 25vw"
                />
              ) : (
                <div className="flex h-36 w-full items-center justify-center rounded-full bg-ev-50 text-3xl text-ev-300 sm:h-44">
                  🌿
                </div>
              )}
            </div>

            <p
              className="mt-3 text-[0.95rem] font-semibold leading-snug text-[#1b2118] transition-colors group-hover:text-ev-700 sm:mt-4 sm:text-[1.05rem]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {catLabel(node, locale)}
            </p>

            <span className="mt-3 inline-flex max-w-full items-center justify-center gap-1.5 rounded-xl bg-ev-700 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm transition-all duration-300 group-hover:bg-ev-800 group-hover:shadow-md group-hover:-translate-y-0.5 sm:mt-4 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-[12.5px]">
              {t("catalog.viewProducts", "Voir produits")}
              <ChevronRight size={14} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Grille sous-catégories avec images ─────────────────────────────────── */
function SubCategoriesGrid({
  parentNode,
  allProduits,
  onSelect,
  onBack,
}: {
  parentNode: CatNode;
  allProduits: any[];
  onSelect: (id: number) => void;
  onBack: () => void;
}) {
  const { locale, t } = useI18n();
  const subCatsWithImages = (parentNode.children ?? []).filter(
    (sc) => !!sc.image && sc.image.trim() !== "",
  );
  const subCatsNoImages = (parentNode.children ?? []).filter(
    (sc) => !sc.image || sc.image.trim() === "",
  );

  if (subCatsWithImages.length === 0 && subCatsNoImages.length === 0)
    return null;

  return (
    <div>
      {/* Bouton retour */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-ev-600 hover:text-ev-800 font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> {t("catalog.categories", "Catégories")}
      </button>

      {/* Sous-catégories AVEC images */}
      {subCatsWithImages.length > 0 && (
        <div className="mb-8 flex flex-wrap justify-center gap-x-6 gap-y-10">
          {subCatsWithImages.map((subCat) => {
            return (
              <button
                key={subCat.id_categorie}
                onClick={() => onSelect(subCat.id_categorie)}
                className="group flex w-full max-w-xs flex-col items-center text-center focus:outline-none sm:w-[calc(50%-8px)] sm:max-w-none lg:w-[calc(25%-12px)]"
                aria-label={`${t("catalog.viewProducts", "Voir produits")} ${catLabel(subCat, locale)}`}
              >
                <div className="relative flex h-36 w-full items-center justify-center sm:h-44">
                  <Image
                    src={subCat.image!}
                    alt={catLabel(subCat, locale)}
                    fill
                    className="object-contain transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.06]"
                    sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 25vw"
                  />
                </div>

                <p
                  className="mt-3 text-[0.95rem] font-semibold leading-snug text-[#1b2118] transition-colors group-hover:text-ev-700 sm:mt-4 sm:text-[1.05rem]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {catLabel(subCat, locale)}
                </p>

                <span className="mt-3 inline-flex max-w-full items-center justify-center gap-1.5 rounded-xl bg-ev-700 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm transition-all duration-300 group-hover:bg-ev-800 group-hover:shadow-md group-hover:-translate-y-0.5 sm:mt-4 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-[12.5px]">
                  {t("catalog.viewProducts", "Voir produits")}
                  <ChevronRight size={14} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Sous-catégories SANS images → affichage des produits directement */}
      {subCatsNoImages.length > 0 && (
        <div>
          {subCatsNoImages.map((subCat) => {
            const ids = collectIds(subCat);
            const produitsSubCat = allProduits.filter((p) =>
              ids.has((p as any).id_categorie),
            );
            if (produitsSubCat.length === 0) return null;

            return (
              <div key={subCat.id_categorie} className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Package size={15} className="text-ev-600 shrink-0" />
                  <h3 className="text-base font-bold text-gray-800">
                    {catLabel(subCat, locale)}
                  </h3>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {produitsSubCat.length} {productWord(produitsSubCat.length, t)}
                  </span>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  {produitsSubCat.map((p) => (
                    <div key={p.id_produit} className="w-full max-w-xs sm:w-[calc(50%-8px)] sm:max-w-none lg:w-[calc(25%-12px)]">
                      <ProduitCard produit={p} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Pagination ─────────────────────────────────────────────────────────── */
function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages: (number | "...")[] = (() => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const r: (number | "...")[] = [];
    if (page <= 4) r.push(1, 2, 3, 4, 5, "...", totalPages);
    else if (page >= totalPages - 3)
      r.push(
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    else r.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    return r;
  })();
  return (
    <div className="flex items-center justify-center gap-1.5 mt-10 select-none flex-wrap">
      <button
        onClick={() => onPageChange(1)}
        disabled={page === 1}
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-lg transition-all text-gray-400",
          page === 1
            ? "opacity-30 cursor-not-allowed"
            : "hover:bg-ev-50 hover:text-ev-700",
        )}
      >
        <ChevronsLeft size={15} />
      </button>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-lg transition-all text-gray-500",
          page === 1
            ? "opacity-30 cursor-not-allowed"
            : "hover:bg-ev-50 hover:text-ev-700",
        )}
      >
        <ChevronLeft size={15} />
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`e${i}`}
            className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm"
          >
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
                : "text-gray-600 hover:bg-ev-50 hover:text-ev-700",
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-lg transition-all text-gray-500",
          page === totalPages
            ? "opacity-30 cursor-not-allowed"
            : "hover:bg-ev-50 hover:text-ev-700",
        )}
      >
        <ChevronRight size={15} />
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages}
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-lg transition-all text-gray-400",
          page === totalPages
            ? "opacity-30 cursor-not-allowed"
            : "hover:bg-ev-50 hover:text-ev-700",
        )}
      >
        <ChevronsRight size={15} />
      </button>
    </div>
  );
}

/* ── Props ──────────────────────────────────────────────────────────────── */
interface Props {
  id_marque: number;
  categories: MarqueCategorie[];
  cardVariant?: "default" | "seed" | "light";
}

/* ══════════════════════════════════════════════════════════════════════════ */
export function MarqueProduitsSection({ id_marque, categories, cardVariant = "default" }: Props) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat");

  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    categoryId: catParam ? parseInt(catParam, 10) : null,
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = catParam ? parseInt(catParam, 10) : null;
    setFilters((f) => ({ ...f, categoryId: id }));
    setPage(1);
  }, [catParam]);

  const {
    produits: allProduits,
    loading,
    error,
  } = useProducts({ id_marque, limit: 500 });

  const tree = useMemo(() => buildTree(categories), [categories]);

  // Catégories racines (pour la grille d'accueil)
  const rootNodes = useMemo(() => tree, [tree]);

  const filtered = useMemo(
    () => (allProduits ? applyFilters(allProduits, filters, tree, locale) : []),
    [allProduits, filters, tree, locale],
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = useMemo(
    () => filtered.slice(0, page * PAGE_SIZE),
    [filtered, page],
  );
  const visibleCount = Math.min(page * PAGE_SIZE, filtered.length);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const navigate = useCallback(
    (catId: number | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (catId) params.set("cat", String(catId));
      else params.delete("cat");
      params.delete("page");
      router.push(`${pathname}?${params.toString()}#catalogue-marque`, {
        scroll: false,
      });
    },
    [router, pathname, searchParams],
  );

  // ── Tracking recherche visiteur ──────────────────────────────────────────────
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleFiltersChange = useCallback(
    (f: FilterState) => {
      setFilters(f);
      setPage(1);
      navigate(f.categoryId);
      if (f.search.trim().length >= 2) {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
          if (typeof window !== "undefined" && typeof (window as any).trackSearch === "function") {
            (window as any).trackSearch(f.search.trim(), 0);
          }
        }, 800);
      }
    },
    [navigate],
  );

  const handleCategorySelect = useCallback(
    (id: number | null) => {
      handleFiltersChange({ ...DEFAULT_FILTERS, categoryId: id });
    },
    [handleFiltersChange],
  );

  const reset = useCallback(() => {
    handleFiltersChange(DEFAULT_FILTERS);
  }, [handleFiltersChange]);

  const activeNode = useMemo(() => {
    if (!filters.categoryId) return null;
    return findNode(tree, filters.categoryId);
  }, [filters.categoryId, tree]);

  // Catégorie sélectionnée dont on doit montrer les sous-catégories
  // illustrées (comme sur les pages d'activité) avant d'afficher les
  // produits — `null` si la catégorie n'a pas de sous-catégories illustrées,
  // auquel cas on passe directement aux produits.
  const catalogueNode = useMemo(
    () => resolveCoverNode(activeNode),
    [activeNode]
  );

  const hasActiveFilters =
    filters.categoryId !== null ||
    filters.tags.length > 0 ||
    filters.divisions.length > 0 ||
    filters.search.trim() !== "";

  // Afficher la grille des catégories racines quand aucun filtre actif
  const showCategoriesGrid = !hasActiveFilters && rootNodes.length > 0;

  return (
    <section
      id="catalogue-marque"
      className="bg-sand-50 border-b border-sand-200"
    >
      <div className="container-ev py-8">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* FilterPanel — masqué sur la grille d'accueil, visible dès qu'une catégorie est sélectionnée */}
          {!showCategoriesGrid && (
            <FilterPanel
              tree={tree}
              produits={allProduits ?? []}
              filters={filters}
              onChange={handleFiltersChange}
              totalAll={(allProduits ?? []).length}
              onCategoryClick={handleCategorySelect}
            />
          )}

          {/* Zone principale */}
          <div className="flex-1 min-w-0">
            {/* ── Grille catégories (état initial) ─────────────── */}
            {showCategoriesGrid && (
              <CategoriesGrid
                nodes={rootNodes}
                allProduits={allProduits ?? []}
                onSelect={handleCategorySelect}
              />
            )}

            {/* ── Sous-catégories illustrées (comme sur les pages
                d'activité) : on clique une photo de catégorie, on voit
                d'abord ses sous-catégories illustrées, puis les produits. */}
            {!showCategoriesGrid && catalogueNode && (
              <SubCategoriesGrid
                parentNode={catalogueNode}
                allProduits={allProduits ?? []}
                onSelect={handleCategorySelect}
                onBack={reset}
              />
            )}

            {/* ── Produits filtrés ──────────────────────────────── */}
            {!showCategoriesGrid && !catalogueNode && (
              <>
                {/* Breadcrumb / filtres actifs */}
                <div className="mb-4 flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <button
                      onClick={reset}
                      className="hover:text-ev-700 transition-colors flex items-center gap-1 font-medium"
                    >
                      <LayoutGrid size={10} /> {t("catalog.categories", "Catégories")}
                    </button>
                    {activeNode && (
                      <>
                        {activeNode.parent_id &&
                          (() => {
                            const parent = findNode(
                              tree,
                              activeNode.parent_id!,
                            );
                            return parent ? (
                              <>
                                <ChevronRight size={10} />
                                <button
                                  onClick={() =>
                                    handleCategorySelect(parent.id_categorie)
                                  }
                                  className="hover:text-ev-700 transition-colors"
                                >
                                  {catLabel(parent, locale)}
                                </button>
                              </>
                            ) : null;
                          })()}
                        <ChevronRight size={10} />
                        <span className="text-gray-800 font-semibold">
                          {catLabel(activeNode, locale)}
                        </span>
                      </>
                    )}
                  </div>
                  {filters.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ev-100 text-ev-800 text-xs font-medium"
                    >
                      {t}
                      <button
                        onClick={() =>
                          handleFiltersChange({
                            ...filters,
                            tags: filters.tags.filter((x) => x !== t),
                          })
                        }
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {filters.divisions.map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ev-100 text-ev-800 text-xs font-medium"
                    >
                      {d}
                      <button
                        onClick={() =>
                          handleFiltersChange({
                            ...filters,
                            divisions: filters.divisions.filter((x) => x !== d),
                          })
                        }
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <span className="text-xs text-gray-400 ml-auto">
                    {filtered.length} {productWord(filtered.length, t)}
                  </span>
                  <button
                    onClick={reset}
                    className="text-xs text-gray-400 hover:text-ev-700 flex items-center gap-1 transition-colors"
                  >
                      <ArrowLeft size={10} /> {t("catalog.categories", "Catégories")}
                  </button>
                </div>

                {loading ? (
                  <GridSkeleton count={8} />
                ) : error ? (
                  <p className="text-center text-red-500 py-10">{error}</p>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-24 text-gray-400">
                    <Package size={40} className="mx-auto mb-3 opacity-25" />
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {t("catalog.noProducts", "Aucun produit trouvé")}
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      {t("catalog.tryFilters", "Essayez de modifier ou d'effacer vos filtres.")}
                    </p>
                    <button
                      onClick={reset}
                      className="inline-flex items-center gap-1.5 text-xs text-ev-600 hover:text-ev-800 font-medium transition-colors"
                    >
                      <SlidersHorizontal size={12} /> {t("catalog.resetFilters", "Réinitialiser les filtres")}
                    </button>
                  </div>
                ) : (
                  <>
                  <div className="flex flex-wrap justify-center gap-4">
                      {paginated.map((p) => (
                        <div key={p.id_produit} className="w-full max-w-xs sm:w-[calc(50%-8px)] sm:max-w-none lg:w-[calc(25%-12px)]">
                          <ProduitCard produit={p} variant={cardVariant} />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2">
                      {totalPages > 1 && (
                        <p className="text-xs text-gray-400 text-center mb-1">
                          {visibleCount} sur {filtered.length}{" "}
                          {productWord(filtered.length, t)}
                        </p>
                      )}
                      {page < totalPages && (
                        <div className="mt-6 flex justify-center">
                          <button
                            type="button"
                            onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
                            className="inline-flex items-center gap-2 rounded-xl border border-ev-700/35 bg-white/75 px-6 py-3 text-[12.5px] font-extrabold uppercase tracking-wide text-ev-900 shadow-[0_14px_34px_rgba(31,79,46,0.14),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-ev-800 hover:bg-ev-700 hover:text-white hover:shadow-[0_18px_42px_rgba(31,79,46,0.26),inset_0_1px_0_rgba(255,255,255,0.28)]"
                          >
                            Afficher plus
                            <ChevronRight size={15} strokeWidth={2.5} />
                          </button>
                        </div>
                      )}
                      <Pagination
                        page={page}
                        totalPages={totalPages}
                        onPageChange={(p) => {
                          setPage(p);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      />
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

export function MarqueProduitsSectionWrapper(props: {
  id_marque: number;
  categories: any[];
  hideUntilCategorySelected?: boolean;
  cardVariant?: "default" | "seed" | "light";
}) {
  return (
    <Suspense fallback={null}>
      <MarqueProduitsSectionGate {...props} />
    </Suspense>
  );
}

function MarqueProduitsSectionGate({
  hideUntilCategorySelected = false,
  ...props
}: {
  id_marque: number;
  categories: any[];
  hideUntilCategorySelected?: boolean;
  cardVariant?: "default" | "seed" | "light";
}) {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat");

  if (hideUntilCategorySelected && !catParam) return null;

  return <MarqueProduitsSection {...props} />;
}
