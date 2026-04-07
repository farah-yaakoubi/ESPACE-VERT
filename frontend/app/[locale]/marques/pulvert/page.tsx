"use client";
/**
 * app/[locale]/marques/pulvert/page.tsx
 * Thème : vert + jaune accent — palette Pulvert
 * VERSION DYNAMIQUE — charge les produits depuis /api/produits?marque=pulvert
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { PhoneIcon, EnvelopeIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { getProduits, type ProduitPublic } from "@/lib/api";

const DIVISIONS_STATIC = [
  {
    id: "agricole",
    name: "Pulvert Agricole",
    subtitle: "Professionnels de l'Agriculture",
    gradient: "from-[#1D6B2A] to-[#27932F]",
    accent: "#F2C200",
  },
  {
    id: "garden",
    name: "Pulvert Garden",
    subtitle: "Jardin & Maison",
    gradient: "from-[#1D6B2A] to-[#3CB648]",
    accent: "#F2C200",
  },
];

export default function PulvertPage() {
  const locale = useLocale();

  const [produits,       setProduits]       = useState<ProduitPublic[]>([]);
  const [activeDivision, setActiveDivision] = useState("agricole");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [search,         setSearch]         = useState("");
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    getProduits({ limit: 200, marque: "pulvert" } as any).then(res => {
      if (res.success && res.data) setProduits(res.data);
      setLoading(false);
    });
  }, []);

  // Produits filtrés selon la division active
  const divisionProduits = produits.filter(p =>
    p.division === activeDivision || p.division === "standard"
  );

  // Catégories disponibles pour cette division
  const catMap = new Map<string, string>();
  for (const p of divisionProduits) catMap.set(p.categorie.slug, p.categorie.nom);
  const categories = Array.from(catMap.entries()).map(([slug, nom]) => ({ slug, nom }));

  const currentCat = activeCategory || categories[0]?.slug || "";

  // Filtrage final
  const filtered = divisionProduits.filter(p => {
    const matchCat    = !currentCat || p.categorie.slug === currentCat;
    const matchSearch = !search || p.nom.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const currentDiv = DIVISIONS_STATIC.find(d => d.id === activeDivision)!;

  return (
    <div style={{ background: "#fafffe", minHeight: "100vh" }}>

      {/* HERO */}
      <section className={`bg-gradient-to-br ${currentDiv?.gradient ?? "from-[#1D6B2A] to-[#3CB648]"}`}
        style={{ position: "relative", overflow: "hidden", padding: "6rem 2rem 5.5rem" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px,transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 48" style={{ width: "100%", height: 48, display: "block" }} preserveAspectRatio="none">
            <path d="M0,48L1440,48L1440,14C1080,44,720,2,360,26C180,38,90,12,0,22Z" fill="#fafffe" />
          </svg>
        </div>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} style={{ maxWidth: 700 }}>
            <span style={{ display: "inline-block", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", color: "white", padding: "5px 16px", borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 22, border: "1px solid rgba(255,255,255,0.3)" }}>
              🌿 Pulvert — Protection des Cultures
            </span>
            <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)", fontWeight: 900, color: "white", lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: 18, textShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
              Équipements de<br /><span style={{ color: currentDiv?.accent ?? "#F2C200" }}>Pulvérisation</span>
            </h1>
            <p style={{ fontSize: "1.02rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.76, marginBottom: 32, maxWidth: 560 }}>
              Gamme complète de pulvérisateurs agricoles et de jardin. Performance, durabilité et précision pour tous vos travaux de traitement phytosanitaire.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link href={`/${locale}/contact`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: "white", color: "#1D6B2A", fontWeight: 700, borderRadius: 11, textDecoration: "none" }}>
                Demander un devis →
              </Link>
              <Link href={`/${locale}/activites/pulverisation`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: "rgba(255,255,255,0.15)", color: "white", fontWeight: 600, borderRadius: 11, textDecoration: "none", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }}>
                Nos services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SÉLECTEUR DIVISION */}
      <section style={{ padding: "2rem 2rem 0", background: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 10, borderBottom: "2px solid #e8f0e9", paddingBottom: 0 }}>
            {DIVISIONS_STATIC.map(div => (
              <button key={div.id}
                onClick={() => { setActiveDivision(div.id); setActiveCategory(""); setSearch(""); }}
                style={{
                  padding: "12px 24px", fontWeight: 700, fontSize: "0.9rem", border: "none", cursor: "pointer", borderRadius: "10px 10px 0 0", transition: "all .2s",
                  background: activeDivision === div.id ? "#1D6B2A" : "transparent",
                  color:      activeDivision === div.id ? "white" : "#4a6b4e",
                  borderBottom: activeDivision === div.id ? "2px solid #1D6B2A" : "none",
                }}>
                {div.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CATALOGUE */}
      <section style={{ padding: "2rem 2rem 5rem", background: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Barre filtres */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 28, alignItems: "center" }}>
            {/* Recherche */}
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <MagnifyingGlassIcon style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#4a6b4e" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit..."
                style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 11, border: "1.5px solid #e0e8e1", fontSize: "0.85rem", outline: "none", background: "#f8fef8" }} />
              {search && (
                <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                  <XMarkIcon style={{ width: 16, height: 16, color: "#4a6b4e" }} />
                </button>
              )}
            </div>
            {/* Catégories */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button onClick={() => setActiveCategory("")}
                style={{ padding: "8px 16px", borderRadius: 99, fontSize: "0.8rem", fontWeight: 700, border: "1.5px solid", cursor: "pointer", background: !currentCat ? "#1D6B2A" : "white", color: !currentCat ? "white" : "#1D6B2A", borderColor: "#1D6B2A" }}>
                Tous
              </button>
              {categories.map(cat => (
                <button key={cat.slug} onClick={() => setActiveCategory(cat.slug)}
                  style={{ padding: "8px 16px", borderRadius: 99, fontSize: "0.8rem", fontWeight: 700, border: "1.5px solid", cursor: "pointer", background: currentCat === cat.slug ? "#1D6B2A" : "white", color: currentCat === cat.slug ? "white" : "#1D6B2A", borderColor: "#1D6B2A" }}>
                  {cat.nom}
                </button>
              ))}
            </div>
          </div>

          {/* Grille produits */}
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ background: "#f8fef8", borderRadius: 16, padding: "1.25rem", border: "1.5px solid #e0e8e1", height: 180, animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "#4a6b4e" }}>
              <p style={{ fontSize: "1rem", fontWeight: 600 }}>Aucun produit trouvé.</p>
              <button onClick={() => { setSearch(""); setActiveCategory(""); }} style={{ marginTop: 12, padding: "8px 20px", background: "#1D6B2A", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>
                Réinitialiser
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={activeDivision + currentCat + search} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
                {filtered.map((p, i) => {
                  const img = p.images?.[0];
                  return (
                    <motion.div key={p.id_produit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      style={{ background: "#f8fef8", borderRadius: 16, overflow: "hidden", border: "1.5px solid #e0e8e1", transition: "transform .2s,box-shadow .2s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(29,107,42,0.12)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
                      {img?.url ? (
                        <div style={{ position: "relative", height: 110, background: "white" }}>
                          <Image src={img.url} alt={img.alt ?? p.nom} fill className="object-contain p-3" sizes="220px" />
                        </div>
                      ) : (
                        <div style={{ height: 90, background: "linear-gradient(135deg,#dcf5de,#c8eccc)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: "2rem" }}>🌿</span>
                        </div>
                      )}
                      <div style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                          <span style={{ background: "rgba(29,107,42,0.1)", color: "#1D6B2A", padding: "2px 8px", borderRadius: 99, fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase" }}>
                            {p.categorie.nom}
                          </span>
                          {p.division !== "standard" && (
                            <span style={{ background: "#F2C200", color: "#2C1A0E", padding: "2px 8px", borderRadius: 99, fontSize: "0.65rem", fontWeight: 800 }}>
                              {p.division}
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontWeight: 800, color: "#002810", fontSize: "0.9rem", marginBottom: 4, lineHeight: 1.3 }}>{p.nom}</h3>
                        {p.description && (
                          <p style={{ color: "#4a6b4e", fontSize: "0.75rem", lineHeight: 1.5, marginBottom: 10 }}>
                            {p.description.replace(/<[^>]+>/g, "").substring(0, 70)}
                          </p>
                        )}
                        <Link href={`/${locale}/produits/${p.slug}`}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 700, color: "#1D6B2A", textDecoration: "none" }}>
                          Voir le produit →
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "4rem 2rem", background: "#f0f9f1" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ maxWidth: 540, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, color: "#002810", marginBottom: 10 }}>Besoin d'un équipement de pulvérisation ?</h2>
          <p style={{ color: "#4a6b4e", marginBottom: 28, lineHeight: 1.65 }}>Nos experts vous conseillent le matériel adapté à votre culture et surface.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <a href="tel:+21671333858" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: "#1D6B2A", color: "white", fontWeight: 700, borderRadius: 11, textDecoration: "none" }}>
              <PhoneIcon style={{ width: 16, height: 16 }} /> (+216) 71 333 858
            </a>
            <Link href={`/${locale}/contact`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: "white", color: "#1D6B2A", fontWeight: 600, borderRadius: 11, textDecoration: "none", border: "1.5px solid #c8eccc" }}>
              <EnvelopeIcon style={{ width: 16, height: 16 }} /> Nous écrire
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
