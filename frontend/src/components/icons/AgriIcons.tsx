"use client";

import type React from "react";

/**
 * AgriIcons — système d'icônes maison Espace Vert.
 *
 * Style : silhouettes monochromes en `currentColor`, un léger accent
 * "veine" en blanc (var(--ico-vein,#fff)) pour donner du relief sans
 * sortir de la charte 2 couleurs (vert marque + blanc). C'est le même
 * langage graphique que les icônes déjà présentes dans Navbar.tsx
 * (Leaf, Sprout, Droplet, Spray, Tractor…) — on l'étend ici avec de
 * nouveaux sujets inspirés des planches de référence (fermier, sac de
 * semences, bottes, tuyau d'irrigation, silo, tournesol) au lieu
 * d'importer des icônes stock multicolores qui casseraient la charte.
 *
 * Toutes les icônes acceptent les mêmes props qu'un <svg> standard
 * (className, style, width/height…) — usage identique à l'ancien `Ico`.
 */

type IcoProps = React.SVGProps<SVGSVGElement>;

export const Ico = {
  Leaf: (p: IcoProps) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M21 3c-9.4 0-17 5.4-17 15.6 0 .8.6 1.4 1.4 1.4C15.6 20 21 12.4 21 3z" />
      <path d="M4.6 19.4L15.8 8.2c.3-.3.3-.8 0-1.1-.3-.3-.8-.3-1.1 0L3.5 18.3c-.3.3-.3.8 0 1.1.3.3.8.3 1.1 0z" fill="var(--ico-vein,#fff)" opacity="0.55" />
    </svg>
  ),
  Cal: (p: IcoProps) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  Menu: (p: IcoProps) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  ),
  X: (p: IcoProps) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  ChevR: (p: IcoProps) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  ),
  Sprout: (p: IcoProps) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M11.1 21.5h1.8v-6.4c4.5-.3 8.1-4 8.1-8.6V4.9c0-.5-.4-.9-.9-.9h-1.6c-4.1 0-7.6 2.9-8.4 6.8C9.3 7.2 6.2 4.7 2.6 4.7H2c-.5 0-.9.4-.9.9v.6c0 4.4 3.4 8 7.7 8.4.1 0 .2 0 .3 0v6.9z" />
    </svg>
  ),
  Droplet: (p: IcoProps) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2C12 2 4.8 11.6 4.8 16a7.2 7.2 0 0 0 14.4 0C19.2 11.6 12 2 12 2z" />
      <ellipse cx="9.4" cy="15.2" rx="1.5" ry="2.4" fill="var(--ico-vein,#fff)" opacity="0.4" />
    </svg>
  ),
  Spray: (p: IcoProps) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M9.3 2h3.4v2.6H9.3z" />
      <path d="M8 5.2h6.6l1.7 3.4H6.3z" />
      <rect x="6" y="9.2" width="10" height="12.3" rx="2.6" />
      <circle cx="3.2" cy="4.4" r="1" />
      <circle cx="2.2" cy="8" r="0.8" />
      <circle cx="4.6" cy="7.2" r="0.6" />
    </svg>
  ),
  Tractor: (p: IcoProps) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <circle cx="6.6" cy="17.8" r="3.6" />
      <circle cx="6.6" cy="17.8" r="1.4" fill="var(--ico-vein,#fff)" opacity="0.55" />
      <circle cx="17.4" cy="17.8" r="2.6" />
      <circle cx="17.4" cy="17.8" r="1" fill="var(--ico-vein,#fff)" opacity="0.55" />
      <path d="M2.6 17.8v-8a1 1 0 0 1 1-1h4.6l2.9 3.4h5.1a2.6 2.6 0 0 1 2.6 2.6v3" />
      <path d="M8.6 8.8V5.4a1 1 0 0 1 1-1h3.4v4.4z" />
    </svg>
  ),
  GrassTuft: (p: IcoProps) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 21.5c-1.4-4-1.4-8.6 0-13 1.4 4.4 1.4 9 0 13z" />
      <path d="M7.6 21.5c-1.8-3.6-2.4-7.6-1.2-11.2 1.9 3.1 2.9 7.2 1.2 11.2z" />
      <path d="M16.4 21.5c1.8-3.6 2.4-7.6 1.2-11.2-1.9 3.1-2.9 7.2-1.2 11.2z" />
      <path d="M4.4 21.5c-1.1-2.4-1.3-4.9-.4-7.2 1.3 2 1.9 4.6.4 7.2z" />
      <path d="M19.6 21.5c1.1-2.4 1.3-4.9.4-7.2-1.3 2-1.9 4.6-.4 7.2z" />
    </svg>
  ),
  Cattail: (p: IcoProps) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M8 21.5c-1.6-5-2-10 .5-15.5 2.5 5.5 2.1 10.5.5 15.5z" opacity="0.9" />
      <ellipse cx="16" cy="7.6" rx="2.3" ry="4.3" />
      <rect x="15.2" y="11.4" width="1.6" height="10.1" rx="0.8" />
    </svg>
  ),
  Clover: (p: IcoProps) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <rect x="11.3" y="12.5" width="1.4" height="9" rx="0.7" />
      <circle cx="9.4" cy="9.6" r="3" />
      <circle cx="14.6" cy="9.6" r="3" />
      <circle cx="12" cy="6.4" r="3" />
    </svg>
  ),
  FlowerHead: (p: IcoProps) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <rect x="11.3" y="11.5" width="1.4" height="10" rx="0.7" />
      <circle cx="12" cy="4.6" r="2" />
      <circle cx="15.6" cy="6.3" r="2" />
      <circle cx="15.6" cy="10" r="2" />
      <circle cx="8.4" cy="6.3" r="2" />
      <circle cx="8.4" cy="10" r="2" />
      <circle cx="12" cy="7.8" r="2.1" opacity="0.85" />
    </svg>
  ),

  /* ── Nouvelles icônes — inspirées des planches de référence ────────── */

  /** Fermier au chapeau de paille — inspiré des mascottes "farmer" (image 1) */
  Farmer: (p: IcoProps) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2.6c-3.3 0-5.9 1.8-6.6 4.5-.2.7.3 1.4 1.1 1.4h11c.8 0 1.3-.7 1.1-1.4-.7-2.7-3.3-4.5-6.6-4.5z" />
      <circle cx="12" cy="10.4" r="3.15" fill="var(--ico-vein,#fff)" opacity="0.9" />
      <circle cx="12" cy="10.4" r="3.15" fillOpacity="0" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 21.6c.3-3.9 2.6-6.2 6-6.2s5.7 2.3 6 6.2z" />
    </svg>
  ),

  /** Sac de semences noué, pousse en germination — inspiré du sac (image 1) */
  SeedBag: (p: IcoProps) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M10.7 3.4c-.5.9-.3 1.8.5 2.5-1.7.4-2.4 1.6-1.8 3.1h5.2c.6-1.5-.1-2.7-1.8-3.1.8-.7 1-1.6.5-2.5-.5-1-2.1-1-2.6 0z" />
      <path d="M7.3 10.2h9.4c1.6 0 2.8 1.5 2.4 3.1l-1.8 6.4c-.3 1.1-1.3 1.9-2.4 1.9H9.1c-1.1 0-2.1-.8-2.4-1.9l-1.8-6.4c-.4-1.6.8-3.1 2.4-3.1z" />
      <path d="M9 13.4c1 1.6 1 3.4 0 5.5M13.4 13.4c-.5 1.9-.5 3.7 0 5.5" stroke="var(--ico-vein,#fff)" strokeWidth="1" fill="none" opacity="0.5" strokeLinecap="round" />
    </svg>
  ),

  /** Bottes de jardinage — inspiré des bottes vertes/oranges (image 1) */
  Boots: (p: IcoProps) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M6.2 2.2h3.3v8.3c1.6.3 2.7 1.5 2.7 3.1v2.2c0 .8-.6 1.4-1.4 1.4H3.5c-.8 0-1.4-.6-1.4-1.4 0-1.9 1.3-3.4 3.1-3.8V2.2z" />
      <path d="M13.7 2.2H17v8.3c1.6.3 2.7 1.5 2.7 3.1v2.2c0 .8-.6 1.4-1.4 1.4h-7.3c-.8 0-1.4-.6-1.4-1.4 0-1.9 1.3-3.4 3.1-3.8V2.2z" opacity="0.85" />
      <rect x="6.2" y="2.2" width="3.3" height="1.6" fill="var(--ico-vein,#fff)" opacity="0.6" />
      <rect x="13.7" y="2.2" width="3.3" height="1.6" fill="var(--ico-vein,#fff)" opacity="0.5" />
    </svg>
  ),

  /** Tuyau d'arrosage enroulé + lance — inspiré du tuyau enroulé (image 1) */
  HoseCoil: (p: IcoProps) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.2" cy="14.2" r="7" opacity="0.95" />
      <circle cx="10.2" cy="14.2" r="4.1" opacity="0.95" />
      <circle cx="10.2" cy="14.2" r="1.3" fill="currentColor" stroke="none" />
      <path d="M15.6 9.6 19.4 5.8" strokeWidth="2" />
      <path d="M19.4 5.8h-2.6M19.4 5.8v2.6" strokeWidth="2" />
    </svg>
  ),

  /** Silo / bâtiment agricole — inspiré du corps de ferme (image 2) */
  Barn: (p: IcoProps) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2.1 2 8.2v1.5h20V8.2z" />
      <path d="M3.3 10.5h17.4V21c0 .3-.2.5-.5.5H3.8c-.3 0-.5-.2-.5-.5z" />
      <rect x="10.3" y="14.4" width="3.4" height="7.1" fill="var(--ico-vein,#fff)" opacity="0.55" />
      <rect x="5.4" y="12.9" width="2.6" height="2.6" fill="var(--ico-vein,#fff)" opacity="0.4" />
      <rect x="16" y="12.9" width="2.6" height="2.6" fill="var(--ico-vein,#fff)" opacity="0.4" />
    </svg>
  ),

  /** Arrosoir — irrigation / entretien manuel */
  WateringCan: (p: IcoProps) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M3.4 9.6h9.4c1.1 0 1.9.9 1.9 1.9v.5l4.3-1.7c.5-.2 1.1.2 1.1.8v1.5c0 .4-.3.8-.6.9l-4.8 1.7v2.6c0 1.5-1.2 2.7-2.7 2.7H6c-1.5 0-2.7-1.2-2.7-2.7V9.6z" />
      <path d="M5.9 9.6V7.1c0-.9.7-1.6 1.6-1.6h1c.9 0 1.6.7 1.6 1.6v2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),

  /** Tournesol — inspiré des tuiles mosaïque agricoles (image 2) */
  Sunflower: (p: IcoProps) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <g opacity="0.95">
        <circle cx="12" cy="4.5" r="2.05" />
        <circle cx="17" cy="7" r="2.05" />
        <circle cx="19.5" cy="12" r="2.05" />
        <circle cx="17" cy="17" r="2.05" />
        <circle cx="12" cy="19.5" r="2.05" />
        <circle cx="7" cy="17" r="2.05" />
        <circle cx="4.5" cy="12" r="2.05" />
        <circle cx="7" cy="7" r="2.05" />
      </g>
      <circle cx="12" cy="12" r="3.3" fill="var(--ico-vein,#fff)" opacity="0.65" />
      <circle cx="12" cy="12" r="3.3" fillOpacity="0" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),

  /** Carotte — jardinage / potager */
  Carrot: (p: IcoProps) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M9.8 21.3 3 14.5c-.5-3.1 2.4-6.9 5.6-6.9 4 0 8.5 4.5 8.5 8.5 0 3.2-3.8 6.1-6.9 5.6z" transform="rotate(45 12 14)" />
      <path d="M13.3 5.4c-.5-1.2-.2-2.2.9-3M15.6 6.6c.2-1.3 1-2 2.2-2.2M12.4 7.4c-1.1-.4-2.2-.1-3 .8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  ),
};

