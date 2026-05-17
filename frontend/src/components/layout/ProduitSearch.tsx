"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const C = {
  sage:    "#2e7d4f",
  sageDk:  "#1b5e38",
  sageLt:  "#dff2e8",
  sageMd:  "#5bab79",
  leaf:    "#4a9e68",
  border:  "#b8d9c6",
  // Fond semi-transparent — laisse voir la page en dessous
  overlayBg:    "rgba(236, 248, 241, 0.82)",
  overlayTop:   "rgba(220, 242, 231, 0.88)",
  overlayFoot:  "rgba(210, 238, 224, 0.88)",
  overlayBorder:"rgba(180, 220, 200, 0.5)",
  textPrimary:  "#1a4a30",
  textSecondary:"#4a7a60",
  textMuted:    "#8ab89e",
  inputCaret:   "#4a9e68",
  tagBg:        "rgba(255,255,255,0.6)",
  tagBorder:    "rgba(150,210,180,0.6)",
  resultHover:  "rgba(200,235,215,0.5)",
  resultActive: "rgba(180,225,205,0.6)",
  highlight:    "rgba(100,190,140,0.25)",
};

interface Resultat {
  id_produit: number;
  nom:        string;
  slug:       string;
  division:   string;
  categorie?: { nom: string };
  marque?:    { nom: string };
  images:     { url: string; is_principale?: boolean }[];
}

interface SearchProps {
  onHero?:        boolean;
  navTextColor?:  string;
  navTextShadow?: string;
  logoSrc?:       string;
  logoAlt?:       string;
}

