"use client";
/**
 * Navbar — Dropdowns alimentés par le backend
 * FIX: Les menus Activités et Marques chargent leurs données depuis /api/activites et /api/marques
 */
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const NAV_H  = 80;
const BASE   = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const C = {
  sage:"#2e7d4f",sageDk:"#1b5e38",sageMd:"#5bab79",sageLt:"#dff2e8",
  stone:"#f6f4f0",stone2:"#ede9e3",line:"rgba(46,125,79,0.12)",
  ink:"#111816",ink2:"#3d5248",ink3:"#8da898",ink4:"#bbd4c4",
  border:"#c9e0d3",gradA:"#1b5e38",gradB:"#38a169",gradC:"#6fcf97",
};

const TY = {
  navLink:   { fontSize:15.5, fontWeight:500,  letterSpacing:"-0.01em"  } as React.CSSProperties,
  navLinkOn: { fontSize:15.5, fontWeight:700,  letterSpacing:"-0.01em"  } as React.CSSProperties,
  ddItemName:{ fontSize:13.5, fontWeight:600,  letterSpacing:"-0.018em" } as React.CSSProperties,
  ddItemDesc:{ fontSize:11.5, fontWeight:400,  letterSpacing:"-0.01em"  } as React.CSSProperties,
  secLabel:  { fontSize:9.5,  fontWeight:700,  letterSpacing:"0.16em", textTransform:"uppercase" as const } as React.CSSProperties,
  cta:       { fontSize:14,   fontWeight:700,  letterSpacing:"-0.01em"  } as React.CSSProperties,
  mobileLink:{ fontSize:15,   fontWeight:600,  letterSpacing:"-0.02em"  } as React.CSSProperties,
};

