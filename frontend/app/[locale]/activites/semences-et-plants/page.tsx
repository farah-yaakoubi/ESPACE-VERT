"use client";
/**
 * app/[locale]/activites/semences-et-plants/page.tsx
 * Thème : vert feuille + blé doré
 * VERSION DYNAMIQUE — produits depuis /api/produits + fallback statique
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { getProduits, getCategories, type ProduitPublic, type CategoriePublic } from "@/lib/api";

const C = {
  dark:    "#2C1A0E",
  green:   "#3D6B21",
  mid:     "#4E8A2A",
  leaf:    "#6AB73D",
  lime:    "#8FCC55",
  pale:    "#F0F8E8",
  bg:      "#FAFAF6",
  surface: "#FFFFFF",
  border:  "#DFF0C8",
  wheat:   "#C8A84B",
  earth:   "#8B6347",
  sand:    "#F5EDD5",
};

const BRAND_COLORS: Record<string, string> = {
  "TERA SEEDS": C.green, "NEXEEDS": "#0e4a8a", "GRIFFATON": "#8B1a1a",
  "SERVICE PLUS": "#6b3fa0", "CORA SEEDS": "#b45c00", "MEDITERRANEA SEMENTI": "#005a8a",
  "LIDEA": "#8a5a00", "PANAM": "#005a44", "SOUTHERN SEED": "#7a2a00", "ELORN PLANTS": "#004a6a",
};

const BRANDS_STATIC = ["TERA SEEDS", "NEXEEDS", "GRIFFATON", "SERVICE PLUS", "CORA SEEDS", "MEDITERRANEA SEMENTI", "LIDEA", "PANAM", "SOUTHERN SEED", "ELORN PLANTS"];

export default function SemencesPage() {
  const locale = useLocale();

  const [produits,   setProduits]   = useState<ProduitPublic[]>([]);
  const [categories, setCategories] = useState<CategoriePublic[]>([]);
  const [selCat,     setSelCat]     = useState<string>("");
  const [selType,    setSelType]    = useState<"semence" | "plant" | "">("");
  const [search,     setSearch]     = useState("");
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      getProduits({ limit: 100 } as any),
      getCategories(),
    ]).then(([resP, resC]) => {
      if (resP.success && resP.data) setProduits(resP.data.filter(p => p.marque.slug === "semences" || p.categorie.nom.toLowerCase().includes("semence") || p.categorie.nom.toLowerCase().includes("plant")));
      if (resC.success && resC.data) setCategories(resC.data.filter(c => c.nom.toLowerCase().includes("semence") || c.nom.toLowerCase().includes("plant") || c.nom.toLowerCase().includes("graine")));
      setLoading(false);
    });
  }, []);

  const filtered = produits.filter(p => {
    const matchCat    = !selCat    || p.categorie.slug === selCat;
    const matchSearch = !search    || p.nom.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>

      {/* HERO */}
      <section style={{ background: `linear-gradient(135deg,${C.dark} 0%,${C.green} 50%,${C.mid} 100%)`, position: "relative", overflow: "hidden", padding: "6rem 2rem 5.5rem" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${C.leaf}18 1px,transparent 1px)`, backgroundSize: "28px 28px" }} />
        <div style={{ position: "absolute", bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 56" style={{ width: "100%", height: 56, display: "block" }} preserveAspectRatio="none">
            <path d="M0,56L1440,56L1440,18C1200,50,960,6,720,30C480,54,240,4,0,28Z" fill={C.bg} />
          </svg>
        </div>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} style={{ maxWidth: 700 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", color: C.lime, padding: "5px 16px", borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 22, border: `1px solid ${C.lime}44` }}>
              🌱 Semences & Plants
            </span>
            <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)", fontWeight: 900, color: "white", lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: 18 }}>
              Semences & Plants<br /><span style={{ color: C.lime }}>Sélection Premium</span>
            </h1>
            <p style={{ fontSize: "1.02rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.76, marginBottom: 32, maxWidth: 560 }}>
              Distributeur exclusif des meilleures semences mondiales. Céréales, maraîchage, gazon, plants d'ornement : la qualité génétique pour des rendements supérieurs.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link href={`/${locale}/contact`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: C.leaf, color: C.dark, fontWeight: 700, borderRadius: 11, textDecoration: "none" }}>
                Demander un devis →
              </Link>
              <Link href={`/${locale}/produits`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: "rgba(255,255,255,0.12)", color: "white", fontWeight: 600, borderRadius: 11, textDecoration: "none", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}>
                Voir tout le catalogue
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MARQUES PARTENAIRES */}
      <section style={{ padding: "2.5rem 2rem", background: C.sand, borderBottom: `1.5px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: C.earth, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 16 }}>Nos marques distribuées</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {BRANDS_STATIC.map((b, i) => (
              <span key={i} style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 99, padding: "5px 14px", fontSize: "0.78rem", fontWeight: 800, color: BRAND_COLORS[b] ?? C.green }}>
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CATALOGUE */}
      <section style={{ padding: "4rem 2rem", background: C.bg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "clamp(1.5rem,3.5vw,2.2rem)", fontWeight: 900, color: C.dark }}>Catalogue Produits</h2>
          </motion.div>

          {/* Filtres */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher..."
              style={{ padding: "9px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: "0.85rem", outline: "none", background: "white", flex: 1, minWidth: 180 }} />
            {categories.slice(0, 6).map(cat => (
              <button key={cat.id_categorie} onClick={() => setSelCat(selCat === cat.slug ? "" : cat.slug)}
                style={{ padding: "8px 16px", borderRadius: 99, fontSize: "0.78rem", fontWeight: 700, border: `1.5px solid ${selCat === cat.slug ? C.green : C.border}`, cursor: "pointer", background: selCat === cat.slug ? C.green : "white", color: selCat === cat.slug ? "white" : C.green }}>
                {cat.nom}
              </button>
            ))}
          </div>

          {/* Grille */}
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ background: "white", borderRadius: 16, height: 200, border: `1.5px solid ${C.border}`, animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
              {filtered.map((p, i) => {
                const img = p.images?.[0];
                return (
                  <motion.div key={p.id_produit}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ background: C.surface, borderRadius: 16, overflow: "hidden", border: `1.5px solid ${C.border}`, transition: "transform .2s,box-shadow .2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${C.green}18`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
                    {img?.url ? (
                      <div style={{ position: "relative", height: 110, background: C.pale }}>
                        <Image src={img.url} alt={img.alt ?? p.nom} fill className="object-contain p-3" sizes="260px" />
                      </div>
                    ) : (
                      <div style={{ height: 80, background: `linear-gradient(135deg,${C.pale},${C.border})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>🌱</div>
                    )}
                    <div style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                        <span style={{ background: `${C.green}14`, color: C.green, padding: "2px 8px", borderRadius: 99, fontSize: "0.65rem", fontWeight: 800 }}>{p.categorie.nom}</span>
                        <span style={{ background: C.sand, color: C.earth, padding: "2px 8px", borderRadius: 99, fontSize: "0.65rem", fontWeight: 700 }}>{p.marque.nom}</span>
                      </div>
                      <h3 style={{ fontWeight: 800, color: C.dark, fontSize: "0.9rem", marginBottom: 6, lineHeight: 1.3 }}>{p.nom}</h3>
                      {p.description && (
                        <p style={{ color: "#4a6b4e", fontSize: "0.74rem", lineHeight: 1.5, marginBottom: 8 }}>
                          {p.description.replace(/<[^>]+>/g, "").substring(0, 80)}
                        </p>
                      )}
                      <Link href={`/${locale}/produits/${p.slug}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 700, color: C.green, textDecoration: "none" }}>
                        Voir fiche →
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Fallback statique si pas encore de produits en DB */
            <div style={{ textAlign: "center", padding: "4rem 2rem", background: C.pale, borderRadius: 20, border: `1.5px solid ${C.border}` }}>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>🌱</div>
              <h3 style={{ fontWeight: 800, color: C.dark, marginBottom: 8 }}>Catalogue en cours de mise à jour</h3>
              <p style={{ color: "#4a6b4e", marginBottom: 24 }}>Nos conseillers peuvent vous présenter l'ensemble de la gamme sur demande.</p>
              <Link href={`/${locale}/contact`}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: C.green, color: "white", fontWeight: 700, borderRadius: 11, textDecoration: "none" }}>
                Contacter un conseiller →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "4rem 2rem", background: C.pale }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ maxWidth: 540, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, color: C.dark, marginBottom: 10 }}>Besoin d'un conseil variétal ?</h2>
          <p style={{ color: "#4a6b4e", marginBottom: 28, lineHeight: 1.65 }}>Nos agronomes vous accompagnent dans le choix des variétés adaptées à votre région et vos cultures.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <a href="tel:+21671333858" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: C.green, color: "white", fontWeight: 700, borderRadius: 11, textDecoration: "none" }}>
              📞 (+216) 71 333 858
            </a>
            <Link href={`/${locale}/rendez-vous`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: "white", color: C.green, fontWeight: 600, borderRadius: 11, textDecoration: "none", border: `1.5px solid ${C.border}` }}>
              Prendre rendez-vous
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