export type IcoName = keyof typeof Ico;

/* ── GrassRow — bordure décorative en silhouette d'herbes ─────────────────
   Inspirée de la planche de touffes/silhouettes d'herbe (image 3).
   Même logique procédurale que TreePines dans Navbar.tsx : un motif de
   base répété avec de légères variations de largeur/hauteur/décalage. */
export function GrassRow({
  color = "#dbe8c7",
  h = 46,
  className = "",
}: {
  color?: string;
  h?: number;
  className?: string;
}) {
  const tufts = [
    { x: 0, w: 30, tall: 0.6 },
    { x: 22, w: 20, tall: 1 },
    { x: 40, w: 34, tall: 0.72 },
    { x: 68, w: 22, tall: 0.9 },
    { x: 86, w: 30, tall: 0.55 },
    { x: 112, w: 24, tall: 1 },
    { x: 132, w: 32, tall: 0.68 },
    { x: 160, w: 22, tall: 0.85 },
    { x: 178, w: 30, tall: 0.6 },
    { x: 204, w: 24, tall: 1 },
    { x: 224, w: 34, tall: 0.7 },
    { x: 254, w: 22, tall: 0.9 },
    { x: 272, w: 30, tall: 0.58 },
    { x: 298, w: 22, tall: 1 },
  ];
  return (
    <svg
      viewBox={`0 0 320 ${h}`}
      preserveAspectRatio="xMidYMax meet"
      className={className}
      style={{ width: "100%", height: h, display: "block" }}
      aria-hidden="true"
    >
      {tufts.map((t, i) => {
        const th = h * t.tall;
        const baseY = h;
        const cx = t.x + t.w / 2;
        return (
          <g key={i} fill={color}>
            <path
              d={`M${cx - t.w * 0.32} ${baseY} Q${cx - t.w * 0.5} ${baseY - th * 0.55} ${cx - t.w * 0.14} ${baseY - th} Q${cx - t.w * 0.18} ${baseY - th * 0.5} ${cx} ${baseY}Z`}
            />
            <path
              d={`M${cx - t.w * 0.05} ${baseY} Q${cx - t.w * 0.06} ${baseY - th * 0.7} ${cx} ${baseY - th * 1.08} Q${cx + t.w * 0.06} ${baseY - th * 0.7} ${cx + t.w * 0.05} ${baseY}Z`}
            />
            <path
              d={`M${cx + t.w * 0.14} ${baseY} Q${cx + t.w * 0.18} ${baseY - th * 0.5} ${cx + t.w * 0.14} ${baseY - th * 0.92} Q${cx + t.w * 0.5} ${baseY - th * 0.55} ${cx + t.w * 0.32} ${baseY}Z`}
            />
          </g>
        );
      })}
    </svg>
  );
}