export function ProduitSearch({
  onHero        = false,
  navTextColor  = "#2e7d4f",
  navTextShadow = "none",
  logoSrc       = "/logos/logo-espace-vert.png",
  logoAlt       = "Logo",
}: SearchProps) {
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
      setResults((data.data ?? data) as Resultat[]);
    } catch { setResults([]); }
    finally   { setLoading(false); }
  }, []);

  const onInput = (v: string) => {
    setQuery(v);
    setActive(-1);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(v), 280);
  };

  const goTo = (slug: string) => { close(); router.push(`/produits/${slug}`); };

  const onKey = (e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    if (e.key === "Enter" && active >= 0) goTo(results[active].slug);
    if (e.key === "Enter" && active < 0 && query.trim()) {
      close(); router.push(`/produits?search=${encodeURIComponent(query)}`);
    }
    if (e.key === "Escape") close();
  };

  const QUICK_TAGS = [ "Biostimulant", "Semences"];

  const iconBorder = onHero ? "1.5px solid rgba(255,255,255,0.3)" : `1.5px solid ${C.border}`;
  const iconBg     = onHero ? "rgba(255,255,255,0.12)"            : C.sageLt;

  return (
    <>
      {/* ── Bouton icône recherche (navbar) ── */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        title="Rechercher (⌘K)"
        style={{
          width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 10, cursor: "pointer", flexShrink: 0,
          border: iconBorder, background: iconBg,
          color: onHero ? "#fff" : C.sage,
        }}
      >
        <SearchIcon color={onHero ? "#fff" : C.sage} size={17} />
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
                  background: C.overlayBg,
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  display: "flex",
                  flexDirection: "column",
                  borderBottomLeftRadius: 24,
                  borderBottomRightRadius: 24,
                  boxShadow: "0 16px 56px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.6)",
                  border: `1px solid ${C.overlayBorder}`,
                  borderTop: "none",
                  overflow: "hidden",
                }}
              >
                {/* ── Barre du haut : logo + fermer ── */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 40px",
                  flexShrink: 0,
                  background: C.overlayTop,
                  borderBottom: `1px solid ${C.overlayBorder}`,
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
                      color: C.textSecondary, display: "flex",
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
                      borderBottom: `1.5px solid ${C.border}`,
                      display: "flex", alignItems: "center", gap: 16,
                      paddingBottom: 14,
                    }}>
                      <SearchIcon color={C.textMuted} size={22} />
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
                          color: C.textPrimary, caretColor: C.inputCaret,
                          fontFamily: "inherit",
                        }}
                      />
                      <AnimatePresence mode="wait">
                        {loading ? (
                          <motion.span key="spin"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ display: "flex", alignItems: "center" }}>
                            <SpinnerPine color={C.textMuted} />
                          </motion.span>
                        ) : query ? (
                          <motion.button key="clear"
                            onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
                            initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.7 }} whileTap={{ scale: 0.85 }}
                            style={{
                              background: "none", border: "none", cursor: "pointer",
                              display: "flex", alignItems: "center", color: C.textMuted,
                            }}>
                            <XIcon size={18} />
                          </motion.button>
                        ) : (
                          <motion.button key="search-submit"
                            onClick={() => { if (query.trim()) { close(); router.push(`/produits?search=${encodeURIComponent(query)}`); } }}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{
                              background: "none", border: "none", cursor: "pointer",
                              display: "flex", alignItems: "center", color: C.textMuted,
                            }}>
                            <SearchIcon color={C.textMuted} size={20} />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Quick tags */}
                    <AnimatePresence>
                      {!query && !loading && (
                        <motion.div
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 10 }}
                        >
                          <span style={{
                            fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
                            textTransform: "uppercase", color: C.textMuted,
                            alignSelf: "center", marginRight: 4,
                          }}>
                            Tendances :
                          </span>
                          {QUICK_TAGS.map((tag, i) => (
                            <motion.button
                              key={tag}
                              onClick={() => onInput(tag)}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.14 + i * 0.04 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.96 }}
                              style={{
                                fontSize: 13, fontWeight: 500, padding: "6px 14px", borderRadius: 100,
                                border: `1px solid ${C.tagBorder}`, background: C.tagBg,
                                color: C.textSecondary, cursor: "pointer",
                                backdropFilter: "blur(4px)",
                              }}
                            >
                              {tag}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Aucun résultat */}
                    <AnimatePresence>
                      {!loading && query && results.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          style={{ marginTop: 32, textAlign: "center" }}
                        >
                          <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.2 }}>🌿</div>
                          <p style={{ fontSize: 15, color: C.textMuted }}>
                            Aucun résultat pour <span style={{ color: C.textPrimary, fontWeight: 600 }}>« {query} »</span>
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
                            textTransform: "uppercase", color: C.textMuted, marginBottom: 10,
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
                                  onClick={() => goTo(p.slug)}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.04 }}
                                  whileHover={{ x: 6, backgroundColor: C.resultHover }}
                                  whileTap={{ scale: 0.99 }}
                                  style={{
                                    width: "100%", display: "flex", alignItems: "center", gap: 14,
                                    padding: "10px 14px", border: "none", borderRadius: 10,
                                    background: isActive ? C.resultActive : "transparent",
                                    cursor: "pointer", textAlign: "left",
                                    borderLeft: isActive ? `3px solid ${C.leaf}` : "3px solid transparent",
                                    transition: "border-color 0.12s",
                                  }}
                                >
                                  <div style={{
                                    width: 40, height: 40, borderRadius: 8,
                                    background: "rgba(255,255,255,0.8)",
                                    border: `1px solid ${C.border}`,
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
                                      fontSize: 14, fontWeight: 600, color: C.textPrimary,
                                      letterSpacing: "-0.01em", whiteSpace: "nowrap",
                                      overflow: "hidden", textOverflow: "ellipsis",
                                    }}>
                                      {highlight(p.nom, query)}
                                    </p>
                                    <p style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                                      {[p.categorie?.nom, p.marque?.nom].filter(Boolean).join(" · ")}
                                    </p>
                                  </div>
                                  <span style={{
                                    fontSize: 9, fontWeight: 800, letterSpacing: "0.1em",
                                    textTransform: "uppercase", borderRadius: 5,
                                    padding: "3px 8px", flexShrink: 0,
                                    background: C.sageLt, color: C.sage,
                                    border: `1px solid ${C.border}`,
                                  }}>
                                    {p.division}
                                  </span>
                                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                                    stroke={C.textMuted} strokeWidth={2} strokeLinecap="round">
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
                              marginTop: 12, fontSize: 13, fontWeight: 700, color: C.leaf,
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
                    borderTop: `1px solid ${C.overlayBorder}`,
                    background: C.overlayFoot,
                    display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
                  }}
                >
                  <Kbd>↑↓</Kbd>
                  <span style={{ fontSize: 11, color: C.textMuted }}>naviguer</span>
                  <Kbd>↵</Kbd>
                  <span style={{ fontSize: 11, color: C.textMuted }}>sélectionner</span>
                  <Kbd>esc</Kbd>
                  <span style={{ fontSize: 11, color: C.textMuted }}>fermer</span>
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 600 }}>
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

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd style={{
      fontSize: 10,
      background: "rgba(255,255,255,0.6)",
      color: "#4a7a60",
      borderRadius: 5,
      padding: "2px 7px",
      border: "1px solid rgba(160,210,185,0.5)",
      fontFamily: "monospace",
    }}>
      {children}
    </kbd>
  );
}

function highlight(text: string, query: string) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>{parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} style={{ background: "rgba(125,192,64,0.25)", color: "#4a9e68", borderRadius: 3, padding: "0 1px" }}>{part}</mark>
        : part
    )}</>
  );
}

function SearchIcon({ color = "#2e7d4f", size = 15 }: { color?: string; size?: number }) {
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

function SpinnerPine({ color = "#2e7d4f" }: { color?: string }) {
  return (
    <motion.svg width={20} height={20} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2} strokeLinecap="round"
      animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </motion.svg>
  );
}