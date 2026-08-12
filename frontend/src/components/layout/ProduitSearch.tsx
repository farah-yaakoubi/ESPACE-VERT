"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { getProductHref } from "@/lib/product-url";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const C = {
  sage:    "#7dc040",
  sageDk:  "#5f972d",
  sageLt:  "#eef8e4",
  sageMd:  "#98cb67",
  leaf:    "#7dc040",
  border:  "#cfe5b5",
  // Fond semi-transparent — laisse voir la page en dessous
  overlayBg:    "rgba(246, 252, 239, 0.86)",
  overlayTop:   "rgba(239, 249, 229, 0.92)",
  overlayFoot:  "rgba(233, 246, 218, 0.90)",
  overlayBorder:"rgba(189, 220, 151, 0.58)",
  textPrimary:  "#234110",
  textSecondary:"#5f972d",
  textMuted:    "#92b86d",
  inputCaret:   "#7dc040",
  tagBg:        "rgba(255,255,255,0.6)",
  tagBorder:    "rgba(189,220,151,0.7)",
  resultHover:  "rgba(226,243,196,0.58)",
  resultActive: "rgba(214,238,173,0.72)",
  highlight:    "rgba(125,192,64,0.24)",
};

const SEARCH_SUGGESTIONS = [
  "fulvical…",
  "Rechercher un système d'irrigation…",
  "Rechercher des semences…",
  "Rechercher un pulvérisateur…",
  "Rechercher du matériel agricole…",
  "tondeuse à gazon…",
];

// Effet machine à écrire : tape puis efface chaque suggestion tour à tour
function useTypewriter(words: string[], typingSpeed = 55, deletingSpeed = 28, pause = 1500) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex % words.length];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && text.length < current.length) {
      timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), typingSpeed);
    } else if (!deleting && text.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text.length > 0) {
      timeout = setTimeout(() => setText(current.slice(0, text.length - 1)), deletingSpeed);
    } else {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, wordIndex, words, typingSpeed, deletingSpeed, pause]);

  return text;
}

interface Resultat {
  id_produit: number;
  nom:        string;
  slug:       string;
  division:   string;
  categorie?: { nom: string };
  marque?:    { nom: string; slug?: string | null };
  activite?:  { nom: string; slug?: string | null };
  images:     { url: string; is_principale?: boolean }[];
}

interface SearchProps {
  onHero?:        boolean;
  navTextColor?:  string;
  logoSrc?:       string;
  logoAlt?:       string;
}

