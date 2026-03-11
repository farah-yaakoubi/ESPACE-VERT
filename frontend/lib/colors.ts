// ══════════════════════════════════════════════════════════════════════════════
// ESPACE VERT — Palette Pastel Professionnelle
// Couleurs extraites pixel par pixel du logo :
//   #0F692D → vert foncé (rectangle fond logo, couleur dominante)
//   #8CC542 → vert vif   (feuille logo)
// Principe : même teinte + mélange blanc = pastel ergonomique
// ══════════════════════════════════════════════════════════════════════════════

export const COLORS = {

  // ─── VERT LOGO FONCÉ — échelle pastel (#0F692D + blanc) ─────────────────────
  greenLogo: {
    900: '#0F692D',   // vert pur rectangle logo — boutons CTA, navbar
    800: '#277842',   // +10% blanc — hover bouton, hover navbar
    700: '#4B8E61',   // +25% blanc — accents texte
    600: '#6FA581',   // +40% blanc — bordures visibles
    500: '#93BBA0',   // +55% blanc — bordures douces
    400: '#B7D2C0',   // +70% blanc — fond section alternée
    300: '#D6E5DB',   // +83% blanc — fond section douce
    200: '#E9F1EC',   // +91% blanc — fond carte pastel
    100: '#F5F9F6',   // +96% blanc — fond page
     50: '#FBFCFB',   // +98.5% blanc — fond body quasi-blanc
  },

  // ─── VERT LOGO VIF — échelle pastel (#8CC542 + blanc) ───────────────────────
  greenLeaf: {
    700: '#8CC542',   // vert vif pur feuille logo — badges, tags actifs
    600: '#A3D067',   // +20% blanc — hover badge
    500: '#BADC8D',   // +40% blanc — tags secondaires
    400: '#D1E7B3',   // +60% blanc — fond badge
    300: '#E2F0CF',   // +75% blanc — fond tag pâle
    200: '#F0F7E6',   // +87% blanc — fond section accent
    100: '#F8FBF3',   // +94% blanc — fond ghost
  },

  // ─── ALIASES SÉMANTIQUES ─────────────────────────────────────────────────────
  bg: {
    body:      '#FBFCFB',
    page:      '#F5F9F6',
    section:   '#E9F1EC',
    section2:  '#D6E5DB',
    card:      '#FFFFFF',
    cardSoft:  '#F5F9F6',
    input:     '#F5F9F6',
    badge:     '#D1E7B3',
    highlight: '#E2F0CF',
  },

  nav: {
    bg:     '#0F692D',   // = rectangle logo
    hover:  '#277842',
    active: '#0A5124',
    text:   '#FFFFFF',
    sub:    '#D6E5DB',
  },

  text: {
    main:        '#162E1E',
    secondary:   '#3A5E47',
    muted:       '#6B8E78',
    placeholder: '#93BBA0',
    onGreen:     '#FFFFFF',
    link:        '#0F692D',
    linkHover:   '#277842',
  },

  border: {
    light:  '#D6E5DB',
    mid:    '#B7D2C0',
    strong: '#8CC542',
    focus:  '#0F692D',
  },

  button: {
    primaryBg:        '#0F692D',
    primaryHover:     '#277842',
    primaryText:      '#FFFFFF',
    secondaryBg:      '#E9F1EC',
    secondaryBorder:  '#8CC542',
    secondaryText:    '#0F692D',
    secondaryHover:   '#D1E7B3',
  },

  // ─── MARQUES ─────────────────────────────────────────────────────────────────
  fertivert: {
    dark:    '#0F692D',
    main:    '#277842',
    light:   '#8CC542',
    pale:    '#D1E7B3',
    bg:      '#F0F7E6',
    // legacy
    primary: '#8CC542',
    bright:  '#277842',
    white:   '#ffffff',
  },

  pulvert: {
    dark:    '#0A5240',
    main:    '#167A5E',
    light:   '#4DB896',
    pale:    '#CCF0E4',
    bg:      '#EDF9F4',
  },

  matar: {
    dark:    '#1A4A9E',
    main:    '#2E6AD4',
    light:   '#82AFFF',
    pale:    '#D8E8FF',
    bg:      '#EEF4FF',
  },

  // ─── NEUTRES ─────────────────────────────────────────────────────────────────
  neutral: {
    white:   '#ffffff',
    gray50:  '#FBFCFB',
    gray100: '#F5F9F6',
    gray200: '#E9F1EC',
    gray300: '#D6E5DB',
    gray400: '#93BBA0',
    gray500: '#6B8E78',
    gray600: '#4B6655',
    gray700: '#3A5244',
    gray800: '#253830',
    gray900: '#162E1E',
    black:   '#000000',
  },

  // ─── FEEDBACK ────────────────────────────────────────────────────────────────
  feedback: {
    success:     '#16A34A',
    successPale: '#DCFCE7',
    warning:     '#D97706',
    warningPale: '#FEF3C7',
    error:       '#DC2626',
    errorPale:   '#FEE2E2',
    info:        '#2563EB',
    infoPale:    '#DBEAFE',
  },

  // ─── LEGACY (compatibilité avec composants existants) ───────────────────────
  espaceVert: {
    darkForest: '#0F692D',
    forest:     '#277842',
    main:       '#4B8E61',
    leaf:       '#8CC542',
    lime:       '#BADC8D',
    pale:       '#D1E7B3',
    lightest:   '#F0F7E6',
  },
  accent: {
    success: '#16A34A',
    warning: '#D97706',
    error:   '#DC2626',
    info:    '#2563EB',
  },

} as const;

// ─── HELPER FUNCTIONS ──────────────────────────────────────────────────────────

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function gradient(from: string, to: string, direction = 'to right'): string {
  return `linear-gradient(${direction}, ${from}, ${to})`;
}

export function shadow(color: string, alpha: number = 0.12): string {
  return `0 4px 20px ${hexToRgba(color, alpha)}`;
}

// Mélange une couleur avec du blanc (génère le pastel)
export function toPastel(hex: string, whiteMix: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  const mix = (c: number) => Math.round(c + (255-c)*whiteMix);
  return `#${mix(r).toString(16).padStart(2,'0').toUpperCase()}${mix(g).toString(16).padStart(2,'0').toUpperCase()}${mix(b).toString(16).padStart(2,'0').toUpperCase()}`;
}

// ─── THÈMES PRÉDÉFINIS ─────────────────────────────────────────────────────────
export const THEMES = {
  espaceVert: {
    primary:    COLORS.greenLogo[900],
    secondary:  COLORS.greenLeaf[700],
    accent:     COLORS.greenLeaf[500],
    background: COLORS.bg.body,
    text:       COLORS.text.main,
    border:     COLORS.border.light,
  },
  fertivert: {
    primary:    COLORS.fertivert.dark,
    secondary:  COLORS.fertivert.light,
    accent:     COLORS.greenLeaf[500],
    background: COLORS.fertivert.bg,
    text:       COLORS.text.main,
    border:     COLORS.border.light,
  },
} as const;

export default COLORS;
