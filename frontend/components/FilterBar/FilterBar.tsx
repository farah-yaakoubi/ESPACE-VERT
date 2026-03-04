"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";

export interface FilterProduct { id: string; label: string; }
export interface FilterSubCategory { id: string; label: string; count?: number; products?: FilterProduct[]; }
export interface FilterCategory { id: string; label: string; shortLabel?: string; count?: number; subcategories?: FilterSubCategory[]; }
export interface FilterBarProProps {
  logo?: string; logoAlt?: string;
  categories: FilterCategory[];
  selectedId: string | null;
  onSelect: (categoryId: string | null, subId?: string | null) => void;
  onReset: () => void;
  accentColor?: string;
  facebookUrl?: string;
}

function groupOf(cat: FilterCategory) {
  const p = cat.label.split(/\s*[→>]+\s*/);
  return p.length > 1 ? p[0].trim() : "Autres";
}
function shortOf(cat: FilterCategory) {
  if (cat.shortLabel) return cat.shortLabel;
  const p = cat.label.split(/\s*[→>]+\s*/);
  return p[p.length - 1].trim();
}
function rgba(hex: string, a: number) {
  return `rgba(${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)},${a})`;
}

const GROUP_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  agriculture: { icon: "🌾", color: "#92400e", bg: "#fef3c7" },
  gazon:       { icon: "🌿", color: "#065f46", bg: "#d1fae5" },
  garden:      { icon: "🏡", color: "#1e40af", bg: "#dbeafe" },
};
function getGroupStyle(name: string) {
  const key = Object.keys(GROUP_ICONS).find(k => name.toLowerCase().includes(k));
  return key ? GROUP_ICONS[key] : { icon: "📦", color: "#374151", bg: "#f3f4f6" };
}

