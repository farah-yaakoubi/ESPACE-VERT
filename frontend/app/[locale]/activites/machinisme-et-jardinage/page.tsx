"use client";
/**
 * app/[locale]/activites/machinisme-et-jardinage/page.tsx
 * Thème : slate/gris-vert — palette SL
 * VERSION DYNAMIQUE — produits depuis /api/produits + fallback statique complet
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { getProduits, type ProduitPublic } from "@/lib/api";

const FADE = (d = 0) => ({ initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay: d } });

const SL = { primary: "#334155", acc: "#64748b", green: "#10693B", gbg: "#F1FDF4", bg: "#F8FAFC", foam: "#F1F5F9", border: "#E2E8F0", text: "#0F172A", mid: "#334155", soft: "#64748B", white: "#FFFFFF" };

// Fallback statique complet conservé de la version originale
const PRODUCTS_STATIC = [
  { id: "t1",  name: "Autoportée Pro",      model: "Viking MT 6127 ZL", spec: "27 HP · 122 cm",  brand: "Viking/STIHL", category: "Tondeuses", subcat: "Autoportée",  desc: "Tondeuse autoportée haut de gamme pour grandes surfaces.", badge: "Pro" },
  { id: "t2",  name: "Tondeuse Thermique",  model: "Viking MB 650 T",   spec: "2.9 kW · 48 cm",  brand: "Viking/STIHL", category: "Tondeuses", subcat: "Thermique",   desc: "Moteur Honda GCV, collecteur arrière." },
  { id: "t3",  name: "Tondeuse Électrique", model: "Viking ME 339",     spec: "1400 W · 37 cm",  brand: "Viking/STIHL", category: "Tondeuses", subcat: "Électrique",  desc: "Compacte et silencieuse, idéale petits jardins." },
  { id: "t4",  name: "Robot Autonome",      model: "Viking iMow MI 422",spec: "Jusqu'à 2200 m²", brand: "Viking/STIHL", category: "Tondeuses", subcat: "Robot",       desc: "Tonte automatique programmable.", badge: "Smart" },
  { id: "tr1", name: "Tracteur Compact",    model: "STIHL RT 4097",     spec: "97 cm · Mulching",brand: "STIHL",        category: "Tracteurs", subcat: "Compact",     desc: "Idéal propriétés jusqu'à 3000 m²." },
  { id: "tr2", name: "Débroussailleuse Pro",model: "STIHL FS 560 C-EM", spec: "3.7 kW · Pro",    brand: "STIHL",        category: "Tracteurs", subcat: "Coupe",       desc: "Pour travaux intensifs longue durée.", badge: "Pro" },
  { id: "s1",  name: "Brouette Pro",        model: "150 L acier",       spec: "200 kg charge",   brand: "Espace Vert",  category: "Jardinage", subcat: "Transport",   desc: "Caisse galvanisée, roue pneumatique." },
  { id: "s2",  name: "Kit Bêche/Râteau",    model: "Acier forgé",       spec: "Manche hêtre",    brand: "Espace Vert",  category: "Jardinage", subcat: "Outillage",   desc: "Outils de qualité professionnelle." },
];

export default function MachinismePage() {
  const locale = useLocale();

  const [produits,   setProduits]   = useState<ProduitPublic[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [selCat,     setSelCat]     = useState("Tous");
  const [selBrand,   setSelBrand]   = useState("Toutes");
  const [search,     setSearch]     = useState("");

  useEffect(() => {
    getProduits({ limit: 100 } as any).then(res => {
      // Filtrer uniquement machinisme/jardinage
      if (res.success && res.data) {
        const filtered = res.data.filter(p =>
          p.categorie.nom.toLowerCase().match(/tondeuse|tracteur|jardin|mach|outil|brouette|équipement/)
        );
        setProduits(filtered);
      }
      setLoading(false);
    });
  }, []);

  // Si pas de produits en DB, utiliser le fallback
  const useStatic = !loading && produits.length === 0;

  // Catégories dynamiques ou statiques
  const categories = useMemo(() => {
    if (useStatic) return ["Tous", ...Array.from(new Set(PRODUCTS_STATIC.map(p => p.category)))];
    const cats = new Set(produits.map(p => p.categorie.nom));
    return ["Tous", ...Array.from(cats)];
  }, [produits, useStatic]);

  const brands = useMemo(() => {
    if (useStatic) return ["Toutes", ...Array.from(new Set(PRODUCTS_STATIC.map(p => p.brand)))];
    const br = new Set(produits.map(p => p.marque.nom));
    return ["Toutes", ...Array.from(br)];
  }, [produits, useStatic]);

  // Filtrage
  const displayItems = useMemo(() => {
    if (useStatic) {
      return PRODUCTS_STATIC.filter(p => {
        const matchCat    = selCat   === "Tous"   || p.category === selCat;
        const matchBrand  = selBrand === "Toutes" || p.brand    === selBrand;
        const matchSearch = !search  || p.name.toLowerCase().includes(search.toLowerCase()) || p.model.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchBrand && matchSearch;
      });
    }
    return produits.filter(p => {
      const matchCat    = selCat   === "Tous"   || p.categorie.nom === selCat;
      const matchBrand  = selBrand === "Toutes" || p.marque.nom    === selBrand;
      const matchSearch = !search  || p.nom.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchBrand && matchSearch;
    });
  }, [produits, useStatic, selCat, selBrand, search]);

  return (
    <div style={{ background: SL.bg, minHeight: "100vh" }}>

      {/* HERO — identique à l'original */}
      <section style={{ background: `linear-gradient(135deg,#0F172A 0%,${SL.mid} 60%,${SL.green} 100%)`, position: "relative", overflow: "hidden", padding: "6rem 2rem 5.5rem" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(rgba(255,255,255,0.04) 1px,transparent 1px)`, backgroundSize: "28px 28px" }} />
        <div style={{ position: "absolute", bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 48" style={{ width: "100%", height: 48, display: "block" }} preserveAspectRatio="none">
            <path d="M0,48L1440,48L1440,14C1080,44,720,2,360,26C180,38,90,12,0,22Z" fill={SL.bg} />
          </svg>
        </div>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} style={{ maxWidth: 700 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", color: "#86efac", padding: "5px 16px", borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 22, border: "1px solid rgba(134,239,172,0.3)" }}>
              ⚙️ Machinisme & Jardinage
            </span>
            <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)", fontWeight: 900, color: "white", lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: 18 }}>
              Machinisme Agricole<br /><span style={{ color: "#86efac" }}>& Équipements</span>
            </h1>
            <p style={{ fontSize: "1.02rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.76, marginBottom: 32, maxWidth: 560 }}>
              Tondeuses, tracteurs, débroussailleuses et outillage de jardinage de marques professionnelles. Concessionnaire agréé Viking et STIHL en Tunisie.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link href={`/${locale}/contact`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: SL.green, color: "white", fontWeight: 700, borderRadius: 11, textDecoration: "none" }}>
                Demander un devis →
              </Link>
              <Link href={`/${locale}/rendez-vous`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: "rgba(255,255,255,0.1)", color: "white", fontWeight: 600, borderRadius: 11, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>
                Prendre rendez-vous
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CATALOGUE */}
      <section style={{ padding: "4rem 2rem", background: SL.bg }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Filtres */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 28, alignItems: "center", background: "white", padding: "1rem 1.25rem", borderRadius: 16, border: `1.5px solid ${SL.border}` }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher un produit..."
              style={{ flex: 1, minWidth: 160, padding: "8px 12px", borderRadius: 9, border: `1.5px solid ${SL.border}`, fontSize: "0.85rem", outline: "none" }} />
            <select value={selCat} onChange={e => setSelCat(e.target.value)}
              style={{ padding: "8px 14px", borderRadius: 9, border: `1.5px solid ${SL.border}`, fontSize: "0.83rem", fontWeight: 600, cursor: "pointer", background: "white" }}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={selBrand} onChange={e => setSelBrand(e.target.value)}
              style={{ padding: "8px 14px", borderRadius: 9, border: `1.5px solid ${SL.border}`, fontSize: "0.83rem", fontWeight: 600, cursor: "pointer", background: "white" }}>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            {(search || selCat !== "Tous" || selBrand !== "Toutes") && (
              <button onClick={() => { setSearch(""); setSelCat("Tous"); setSelBrand("Toutes"); }}
                style={{ padding: "8px 14px", borderRadius: 9, border: `1.5px solid ${SL.border}`, fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", background: "#fef2f2", color: "#b91c1c" }}>
                ✕ Effacer
              </button>
            )}
          </div>

          {/* Grille */}
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 16 }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ background: "white", borderRadius: 16, height: 220, border: `1.5px solid ${SL.border}`, animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={selCat + selBrand + search} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 16 }}>
                {displayItems.map((p: any, i: number) => {
                  const isDynamic = "id_produit" in p;
                  const img = isDynamic ? (p as ProduitPublic).images?.[0] : null;
                  return (
                    <motion.div key={isDynamic ? p.id_produit : p.id}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      style={{ background: SL.white, borderRadius: 16, overflow: "hidden", border: `1.5px solid ${SL.border}`, transition: "transform .2s,box-shadow .2s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${SL.primary}14`; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
                      {img?.url ? (
                        <div style={{ position: "relative", height: 110, background: SL.foam }}>
                          <Image src={img.url} alt={img.alt ?? p.nom} fill className="object-contain p-3" sizes="260px" />
                        </div>
                      ) : (
                        <div style={{ height: 70, background: SL.foam, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>⚙️</div>
                      )}
                      <div style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
                          <span style={{ background: SL.foam, color: SL.mid, padding: "2px 8px", borderRadius: 99, fontSize: "0.63rem", fontWeight: 800 }}>
                            {isDynamic ? (p as ProduitPublic).categorie.nom : p.category}
                          </span>
                          {(isDynamic ? (p as ProduitPublic).marque.nom : p.brand) && (
                            <span style={{ background: `${SL.green}12`, color: SL.green, padding: "2px 8px", borderRadius: 99, fontSize: "0.63rem", fontWeight: 800 }}>
                              {isDynamic ? (p as ProduitPublic).marque.nom : p.brand}
                            </span>
                          )}
                          {(p.badge) && (
                            <span style={{ background: "#1D6B2A", color: "white", padding: "2px 8px", borderRadius: 99, fontSize: "0.63rem", fontWeight: 800 }}>{p.badge}</span>
                          )}
                        </div>
                        <h3 style={{ fontWeight: 800, color: SL.text, fontSize: "0.9rem", marginBottom: 3, lineHeight: 1.3 }}>
                          {isDynamic ? (p as ProduitPublic).nom : p.name}
                        </h3>
                        {!isDynamic && <p style={{ color: SL.soft, fontSize: "0.72rem", marginBottom: 4 }}>{p.model} · {p.spec}</p>}
                        <p style={{ color: SL.soft, fontSize: "0.74rem", lineHeight: 1.5, marginBottom: 10 }}>
                          {isDynamic
                            ? (p as ProduitPublic).description?.replace(/<[^>]+>/g, "").substring(0, 70)
                            : p.desc}
                        </p>
                        {isDynamic ? (
                          <Link href={`/${locale}/produits/${(p as ProduitPublic).slug}`}
                            style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 700, color: SL.green, textDecoration: "none" }}>
                            Voir détail →
                          </Link>
                        ) : (
                          <Link href={`/${locale}/contact`}
                            style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 700, color: SL.green, textDecoration: "none" }}>
                            Demander prix →
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}

          {!loading && displayItems.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: SL.soft }}>
              <p>Aucun produit correspond à votre recherche.</p>
              <button onClick={() => { setSearch(""); setSelCat("Tous"); setSelBrand("Toutes"); }}
                style={{ marginTop: 12, padding: "8px 20px", background: SL.green, color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>
                Réinitialiser
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "4rem 2rem", background: "white" }}>
        <motion.div {...FADE()} style={{ maxWidth: 540, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, color: SL.text, marginBottom: 10 }}>Besoin d'un équipement ?</h2>
          <p style={{ color: SL.soft, marginBottom: 28, lineHeight: 1.65 }}>Nos techniciens vous conseillent sur le matériel adapté à votre usage et votre budget.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <a href="tel:+21671333858" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: SL.green, color: "white", fontWeight: 700, borderRadius: 11, textDecoration: "none" }}>
              📞 (+216) 71 333 858
            </a>
            <Link href={`/${locale}/rendez-vous`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: SL.foam, color: SL.mid, fontWeight: 600, borderRadius: 11, textDecoration: "none", border: `1.5px solid ${SL.border}` }}>
              Prendre rendez-vous
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
