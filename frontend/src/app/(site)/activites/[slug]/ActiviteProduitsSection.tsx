"use client";

import { useState, useMemo, useCallback, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { getEtudeInstallationHref, isEtudeInstallationCategory } from "@/lib/etude-installation";
import { SemencesRecommandationCard } from "./SemencesRecommandation";
import { JardinageSidebar, JardinageCategoryGrid, JardinageProductGrid } from "./JardinageCatalogShowcase";
import { useI18n } from "@/i18n/I18nProvider";
import { translatedField } from "@/i18n/translated-field";
import type { Locale } from "@/i18n/config";

const DEFAULT_PAGE_SIZE = 12;

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

/** Chemin racine → nœud (inclus), ou null si l'id n'existe pas dans l'arbre. */
function findPath(nodes: CatNode[], id: number, path: CatNode[] = []): CatNode[] | null {
  for (const n of nodes) {
    const nextPath = [...path, n];
    if (n.id_categorie === id) return nextPath;
    const found = findPath(n.children ?? [], id, nextPath);
    if (found) return found;
  }
  return null;
}

/** Les catégories "marque" de Jardinage & Machinisme utilisent le préfixe `jm-`. */
function isMarqueNode(node: CatNode) {
  return node.slug.startsWith("jm-");
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function shouldUseCatalogueView(node: CatNode | null, isMachinisme = false) {
  if (!node || (node.children ?? []).length === 0) return false;
  // En Jardinage & Machinisme, les cartes catégories ont un pictogramme de
  // secours quand il n'y a pas d'image : on peut donc toujours afficher la
  // grille de sous-catégories dès qu'il y en a.
  if (isMachinisme) return true;
  // Ailleurs, la grille "cover" n'affiche que les sous-catégories illustrées
  // : on ne bascule en vue grille que s'il y en a au moins une.
  return (node.children ?? []).some(child => !!child.image);
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
  const { locale, t } = useI18n();
  const children = node.children ?? [];
  if (children.length === 0) return null;

  function childCount(n: CatNode) {
    const ids = collectIds(n);
    return allProduits.filter(p => ids.has((p as any).id_categorie)).length;
  }
  function childFirstImage(n: CatNode) {
    const ids = collectIds(n);
    const first = allProduits.find(p => ids.has((p as any).id_categorie) && p.images?.[0]);
    return first?.images?.[0] ?? null;
  }

  return (
    <div className="mb-8">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3">
          <button onClick={onClose}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-ev-700 transition-colors">
            <ArrowLeft size={14} /> {t("catalog.allProducts", "Tous les produits")}
          </button>
          <span className="text-gray-300">/</span>
          <h2 className="font-bold text-ev-900 text-base">{catLabel(node, locale)}</h2>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
          {children.length} catégorie{children.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {children.filter(child => !!child.image).map(child => {
          const count  = childCount(child);
          const imgSrc = child.image;

          return (
            <button
              key={child.id_categorie}
              onClick={() => onSelectChild(child.id_categorie)}
              className="group overflow-hidden rounded-2xl border border-sand-200 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-ev-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-ev-400 focus:ring-offset-2"
              aria-label={`${t("catalog.viewProducts", "Voir produits")} ${catLabel(child, locale)}`}
            >
              <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-white via-ev-50 to-sand-100">
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={catLabel(child, locale)}
                    fill
                    className="object-contain p-6 drop-shadow-md transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl text-ev-200 shadow-sm">
                    🌿
                  </div>
                )}
                <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-ev-800 shadow-sm">
                  {count} {productWord(count, t)}
                </span>
              </div>

              <div className="flex min-h-[116px] flex-col p-4">
                <div className="mb-3 flex items-start gap-2">
                  <span className="mt-1 h-8 w-1 rounded-full bg-ev-600 shrink-0" />
                  <p className="text-[15px] font-bold leading-snug text-gray-900 line-clamp-2 group-hover:text-ev-700 transition-colors">
                    {catLabel(child, locale)}
                  </p>
                </div>
                <span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-xl bg-ev-700 px-3.5 py-2 text-[12px] font-semibold text-white transition-colors group-hover:bg-ev-800">
                  {t("catalog.viewProducts", "Voir produits")}
                  <ChevronRight size={13} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface BrandCard {
  id_categorie: number;
  nom: string;
  image: string | null;
  href: string;
}

function BrandLinkGrid({
  cards,
  allProduits,
}: {
  cards: BrandCard[];
  allProduits: import("@/types/api").ProduitCard[];
}) {
  const { t } = useI18n();
  if (cards.length === 0) return null;

  function cardCount(card: BrandCard) {
    return allProduits.filter(p => (p as any).id_categorie === card.id_categorie).length;
  }

  function cardFirstImage(card: BrandCard) {
    const first = allProduits.find(p => (p as any).id_categorie === card.id_categorie && p.images?.[0]);
    return first?.images?.[0] ?? null;
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => {
          const count = cardCount(card);
          const fallback = cardFirstImage(card);
          const imgSrc = card.image || fallback?.url || "/images/hero/matar-desktop.webp";

          return (
            <Link
              key={card.id_categorie}
              href={card.href}
              className="group relative h-56 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 focus:outline-none focus:ring-2 focus:ring-ev-500"
              aria-label={`Voir les produits ${card.nom}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-50 to-ev-50" />
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <Image
                  src={imgSrc}
                  alt={card.nom}
                  fill
                  className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 25vw"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-white text-lg font-bold leading-tight drop-shadow">
                  {card.nom}
                </p>
                <p className="mt-1 text-xs font-medium text-white/70">
                  {count} {productWord(count, t)}
                </p>
                <span
                  className="mt-4 inline-flex items-center gap-1.5 rounded bg-white px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-ev-800 shadow-sm transition-colors group-hover:bg-ev-700 group-hover:text-white"
                  aria-hidden="true"
                >
                  {t("catalog.viewProducts", "Voir produits")}
                  <ChevronRight size={12} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function RootCatalogueGrid({
  nodes,
  allProduits,
  onSelect,
}: {
  nodes: CatNode[];
  allProduits: import("@/types/api").ProduitCard[];
  onSelect: (id: number) => void;
}) {
  const { locale, t } = useI18n();
  if (nodes.length === 0) return null;

  function nodeCount(n: CatNode) {
    const ids = collectIds(n);
    return allProduits.filter(p => ids.has((p as any).id_categorie)).length;
  }

  function nodeFirstImage(n: CatNode) {
    const ids = collectIds(n);
    const first = allProduits.find(p => ids.has((p as any).id_categorie) && p.images?.[0]);
    return first?.images?.[0] ?? null;
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {nodes.filter(node => !!node.image).map(node => {
          const count = nodeCount(node);
          const imgSrc = node.image;

          return (
            <button
              key={node.id_categorie}
              onClick={() => onSelect(node.id_categorie)}
              className="group overflow-hidden rounded-2xl border border-sand-200 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-ev-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-ev-400 focus:ring-offset-2"
              aria-label={`${t("catalog.viewProducts", "Voir produits")} ${catLabel(node, locale)}`}
            >
              <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-white via-ev-50 to-sand-100">
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={catLabel(node, locale)}
                    fill
                    className="object-contain p-6 drop-shadow-md transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl text-ev-200 shadow-sm">
                    🌿
                  </div>
                )}
                <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-ev-800 shadow-sm">
                  {count} {productWord(count, t)}
                </span>
              </div>

              <div className="flex min-h-[116px] flex-col p-4">
                <div className="mb-3 flex items-start gap-2">
                  <span className="mt-1 h-8 w-1 rounded-full bg-ev-600 shrink-0" />
                  <p className="text-[15px] font-bold leading-snug text-gray-900 line-clamp-2 group-hover:text-ev-700 transition-colors">
                    {catLabel(node, locale)}
                  </p>
                </div>
                <span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-xl bg-ev-700 px-3.5 py-2 text-[12px] font-semibold text-white transition-colors group-hover:bg-ev-800">
                  {t("catalog.viewProducts", "Voir produits")}
                  <ChevronRight size={13} />
                </span>
              </div>
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
interface Props {
  id_activite: number;
  activiteSlug: string;
  categories: Categorie[];
  categoryScopeId?: number | null;
  brandCards?: BrandCard[];
  marques?: { id_marque: number; nom: string; slug: string; logo?: string | null }[];
}

/* ══════════════════════════════════════════════════════════════════════════ */
function ActiviteProduitsSection({ id_activite, activiteSlug, categories, categoryScopeId = null, brandCards = [], marques = [] }: Props) {
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const catParam = searchParams.get("cat");
  const isSemencesPage = activiteSlug === "semences-et-plants";
  const isMachinisme = activiteSlug === "jardinage-et-machinisme";

  const marqueLogoById = useMemo(
    () => new Map(marques.map((m) => [m.id_marque, m.logo])),
    [marques]
  );
  // Fallback : certaines tuiles catégorie ne sont pas liées via id_marque
  // en base (ex. "Outils Wolf") — on retrouve alors le logo en comparant
  // le nom/slug normalisés à ceux des marques.
  const marqueLogoByKey = useMemo(() => {
    const norm = (s: string) =>
      (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const map = new Map<string, string | null | undefined>();
    marques.forEach((m) => {
      if (norm(m.nom)) map.set(norm(m.nom), m.logo);
      if (norm(m.slug)) map.set(norm(m.slug), m.logo);
    });
    // Logos statiques de secours quand le champ `logo` est absent en base.
    if (!map.get("wolf")) map.set("wolf", "/logosPartenaires1/WOLF.png");
    if (!map.get("outilswolf")) map.set("outilswolf", "/logosPartenaires1/WOLF.png");
    return map;
  }, [marques]);

  const fullTree = useMemo(() => buildTree(categories), [categories]);
  const scopedNode = useMemo(
    () => categoryScopeId ? findNode(fullTree, categoryScopeId) : null,
    [categoryScopeId, fullTree]
  );
  const tree = useMemo(() => scopedNode ? [scopedNode] : fullTree, [fullTree, scopedNode]);

  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    categoryId: catParam ? parseInt(catParam, 10) : null,
  });
  const [page, setPage] = useState(1);
  const pageSize = isSemencesPage ? 12 : DEFAULT_PAGE_SIZE;

  const [catalogueCatId, setCatalogueCatId] = useState<number | null>(() => {
    if (!catParam) return null;
    const id   = parseInt(catParam, 10);
    const node = findNode(tree, id);
    if (shouldUseCatalogueView(node, isMachinisme)) return id;
    return null;
  });

  useEffect(() => {
    const id = catParam ? parseInt(catParam, 10) : null;
    setFilters(f => ({ ...f, categoryId: id }));
    setPage(1);
    if (!id) { setCatalogueCatId(null); return; }
    const node = findNode(tree, id);
    if (shouldUseCatalogueView(node, isMachinisme)) setCatalogueCatId(id);
    else setCatalogueCatId(null);
  }, [catParam, tree]);

  const { produits: allProduits, loading, error } = useProducts({
    id_activite: categoryScopeId ? undefined : id_activite,
    id_categorie: categoryScopeId ?? undefined,
    limit: 500,
  });
  const scopedProduits = useMemo(() => {
    if (!categoryScopeId || !scopedNode) return allProduits ?? [];
    const ids = collectIds(scopedNode);
    return (allProduits ?? []).filter(p => ids.has((p as any).id_categorie));
  }, [allProduits, categoryScopeId, scopedNode]);

  const filtered = useMemo(
    () => applyFilters(scopedProduits, filters, tree, locale),
    [scopedProduits, filters, tree, locale]
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated  = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  useEffect(() => { setPage(1); }, [filters]);

  // ── Tracking recherche visiteur ──────────────────────────────────────────────
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleFiltersChange = useCallback((f: FilterState) => {
    setFilters(f);
    setPage(1);
    if (f.search.trim().length >= 2) {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => {
        if (typeof window !== "undefined" && typeof (window as any).trackSearch === "function") {
          (window as any).trackSearch(f.search.trim(), 0);
        }
      }, 800);
    }
  }, []);
  const handlePageChange    = useCallback((p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  const handleCategorySelect = useCallback((id: number | null) => {
    if (!id) { setCatalogueCatId(null); handleFiltersChange({ ...filters, categoryId: null }); return; }
    const node = findNode(tree, id);
    if (node && isEtudeInstallationCategory(node)) {
      router.push(getEtudeInstallationHref(activiteSlug));
      return;
    }
    if (shouldUseCatalogueView(node, isMachinisme)) {
      setCatalogueCatId(id); handleFiltersChange({ ...filters, categoryId: id });
    } else {
      setCatalogueCatId(null); handleFiltersChange({ ...filters, categoryId: id });
    }
  }, [activiteSlug, isMachinisme, filters, tree, handleFiltersChange, router]);

  const catalogueNode = useMemo(() => catalogueCatId ? findNode(tree, catalogueCatId) : null, [catalogueCatId, tree]);
  const activeNode    = useMemo(() => filters.categoryId ? findNode(tree, filters.categoryId) : null, [filters.categoryId, tree]);

  const showGrid        = !catalogueCatId;
  const hasActiveFilters = filters.categoryId !== null || filters.tags.length > 0
    || filters.divisions.length > 0 || filters.search.trim() !== "";
  const showRootCatalogueGrid =
    !categoryScopeId &&
    brandCards.length === 0 &&
    !hasActiveFilters &&
    !catalogueCatId &&
    tree.some(n => !!n.image);
  const showJardinageRootGrid =
    isMachinisme &&
    !categoryScopeId &&
    !hasActiveFilters &&
    !catalogueCatId;
  const showIrrigationBrandLinks =
    activiteSlug === "irrigation" &&
    !categoryScopeId &&
    brandCards.length > 0 &&
    !hasActiveFilters &&
    !catalogueCatId;

  // Jardinage & Machinisme : la sidebar catégories ne s'affiche qu'une fois
  // qu'une marque a été sélectionnée (elle-même ou un de ses ancêtres dans
  // l'arbre) — comme sur la maquette de référence, où la grille "Explore All
  // Vehicles" occupe toute la largeur sans sidebar tant qu'on navigue par
  // catégories/marques.
  // Exception : si la page est déjà scoppée sur une marque (categoryScopeId,
  // ex. page /marques/[slug]) on est d'emblée "dans" la marque — la sidebar
  // doit donc apparaître dès le chargement, sans clic supplémentaire.
  const activeCatId = catalogueCatId ?? filters.categoryId;
  const activePath = useMemo(
    () => (activeCatId ? findPath(tree, activeCatId) : null),
    [activeCatId, tree]
  );
  const activeMarqueNode = useMemo(
    () => activePath?.find(isMarqueNode) ?? (categoryScopeId ? tree.find(isMarqueNode) ?? null : null),
    [activePath, categoryScopeId, tree]
  );
  const showMachinismeSidebar = isMachinisme && !!activeMarqueNode;
  const useFullWidthLayout = isMachinisme && !showMachinismeSidebar;
  const sidebarTree = activeMarqueNode
    ? (activeMarqueNode.children?.length ? activeMarqueNode.children : [activeMarqueNode])
    : tree;

  const reset = useCallback(() => { setCatalogueCatId(null); handleFiltersChange(DEFAULT_FILTERS); }, [handleFiltersChange]);

  /* Grille produits (chargement / vide / erreur / pagination) — partagée
   * entre le mode "pleine largeur" (aucune marque sélectionnée) et le mode
   * "sidebar" (navigation dans une marque). */
  const productGridContent = loading ? (
    <GridSkeleton count={isSemencesPage ? pageSize : 8} cols={isSemencesPage ? 4 : undefined} />
  ) : error ? (
    <p className="text-center text-red-500 py-10">{error}</p>
  ) : filtered.length === 0 ? (
    <div className="text-center py-24 text-gray-400">
      <Package size={40} className="mx-auto mb-3 opacity-25"/>
      <p className="text-sm font-medium text-gray-500 mb-1">{t("catalog.noProducts", "Aucun produit trouvé")}</p>
      <p className="text-xs text-gray-400 mb-4">{t("catalog.tryFilters", "Essayez de modifier ou d'effacer vos filtres.")}</p>
      <button onClick={reset}
        className="inline-flex items-center gap-1.5 text-xs text-ev-600 hover:text-ev-800 font-medium transition-colors">
        <SlidersHorizontal size={12}/> {t("catalog.resetFilters", "Réinitialiser les filtres")}
      </button>
    </div>
  ) : (
    <>
      {isMachinisme ? (
        <JardinageProductGrid produits={paginated} />
      ) : (
        <div className={cn("grid gap-4", "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4")}>
          {paginated.map((p) => (
            <ProduitCard
              key={p.id_produit}
              produit={p}
              variant={isSemencesPage ? "seed" : "default"}
            />
          ))}
        </div>
      )}
      <div className="mt-2">
        {totalPages > 1 && (
          <p className="text-xs text-gray-400 text-center mb-1">
            Page {page} sur {totalPages} · {filtered.length} {productWord(filtered.length, t)}
          </p>
        )}
        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange}/>
      </div>
    </>
  );

  const isRootBrandGrid = useFullWidthLayout && !catalogueNode && showJardinageRootGrid;

  return (
    <section id="produits-activite" className="bg-sand-50 border-b border-sand-200">
      {isRootBrandGrid && (
        /* Bloc "Parcourir par marque" — centré, fond distinct, comme la
         * section "Browse By Brands" de la maquette de référence. */
        <div className="py-14 md:py-16" style={{ backgroundColor: "#f2f3f8" }}>
          <div className="container-ev">
            <div className="text-center mb-10 md:mb-12">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.22em] mb-3" style={{ color: "#e30613" }}>
                Trouvez votre équipement par marque
              </p>
              <h2 className="text-3xl md:text-[2.35rem] font-black text-[#0c0c0e]" style={{ fontFamily: "var(--font-display)" }}>
                Parcourir par marques
              </h2>
            </div>
            <JardinageCategoryGrid
              nodes={tree}
              onSelect={(id) => handleCategorySelect(id)}
              marqueLogoById={marqueLogoById}
              marqueLogoByKey={marqueLogoByKey}
              wide
              centered
            />
          </div>
        </div>
      )}
      <div className="container-ev py-5">
        {isMachinisme && (
          <div className="mb-6 mt-2">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.22em] mb-2" style={{ color: "#e30613" }}>
              Service de vente de confiance
            </p>
            <h2 className="text-2xl sm:text-[1.85rem] font-black text-[#0c0c0e]" style={{ fontFamily: "var(--font-display)" }}>
              Explorer tous nos produits
            </h2>
          </div>
        )}
        {useFullWidthLayout ? (
          <div className="mb-2">
            {catalogueNode && (
              <button
                onClick={reset}
                className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
              >
                <ArrowLeft size={14} /> {t("catalog.allProducts", "Tous les produits")}
              </button>
            )}
            {catalogueNode ? (
              /* Sous-catégories / marques de la catégorie sélectionnée */
              <JardinageCategoryGrid
                nodes={catalogueNode.children ?? []}
                onSelect={(id) => handleCategorySelect(id)}
                marqueLogoById={marqueLogoById}
                marqueLogoByKey={marqueLogoByKey}
                wide
              />
            ) : showJardinageRootGrid ? (
              /* Racine : les marques ont déjà leur bloc centré au-dessus —
               * ici on affiche directement tous les produits, juste après. */
              productGridContent
            ) : (
              /* Catégorie feuille sans marque : grille produits pleine largeur */
              productGridContent
            )}
          </div>
        ) : (
        <div
          className={cn(
            "flex flex-col gap-6 lg:gap-8",
            isSemencesPage
              ? "md:grid md:grid-cols-[15rem_minmax(0,1fr)] md:items-start xl:grid-cols-[15rem_minmax(0,1fr)_17rem]"
              : "md:flex-row"
          )}
        >

          {/* Sidebar catégories */}
          {isMachinisme ? (
            <JardinageSidebar
              tree={sidebarTree}
              activeId={filters.categoryId}
              onSelect={(id) => handleCategorySelect(id)}
              onReset={reset}
            />
          ) : (
            <FilterPanel
              tree={tree}
              produits={scopedProduits}
              filters={filters}
              onChange={handleFiltersChange}
              totalAll={scopedProduits.length}
              onCategoryClick={handleCategorySelect}
            />
          )}

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
                              className="hover:text-ev-700 transition-colors">{catLabel(parent, locale)}</button></>
                        ) : null;
                      })()}
                      <ChevronRight size={10} />
                      <span className="text-gray-800 font-semibold">{catLabel(activeNode, locale)}</span>
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
              isMachinisme ? (
                <div className="mb-8">
                  <button
                    onClick={reset}
                    className="mb-5 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
                  >
                    <ArrowLeft size={14} /> {t("catalog.allProducts", "Tous les produits")}
                  </button>
                  <JardinageCategoryGrid
                    nodes={catalogueNode.children ?? []}
                    onSelect={(id) => handleCategorySelect(id)}
                    marqueLogoById={marqueLogoById}
              marqueLogoByKey={marqueLogoByKey}
                  />
                </div>
              ) : (
                <CatalogueCoverGrid
                  node={catalogueNode}
                  allProduits={scopedProduits}
                  onSelectChild={(id) => handleCategorySelect(id)}
                  onClose={reset}
                />
              )
            )}

            {showIrrigationBrandLinks && (
              <BrandLinkGrid
                cards={brandCards}
                allProduits={scopedProduits}
              />
            )}

            {showJardinageRootGrid && !catalogueNode && (
              <JardinageCategoryGrid
                nodes={tree}
                onSelect={(id) => handleCategorySelect(id)}
                marqueLogoById={marqueLogoById}
              marqueLogoByKey={marqueLogoByKey}
              />
            )}

            {!isMachinisme && showRootCatalogueGrid && (
              <RootCatalogueGrid
                nodes={tree}
                allProduits={scopedProduits}
                onSelect={(id) => handleCategorySelect(id)}
              />
            )}

            {/* Mode grille produits */}
            {showGrid && !showRootCatalogueGrid && !showIrrigationBrandLinks && !showJardinageRootGrid && (
              productGridContent
            )}
          </div>

          {isSemencesPage && (
            <div className="md:col-span-2 xl:col-span-1 xl:pl-1">
              <div className="xl:sticky xl:top-24">
                <SemencesRecommandationCard products={scopedProduits} />
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </section>
  );
}

export function ActiviteProduitsSectionWrapper(props: {
  id_activite: number;
  activiteSlug: string;
  categories: any[];
  categoryScopeId?: number | null;
  brandCards?: BrandCard[];
  marques?: { id_marque: number; nom: string; slug: string; logo?: string | null }[];
}) {
  return (
    <Suspense fallback={null}>
      <ActiviteProduitsSection {...props} />
    </Suspense>
  );
}

function catLabel(cat: { nom: string; translations?: any }, locale: Locale) {
  return translatedField(cat as any, "nom", locale) || cat.nom;
}

function productWord(count: number, t: (key: string, fallback?: string) => string) {
  return count > 1 ? t("catalog.products", "produits") : t("catalog.product", "produit");
}