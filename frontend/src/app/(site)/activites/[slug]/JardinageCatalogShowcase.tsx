"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutGrid, Scissors, Zap, Flame, Sprout, Droplets, Package,
  ChevronDown, ArrowRight, Wrench, Hammer, Fan, Fuel,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getProductHref } from "@/lib/product-url";
import { ProduitCard } from "@/components/cards/ProduitCard";
import type { CatNode } from "@/components/catalogue/FilterPanel";
import type { ProduitCard as ProduitCardType } from "@/types/api";
import { useI18n } from "@/i18n/I18nProvider";
import { translatedField } from "@/i18n/translated-field";
import type { Locale } from "@/i18n/config";

/**
 * Image de fond "filigrane" derrière la grille de catégories (cf. maquette
 * de référence — cartes blanches flottant sur une photo assombrie).
 * ➜ Pour changer l'image : remplace simplement le fichier
 *   `public/images/activites/watermark-panorama.webp` par la tienne
 *   (même nom), ou modifie le chemin ci-dessous.
 */
const WATERMARK_SRC = "/images/activites/watermark-panorama.webp";

/** Rouge / anthracite figés — volontairement hors palette `ev-*` pour ne
 *  jamais être écrasés par une future évolution du thème `.theme-machinisme`. */
const RED       = "#e30613";
const RED_DARK  = "#b3050f";
const INK       = "#0c0c0e";
const RED_SOFT  = "#fdeced";

/** Déclenche un état "révélé" la première fois que l'élément entre dans le
 *  viewport — utilisé pour animer en douceur (fade + léger slide-up) les
 *  textes des cartes (titres, noms de marque, CTA) au fil du scroll plutôt
 *  que de les afficher d'un coup. */
function useRevealOnView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;

    // Respecte les préférences d'accessibilité : pas d'animation si
    // l'utilisateur a demandé de réduire les mouvements.
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView]);

  return { ref, inView };
}

/** Classes utilitaires appliquées aux blocs de texte pour un fondu + léger
 *  glissement vers le haut, fluide (600ms, ease-out). */
