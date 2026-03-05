"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PhoneIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

import { ProductCardPremium } from "./components/ProductCard";
import { hexToRgba } from "@/lib/colors";
import {
  getGamme,
  flattenAll,
  countCategoryProducts,
  GAMMES,
} from "./components/FertivertData";
import type { Gamme } from "./components/FertivertData";

// ─── Palette site (depuis globals.css) ──────────────────────────────────────
// Hero : sombre vert forêt (comme le logo blanc)
// Corps : blanc / gris léger / vert site
const SITE = {
  // hero dark — basé sur vert foncé Espace Vert #006428
  heroBg:     "#0a2410",
  // verts exacts logos
  green:      "#1D6B2A",   // Espace Vert foncé
  greenMid:   "#2d8c35",   // Fertivert mid
  greenLeaf:  "#3CB648",   // Fertivert primary
  greenAccent:"#68cc74",   // Espace Vert lime
  // corps — blanc cassé naturel site
  bg:         "#f8fef8",
  surface:    "#ffffff",
  border:     "#e0e8e1",
  borderGreen:"rgba(40,180,60,0.18)",
  // textes
  textDark:   "#002810",   // vert très foncé
  textMid:    "#1a3d1e",
  textLight:  "#4a6b4e",
  textMuted:  "#8aa08c",
};

const FV = {
  pro:    { dark: "#0a2410", mid: "#1D6B2A", light: "#3CB648", pale: "#dcf5de", accent: "#3CB648" },
  garden: { dark: "#0a2410", mid: "#2d8c35", light: "#68cc74", pale: "#e8f8ea", accent: "#3CB648" },
};

// ─── buildTree ───────────────────────────────────────────────────────────────
function buildTree(gamme: Gamme) {
  if (gamme.id === "pro" && gamme.divisions) {
    return gamme.divisions.map((div) => ({
      id: div.id, label: div.name, subtitle: div.subtitle,
      cats: div.categories.map((cat) => ({
        id: `${div.id}__${cat.id}`, rawCatId: cat.id,
        label: cat.name, color: cat.color, Icon: cat.Icon,
        count: countCategoryProducts(cat),
        subs: (cat.subcategories ?? []).map((sub) => ({
          id: sub.id, label: sub.name, count: sub.products?.length ?? 0,
        })),
      })),
    }));
  }
  if (gamme.categories) {
    return [{
      id: "__root__", label: "", subtitle: "",
      cats: gamme.categories.map((cat) => ({
        id: cat.id, rawCatId: cat.id,
        label: cat.name, color: cat.color, Icon: cat.Icon,
        count: countCategoryProducts(cat),
        subs: (cat.subcategories ?? []).map((sub) => ({
          id: sub.id, label: sub.name, count: sub.products?.length ?? 0,
        })),
      })),
    }];
  }
  return [];
}

// ─── Facebook icon ───────────────────────────────────────────────────────────
const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
  </svg>
);

