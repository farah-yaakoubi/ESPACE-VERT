/** @type {import('tailwindcss').Config} */
// UPDATED: Fertivert exact palette + rich animations
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─── ESPACE VERT ──────────────────────────────────────────────
        'ev-dark-forest': '#1a5035',
        'ev-forest':      '#237547',
        'ev-main':        '#2d8659',
        'ev-leaf':        '#8bc34a',
        'ev-lime':        '#a3d977',
        'ev-pale':        '#e8f5e9',
        'ev-lightest':    '#f1f8f4',

        // ─── FERTIVERT (couleur exacte logo: #3cb648) ─────────────────
        'fv-primary': '#3cb648',
        'fv-dark':    '#27942f',
        'fv-bright':  '#4ecf58',
        'fv-light':   '#8ee096',
        'fv-pale':    '#eaf8eb',
        'fv-white':   '#ffffff',

        // ─── NAVBAR ──────────────────────────────────────────────────
        'nav-bg':     '#1a3d0a',
        'nav-hover':  '#2d5a1b',
        'nav-active': '#4a7c2f',

        // ─── ACCENTS ──────────────────────────────────────────────────
        'accent-success': '#4caf50',
        'accent-warning': '#ff9800',
        'accent-error':   '#f44336',
        'accent-info':    '#2196f3',
      },

      backgroundImage: {
        'gradient-primary':   'linear-gradient(135deg, #237547, #2d8659)',
        'gradient-accent':    'linear-gradient(135deg, #8bc34a, #a3d977)',
        'gradient-fertivert': 'linear-gradient(135deg, #27942f, #3cb648)',
        'gradient-fv-vivid':  'linear-gradient(135deg, #3cb648, #4ecf58)',
        'gradient-nav':       'linear-gradient(135deg, #1a3d0a, #2d5a1b)',
      },

      boxShadow: {
        'ev-sm':   '0 1px 2px rgba(26, 80, 53, 0.05)',
        'ev-md':   '0 4px 12px rgba(26, 80, 53, 0.08)',
        'ev-lg':   '0 8px 24px rgba(26, 80, 53, 0.12)',
        'ev-xl':   '0 16px 48px rgba(26, 80, 53, 0.15)',
        'ev-glow': '0 0 40px rgba(139, 195, 74, 0.2)',
        'fv-glow': '0 0 30px rgba(60, 182, 72, 0.35)',
        'fv-md':   '0 4px 16px rgba(60, 182, 72, 0.2)',
      },

      animation: {
        'fade-in':       'fadeIn 0.4s ease both',
        'fade-in-slow':  'fadeIn 0.8s ease both',
        'fade-down':     'fadeDown 0.4s ease both',
        'fade-up':       'fadeUp 0.45s ease both',
        'fade-up-slow':  'fadeUp 0.8s ease both',
        'slide-left':    'slideInLeft 0.5s ease both',
        'slide-right':   'slideInRight 0.5s ease both',
        'scale-in':      'scaleIn 0.35s ease both',
        'pulse-glow':    'pulseGlow 2.5s ease-in-out infinite',
        'pulse-ring':    'pulseRing 2s ease-out infinite',
        'shimmer':       'shimmer 2s infinite linear',
        'float':         'float 4s ease-in-out infinite',
        'float-slow':    'float 6s ease-in-out infinite',
        'bounce-soft':   'bounceSoft 2s ease-in-out infinite',
        'spin-slow':     'spin 8s linear infinite',
        'draw-line':     'drawLine 0.6s ease both',
      },

      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeDown: {
          from: { opacity: '0', transform: 'translateY(-20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-40px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(40px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.88)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(60, 182, 72, 0.5)' },
          '50%':       { boxShadow: '0 0 0 16px rgba(60, 182, 72, 0)' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-4px)' },
        },
        drawLine: {
          from: { strokeDashoffset: '1' },
          to:   { strokeDashoffset: '0' },
        },
      },

      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },

      screens: {
        'xs':  '475px',
        '3xl': '1920px',
      },

      spacing: {
        '18':  '4.5rem',
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