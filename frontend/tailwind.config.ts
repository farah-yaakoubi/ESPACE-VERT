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
          50:  "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 300: "#86efac",
          400: "#4ade80", 500: "#22c55e", 600: "#16a34a", 700: "#15803d",
          800: "#166534", 900: "#14532d", 950: "#052e16",
        },
        sand: {
          50: "#faf9f7", 100: "#f5f2ed", 200: "#ede8e0",
          300: "#ddd6ca", 400: "#c9bfae", 500: "#b5a795",
        },
        leaf:   "#7dc040",
        forest: "#0a5c2e",
      },
      fontFamily: {
        display: ["var(--font-display)", "Cairo", "sans-serif"],
        body:    ["var(--font-body)", "Cairo", "system-ui", "sans-serif"],
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