function ProductTooltip({ sub, accent, onPick }: { sub: FilterSubCategory; accent: string; onPick: () => void; }) {
  if (!sub.products?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.96 }}
      transition={{ duration: 0.13, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl overflow-hidden"
      style={{ minWidth: 200, maxWidth: 280, boxShadow: `0 12px 40px ${rgba(accent,0.14)}, 0 0 0 1px ${rgba(accent,0.07)}` }}
    >
      <div className="h-[2px]" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
      <div className="p-2">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.16em] px-2 py-1.5">
          {sub.label} · {sub.products.length} produits
        </p>
        {sub.products.slice(0, 7).map(p => (
          <button key={p.id} onClick={onPick}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-gray-50 group transition-colors">
            <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: rgba(accent,0.5) }} />
            <span className="text-[12px] font-medium text-gray-500 group-hover:text-gray-900 truncate">{p.label}</span>
          </button>
        ))}
        {sub.products.length > 7 && (
          <button onClick={onPick}
            className="w-full text-center text-[11px] font-black mt-1 pt-1.5 border-t border-gray-50 hover:opacity-70 transition-opacity"
            style={{ color: accent }}>
            +{sub.products.length - 7} autres →
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function FilterBarPro({ categories, selectedId, onSelect, onReset, accentColor = "#37b648" }: FilterBarProProps) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [hoveredSub, setHoveredSub] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const gTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const subTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasFilter = selectedId !== null;

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setActiveGroup(null); setHoveredSub(null); setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const grouped = categories.reduce<Record<string, FilterCategory[]>>((acc, cat) => {
    const g = groupOf(cat); if (!acc[g]) acc[g] = []; acc[g].push(cat); return acc;
  }, {});
  const groupEntries = Object.entries(grouped);
  const activeCats = activeGroup ? (grouped[activeGroup] ?? []) : [];

  const enterGroup = useCallback((g: string) => { clearTimeout(gTimers.current[g]); setActiveGroup(g); }, []);
  const leaveGroup = useCallback((g: string) => { gTimers.current[g] = setTimeout(() => setActiveGroup(c => c === g ? null : c), 200); }, []);
  const keepGroup = useCallback(() => { Object.values(gTimers.current).forEach(clearTimeout); }, []);

  const enterSub = useCallback((id: string) => { if (subTimer.current) clearTimeout(subTimer.current); setHoveredSub(id); }, []);
  const leaveSub = useCallback(() => { subTimer.current = setTimeout(() => setHoveredSub(null), 130); }, []);
  const keepSub = useCallback(() => { if (subTimer.current) clearTimeout(subTimer.current); }, []);

  const pick = (catId: string | null, subId?: string | null) => { onSelect(catId, subId); setActiveGroup(null); setHoveredSub(null); setMobileOpen(false); };
  const reset = () => { onReset(); setActiveGroup(null); setHoveredSub(null); };

  return (
    <div ref={wrapRef} className="bg-white border-b border-gray-100/80"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>

      {/* ══════════ DESKTOP ══════════ */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-6">

          {/* LIGNE 1 ─ Tous + boutons groupes + Reset */}
          <div className="flex items-center gap-3 h-16">

            {/* Bouton Tous */}
            <button onClick={reset}
              className="flex items-center gap-2 h-9 px-5 rounded-xl text-[13px] font-bold transition-all flex-shrink-0"
              style={{
                background: !hasFilter && !activeGroup ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` : "transparent",
                color: !hasFilter && !activeGroup ? "#fff" : "#6b7280",
                border: `1.5px solid ${!hasFilter && !activeGroup ? accentColor : "#e5e7eb"}`,
                boxShadow: !hasFilter && !activeGroup ? `0 3px 14px ${rgba(accentColor,0.3)}` : "none",
              }}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M2 4h12M4 8h8M6 12h4" strokeLinecap="round" />
              </svg>
              Tous
            </button>

            {/* Séparateur */}
            <div className="h-6 w-px bg-gray-200 flex-shrink-0" />

            {/* Boutons groupes — GRANDS et visibles */}
            <div className="flex items-center gap-3">
              {groupEntries.map(([grp, cats]) => {
                const isActive = activeGroup === grp;
                const gs = getGroupStyle(grp);
                const hasActiveFilter = cats.some(c => selectedId === c.id || c.subcategories?.some(s => selectedId === s.id));
                const total = cats.reduce((n, c) => n + (c.count ?? 0), 0);

                return (
                  <div key={grp} className="relative"
                    onMouseEnter={() => enterGroup(grp)}
                    onMouseLeave={() => leaveGroup(grp)}>

                    <button
                      onClick={() => setActiveGroup(isActive ? null : grp)}
                      className="relative flex items-center gap-2.5 h-10 px-5 rounded-xl font-bold transition-all"
                      style={{
                        fontSize: "14px",
                        background: isActive
                          ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`
                          : hasActiveFilter
                          ? `linear-gradient(135deg, ${accentColor}22, ${accentColor}11)`
                          : gs.bg,
                        color: isActive ? "#fff" : hasActiveFilter ? accentColor : gs.color,
                        border: `2px solid ${isActive ? accentColor : hasActiveFilter ? accentColor : "transparent"}`,
                        boxShadow: isActive ? `0 4px 16px ${rgba(accentColor,0.3)}` : "none",
                      }}>
                      {/* Icône */}
                      <span className="text-lg leading-none">{gs.icon}</span>
                      {/* Nom du groupe */}
                      <span className="font-black">{grp}</span>
                      {/* Compteur */}
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-full tabular-nums"
                        style={{
                          background: isActive ? "rgba(255,255,255,0.22)" : rgba(accentColor, 0.12),
                          color: isActive ? "#fff" : accentColor,
                        }}>
                        {total}
                      </span>
                      {/* Chevron animé */}
                      <motion.svg
                        animate={{ rotate: isActive ? 180 : 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="w-3.5 h-3.5"
                        style={{ opacity: isActive ? 1 : 0.5 }}
                        viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                      </motion.svg>
                      {/* Point filtre actif */}
                      {hasActiveFilter && !isActive && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white"
                          style={{ backgroundColor: accentColor }} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Filtre actif info + Reset */}
            <AnimatePresence>
              {hasFilter && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-gray-500">Filtre actif</span>
                  <button onClick={reset}
                    className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-[12px] font-bold transition-all hover:opacity-80"
                    style={{ background: rgba(accentColor,0.08), color: accentColor, border: `1.5px solid ${rgba(accentColor,0.2)}` }}>
                    <XMarkIcon className="w-3.5 h-3.5" />
                    Effacer
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* LIGNE 2 ─ Sous-filtres expand */}
          <AnimatePresence>
            {activeGroup && activeCats.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-visible"
                onMouseEnter={keepGroup}
                onMouseLeave={() => leaveGroup(activeGroup)}>

                <div className="flex items-start gap-6 py-3 border-t flex-wrap"
                  style={{ borderColor: rgba(accentColor, 0.08) }}>

                  {activeCats.map((cat) => (
                    <div key={cat.id} className="flex flex-col gap-1.5">
                      {/* Label catégorie */}
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-1">
                        {shortOf(cat)}
                      </span>
                      {/* Sous-catégories */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {cat.subcategories && cat.subcategories.length > 0
                          ? cat.subcategories.map(sub => {
                            const isSubActive = selectedId === sub.id;
                            const isSubHovered = hoveredSub === sub.id;
                            return (
                              <div key={sub.id} className="relative"
                                onMouseEnter={() => enterSub(sub.id)} onMouseLeave={leaveSub}>
                                <button
                                  onClick={() => pick(cat.id, sub.id)}
                                  className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12px] font-semibold transition-all whitespace-nowrap"
                                  style={{
                                    background: isSubActive
                                      ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`
                                      : isSubHovered ? rgba(accentColor, 0.07) : "#f8fafc",
                                    color: isSubActive ? "#fff" : "#374151",
                                    border: `1.5px solid ${isSubActive ? accentColor : isSubHovered ? rgba(accentColor,0.25) : "#e2e8f0"}`,
                                    boxShadow: isSubActive ? `0 2px 8px ${rgba(accentColor,0.25)}` : "none",
                                  }}>
                                  {sub.label}
                                  {sub.count != null && (
                                    <span className="text-[10px] font-black px-1.5 rounded-full leading-5 tabular-nums"
                                      style={{
                                        background: isSubActive ? "rgba(255,255,255,0.22)" : rgba(accentColor,0.1),
                                        color: isSubActive ? "#fff" : accentColor,
                                      }}>
                                      {sub.count}
                                    </span>
                                  )}
                                </button>
                                <AnimatePresence>
                                  {isSubHovered && (
                                    <div onMouseEnter={keepSub} onMouseLeave={leaveSub}>
                                      <ProductTooltip sub={sub} accent={accentColor} onPick={() => pick(cat.id, sub.id)} />
                                    </div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })
                          : (
                            <button onClick={() => pick(cat.id)}
                              className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12px] font-semibold transition-all"
                              style={{
                                background: selectedId === cat.id ? `linear-gradient(135deg,${accentColor},${accentColor}cc)` : "#f8fafc",
                                color: selectedId === cat.id ? "#fff" : "#374151",
                                border: `1.5px solid ${selectedId === cat.id ? accentColor : "#e2e8f0"}`,
                              }}>
                              {shortOf(cat)}
                              {cat.count != null && (
                                <span className="text-[10px] font-black px-1.5 rounded-full leading-5 tabular-nums"
                                  style={{ background: rgba(accentColor,0.1), color: accentColor }}>
                                  {cat.count}
                                </span>
                              )}
                            </button>
                          )
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ══════════ MOBILE ══════════ */}
      <div className="lg:hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-13 py-2">
            <span className="text-sm font-bold text-gray-600 flex items-center gap-2">
              {hasFilter && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />}
              {hasFilter ? "Filtre actif" : "Tous les produits"}
            </span>
            <div className="flex items-center gap-2">
              {hasFilter && (
                <button onClick={reset}
                  className="flex items-center gap-1 h-8 px-3 rounded-xl text-[11px] font-bold"
                  style={{ background: rgba(accentColor,0.08), color: accentColor }}>
                  <XMarkIcon className="w-3.5 h-3.5" /> Effacer
                </button>
              )}
              <button onClick={() => setMobileOpen(v => !v)}
                className="flex items-center gap-2 h-8 px-3 rounded-xl text-[12px] font-bold transition-all"
                style={{ background: mobileOpen ? accentColor : rgba(accentColor,0.09), color: mobileOpen ? "#fff" : accentColor }}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M2 4h12M4 8h8M6 12h4" strokeLinecap="round" />
                </svg>
                Filtres
              </button>
            </div>
          </div>
          <AnimatePresence>
            {mobileOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-gray-100">
                <div className="py-3 space-y-4">
                  <button onClick={reset}
                    className="flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-bold w-full justify-center"
                    style={{ background: !hasFilter ? accentColor : rgba(accentColor,0.06), color: !hasFilter ? "#fff" : "#374151" }}>
                    Tous les produits
                  </button>
                  {groupEntries.map(([grp, cats]) => {
                    const gs = getGroupStyle(grp);
                    return (
                      <div key={grp} className="space-y-2">
                        <p className="text-[12px] font-black uppercase tracking-wider flex items-center gap-2 px-1"
                          style={{ color: gs.color }}>
                          <span>{gs.icon}</span>{grp}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {cats.flatMap(cat =>
                            cat.subcategories?.map(sub => {
                              const isActive = selectedId === sub.id;
                              return (
                                <button key={sub.id} onClick={() => pick(cat.id, sub.id)}
                                  className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12px] font-semibold"
                                  style={{ background: isActive ? accentColor : rgba(accentColor,0.07), color: isActive ? "#fff" : "#374151", border: `1px solid ${isActive ? accentColor : "transparent"}` }}>
                                  {sub.label}
                                  {sub.count != null && (
                                    <span className="text-[10px] font-black px-1.5 rounded-full leading-5"
                                      style={{ background: isActive ? "rgba(255,255,255,0.22)" : rgba(accentColor,0.15), color: isActive ? "#fff" : accentColor }}>
                                      {sub.count}
                                    </span>
                                  )}
                                </button>
                              );
                            }) ?? [
                              <button key={cat.id} onClick={() => pick(cat.id)}
                                className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12px] font-semibold"
                                style={{ background: selectedId === cat.id ? accentColor : rgba(accentColor,0.07), color: selectedId === cat.id ? "#fff" : "#374151" }}>
                                {shortOf(cat)}
                              </button>
                            ]
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default FilterBarPro;