const Ico = {
  Leaf:   (p:any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="M20 5c0 0-8 0-13 5C4 13 4 19 4 19s6 0 9-3c5-5 5-11 7-11z"/><path d="M4 19l7-7"/></svg>,
  Cal:    (p:any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  Menu:   (p:any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>,
  X:      (p:any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  ChevR:  (p:any) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}><path d="M9 18l6-6-6-6"/></svg>,
};

interface CatItem   { id_categorie: number; nom: string; slug: string; parent_id: number | null; sous_cats?: CatItem[]; }
interface Activite  { id_activite: number; nom: string; slug: string; description: string | null; image: string | null; categories?: CatItem[]; }
interface Marque    { id_marque:   number; nom: string; slug: string; logo: string | null; description: string | null; categories?: CatItem[]; }

function TreePines({ color="#e2ede7", h=60 }: { color?: string; h?: number }) {
  const pines = [{x:0,w:18,h:48},{x:14,w:22,h:60},{x:30,w:16,h:42},{x:44,w:24,h:64},{x:62,w:18,h:50},{x:76,w:20,h:55},{x:92,w:15,h:38},{x:104,w:26,h:68},{x:124,w:18,h:46},{x:138,w:22,h:58},{x:154,w:16,h:40},{x:166,w:24,h:62},{x:184,w:20,h:52},{x:200,w:18,h:44},{x:214,w:26,h:70},{x:234,w:16,h:36},{x:246,w:22,h:56},{x:262,w:18,h:48},{x:276,w:24,h:64},{x:294,w:20,h:50}];
  return (
    <svg viewBox={`0 0 320 ${h}`} preserveAspectRatio="xMidYMax meet" style={{ width:"100%", height:h, display:"block" }} aria-hidden="true">
      {pines.map((p, i) => {
        const tw=p.w*.22, th=p.h*.18, tx=p.x+p.w/2-tw/2;
        return <g key={i} fill={color}><polygon points={`${p.x+p.w/2},${h-p.h} ${p.x},${h-th} ${p.x+p.w},${h-th}`}/><rect x={tx} y={h-th} width={tw} height={th}/></g>;
      })}
    </svg>
  );
}

function useHover(delay = 180) {
  const [open, setOpen] = useState(false);
  const t = useRef<any>(null);
  const show = useCallback(() => { t.current && clearTimeout(t.current); setOpen(true); }, []);
  const hide = useCallback(() => { t.current = setTimeout(() => setOpen(false), delay); }, [delay]);
  const keep = useCallback(() => { t.current && clearTimeout(t.current); }, []);
  useEffect(() => () => { t.current && clearTimeout(t.current); }, []);
  return { open, show, hide, keep };
}

// ── Dropdown Activités (données backend) ────────────────────────────────────
function ActivitesDropdown({ activites, onClose }: { activites: Activite[]; onClose: () => void }) {
  const [hov, setHov] = useState<number | null>(null);
  const act = activites.find(a => a.id_activite === hov);

  return (
    <div style={{ display:"flex", minWidth:580 }}>
      {/* Liste activités */}
      <div style={{ width:220, flexShrink:0, padding:"10px 0", background:`linear-gradient(180deg,#f0faf4,#dff2e8 60%,#c8ebd8 100%)`, borderRight:`1.5px solid ${C.line}`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, pointerEvents:"none" }}><TreePines color="rgba(46,125,79,0.1)" h={70}/></div>
        <p style={{ ...TY.secLabel, color:C.sage, padding:"4px 16px 10px", position:"relative", zIndex:1 }}>Activités</p>
        <div style={{ position:"relative", zIndex:1 }}>
          {activites.length === 0 ? (
            <p style={{ padding:"12px 16px", ...TY.ddItemDesc, color:C.ink3 }}>Chargement…</p>
          ) : (
            activites.map((a, i) => {
              const on = hov === a.id_activite;
              return (
                <motion.div key={a.id_activite} initial={{ opacity:0, x:-4 }} animate={{ opacity:1, x:0 }} transition={{ delay: i * 0.04 }}>
                  <Link href={`/activites/${a.slug}`} onClick={onClose}
                    onMouseEnter={() => setHov(a.id_activite)}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 14px", borderLeft:`3px solid ${on ? C.sage : "transparent"}`, background: on ? `linear-gradient(90deg,${C.sageLt},#e8f8ef)` : "transparent", transition:"all 0.12s", textDecoration:"none" }}>
                    <div style={{ width:30, height:30, borderRadius:8, flexShrink:0, background: on ? `linear-gradient(135deg,${C.sage},${C.sageMd})` : "#e2ede7", display:"flex", alignItems:"center", justifyContent:"center", boxShadow: on ? `0 3px 8px rgba(46,125,79,0.3)` : "none", overflow:"hidden" }}>
                      {a.image
                        ? <Image src={a.image} alt={a.nom} width={30} height={30} style={{ objectFit:"cover", width:"100%", height:"100%" }}/>
                        : <Ico.Leaf style={{ width:13, height:13, color: on ? "#fff" : C.ink3 }}/>
                      }
                    </div>
                    <div>
                      <p style={{ ...TY.ddItemName, color: on ? C.sage : C.ink }}>{a.nom}</p>
                      {a.description && <p style={{ ...TY.ddItemDesc, color:C.ink3 }}>{a.description.substring(0, 50)}</p>}
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Panneau détail avec catégories */}
      <div style={{ flex:1, padding:"16px 20px", background:"#fff", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", bottom:0, right:0, left:0, opacity:0.06, pointerEvents:"none" }}><TreePines color={C.sage} h={80}/></div>
        <AnimatePresence mode="wait">
          {act ? (
            <motion.div key={act.id_activite} initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }} transition={{ duration:0.13 }} style={{ position:"relative", zIndex:1 }}>
              <p style={{ ...TY.secLabel, color:C.ink3, marginBottom:12 }}>{act.nom}</p>
              {act.description && <p style={{ ...TY.ddItemDesc, color:C.ink2, marginBottom:14, lineHeight:1.6 }}>{act.description}</p>}
              {act.categories && act.categories.length > 0 && (
                <div style={{ display:"flex", flexDirection:"column", gap:1, marginBottom:14 }}>
                  {act.categories.map(cat => (
                    <div key={cat.slug}>
                      <Link href={`/activites/${act.slug}`} onClick={onClose}
                        style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 9px", borderRadius:8, textDecoration:"none", transition:"background 0.1s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.sageLt; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                        <div style={{ width:6, height:6, borderRadius:"50%", background:`linear-gradient(135deg,${C.sage},${C.sageMd})`, flexShrink:0 }}/>
                        <span style={{ ...TY.ddItemName, color:C.ink }}>{cat.nom}</span>
                      </Link>
                      {cat.sous_cats && cat.sous_cats.length > 0 && (
                        <div style={{ paddingLeft:22, display:"flex", flexDirection:"column", gap:0 }}>
                          {cat.sous_cats.map(sc => (
                            <Link key={sc.slug} href={`/activites/${act.slug}`} onClick={onClose}
                              style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 9px", borderRadius:6, textDecoration:"none", transition:"background 0.1s" }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.sageLt; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                              <Ico.ChevR style={{ width:9, height:9, color:C.ink4, flexShrink:0 }}/>
                              <span style={{ ...TY.ddItemDesc, color:C.ink2, fontSize:11.5 }}>{sc.nom}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <Link href={`/activites/${act.slug}`} onClick={onClose}
                style={{ display:"flex", alignItems:"center", gap:4, paddingTop:12, borderTop:`1.5px solid ${C.line}`, ...TY.cta, color:C.sage, textDecoration:"none" }}>
                Voir l&apos;activité <Ico.ChevR style={{ width:13, height:13 }}/>
              </Link>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity:0 }} animate={{ opacity:1 }}
              style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", textAlign:"center", paddingBlock:32, position:"relative", zIndex:1 }}>
              <div>
                <div style={{ width:48, height:48, borderRadius:14, background:`linear-gradient(135deg,${C.sageLt},#c8f0d8)`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>
                  <Ico.Leaf style={{ width:22, height:22, color:C.sage }}/>
                </div>
                <p style={{ ...TY.ddItemName, color:C.ink2 }}>Survolez une activité</p>
                <p style={{ ...TY.ddItemDesc, color:C.ink3, marginTop:3 }}>pour voir les détails</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Dropdown Marques (données backend) ───────────────────────────────────────
function MarquesDropdown({ marques, onClose }: { marques: Marque[]; onClose: () => void }) {
  const [brand, setBrand] = useState<Marque | null>(null);

  return (
    <div style={{ display:"flex", minWidth:580 }}>
      {/* Liste marques */}
      <div style={{ width:200, flexShrink:0, padding:"10px 0", background:`linear-gradient(180deg,#f0faf4,#dff2e8 60%)`, borderRight:`1.5px solid ${C.line}` }}>
        <p style={{ ...TY.secLabel, color:C.sage, padding:"4px 16px 10px" }}>Marques</p>
        {marques.length === 0 ? (
          <p style={{ padding:"12px 16px", ...TY.ddItemDesc, color:C.ink3 }}>Chargement…</p>
        ) : (
          marques.map((m, i) => {
            const on = brand?.id_marque === m.id_marque;
            return (
              <motion.div key={m.id_marque} initial={{ opacity:0, x:-4 }} animate={{ opacity:1, x:0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/marques/${m.slug}`} onClick={onClose}
                  onMouseEnter={() => setBrand(m)}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 14px", borderLeft:`3px solid ${on ? C.sage : "transparent"}`, background: on ? `linear-gradient(90deg,${C.sageLt},#e8f8ef)` : "transparent", transition:"all 0.12s", textDecoration:"none" }}>
                  <div style={{ width:30, height:30, borderRadius:8, flexShrink:0, background: on ? `linear-gradient(135deg,${C.sage},${C.sageMd})` : "#e2ede7", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", boxShadow: on ? `0 3px 8px rgba(46,125,79,0.3)` : "none" }}>
                    {m.logo
                      ? <Image src={m.logo} alt={m.nom} width={30} height={30} style={{ objectFit:"contain", padding:2, filter: on ? "brightness(10)" : "none" }}/>
                      : <Ico.Leaf style={{ width:13, height:13, color: on ? "#fff" : C.ink3 }}/>
                    }
                  </div>
                  <div>
                    <p style={{ ...TY.ddItemName, color: on ? C.sage : C.ink }}>{m.nom}</p>
                    {m.description && <p style={{ ...TY.ddItemDesc, color:C.ink3 }}>{m.description.substring(0, 40)}</p>}
                  </div>
                </Link>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Panneau catégories marque */}
      <div style={{ flex:1, padding:"16px 20px", background:"#fff", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", bottom:0, right:0, left:0, opacity:0.06, pointerEvents:"none" }}><TreePines color={C.sage} h={80}/></div>
        <AnimatePresence mode="wait">
          {brand ? (
            <motion.div key={brand.id_marque} initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }} transition={{ duration:0.13 }} style={{ position:"relative", zIndex:1 }}>
              <p style={{ ...TY.secLabel, color:C.ink3, marginBottom:12 }}>Catégories · {brand.nom}</p>
              {brand.categories && brand.categories.length > 0 ? (
                <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
                  {brand.categories.map(cat => (
                    <div key={cat.slug}>
                      <Link href={`/marques/${brand.slug}`} onClick={onClose}
                        style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 9px", borderRadius:8, textDecoration:"none", transition:"background 0.1s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.sageLt; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                        <div style={{ width:6, height:6, borderRadius:"50%", background:`linear-gradient(135deg,${C.sage},${C.sageMd})`, flexShrink:0 }}/>
                        <span style={{ ...TY.ddItemName, color:C.ink }}>{cat.nom}</span>
                      </Link>
                      {cat.sous_cats && cat.sous_cats.length > 0 && (
                        <div style={{ paddingLeft:22, display:"flex", flexDirection:"column", gap:0 }}>
                          {cat.sous_cats.map(sc => (
                            <Link key={sc.slug} href={`/marques/${brand.slug}`} onClick={onClose}
                              style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 9px", borderRadius:6, textDecoration:"none", transition:"background 0.1s" }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.sageLt; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                              <Ico.ChevR style={{ width:9, height:9, color:C.ink4, flexShrink:0 }}/>
                              <span style={{ ...TY.ddItemDesc, color:C.ink2, fontSize:11.5 }}>{sc.nom}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ ...TY.ddItemDesc, color:C.ink3 }}>Voir tous les produits {brand.nom}</p>
              )}
              <Link href={`/marques/${brand.slug}`} onClick={onClose}
                style={{ display:"flex", alignItems:"center", gap:4, marginTop:14, paddingTop:12, borderTop:`1.5px solid ${C.line}`, ...TY.cta, color:C.sage, textDecoration:"none" }}>
                Voir tout · {brand.nom}<Ico.ChevR style={{ width:13, height:13 }}/>
              </Link>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity:0 }} animate={{ opacity:1 }}
              style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", textAlign:"center", paddingBlock:32, position:"relative", zIndex:1 }}>
              <div>
                <div style={{ width:48, height:48, borderRadius:14, background:`linear-gradient(135deg,${C.sageLt},#c8f0d8)`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>
                  <Ico.Leaf style={{ width:22, height:22, color:C.sage }}/>
                </div>
                <p style={{ ...TY.ddItemName, color:C.ink2 }}>Survolez une marque</p>
                <p style={{ ...TY.ddItemDesc, color:C.ink3, marginTop:3 }}>pour voir les catégories</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Navbar principale ────────────────────────────────────────────────────────
export function Navbar() {
  const pathname   = usePathname();
  const router     = useRouter();
  const [scrolled, setScrolled]   = useState(false);

  const scrollToSection = (id: string) => {
    if (pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/#${id}`);
    }
  };
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSec, setMobileSec]   = useState<string | null>(null);
  const [logoErr,   setLogoErr]     = useState(false);
  const [activites, setActivites]   = useState<Activite[]>([]);
  const [marques,   setMarques]     = useState<Marque[]>([]);
  const acts    = useHover(150);
  const marquesH = useHover(220);

  // ── Charger activités et marques depuis le backend ─────────────────
  useEffect(() => {
    // Charger les activités avec leurs catégories
    fetch(`${BASE}/activites`).then(r => r.json()).then(j => {
      const data: Activite[] = j.data ?? j ?? [];
      // Enrichir chaque activité avec ses catégories
      Promise.all(data.map(a =>
        fetch(`${BASE}/categories?id_activite=${a.id_activite}`).then(r => r.json())
          .then(d => {
            const all: CatItem[] = d.data ?? d ?? [];
            // Construire arbre : racines + leurs enfants
            const roots = all.filter(c => !c.parent_id).map(c => ({
              ...c,
              sous_cats: all.filter(sc => sc.parent_id === c.id_categorie)
            }));
            return { ...a, categories: roots };
          })
          .catch(() => a)
      )).then(setActivites);
    }).catch(() => {});

    fetch(`${BASE}/marques`).then(r => r.json()).then(j => {
      const data: Marque[] = j.data ?? j ?? [];
      // Charger les catégories pour chaque marque
      Promise.all(data.map(m =>
        fetch(`${BASE}/marques/${m.slug}`).then(r => r.json())
          .then(d => {
            const all: CatItem[] = d.data?.categories ?? d?.categories ?? [];
            // Construire arbre : racines + leurs enfants
            const roots = all.filter(c => !c.parent_id).map(c => ({
              ...c,
              sous_cats: all.filter(sc => sc.parent_id === c.id_categorie)
            }));
            return { ...m, categories: roots };
          })
          .catch(() => m)
      )).then(setMarques);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    fn(); window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (p: string) => p === "/" ? pathname === "/" : pathname?.startsWith(p);
  const dropShadow = "0 20px 60px rgba(0,0,0,0.13),0 0 0 1.5px rgba(46,125,79,0.14)";
  const nlBase: React.CSSProperties = { ...TY.navLink, color:C.ink, padding:"8px 14px", borderRadius:0, cursor:"pointer", display:"flex", alignItems:"center", gap:5, textDecoration:"none", transition:"color 0.15s", border:"none", background:"transparent", borderBottom:"2.5px solid transparent" };
  const nlOn: React.CSSProperties   = { ...nlBase, ...TY.navLinkOn, color:C.sage, borderBottom:`2.5px solid ${C.sage}` };
  const nlBtn: React.CSSProperties  = { ...nlBase, fontFamily:"inherit" };

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50"
        style={{ background: scrolled ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.93)", backdropFilter:"blur(28px)", borderBottom:`1.5px solid ${scrolled ? "rgba(46,125,79,0.15)" : C.line}`, boxShadow: scrolled ? `0 2px 24px rgba(46,125,79,0.1)` : "none", transition:"all 0.3s" }}>
        <div style={{ height:2.5, background:`linear-gradient(90deg,${C.gradA},${C.gradB},${C.gradC})` }}/>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div style={{ display:"flex", alignItems:"center", height:NAV_H }}>
            {/* Logo */}
            <Link href="/" style={{ display:"flex", alignItems:"center", marginRight:40, flexShrink:0, textDecoration:"none", lineHeight:0 }}>
              {!logoErr ? (
                <Image src="/logos/LOGO ESPACE VERT.png" alt="Espace Vert" width={4500} height={1200}
                  style={{ objectFit:"contain", height:90, width:"auto", maxWidth:340, display:"block" }}
                  onError={() => setLogoErr(true)} priority/>
              ) : (
                <span style={{ fontFamily:"var(--font-display)", fontWeight:900, fontSize:"1.2rem", color:C.sageDk, letterSpacing:"-0.03em" }}>
                  Espace<span style={{ color:C.sage }}>Vert</span>
                </span>
              )}
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex" style={{ flex:1, alignItems:"center", justifyContent:"center", gap:0, height:"100%" }}>
              <Link href="/qui-sommes-nous" style={isActive("/qui-sommes-nous") ? nlOn : nlBase} className="hover:text-[#2e7d4f]">Qui sommes-nous</Link>

              {/* Activités */}
              <div style={{ position:"relative" }} onMouseEnter={acts.show} onMouseLeave={acts.hide}>
                <button onClick={() => scrollToSection("nos-activites")} style={acts.open || isActive("/activites") ? nlOn : nlBtn} className="hover:text-[#2e7d4f]">
                  Nos activités
                  <motion.span animate={{ rotate: acts.open ? 180 : 0 }} transition={{ duration:0.22 }} style={{ display:"flex", alignItems:"center" }}>
                    <ChevronDownIcon style={{ width:12, height:12, opacity:0.5 }}/>
                  </motion.span>
                </button>
                <AnimatePresence>
                  {acts.open && (
                    <motion.div initial={{ opacity:0, y:10, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:0.96 }} transition={{ duration:0.15 }}
                      onMouseEnter={acts.keep} onMouseLeave={acts.hide}
                      style={{ position:"absolute", top:"100%", left:"50%", transform:"translateX(-50%)", marginTop:8, borderRadius:18, overflow:"hidden", zIndex:60, boxShadow:dropShadow }}>
                      <ActivitesDropdown activites={activites} onClose={acts.hide}/>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Marques */}
              <div style={{ position:"relative" }} onMouseEnter={marquesH.show} onMouseLeave={marquesH.hide}>
                <button onClick={() => scrollToSection("nos-marques")} style={marquesH.open || isActive("/marques") ? nlOn : nlBtn} className="hover:text-[#2e7d4f]">
                  Nos marques
                  <motion.span animate={{ rotate: marquesH.open ? 180 : 0 }} transition={{ duration:0.22 }} style={{ display:"flex", alignItems:"center" }}>
                    <ChevronDownIcon style={{ width:12, height:12, opacity:0.5 }}/>
                  </motion.span>
                </button>
                <AnimatePresence>
                  {marquesH.open && (
                    <motion.div initial={{ opacity:0, y:10, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:0.96 }} transition={{ duration:0.15 }}
                      onMouseEnter={marquesH.keep} onMouseLeave={marquesH.hide}
                      style={{ position:"absolute", top:"100%", left:"50%", transform:"translateX(-50%)", marginTop:8, borderRadius:18, overflow:"hidden", zIndex:60, boxShadow:dropShadow }}>
                      <MarquesDropdown marques={marques} onClose={marquesH.hide}/>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/contact" style={isActive("/contact") ? nlOn : nlBase} className="hover:text-[#2e7d4f]">Contact</Link>
            </div>

            {/* Right CTAs */}
            <div className="hidden lg:flex" style={{ alignItems:"center", gap:8, marginLeft:"auto" }}>
              <Link href="/rendez-vous" style={{ ...TY.cta, color:"#fff", background:`linear-gradient(135deg,${C.gradA},${C.gradB})`, padding:"9px 18px", borderRadius:9, boxShadow:`0 3px 10px rgba(46,125,79,0.3)`, display:"flex", alignItems:"center", gap:6, textDecoration:"none" }}>
                <Ico.Cal style={{ width:14, height:14 }}/>RDV
              </Link>
            </div>
            {/* Burger */}
            <button onClick={() => setMobileOpen(v => !v)} className="lg:hidden ml-auto p-2.5 rounded-xl"
              style={{ background:C.sageLt, color:C.sage, border:`1.5px solid ${C.border}`, cursor:"pointer" }}>
              <AnimatePresence mode="wait">
                <motion.div key={mobileOpen ? "x" : "bars"} initial={{ rotate:-90, opacity:0 }} animate={{ rotate:0, opacity:1 }} exit={{ rotate:90, opacity:0 }} transition={{ duration:0.18 }}>
                  {mobileOpen ? <Ico.X style={{ width:22, height:22 }}/> : <Ico.Menu style={{ width:22, height:22 }}/>}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>
      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }} transition={{ duration:0.22 }}
            className="fixed inset-x-0 z-40 bg-white overflow-hidden"
            style={{ top:NAV_H+2.5, borderTop:`1.5px solid ${C.line}`, boxShadow:"0 24px 48px rgba(0,0,0,0.12)" }}>
            <div className="p-4 max-h-[80vh] overflow-y-auto flex flex-col gap-2">
              <Link href="/qui-sommes-nous" onClick={() => setMobileOpen(false)}
                style={{ ...TY.mobileLink, color:C.ink, padding:"11px 16px", borderRadius:10, display:"block", textDecoration:"none" }} className="hover:bg-[#edf8f3]">
                Qui sommes-nous
              </Link>

              {/* Activités mobile */}
              <div>
                <button onClick={() => { scrollToSection("nos-activites"); setMobileOpen(false); setMobileSec(mobileSec === "acts" ? null : "acts"); }}
                  style={{ ...TY.mobileLink, color:C.ink, padding:"11px 16px", borderRadius:10, width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", background:"transparent", border:"none", cursor:"pointer" }} className="hover:bg-[#edf8f3]">
                  Nos activités
                  <ChevronDownIcon style={{ width:16, height:16, transition:"transform 0.2s", transform: mobileSec === "acts" ? "rotate(180deg)" : "none", color:C.ink3 }}/>
                </button>
                <AnimatePresence>
                  {mobileSec === "acts" && (
                    <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }} style={{ overflow:"hidden" }}>
                      {activites.map(a => (
                        <Link key={a.id_activite} href={`/activites/${a.slug}`} onClick={() => setMobileOpen(false)}
                          style={{ display:"flex", alignItems:"center", gap:11, padding:"9px 16px 9px 28px", borderRadius:9, textDecoration:"none" }} className="hover:bg-[#dff2e8]">
                          <div style={{ width:32, height:32, borderRadius:9, background:`linear-gradient(135deg,${C.sageLt},#c8f0d8)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, border:`1.5px solid ${C.border}`, overflow:"hidden" }}>
                            {a.image
                              ? <Image src={a.image} alt={a.nom} width={32} height={32} style={{ objectFit:"cover", width:"100%", height:"100%" }}/>
                              : <Ico.Leaf style={{ width:14, height:14, color:C.sage }}/>
                            }
                          </div>
                          <p style={{ ...TY.mobileLink, fontSize:14, color:C.ink }}>{a.nom}</p>
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
                    style={{ ...TY.mobileLink, color:C.ink, padding:"11px 16px", borderRadius:"10px 0 0 10px", flex:1, textDecoration:"none", display:"block", background:"transparent", border:"none", cursor:"pointer", textAlign:"left", fontFamily:"inherit" }} className="hover:bg-[#edf8f3]">
                    Nos marques
                  </button>
                  <button onClick={() => setMobileSec(mobileSec === "brands" ? null : "brands")}
                    style={{ padding:"11px 14px", borderRadius:"0 10px 10px 0", background:"transparent", border:"none", borderLeft:`1.5px solid ${C.line}`, cursor:"pointer", color:C.ink3 }} className="hover:bg-[#edf8f3]">
                    <ChevronDownIcon style={{ width:16, height:16, transition:"transform 0.2s", transform: mobileSec === "brands" ? "rotate(180deg)" : "none" }}/>
                  </button>
                </div>
                <AnimatePresence>
                  {mobileSec === "brands" && (
                    <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }} style={{ overflow:"hidden" }}>
                      {marques.map(m => (
                        <Link key={m.id_marque} href={`/marques/${m.slug}`} onClick={() => setMobileOpen(false)}
                          style={{ display:"flex", alignItems:"center", gap:11, marginLeft:12, padding:"10px 14px", borderRadius:12, border:`1.5px solid ${C.line}`, marginBottom:8, textDecoration:"none", background:"#fff" }} className="hover:bg-[#edf8f3]">
                          <div style={{ width:36, height:36, borderRadius:9, background:`linear-gradient(135deg,${C.sage},${C.sageMd})`, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
                            {m.logo
                              ? <Image src={m.logo} alt={m.nom} width={36} height={36} style={{ objectFit:"contain", padding:4, filter:"brightness(10)" }}/>
                              : <Ico.Leaf style={{ width:16, height:16, color:"rgba(255,255,255,0.92)" }}/>
                            }
                          </div>
                          <div>
                            <p style={{ ...TY.mobileLink, fontSize:14, color:C.ink }}>{m.nom}</p>
                            {m.description && <p style={{ fontSize:11.5, color:C.ink3 }}>{m.description.substring(0, 40)}</p>}
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/contact" onClick={() => setMobileOpen(false)}
                style={{ ...TY.mobileLink, color:C.ink, padding:"11px 16px", borderRadius:10, display:"block", textDecoration:"none" }} className="hover:bg-[#edf8f3]">
                Contact
              </Link>
              <Link href="/rendez-vous" onClick={() => setMobileOpen(false)}
                style={{ ...TY.cta, color:"#fff", background:`linear-gradient(135deg,${C.gradA},${C.gradB})`, padding:"12px 16px", borderRadius:10, display:"flex", alignItems:"center", gap:8, marginTop:4, textDecoration:"none" }}>
                <Ico.Cal style={{ width:16, height:16 }}/>Prendre RDV
              </Link>
              <Link href="/devis" onClick={() => setMobileOpen(false)}
                style={{ ...TY.cta, color:C.sage, background:C.sageLt, padding:"12px 16px", borderRadius:10, display:"flex", alignItems:"center", gap:8, textDecoration:"none", border:`1.5px solid ${C.border}` }}>
                Demander un devis
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
