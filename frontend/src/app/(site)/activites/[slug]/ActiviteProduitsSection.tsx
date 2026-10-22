"use client";

import { useState, useMemo, useCallback, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Package, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight,
  X, SlidersHorizontal, ArrowLeft, LayoutGrid, Sprout, List,
} from "lucide-react";
import { ProduitCard }   from "@/components/cards/ProduitCard";
import { Reveal }        from "@/components/ui/Reveal";
import { GridSkeleton }  from "@/components/ui/Skeleton";
import { useProducts }   from "@/hooks/useProducts";
import type { Categorie } from "@/types/api";
import { cn } from "@/lib/utils";
import { SectionTitleLine } from "@/components/ui/SectionTitleIcon";
import {
  FilterPanel, applyFilters, DEFAULT_FILTERS,
  type FilterState, type CatNode,
} from "@/components/catalogue/FilterPanel";
import { getEtudeInstallationHref, isEtudeInstallationCategory } from "@/lib/etude-installation";
import {
  findCategoryBySlugPath,
  findCategoryPathInTree,
  getActivityCategoryHref,
} from "@/lib/category-url";
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
  // Rattachements secondaires (additifs) : une catégorie (ex. "Tomate") peut
  // en plus apparaître sous d'autres parents que son parent_id principal
  // (ex. rattachée à la fois à "Semences hybrides" et "Semences standard").
  // Elle garde sa place principale ; elle est simplement dupliquée dans les
  // `children` du/des parent(s) secondaire(s).
  map.forEach(node => {
    (node.parent_ids_extra ?? []).forEach(extraParentId => {
      if (extraParentId === node.id_categorie) return;
      const extraParent = map.get(extraParentId);
      if (extraParent && !extraParent.children.includes(node)) extraParent.children.push(node);
    });
  });
  const sort = (nodes: CatNode[], ancestors: Set<number> = new Set()) => {
    nodes.sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0) || a.nom.localeCompare(b.nom, "fr"));
    nodes.forEach(n => {
      // Garde-fou : si un rattachement secondaire crée accidentellement un
      // cycle, on coupe la récursion plutôt que de boucler à l'infini.
      if (ancestors.has(n.id_categorie)) { n.children = []; return; }
      sort(n.children, new Set(ancestors).add(n.id_categorie));
    });
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

function shouldUseCatalogueView(node: CatNode | null, isMachinisme = false, isFertilisationPage = false) {
  if (!node || (node.children ?? []).length === 0) return false;
  // Fertilisation : contrairement aux autres activités, on bascule en vue
  // "grille de sous-catégories" dès qu'il y a au moins un enfant — même si
  // aucun n'a d'image (repli sur le pictogramme générique 🌿 dans
  // CatalogueCoverGrid). Sans ça, une sous-catégorie Fertilisation dont les
  // enfants n'ont pas encore d'image passée par l'admin tombait directement
  // sur la liste de produits générique au lieu d'afficher ses tuiles.
  if (isFertilisationPage) return (node.children ?? []).some(child => !!child.image);
  // La grille "cover" n'affiche que les sous-catégories illustrées : on ne
  // bascule en vue grille que s'il y en a au moins une — comportement
  // uniforme sur toutes les autres activités, Jardinage & Machinisme inclus.
  // Une catégorie sans image n'est plus affichée du tout (plus de repli sur
  // le pictogramme générique), donc si aucun enfant n'a d'image la grille de
  // couverture n'a rien à montrer et on passe directement aux produits.
  return (node.children ?? []).some(child => !!child.image);
}

/** Descend automatiquement à travers une chaîne de catégories à enfant
 *  unique (ex. "Semences maraîchères" → "Hybride", où "Hybride" est la
 *  seule sous-catégorie) pour éviter d'afficher une grille de couverture
 *  qui ne contiendrait qu'une seule tuile — on saute directement au niveau
 *  où il y a un vrai choix à faire. Si la chaîne se termine sur une
 *  catégorie sans sous-catégorie illustrée, on renvoie `null` : il n'y a
 *  alors rien à montrer en grille et on affichera directement les produits.
 *  Sur Fertilisation, une sous-catégorie sans image n'annule plus la grille
 *  (voir shouldUseCatalogueView) — elle s'affiche avec le pictogramme 🌿. */
function resolveCoverNode(node: CatNode | null, isFertilisationPage = false): CatNode | null {
  if (!node) return null;
  let current = node;
  while (!isFertilisationPage && (current.children ?? []).length === 1) {
    current = current.children![0];
  }
  const kids = current.children ?? [];
  if (kids.length === 0) return null;
  if (!isFertilisationPage && !kids.some(child => !!child.image)) return null;
  return current;
}

