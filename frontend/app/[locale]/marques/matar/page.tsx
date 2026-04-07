"use client";
/**
 * app/[locale]/marques/matar/page.tsx
 * Thème : bleu-ciel pastel #1b6b7a / #eff8ff — palette Matar
 * VERSION DYNAMIQUE — charge les produits depuis /api/marques/matar
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { getMarqueBySlug, getProduits, type ProduitPublic } from "@/lib/api";

const FADE = (d = 0) => ({ initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay: d } });

const MT = { primary: "#1b6b7a", acc: "#4ba8d8", light: "#0369a1", bg: "#eff8ff", foam: "#e0f4f8", border: "#bae6fd", text: "#0c2a32", mid: "#1e5566", soft: "#4a7a8a" };

const STATS = [
  { value: "1985", label: "Fondation" },
  { value: "40+",  label: "Ans d'expertise" },
  { value: "PEHD", label: "Matériau principal" },
  { value: "Ø110", label: "Diamètre max" },
];

const BRANDS = ["Matar", "Rivulis", "Idroland", "FiTSA", "ADRITEC", "GREEN TAPE"];

// SVG Icons inline
const IcoFilter = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;
const IcoPipe   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20M2 6h6v12H2zM16 6h6v12h-6z" /></svg>;
const IcoLink   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;
const IcoArrow  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
const IcoPhone  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.89 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.22 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z" /></svg>;

export default function MatarPage() {
  const locale = useLocale();

  const [produits,   setProduits]   = useState<ProduitPublic[]>([]);
  const [categories, setCategories] = useState<{ id: string; label: string; icon: string; desc: string }[]>([]);
  const [activeTab,  setActiveTab]  = useState<string>("");
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getProduits({ limit: 100, marque: "matar" } as any);
      if (res.success && res.data && res.data.length > 0) {
        setProduits(res.data);
        // Grouper par catégorie
        const catMap = new Map<string, { id: string; label: string; icon: string; desc: string }>();
        for (const p of res.data) {
          const cSlug = p.categorie.slug;
          if (!catMap.has(cSlug)) {
            catMap.set(cSlug, {
              id:    cSlug,
              label: p.categorie.nom,
              icon:  cSlug.includes("filtre") ? "filter" : cSlug.includes("raccord") ? "connector" : "pipe",
              desc:  "",
            });
          }
        }
        const cats = Array.from(catMap.values());
        setCategories(cats);
        setActiveTab(cats[0]?.id ?? "");
      } else {
        // Fallback : catégories statiques si pas de produits en DB
        setCategories([
          { id: "fabrication", label: "Fabrication Tuyaux",  icon: "pipe",      desc: "Fabrication de tuyaux rigides et tubes lisses pour l'irrigation agricole, parcs et jardins" },
          { id: "filtres",     label: "Filtres & Stations",  icon: "filter",    desc: "Systèmes de filtration et stations de tête pour installations d'irrigation professionnelles" },
          { id: "raccordement",label: "Raccordement",        icon: "connector", desc: "Accessoires et raccords pour tous types de réseaux d'irrigation agricole" },
        ]);
        setActiveTab("fabrication");
      }
      setLoading(false);
    }
    load();
  }, []);

  const ICONS: Record<string, JSX.Element> = { pipe: <IcoPipe />, filter: <IcoFilter />, connector: <IcoLink /> };

  const tabProduits = produits.filter(p => p.categorie.slug === activeTab);
  const activeCategory = categories.find(c => c.id === activeTab);

  return (
    <div style={{ background: "#fafffe", minHeight: "100vh" }}>

      {/* HERO — même design que l'original */}
      <section style={{ background: `linear-gradient(135deg,${MT.foam} 0%,${MT.bg} 60%,#cce4f0 100%)`, position: "relative", overflow: "hidden", padding: "6rem 2rem 5.5rem", borderBottom: `1.5px solid ${MT.border}` }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(rgba(27,107,122,0.055) 1px,transparent 1px)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 48" style={{ width: "100%", height: 48, display: "block" }} preserveAspectRatio="none">
            <path d="M0,48L1440,48L1440,14C1080,44,720,2,360,26C180,38,90,12,0,22Z" fill="#fafffe" />
          </svg>
        </div>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} style={{ maxWidth: 680 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: MT.primary, color: "white", padding: "5px 16px", borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 22 }}>
              <IcoPipe /> Matar Irrigation
            </span>
            <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)", fontWeight: 900, color: MT.text, lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: 18 }}>
              Solutions d'Irrigation<br /><span style={{ color: MT.primary }}>Professionnelles</span>
            </h1>
            <p style={{ fontSize: "1.02rem", color: MT.mid, lineHeight: 1.76, marginBottom: 32, maxWidth: 560 }}>
              Fabricant et distributeur de matériel d'irrigation de haute qualité. Tuyaux PEHD, tubes à goutteur, filtres et stations de tête pour l'agriculture tunisienne.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link href={`/${locale}/contact`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: MT.primary, color: "white", fontWeight: 700, borderRadius: 11, textDecoration: "none" }}>
                Demander un devis <IcoArrow />
              </Link>
              <Link href={`/${locale}/activites/irrigation`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: "white", color: MT.primary, fontWeight: 600, borderRadius: 11, textDecoration: "none", border: `1.5px solid ${MT.border}` }}>
                Voir nos solutions
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: "2.5rem 2rem", background: "white", borderBottom: `1.5px solid ${MT.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14 }}>
          {STATS.map((s, i) => (
            <motion.div key={i} {...FADE(i * 0.06)} style={{ textAlign: "center", padding: "1rem", background: MT.bg, borderRadius: 14, border: `1.5px solid ${MT.border}` }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: MT.primary, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "0.7rem", color: MT.soft, fontWeight: 700, marginTop: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CATALOGUE DYNAMIQUE */}
      <section style={{ padding: "5rem 2rem", background: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div {...FADE()} style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "clamp(1.5rem,3.5vw,2.2rem)", fontWeight: 900, color: MT.text }}>Catalogue Produits</h2>
          </motion.div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ background: MT.bg, borderRadius: 16, padding: "1.25rem", border: `1.5px solid ${MT.border}`, animation: "pulse 1.5s infinite" }}>
                  <div style={{ height: 14, background: "#e0f4f8", borderRadius: 8, marginBottom: 10, width: "60%" }} />
                  <div style={{ height: 10, background: "#e0f4f8", borderRadius: 8, width: "80%" }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Tabs catégories */}
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 28 }}>
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setActiveTab(cat.id)}
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 11, fontWeight: 700, fontSize: "0.84rem", border: "none", cursor: "pointer", whiteSpace: "nowrap", transition: "all .2s", background: activeTab === cat.id ? MT.primary : MT.bg, color: activeTab === cat.id ? "white" : MT.mid, boxShadow: activeTab === cat.id ? `0 2px 10px ${MT.primary}28` : "", borderWidth: 1.5, borderStyle: "solid", borderColor: activeTab === cat.id ? MT.primary : MT.border }}>
                    <span style={{ opacity: activeTab === cat.id ? 1 : 0.7 }}>{ICONS[cat.icon] ?? <IcoPipe />}</span>
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Produits du tab actif */}
              <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                {activeCategory?.desc && (
                  <p style={{ color: MT.soft, fontSize: "0.9rem", marginBottom: 22, maxWidth: 600 }}>{activeCategory.desc}</p>
                )}

                {tabProduits.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
                    {tabProduits.map((p, i) => {
                      const img = p.images?.[0];
                      return (
                        <motion.div key={p.id_produit} {...FADE(i * 0.07)}
                          style={{ background: MT.bg, borderRadius: 16, padding: "1.25rem", border: `1.5px solid ${MT.border}`, transition: "transform .2s,box-shadow .2s", overflow: "hidden" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${MT.primary}16`; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
                          {img?.url && (
                            <div style={{ position: "relative", height: 90, marginBottom: 12, borderRadius: 10, overflow: "hidden", background: "white" }}>
                              <Image src={img.url} alt={img.alt ?? p.nom} fill className="object-contain p-2" sizes="220px" />
                            </div>
                          )}
                          {p.division && p.division !== "standard" && (
                            <span style={{ display: "inline-block", background: `${MT.primary}14`, color: MT.primary, padding: "2px 9px", borderRadius: 99, fontSize: "0.65rem", fontWeight: 800, marginBottom: 8, border: `1px solid ${MT.border}`, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                              {p.division}
                            </span>
                          )}
                          <h3 style={{ fontWeight: 800, color: MT.text, fontSize: "0.92rem", marginBottom: 6, lineHeight: 1.3 }}>{p.nom}</h3>
                          {p.description && (
                            <p style={{ color: MT.soft, fontSize: "0.76rem", lineHeight: 1.6 }}>{p.description.replace(/<[^>]+>/g, "").substring(0, 80)}</p>
                          )}
                          <Link href={`/${locale}/produits/${p.slug}`}
                            style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 10, fontSize: "0.75rem", fontWeight: 700, color: MT.primary, textDecoration: "none" }}>
                            Voir détail <IcoArrow />
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  /* Pas de produits pour ce tab — message discret */
                  <div style={{ textAlign: "center", padding: "3rem", color: MT.soft }}>
                    <p style={{ fontSize: "0.9rem" }}>Produits disponibles prochainement.</p>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* MARQUES PARTENAIRES */}
      <section style={{ padding: "3rem 2rem", background: MT.foam, borderTop: `1.5px solid ${MT.border}`, borderBottom: `1.5px solid ${MT.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: MT.soft, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 18 }}>Marques partenaires</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {BRANDS.map((b, i) => (
              <span key={i} style={{ background: "white", border: `1.5px solid ${MT.border}`, borderRadius: 99, padding: "6px 18px", fontSize: "0.82rem", fontWeight: 800, color: MT.primary }}>
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "4rem 2rem", background: "white" }}>
        <motion.div {...FADE()} style={{ maxWidth: 540, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, color: MT.text, marginBottom: 10 }}>Besoin d'un système d'irrigation ?</h2>
          <p style={{ color: MT.soft, marginBottom: 28, lineHeight: 1.65 }}>Nos ingénieurs réalisent l'étude, la fourniture et l'installation de A à Z.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <a href="tel:+21671333858" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: MT.primary, color: "white", fontWeight: 700, borderRadius: 11, textDecoration: "none" }}>
              <IcoPhone /> (+216) 71 333 858
            </a>
            <Link href={`/${locale}/rendez-vous`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: MT.bg, color: MT.primary, fontWeight: 600, borderRadius: 11, textDecoration: "none", border: `1.5px solid ${MT.border}` }}>
              Prendre rendez-vous
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
