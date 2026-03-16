// ══════════════════════════════════════════════════════════════════════════════
// PALETTE DE COULEURS — Basée sur les logos Espace Vert & Fertivert
// Mise à jour : palette pastel, extraite du logo (vert forêt #0a6030 + lime #7dc040)
// ══════════════════════════════════════════════════════════════════════════════

export const COLORS = {
  // ─── PALETTE ESPACE VERT (logo principal) ─────────────────────────────────
  espaceVert: {
    forest:      '#0a6030',   // vert foncé logo — accents forts, textes, CTA
    leaf:        '#7dc040',   // vert lime logo — highlights, badges, icônes
    sage:        '#4a9060',   // vert intermédiaire — icônes, tags
    moss:        '#2d6e45',   // vert moyen — hover states
    mint:        '#c8eccc',   // pastel vert moyen — pills, tags
    foam:        '#e6f7e8',   // fond section alternée
    cream:       '#f2faf3',   // fond principal très clair
    mist:        '#daf0dc',   // bordures, séparateurs
    white:       '#fafffe',   // blanc légèrement verdâtre
    // Legacy (compatibilité)
    darkForest:  '#0a3d1c',
    main:        '#4a9060',
    lime:        '#9ed060',
    pale:        '#e6f7e8',
    lightest:    '#f2faf3',
  },

  // ─── PALETTE FERTIVERT ────────────────────────────────────────────────────
  fertivert: {
    primary:     '#0a6030',   // vert principal Fertivert
    bright:      '#7dc040',   // vert vif
    light:       '#b8e8c0',   // vert clair pastel
    pale:        '#edfbee',   // fond très pâle
    white:       '#ffffff',
  },

  // ─── MATAR (irrigation — bleu-ciel pastel) ────────────────────────────────
  matar: {
    teal:        '#1b6b7a',
    sky:         '#4ba8d8',
    light:       '#bae6fd',
    pale:        '#eff8ff',
  },

  // ─── PULVERT (jaune-vert pastel) ──────────────────────────────────────────
  pulvert: {
    gold:        '#a08000',
    yellow:      '#d4b800',
    light:       '#f0e080',
    pale:        '#fdfbea',
  },

  // ─── NEUTRES ──────────────────────────────────────────────────────────────
  neutral: {
    white:       '#ffffff',
    gray50:      '#f9faf8',
    gray100:     '#f2f4f0',
    gray200:     '#e4e8e2',
    gray300:     '#cdd3cb',
    gray400:     '#9aa89a',
    gray500:     '#6e7c6e',
    gray600:     '#4e5c4e',
    gray700:     '#384038',
    gray800:     '#252a24',
    gray900:     '#141814',
    black:       '#000000',
  },

  // ─── ACCENTS ──────────────────────────────────────────────────────────────
  accent: {
    success:     '#4caf50',
    warning:     '#ff9800',
    error:       '#f44336',
    info:        '#2196f3',
  },
} as const;

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function gradient(from: string, to: string, direction = 'to right'): string {
  return `linear-gradient(${direction}, ${from}, ${to})`;
}

export function shadow(color: string, alpha: number = 0.15): string {
  return `0 4px 20px ${hexToRgba(color, alpha)}`;
}

// ─── THÈMES PRÉDÉFINIS ────────────────────────────────────────────────────────
export const THEMES = {
  espaceVert: {
    primary:     COLORS.espaceVert.forest,
    secondary:   COLORS.espaceVert.leaf,
    accent:      COLORS.espaceVert.mint,
    background:  COLORS.neutral.white,
    text:        COLORS.neutral.gray800,
    border:      COLORS.neutral.gray200,
  },
  fertivert: {
    primary:     COLORS.fertivert.primary,
    secondary:   COLORS.fertivert.bright,
    accent:      COLORS.fertivert.light,
    background:  COLORS.neutral.white,
    text:        COLORS.neutral.gray800,
    border:      COLORS.neutral.gray200,
  },
} as const;

export default COLORS;
