"use client";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProduitSearch } from "./ProduitSearch";
import { useTheme } from "@/components/ThemeProvider";

const NAV_H  = 80;
const BASE   = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const C = {
  sage:"#2e7d4f",sageDk:"#1b5e38",sageMd:"#5bab79",sageLt:"#dff2e8",
  logo:"#7dc040",logoDk:"#5f972d",logoLt:"#eef8e4",logoBorder:"#cfe5b5",
  sagePastel:"#e8f5ee",sagePastel2:"#c8eada",sageIcon:"#a8d5b8",
  stone:"#f6f4f0",stone2:"#ede9e3",line:"rgba(46,125,79,0.12)",
  ink:"#111816",ink2:"#3d5248",ink3:"#8da898",ink4:"#bbd4c4",
  border:"#c9e0d3",gradA:"#1b5e38",gradB:"#38a169",gradC:"#6fcf97",
  ddBg:"#f4faf7",ddBgSide:"linear-gradient(180deg,#edf8f2,#dff2e8 60%,#caebd8 100%)",
  /* Dark mode */
  darkMenuBg:"#162117",darkMenuBorder:"rgba(255,255,255,0.07)",
  darkInk:"#e8f0ea",darkInk2:"rgba(232,240,234,0.7)",darkInk3:"rgba(232,240,234,0.4)",
};