// ─── HeroSection ─────────────────────────────────────────────────────────────
function HeroSection({
  locale, gammeId, onGammeSwitch, tree, onCatSelect, selectedId,
}: {
  locale: string;
  gammeId: "pro" | "garden";
  onGammeSwitch: (g: "pro" | "garden") => void;
  tree: ReturnType<typeof buildTree>;
  onCatSelect: (id: string | null) => void;
  selectedId: string | null;
}) {
  type FbPhase = "hidden" | "in" | "open" | "closed";
  const [fbPhase, setFbPhase] = useState<FbPhase>("hidden");
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    t.current = setTimeout(() => {
      setFbPhase("in");
      t.current = setTimeout(() => {
        setFbPhase("open");
        t.current = setTimeout(() => setFbPhase("closed"), 2200);
      }, 700);
    }, 1200);
    return () => { if (t.current) clearTimeout(t.current); };
  }, []);

  const onEnter = () => { if (t.current) clearTimeout(t.current); setFbPhase("open"); };
  const onLeave = () => { t.current = setTimeout(() => setFbPhase("closed"), 300); };

  const allCats = tree.flatMap((div: ReturnType<typeof buildTree>[number]) => div.cats);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        height: "100vh",
        minHeight: 600,
        background: "linear-gradient(158deg, #050e07 0%, #091808 22%, #0d2a10 52%, #122e14 78%, #081008 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Grain */}
      <div className="absolute inset-0 pointer-events-none" style={{
        opacity: 0.09,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        mixBlendMode: "overlay",
      }} />

      {/* ── LOGO : positionné en absolu, couvre toute la zone haute ── */}
      <div
        className="absolute inset-x-0 top-0 flex items-center justify-center pointer-events-none"
        style={{ bottom: 200 }}
      >
        {/* Halo pulsant */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            width: "min(1000px, 130vw)", height: "min(1000px, 130vw)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(40,180,60,0.20) 0%, rgba(14,48,20,0.06) 52%, transparent 70%)",
            filter: "blur(70px)",
          }}
          animate={{ opacity: [0.45, 0.95, 0.45], scale: [0.93, 1.07, 0.93] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 1.16 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          style={{ position: "relative", width: "min(860px, 90vw)", height: "min(620px, 65vw)" }}
        >
          <motion.div
            className="w-full h-full relative"
            animate={{ y: [0, -16, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          >
            <Image
              src="/logos/LOGO_FERTiVERT.webp"
              alt="Fertivert"
              fill priority
              className="object-contain"
              style={{
                filter:
                  "drop-shadow(0 0 80px rgba(40,180,60,0.75))" +
                  " drop-shadow(0 0 160px rgba(40,180,60,0.30))" +
                  " drop-shadow(0 32px 80px rgba(0,0,0,0.82))",
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* ── FACEBOOK badge — ancré en bas à droite, au-dessus du switcher ── */}
      <div className="absolute z-20" style={{ bottom: 210, right: 32 }}>
        <AnimatePresence>
          {fbPhase !== "hidden" && (
            <motion.a
              href="https://www.facebook.com/profile.php?id=61566418239096&locale=fr_FR"
              target="_blank" rel="noopener noreferrer" aria-label="Fertivert sur Facebook"
              className="flex items-center rounded-full cursor-pointer select-none"
              style={{
                background: "rgba(9,28,12,0.90)",
                backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
                border: "1px solid rgba(40,180,60,0.45)",
                boxShadow: "0 6px 28px rgba(0,0,0,0.45), 0 0 18px rgba(40,180,60,0.14), inset 0 1px 0 rgba(255,255,255,0.06)",
                color: "white", overflow: "hidden", textDecoration: "none",
              }}
              initial={{ opacity: 0, x: 56 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 48 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={onEnter}
              onMouseLeave={onLeave}
            >
              <div style={{ width: 52, height: 52, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FacebookIcon />
              </div>
              <motion.div
                style={{ overflow: "hidden" }}
                animate={{ width: fbPhase === "open" ? 120 : 0, opacity: fbPhase === "open" ? 1 : 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <span style={{ display: "block", whiteSpace: "nowrap", paddingRight: 18, fontSize: 13, fontWeight: 600, letterSpacing: "0.02em", color: "rgba(255,255,255,0.92)" }}>
                  Suivez-nous
                </span>
              </motion.div>
            </motion.a>
          )}
        </AnimatePresence>
      </div>

      {/* ── Contenu bas : pills catégories + switcher ── */}
      <div className="absolute inset-x-0 bottom-0 z-10" style={{ background: "linear-gradient(to top, rgba(5,14,7,0.97) 0%, rgba(5,14,7,0.7) 60%, transparent 100%)" }}>

        {/* Pills catégories */}
        <div className="px-6 pt-6 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {allCats.map((cat, i) => {
              const active = selectedId === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => onCatSelect(active ? null : cat.id)}
                  initial={{ opacity: 0, scale: 0.82 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 + i * 0.045, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all"
                  style={{
                    background: active ? SITE.greenLeaf : "rgba(40,180,60,0.12)",
                    border: `1px solid ${active ? SITE.greenLeaf : "rgba(40,180,60,0.28)"}`,
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow: active ? `0 0 16px rgba(40,180,60,0.45)` : "none",
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{
                      background: active ? "rgba(0,0,0,0.25)" : "rgba(40,180,60,0.25)",
                      color: active ? "#fff" : SITE.greenLeaf,
                    }}
                  >
                    <cat.Icon className="w-3 h-3" />
                  </div>
                  <span
                    className="text-xs font-semibold whitespace-nowrap"
                    style={{ color: active ? "#fff" : "rgba(255,255,255,0.80)" }}
                  >
                    {cat.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        {/* Switcher Pro / Garden */}
        <div className="flex" style={{ borderTop: "1px solid rgba(40,180,60,0.12)" }}>
          {(["pro", "garden"] as const).map((g) => {
            const active = gammeId === g;
            return (
              <motion.button
                key={g}
                onClick={() => onGammeSwitch(g)}
                className="flex-1 flex items-center gap-4 px-8 py-5 text-left"
                style={{
                  background: active ? "rgba(40,180,60,0.08)" : "transparent",
                  borderTop: active ? `2px solid ${SITE.greenLeaf}` : "2px solid transparent",
                  borderRight: g === "pro" ? "1px solid rgba(40,180,60,0.08)" : "none",
                  transition: "background 0.2s",
                }}
                whileHover={{ background: active ? "rgba(40,180,60,0.11)" : "rgba(255,255,255,0.025)" }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: active ? SITE.greenLeaf : "rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  boxShadow: active ? `0 4px 18px rgba(40,180,60,0.4)` : "none",
                  transition: "all 0.2s",
                }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                    stroke={active ? "#071a09" : "rgba(255,255,255,0.35)"}
                    strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
                  >
                    {g === "pro"
                      ? <><path d="M20 5c0 0-8 0-13 5C4 13 4 19 4 19s6 0 9-3c5-5 5-11 7-11z"/><path d="M4 19l7-7"/></>
                      : <><path d="M2 20h20M6 20V11c0-3 2-5 4-6M12 20V9c0-4 3-6 5-7"/></>
                    }
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: active ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.3)", letterSpacing: "-0.01em" }}>
                    Fertivert {g === "pro" ? "Pro" : "Garden"}
                  </p>
                  <p style={{ fontSize: 11, color: active ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.18)" }}>
                    {g === "pro" ? "Agriculture professionnelle" : "Jardin & Gazon"}
                  </p>
                </div>
                {active && (
                  <div className="ml-auto flex items-center gap-2">
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: SITE.greenLeaf, boxShadow: `0 0 8px rgba(40,180,60,0.9)`, animation: "dotpulse 2s ease-in-out infinite" }} />
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: SITE.greenLeaf, textTransform: "uppercase" }}>Actif</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <style>{`@keyframes dotpulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>

      {/* Vague de transition */}
      <div className="absolute bottom-0 inset-x-0 z-0 pointer-events-none" style={{ transform: "translateY(1px)" }}>
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ width: "100%", height: 40, display: "block" }}>
          <path d="M0,20 C240,40 480,0 720,18 C900,32 1100,2 1300,16 C1380,22 1420,10 1440,20 L1440,40 L0,40 Z" fill={SITE.bg} />
        </svg>
      </div>
    </section>
  );
}
// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({
  gammeId, onGammeSwitch, tree, selectedId, onSelect, totalCount, filteredCount,
}: {
  gammeId: "pro" | "garden";
  onGammeSwitch: (g: "pro" | "garden") => void;
  tree: ReturnType<typeof buildTree>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  totalCount: number;
  filteredCount: number;
}) {
  const fv = FV[gammeId];
  const [openDivs, setOpenDivs] = useState<Record<string, boolean>>({});
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const divs: Record<string, boolean> = {};
    const cats: Record<string, boolean> = {};
    tree.forEach((div) => {
      divs[div.id] = true;
      div.cats.forEach((cat) => { cats[cat.id] = false; });
    });
    setOpenDivs(divs);
    setOpenCats(cats);
  }, [gammeId]);

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col gap-3">

      {/* Switcher */}
      <div className="rounded-2xl p-1.5 flex gap-1" style={{ background: SITE.textDark }}>
        {(["pro", "garden"] as const).map((g) => {
          const active = gammeId === g;
          return (
            <button
              key={g}
              onClick={() => onGammeSwitch(g)}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-black tracking-wide transition-all duration-200"
              style={{
                background: active ? fv.accent : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.4)",
                boxShadow: active ? `0 2px 12px rgba(40,180,60,0.35)` : "none",
              }}
            >
              {g === "pro" ? "Pro" : "Garden"}
            </button>
          );
        })}
      </div>

      {/* Compteur */}
      <div className="rounded-xl px-4 py-2.5 flex items-center justify-between" style={{ background: SITE.surface, border: `1px solid ${SITE.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-2">
          <AdjustmentsHorizontalIcon className="w-4 h-4" style={{ color: fv.mid }} />
          <span className="text-[13px] font-semibold" style={{ color: SITE.textDark }}>
            {filteredCount === totalCount ? `${totalCount} produits` : `${filteredCount} / ${totalCount}`}
          </span>
        </div>
        {selectedId && (
          <button onClick={() => onSelect(null)} className="text-[11px] font-bold flex items-center gap-1 hover:opacity-70 transition-opacity" style={{ color: fv.mid }}>
            <XMarkIcon className="w-3.5 h-3.5" /> Tout
          </button>
        )}
      </div>

      {/* Arbre filtres */}
      <div className="rounded-2xl overflow-hidden flex-1" style={{ border: `1px solid ${SITE.border}`, background: SITE.surface, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
        {tree.map((div, di) => (
          <div key={div.id}>
            {div.id !== "__root__" && (
              <button
                onClick={() => setOpenDivs((p) => ({ ...p, [div.id]: !p[div.id] }))}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                style={{
                  background: di === 0
                    ? `linear-gradient(135deg, ${fv.dark}, ${fv.mid})`
                    : `linear-gradient(135deg, #143320, #1e5232)`,
                  borderTop: di > 0 ? "1px solid rgba(255,255,255,0.06)" : undefined,
                }}
              >
                <div>
                  <p className="text-[13px] font-black text-white">{div.label}</p>
                  {div.subtitle && <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{div.subtitle}</p>}
                </div>
                <ChevronDownIcon className="w-4 h-4 flex-shrink-0 transition-transform duration-200" style={{ color: "rgba(255,255,255,0.5)", transform: openDivs[div.id] ? "rotate(180deg)" : "rotate(0deg)" }} />
              </button>
            )}

            <AnimatePresence initial={false}>
              {(div.id === "__root__" || openDivs[div.id]) && (
                <motion.div
                  initial={div.id === "__root__" ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {div.cats.map((cat, ci) => (
                    <div key={cat.id} style={{ borderTop: ci > 0 || div.id !== "__root__" ? `1px solid ${SITE.border}` : undefined }}>
                      <div className="flex items-center" style={{
                        background: selectedId === cat.id ? hexToRgba(fv.pale, 0.9) : "transparent",
                        borderLeft: selectedId === cat.id ? `3px solid ${fv.accent}` : "3px solid transparent",
                      }}>
                        <button
                          onClick={() => {
                            onSelect(selectedId === cat.id ? null : cat.id);
                            if (cat.subs.length > 0) setOpenCats((p) => ({ ...p, [cat.id]: !p[cat.id] }));
                          }}
                          className="flex-1 flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                        >
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                            background: selectedId === cat.id ? fv.mid : hexToRgba(cat.color || fv.mid, 0.1),
                            color: selectedId === cat.id ? "white" : cat.color || fv.mid,
                          }}>
                            <cat.Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[12px] font-bold flex-1 leading-tight" style={{ color: selectedId === cat.id ? fv.dark : SITE.textMid }}>
                            {cat.label}
                          </span>
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md flex-shrink-0" style={{
                            background: selectedId === cat.id ? hexToRgba(fv.mid, 0.12) : "#f3f4f6",
                            color: selectedId === cat.id ? fv.dark : SITE.textMuted,
                          }}>
                            {cat.count}
                          </span>
                        </button>
                        {cat.subs.length > 0 && (
                          <button onClick={() => setOpenCats((p) => ({ ...p, [cat.id]: !p[cat.id] }))} className="px-2 py-2.5 hover:bg-gray-50 transition-colors">
                            <ChevronRightIcon className="w-3.5 h-3.5 text-gray-300 transition-transform duration-200" style={{ transform: openCats[cat.id] ? "rotate(90deg)" : "rotate(0deg)" }} />
                          </button>
                        )}
                      </div>

                      <AnimatePresence initial={false}>
                        {openCats[cat.id] && cat.subs.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
                            className="overflow-hidden bg-gray-50/60"
                          >
                            {cat.subs.map((sub) => (
                              <button
                                key={sub.id}
                                onClick={() => onSelect(selectedId === sub.id ? null : sub.id)}
                                className="w-full flex items-center gap-2 pl-12 pr-4 py-2 text-left hover:bg-gray-50 transition-colors"
                                style={{
                                  background: selectedId === sub.id ? hexToRgba(fv.pale, 0.6) : undefined,
                                  borderLeft: selectedId === sub.id ? `3px solid ${fv.light}` : "3px solid transparent",
                                }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: selectedId === sub.id ? fv.mid : "#d1d5db" }} />
                                <span className="text-[11px] font-medium flex-1 truncate" style={{ color: selectedId === sub.id ? fv.dark : "#6b7280" }}>
                                  {sub.label}
                                </span>
                                <span className="text-[10px] text-gray-400">{sub.count}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

    </aside>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function FertivertPage() {
  const searchParams = useSearchParams();
  const locale = useLocale();

  const [gammeId, setGammeId] = useState<"pro" | "garden">("pro");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const gamme = getGamme(gammeId);
  const fv = FV[gammeId];
  const tree = buildTree(gamme);
  const allProducts = flattenAll(gammeId);

  const filtered = allProducts.filter((p) => {
    if (searchTerm) {
      const sl = searchTerm.toLowerCase();
      if (!p.name.toLowerCase().includes(sl) && !p.description?.toLowerCase().includes(sl) && !(p.subName ?? "").toLowerCase().includes(sl) && !(p.catName ?? "").toLowerCase().includes(sl)) return false;
    }
    if (selectedId) {
      const compositeId = `${p.divisionId}__${p.catId}`;
      if (p.catId !== selectedId && p.subId !== selectedId && compositeId !== selectedId) return false;
    }
    return true;
  });

  const handleGammeSwitch = (g: "pro" | "garden") => {
    setGammeId(g); setSelectedId(null); setSearchTerm("");
  };

  useEffect(() => {
    const g = searchParams.get("division");
    if (g === "pro" || g === "garden") setGammeId(g);
    const c = searchParams.get("category");
    if (c) setSelectedId(c);
  }, [searchParams]);

  const selectedLabel = (() => {
    if (!selectedId) return null;
    for (const div of tree) {
      for (const cat of div.cats) {
        if (cat.id === selectedId) return cat.label;
        for (const sub of cat.subs) { if (sub.id === selectedId) return sub.label; }
      }
    }
    return null;
  })();

  return (
    <div className="min-h-screen" style={{ backgroundColor: SITE.bg }}>

      <HeroSection locale={locale} gammeId={gammeId} onGammeSwitch={handleGammeSwitch} tree={tree} onCatSelect={setSelectedId} selectedId={selectedId} />

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-7">
        <div className="flex gap-6 items-start">

          <Sidebar
            gammeId={gammeId} onGammeSwitch={handleGammeSwitch}
            tree={tree} selectedId={selectedId} onSelect={setSelectedId}
            totalCount={allProducts.length} filteredCount={filtered.length}
          />

          <div className="flex-1 min-w-0">

            {/* Barre contrôle — blanc comme le reste du site */}
            <div
              className="rounded-2xl px-4 py-3 mb-5 flex flex-wrap gap-3 items-center"
              style={{ background: SITE.surface, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: `1px solid ${SITE.border}` }}
            >
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-bold border transition-colors"
                style={{ borderColor: hexToRgba(fv.mid, 0.25), color: fv.dark }}
              >
                <FunnelIcon className="w-4 h-4" />
                Filtres
                {selectedId && <span className="w-2 h-2 rounded-full" style={{ background: fv.accent }} />}
              </button>

              {selectedLabel && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm" style={{ background: hexToRgba(fv.accent, 0.1), color: fv.dark, border: `1px solid ${hexToRgba(fv.accent, 0.2)}` }}>
                  <span className="font-bold">{selectedLabel}</span>
                  <button onClick={() => setSelectedId(null)} className="ml-1 w-4 h-4 rounded-full flex items-center justify-center hover:opacity-70" style={{ background: hexToRgba(fv.mid, 0.2) }}>
                    <XMarkIcon className="w-2.5 h-2.5" style={{ color: fv.dark }} />
                  </button>
                </div>
              )}

              <div className="flex-1" />

              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un produit…"
                  className="pl-9 pr-8 py-2 rounded-xl text-[13px] font-medium outline-none transition-all border"
                  style={{ width: searchTerm ? 220 : 190, borderColor: searchTerm ? fv.mid : SITE.border, background: SITE.bg, color: SITE.textDark }}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    <XMarkIcon className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </div>

              <span className="text-[13px] font-bold px-3 py-2 rounded-xl" style={{ background: hexToRgba(fv.mid, 0.07), color: fv.dark }}>
                {filtered.length} produit{filtered.length > 1 ? "s" : ""}
              </span>

              <div className="flex gap-0.5 p-1 rounded-xl" style={{ background: "#f3f4f6" }}>
                {(["grid", "list"] as const).map((m) => (
                  <button key={m} onClick={() => setViewMode(m)} className="p-1.5 rounded-lg transition-all" style={{ background: viewMode === m ? fv.mid : "transparent", color: viewMode === m ? "white" : "#9ca3af" }}>
                    {m === "grid" ? <Squares2X2Icon className="w-4 h-4" /> : <ListBulletIcon className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Produits */}
            <AnimatePresence mode="wait">
              {filtered.length > 0 ? (
                <motion.div
                  key={`${viewMode}-${gammeId}-${selectedId}`}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" : "flex flex-col gap-3"}
                >
                  {filtered.map((product) => (
                    <ProductCardPremium key={product.id} product={product} accentColor={fv.mid} locale={locale} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-24 rounded-2xl"
                  style={{ background: SITE.surface, border: `1px solid ${SITE.border}` }}
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: hexToRgba(fv.mid, 0.08) }}>
                    <MagnifyingGlassIcon className="w-7 h-7" style={{ color: hexToRgba(fv.mid, 0.4) }} />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: SITE.textDark }}>Aucun produit trouvé</h3>
                  <p className="text-sm mb-5" style={{ color: SITE.textLight }}>Modifiez vos critères de recherche</p>
                  <button
                    onClick={() => { setSelectedId(null); setSearchTerm(""); }}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
                    style={{ background: fv.mid }}
                  >
                    Réinitialiser
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Sidebar mobile */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: "rgba(0,0,0,0.55)" }}
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto lg:hidden p-4"
              style={{ background: SITE.bg }}
            >
              <div className="flex items-center justify-between mb-4 pt-2">
                <span className="text-sm font-black" style={{ color: SITE.textDark }}>Filtres</span>
                <button onClick={() => setMobileSidebarOpen(false)}>
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <Sidebar
                gammeId={gammeId}
                onGammeSwitch={(g) => { handleGammeSwitch(g); setMobileSidebarOpen(false); }}
                tree={tree} selectedId={selectedId}
                onSelect={(id) => { setSelectedId(id); setMobileSidebarOpen(false); }}
                totalCount={allProducts.length} filteredCount={filtered.length}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}