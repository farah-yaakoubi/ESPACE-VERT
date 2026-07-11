"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutGrid, Scissors, Zap, Flame, Sprout, Droplets, Package,
  ChevronDown, ArrowRight, Wrench, Hammer, Fan, Fuel,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getProductHref } from "@/lib/product-url";
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
          <span className="truncate">{labelOf(node, locale)}</span>
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
        <div className={cn("overflow-hidden transition-all", isOpen ? "max-h-[600px]" : "max-h-0")}>
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

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3.5 border-b border-gray-100" style={{ backgroundColor: INK }}>
          <h2 className="text-[15px] font-extrabold text-white">
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

/** Tuiles à ne jamais afficher dans la grille de catégories (Jardinage &
 *  Machinisme) — restent navigables via la sidebar, simplement masquées
 *  de la grille visuelle sur demande. */
const HIDDEN_GRID_TILES = ["tondeuse", "motocul"];

function isHiddenTile(name: string) {
  const n = normalizeText(name);
  return HIDDEN_GRID_TILES.some((needle) => n.includes(needle));
}

export function JardinageCategoryCard({
  node, onSelect, marqueLogoById, marqueLogoByKey,
}: {
  node: CatNode;
  onSelect: (id: number) => void;
  marqueLogoById?: Map<number, string | null | undefined>;
  marqueLogoByKey?: Map<string, string | null | undefined>;
}) {
  const { locale, t } = useI18n();
  const { Icon, color } = pictoFor(node.nom);
  const isBrandCard = node.slug.startsWith("jm-");
  const normKey = (s: string) => normalizeText(s).replace(/[^a-z0-9]/g, "");
  const brandLogo =
    marqueLogoById?.get((node as any).id_marque) ??
    marqueLogoByKey?.get(normKey(node.nom)) ??
    marqueLogoByKey?.get(normKey(node.slug.replace(/^jm-/, ""))) ??
    node.image;

  if (isBrandCard) {
    return (
      <button
        onClick={() => onSelect(node.id_categorie)}
        className="group flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = RED)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
      >
        <span className="relative mx-auto flex h-10 w-full max-w-[140px] items-center justify-center overflow-hidden">
          {brandLogo ? (
            <Image
              src={brandLogo}
              alt={labelOf(node, locale)}
              fill
              className="object-contain"
              sizes="140px"
            />
          ) : (
            <Icon size={28} strokeWidth={1.8} style={{ color }} />
          )}
        </span>
        <p className="text-[14.5px] font-bold text-gray-900 text-center leading-snug">
          {labelOf(node, locale)}
        </p>
      </button>
    );
  }

  return (
    <button
      onClick={() => onSelect(node.id_categorie)}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative flex h-36 w-full items-center justify-center bg-gray-50">
        {node.image ? (
          <Image
            src={node.image}
            alt={labelOf(node, locale)}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width:640px) 50vw, (max-width:1280px) 25vw, 20vw"
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

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[14.5px] font-bold text-gray-900 leading-snug">
          {labelOf(node, locale)}
        </p>

        <span
          className="mt-3 inline-flex w-fit items-center gap-1 text-[12px] font-bold uppercase tracking-wide transition-colors"
          style={{ color: RED }}
        >
          {t("catalog.viewProducts", "Voir les produits")}
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}

export function JardinageCategoryGrid({
  nodes, onSelect, marqueLogoById, marqueLogoByKey, wide = false, centered = false,
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
}) {
  const visibleNodes = nodes.filter((node) => !isHiddenTile(node.nom));
  if (visibleNodes.length === 0) return null;

  if (centered) {
    const n = visibleNodes.length;
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
            />
          ))}
        </div>
        {/* Bureau (lg+) : toutes les marques sur une seule ligne, colonnes
         * égales — le nombre de colonnes s'adapte au nombre de marques, donc
         * ça ne saute jamais à la ligne, quel que soit le nombre de marques. */}
        <div
          className="hidden lg:grid gap-6"
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
        >
          {visibleNodes.map((node) => (
            <JardinageCategoryCard
              key={node.id_categorie}
              node={node}
              onSelect={onSelect}
              marqueLogoById={marqueLogoById}
              marqueLogoByKey={marqueLogoByKey}
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-5 md:gap-6",
        wide
          ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
          : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
      )}
    >
      {visibleNodes.map((node) => (
        <JardinageCategoryCard
          key={node.id_categorie}
          node={node}
          onSelect={onSelect}
          marqueLogoById={marqueLogoById}
          marqueLogoByKey={marqueLogoByKey}
        />
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
      <div className="flex flex-1 flex-col p-4">
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
            className="inline-flex items-center gap-1.5 text-[12.5px] font-extrabold uppercase tracking-wide transition-colors"
            style={{ color: RED }}
          >
            {t("catalog.viewProduct", "Voir détails")}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
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
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
      {produits.map((p) => (
        <JardinageProductCard key={p.id_produit} produit={p} />
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