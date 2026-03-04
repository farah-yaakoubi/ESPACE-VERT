"use client";

// ══════════════════════════════════════════════════════════════════════════════
// SOCIAL SIDEBAR
// • Pages autres que Home → fixe TOUJOURS visible (sauf au footer)
// • Home page → apparaît après le carousel (scroll > 80vh)
// • Disparaît dans TOUS les cas quand le footer entre dans le viewport
// • Mobile → masqué (la version inline SocialIconsInline est utilisée)
// ══════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const socials = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/profile.php?id=61566401919487",
    bg: "#1877F2",
    icon: (
      <svg className="w-[17px] h-[17px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/espacevert.officiel/",
    gradient: "linear-gradient(180deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)",
    bg: "#E1306C",
    icon: (
      <svg className="w-[17px] h-[17px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@espace.vert.tunisie",
    bg: "#010101",
    icon: (
      <svg className="w-[17px] h-[17px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/espace-vert-b0319b238/",
    bg: "#0A66C2",
    icon: (
      <svg className="w-[17px] h-[17px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@espacevert7382",
    bg: "#FF0000",
    icon: (
      <svg className="w-[17px] h-[17px]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

// ─── Détecte si on est sur la home page ──────────────────────────────────────
function isHomePath(pathname: string): boolean {
  // Matches /, /fr, /ar, /en, /it, /es — pas de sous-chemin
  return /^\/([a-z]{2})?$/.test(pathname);
}

// ─── SIDEBAR FIXE — Desktop uniquement ───────────────────────────────────────
export default function SocialSidebar() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const footerRef = useRef<Element | null>(null);
  const onHome = isHomePath(pathname);

  useEffect(() => {
    // Récupère le footer une fois monté
    footerRef.current = document.querySelector("footer") || document.querySelector("#site-footer");
  }, []);

  useEffect(() => {
    const update = () => {
      const y  = window.scrollY;
      const wh = window.innerHeight;

      // Disparition quand le footer est visible
      let nearFooter = false;
      if (footerRef.current) {
        const rect = footerRef.current.getBoundingClientRect();
        nearFooter = rect.top < wh - 60;
      }

      if (nearFooter) {
        setShow(false);
        return;
      }

      if (onHome) {
        // Sur la home : n'apparaît qu'après le carousel (~80% vh)
        setShow(y > wh * 0.8);
      } else {
        // Autres pages : visible immédiatement (après 10px de scroll pour éviter le flash)
        setShow(y > 10);
      }
    };

    window.addEventListener("scroll", update, { passive: true });
    // Sur les pages internes, on initialise après un court délai
    const t = setTimeout(update, 200);
    return () => {
      window.removeEventListener("scroll", update);
      clearTimeout(t);
    };
  }, [onHome]);

  // Sur les autres pages sans scroll possible, on force l'affichage
  useEffect(() => {
    if (!onHome) {
      const t = setTimeout(() => {
        const footer = document.querySelector("footer") || document.querySelector("#site-footer");
        footerRef.current = footer;
        const footerVisible = footer
          ? footer.getBoundingClientRect().top < window.innerHeight - 60
          : false;
        if (!footerVisible) setShow(true);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [onHome, pathname]);

  return (
    <AnimatePresence>
      {show && (
        <motion.aside
          initial={{ opacity: 0, x: -48 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -48 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-40 flex-col gap-1"
          aria-label="Réseaux sociaux"
        >
          {socials.map((s, i) => (
            <motion.a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              title={s.name}
              aria-label={s.name}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                delay: i * 0.055,
                type: "spring",
                stiffness: 300,
                damping: 26,
              }}
              whileHover={{ x: 8, scale: 1.1 }}
              whileTap={{ scale: 0.88 }}
              className="relative w-10 h-10 flex items-center justify-center text-white rounded-r-2xl overflow-hidden group shadow-md hover:shadow-xl transition-shadow duration-200"
              style={{ background: s.gradient ?? s.bg }}
            >
              {/* Shimmer hover */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-200"
                style={{ background: "linear-gradient(135deg,#fff 0%,transparent 60%)" }}
              />
              {/* Icône avec micro-rotation hover */}
              <motion.span
                className="relative z-10"
                whileHover={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 0.3 }}
              >
                {s.icon}
              </motion.span>
              {/* Tooltip */}
              <span className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 bg-gray-900/95 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-xl">
                {s.name}
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-gray-900/95" />
              </span>
            </motion.a>
          ))}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// ─── VERSION INLINE pour la Home page (après carousel) ───────────────────────
export function SocialIconsInline() {
  return (
    <div className="flex items-center justify-center gap-3 py-5 flex-wrap">
      {socials.map((s, i) => (
        <motion.a
          key={s.name}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.name}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.07, type: "spring", stiffness: 260, damping: 22 }}
          whileHover={{ scale: 1.15, y: -4 }}
          whileTap={{ scale: 0.88 }}
          className="relative w-12 h-12 flex items-center justify-center text-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl group transition-shadow"
          style={{ background: s.gradient ?? s.bg }}
        >
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl"
            style={{ background: "linear-gradient(135deg,#fff,transparent)" }}
          />
          <span className="relative z-10">{s.icon}</span>
        </motion.a>
      ))}
    </div>
  );
}