function textRevealClass(inView: boolean) {
  return cn(
    "transition-all duration-[600ms] ease-out",
    inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
  );
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function tagsToArray(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags as string[];
  if (typeof tags === "string" && tags.trim()) {
    return tags.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

/** Icône ET couleur associées à un nom de catégorie — utilisées à la fois
 *  pour la sidebar et pour le pictogramme de secours des cartes (quand
 *  aucune image n'a été uploadée côté back-office). Le mapping est large
 *  volontairement pour qu'aucune catégorie ne retombe sur l'icône grille
 *  générique. */
function pictoFor(name: string): { Icon: typeof LayoutGrid; color: string } {
  const n = normalizeText(name);

  if (n.includes("tond")) return { Icon: Scissors, color: "#2f9e44" };
  if (n.includes("coupant") || n.includes("taille") || n.includes("haie") || n.includes("coupe") || n.includes("bordure") || n.includes("secateur") || n.includes("sécateur"))
    return { Icon: Scissors, color: "#e8590c" };
  if (n.includes("tronçon") || n.includes("troncon") || n.includes("thermique"))
    return { Icon: Flame, color: "#e03131" };
  if (n.includes("motocul") || n.includes("motobineuse") || n.includes("tiller"))
    return { Icon: Sprout, color: "#5c940d" };
  if (n.includes("arrosage") || n.includes("irrigation"))
    return { Icon: Droplets, color: "#1971c2" };
  if (n.includes("pression") || n.includes("nettoyeur"))
    return { Icon: Droplets, color: "#0c8599" };
  if (n.includes("souffleur"))
    return { Icon: Fan, color: "#2b8a3e" };
  if (n.includes("generateur") || n.includes("électrogene") || n.includes("electrogene") || n.includes("groupe"))
    return { Icon: Fuel, color: "#f08c00" };
  if (n.includes("multi") || n.includes("polyvalent"))
    return { Icon: Wrench, color: "#5f3dc4" };
  if (n.includes("traditionnel") || n.includes("manuel"))
    return { Icon: Hammer, color: "#795548" };
  if (n.includes("electr") || n.includes("électr") || n.includes("outillage"))
    return { Icon: Zap, color: "#f59f00" };
  if (n.includes("accessoire"))
    return { Icon: Package, color: "#495057" };

  return { Icon: LayoutGrid, color: RED };
}

/** Conservé pour compat (sidebar) — retourne uniquement l'icône. */
function iconFor(name: string) {
  return pictoFor(name).Icon;
}

function labelOf(item: { nom: string; translations?: any }, locale: Locale) {
  return translatedField(item as any, "nom", locale) || item.nom;
}

/* ══════════════════════ Sidebar ══════════════════════════════════════════ */

function SidebarRow({
  node, depth, activeId, openSet, locale, onSelect, onToggle,
}: {
  node: CatNode;
  depth: number;
  activeId: number | null;
  openSet: Set<number>;
  locale: Locale;
  onSelect: (id: number) => void;
  onToggle: (id: number) => void;
}) {
  const hasKids = (node.children ?? []).length > 0;
  const isOpen = openSet.has(node.id_categorie);
  const isActive = activeId === node.id_categorie;
  const Icon = iconFor(node.nom);

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 rounded-lg transition-colors",
          isActive ? "" : "hover:bg-[--jm-soft]",
        )}
        style={{
          ["--jm-soft" as any]: RED_SOFT,
          backgroundColor: isActive ? RED_SOFT : undefined,
        }}
      >
        <button
          onClick={() => onSelect(node.id_categorie)}
          className={cn(
            "flex-1 flex items-center gap-2.5 text-left px-2.5 py-2.5 text-[13.5px] font-medium truncate",
            depth > 0 && "pl-6 text-[12.5px]",
          )}
          style={{ color: isActive ? INK : "#374151" }}
        >
          {depth === 0 && (
            <Icon size={16} strokeWidth={2} style={{ color: isActive ? RED : "#6b7280" }} className="shrink-0" />
          )}
          <span className={cn("truncate transition-colors duration-300")}>{labelOf(node, locale)}</span>
        </button>
        {hasKids && (
          <button
            onClick={() => onToggle(node.id_categorie)}
            className="shrink-0 w-7 h-7 mr-1 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100"
          >
            <ChevronDown size={13} className={cn("transition-transform", isOpen && "rotate-180")} />
          </button>
        )}
      </div>
      {hasKids && (
        <div className={cn("overflow-hidden transition-all duration-300 ease-out", isOpen ? "max-h-[600px]" : "max-h-0")}>
          {(node.children ?? []).map((child) => (
            <SidebarRow
              key={child.id_categorie}
              node={child}
              depth={depth + 1}
              activeId={activeId}
              openSet={openSet}
              locale={locale}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function JardinageSidebar({
  tree, activeId, onSelect, onReset, allHref,
}: {
  tree: CatNode[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onReset: () => void;
  allHref?: string;
}) {
  const { locale, t } = useI18n();
  const [openSet, setOpenSet] = useState<Set<number>>(new Set());
  const toggle = (id: number) =>
    setOpenSet((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const { ref: headingRef, inView: headingInView } = useRevealOnView<HTMLHeadingElement>();

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3.5 border-b border-gray-100" style={{ backgroundColor: INK }}>
          <h2 ref={headingRef} className={cn("text-[15px] font-extrabold text-white", textRevealClass(headingInView))}>
            {t("catalog.categories", "Catégories")}
          </h2>
        </div>

        <div className="p-2">
          <button
            onClick={onReset}
            className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[13.5px] font-semibold"
            style={{ color: activeId === null ? INK : "#374151", backgroundColor: activeId === null ? RED_SOFT : undefined }}
          >
            <LayoutGrid size={16} strokeWidth={2} style={{ color: activeId === null ? RED : "#6b7280" }} />
            {t("catalog.categories", "Catégories")}
          </button>

          {tree.map((node) => (
            <SidebarRow
              key={node.id_categorie}
              node={node}
              depth={0}
              activeId={activeId}
              openSet={openSet}
              locale={locale}
              onSelect={onSelect}
              onToggle={toggle}
            />
          ))}
        </div>

        <div className="p-3 pt-1">
          {allHref ? (
            <Link
              href={allHref}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-white transition-colors"
              style={{ backgroundColor: RED }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = RED_DARK)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = RED)}
            >
              {t("catalog.viewAll", "Voir tout")}
              <ArrowRight size={14} />
            </Link>
          ) : (
            <button
              onClick={onReset}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-white transition-colors"
              style={{ backgroundColor: RED }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = RED_DARK)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = RED)}
            >
              {t("catalog.viewAll", "Voir tout")}
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

/* ══════════════════════ Grille de catégories ═════════════════════════════ */

export function JardinageCategoryCard({
  node, onSelect, marqueLogoById, marqueLogoByKey, forceBrandCard = false, selectedId = null,
}: {
  node: CatNode;
  onSelect: (id: number) => void;
  marqueLogoById?: Map<number, string | null | undefined>;
  marqueLogoByKey?: Map<string, string | null | undefined>;
  /** Force le rendu "carte marque" (logo seul) même si le slug de la
   *  catégorie n'a pas le préfixe `jm-` en base — utilisé dans les grilles
   *  qui n'affichent que des marques (ex. "Parcourir par marques"), pour
   *  ne pas dépendre d'un tag cohérent côté données. */
  forceBrandCard?: boolean;
  /** Id de la marque actuellement sélectionnée (catalogue ouvert). Quand
   *  renseigné : la tuile correspondante est mise en avant (zoom), les
   *  autres sont grisées et reprennent leur aspect normal au survol. */
  selectedId?: number | null;
}) {
  const { locale, t } = useI18n();
  const { Icon, color } = pictoFor(node.nom);
  const isBrandCard = forceBrandCard || ((node.slug ?? "").startsWith("jm-") && !node.parent_id);
  const normKey = (s: string) => normalizeText(s).replace(/[^a-z0-9]/g, "");
  // Dernier recours : si aucune clé exacte ne matche (le nom en base peut
  // être formulé différemment, ex. "Wolf Outils" au lieu de "Outils Wolf"),
  // on cherche un override statique dont la clé est contenue dans le nom
  // normalisé de la catégorie.
  const overrideBySubstring = (key: string): string | null => {
    if (!marqueLogoByKey) return null;
    for (const [k, v] of marqueLogoByKey.entries()) {
      if (v && key.includes(k) && k.length >= 3) return v;
    }
    return null;
  };
  // Priorité : override statique connu (nom ou slug) > logo BDD (par id_marque)
  // > logo BDD (par nom/slug normalisé) > image de la catégorie. Les
  // overrides passent en premier volontairement : certaines marques ont en
  // base une image mal cadrée/trop grande (bannière au lieu du logo), donc
  // on ne veut pas que la BDD masque le fichier statique correct connu.
  const brandLogo =
    marqueLogoByKey?.get(normKey(node.nom)) ??
    marqueLogoByKey?.get(normKey((node.slug ?? "").replace(/^jm-/, ""))) ??
    marqueLogoById?.get((node as any).id_marque) ??
    overrideBySubstring(normKey(node.nom)) ??
    node.image;
  const { ref: textRef, inView: textInView } = useRevealOnView<HTMLParagraphElement>();
  // Certains logos référencés en base pointent vers un fichier manquant ou
  // une URL cassée — plutôt que d'afficher l'icône "image cassée" du
  // navigateur, on bascule sur le picto de secours dès que le chargement
  // échoue.
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = !!brandLogo && !logoFailed;
  // Etat de sélection (grille "Parcourir par marques") : la marque active
  // ressort en zoom, les autres passent en gris et repassent en couleur
  // normale au survol — sans que la grille ne disparaisse pour autant.
  const isSelected = selectedId != null && node.id_categorie === selectedId;
  const isDimmed   = selectedId != null && !isSelected;

  if (isBrandCard) {
    // Avec un vrai logo : la tuile reste minimaliste (juste le logo, comme
    // sur la maquette de référence — le wordmark de la marque suffit).
    if (showLogo) {
      return (
        <button
          onClick={() => onSelect(node.id_categorie)}
          className={cn(
            "group flex w-full items-center justify-center px-2 py-4 transition-all duration-300",
            isSelected ? "scale-110" : isDimmed ? "scale-95 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-100" : "hover:-translate-y-1"
          )}
        >
          <span className="relative mx-auto flex h-16 w-full max-w-[172px] items-center justify-center overflow-hidden">
            <Image
              src={brandLogo as string}
              alt={labelOf(node, locale)}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-[1.06]"
              sizes="172px"
              onError={() => setLogoFailed(true)}
            />
          </span>
        </button>
      );
    }

    // Sans logo disponible (champ vide en base ou image cassée) : on
    // retombe sur le picto générique, mais on affiche quand même le nom de
    // la marque et un CTA — sinon la tuile n'est qu'une icône muette sans
    // aucune indication de la marque qu'elle représente.
    return (
      <button
        onClick={() => onSelect(node.id_categorie)}
        className="group flex w-full flex-col items-center text-center focus:outline-none"
      >
        <div className="relative flex h-16 w-full items-center justify-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundColor: `${color}17` }}
          >
            <Icon size={28} strokeWidth={1.8} style={{ color }} />
          </div>
        </div>

        <div ref={textRef as any} className={cn("flex flex-1 flex-col items-center", textRevealClass(textInView))}>
          <p
            className="mt-3 text-[1rem] font-semibold leading-snug text-[#1b2118] transition-colors group-hover:text-ev-700"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {labelOf(node, locale)}
          </p>

          <span className="mt-3 inline-flex items-center gap-2 rounded-xl bg-ev-700 px-4 py-2 text-[11.5px] font-bold uppercase tracking-wide text-white shadow-sm transition-all duration-300 group-hover:bg-ev-800 group-hover:shadow-md group-hover:-translate-y-0.5">
            {t("catalog.viewProducts", "Voir produits")}
            <ArrowRight size={13} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => onSelect(node.id_categorie)}
      className="group flex w-full flex-col items-center text-center focus:outline-none"
    >
      <div className="relative flex h-44 w-full items-center justify-center">
        {node.image && !logoFailed ? (
          <Image
            src={node.image}
            alt={labelOf(node, locale)}
            fill
            className="object-contain transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.06]"
            sizes="(max-width:640px) 50vw, (max-width:1280px) 25vw, 20vw"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <div
            className="flex h-20 w-20 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundColor: `${color}17` }}
          >
            <Icon size={34} strokeWidth={1.8} style={{ color }} />
          </div>
        )}
      </div>

      <div ref={textRef as any} className={cn("flex flex-1 flex-col items-center", textRevealClass(textInView))}>
        <p
          className="mt-4 text-[1.05rem] font-semibold leading-snug text-[#1b2118] transition-colors group-hover:text-ev-700"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {labelOf(node, locale)}
        </p>

        <span
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ev-700 px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide text-white shadow-sm transition-all duration-300 group-hover:bg-ev-800 group-hover:shadow-md group-hover:-translate-y-0.5"
        >
          {t("catalog.viewProducts", "Voir les produits")}
          <ArrowRight size={14} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </button>
  );
}

export function JardinageCategoryGrid({
  nodes, onSelect, marqueLogoById, marqueLogoByKey, wide = false, centered = false, selectedId = null,
  requireImage = false,
}: {
  nodes: CatNode[];
  onSelect: (id: number) => void;
  marqueLogoById?: Map<number, string | null | undefined>;
  marqueLogoByKey?: Map<string, string | null | undefined>;
  /** Grille pleine largeur (6 col.) — utilisée quand aucune sidebar n'accompagne la grille. */
  wide?: boolean;
  /** Tuiles centrées (flex-wrap) au lieu d'une grille stricte — évite qu'une
   *  dernière ligne incomplète (ex. 7 marques = 6 + 1) reste collée à gauche. */
  centered?: boolean;
  /** Id de la marque sélectionnée à mettre en avant (zoom), les autres
   *  tuiles étant grisées jusqu'au survol. */
  selectedId?: number | null;
  /** N'affiche que les catégories illustrées (image en base) — masque celles
   *  sans image au lieu de retomber sur le pictogramme générique. Utilisé
   *  pour la grille de sous-catégories (ex. "hybride" sous "semences
   *  maraîchères") ; laissé à `false` pour les grilles de marques, dont le
   *  logo peut provenir de `marqueLogoById`/`marqueLogoByKey` même sans
   *  `node.image`. */
  requireImage?: boolean;
}) {
  const visibleNodes = requireImage ? (nodes ?? []).filter((n) => !!n.image) : (nodes ?? []);
  if (visibleNodes.length === 0) return null;

  if (centered) {
    return (
      <>
        {/* Mobile / tablette : grille classique qui s'enroule normalement */}
        <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 md:gap-6">
          {visibleNodes.map((node) => (
            <JardinageCategoryCard
              key={node.id_categorie}
              node={node}
              onSelect={onSelect}
              marqueLogoById={marqueLogoById}
              marqueLogoByKey={marqueLogoByKey}
              forceBrandCard
              selectedId={selectedId}
            />
          ))}
        </div>
        {/* Bureau (lg+) : toutes les marques sur une seule ligne, colonnes
         * égales. `auto-fit` + `minmax(140px, 1fr)` en pur CSS (pas de style
         * inline dépendant d'un `n` calculé en JS) : chaque colonne a une
         * largeur minimale garantie non nulle, ce qui évite que Next/Image
         * tente de charger le logo dans un conteneur à 0px de large (cause
         * du bug précédent : `min-w-0` en flexbox pouvait temporairement
         * ramener la largeur à 0 et faire échouer le chargement de l'image,
         * déclenchant à tort le repli sur le picto générique). */}
        <div className="hidden lg:grid gap-6 justify-center" style={{ gridTemplateColumns: `repeat(${visibleNodes.length}, minmax(140px, 200px))` }}>
          {visibleNodes.map((node) => (
            <JardinageCategoryCard
              key={node.id_categorie}
              node={node}
              onSelect={onSelect}
              marqueLogoById={marqueLogoById}
              marqueLogoByKey={marqueLogoByKey}
              forceBrandCard
              selectedId={selectedId}
            />
          ))}
        </div>
      </>
    );
  }

  // Flexbox + justify-center plutôt que CSS Grid : quand la dernière ligne
  // n'est pas complète (ex. 6 catégories en grille 4 colonnes → 2 restantes),
  // le Grid les collait à gauche. Le Flexbox centre chaque ligne, y compris
  // la dernière, quel que soit le nombre d'éléments.
  return (
    <div className="flex flex-wrap justify-center gap-5">
      {visibleNodes.map((node) => (
        <div
          key={node.id_categorie}
          className={cn(
            wide
              ? "w-[calc(50%-10px)] sm:w-[calc(33.333%-14px)] md:w-[calc(25%-15px)] lg:w-[calc(16.666%-16.666px)]"
              : "w-[calc(50%-10px)] lg:w-[calc(25%-15px)]"
          )}
        >
          <JardinageCategoryCard
            node={node}
            onSelect={onSelect}
            marqueLogoById={marqueLogoById}
            marqueLogoByKey={marqueLogoByKey}
          />
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════ Grille de produits (style "Explore All Vehicles") ═ */

export function JardinageProductCard({
  produit,
}: {
  produit: ProduitCardType;
}) {
  const { locale, t } = useI18n();
  const img = produit.images?.[0];
  const { Icon, color } = pictoFor(produit.nom);
  const nom = translatedField(produit as any, "nom", locale) || produit.nom;
  const marqueNom = produit.marque
    ? translatedField(produit.marque as any, "nom", locale) || produit.marque.nom
    : null;
  const { ref: textRef, inView: textInView } = useRevealOnView<HTMLDivElement>();

  return (
    <Link
      href={getProductHref(produit)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_rgba(15,15,20,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(0,0,0,0.12)]"
    >
      {/* ── Image — taille naturelle, sans recadrage forcé ─────────────── */}
      <div className="relative w-full overflow-hidden" style={{ backgroundColor: "#f4f4f4" }}>
        {img ? (
          <Image
            src={img.url}
            alt={img.alt ?? nom}
            width={800}
            height={800}
            className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
            style={{ height: "auto" }}
            sizes="(max-width:640px) 50vw, (max-width:1280px) 25vw, 20vw"
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundColor: `${color}17` }}
            >
              <Icon size={44} strokeWidth={1.6} style={{ color }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Contenu ─────────────────────────────────────────────────── */}
      <div ref={textRef} className={cn("flex flex-1 flex-col p-4", textRevealClass(textInView))}>
        <p className="text-[15px] font-extrabold text-gray-900 leading-snug line-clamp-2">
          {nom}
        </p>

        {/* Marque en évidence */}
        {marqueNom && (
          <p
            className="mt-1.5 text-[15px] font-black uppercase tracking-wide"
            style={{ color: RED }}
          >
            {marqueNom}
          </p>
        )}

        {/* CTA */}
        <div className="mt-4 flex items-center border-t border-gray-100 pt-3">
          <span
            className="inline-flex items-center gap-1.5 text-[12.5px] font-extrabold uppercase tracking-wide transition-colors duration-300"
            style={{ color: RED }}
          >
            {t("catalog.viewProduct", "Voir détails")}
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function JardinageProductGrid({
  produits,
}: {
  produits: ProduitCardType[];
}) {
  if (produits.length === 0) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {produits.map((p) => (
        <ProduitCard key={p.id_produit} produit={p} />
      ))}
    </div>
  );
}

/* ══════════════════════ Panneau filigrane ═══════════════════════════════
   Fond photo assombri derrière les cartes catégories, comme sur la
   maquette de référence ("HOT PRODUCTS"). Les cartes blanches flottent
   par-dessus grâce au z-index. */
export function JardinageWatermarkPanel({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-xl">
      <Image
        src={WATERMARK_SRC}
        alt=""
        fill
        priority={false}
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/85" />
      <div className="relative z-10 p-4 sm:p-6">{children}</div>
    </div>
  );
}