/* ── CatalogueCoverGrid ─────────────────────────────────────────────────── */
function CatalogueCoverGrid({
  node, allProduits, onSelectChild, onClose, requireImage = true,
}: {
  node: CatNode;
  allProduits: import("@/types/api").ProduitCard[];
  onSelectChild: (id: number) => void;
  onClose: () => void;
  /** false (Fertilisation) : affiche aussi les sous-catégories sans image,
   *  avec le pictogramme 🌿 en repli, au lieu de les masquer. */
  requireImage?: boolean;
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

      <div className="flex flex-wrap justify-center gap-x-6 gap-y-10">
        {children.filter(child => requireImage ? !!child.image : true).map(child => {
          const count  = childCount(child);
          const imgSrc = child.image;

          return (
            <button
              key={child.id_categorie}
              onClick={() => onSelectChild(child.id_categorie)}
              className="group flex w-full max-w-xs flex-col items-center text-center focus:outline-none sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
              aria-label={`${t("catalog.viewProducts", "Voir produits")} ${catLabel(child, locale)}`}
            >
              <div className="relative flex h-36 w-full items-center justify-center sm:h-44">
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={catLabel(child, locale)}
                    fill
                    className="object-contain transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.06]"
                    sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ev-50 text-3xl text-ev-300">
                    🌿
                  </div>
                )}
              </div>

              <p
                className="mt-3 text-[0.95rem] font-semibold leading-snug text-[#1b2118] transition-colors group-hover:text-ev-700 sm:mt-4 sm:text-[1.05rem]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {catLabel(child, locale)}
              </p>
              {count > 0 && (
                <span className="mt-0.5 text-[11px] text-gray-400">
                  {count} {productWord(count, t)}
                </span>
              )}

              {/* Bouton "Voir produits" — pastille outline, se remplit et
                  fait pivoter la flèche à 45° au survol */}
              <span className="mt-4 inline-flex items-center rounded-full border-2 border-ev-700 py-1.5 pl-4 pr-1.5 text-[11px] font-bold uppercase tracking-wider text-ev-700 transition-colors duration-300 group-hover:bg-ev-700 group-hover:text-white">
                {t("catalog.viewProducts", "Voir produits")}
                <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-ev-700 text-white transition-transform duration-300 ease-out group-hover:rotate-45 group-hover:bg-white group-hover:text-ev-700">
                  <ChevronRight size={13} />
                </span>
              </span>
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

  function cardFirstImage(card: BrandCard) {
    const first = allProduits.find(p => (p as any).id_categorie === card.id_categorie && p.images?.[0]);
    return first?.images?.[0] ?? null;
  }

  return (
    <div className="mb-8">
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-10">
        {cards.map(card => {
          const fallback = cardFirstImage(card);
          const imgSrc = card.image || fallback?.url || "/images/hero/matar-desktop.webp";

          return (
            <Link
              key={card.id_categorie}
              href={card.href}
              className="group flex w-full max-w-xs flex-col items-center text-center focus:outline-none sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
              aria-label={`Voir les produits ${card.nom}`}
            >
              <div className="relative flex h-36 w-full items-center justify-center sm:h-44">
                <Image
                  src={imgSrc}
                  alt={card.nom}
                  fill
                  className="object-contain transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.06]"
                  sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 25vw"
                />
              </div>

              <p
                className="mt-3 text-[0.95rem] font-semibold leading-snug text-[#1b2118] transition-colors group-hover:text-ev-700 sm:mt-4 sm:text-[1.05rem]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {card.nom}
              </p>

              <span className="mt-3 inline-flex max-w-full items-center justify-center gap-1.5 rounded-xl bg-ev-700 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm transition-all duration-300 group-hover:bg-ev-800 group-hover:shadow-md group-hover:-translate-y-0.5 sm:mt-4 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-[12.5px]">
                {t("catalog.viewProducts", "Voir produits")}
                <ChevronRight size={14} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
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

  return (
    <div className="mb-8">
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-10">
        {nodes.filter(node => !!node.image).map(node => {
          const imgSrc = node.image;

          return (
            <button
              key={node.id_categorie}
              onClick={() => onSelect(node.id_categorie)}
              className="group flex w-full max-w-xs flex-col items-center text-center focus:outline-none sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
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
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ev-50 text-3xl text-ev-300">
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
    </div>
  );
}

/* ── SemencesCategoryTiles ────────────────────────────────────────────────
 * Rangée de tuiles catégories, fixe en haut de la page Semences & Plants
 * (façon "Shop by Category"). On reste sur cette même vue en permanence :
 * cliquer une tuile filtre juste les produits affichés juste en dessous,
 * sans jamais remplacer les tuiles par une sous-grille. Même habillage que
 * les cartes produit du catalogue : image sans cadre, nom en dessous, puis
 * bouton "Voir les produits" — pour que produits et sous-catégories ajoutés
 * s'affichent toujours de façon cohérente sur cette page. */
function SemencesCategoryTiles({
  nodes, activeId, allProduits, onSelect,
}: {
  nodes: CatNode[];
  activeId: number | null;
  allProduits: import("@/types/api").ProduitCard[];
  onSelect: (id: number | null) => void;
}) {
  const { locale, t } = useI18n();
  // Chaque niveau affiche uniquement ses catégories illustrées. Les enfants
  // apparaissent dans la grille suivante après sélection de leur parent.
  const illustrated = nodes.filter(n => !!n.image);
  if (illustrated.length === 0) return null;

  return (
    <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen mb-8 py-9 md:py-11" style={{ backgroundColor: "#ecdfc0" }}>
      <div className="container-ev">
        <Reveal>
          <p className="text-center text-[11.5px] font-extrabold uppercase tracking-[0.28em] text-[#8a6d3b] mb-6">
            {t("catalog.shopByCategory", "Parcourir par catégorie")} :
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-7 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 md:gap-x-6 md:gap-y-9">
          {illustrated.map((node, i) => {
            const isActive = activeId === node.id_categorie;
            // Dès qu'une tuile est active, les autres passent en gris/réduites
            // (comme la grille "Parcourir par marques" de Jardinage &
            // Machinisme) — la tuile active ressort légèrement en zoom. La
            // rangée reste toujours affichée et statique (aucune tuile ne
            // disparaît, aucune sous-grille ne vient la remplacer).
            const isDimmed = activeId != null && !isActive;
            const imgSrc = node.image;
            return (
              <Reveal key={node.id_categorie} delay={i * 0.06} y={24}>
                <button
                  type="button"
                  onClick={() => onSelect(isActive ? null : node.id_categorie)}
                  aria-pressed={isActive}
                  className={cn(
                    "group flex w-full flex-col items-center text-center focus:outline-none transition-all duration-300",
                    isActive
                      ? "scale-[1.06]"
                      : isDimmed
                        ? "scale-95 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-100"
                        : ""
                  )}
                >
                  {/* Zone image — cadre carré rempli, même taille réelle pour
                      toutes les tuiles (object-cover), comme sur la maquette. */}
                  <div className={cn(
                    "relative aspect-square w-full overflow-hidden rounded-2xl transition-shadow duration-300",
                    isActive && "ring-2 ring-ev-700 ring-offset-2 shadow-lg"
                  )}>
                    {imgSrc ? (
                      <Image
                        src={imgSrc}
                        alt={catLabel(node, locale)}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.06]"
                        sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-ev-50 text-ev-300">
                        <Sprout size={32} strokeWidth={1.6} />
                      </div>
                    )}
                  </div>

                  {/* Nom — même style que le nom des produits */}
                  <p
                    className="mt-3 text-[0.95rem] font-semibold leading-snug text-[#1b2118] transition-colors group-hover:text-ev-700 sm:mt-4 sm:text-[1.05rem]"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {catLabel(node, locale)}
                  </p>

                  {/* Bouton "Voir les produits" — même style que "Voir le produit" */}
                  <span
                    className={cn(
                      "mt-3 inline-flex max-w-full items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-0.5 sm:mt-4 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-[12.5px]",
                      isActive ? "bg-ev-800" : "bg-ev-700 group-hover:bg-ev-800"
                    )}
                  >
                    {t("catalog.viewProducts", "Voir les produits")}
                    <ChevronRight size={14} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FertilisationCategorySelector({
  nodes, activeId, onSelect,
}: {
  nodes: CatNode[];
  activeId: number | null;
  onSelect: (id: number | null) => void;
}) {
  const { locale, t } = useI18n();
  const activePath = activeId ? findPath(nodes, activeId) : null;
  const activeRoot = activePath?.[0] ?? null;
  const roots = nodes.filter((node) => !!node.image);
  const activeBranch = activePath ?? [];
  const categoryLevels = activeBranch.flatMap((parent, depth) => {
    const children = (parent.children ?? []).filter((node) => !!node.image);
    return children.length > 0
      ? [{ parent, children, selectedId: activeBranch[depth + 1]?.id_categorie ?? null }]
      : [];
  });
  if (roots.length === 0) return null;

  return (
    <div className="relative left-1/2 right-1/2 -mx-[50vw] mb-3 w-screen bg-[#ecdfc0] px-4 py-5 md:py-6">
      <div className="container-ev">
        <p className="text-center text-[11.5px] font-extrabold uppercase tracking-[0.24em] text-[#8a6d3b]">
          {t("catalog.shopByCategory", "Choisissez votre gamme")}
        </p>
        <div className="mx-auto mt-5 flex max-w-xl justify-center gap-3 rounded-2xl border border-[#b99c6d]/35 bg-white/60 p-2 shadow-sm">
          {roots.map((root) => {
            const selected = activeRoot?.id_categorie === root.id_categorie;
            return (
              <button
                key={root.id_categorie}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(selected ? null : root.id_categorie)}
                className={cn(
                  "min-h-12 w-full max-w-[220px] flex-1 rounded-xl px-5 py-3 text-sm font-extrabold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ev-700 focus-visible:ring-offset-2",
                  selected
                    ? "bg-ev-800 text-white shadow-md"
                    : "bg-white text-ev-900 hover:bg-ev-50"
                )}
              >
                {catLabel(root, locale)}
                {selected && <span className="ml-2 text-xs font-semibold text-white/75">✓</span>}
              </button>
            );
          })}
        </div>
        {categoryLevels.map(({ parent, children, selectedId }) => (
          <div key={parent.id_categorie} className="mt-4 border-t border-[#b99c6d]/30 pt-4">
            <p className="text-center text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#8a6d3b]">
              {t("catalog.subcategories", "Sous-catégories de")} {catLabel(parent, locale)}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-6">
              {children.map((node, index) => {
                const selected = selectedId === node.id_categorie;
                const dimmed = selectedId !== null && !selected;
                return (
                  <Reveal key={node.id_categorie} delay={index * 0.06} y={24} className="w-full max-w-[210px] min-[420px]:w-[calc(50%-10px)] sm:w-[calc(33.333%-14px)] lg:w-[calc(20%-16px)]">
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onSelect(selected ? parent.id_categorie : node.id_categorie)}
                      className={cn(
                        "group flex w-full flex-col items-center text-center transition-all duration-300 focus:outline-none",
                        selected ? "scale-[1.04]" : dimmed ? "scale-95 opacity-40 grayscale hover:scale-100 hover:opacity-100 hover:grayscale-0" : ""
                      )}
                    >
                      <span className={cn(
                        "relative aspect-square w-full overflow-hidden rounded-2xl transition-shadow duration-300",
                        selected && "ring-2 ring-ev-700 ring-offset-2 shadow-lg"
                      )}>
                        <Image
                          src={node.image!}
                          alt={catLabel(node, locale)}
                          fill
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
                        />
                      </span>
                      <span className="mt-3 text-[0.95rem] font-semibold leading-snug text-[#1b2118] transition-colors group-hover:text-ev-700 sm:mt-4 sm:text-[1.05rem]" style={{ fontFamily: "var(--font-serif)" }}>
                        {catLabel(node, locale)}
                      </span>
                      <span className={cn(
                        "mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm transition-all sm:mt-4 sm:text-[12.5px]",
                        selected ? "bg-ev-800" : "bg-ev-700 group-hover:bg-ev-800"
                      )}>
                        {selected ? t("catalog.selected", "Sélectionnée") : t("catalog.viewProducts", "Voir les produits")}
                        <ChevronRight size={14} />
                      </span>
                    </button>
                  </Reveal>
                );
              })}
            </div>
          </div>
        ))}
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
  const pathname = usePathname();
  const catParam = searchParams.get("cat");
  // Fertilisation partage exactement la mise en page de Semences & plants
  // (tuiles catégories, panneau de filtres, grille/liste, pagination).
  const isSemencesPage = activiteSlug === "semences-et-plants" || activiteSlug === "fertilisation";
  const isMachinisme = activiteSlug === "jardinage-et-machinisme";
  const isFertilisationPage = activiteSlug === "fertilisation";
  // Cartes produits "plein format" (image en ratio naturel, non recadrée) —
  // utilisées pour Semences et, désormais, Fertilisation.
  const useFullSizeCards = isSemencesPage || isFertilisationPage;

  const marqueLogoById = useMemo(
    () => new Map(marques.map((m) => [m.id_marque, m.logo])),
    [marques]
  );
  // Fallback : certaines tuiles catégorie ne sont pas liées via id_marque
  // en base (ex. "Outils Wolf") — on retrouve alors le logo en comparant
  // le nom/slug normalisés à ceux des marques.
  // Fallback : certaines tuiles catégorie ne sont pas liées via id_marque
  // en base (ex. "Outils Wolf"), ou le champ `logo` en base pointe vers un
  // fichier qui n'existe plus/pas encore côté serveur (logos cassés
  // constatés sur "Parcourir par marques"). On force ces marques connues
  // vers leur logo statique réellement présent dans /public, pour garantir
  // un affichage correct indépendamment de ce qui est enregistré en base.
  const STATIC_LOGO_OVERRIDES: Record<string, string> = {
    wolf:        "/logosPartenaires1/WOLF.png",
    weibang:     "/logosPartenaires1/LOGO WEIBANG.png",
    agricut:     "/logosPartenaires1/LOGO AGRICUT.png",
    staub:       "/logosPartenaires1/LOGO STAUB.png",
    etesia:      "/logosPartenaires1/ETISIA LOGO.png",
    etisia:      "/logosPartenaires1/ETISIA LOGO.png",
    active:      "/logosPartenaires1/ACTIVE-logo.png",
    // "wiedenmann" retiré : le logo vient désormais correctement de la
    // fiche marque liée à la catégorie racine jm-wiedenmann.
  };
  const marqueLogoByKey = useMemo(() => {
    const norm = (s: string) =>
      (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const map = new Map<string, string | null | undefined>();
    marques.forEach((m) => {
      if (norm(m.nom)) map.set(norm(m.nom), m.logo);
      if (norm(m.slug)) map.set(norm(m.slug), m.logo);
    });
    Object.entries(STATIC_LOGO_OVERRIDES).forEach(([key, src]) => map.set(key, src));
    return map;
  }, [marques]);

  const fullTree = useMemo(() => buildTree(categories), [categories]);
  const scopedNode = useMemo(
    () => categoryScopeId ? findNode(fullTree, categoryScopeId) : null,
    [categoryScopeId, fullTree]
  );
  const tree = useMemo(() => scopedNode ? [scopedNode] : fullTree, [fullTree, scopedNode]);
  const selectedCategoryIdFromUrl = useMemo(() => {
    if (catParam) {
      const id = parseInt(catParam, 10);
      if (Number.isFinite(id)) return id;
    }

    const marker = `/activites/${activiteSlug}/categorie/`;
    const markerIndex = pathname.indexOf(marker);
    if (markerIndex === -1) return categoryScopeId ?? null;

    const rawPath = pathname.slice(markerIndex + marker.length);
    const slugs = rawPath
      .split("/")
      .filter(Boolean)
      .map((segment) => decodeURIComponent(segment));
    return findCategoryBySlugPath(tree, slugs)?.id_categorie ?? (categoryScopeId ?? null);
  }, [activiteSlug, catParam, categoryScopeId, pathname, tree]);

  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    categoryId: selectedCategoryIdFromUrl,
  });
  const [page, setPage] = useState(1);
  const pageSize = isSemencesPage ? 12 : DEFAULT_PAGE_SIZE;

  // Panneau de filtres masqué par défaut (page Semences) — s'ouvre via
  // l'icône "Filtrer" du bandeau d'options d'affichage, pour laisser toute
  // la largeur aux produits tant qu'il n'est pas ouvert.
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Options d'affichage : grille (cartes) ou liste (lignes verticales).
  const [gridView, setGridView] = useState<"comfortable" | "list">("comfortable");

  const [catalogueCatId, setCatalogueCatId] = useState<number | null>(() => {
    if (!selectedCategoryIdFromUrl || isFertilisationPage) return null;
    const node = findNode(tree, selectedCategoryIdFromUrl);
    if (shouldUseCatalogueView(node, isMachinisme, isFertilisationPage)) return selectedCategoryIdFromUrl;
    return null;
  });

  useEffect(() => {
    const id = selectedCategoryIdFromUrl;
    setFilters(f => ({ ...f, categoryId: id }));
    setPage(1);
    if (!id) { setCatalogueCatId(null); return; }
    if (isFertilisationPage) { setCatalogueCatId(null); return; }
    const node = findNode(tree, id);
    if (shouldUseCatalogueView(node, isMachinisme, isFertilisationPage)) setCatalogueCatId(id);
    else setCatalogueCatId(null);
  }, [selectedCategoryIdFromUrl, tree, isMachinisme, isFertilisationPage]);

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

  // Semences : la liste utilisée pour dériver les facettes (tags / gammes) du
  // panneau de filtres ne doit contenir que les produits de la catégorie
  // active — pas tout le catalogue Semences — pour n'afficher que "son"
  // filtrage, comme demandé.
  const facetProduits = useMemo(() => {
    if (!isSemencesPage || !filters.categoryId) return scopedProduits;
    const node = findNode(tree, filters.categoryId);
    if (!node) return scopedProduits;
    const ids = collectIds(node);
    return scopedProduits.filter(p => ids.has((p as any).id_categorie));
  }, [isSemencesPage, filters.categoryId, tree, scopedProduits]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated  = useMemo(() => filtered.slice(0, page * pageSize), [filtered, page, pageSize]);
  const visibleCount = Math.min(page * pageSize, filtered.length);

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

  // Reflète la catégorie sélectionnée dans l'URL lisible.
  // IMPORTANT : router.push (pas .replace) — .replace() écrase l'entrée
  // d'historique en cours au lieu d'en créer une nouvelle. Résultat observé :
  // en cliquant Semences maraîchères → Pro → Semences Hybride → Tomate,
  // chaque clic ÉCRASAIT la précédente entrée d'historique ; un seul clic
  // sur "retour" du navigateur sautait alors par-dessus TOUTE la chaîne au
  // lieu de revenir catégorie par catégorie. Avec push, chaque sélection
  // devient une vraie étape d'historique et le retour redevient logique.
  const syncCategoryRoute = useCallback((id: number | null) => {
    if (!id) {
      router.push(`/activites/${activiteSlug}`, { scroll: false });
      return;
    }

    const path = findCategoryPathInTree(tree, id);
    const href = path
      ? getActivityCategoryHref(activiteSlug, path.map((cat) => cat.slug))
      : `/activites/${activiteSlug}`;
    router.push(href, { scroll: false });
  }, [activiteSlug, router, tree]);

  useEffect(() => {
    if (!catParam || !selectedCategoryIdFromUrl) return;
    const path = findCategoryPathInTree(tree, selectedCategoryIdFromUrl);
    if (!path) return;
    router.replace(getActivityCategoryHref(activiteSlug, path.map((cat) => cat.slug)), { scroll: false });
  }, [activiteSlug, catParam, router, selectedCategoryIdFromUrl, tree]);

  const handleCategorySelect = useCallback((id: number | null) => {
    if (!id) {
      setCatalogueCatId(null);
      handleFiltersChange({ ...filters, categoryId: null });
      syncCategoryRoute(null);
      return;
    }
    const node = findNode(tree, id);
    if (node && isEtudeInstallationCategory(node)) {
      router.push(getEtudeInstallationHref(activiteSlug));
      return;
    }
    if (isFertilisationPage) {
      setCatalogueCatId(null);
      handleFiltersChange({ ...filters, categoryId: id });
      syncCategoryRoute(id);
      return;
    }
    if (shouldUseCatalogueView(node, isMachinisme, isFertilisationPage)) {
      setCatalogueCatId(id); handleFiltersChange({ ...filters, categoryId: id });
    } else {
      setCatalogueCatId(null); handleFiltersChange({ ...filters, categoryId: id });
    }
    syncCategoryRoute(id);
  }, [activiteSlug, isMachinisme, isFertilisationPage, filters, tree, handleFiltersChange, router, syncCategoryRoute]);

  const catalogueNode = useMemo(
    () => resolveCoverNode(catalogueCatId ? findNode(tree, catalogueCatId) : null, isFertilisationPage),
    [catalogueCatId, tree, isFertilisationPage]
  );
  const activeNode    = useMemo(() => filters.categoryId ? findNode(tree, filters.categoryId) : null, [filters.categoryId, tree]);
  // Semences : la catégorie "racine" affichée dans le panneau de filtres —
  // reste ancrée sur la catégorie de premier niveau cliquée au départ, même
  // si l'utilisateur sélectionne ensuite une sous-catégorie plus profonde
  // (sinon le panneau se recalcule sur la feuille active et disparaît dès
  // que celle-ci n'a pas elle-même de sous-catégories).
  const semencesRootNode = useMemo(() => {
    if (!filters.categoryId) return null;
    const path = findPath(tree, filters.categoryId);
    return path ? path[0] : null;
  }, [filters.categoryId, tree]);

  const showGrid        = !catalogueCatId;
  const hasActiveFilters = filters.categoryId !== null || filters.tags.length > 0
    || filters.divisions.length > 0 || filters.search.trim() !== "";
  const showRootCatalogueGrid =
    !isSemencesPage &&
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

  // Semences : la carte "Quelle semence pour moi ?" (widget IA) et le panneau
  // de filtres ne s'affichent qu'une fois une catégorie choisie — au départ,
  // la grille produits occupe toute la largeur, comme sur le site de référence.
  // Le panneau latéral de filtres ne prend de la place que lorsqu'il a été
  // ouvert explicitement via l'icône "Filtrer" — masqué par défaut pour que
  // les produits occupent tout l'espace disponible.
  const semencesHasSideRail = isSemencesPage && filtersOpen;

  // Jardinage & Machinisme : la sidebar catégories ne s'affiche qu'une fois
  // qu'une marque a été sélectionnée (elle-même ou un de ses ancêtres dans
  // l'arbre) — comme sur la maquette de référence, où la grille "Explore All
  // Vehicles" occupe toute la largeur sans sidebar tant qu'on navigue par
  // catégories/marques.
  const activeCatId = catalogueCatId ?? filters.categoryId;
  const activePath = useMemo(
    () => (activeCatId ? findPath(tree, activeCatId) : null),
    [activeCatId, tree]
  );
  const activeMarqueNode = useMemo(
    () => activePath?.find(isMarqueNode) ?? (categoryScopeId ? tree.find(isMarqueNode) ?? null : null),
    [activePath, categoryScopeId, tree]
  );
  // La sidebar ne s'affiche que si on est descendu dans une sous-catégorie
  // de la marque — pas quand la marque racine elle-même (ou la page dédiée
  // qui en scope le catalogue via categoryScopeId) vient d'être
  // sélectionnée, pour que la grille de couverture de ses sous-catégories
  // (bandeau "Parcourir par marques" inclus) reste affichée en premier.
  const showMachinismeSidebar =
    isMachinisme &&
    !!activeMarqueNode &&
    activeCatId !== activeMarqueNode.id_categorie;
  const useFullWidthLayout = isMachinisme && !showMachinismeSidebar;
  const sidebarTree = activeMarqueNode
    ? (activeMarqueNode.children?.length ? activeMarqueNode.children : [activeMarqueNode])
    : tree;

  // Page dédiée à une marque (categoryScopeId, ex. /marques/active) : la
  // rangée de ses sous-catégories illustrées (Débroussailleuse, Motoculteur,
  // ...) reste affichée en permanence en haut de page — comme le bandeau
  // "Parcourir par marques" — avec la tuile de la sous-catégorie active mise
  // en zoom et les autres grisées, plutôt que de disparaître une fois qu'on
  // a sélectionné l'une d'elles (sidebar + produits affichés en dessous).
  const isScopedCategoryGrid =
    isMachinisme &&
    !!categoryScopeId &&
    !!scopedNode &&
    (scopedNode.children ?? []).some(c => !!c.image) &&
    filters.tags.length === 0 &&
    filters.divisions.length === 0 &&
    filters.search.trim() === "";
  const selectedScopedChildId =
    categoryScopeId && activePath && activePath.length > 1 ? activePath[1].id_categorie : null;
  const scopedRootCatalogueAlreadyShown =
    isScopedCategoryGrid &&
    !!catalogueNode &&
    catalogueNode.id_categorie === scopedNode?.id_categorie;

  const reset = useCallback(() => { setCatalogueCatId(null); handleFiltersChange(DEFAULT_FILTERS); syncCategoryRoute(null); }, [handleFiltersChange, syncCategoryRoute]);

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
      ) : isSemencesPage && gridView === "list" ? (
        /* Affichage liste — produits empilés verticalement (une ligne par produit). */
        <div className="flex flex-col gap-3">
          {paginated.map((p) => (
            <ProduitCard key={p.id_produit} produit={p} variant="list" />
          ))}
        </div>
      ) : (
        <div className={cn(
          "flex flex-wrap justify-center gap-4",
          useFullSizeCards && "items-start"
        )}>
          {paginated.map((p) => (
            <div
              key={p.id_produit}
              className={
                semencesHasSideRail
                  ? "w-full max-w-xs sm:w-[calc(50%-8px)] sm:max-w-none xl:w-[calc(33.333%-10.667px)] 2xl:w-[calc(25%-12px)]"
                  : isSemencesPage
                    ? "w-full max-w-xs sm:w-[calc(50%-8px)] sm:max-w-none md:w-[calc(33.333%-10.667px)] lg:w-[calc(25%-12px)] xl:w-[calc(20%-12.8px)]"
                    : "w-full max-w-xs sm:w-[calc(50%-8px)] sm:max-w-none lg:w-[calc(25%-12px)]"
              }
            >
              <ProduitCard
                produit={p}
                variant={useFullSizeCards ? "seed" : "default"}
              />
            </div>
          ))}
        </div>
      )}
      <div className="mt-2">
        {totalPages > 1 && (
          <p className="text-xs text-gray-400 text-center mb-1">
            {visibleCount} sur {filtered.length} {productWord(filtered.length, t)}
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
        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange}/>
      </div>
    </>
  );

  // Marque actuellement "ouverte" (racine jm-xxx sélectionnée, ou l'un de ses
  // ancêtres si on a descendu plus profond dans ses sous-catégories) : sert à
  // garder le bandeau "Parcourir par marques" affiché en permanence, avec sa
  // tuile mise en avant et les autres grisées, quelle que soit la profondeur
  // de navigation atteinte.
  const selectedMarqueId = activeMarqueNode?.id_categorie ?? null;

  // Le bandeau de marques reste fixe et visible en permanence sur Jardinage &
  // Machinisme (comme la rangée de tuiles de Semences & Plants) — il ne
  // disparaît plus une fois qu'on descend dans les sous-catégories d'une
  // marque (sidebar affichée) ; seuls d'autres filtres actifs (tags,
  // divisions, recherche) ou le scope d'une page marque dédiée le masquent.
  const isRootBrandGrid =
    isMachinisme &&
    !categoryScopeId &&
    filters.tags.length === 0 &&
    filters.divisions.length === 0 &&
    filters.search.trim() === "";

  const activeFiltersBar = hasActiveFilters ? (
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
      {filters.tags.map(tg => (
        <span key={tg} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ev-100 text-ev-800 text-xs font-medium">
          {tg}<button onClick={() => handleFiltersChange({ ...filters, tags: filters.tags.filter(x => x !== tg) })}><X size={10}/></button>
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
  ) : null;

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
                <SectionTitleLine icon="Leaf" color="#e30613" align="center">Parcourir par marques</SectionTitleLine>
              </h2>
            </div>
            <JardinageCategoryGrid
              nodes={tree.filter(isMarqueNode)}
              onSelect={(id) => handleCategorySelect(id)}
              marqueLogoById={marqueLogoById}
              marqueLogoByKey={marqueLogoByKey}
              wide
              centered
              selectedId={selectedMarqueId}
            />
          </div>
        </div>
      )}
      <div className={cn("container-ev", isSemencesPage ? "pb-5" : "py-5")}>
        {activiteSlug === "semences-et-plants" && (
          <div className="mb-8 mt-3">
            <SemencesRecommandationCard products={scopedProduits} />
          </div>
        )}
        {isMachinisme && (
          <div className="mb-6 mt-2">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.22em] mb-2" style={{ color: "#e30613" }}>
              Service de vente de confiance
            </p>
            <h2 className="text-2xl sm:text-[1.85rem] font-black text-[#0c0c0e]" style={{ fontFamily: "var(--font-display)" }}>
              <SectionTitleLine icon="Tractor" color="#e30613" align="left">Explorer tous nos produits</SectionTitleLine>
            </h2>
          </div>
        )}
        {isScopedCategoryGrid && (
          <div className="mb-8">
            <JardinageCategoryGrid
              nodes={scopedNode!.children ?? []}
              onSelect={(id) => handleCategorySelect(id)}
              marqueLogoById={marqueLogoById}
              marqueLogoByKey={marqueLogoByKey}
              wide
              requireImage
              selectedId={selectedScopedChildId}
            />
          </div>
        )}
        {isSemencesPage ? (
          <div className="mb-2">
            {isFertilisationPage ? (
              <FertilisationCategorySelector
                nodes={tree}
                activeId={filters.categoryId}
                onSelect={(id) => handleCategorySelect(id)}
              />
            ) : (
              <SemencesCategoryTiles
                nodes={tree}
                // La tuile active doit rester celle de premier niveau cliquée
                // au départ (ex. "Semences maraîchères"), même après avoir
                // sélectionné une sous-catégorie plus profonde (ex.
                // "Standard") dans le panneau de filtres.
                activeId={semencesRootNode?.id_categorie ?? filters.categoryId}
                allProduits={scopedProduits}
                onSelect={(id) => handleCategorySelect(id)}
              />
            )}

            {/* Bandeau d'options : icône pour ouvrir/fermer le panneau de
                filtres (masqué par défaut) + options d'affichage (densité
                de la grille) + nombre de résultats. */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setFiltersOpen(v => !v)}
                aria-pressed={filtersOpen}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all",
                  filtersOpen
                    ? "bg-ev-700 text-white border-ev-700 shadow-sm"
                    : "bg-white text-gray-700 border-sand-200 hover:border-ev-300"
                )}
              >
                <SlidersHorizontal size={15} />
                {filtersOpen
                  ? t("catalog.hideFilters", "Masquer les filtres")
                  : t("catalog.filters", "Filtrer")}
              </button>

              <div className="flex items-center gap-3 ml-auto">
                <span className="text-xs text-gray-400">
                  {facetProduits.length} {productWord(facetProduits.length, t)}
                </span>
                <div className="flex items-center rounded-xl border border-sand-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setGridView("comfortable")}
                    aria-pressed={gridView === "comfortable"}
                    aria-label={t("catalog.viewComfortable", "Affichage large")}
                    title={t("catalog.viewComfortable", "Affichage large")}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      gridView === "comfortable" ? "bg-ev-100 text-ev-700" : "text-gray-400 hover:text-ev-600"
                    )}
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setGridView("list")}
                    aria-pressed={gridView === "list"}
                    aria-label={t("catalog.viewList", "Affichage liste")}
                    title={t("catalog.viewList", "Affichage liste")}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      gridView === "list" ? "bg-ev-100 text-ev-700" : "text-gray-400 hover:text-ev-600"
                    )}
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {!semencesHasSideRail ? (
              /* Panneau de filtres fermé : la grille produits occupe toute
               * la largeur disponible, comme sur le site de référence —
               * SAUF si la catégorie cliquée a des sous-catégories illustrées
               * ("hybride", etc.), auquel cas on affiche d'abord la grille
               * de couverture jusqu'à ce qu'une sous-catégorie feuille soit choisie. */
              <>
                {catalogueNode ? (
                  <CatalogueCoverGrid
                    node={catalogueNode}
                    allProduits={facetProduits}
                    onSelectChild={(id) => handleCategorySelect(id)}
                    onClose={() => handleCategorySelect(null)}
                    requireImage
                  />
                ) : (
                  <>
                    {activeFiltersBar}
                    {productGridContent}
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-6 lg:gap-8 md:grid md:grid-cols-[15rem_minmax(0,1fr)] md:items-start">
                {/* Filtres (tags / gamme / tri) — bornés aux seuls produits
                    de la catégorie active. L'arbre de catégories affiché
                    dans le panneau est lui aussi borné : uniquement les
                    sous-catégories de la catégorie racine cliquée au
                    départ (pas tout l'arbre du site), et seulement si
                    elle en a. Ancré sur la racine, pas sur la feuille
                    active, pour ne pas disparaître en descendant l'arbre.
                    Reste affiché même quand une grille de couverture
                    (catalogueNode) est montrée à droite : le filtre doit
                    toujours donner accès à toute l'arborescence sous la
                    catégorie sélectionnée, pas seulement au niveau affiché
                    dans la grille de tuiles. */}
                <FilterPanel
                  tree={semencesRootNode?.children ?? []}
                  produits={facetProduits}
                  filters={filters}
                  onChange={handleFiltersChange}
                  totalAll={facetProduits.length}
                  onCategoryClick={handleCategorySelect}
                  hideCategoryTree={!(semencesRootNode && (semencesRootNode.children ?? []).length > 0)}
                />

                {/* Zone principale */}
                <div className="flex-1 min-w-0">
                  {catalogueNode ? (
                    <CatalogueCoverGrid
                      node={catalogueNode}
                      allProduits={facetProduits}
                      onSelectChild={(id) => handleCategorySelect(id)}
                      onClose={() => handleCategorySelect(null)}
                      requireImage
                    />
                  ) : (
                    <>
                      {activeFiltersBar}
                      {productGridContent}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : useFullWidthLayout ? (
          <div className="mb-2">
            {catalogueNode && !scopedRootCatalogueAlreadyShown && (
              <button
                onClick={reset}
                className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
              >
                <ArrowLeft size={14} /> {t("catalog.allProducts", "Tous les produits")}
              </button>
            )}
            {scopedRootCatalogueAlreadyShown ? null : catalogueNode ? (
              /* Marque avec sous-catégories : on affiche sa grille de
               * sous-catégories (comportement d'origine), le bandeau
               * "Parcourir par marques" restant visible et statique
               * au-dessus (zoom sur la tuile active, autres grisées). */
              <JardinageCategoryGrid
                nodes={catalogueNode.children ?? []}
                onSelect={(id) => handleCategorySelect(id)}
                marqueLogoById={marqueLogoById}
                marqueLogoByKey={marqueLogoByKey}
                wide
                requireImage
              />
            ) : (
              /* Racine, ou marque sans sous-catégories : grille produits
               * directement, filtrée sur la marque le cas échéant. */
              <>
                {activeFiltersBar}
                {productGridContent}
              </>
            )}
          </div>
        ) : (
        <div
          className="flex flex-col gap-6 lg:gap-8 md:flex-row"
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
            {activeFiltersBar}

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
                    requireImage
                  />
                </div>
              ) : (
                <CatalogueCoverGrid
                  node={catalogueNode}
                  allProduits={scopedProduits}
                  onSelectChild={(id) => handleCategorySelect(id)}
                  onClose={reset}
                  requireImage
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