export function ProduitSearch({
  onHero        = false,
  navTextColor  = "#2e7d4f",
  logoSrc       = "/logos/logo-espace-vert.png",
  logoAlt       = "Logo",
}: SearchProps) {
  const isDark = false;
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<Resultat[]>([]);
  const [loading, setLoading] = useState(false);
  const [active,  setActive]  = useState(-1);
  const [mounted, setMounted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router   = useRouter();

  useEffect(() => { setMounted(true); }, []);

  // Focus input à l'ouverture — pas de scroll lock (panel partiel)
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const close = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setActive(-1);
  };

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/produits?search=${encodeURIComponent(q)}&limit=8&actif=true`);
      const data = await res.json();
      const items = (data.data ?? data) as Resultat[];
      setResults(items);
      // Tracker la recherche pour l'analytics visiteurs
      if (typeof window !== "undefined" && typeof (window as any).trackSearch === "function") {
        (window as any).trackSearch(q.trim(), items.length);
      }
    } catch { setResults([]); }
    finally   { setLoading(false); }
  }, []);

  const onInput = (v: string) => {
    setQuery(v);
    setActive(-1);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(v), 280);
  };

  const goTo = (product: Resultat) => { close(); router.push(getProductHref(product)); };

  const onKey = (e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    if (e.key === "Enter" && active >= 0) goTo(results[active]);
    if (e.key === "Enter" && active < 0 && query.trim()) {
      close(); router.push(`/produits?search=${encodeURIComponent(query)}`);
    }
    if (e.key === "Escape") close();
  };

  const palette = isDark
    ? {
        sage: "#7dc040",
        sageDk: "#94cf5b",
        sageLt: "#1c2a17",
        sageMd: "#9fca69",
        leaf: "#7dc040",
        border: "rgba(125,192,64,0.24)",
        overlayBg: "rgba(13, 24, 16, 0.92)",
        overlayTop: "rgba(22, 33, 23, 0.96)",
        overlayFoot: "rgba(18, 29, 20, 0.96)",
        overlayBorder: "rgba(125, 192, 64, 0.16)",
        textPrimary: "#e8f0ea",
        textSecondary: "#a7db73",
        textMuted: "rgba(232,240,234,0.58)",
        inputCaret: "#7dc040",
        tagBg: "rgba(255,255,255,0.05)",
        tagBorder: "rgba(125,192,64,0.18)",
        resultHover: "rgba(125,192,64,0.08)",
        resultActive: "rgba(125,192,64,0.12)",
        highlight: "rgba(125,192,64,0.18)",
        chipBg: "rgba(255,255,255,0.06)",
        chipBorder: "rgba(255,255,255,0.08)",
      }
    : {
        ...C,
        chipBg: "rgba(255,255,255,0.6)",
        chipBorder: "rgba(160,210,185,0.5)",
      };

  const iconBorder = onHero ? "1.5px solid rgba(255,255,255,0.3)" : `1.5px solid ${palette.border}`;
  const iconBg     = onHero ? "rgba(255,255,255,0.12)"            : palette.sageLt;
  const typed = useTypewriter(SEARCH_SUGGESTIONS);
  const barTextColor = onHero ? "rgba(255,255,255,0.85)" : palette.textMuted;


  return (
    <>
      <style>{`
        @keyframes searchCaretBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .search-bar-caret {
          display: inline-block;
          width: 1px;
          margin-left: 1px;
          animation: searchCaretBlink 0.9s step-end infinite;
        }
      `}</style>

      {/* ── Icône de recherche compacte (navbar) ── */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        title="Rechercher (⌘K)"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 38, height: 38, flexShrink: 0,
          borderRadius: 9999, cursor: "pointer",
          border: iconBorder, background: iconBg,
          color: onHero ? "#fff" : palette.sage,
        }}
      >
        <SearchIcon color={onHero ? "#fff" : palette.sage} size={17} />
      </motion.button>

      {/* ── Panel demi-écran (portal) ── */}
      {mounted && createPortal(
        <AnimatePresence>
          {open && (
            <>
              {/* Zone basse invisible — ferme le panel au clic */}
              <motion.div
                key="search-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={close}
                style={{
                  position: "fixed", inset: 0,
                  zIndex: 9998,
                  background: "transparent",
                  cursor: "default",
                }}
              />

              {/* Panel — s'arrête à ~55 % de l'écran */}
              <motion.div
                key="search-overlay"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: "fixed",
                  top: 0, left: 0, right: 0,
                  height: "clamp(400px, 55vh, 660px)",
                  zIndex: 9999,
                  background: palette.overlayBg,
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  display: "flex",
                  flexDirection: "column",
                  borderBottomLeftRadius: 24,
                  borderBottomRightRadius: 24,
                  boxShadow: "0 16px 56px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.6)",
                  border: `1px solid ${palette.overlayBorder}`,
                  borderTop: "none",
                  overflow: "hidden",
                }}
              >
                {/* ── Barre du haut : logo + fermer ── */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 40px",
                  flexShrink: 0,
                  background: palette.overlayTop,
                  borderBottom: `1px solid ${palette.overlayBorder}`,
                }}>
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08, duration: 0.3 }}
                  >
                    <Link href="/" onClick={close} style={{ display: "block" }}>
                      <Image
                        src={logoSrc}
                        alt={logoAlt}
                        width={300}
                        height={150}
                        style={{ objectFit: "contain", height: 70, width: "auto" }}
                      />
                    </Link>
                  </motion.div>

                  <motion.button
                    onClick={close}
                    whileHover={{ scale: 1.12, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: palette.textSecondary, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      padding: 4,
                    }}
                    aria-label="Fermer la recherche"
                  >
                    <XIcon size={22} />
                  </motion.button>
                </div>

                {/* ── Zone de recherche (scrollable) ── */}
                <div style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  paddingTop: "28px",
                  paddingBottom: "12px",
                  paddingLeft: 24,
                  paddingRight: 24,
                  overflowY: "auto",
                }}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    style={{ width: "100%", maxWidth: 760 }}
                  >
                    {/* Barre de saisie */}
                    <div style={{
                      position: "relative",
                      borderBottom: `1.5px solid ${palette.border}`,
                      display: "flex", alignItems: "center", gap: 16,
                      paddingBottom: 14,
                    }}>
                      <SearchIcon color={palette.textMuted} size={22} />
                      <input
                        ref={inputRef}
                        value={query}
                        onChange={e => onInput(e.target.value)}
                        onKeyDown={onKey}
                        placeholder="Recherche produits"
                        autoComplete="off"
                        spellCheck={false}
                        style={{
                          flex: 1, background: "transparent", border: "none", outline: "none",
                          fontSize: 26, fontWeight: 300, letterSpacing: "-0.02em",
                          color: palette.textPrimary, caretColor: palette.inputCaret,
                          fontFamily: "inherit",
                        }}
                      />
                      <AnimatePresence mode="wait">
                        {loading ? (
                          <motion.span key="spin"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ display: "flex", alignItems: "center" }}>
                            <SpinnerPine color={palette.textMuted} />
                          </motion.span>
                        ) : query ? (
                          <motion.button key="clear"
                            onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
                            initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.7 }} whileTap={{ scale: 0.85 }}
                            style={{
                              background: "none", border: "none", cursor: "pointer",
                              display: "flex", alignItems: "center", color: palette.textMuted,
                            }}>
                            <XIcon size={18} />
                          </motion.button>
                        ) : (
                          <motion.button key="search-submit"
                            onClick={() => { if (query.trim()) { close(); router.push(`/produits?search=${encodeURIComponent(query)}`); } }}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{
                              background: "none", border: "none", cursor: "pointer",
                              display: "flex", alignItems: "center", color: palette.textMuted,
                            }}>
                            <SearchIcon color={palette.textMuted} size={20} />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>

                   

                    {/* Aucun résultat */}
                    <AnimatePresence>
                      {!loading && query && results.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          style={{ marginTop: 32, textAlign: "center" }}
                        >
                          <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.2 }}>🌿</div>
                          <p style={{ fontSize: 15, color: palette.textMuted }}>
                            Aucun résultat pour <span style={{ color: palette.textPrimary, fontWeight: 600 }}>« {query} »</span>
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Liste des résultats */}
                    <AnimatePresence>
                      {!loading && results.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          style={{ marginTop: 20 }}
                        >
                          <p style={{
                            fontSize: 10, fontWeight: 800, letterSpacing: "0.14em",
                            textTransform: "uppercase", color: palette.textMuted, marginBottom: 10,
                          }}>
                            {results.length} résultat{results.length > 1 ? "s" : ""}
                          </p>
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {results.map((p, i) => {
                              const img = p.images.find(x => x.is_principale) ?? p.images[0];
                              const isActive = i === active;
                              return (
                                <motion.button
                                  key={p.id_produit}
                                  onClick={() => goTo(p)}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.04 }}
                                  whileHover={{ x: 6, backgroundColor: palette.resultHover }}
                                  whileTap={{ scale: 0.99 }}
                                  style={{
                                    width: "100%", display: "flex", alignItems: "center", gap: 14,
                                    padding: "10px 14px", border: "none", borderRadius: 10,
                                    background: isActive ? palette.resultActive : "transparent",
                                    cursor: "pointer", textAlign: "left",
                                    borderLeft: isActive ? `3px solid ${palette.leaf}` : "3px solid transparent",
                                    transition: "border-color 0.12s",
                                  }}
                                >
                                  <div style={{
                                    width: 40, height: 40, borderRadius: 8,
                                    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)",
                                    border: `1px solid ${palette.border}`,
                                    overflow: "hidden", position: "relative", flexShrink: 0,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                  }}>
                                    {img
                                      ? <Image src={img.url} alt={p.nom} fill style={{ objectFit: "contain", padding: 4 }} sizes="40px" />
                                      : <span style={{ fontSize: 18, opacity: 0.3 }}>🌿</span>
                                    }
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                      fontSize: 14, fontWeight: 600, color: palette.textPrimary,
                                      letterSpacing: "-0.01em", whiteSpace: "nowrap",
                                      overflow: "hidden", textOverflow: "ellipsis",
                                    }}>
                                      {highlight(p.nom, query, isDark)}
                                    </p>
                                    <p style={{ fontSize: 11, color: palette.textMuted, marginTop: 2 }}>
                                      {[p.categorie?.nom, p.marque?.nom].filter(Boolean).join(" · ")}
                                    </p>
                                  </div>
                                  <span style={{
                                    fontSize: 9, fontWeight: 800, letterSpacing: "0.1em",
                                    textTransform: "uppercase", borderRadius: 5,
                                    padding: "3px 8px", flexShrink: 0,
                                    background: palette.sageLt, color: palette.sage,
                                    border: `1px solid ${palette.border}`,
                                  }}>
                                    {p.division}
                                  </span>
                                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                                    stroke={palette.textMuted} strokeWidth={2} strokeLinecap="round">
                                    <path d="M9 18l6-6-6-6" />
                                  </svg>
                                </motion.button>
                              );
                            })}
                          </div>

                          <motion.button
                            onClick={() => { close(); router.push(`/produits?search=${encodeURIComponent(query)}`); }}
                            whileHover={{ x: 4 }}
                            style={{
                              marginTop: 12, fontSize: 13, fontWeight: 700, color: palette.leaf,
                              background: "none", border: "none", cursor: "pointer",
                              display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
                            }}
                          >
                            Voir tous les résultats pour «&nbsp;{query}&nbsp;» →
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* ── Footer : raccourcis clavier ── */}
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  style={{
                    padding: "10px 40px",
                    borderTop: `1px solid ${palette.overlayBorder}`,
                    background: palette.overlayFoot,
                    display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
                  }}
                >
                  <Kbd isDark={isDark}>↑↓</Kbd>
                  <span style={{ fontSize: 11, color: palette.textMuted }}>naviguer</span>
                  <Kbd isDark={isDark}>↵</Kbd>
                  <span style={{ fontSize: 11, color: palette.textMuted }}>sélectionner</span>
                  <Kbd isDark={isDark}>esc</Kbd>
                  <span style={{ fontSize: 11, color: palette.textMuted }}>fermer</span>
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 10, color: palette.textMuted, fontWeight: 600 }}>
                    ⌘K pour ouvrir rapidement
                  </span>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

/* ── Helpers ──────────────────────────────────────────────────── */

function Kbd({ children, isDark = false }: { children: React.ReactNode; isDark?: boolean }) {
  return (
    <kbd style={{
      fontSize: 10,
      background: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.6)",
      color: isDark ? "rgba(232,240,234,0.8)" : "#4a7a60",
      borderRadius: 5,
      padding: "2px 7px",
      border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(160,210,185,0.5)",
      fontFamily: "monospace",
    }}>
      {children}
    </kbd>
  );
}

function highlight(text: string, query: string, isDark = false) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>{parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} style={{ background: isDark ? "rgba(125,192,64,0.18)" : "rgba(125,192,64,0.24)", color: isDark ? "#b8e27f" : "#5f972d", borderRadius: 3, padding: "0 1px" }}>{part}</mark>
        : part
    )}</>
  );
}

function SearchIcon({ color = "#7dc040", size = 15 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2.2} strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function XIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function SpinnerPine({ color = "#7dc040" }: { color?: string }) {
  return (
    <motion.svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2} strokeLinecap="round"
      animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </motion.svg>
  );
}