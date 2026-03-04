// ══════════════════════════════════════════════════════════════════════════════
// PALETTE DE COULEURS — Basée sur les logos Espace Vert & Fertivert
// ══════════════════════════════════════════════════════════════════════════════

export const COLORS = {
  // ─── PALETTE ESPACE VERT (logo principal) ─────────────────────────────────
  espaceVert: {
    // Verts extraits du logo
    darkForest: '#1a5035',   // Vert très foncé (partie foncée des feuilles)
    forest: '#237547',        // Vert forêt (fond du logo)
    main: '#2d8659',          // Vert principal
    leaf: '#8bc34a',          // Vert clair des feuilles
    lime: '#a3d977',          // Vert citron clair
    pale: '#e8f5e9',          // Vert très pâle
    lightest: '#f1f8f4',      // Quasi-blanc verdâtre
  },

  // ─── PALETTE FERTIVERT (logo produit) ────────────────────────────────────
  fertivert: {
    // Verts du logo Fertivert
    primary: '#37b648',       // Vert principal Fertivert
    bright: '#4caf50',        // Vert vif
    light: '#81c784',         // Vert clair
    pale: '#e8f5e9',          // Vert pâle
    white: '#ffffff',         // Blanc pour contraste
  },

  // ─── NEUTRES ──────────────────────────────────────────────────────────────
  neutral: {
    white: '#ffffff',
    gray50: '#f8faf9',
    gray100: '#f0f4f2',
    gray200: '#e5e9e7',
    gray300: '#d1d5d3',
    gray400: '#9ca3a0',
    gray500: '#6b716e',
    gray600: '#4a4f4d',
    gray700: '#374139',
    gray800: '#2d322f',
    gray900: '#1a1d1b',
    black: '#000000',
  },

  // ─── ACCENTS ──────────────────────────────────────────────────────────────
  accent: {
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
  },
} as const;

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

/**
 * Convertit une couleur hex en rgba
 * @param hex - Couleur hexadécimale (ex: '#37b648')
 * @param alpha - Opacité entre 0 et 1
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Génère un dégradé entre deux couleurs
 */
export function gradient(from: string, to: string, direction = 'to right'): string {
  return `linear-gradient(${direction}, ${from}, ${to})`;
}

/**
 * Génère une ombre avec la couleur spécifiée
 */
export function shadow(color: string, alpha: number = 0.15): string {
  return `0 4px 20px ${hexToRgba(color, alpha)}`;
}

// ─── THÈMES PRÉDÉFINIS ────────────────────────────────────────────────────────

export const THEMES = {
  espaceVert: {
    primary: COLORS.espaceVert.forest,
    secondary: COLORS.espaceVert.leaf,
    accent: COLORS.espaceVert.lime,
    background: COLORS.neutral.white,
    text: COLORS.neutral.gray800,
    border: COLORS.neutral.gray200,
  },
  fertivert: {
    primary: COLORS.fertivert.primary,
    secondary: COLORS.fertivert.bright,
    accent: COLORS.fertivert.light,
    background: COLORS.neutral.white,
    text: COLORS.neutral.gray800,
    border: COLORS.neutral.gray200,
  },
} as const;

// ─── EXPORT PAR DÉFAUT ────────────────────────────────────────────────────────
export default COLORS;