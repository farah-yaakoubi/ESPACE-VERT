/** @type {import('tailwindcss').Config} */
// ══════════════════════════════════════════════════════════════════
//  ESPACE VERT — Palette Pastel Professionnelle
//  Couleurs extraites pixel par pixel du logo :
//    #0F692D → vert foncé (rectangle fond logo, 81 000 px dominants)
//    #8CC542 → vert vif   (feuille logo, 35 000 px)
//  Règle : même teinte du logo, mélangée avec du blanc → pastel
// ══════════════════════════════════════════════════════════════════
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {

        // ── VERT LOGO FONCÉ — échelle pastel (#0F692D + blanc) ──────────
        // Teinte exacte du rectangle logo, de plus en plus clair
        'green-900': '#0F692D',   // couleur pure rectangle logo → CTA, boutons
        'green-800': '#277842',   // +10% blanc → hover bouton, navbar hover
        'green-700': '#4B8E61',   // +25% blanc → accents texte foncés
        'green-600': '#6FA581',   // +40% blanc → bordures visibles
        'green-500': '#93BBA0',   // +55% blanc → bordures douces, dividers
        'green-400': '#B7D2C0',   // +70% blanc → fond section alternée
        'green-300': '#D6E5DB',   // +83% blanc → fond cartes pastel
        'green-200': '#E9F1EC',   // +91% blanc → fond page alternatif
        'green-100': '#F5F9F6',   // +96% blanc → fond page principal
        'green-50':  '#FBFCFB',   // +98.5% blanc → fond body (quasi-blanc)

        // ── VERT LOGO VIF — échelle pastel (#8CC542 + blanc) ────────────
        // Teinte exacte de la feuille logo, de plus en plus claire
        'leaf-700': '#8CC542',    // couleur pure feuille logo → badges, tags actifs
        'leaf-600': '#A3D067',    // +20% blanc → hover badge
        'leaf-500': '#BADC8D',    // +40% blanc → tags secondaires
        'leaf-400': '#D1E7B3',    // +60% blanc → fond badge
        'leaf-300': '#E2F0CF',    // +75% blanc → fond tag pâle
        'leaf-200': '#F0F7E6',    // +87% blanc → fond section accent
        'leaf-100': '#F8FBF3',    // +94% blanc → fond ghost

        // ── ALIASES SÉMANTIQUES (à utiliser dans tous les composants) ────
        'bg-body':      '#FBFCFB',   // fond <body> — quasi-blanc avec teinte verte
        'bg-page':      '#F5F9F6',   // fond pages
        'bg-section':   '#E9F1EC',   // sections alternées
        'bg-section-2': '#D6E5DB',   // sections plus marquées
        'bg-card':      '#FFFFFF',   // cartes blanches
        'bg-card-soft': '#F5F9F6',   // cartes légèrement teintées
        'bg-input':     '#F5F9F6',   // champs de formulaire
        'bg-badge':     '#D1E7B3',   // fond badges/tags
        'bg-highlight': '#E2F0CF',   // mise en avant douce

        // Navbar — vert logo directement (lisible, professionnel)
        'nav-bg':       '#0F692D',   // fond navbar = rectangle logo
        'nav-hover':    '#277842',   // hover items navbar
        'nav-active':   '#0A5124',   // item actif (légèrement plus foncé)
        'nav-text':     '#FFFFFF',   // texte navbar
        'nav-sub':      '#D6E5DB',   // texte secondaire navbar

        // Texte
        'text-main':    '#162E1E',   // texte principal (quasi-noir teinté vert)
        'text-sub':     '#3A5E47',   // texte secondaire
        'text-muted':   '#6B8E78',   // texte atténué
        'text-placeholder': '#93BBA0', // placeholder inputs
        'text-on-green':'#FFFFFF',   // texte sur fond vert foncé

        // Bordures
        'border-light': '#D6E5DB',   // bordure très douce
        'border-mid':   '#B7D2C0',   // bordure visible
        'border-strong':'#8CC542',   // bordure accent vif
        'border-focus': '#0F692D',   // ring focus

        // Boutons
        'btn-primary':      '#0F692D',   // fond bouton principal
        'btn-primary-hover':'#277842',   // hover
        'btn-secondary':    '#E9F1EC',   // fond bouton secondaire
        'btn-secondary-border': '#8CC542',
        'btn-secondary-text':   '#0F692D',

        // ── MARQUES ──────────────────────────────────────────────────────
        // Fertivert (vert logo)
        'fv-dark':    '#0F692D',
        'fv-main':    '#277842',
        'fv-light':   '#8CC542',
        'fv-pale':    '#D1E7B3',
        'fv-bg':      '#F0F7E6',
        // legacy Tailwind
        'fv-primary': '#8CC542',
        'fv-bright':  '#277842',
        'fv-white':   '#ffffff',

        // Pulvert (vert-teal pastel)
        'pv-dark':    '#0A5240',
        'pv-main':    '#167A5E',
        'pv-light':   '#4DB896',
        'pv-pale':    '#CCF0E4',
        'pv-bg':      '#EDF9F4',

        // Matar (bleu pastel)
        'mt-dark':    '#1A4A9E',
        'mt-main':    '#2E6AD4',
        'mt-light':   '#82AFFF',
        'mt-pale':    '#D8E8FF',
        'mt-bg':      '#EEF4FF',

        // ── FEEDBACK ─────────────────────────────────────────────────────
        'success':       '#16A34A',
        'success-pale':  '#DCFCE7',
        'warning':       '#D97706',
        'warning-pale':  '#FEF3C7',
        'error':         '#DC2626',
        'error-pale':    '#FEE2E2',
        'info':          '#2563EB',
        'info-pale':     '#DBEAFE',

        // ── NEUTRES CHAUDS ────────────────────────────────────────────────
        'neutral-50':   '#FAFAF8',
        'neutral-100':  '#F4F3F0',
        'neutral-200':  '#E8E6E1',
        'neutral-300':  '#D4D0C8',
        'neutral-400':  '#A8A39A',
        'neutral-500':  '#7A7368',
        'neutral-600':  '#57524A',
        'neutral-700':  '#3D3830',
        'neutral-800':  '#2A261F',
        'neutral-900':  '#1A1710',

        // ── LEGACY — garder tous les anciens noms pour compatibilité ─────
        'primary-darkest': '#0F692D',
        'primary-dark':    '#277842',
        'primary':         '#4B8E61',
        'primary-mid':     '#8CC542',
        'primary-light':   '#BADC8D',
        'primary-soft':    '#D1E7B3',
        'primary-pale':    '#E2F0CF',
        'primary-ghost':   '#F0F7E6',
        'ev-dark-forest':  '#0F692D',
        'ev-forest':       '#277842',
        'ev-main':         '#4B8E61',
        'ev-leaf':         '#8CC542',
        'ev-lime':         '#BADC8D',
        'ev-pale':         '#D1E7B3',
        'ev-lightest':     '#F0F7E6',
        'nav-bg-legacy':   '#0F692D',
        'nav-hover-legacy':'#277842',
        'nav-text-legacy': '#FFFFFF',
        'nav-active':      '#0A5124',
        'water-deep':      '#1A4A9E',
        'water-dark':      '#2E6AD4',
        'water':           '#5B9BFF',
        'water-light':     '#82AFFF',
        'water-pale':      '#D8E8FF',
        'teal-deep':       '#0A5240',
        'teal-dark':       '#167A5E',
        'teal':            '#4DB896',
        'teal-light':      '#86EFCE',
        'teal-pale':       '#CCF0E4',
        'earth-deep':      '#3A2D1E',
        'earth-dark':      '#6B4226',
        'earth':           '#A0622A',
        'earth-mid':       '#C4853E',
        'earth-gold':      '#D4A027',
        'earth-sand':      '#EDD9A0',
        'earth-cream':     '#FBF5E8',
        'earth-pale':      '#FAF0E0',
        'accent-success':  '#16A34A',
        'accent-warning':  '#D97706',
        'accent-error':    '#DC2626',
        'accent-info':     '#2563EB',
        'accent-warning-legacy': '#F59E0B',
      },

      backgroundImage: {
        // ── Gradients pastel doux ──────────────────────────────────────
        'gradient-hero':         'linear-gradient(135deg, #0F692D 0%, #277842 45%, #8CC542 100%)',
        'gradient-hero-pastel':  'linear-gradient(135deg, #B7D2C0 0%, #E9F1EC 50%, #F8FBF3 100%)',
        'gradient-primary':      'linear-gradient(135deg, #0F692D, #277842)',
        'gradient-primary-soft': 'linear-gradient(135deg, #D6E5DB, #F0F7E6)',
        'gradient-cta':          'linear-gradient(135deg, #277842, #8CC542)',
        'gradient-cta-soft':     'linear-gradient(135deg, #D1E7B3, #F0F7E6)',
        'gradient-page':         'linear-gradient(180deg, #FBFCFB 0%, #FFFFFF 50%, #F5F9F6 100%)',
        'gradient-section':      'linear-gradient(135deg, #E9F1EC, #F5F9F6)',
        'gradient-card':         'linear-gradient(135deg, #FFFFFF, #F5F9F6)',
        'gradient-nav':          'linear-gradient(180deg, #0A5124 0%, #0F692D 100%)',
        // Marques
        'gradient-fertivert':       'linear-gradient(135deg, #0F692D 0%, #277842 55%, #8CC542 100%)',
        'gradient-fertivert-pastel':'linear-gradient(135deg, #D1E7B3 0%, #F0F7E6 100%)',
        'gradient-fertivert-soft':  'linear-gradient(135deg, #E9F1EC, #F5F9F6)',
        'gradient-matar':           'linear-gradient(135deg, #1A4A9E 0%, #2E6AD4 100%)',
        'gradient-matar-soft':      'linear-gradient(135deg, #D8E8FF, #EEF4FF)',
        'gradient-pulvert':         'linear-gradient(135deg, #0A5240 0%, #167A5E 100%)',
        'gradient-pulvert-soft':    'linear-gradient(135deg, #CCF0E4, #EDF9F4)',
        // legacy
        'gradient-earth':    'linear-gradient(135deg, #D6E5DB, #B7D2C0)',
        'gradient-warm':     'linear-gradient(135deg, #D1E7B3, #BADC8D)',
        'gradient-accent':   'linear-gradient(135deg, #277842, #8CC542)',
        'gradient-fv-vivid': 'linear-gradient(135deg, #8CC542, #BADC8D)',
      },

      boxShadow: {
        'ev-sm':      '0 1px 3px rgba(15,105,45,0.06)',
        'ev-md':      '0 4px 12px rgba(15,105,45,0.09)',
        'ev-lg':      '0 8px 24px rgba(15,105,45,0.11)',
        'ev-xl':      '0 16px 48px rgba(15,105,45,0.13)',
        'ev-glow':    '0 0 32px rgba(140,197,66,0.22)',
        'fv-glow':    '0 0 28px rgba(140,197,66,0.28)',
        'fv-md':      '0 4px 16px rgba(140,197,66,0.16)',
        'glow-gold':  '0 0 28px rgba(212,160,39,0.22)',
        'card':       '0 2px 8px rgba(15,105,45,0.05), 0 8px 24px rgba(15,105,45,0.07)',
        'card-hover': '0 8px 32px rgba(15,105,45,0.10), 0 20px 56px rgba(15,105,45,0.07)',
        'button':     '0 4px 14px rgba(15,105,45,0.28)',
        'button-hover':'0 6px 20px rgba(15,105,45,0.38)',
        'input-focus':'0 0 0 3px rgba(140,197,66,0.22)',
      },

      animation: {
        'fade-in':      'fadeIn 0.5s ease both',
        'fade-in-slow': 'fadeIn 0.9s ease both',
        'fade-down':    'fadeDown 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'fade-up':      'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'fade-up-slow': 'fadeUp 1s cubic-bezier(0.22,1,0.36,1) both',
        'slide-left':   'slideInLeft 0.6s cubic-bezier(0.22,1,0.36,1) both',
        'slide-right':  'slideInRight 0.6s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in':     'scaleIn 0.4s cubic-bezier(0.22,1,0.36,1) both',
        'pulse-glow':   'pulseGlow 3s ease-in-out infinite',
        'pulse-ring':   'pulseRing 2.5s ease-out infinite',
        'shimmer':      'shimmer 2.5s infinite linear',
        'float':        'float 5s ease-in-out infinite',
        'float-slow':   'float 7s ease-in-out infinite',
        'bounce-soft':  'bounceSoft 2.5s ease-in-out infinite',
        'spin-slow':    'spin 10s linear infinite',
        'grow-line':    'growLine 0.8s ease both',
        'marquee':      'marquee 22s linear infinite',
        'draw-line':    'drawLine 0.6s ease both',
      },
      keyframes: {
        fadeIn:       { from:{ opacity:'0' }, to:{ opacity:'1' } },
        fadeDown:     { from:{ opacity:'0', transform:'translateY(-24px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        fadeUp:       { from:{ opacity:'0', transform:'translateY(28px)'  }, to:{ opacity:'1', transform:'translateY(0)' } },
        slideInLeft:  { from:{ opacity:'0', transform:'translateX(-48px)' }, to:{ opacity:'1', transform:'translateX(0)' } },
        slideInRight: { from:{ opacity:'0', transform:'translateX(48px)'  }, to:{ opacity:'1', transform:'translateX(0)' } },
        scaleIn:      { from:{ opacity:'0', transform:'scale(0.85)'       }, to:{ opacity:'1', transform:'scale(1)'    } },
        pulseGlow: {
          '0%, 100%': { boxShadow:'0 0 0 0 rgba(140,197,66,0.35)' },
          '50%':       { boxShadow:'0 0 0 18px rgba(140,197,66,0)' },
        },
        pulseRing:    { '0%':{ transform:'scale(1)', opacity:'0.7' }, '100%':{ transform:'scale(2)', opacity:'0' } },
        shimmer:      { '0%':{ backgroundPosition:'-1200px 0' }, '100%':{ backgroundPosition:'1200px 0' } },
        float:        { '0%, 100%':{ transform:'translateY(0px)' }, '50%':{ transform:'translateY(-10px)' } },
        bounceSoft:   { '0%, 100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-5px)' } },
        growLine:     { from:{ transform:'scaleX(0)', transformOrigin:'left' }, to:{ transform:'scaleX(1)', transformOrigin:'left' } },
        marquee:      { '0%':{ transform:'translateX(0)' }, '100%':{ transform:'translateX(-50%)' } },
        drawLine:     { from:{ strokeDashoffset:'1' }, to:{ strokeDashoffset:'0' } },
      },
      fontFamily: {
        sans:    ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      screens:      { 'xs':'475px', '3xl':'1920px' },
      spacing:      { '18':'4.5rem', '22':'5.5rem', '88':'22rem', '128':'32rem' },
      borderRadius: { '4xl':'2rem', '5xl':'2.5rem' },
      zIndex:       { '60':'60', '70':'70', '80':'80', '90':'90', '100':'100' },
    },
  },
  plugins: [],
};