const TY = {
  navLink:   { fontSize:15, fontWeight:600, letterSpacing:"0.02em"  } as React.CSSProperties,
  navLinkOn: { fontSize:15, fontWeight:800, letterSpacing:"0.02em"  } as React.CSSProperties,
  ddItemName:{ fontSize:14, fontWeight:600, letterSpacing:"-0.01em" } as React.CSSProperties,
  ddItemDesc:{ fontSize:12, fontWeight:400, letterSpacing:"0em"     } as React.CSSProperties,
  secLabel:  { fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase" as const } as React.CSSProperties,
  cta:       { fontSize:14, fontWeight:700, letterSpacing:"0.02em"  } as React.CSSProperties,
  mobileLink:{ fontSize:15, fontWeight:600, letterSpacing:"0.01em"  } as React.CSSProperties,
};

const Ico = {
  Leaf:  (p:any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="M20 5c0 0-8 0-13 5C4 13 4 19 4 19s6 0 9-3c5-5 5-11 7-11z"/><path d="M4 19l7-7"/></svg>,
  Cal:   (p:any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  Menu:  (p:any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>,
  X:     (p:any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  ChevR: (p:any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}><path d="M9 18l6-6-6-6"/></svg>,
};

interface CatItem  { id_categorie:number; nom:string; slug:string; parent_id:number|null; ordre:number; sous_cats?:CatItem[]; }
interface Activite { id_activite:number; nom:string; slug:string; description:string|null; image:string|null; categories?:CatItem[]; }
interface Marque   { id_marque:number; nom:string; slug:string; logo:string|null; description:string|null; categories?:CatItem[]; }

function TreePines({ color="#e2ede7", h=60 }: { color?:string; h?:number }) {
  const pines = [{x:0,w:18,h:48},{x:14,w:22,h:60},{x:30,w:16,h:42},{x:44,w:24,h:64},{x:62,w:18,h:50},{x:76,w:20,h:55},{x:92,w:15,h:38},{x:104,w:26,h:68},{x:124,w:18,h:46},{x:138,w:22,h:58},{x:154,w:16,h:40},{x:166,w:24,h:62},{x:184,w:20,h:52},{x:200,w:18,h:44},{x:214,w:26,h:70},{x:234,w:16,h:36},{x:246,w:22,h:56},{x:262,w:18,h:48},{x:276,w:24,h:64},{x:294,w:20,h:50}];
  return (
    <svg viewBox={`0 0 320 ${h}`} preserveAspectRatio="xMidYMax meet" style={{ width:"100%", height:h, display:"block" }} aria-hidden="true">
      {pines.map((p,i) => {
        const tw=p.w*.22,th=p.h*.18,tx=p.x+p.w/2-tw/2;
        return <g key={i} fill={color}><polygon points={`${p.x+p.w/2},${h-p.h} ${p.x},${h-th} ${p.x+p.w},${h-th}`}/><rect x={tx} y={h-th} width={tw} height={th}/></g>;
      })}
    </svg>
  );
}

function useHover(delay=180) {
  const [open, setOpen] = useState(false);
  const t = useRef<any>(null);
  const show = useCallback(() => { t.current && clearTimeout(t.current); setOpen(true); }, []);
  const hide = useCallback(() => { t.current = setTimeout(() => setOpen(false), delay); }, [delay]);
  const keep = useCallback(() => { t.current && clearTimeout(t.current); }, []);
  useEffect(() => () => { t.current && clearTimeout(t.current); }, []);
  return { open, show, hide, keep };
}

/* ── ActivitesDropdown — style minimaliste vert/blanc/noir ─────────────────── */
function ActivitesDropdown({
  activites,
  onClose,
  isDark,
}: {
  activites: Activite[];
  onClose: () => void;
  isDark: boolean;
}) {
  const [hovAct, setHovAct] = useState<number|null>(activites[0]?.id_activite ?? null);
  const [hovCat, setHovCat] = useState<string|null>(null);

  const act = activites.find(a => a.id_activite === hovAct);

  useEffect(() => {
    if (act?.categories && act.categories.length > 0) {
      setHovCat(act.categories[0].slug);
    } else {
      setHovCat(null);
    }
  }, [hovAct]);

  const cat = act?.categories?.find(c => c.slug === hovCat);
  const hasSousCats = cat?.sous_cats && cat.sous_cats.length > 0;

  /* shared row styles */
  const col1W = 172;
  const col2W = 192;
  const col3W = 176;
  const panelBg = isDark ? "#162117" : "#fff";
  const panelAltBg = isDark ? "#1e2d22" : "#fafafa";
  const panelBorder = isDark ? "rgba(255,255,255,0.08)" : "#111816";
  const mutedBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(17,24,22,0.1)";
  const titleColor = isDark ? C.darkInk3 : C.ink3;
  const textColor = isDark ? C.darkInk : C.ink;
  const softTextColor = isDark ? C.darkInk2 : C.ink2;
  const rowHoverBg = isDark ? "#243520" : "#f5f5f5";
  const shadow = isDark
    ? "0 24px 60px rgba(0,0,0,0.38),0 0 0 1px rgba(255,255,255,0.03)"
    : "4px 4px 0px #111816";

  return (
    <div style={{
      display:"flex",
      width: hasSousCats ? col1W+col2W+col3W : col1W+col2W,
      transition:"width 0.18s cubic-bezier(.4,0,.2,1)",
      background: panelBg,
      borderRadius:14,
      overflow:"hidden",
      border:`1.5px solid ${panelBorder}`,
      boxShadow: shadow,
    }}>

      {/* ── Col 1 — activités ── */}
      <div style={{ width:col1W, flexShrink:0, borderRight:`1.5px solid ${panelBorder}`, display:"flex", flexDirection:"column" }}>
        {/* header */}
        <div style={{ padding:"10px 14px 8px", borderBottom:`1px solid ${mutedBorder}` }}>
          <span style={{ ...TY.secLabel, color:C.sage, letterSpacing:"0.12em" }}>Activités</span>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"4px 0" }}>
          {activites.length === 0 ? (
            <p style={{ padding:"10px 14px", ...TY.ddItemDesc, color:titleColor }}>Chargement…</p>
          ) : activites.map((a, i) => {
            const on = hovAct === a.id_activite;
            return (
              <motion.div key={a.id_activite} initial={{ opacity:0, x:-3 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.035 }}>
                <div
                  onMouseEnter={() => setHovAct(a.id_activite)}
                  style={{
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"8px 10px 8px 14px", cursor:"default",
                    background: on ? C.sage : "transparent",
                    transition:"background 0.12s",
                  }}
                >
                    <p style={{ ...TY.ddItemName, fontSize:13, color: on ? "#fff" : textColor, margin:0, transition:"color 0.12s", flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {a.nom}
                    </p>
                  {a.categories && a.categories.length > 0 && (
                    <Ico.ChevR style={{ width:11, height:11, color: on ? "rgba(255,255,255,0.7)" : titleColor, flexShrink:0 }}/>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Col 2 — catégories ── */}
      <div style={{ width:col2W, flexShrink:0, borderRight: hasSousCats ? `1.5px solid ${panelBorder}` : "none", display:"flex", flexDirection:"column", background:panelBg }}>
        <AnimatePresence mode="wait">
          {act ? (
            <motion.div key={act.id_activite} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.11 }} style={{ display:"flex", flexDirection:"column", flex:1 }}>
              {/* header */}
              <div style={{ padding:"10px 14px 8px", borderBottom:`1px solid ${mutedBorder}` }}>
                <span style={{ ...TY.secLabel, color:titleColor, letterSpacing:"0.12em" }}>{act.nom}</span>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:"4px 0" }}>
                {act.categories && act.categories.length > 0 ? act.categories.map(c => {
                  const onC = hovCat === c.slug;
                  return (
                    <div
                      key={c.slug}
                      onMouseEnter={() => setHovCat(c.slug)}
                      style={{
                        display:"flex", alignItems:"center", justifyContent:"space-between",
                        padding:"8px 10px 8px 14px", cursor:"default",
                        background: onC ? rowHoverBg : "transparent",
                        borderLeft:`2.5px solid ${onC ? C.sage : "transparent"}`,
                        transition:"all 0.1s",
                      }}
                    >
                      <Link
                        href={`/activites/${act.slug}?cat=${c.id_categorie}`}
                        onClick={onClose}
                        style={{ ...TY.ddItemName, fontSize:13, color: onC ? C.sage : textColor, textDecoration:"none", transition:"color 0.1s", flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}
                      >
                        {c.nom}
                      </Link>
                      {c.sous_cats && c.sous_cats.length > 0 && (
                        <Ico.ChevR style={{ width:10, height:10, color: onC ? C.sage : titleColor, flexShrink:0 }}/>
                      )}
                    </div>
                  );
                }) : (
                  <Link href={`/activites/${act.slug}`} onClick={onClose}
                    style={{ display:"flex", alignItems:"center", padding:"10px 14px", textDecoration:"none" }}>
                    <span style={{ ...TY.ddItemDesc, color:titleColor }}>Voir tous les produits →</span>
                  </Link>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* ── Col 3 — sous-catégories ── */}
      <AnimatePresence>
        {hasSousCats && cat && act && (
          <motion.div
            key={cat.slug}
            initial={{ opacity:0, width:0 }}
            animate={{ opacity:1, width:col3W }}
            exit={{ opacity:0, width:0 }}
            transition={{ duration:0.15, ease:[.4,0,.2,1] }}
            style={{ flexShrink:0, display:"flex", flexDirection:"column", background:panelAltBg, overflow:"hidden", marginTop:14, marginBottom:10, borderTop:`1px solid ${mutedBorder}` }}
          >
            <div style={{ padding:"10px 14px 8px", borderBottom:`1px solid ${mutedBorder}` }}>
              <span style={{ ...TY.secLabel, color:titleColor, letterSpacing:"0.12em", whiteSpace:"nowrap" }}>{cat.nom}</span>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"4px 0" }}>
              {cat.sous_cats!.map((sc, i) => (
                <motion.div key={sc.slug} initial={{ opacity:0, x:4 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.03 }}>
                  <Link
                    href={`/activites/${act.slug}?cat=${sc.id_categorie}`}
                    onClick={onClose}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 12px 7px 14px", textDecoration:"none", color:softTextColor, transition:"all 0.1s" }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = isDark ? "#243520" : C.sageLt; el.style.color = C.sage; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = softTextColor; }}
                  >
                    <span style={{ width:4, height:4, borderRadius:"50%", background:C.sageMd, flexShrink:0, display:"inline-block" }}/>
                    <span style={{ fontSize:12, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{sc.nom}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── MarquesDropdown — style minimaliste vert/blanc/noir ───────────────────── */
function MarquesDropdown({
  marques,
  onClose,
  isDark,
}: {
  marques: Marque[];
  onClose: () => void;
  isDark: boolean;
}) {
  const [brand, setBrand] = useState<Marque|null>(marques[0] ?? null);
  const [hovCat, setHovCat] = useState<string|null>(null);

  useEffect(() => {
    if (brand?.categories && brand.categories.length > 0) {
      setHovCat(brand.categories[0].slug);
    } else {
      setHovCat(null);
    }
  }, [brand?.id_marque]);

  const cat = brand?.categories?.find(c => c.slug === hovCat);
  const hasSousCats = cat?.sous_cats && cat.sous_cats.length > 0;

  const col1W = 172;
  const col2W = 192;
  const col3W = 176;
  const panelBg = isDark ? "#162117" : "#fff";
  const panelAltBg = isDark ? "#1e2d22" : "#fafafa";
  const panelBorder = isDark ? "rgba(255,255,255,0.08)" : "#111816";
  const mutedBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(17,24,22,0.1)";
  const titleColor = isDark ? C.darkInk3 : C.ink3;
  const textColor = isDark ? C.darkInk : C.ink;
  const rowHoverBg = isDark ? "#243520" : "#f5f5f5";
  const shadow = isDark
    ? "0 24px 60px rgba(0,0,0,0.38),0 0 0 1px rgba(255,255,255,0.03)"
    : "4px 4px 0px #111816";

  return (
    <div style={{
      display:"flex",
      width: hasSousCats ? col1W+col2W+col3W : col1W+col2W,
      transition:"width 0.18s cubic-bezier(.4,0,.2,1)",
      background:panelBg,
      borderRadius:14,
      overflow:"hidden",
      border:`1.5px solid ${panelBorder}`,
      boxShadow:shadow,
    }}>

      {/* ── Col 1 — marques ── */}
      <div style={{ width:col1W, flexShrink:0, borderRight:`1.5px solid ${panelBorder}`, display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"10px 14px 8px", borderBottom:`1px solid ${mutedBorder}` }}>
          <span style={{ ...TY.secLabel, color:C.sage, letterSpacing:"0.12em" }}>Marques</span>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"4px 0" }}>
          {marques.length === 0 ? (
            <p style={{ padding:"10px 14px", ...TY.ddItemDesc, color:titleColor }}>Chargement…</p>
          ) : marques.map((m, i) => {
            const on = brand?.id_marque === m.id_marque;
            return (
              <motion.div key={m.id_marque} initial={{ opacity:0, x:-3 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}>
                <div
                  onMouseEnter={() => setBrand(m)}
                  style={{
                    display:"flex", alignItems:"center", gap:9,
                    padding:"7px 10px 7px 12px", cursor:"default",
                    background: on ? C.sage : "transparent",
                    transition:"background 0.12s",
                  }}
                >
                  {/* logo */}
                  <div style={{
                    width:26, height:26, borderRadius:6, flexShrink:0,
                    background: on ? "rgba(255,255,255,0.15)" : rowHoverBg,
                    border:`1.5px solid ${on ? "rgba(255,255,255,0.3)" : mutedBorder}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    overflow:"hidden", transition:"all 0.12s",
                  }}>
                    {m.logo
                      ? <Image src={m.logo} alt={m.nom} width={26} height={26} style={{ objectFit:"contain", padding:2 }}/>
                      : <Ico.Leaf style={{ width:11, height:11, color: on ? "#fff" : C.sageMd }}/>
                    }
                  </div>
                  <p style={{ ...TY.ddItemName, fontSize:13, color: on ? "#fff" : textColor, margin:0, flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", transition:"color 0.12s" }}>
                    {m.nom}
                  </p>
                  {m.categories && m.categories.length > 0 && (
                    <Ico.ChevR style={{ width:11, height:11, color: on ? "rgba(255,255,255,0.7)" : titleColor }}/>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Col 2 — catégories ── */}
      <div style={{ width:col2W, flexShrink:0, borderRight: hasSousCats ? `1.5px solid ${panelBorder}` : "none", display:"flex", flexDirection:"column", background:panelBg }}>
        <AnimatePresence mode="wait">
          {brand ? (
            <motion.div key={brand.id_marque} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.11 }} style={{ display:"flex", flexDirection:"column", flex:1 }}>
              <div style={{ padding:"10px 14px 8px", borderBottom:`1px solid ${mutedBorder}` }}>
                <span style={{ ...TY.secLabel, color:titleColor, letterSpacing:"0.12em" }}>{brand.nom}</span>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:"4px 0" }}>
                {brand.categories && brand.categories.length > 0 ? brand.categories.map(c => {
                  const onC = hovCat === c.slug;
                  return (
                    <div
                      key={c.slug}
                      onMouseEnter={() => setHovCat(c.slug)}
                      style={{
                        display:"flex", alignItems:"center", justifyContent:"space-between",
                        padding:"8px 10px 8px 14px", cursor:"default",
                        background: onC ? rowHoverBg : "transparent",
                        borderLeft:`2.5px solid ${onC ? C.sage : "transparent"}`,
                        transition:"all 0.1s",
                      }}
                    >
                      <Link
                        href={`/marques/${brand.slug}?cat=${c.id_categorie}`}
                        onClick={onClose}
                        style={{ ...TY.ddItemName, fontSize:13, color: onC ? C.sage : textColor, textDecoration:"none", transition:"color 0.1s", flex:1, minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}
                      >
                        {c.nom}
                      </Link>
                      {c.sous_cats && c.sous_cats.length > 0 && (
                        <Ico.ChevR style={{ width:10, height:10, color: onC ? C.sage : titleColor, flexShrink:0 }}/>
                      )}
                    </div>
                  );
                }) : (
                  <Link href={`/marques/${brand.slug}`} onClick={onClose}
                    style={{ display:"flex", alignItems:"center", padding:"10px 14px", textDecoration:"none" }}>
                    <span style={{ ...TY.ddItemDesc, color:titleColor }}>Voir tous les produits →</span>
                  </Link>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* ── Col 3 — sous-catégories ── */}
      <AnimatePresence>
        {hasSousCats && cat && brand && (
          <motion.div
            key={cat.slug}
            initial={{ opacity:0, width:0 }}
            animate={{ opacity:1, width:col3W }}
            exit={{ opacity:0, width:0 }}
            transition={{ duration:0.15, ease:[.4,0,.2,1] }}
            style={{ flexShrink:0, display:"flex", flexDirection:"column", background:panelAltBg, overflow:"hidden", marginTop:14, marginBottom:10, borderTop:`1px solid ${mutedBorder}` }}
          >
            <div style={{ padding:"10px 14px 8px", borderBottom:`1px solid ${mutedBorder}` }}>
              <span style={{ ...TY.secLabel, color:titleColor, letterSpacing:"0.12em", whiteSpace:"nowrap" }}>{cat.nom}</span>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"4px 0" }}>
              {cat.sous_cats!.map((sc, i) => (
                <motion.div key={sc.slug} initial={{ opacity:0, x:4 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.03 }}>
                  <Link
                    href={`/marques/${brand.slug}?cat=${sc.id_categorie}`}
                    onClick={onClose}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 12px 7px 14px", textDecoration:"none", color:isDark ? C.darkInk2 : C.ink2, transition:"all 0.1s" }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = isDark ? "#243520" : C.sageLt; el.style.color = C.sage; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = isDark ? C.darkInk2 : C.ink2; }}
                  >
                    <span style={{ width:4, height:4, borderRadius:"50%", background:C.sageMd, flexShrink:0, display:"inline-block" }}/>
                    <span style={{ fontSize:12, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{sc.nom}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Navbar principale — INCHANGÉE ────────────────────────────────────────── */
export function Navbar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const isHome    = pathname === "/";

  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  const [scrolled,   setScrolled]   = useState(false);
  const [mounted,    setMounted]    = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSec,  setMobileSec]  = useState<string|null>(null);
  const [logoErr,    setLogoErr]    = useState(false);
  const [activites,  setActivites]  = useState<Activite[]>([]);
  const [marques,    setMarques]    = useState<Marque[]>([]);
  const acts     = useHover(150);
  const marquesH = useHover(220);

  const scrollToSection = (id: string) => {
    if (pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });
    } else {
      router.push(`/#${id}`);
    }
  };

  useEffect(() => {
    const sortCats = (cats: CatItem[]) =>
      [...cats].sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0) || a.nom.localeCompare(b.nom, "fr"));

    const buildRoots = (all: CatItem[]): CatItem[] =>
      sortCats(all.filter(c => !c.parent_id)).map(c => ({
        ...c,
        sous_cats: sortCats(all.filter(sc => sc.parent_id === c.id_categorie)),
      }));

    fetch(`${BASE}/activites`).then(r => r.json()).then(j => {
      const data: Activite[] = j.data ?? j ?? [];
      Promise.all(data.map(a =>
        fetch(`${BASE}/categories?id_activite=${a.id_activite}`).then(r => r.json())
          .then(d => {
            const all: CatItem[] = d.data ?? d ?? [];
            return { ...a, categories: buildRoots(all) };
          }).catch(() => a)
      )).then(setActivites);
    }).catch(() => {});

    fetch(`${BASE}/marques`).then(r => r.json()).then(j => {
      const data: Marque[] = j.data ?? j ?? [];
      Promise.all(data.map(m =>
        fetch(`${BASE}/marques/${m.slug}`).then(r => r.json())
          .then(d => {
            const sortCats2 = (cats: CatItem[]) =>
              [...cats].sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0) || a.nom.localeCompare(b.nom, "fr"));
            const cats: CatItem[] = (d.data?.categories ?? d?.categories ?? []).map((cat: any) => ({
              ...cat,
              sous_cats: sortCats2(cat.sous_cats ?? []),
            }));
            return { ...m, categories: sortCats2(cats) };
          }).catch(() => m)
      )).then(setMarques);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setMounted(true);
    /* Seuil adapté au type de hero :
       - homepage     -> 90% vh  (hero 100vh)
       - pages slider -> 52% vh  (hero 68vh)
       - pages static -> 40% vh  (hero 55vh)  */
    const SLIDER_P = ["/marques", "/activites"];
    const STATIC_P = ["/contact", "/qui-sommes-nous", "/rendez-vous"];
    const getThreshold = () => {
      const p = window.location.pathname;
      if (p === "/") return window.innerHeight * 0.9;
      if (SLIDER_P.some(s => p.startsWith(s))) return window.innerHeight * 0.52;
      if (STATIC_P.some(s => p.startsWith(s))) return window.innerHeight * 0.40;
      return 0;
    };
    const fn = () => setScrolled(window.scrollY > getThreshold());
    fn(); window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, [pathname]);

  useEffect(() => { setMobileOpen(false); setMobileSec(null); }, [pathname]);

  const isActive = (p: string) => p === "/" ? pathname === "/" : pathname?.startsWith(p);
  const dropShadow = "0 20px 60px rgba(0,0,0,0.13),0 0 0 1.5px rgba(46,125,79,0.14)";

  /* Pages avec hero (slider ou statique) — navbar transparente au sommet */
  const HERO_PATHS = ["/marques", "/activites", "/contact", "/qui-sommes-nous", "/rendez-vous"];
  const hasPageHero = HERO_PATHS.some(p => pathname?.startsWith(p));
  const onHero         = (isHome || hasPageHero) && !scrolled;
  const navTextColor   = onHero ? "#ffffff" : isDark ? C.darkInk2 : C.ink;
  const navActiveColor = onHero ? "#ffffff" : C.sage;
  const navBorderActive= onHero ? "#7dc040" : C.sage;
  const mobileMenuBg     = isDark ? C.darkMenuBg : "#ffffff";
  const mobileMenuBorder = isDark ? C.darkMenuBorder : C.line;
  const mobileLinkColor  = isDark ? C.darkInk : C.ink;
  const mobileHoverClass = isDark ? "hover:bg-[#1e2d22]" : "hover:bg-[#edf8f3]";
  const mobileSubHover   = isDark ? "hover:bg-[#243520]" : "hover:bg-[#dff2e8]";

  const nlBase: React.CSSProperties = { ...TY.navLink, color:navTextColor, padding:"8px 14px", borderRadius:0, cursor:"pointer", display:"flex", alignItems:"center", gap:5, textDecoration:"none", transition:"color 0.15s", border:"none", background:"transparent", borderBottom:"2.5px solid transparent" };
  const nlOn: React.CSSProperties   = { ...nlBase, ...TY.navLinkOn, color:navActiveColor, borderBottom:`2.5px solid ${navBorderActive}` };
  const nlBtn: React.CSSProperties  = { ...nlBase, fontFamily:"inherit" };

  const navBg = onHero
    ? "transparent"
    : isDark
      ? "rgba(13,24,16,0.97)"
      : "rgba(255,255,255,0.98)";

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50"
        style={{
          background: navBg,
          backdropFilter: onHero ? "none" : "blur(20px)",
          borderBottom: onHero ? "none" : `1.5px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(46,125,79,0.18)"}`,
          boxShadow: onHero ? "none" : `0 2px 20px rgba(46,125,79,${isDark ? "0.08" : "0.12"})`,
          transition: "all 0.3s",
        }}>
        <div style={{ height:2.5, background:`linear-gradient(90deg,${C.gradA},${C.gradB},${C.gradC})` }}/>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16">
          <div style={{ display:"flex", alignItems:"center", height:NAV_H }}>

            <Link href="/" style={{ display:"flex", alignItems:"center", marginRight:"clamp(16px,3vw,40px)", flexShrink:0, textDecoration:"none", lineHeight:0 }}>
              {!logoErr ? (
                <Image src="/logos/logo-espace-vert.png" alt="Espace Vert" width={300} height={150}
                  style={{ objectFit:"contain", height:"clamp(54px,7vw,90px)", width:"auto", display:"block" }}
                  onError={() => setLogoErr(true)} priority/>
              ) : (
                <span style={{ fontFamily:"var(--font-display)", fontWeight:900, fontSize:"1.2rem", color: onHero ? "#fff" : C.sageDk, letterSpacing:"-0.03em" }}>
                  Espace<span style={{ color: onHero ? "rgba(255,255,255,0.7)" : C.sage }}>Vert</span>
                </span>
              )}
            </Link>

            <div className="hidden xl:flex" style={{ flex:1, alignItems:"center", justifyContent:"center", gap:0, height:"100%" }}>
              <Link href="/qui-sommes-nous" style={isActive("/qui-sommes-nous") ? nlOn : nlBase}>Qui sommes-nous</Link>

              {/* Activités */}
              <div style={{ position:"relative" }} onMouseEnter={acts.show} onMouseLeave={acts.hide}>
                <button onClick={() => scrollToSection("nos-activites")} style={acts.open || isActive("/activites") ? nlOn : nlBtn}>
                  Nos activités
                  <motion.span animate={{ rotate: acts.open ? 180 : 0 }} transition={{ duration:0.22 }} style={{ display:"flex", alignItems:"center" }}>
                    <ChevronDownIcon style={{ width:12, height:12, opacity:0.5 }}/>
                  </motion.span>
                </button>
                <AnimatePresence>
                  {acts.open && (
                    <motion.div initial={{ opacity:0, y:10, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:0.96 }} transition={{ duration:0.15 }}
                      onMouseEnter={acts.keep} onMouseLeave={acts.hide}
                      style={{
                        position:"absolute", top:"100%",
                        left:"50%", transform:"translateX(-50%)",
                        marginTop:10, zIndex:60,
                        maxWidth:"calc(100vw - 32px)",
                      }}>
                      <ActivitesDropdown activites={activites} onClose={acts.hide} isDark={isDark}/>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Marques */}
              <div style={{ position:"relative" }} onMouseEnter={marquesH.show} onMouseLeave={marquesH.hide}>
                <button onClick={() => scrollToSection("nos-marques")} style={marquesH.open || isActive("/marques") ? nlOn : nlBtn}>
                  Nos marques
                  <motion.span animate={{ rotate: marquesH.open ? 180 : 0 }} transition={{ duration:0.22 }} style={{ display:"flex", alignItems:"center" }}>
                    <ChevronDownIcon style={{ width:12, height:12, opacity:0.5 }}/>
                  </motion.span>
                </button>
                <AnimatePresence>
                  {marquesH.open && (
                    <motion.div initial={{ opacity:0, y:10, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:0.96 }} transition={{ duration:0.15 }}
                      onMouseEnter={marquesH.keep} onMouseLeave={marquesH.hide}
                      style={{
                        position:"absolute", top:"100%",
                        left:"50%", transform:"translateX(-50%)",
                        marginTop:10, zIndex:60,
                        maxWidth:"calc(100vw - 32px)",
                      }}>
                      <MarquesDropdown marques={marques} onClose={marquesH.hide} isDark={isDark}/>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/contact" style={isActive("/contact") ? nlOn : nlBase}>Contact</Link>
            </div>

            {/* Right CTAs */}
            <div className="hidden xl:flex" style={{ alignItems:"center", gap:8, marginLeft:"auto" }}>
              <ProduitSearch onHero={onHero} navTextColor={navTextColor} />

              <motion.button
                onClick={toggle}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                title={theme === "dark" ? "Mode clair" : "Mode sombre"}
                style={{
                  width: 40, height: 40,
                  borderRadius: 10,
                  border: onHero ? "1.5px solid rgba(255,255,255,0.3)" : `1.5px solid ${C.border}`,
                  background: onHero ? "rgba(255,255,255,0.12)" : C.logoLt,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: onHero ? "#fff" : C.logo,
                  transition: "all 0.3s",
                  flexShrink: 0,
                }}
              >
                <AnimatePresence mode="wait">
                  {theme === "dark" ? (
                    <motion.svg key="sun" width={18} height={18} viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth={2} strokeLinecap="round"
                      initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <circle cx="12" cy="12" r="5"/>
                      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                    </motion.svg>
                  ) : (
                    <motion.svg key="moon" width={16} height={16} viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth={2} strokeLinecap="round"
                      initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </motion.svg>
                  )}
                </AnimatePresence>
              </motion.button>

              <Link href="/rendez-vous" style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "10px 18px",
                borderRadius: 10,
                background: onHero ? "rgba(255,255,255,0.18)" : `linear-gradient(135deg,${C.logoDk},${C.logo})`,
                border: onHero ? "1.5px solid rgba(255,255,255,0.35)" : "none",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13.5,
                letterSpacing: "-0.01em",
                textDecoration: "none",
                boxShadow: onHero ? "none" : `0 3px 10px rgba(125,192,64,0.3)`,
                transition: "all 0.3s",
                whiteSpace: "nowrap",
              }}>
                <Ico.Cal style={{ width:14, height:14 }}/>RDV
              </Link>
            </div>

            {/* Burger */}
            <button onClick={() => setMobileOpen(v => !v)} className="xl:hidden ml-auto p-2.5 rounded-xl"
              style={{
                background: onHero ? "rgba(255,255,255,0.15)" : isDark ? "rgba(255,255,255,0.08)" : C.sageLt,
                color: onHero ? "#fff" : isDark ? C.darkInk : C.sage,
                border: `1.5px solid ${onHero ? "rgba(255,255,255,0.3)" : isDark ? "rgba(255,255,255,0.12)" : C.border}`,
                cursor:"pointer",
                transition:"all 0.3s",
              }}>
              <AnimatePresence mode="wait">
                <motion.div key={mobileOpen ? "x" : "bars"} initial={{ rotate:-90, opacity:0 }} animate={{ rotate:0, opacity:1 }} exit={{ rotate:90, opacity:0 }} transition={{ duration:0.18 }}>
                  {mobileOpen ? <Ico.X style={{ width:22, height:22 }}/> : <Ico.Menu style={{ width:22, height:22 }}/>}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* Menu mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }} transition={{ duration:0.22 }}
            className="fixed inset-x-0 z-40 overflow-hidden xl:hidden"
            style={{
              top:NAV_H+2.5,
              borderTop:`1.5px solid ${mobileMenuBorder}`,
              boxShadow:"0 24px 48px rgba(0,0,0,0.12)",
              background: mobileMenuBg,
            }}>
            <div className="p-4 max-h-[calc(100dvh-5.5rem)] overflow-y-auto flex flex-col gap-2">

              <Link href="/qui-sommes-nous" onClick={() => setMobileOpen(false)}
                style={{ ...TY.mobileLink, color:mobileLinkColor, padding:"11px 16px", borderRadius:10, display:"block", textDecoration:"none" }}
                className={mobileHoverClass}>
                Qui sommes-nous
              </Link>

              {/* Activités mobile */}
              <div>
                <div style={{ display:"flex" }}>
                  <button
                    onClick={() => { scrollToSection("nos-activites"); setMobileOpen(false); }}
                    style={{ ...TY.mobileLink, color:mobileLinkColor, padding:"11px 16px", borderRadius:"10px 0 0 10px", flex:1, background:"transparent", border:"none", cursor:"pointer", textAlign:"left", fontFamily:"inherit" }}
                    className={mobileHoverClass}>
                    Nos activités
                  </button>
                  <button
                    onClick={() => setMobileSec(mobileSec === "acts" ? null : "acts")}
                    style={{ padding:"11px 14px", borderRadius:"0 10px 10px 0", background:"transparent", border:"none", borderLeft:`1.5px solid ${mobileMenuBorder}`, cursor:"pointer", color:isDark ? C.darkInk3 : C.ink3 }}
                    className={mobileHoverClass}>
                    <ChevronDownIcon style={{ width:16, height:16, transition:"transform 0.2s", transform: mobileSec === "acts" ? "rotate(180deg)" : "none" }}/>
                  </button>
                </div>
                <AnimatePresence>
                  {mobileSec === "acts" && (
                    <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }} style={{ overflow:"hidden" }}>
                      {activites.map(a => (
                        <Link key={a.id_activite} href={`/activites/${a.slug}`} onClick={() => setMobileOpen(false)}
                          style={{ display:"flex", alignItems:"center", gap:11, padding:"9px 16px 9px 28px", borderRadius:9, textDecoration:"none", color:mobileLinkColor }}
                          className={mobileSubHover}>
                          <div style={{ width:32, height:32, borderRadius:9, background:C.sagePastel, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, border:`1.5px solid ${C.sageIcon}`, overflow:"hidden" }}>
                            {a.image ? <Image src={a.image} alt={a.nom} width={32} height={32} style={{ objectFit:"cover", width:"100%", height:"100%" }}/> : <Ico.Leaf style={{ width:14, height:14, color:C.sageMd }}/>}
                          </div>
                          <p style={{ ...TY.mobileLink, fontSize:14, color:mobileLinkColor, margin:0, minWidth:0 }}>{a.nom}</p>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Marques mobile */}
              <div>
                <div style={{ display:"flex" }}>
                  <button onClick={() => { scrollToSection("nos-marques"); setMobileOpen(false); }}
                    style={{ ...TY.mobileLink, color:mobileLinkColor, padding:"11px 16px", borderRadius:"10px 0 0 10px", flex:1, background:"transparent", border:"none", cursor:"pointer", textAlign:"left", fontFamily:"inherit" }}
                    className={mobileHoverClass}>
                    Nos marques
                  </button>
                  <button onClick={() => setMobileSec(mobileSec === "brands" ? null : "brands")}
                    style={{ padding:"11px 14px", borderRadius:"0 10px 10px 0", background:"transparent", border:"none", borderLeft:`1.5px solid ${mobileMenuBorder}`, cursor:"pointer", color:isDark ? C.darkInk3 : C.ink3 }}
                    className={mobileHoverClass}>
                    <ChevronDownIcon style={{ width:16, height:16, transition:"transform 0.2s", transform: mobileSec === "brands" ? "rotate(180deg)" : "none" }}/>
                  </button>
                </div>
                <AnimatePresence>
                  {mobileSec === "brands" && (
                    <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }} style={{ overflow:"hidden" }}>
                      {marques.map(m => (
                        <Link key={m.id_marque} href={`/marques/${m.slug}`} onClick={() => setMobileOpen(false)}
                          style={{ display:"flex", alignItems:"center", gap:11, marginLeft:12, padding:"10px 14px", borderRadius:12, border:`1.5px solid ${mobileMenuBorder}`, marginBottom:8, textDecoration:"none", background: isDark ? "rgba(255,255,255,0.04)" : "#fff" }}
                          className={mobileHoverClass}>
                          <div style={{ width:36, height:36, borderRadius:9, background:C.sagePastel, border:`1.5px solid ${C.sageIcon}`, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
                            {m.logo ? <Image src={m.logo} alt={m.nom} width={36} height={36} style={{ objectFit:"contain", padding:4 }}/> : <Ico.Leaf style={{ width:16, height:16, color:C.sageMd }}/>}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ ...TY.mobileLink, fontSize:14, color:mobileLinkColor, margin:0 }}>{m.nom}</p>
                            {m.description && <p style={{ fontSize:11.5, color:isDark ? C.darkInk3 : C.ink3, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.description.substring(0,40)}</p>}
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/contact" onClick={() => setMobileOpen(false)}
                style={{ ...TY.mobileLink, color:mobileLinkColor, padding:"11px 16px", borderRadius:10, display:"block", textDecoration:"none" }}
                className={mobileHoverClass}>
                Contact
              </Link>
              <Link href="/rendez-vous" onClick={() => setMobileOpen(false)}
                style={{ ...TY.cta, color:"#fff", background:`linear-gradient(135deg,${C.logoDk},${C.logo})`, padding:"12px 16px", borderRadius:10, display:"flex", alignItems:"center", gap:8, marginTop:4, textDecoration:"none" }}>
                <Ico.Cal style={{ width:16, height:16 }}/>Prendre RDV
              </Link>
              <Link href="/devis" onClick={() => setMobileOpen(false)}
                style={{ ...TY.cta, color:C.logoDk, background:C.logoLt, padding:"12px 16px", borderRadius:10, display:"flex", alignItems:"center", gap:8, textDecoration:"none", border:`1.5px solid ${C.logoBorder}` }}>
                Demander un devis
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