/* ── IconMosaic — pastilles rondes en mosaïque, dégradé de verts ──────────
   Inspirée du bloc "FARM" en tuiles circulaires (image 2, à droite) :
   une grille de cercles pleins alternant les teintes de la marque, chacun
   contenant une icône du set ci-dessus. Purement décoratif (aria-hidden),
   pensé pour habiller un fond de section (hero, "Nos activités"…). */
const MOSAIC_TILES: { Icon: (p: IcoProps) => JSX.Element; bg: string }[] = [
  { Icon: Ico.Tractor, bg: "#1b5e38" },
  { Icon: Ico.Sunflower, bg: "#7dc040" },
  { Icon: Ico.SeedBag, bg: "#2e7d4f" },
  { Icon: Ico.Barn, bg: "#5bab79" },
  { Icon: Ico.Droplet, bg: "#0f693a" },
  { Icon: Ico.Leaf, bg: "#8bc541" },
  { Icon: Ico.Carrot, bg: "#2e7d4f" },
  { Icon: Ico.Sprout, bg: "#1b5e38" },
];

export function IconMosaic({
  cols = 4,
  rows = 2,
  tile = 64,
  gap = 10,
  className = "",
}: {
  cols?: number;
  rows?: number;
  tile?: number;
  gap?: number;
  className?: string;
}) {
  const cells = Array.from({ length: cols * rows }, (_, i) => MOSAIC_TILES[i % MOSAIC_TILES.length]);
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${tile}px)`,
        gap,
      }}
    >
      {cells.map((c, i) => {
        const Icon = c.Icon;
        return (
          <div
            key={i}
            style={{
              width: tile,
              height: tile,
              borderRadius: "9999px",
              background: c.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <Icon style={{ width: tile * 0.42, height: tile * 0.42 }} />
          </div>
        );
      })}
    </div>
  );
}