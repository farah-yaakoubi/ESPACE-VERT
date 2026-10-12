"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, Search, SlidersHorizontal, X,
  ChevronLeft, Layers, Package,
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

function containsId(node: CategorieNode, id: number): boolean {
  if (node.id_categorie === id) return true;
  return node.sous_cats.some(c => containsId(c, id));
}

/** Retrouve, pour un id de catégorie quelconque, l'onglet racine (Pro / Jardin) auquel il appartient. */
function topLevelAncestorId(roots: CategorieNode[], id: number): number | null {
  for (const r of roots) {
    if (containsId(r, id)) return r.id_categorie;
  }
  return null;
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
          "group flex items-start gap-0 rounded-xl transition-all duration-150",
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
          title={categoryLabel(node, locale)}
          className="flex items-start gap-2.5 flex-1 min-w-0 py-2.5 pr-1 text-left"
        >
          {/* Indicateur couleur */}
          <span className={cn(
            "shrink-0 rounded-full transition-all mt-2",
            isRoot ? "w-2 h-2" : "w-1.5 h-1.5",
            isSelected       ? "bg-white"    :
            hasSelectedChild ? "bg-ev-400"   :
            isRoot           ? "bg-ev-500"   : "bg-gray-300"
          )} />

          {/* Image catégorie si présente */}
          {node.image && (
            <Image src={node.image} alt={categoryLabel(node, locale)} width={18} height={18}
              className="rounded-md shrink-0 object-cover opacity-80 mt-0.5" />
          )}

          {/* Nom — passe sur 2 lignes plutôt que d'être coupé par "..." */}
          <span className={cn(
            "leading-snug break-words line-clamp-2 min-w-0",
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
              "ml-auto shrink-0 mt-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full",
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
              "shrink-0 w-7 h-7 flex items-center justify-center rounded-lg mr-1 mt-1 transition-all",
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
  requireImage = true,
}: {
  nodes: CategorieNode[];
  allProduitsFlat: { produit: ProduitInTree; catNom: string }[];
  onSelect: (id: number) => void;
  parentNode?: CategorieNode | null;
  onBack?: () => void;
  /** false (Fertivert, niveaux profonds) : affiche aussi les sous-catégories
   *  sans image, avec le repli 🌿 déjà prévu plus bas, au lieu de les
   *  masquer entièrement — sinon une sous-catégorie comme "Terreau" sans
   *  image uploadée disparaissait purement et simplement de la grille. */
  requireImage?: boolean;
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
        const visibleNodes = requireImage ? nodes.filter(node => !!node.image) : nodes;
        const n = visibleNodes.length;
        // Flexbox + justify-center plutôt que CSS Grid : une dernière ligne
        // incomplète (ex. 5 catégories sur 4 colonnes → 1 restante) reste
        // centrée au lieu de coller à gauche, quel que soit le nombre
        // d'éléments. Pour un petit nombre de cartes (≤4), on garde une
        // largeur généreuse plutôt que la largeur "4 colonnes" par défaut.
        const itemWidthClass =
          n === 1 ? "w-full max-w-sm" :
          n === 2 ? "w-full max-w-sm sm:w-[calc(50%-10px)]" :
          n === 3 ? "w-full max-w-xs sm:w-[calc(33.333%-14px)] sm:max-w-sm" :
          n === 4 ? "w-full max-w-xs sm:w-[calc(50%-10px)] sm:max-w-none lg:w-[calc(25%-15px)]" :
          "w-full max-w-xs sm:w-[calc(50%-10px)] sm:max-w-none md:w-[calc(33.333%-14px)] xl:w-[calc(25%-15px)]";
        return (
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-8">
        {visibleNodes.map((node, i) => {
          const count  = nodeCount(node);
          const imgSrc = node.image;

          return (
            <motion.button
              key={node.id_categorie}
              onClick={() => onSelect(node.id_categorie)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "group flex flex-col items-center text-center focus:outline-none",
                itemWidthClass
              )}
              aria-label={`${t("catalog.viewProducts", "Voir produits")} ${categoryLabel(node, locale)}`}
            >
              {/* Image seule, sans cadre ni fond — conserve son propre ratio */}
              <div className="relative w-full flex items-center justify-center">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={categoryLabel(node, locale)}
                    className="block max-h-56 w-auto max-w-full mx-auto object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center text-5xl opacity-15">🌿</div>
                )}
              </div>

              {/* Nom + compteur, en dessous de l'image, sans cadre */}
              <p className="mt-3 text-[15px] font-bold text-gray-900 group-hover:text-ev-700 transition-colors">
                {categoryLabel(node, locale)}
              </p>
              {count > 0 && (
                <span className="mt-0.5 text-[12px] text-gray-400 font-medium">
                  {count} {productWord(count, t)}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
        );
      })()}
    </div>
  );
}

/* ── Grandes cartes "gamme" (Fertivert Pro / Jardin) ──────────────────────
 * Inspiré du style "Deux univers, une même exigence" : chaque sous-gamme
 * (Agriculture, Gazon…) devient une grande carte plein format — photo en
 * fond (ou dégradé si pas encore d'image), titre + description en
 * surimpression, CTA "Voir produits". Toutes les sous-gammes sont
 * affichées, avec ou sans image (le dégradé sert de repli), pour que
 * "Gazon" etc. ne disparaisse pas simplement faute d'image en base. Le
 * filtrage (recherche + sidebar catégories) ne doit apparaître qu'une fois
 * sur la page produits elle-même ; cette vue de sélection de gamme n'en
 * affiche donc aucun. */
function FramelessGammeGrid({
  nodes,
  allProduitsFlat,
  onSelect,
  parentLabel,
  onBack,
}: {
  nodes: CategorieNode[];
  allProduitsFlat: { produit: ProduitInTree; catNom: string }[];
  onSelect: (id: number) => void;
  parentLabel?: string | null;
  onBack?: () => void;
}) {
  const { locale, t } = useI18n();
  function nodeCount(n: CategorieNode) {
    const ids = new Set<number>();
    function collect(node: CategorieNode) { ids.add(node.id_categorie); node.sous_cats.forEach(collect); }
    collect(n);
    return allProduitsFlat.filter(({ produit }) => ids.has(produit.id_categorie)).length;
  }

  if (nodes.length === 0) return null;

  return (
    <div className="mb-8">
      {parentLabel && onBack && (
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-ev-700 transition-colors"
        >
          <ChevronLeft size={14} /> {parentLabel}
        </button>
      )}

      <div className={cn("flex flex-col gap-6", nodes.length > 1 && "lg:flex-row")}>
        {nodes.map((node, i) => {
          const count = nodeCount(node);
          const label = categoryLabel(node, locale);
          const description = translatedField(node as any, "description", locale) || node.description;

          return (
            <motion.button
              key={node.id_categorie}
              onClick={() => onSelect(node.id_categorie)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: "easeOut" }}
              className="group relative flex-1 overflow-hidden rounded-2xl text-left shadow-sm transition-shadow duration-300 hover:shadow-xl focus:outline-none"
              aria-label={`${t("catalog.viewProducts", "Voir produits")} ${label}`}
            >
              <div className="relative w-full">
                {node.image ? (
                  // Image en taille réelle (pas de recadrage forcé) — la
                  // hauteur de la carte suit le ratio naturel de la photo.
                  <img
                    src={node.image}
                    alt={label}
                    className="block w-full h-auto transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div
                    aria-hidden
                    className="aspect-[4/3] w-full"
                    style={{ background: "linear-gradient(150deg, #235a3c 0%, #123420 100%)" }}
                  />
                )}

                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background: node.image
                      ? "linear-gradient(180deg, rgba(6,18,9,0.05) 0%, rgba(6,18,9,0.18) 45%, rgba(4,12,6,0.82) 100%)"
                      : undefined,
                  }}
                />

                {count > 0 && (
                  <span className="absolute left-5 top-5 z-10 rounded-full border border-white/40 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                    {count} {productWord(count, t)}
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col p-6 sm:p-8">
                  <h3
                    className="text-2xl font-black leading-tight text-white sm:text-3xl"
                    style={{ fontFamily: "var(--font-display)", textShadow: "0 2px 14px rgba(0,0,0,0.35)" }}
                  >
                    {label}
                  </h3>
                  {description && (
                    <p className="mt-2 max-w-md text-sm font-medium leading-snug text-white/85">
                      {description}
                    </p>
                  )}
                  <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-bold text-ev-800 shadow-lg transition-transform duration-300 group-hover:-translate-y-0.5">
                    {t("catalog.viewProducts", "Voir produits")}
                    <ChevronRight size={14} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Vue grille sous-catégories (legacy stub, replaced par CatVisualGrid) ── */
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
          avecImage.length === 2 ? "grid grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto gap-6" :
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
  cardVariant?: "default" | "seed" | "light";
  rootTabsOnly?: boolean;
  /**
   * Catégorie à présélectionner au premier chargement quand l'URL n'a pas
   * encore de paramètre `?cat=` (ex. arrivée directe sur une URL profonde
   * type /activites/fertilisation/categorie/fv-pro/fv-pro-agriculture).
   * Sans effet dès que l'utilisateur navigue (le `?cat=` de l'URL prend
   * ensuite toujours le dessus).
   */
  initialCategoryId?: number | null;
}

export function CategoryTree({ tree, cardVariant = "default", rootTabsOnly = false, initialCategoryId = null }: CategoryTreeProps) {
  const { locale, t } = useI18n();
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const catFromUrl  = searchParams.get("cat")  ? Number(searchParams.get("cat"))  : initialCategoryId ?? null;

  const [search,      setSearch]      = useState("");
  // Nombre de produits actuellement affichés dans la vue "grille produits"
  // (pagination par bouton "Afficher plus" : tous les produits déjà chargés
  // restent visibles sur la même page, au lieu de naviguer entre des pages
  // numérotées séparées).
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Fertivert (`rootTabsOnly`) : le panneau de filtres (recherche + catégories)
  // est masqué par défaut et ne s'affiche que sur la page produits elle-même,
  // une fois qu'on l'ouvre explicitement via le bouton "Filtrer".
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [openIds,     setOpenIds]     = useState<Set<number>>(() => {
    const s = new Set<number>();
    if (catFromUrl) s.add(catFromUrl);
    return s;
  });
  // Activé uniquement par le bouton "Tous les produits" : force l'affichage
  // de la grille produits (tous confondus) même quand on est au niveau
  // racine, au lieu de retomber sur la grille des cartes de catégories
  // (ex. la carte "Agriculture") qui s'affiche par défaut à ce niveau.
  const [forceAllProducts, setForceAllProducts] = useState(false);

  const navigate = useCallback((cat: number | null, page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) params.set("cat", String(cat)); else params.delete("cat");
    if (page > 1) params.set("page", String(page)); else params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  const handleSelect = useCallback((id: number) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setForceAllProducts(false);
    navigate(id, 1);
    setSidebarOpen(false);
  }, [navigate]);

  const handleToggle = useCallback((id: number) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    navigate(null, 1);
    setSearch("");
    setOpenIds(new Set());
    setForceAllProducts(false);
  }, [navigate]);

  // Bouton dédié "Tous les produits" : mêmes effets que handleReset, mais
  // reste sur la grille produits (tous confondus) plutôt que de revenir à
  // la grille des cartes de catégories.
  const handleShowAllProducts = useCallback(() => {
    navigate(null, 1);
    setSearch("");
    setOpenIds(new Set());
    setForceAllProducts(true);
    setSidebarOpen(false);
  }, [navigate]);

  useEffect(() => {
    if (catFromUrl) setOpenIds(prev => { const n = new Set(prev); n.add(catFromUrl); return n; });
  }, [catFromUrl]);

  const rootTabs = rootTabsOnly
    ? tree.categories
        .filter((cat) => countAll(cat) > 0)
        .slice(0, 2)
    : [];

  // En mode `rootTabsOnly` (Fertivert), la première gamme (Pro) est
  // sélectionnée par défaut tant que l'utilisateur n'a pas choisi
  // explicitement une catégorie via l'URL.
  const activeRootId = rootTabsOnly
    ? (catFromUrl ?? rootTabs[0]?.id_categorie ?? null)
    : catFromUrl;

  const allProduits = useMemo(() => {
    const source = activeRootId
      ? (() => { const n = findNodeC(tree.categories, activeRootId); return n ? collectProduits(n) : []; })()
      : tree.categories.flatMap(collectProduits);
    const q = search.trim().toLowerCase();
    if (!q) return source;
    return source.filter(({ produit }) =>
      `${productLabel(produit, locale)} ${productDescription(produit, locale)}`.toLowerCase().includes(q)
    );
  }, [activeRootId, search, tree, locale]);

  const totalAll = tree.categories.reduce((a, c) => a + countAll(c), 0);

  // Réinitialise le nombre de produits affichés à chaque changement de
  // catégorie ou de recherche, pour repartir du premier lot.
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [activeRootId, search]);

  const paginated = useMemo(
    () => allProduits.slice(0, visibleCount),
    [allProduits, visibleCount]
  );
  const hasMore = visibleCount < allProduits.length;
  const handleLoadMore = useCallback(() => {
    setVisibleCount(c => Math.min(c + PAGE_SIZE, allProduits.length));
  }, [allProduits.length]);

  const selectedNode = activeRootId ? findNodeC(tree.categories, activeRootId) : null;
  // Vrai uniquement quand la sélection courante EST l'un des deux onglets
  // racine (Pro / Jardin) — sert à savoir si on doit proposer un lien
  // "retour" au-dessus de la grille de sous-gammes en cas de navigation
  // plus profonde (ex. Agriculture → une sous-sous-catégorie illustrée).
  const isActiveRootTab = rootTabsOnly && !!selectedNode &&
    rootTabs.some(t => t.id_categorie === selectedNode.id_categorie);

  // ── Que faut-il afficher dans la zone principale ? ────────────────────
  const rootHasImages = tree.categories.filter(n => !!n.image).length > 0;
  const showRootGrid  = !rootTabsOnly && !catFromUrl && !search && rootHasImages && !forceAllProducts;
  const selectedSubImages = selectedNode ? selectedNode.sous_cats.filter(n => !!n.image) : [];
  // Sur Fertivert (`rootTabsOnly`) comme ailleurs : la grille de
  // sous-catégories ne s'affiche que s'il y a au moins une sous-catégorie
  // illustrée (une vraie image) — à N'IMPORTE QUEL niveau de profondeur, pas
  // seulement juste sous l'onglet Pro/Garden. Une sous-catégorie illustrée
  // (ex. "Biostimulants") continue donc de s'afficher en tuile comme avant.
  // Si AUCUNE sous-catégorie du niveau sélectionné n'a d'image (ex. "Support
  // de Culture" → Terreau/Fumier/Composte, pas encore illustrées), on saute
  // directement à la vue produits + panneau de catégories (sidebar) plutôt
  // que d'afficher des cartes vides ("0 produit") — la sidebar permet alors
  // de naviguer plus loin, comme sur les autres pages du site (Semences...).
  const showSubGrid   = !!selectedNode && selectedSubImages.length > 0 && !search && !forceAllProducts;
  const showEmpty     = !showRootGrid && !showSubGrid && allProduits.length === 0;
  // "Page produits" = on n'affiche plus une grille de gammes/sous-gammes,
  // qu'il y ait des résultats ou non (0 résultat compte aussi, pour garder
  // la recherche accessible).
  const isProductsView = !showRootGrid && !showSubGrid;
  // Le panneau de filtres (sidebar catégories + recherche) ne concerne que
  // la page produits, et — sur Fertivert (`rootTabsOnly`) — reste masqué
  // tant qu'on ne l'a pas ouvert explicitement via le bouton "Filtrer".
  const showFilterUi = !rootTabsOnly || (isProductsView && filtersOpen);
  const hideFiltersPanel = useCallback(() => {
    setFiltersOpen(false);
    setSidebarOpen(false);
  }, []);

  return (
    <div className={cn("flex gap-0 relative", showFilterUi && "min-h-[600px]")}>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar redesignée ──────────────────────────────────── */}
      {showFilterUi && <aside className={`
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
            <button onClick={rootTabsOnly ? hideFiltersPanel : () => setSidebarOpen(false)} className={cn("p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors", !rootTabsOnly && "lg:hidden")}>
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
            onClick={handleShowAllProducts}
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
      </aside>}

      {/* ── Zone principale ─────────────────────────────────────── */}
      <div className={cn("flex-1 min-w-0 flex flex-col", showFilterUi && "lg:pl-6")}>

        {/* Barre filtres */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {rootTabsOnly && rootTabs.length > 0 && (
            <div className="inline-flex overflow-hidden rounded-lg border border-ev-700 bg-white p-0.5 shadow-sm">
              {rootTabs.map((cat) => {
                const active = activeRootId === cat.id_categorie;
                return (
                  <button
                    key={cat.id_categorie}
                    onClick={() => handleSelect(cat.id_categorie)}
                    className={cn(
                      "min-w-24 px-5 py-2 text-sm font-black transition-colors",
                      active
                        ? "bg-ev-700 text-white"
                        : "text-ev-700 hover:bg-ev-50",
                    )}
                  >
                    {categoryLabel(cat, locale)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Bouton ouvrir le panneau de filtres — masqué tant qu'on n'est
              pas sur la page produits (grille de gammes/sous-gammes) ;
              sur Fertivert il reste masqué par défaut même sur la page
              produits, jusqu'à ce qu'on clique dessus. */}
          {rootTabsOnly
            ? isProductsView && !filtersOpen && (
                <button
                  onClick={() => { setFiltersOpen(true); setSidebarOpen(true); }}
                  className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-[13px] font-medium text-gray-700 hover:border-ev-400 hover:text-ev-700 transition-all shadow-sm"
                >
                  <SlidersHorizontal size={14} />
                  {t("catalog.filters", "Filtres")}
                  {catFromUrl && <span className="w-1.5 h-1.5 rounded-full bg-ev-500 ml-0.5" />}
                </button>
              )
            : <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-[13px] font-medium text-gray-700 hover:border-ev-400 hover:text-ev-700 transition-all shadow-sm"
          >
            <SlidersHorizontal size={14} />
            {t("catalog.filters", "Filtres")}
            {catFromUrl && <span className="w-1.5 h-1.5 rounded-full bg-ev-500 ml-0.5" />}
          </button>}

          {/* Badge catégorie active — masqué sur Fertivert quand la
              sélection courante est simplement l'onglet Pro/Jardin déjà
              visible (redondant avec les boutons ci-dessus). */}
          {catFromUrl && selectedNode && !isActiveRootTab && (
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
          {showFilterUi && <div className="relative flex-1 min-w-[200px] max-w-sm ml-auto">
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
          </div>}

          {/* Compteur — masqué en vue grille catégories */}
          {isProductsView && (catFromUrl || search) && (
            <span className="text-[12px] text-gray-400 font-medium whitespace-nowrap">
              <span className="text-gray-700 font-semibold">{allProduits.length}</span> {productWord(allProduits.length, t)}
              {hasMore && <span className="text-gray-400"> · {paginated.length} {t("catalog.shown", "affichés")}</span>}
            </span>
          )}
        </div>

        {/* Grille visuelle catégories racines (premier chargement) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={
              showRootGrid ? "root" :
              showSubGrid  ? `sub-${selectedNode?.id_categorie}` :
              allProduits.length === 0 ? "empty" :
              `products-${activeRootId ?? "all"}-${search}`
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
        {showRootGrid ? (
          <CatVisualGrid
            nodes={tree.categories}
            allProduitsFlat={tree.categories.flatMap(collectProduits)}
            onSelect={handleSelect}
          />
        ) : showSubGrid ? (
          /* ── Sous-catégories → grille visuelle ──
             Cartes "image + nom en dessous" (CatVisualGrid), sans grand
             cadre plein format — comme sur les autres pages du site
             (Semences...). Une sous-catégorie illustrée s'affiche donc en
             tuile à n'importe quel niveau de profondeur, pas seulement
             juste sous l'onglet Pro/Garden. `requireImage` reste à true
             (par défaut) : `showSubGrid` garantit déjà qu'au moins une
             sous-catégorie du niveau a une image, donc on masque
             seulement, comme partout ailleurs, celles qui n'en ont pas
             parmi ses sœurs illustrées. */
          <CatVisualGrid
            nodes={selectedNode!.sous_cats}
            allProduitsFlat={tree.categories.flatMap(collectProduits)}
            onSelect={handleSelect}
            parentNode={!isActiveRootTab ? selectedNode : null}
            onBack={rootTabsOnly ? () => {
              const ancestorId = topLevelAncestorId(tree.categories, selectedNode!.id_categorie);
              handleSelect(ancestorId ?? rootTabs[0]?.id_categorie ?? selectedNode!.id_categorie);
            } : handleReset}
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
            <div className={cn(
              "flex flex-wrap justify-center gap-4",
              cardVariant === "seed" && "items-start"
            )}>
              {paginated.map(({ produit, catNom }, i) => (
                <motion.div
                  key={produit.id_produit}
                  className="w-full max-w-xs sm:w-[calc(50%-8px)] sm:max-w-none lg:w-[calc(25%-12px)]"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: (i % PAGE_SIZE) * 0.035, ease: "easeOut" }}
                >
                  <ProduitCard
                    produit={toProduitCard(produit, catNom, tree)}
                    variant={cardVariant}
                  />
                </motion.div>
              ))}
            </div>
            {hasMore && (
              <div className="mt-9 flex flex-col items-center gap-2.5">
                <p className="text-[12px] text-gray-400 font-medium">
                  <span className="text-gray-600 font-semibold">{paginated.length}</span> {t("catalog.on", "sur")} {allProduits.length} {productWord(allProduits.length, t)}
                </p>
                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center gap-2 rounded-xl bg-ev-700 px-6 py-3 text-[13px] font-bold uppercase tracking-wide text-white shadow-sm transition-all duration-300 hover:bg-ev-800 hover:shadow-md hover:-translate-y-0.5"
                >
                  {t("catalog.showMore", "Afficher plus")}
                  <ChevronRight size={14} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </>
        )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
