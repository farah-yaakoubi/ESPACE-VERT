import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    screens: {
      sm:    "640px",
      md:    "768px",
      lg:    "1024px",
      xl:    "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        ev: {
          50:  "#f2faf0", 100: "#e0f5d8", 200: "#c0ebb1", 300: "#95d97e",
          400: "#7dc040", 500: "#5ea832", 600: "#3d8a22", 700: "#2e6e1a",
          800: "#1a5210", 900: "#0a3c08", 950: "#062504",
        },
        sand: {
          50: "#faf9f7", 100: "#f5f2ed", 200: "#ede8e0",
          300: "#ddd6ca", 400: "#c9bfae", 500: "#b5a795",
        },
        leaf:   "#7dc040",   /* lime-green from logo */
        forest: "#0a5c2e",   /* deep forest from logo */
      },
      fontFamily: {
        display: ["var(--font-display)", "Cairo", "sans-serif"],
        body:    ["var(--font-body)", "Cairo", "system-ui", "sans-serif"],
        serif:   ["var(--font-serif)", "Georgia", "serif"],
      },
      maxWidth: {
        "container": "1200px",
      },
      borderRadius: {
        "2xl": "1rem", "3xl": "1.5rem", "4xl": "2rem",
      },
      boxShadow: {
        card:         "0 1px 3px rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.04)",
        "card-hover": "0 4px 12px rgba(0,0,0,.08), 0 12px 32px rgba(0,0,0,.06)",
        green:        "0 4px 24px rgba(22,163,74,.25)",
        "green-lg":   "0 8px 40px rgba(22,163,74,.35)",
        leaf:         "0 4px 20px rgba(125,192,64,.35)",
      },
      keyframes: {
        shimmer:  { from: { backgroundPosition: "200% 0" }, to: { backgroundPosition: "-200% 0" } },
        fadeUp:   { from: { opacity: "0", transform: "translateY(18px)" }, to: { opacity: "1", transform: "none" } },
        float:    { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-9px)" } },
      },
      animation: {
        shimmer:   "shimmer 1.5s infinite",
        "fade-up": "fadeUp .55s ease both",
        float:     "float 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;