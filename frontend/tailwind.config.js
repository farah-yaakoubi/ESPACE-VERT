/** @type {import('tailwindcss').Config} */
// UPDATED: Palette professionnelle agriculture — équilibrée vert + tons terreux/or
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─── COULEURS PRIMAIRES (Vert Espace Vert — du logo) ──────────
        'primary-darkest': '#0d2b0f',
        'primary-dark':    '#1a4f1e',
        'primary':         '#236b28',
        'primary-mid':     '#2e8b35',
        'primary-light':   '#3cb648',
        'primary-soft':    '#6dcf76',
        'primary-pale':    '#d4edcc',
        'primary-ghost':   '#f0f9f0',

        // ─── TONS TERREUX / OR ────────────────────────────────────────
        'earth-deep':   '#3d2b1f',
        'earth-dark':   '#6b4226',
        'earth':        '#a0622a',
        'earth-mid':    '#c4853e',
        'earth-gold':   '#d4a027',
        'earth-sand':   '#e8c882',
        'earth-cream':  '#fdf6e8',
        'earth-pale':   '#faf5ec',

        // ─── BLEU (Matar) ─────────────────────────────────────────────
        'water-deep':  '#0a2540',
        'water-dark':  '#1a4b8c',
        'water':       '#2563eb',
        'water-light': '#60a5fa',
        'water-pale':  '#dbeafe',

        // ─── TEAL (Pulvert) ───────────────────────────────────────────
        'teal-deep':   '#0d3b35',
        'teal-dark':   '#0f766e',
        'teal':        '#14b8a6',
        'teal-light':  '#5eead4',
        'teal-pale':   '#ccfbf1',

        // ─── NEUTRES CHAUDS ───────────────────────────────────────────
        'neutral-50':  '#fafaf8',
        'neutral-100': '#f5f4f0',
        'neutral-200': '#ebe9e3',
        'neutral-300': '#d4d0c8',
        'neutral-400': '#a8a39a',
        'neutral-500': '#7a7368',
        'neutral-600': '#57524a',
        'neutral-700': '#3d3830',
        'neutral-800': '#2a261f',
        'neutral-900': '#1a1710',

        // ─── ACCENTS ─────────────────────────────────────────────────
        'accent-success': '#22c55e',
        'accent-warning': '#f59e0b',
        'accent-error':   '#ef4444',
        'accent-info':    '#3b82f6',

        // ─── NAVBAR ──────────────────────────────────────────────────
        'nav-bg':    '#0d2b0f',
        'nav-hover': '#1a4f1e',
        'nav-text':  '#f0f9f0',

        // ─── LEGACY (pour compatibilité) ─────────────────────────────
        'ev-dark-forest': '#0d2b0f',
        'ev-forest':      '#1a4f1e',
        'ev-main':        '#236b28',
        'ev-leaf':        '#3cb648',
        'ev-lime':        '#6dcf76',
        'ev-pale':        '#d4edcc',
        'ev-lightest':    '#f0f9f0',
        'fv-primary':     '#3cb648',
        'fv-dark':        '#236b28',
        'fv-bright':      '#2e8b35',
        'fv-light':       '#6dcf76',
        'fv-pale':        '#f0f9f0',
        'fv-white':       '#ffffff',
        'nav-active':     '#2e8b35',
        'accent-warning-legacy': '#ff9800',
      },

      backgroundImage: {
        'gradient-hero':      'linear-gradient(135deg, #0d2b0f 0%, #1a4f1e 40%, #2e8b35 100%)',
        'gradient-primary':   'linear-gradient(135deg, #1a4f1e, #2e8b35)',
        'gradient-cta':       'linear-gradient(135deg, #236b28, #3cb648)',
        'gradient-earth':     'linear-gradient(135deg, #3d2b1f, #6b4226)',
        'gradient-warm':      'linear-gradient(135deg, #a0622a, #d4a027)',
        'gradient-page':      'linear-gradient(180deg, #f0f9f0 0%, #fafaf8 50%, #faf5ec 100%)',
        'gradient-section':   'linear-gradient(135deg, #faf5ec, #f0f9f0)',
        'gradient-fertivert': 'linear-gradient(135deg, #1a4f1e, #3cb648)',
        'gradient-matar':     'linear-gradient(135deg, #0a2540, #2563eb)',
        'gradient-pulvert':   'linear-gradient(135deg, #0d3b35, #14b8a6)',
        'gradient-accent':    'linear-gradient(135deg, #a0622a, #d4a027)',
        'gradient-nav':       'linear-gradient(135deg, #0d2b0f, #1a4f1e)',
        'gradient-fv-vivid':  'linear-gradient(135deg, #3cb648, #6dcf76)',
      },

      boxShadow: {
        'ev-sm':      '0 1px 2px rgba(13,43,15,0.05)',
        'ev-md':      '0 4px 12px rgba(13,43,15,0.08)',
        'ev-lg':      '0 8px 24px rgba(13,43,15,0.10)',
        'ev-xl':      '0 16px 48px rgba(13,43,15,0.12)',
        'ev-glow':    '0 0 40px rgba(60,182,72,0.20)',
        'fv-glow':    '0 0 30px rgba(60,182,72,0.30)',
        'fv-md':      '0 4px 16px rgba(60,182,72,0.18)',
        'glow-gold':  '0 0 30px rgba(212,160,39,0.28)',
        'card':       '0 2px 8px rgba(13,43,15,0.06), 0 8px 32px rgba(13,43,15,0.08)',
        'card-hover': '0 8px 32px rgba(13,43,15,0.12), 0 20px 60px rgba(13,43,15,0.10)',
        'button':     '0 4px 14px rgba(35,107,40,0.38)',
      },

      animation: {
        'fade-in':       'fadeIn 0.5s ease both',
        'fade-in-slow':  'fadeIn 0.9s ease both',
        'fade-down':     'fadeDown 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'fade-up':       'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'fade-up-slow':  'fadeUp 1s cubic-bezier(0.22,1,0.36,1) both',
        'slide-left':    'slideInLeft 0.6s cubic-bezier(0.22,1,0.36,1) both',
        'slide-right':   'slideInRight 0.6s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in':      'scaleIn 0.4s cubic-bezier(0.22,1,0.36,1) both',
        'pulse-glow':    'pulseGlow 3s ease-in-out infinite',
        'pulse-ring':    'pulseRing 2.5s ease-out infinite',
        'shimmer':       'shimmer 2.5s infinite linear',
        'float':         'float 5s ease-in-out infinite',
        'float-slow':    'float 7s ease-in-out infinite',
        'bounce-soft':   'bounceSoft 2.5s ease-in-out infinite',
        'spin-slow':     'spin 10s linear infinite',
        'grow-line':     'growLine 0.8s ease both',
        'marquee':       'marquee 22s linear infinite',
        'draw-line':     'drawLine 0.6s ease both',
      },

      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeDown: {
          from: { opacity: '0', transform: 'translateY(-24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-48px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(48px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.85)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(60,182,72,0.4)' },
          '50%':       { boxShadow: '0 0 0 20px rgba(60,182,72,0)' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(1)', opacity: '0.7' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1200px 0' },
          '100%': { backgroundPosition: '1200px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-10px)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-5px)' },
        },
        growLine: {
          from: { transform: 'scaleX(0)', transformOrigin: 'left' },
          to:   { transform: 'scaleX(1)', transformOrigin: 'left' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        drawLine: {
          from: { strokeDashoffset: '1' },
          to:   { strokeDashoffset: '0' },
        },
      },

      fontFamily: {
        sans:    ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },

      screens: {
        'xs':  '475px',
        '3xl': '1920px',
      },

      spacing: {
        '18':  '4.5rem',
        '22':  '5.5rem',
        '88':  '22rem',
        '128': '32rem',
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      zIndex: {
        '60':  '60',
        '70':  '70',
        '80':  '80',
        '90':  '90',
        '100': '100',
      },
    },
  },
  plugins: [],
};
