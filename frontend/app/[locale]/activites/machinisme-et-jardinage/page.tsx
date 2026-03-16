"use client";
/**
 * app/[locale]/activites/machinisme-et-jardinage/page.tsx
 * Contenu basé sur la présentation Espace Vert — Machinisme, Jardinage & Pulvérisation
 * Thème : vert sauge clair — non foncé
 * Système de filtrage complet : catégorie + marque + recherche
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLocale } from "next-intl";

const FADE = (d = 0) => ({ initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay: d } });

// ─── Palette lumineuse ────────────────────────────────────────────────────────
const SL = {
  primary : "#334155",
  acc     : "#64748b",
  green   : "#10693B",
  gbg     : "#F1FDF4",
  bg      : "#F8FAFC",
  foam    : "#F1F5F9",
  border  : "#E2E8F0",
  text    : "#0F172A",
  mid     : "#334155",
  soft    : "#64748B",
  white   : "#FFFFFF",
};

// ─── DATA produits ────────────────────────────────────────────────────────────
type Product = {
  id       : string;
  name     : string;
  model    : string;
  spec     : string;
  brand    : string;
  category : string;
  subcat   : string;
  desc     : string;
  badge?   : string;
  usage    : string;
};

const PRODUCTS: Product[] = [
  // ── TONDEUSES ──
  { id:"t1",  name:"Autoportée Pro",       model:"Viking MT 6127 ZL", spec:"27 HP · 122 cm",    brand:"Viking/STIHL",  category:"Tondeuses",      subcat:"Autoportée",  desc:"Tondeuse autoportée haut de gamme pour grandes surfaces. Traction hydrostatique, coupé 122 cm.", usage:"Golfs, parcs, stades", badge:"Pro" },
  { id:"t2",  name:"Tondeuse Thermique",   model:"Viking MB 650 T",   spec:"2.9 kW · 48 cm",    brand:"Viking/STIHL",  category:"Tondeuses",      subcat:"Thermique",   desc:"Moteur Honda GCV, collecteur arrière, roulage facile sur terrains variés.", usage:"Jardins professionnels" },
  { id:"t3",  name:"Tondeuse Électrique",  model:"Viking ME 339",     spec:"1400 W · 37 cm",    brand:"Viking/STIHL",  category:"Tondeuses",      subcat:"Électrique",  desc:"Compacte et silencieuse, idéale pour les petits jardins et espaces verts urbains.", usage:"Jardins résidentiels" },
  { id:"t4",  name:"Robot Autonome",       model:"Viking iMow MI 422",spec:"Jusqu'à 2200 m²",   brand:"Viking/STIHL",  category:"Tondeuses",      subcat:"Robot",       desc:"Tonte automatique programmable via application. Rechargement autonome, silencieux.", usage:"Espaces verts résidentiels", badge:"Smart" },
  { id:"t5",  name:"Autoportée Gazon",     model:"WEIBANG WB 506 S",  spec:"20 HP · 102 cm",    brand:"WEIBANG",       category:"Tondeuses",      subcat:"Autoportée",  desc:"Moteur Briggs & Stratton, collecteur 300L, tondre avec aisance sur tout terrain.", usage:"Terrains sportifs, golfs" },
  { id:"t6",  name:"Tracteur Tondeuse",    model:"AGRICUT T422",      spec:"22 HP · 107 cm",    brand:"AGRICUT",       category:"Tondeuses",      subcat:"Autoportée",  desc:"Robuste et performant, adapté aux terrains accidentés et pentes modérées.", usage:"Entretien professionnel", badge:"Robuste" },

  // ── TAILLE-HAIES & TRONÇONNEUSES ──
  { id:"th1", name:"Taille-Haie Thermique", model:"Viking HT 5050",  spec:"0.9 kW · 50 cm",    brand:"Viking/STIHL",  category:"Taille & Coupe", subcat:"Taille-Haie", desc:"Lame double tranchant 50 cm, léger et équilibré pour entretien quotidien des haies.", usage:"Haies basses et moyennes" },
  { id:"th2", name:"Taille-Haie Électrique",model:"Viking HE 610",   spec:"600 W · 60 cm",     brand:"Viking/STIHL",  category:"Taille & Coupe", subcat:"Taille-Haie", desc:"Lame 60 cm, démarrage instantané, protection anti-rebond. Idéal espaces verts.", usage:"Entretien espaces verts" },
  { id:"th3", name:"Taille-Haie Pro",       model:"ACTIVE TH 620 T",  spec:"1.0 kW · 62 cm",   brand:"ACTIVE",        category:"Taille & Coupe", subcat:"Taille-Haie", desc:"Double poignée pivotante 360°, coupe propre même sur branches épaisses.", usage:"Haies hautes professionnelles", badge:"Pro" },
  { id:"th4", name:"Tronçonneuse Guide 35", model:"Outils Wolf CS 35", spec:"1.6 kW · 35 cm",  brand:"Outils WOLF",   category:"Taille & Coupe", subcat:"Tronçonneuse",desc:"Légère et maniable, chaîne Oregon, frein de chaîne de sécurité intégré.", usage:"Élagage, coupe bois" },
  { id:"th5", name:"Tronçonneuse Guide 45", model:"STIHL MS 250",     spec:"2.5 kW · 45 cm",   brand:"Viking/STIHL",  category:"Taille & Coupe", subcat:"Tronçonneuse",desc:"Professionnelle, système anti-vibrations, carburateur résistant aux inclinaisons.", usage:"Abattage, bûcheronnage", badge:"Professionnel" },

  // ── SOUFFLEURS & ASPIRATEURS ──
  { id:"s1",  name:"Souffleur Thermique",  model:"Viking LB 700",     spec:"0.9 kW · 70 m/s",  brand:"Viking/STIHL",  category:"Souffleurs",     subcat:"Thermique",   desc:"Débit d'air élevé, tube de soufflage confortable, réservoir grande capacité.", usage:"Grandes surfaces" },
  { id:"s2",  name:"Souffleur Électrique", model:"Viking EB 235 E",   spec:"2300 W · 60 m/s",  brand:"Viking/STIHL",  category:"Souffleurs",     subcat:"Électrique",  desc:"Souffleur sur roues, aspiration et broyage intégrés. 45L de sac collecteur.", usage:"Jardins et allées" },
  { id:"s3",  name:"Souffleur à dos",      model:"ACTIVE BL 565 T",   spec:"3.5 kW · 75 m/s",  brand:"ACTIVE",        category:"Souffleurs",     subcat:"Thermique",   desc:"Sangle ergonomique, moteur 4 temps, faibles vibrations. Parfait pour longue durée.", usage:"Professionnels espaces verts", badge:"Dos" },

  // ── MACHINISME AGRICOLE ──
  { id:"m1",  name:"Motoculteur Pro",      model:"AGRICUT MC 650",    spec:"6.5 HP · 80 cm",   brand:"AGRICUT",       category:"Machinisme Agri",subcat:"Motoculteur", desc:"Fraises réversibles, prise de force renforcée. Idéal pour la préparation du sol.", usage:"Cultures maraîchères", badge:"Pro" },
  { id:"m2",  name:"Rotavateur Léger",     model:"Staub BX 660",      spec:"6 HP · 66 cm",     brand:"Staub",         category:"Machinisme Agri",subcat:"Rotavateur",  desc:"Fraises acier traité, rouleau niveleur arrière, transmission renforcée.", usage:"Préparation sol, jardins" },
  { id:"m3",  name:"Scarificateur",        model:"WEIBANG SC 460",    spec:"2.5 kW · 46 cm",   brand:"WEIBANG",       category:"Machinisme Agri",subcat:"Scarificateur",desc:"Lames acier inox, ramassage de feutrages, idéal pour régénérer gazon stades.", usage:"Golfs, terrains sportifs" },
  { id:"m4",  name:"Aérateur de Gazon",    model:"Wiedenmann GX 122", spec:"22 HP · 122 cm",   brand:"Wiedenmann",    category:"Machinisme Agri",subcat:"Aérateur",    desc:"Aération profonde, système de couteaux creux, vidage automatique collecteur.", usage:"Golfs professionnels", badge:"Haute Perf." },

  // ── MATÉRIEL ESPACES VERTS PRO ──
  { id:"ev1", name:"Débroussailleuse",     model:"ACTIVE MF 550",     spec:"1.2 kW · 42 cm",   brand:"ACTIVE",        category:"Espaces Verts",  subcat:"Débroussa.",  desc:"Disque à 3 dents + fil nylon, anti-vibrations, protège avant pivotant.", usage:"Sous-bois, bords" },
  { id:"ev2", name:"Taille-Bordures Pro",  model:"Outils Wolf EB 400E",spec:"400 W · 20 cm",   brand:"Outils Wolf",   category:"Espaces Verts",  subcat:"Bordures",    desc:"Coupe nette des bordures de pelouse, pivotable 90°, guide-roue de profondeur.", usage:"Bordures et finitions" },
  { id:"ev3", name:"Ramasse-Feuilles",     model:"ACTIVE RF 3000",    spec:"3 kW · 100 cm",    brand:"ACTIVE",        category:"Espaces Verts",  subcat:"Ramassage",   desc:"Aspirateur-broyeur, réduction 10:1, cuve 500L, collecte toutes surfaces.", usage:"Parcs, forêts, golfs", badge:"Grande capacité" },
];

const CATEGORIES = [
  { id: "all",           label: "Tout le matériel",    icon: "⚙️" },
  { id: "Tondeuses",     label: "Tondeuses",            icon: "🌿" },
  { id: "Taille & Coupe",label: "Taille & Coupe",       icon: "✂️" },
  { id: "Souffleurs",    label: "Souffleurs",           icon: "💨" },
  { id: "Machinisme Agri",label:"Machinisme Agricole",  icon: "🚜" },
  { id: "Espaces Verts", label: "Espaces Verts Pro",    icon: "🏟️" },
];

const ALL_BRANDS = Array.from(new Set(PRODUCTS.map(p => p.brand))).sort();

const SERVICES = [
  { icon: "🔧", title: "Service Après-Vente",  desc: "Réparation et entretien par nos techniciens certifiés. Délai d'intervention rapide garanti pour limiter votre immobilisation." },
  { icon: "🔩", title: "Pièces Détachées",     desc: "Large stock de pièces d'origine pour toutes les marques référencées : Viking, STIHL, Wiedenmann, ACTIVE, Staub." },
  { icon: "🛡️", title: "Garantie Fabricant",   desc: "Tous nos équipements neufs sont couverts par la garantie constructeur complète avec suivi technique personnalisé." },
  { icon: "📋", title: "Étude & Devis",         desc: "Notre équipe vous accompagne dans le choix du matériel adapté à votre surface et votre usage. Devis gratuit sous 24h." },
];

// ─── SVG Icons inline ────────────────────────────────────────────────────────
const IcoSearch  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IcoX       = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>;
const IcoPhone   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.89 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.22 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/></svg>;
const IcoMail    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const IcoCal     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const IcoArrow   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;

// ─── Card produit ─────────────────────────────────────────────────────────────
function ProductCard({ product, locale }: { product: Product; locale: string }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      style={{
        background: SL.white,
        borderRadius: 18,
        border: `1.5px solid ${SL.border}`,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(15,23,42,0.05)",
        transition: "box-shadow .2s, transform .2s",
      }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-4px)"; el.style.boxShadow = "0 12px 32px rgba(51,65,85,0.12)"; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = ""; }}
    >
      {/* Header gradient */}
      <div style={{
        background: `linear-gradient(135deg, ${SL.primary} 0%, ${SL.acc} 100%)`,
        padding: "1rem 1.1rem 0.85rem",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
          <div>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
              {product.subcat}
            </p>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "white", lineHeight: 1.2 }}>{product.name}</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }}>
            {product.badge && (
              <span style={{ fontSize: "0.6rem", fontWeight: 800, background: "#4CAF50", color: "white", padding: "2px 8px", borderRadius: 99 }}>
                {product.badge}
              </span>
            )}
          </div>
        </div>
        <code style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.55)", fontFamily: "monospace" }}>{product.model}</code>
      </div>

      {/* Body */}
      <div style={{ padding: "0.9rem 1.1rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
          <span style={{ fontSize: "0.68rem", fontWeight: 700, background: SL.foam, color: SL.primary, padding: "3px 9px", borderRadius: 99, border: `1px solid ${SL.border}` }}>
            {product.spec}
          </span>
          <span style={{ fontSize: "0.68rem", fontWeight: 700, background: "#F1FDF4", color: SL.green, padding: "3px 9px", borderRadius: 99, border: "1px solid #C8E6C9" }}>
            {product.brand}
          </span>
        </div>
        <p style={{ fontSize: "0.8rem", color: SL.soft, lineHeight: 1.65, marginBottom: 8 }}>{product.desc}</p>
        <div style={{ fontSize: "0.7rem", color: SL.soft, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ color: SL.green }}>🎯</span> {product.usage}
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: "0 1.1rem 1rem", display: "flex", gap: 7 }}>
        <a href="tel:+21671333858" style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          background: SL.primary, color: "white",
          padding: "8px", borderRadius: 9, fontSize: "0.75rem", fontWeight: 700,
          textDecoration: "none",
        }}>
          <IcoPhone /> Appeler
        </a>
        <Link href={`/${locale}/contact?product=${encodeURIComponent(product.name)}`} style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          background: SL.foam, color: SL.primary,
          padding: "8px", borderRadius: 9, fontSize: "0.75rem", fontWeight: 700,
          textDecoration: "none", border: `1.5px solid ${SL.border}`,
        }}>
          <IcoMail /> Devis
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function MachinismePage() {
  const locale = useLocale();
  const [catFilter,   setCatFilter]   = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [search,      setSearch]      = useState("");

  const filtered = useMemo(() => PRODUCTS.filter(p => {
    if (catFilter !== "all" && p.category !== catFilter) return false;
    if (brandFilter !== "all" && p.brand !== brandFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.model.toLowerCase().includes(search.toLowerCase()) &&
        !p.desc.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [catFilter, brandFilter, search]);

  const resetFilters = () => { setCatFilter("all"); setBrandFilter("all"); setSearch(""); };

  return (
    <div style={{ background: SL.bg, minHeight: "100vh" }}>

      {/* ── HERO ── */}
      <section style={{ background: `linear-gradient(135deg, ${SL.foam} 0%, #E8EDF2 60%, #DDE3EA 100%)`, position: "relative", overflow: "hidden", padding: "6rem 2rem 5.5rem", borderBottom: `1.5px solid ${SL.border}` }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(rgba(51,65,85,0.045) 1px, transparent 1px)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 48" style={{ width: "100%", height: 48, display: "block" }} preserveAspectRatio="none">
            <path d="M0,48L1440,48L1440,14C1080,44,720,2,360,26C180,38,90,12,0,22Z" fill={SL.bg} />
          </svg>
        </div>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} style={{ maxWidth: 700 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: SL.primary, color: "white", padding: "5px 16px", borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 22 }}>
              🚜 Machinisme & Jardinage
            </span>
            <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", fontWeight: 900, color: SL.text, lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: 18 }}>
              Matériels Professionnels pour Espaces Verts & Agriculture
            </h1>
            <p style={{ fontSize: "1.02rem", color: SL.mid, lineHeight: 1.76, marginBottom: 32, maxWidth: 580 }}>
              Tondeuses autoportées, tronçonneuses, taille-haies, souffleurs et machinisme agricole pour l'entretien des parcs, stades, golfs, forêts et jardins.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link href={`/${locale}/contact`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: SL.primary, color: "white", fontWeight: 700, borderRadius: 11, textDecoration: "none" }}>
                Demander un devis <IcoArrow />
              </Link>
              <Link href={`/${locale}/rendez-vous`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: SL.white, color: SL.primary, fontWeight: 600, borderRadius: 11, textDecoration: "none", border: `1.5px solid ${SL.border}` }}>
                <IcoCal /> Rendez-vous
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CLIENTS CIBLES ── */}
      <section style={{ padding: "2.5rem 2rem", background: SL.white, borderBottom: `1px solid ${SL.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          {["Terrains de Golf 🏌️", "Hôteliers 🏨", "Parcs & Forêts 🌲", "Stades 🏟️", "Mairies 🏛️", "Paysagistes 🌿", "Agriculteurs 🚜"].map((c, i) => (
            <span key={i} style={{ background: SL.foam, border: `1.5px solid ${SL.border}`, borderRadius: 99, padding: "6px 14px", fontSize: "0.8rem", fontWeight: 700, color: SL.mid }}>
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* ── CATALOGUE + FILTRES ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem" }}>
        <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>

          {/* SIDEBAR filtres */}
          <aside style={{ width: 220, flexShrink: 0, position: "sticky", top: 90 }}>
            {/* Recherche */}
            <div style={{ background: SL.white, borderRadius: 16, border: `1.5px solid ${SL.border}`, padding: "1rem", marginBottom: 14 }}>
              <p style={{ fontSize: "0.68rem", fontWeight: 800, color: SL.primary, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Recherche</p>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="Nom, modèle…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: "100%", paddingLeft: 30, paddingRight: search ? 26 : 10, paddingTop: 8, paddingBottom: 8, borderRadius: 10, fontSize: "0.82rem", outline: "none", background: SL.foam, border: `1px solid ${SL.border}`, color: SL.text, boxSizing: "border-box" }}
                />
                <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: SL.soft }}><IcoSearch /></span>
                {search && (
                  <button onClick={() => setSearch("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", cursor: "pointer", color: SL.soft }}>
                    <IcoX />
                  </button>
                )}
              </div>
            </div>

            {/* Catégories */}
            <div style={{ background: SL.white, borderRadius: 16, border: `1.5px solid ${SL.border}`, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ background: `linear-gradient(90deg, ${SL.primary}, ${SL.acc})`, padding: "0.75rem 1rem" }}>
                <p style={{ fontSize: "0.68rem", fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Catégories</p>
              </div>
              <div style={{ padding: "0.5rem" }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCatFilter(cat.id)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 10px", borderRadius: 10, border: "none", cursor: "pointer",
                      background: catFilter === cat.id ? SL.foam : "transparent",
                      borderLeft: catFilter === cat.id ? `3px solid ${SL.primary}` : "3px solid transparent",
                      textAlign: "left", marginBottom: 2, transition: "all .15s",
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{cat.icon}</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: catFilter === cat.id ? 800 : 600, color: catFilter === cat.id ? SL.primary : SL.soft }}>{cat.label}</span>
                    <span style={{ marginLeft: "auto", fontSize: "0.65rem", fontWeight: 700, background: catFilter === cat.id ? SL.primary : SL.foam, color: catFilter === cat.id ? "white" : SL.soft, padding: "1px 6px", borderRadius: 99 }}>
                      {cat.id === "all" ? PRODUCTS.length : PRODUCTS.filter(p => p.category === cat.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Marques */}
            <div style={{ background: SL.white, borderRadius: 16, border: `1.5px solid ${SL.border}`, overflow: "hidden" }}>
              <div style={{ background: `linear-gradient(90deg, ${SL.primary}, ${SL.acc})`, padding: "0.75rem 1rem" }}>
                <p style={{ fontSize: "0.68rem", fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Marques</p>
              </div>
              <div style={{ padding: "0.5rem" }}>
                <button onClick={() => setBrandFilter("all")} style={{ width: "100%", textAlign: "left", padding: "7px 10px", borderRadius: 9, border: "none", cursor: "pointer", background: brandFilter === "all" ? SL.foam : "transparent", fontSize: "0.8rem", fontWeight: 700, color: brandFilter === "all" ? SL.primary : SL.soft, marginBottom: 2 }}>
                  Toutes
                </button>
                {ALL_BRANDS.map(brand => (
                  <button key={brand} onClick={() => setBrandFilter(brand)} style={{ width: "100%", textAlign: "left", padding: "7px 10px", borderRadius: 9, border: "none", cursor: "pointer", background: brandFilter === brand ? SL.foam : "transparent", fontSize: "0.78rem", fontWeight: 600, color: brandFilter === brand ? SL.primary : SL.soft, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: brandFilter === brand ? SL.primary : SL.border, flexShrink: 0 }} />
                    {brand}
                    <span style={{ marginLeft: "auto", fontSize: "0.62rem", color: SL.soft }}>
                      {PRODUCTS.filter(p => p.brand === brand).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* GRILLE produits */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Barre résultats */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: SL.text }}>
                <strong style={{ fontSize: "1.4rem" }}>{filtered.length}</strong> produit{filtered.length !== 1 ? "s" : ""}
              </span>
              {(catFilter !== "all" || brandFilter !== "all" || search) && (
                <button onClick={resetFilters} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.75rem", fontWeight: 700, color: SL.primary, background: SL.foam, border: `1px solid ${SL.border}`, padding: "4px 10px", borderRadius: 99, cursor: "pointer" }}>
                  <IcoX /> Réinitialiser
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {filtered.length > 0 ? (
                <motion.div
                  key={`${catFilter}-${brandFilter}-${search}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}
                >
                  {filtered.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <ProductCard product={p} locale={locale} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "5rem 2rem", background: SL.white, borderRadius: 20, border: `1.5px solid ${SL.border}` }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: SL.text, marginBottom: 8 }}>Aucun matériel trouvé</h3>
                  <p style={{ color: SL.soft, fontSize: "0.88rem", marginBottom: 20 }}>Modifiez vos critères de recherche</p>
                  <button onClick={resetFilters} style={{ padding: "10px 24px", background: SL.primary, color: "white", borderRadius: 11, fontWeight: 700, border: "none", cursor: "pointer" }}>
                    Voir tout le catalogue
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── MARQUES REPRÉSENTÉES ── */}
      <section style={{ padding: "3rem 2rem", background: SL.foam, borderTop: `1.5px solid ${SL.border}`, borderBottom: `1.5px solid ${SL.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 800, color: SL.soft, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 20 }}>Marques représentées</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {["METESIA", "Outils WOLF", "ACTIVE", "WEIBANG", "AGRICUT", "Staub", "Wiedenmann", "Viking/STIHL", "PULVERAGRO"].map((b, i) => (
              <span key={i} style={{ background: SL.white, border: `1.5px solid ${SL.border}`, borderRadius: 99, padding: "7px 18px", fontSize: "0.82rem", fontWeight: 700, color: SL.mid }}>
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section style={{ padding: "5rem 2rem", background: SL.white }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div {...FADE()} style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)", fontWeight: 900, color: SL.text }}>Nos Services</h2>
            <p style={{ color: SL.soft, marginTop: 8, fontSize: "0.92rem" }}>Accompagnement complet, du choix à l'entretien</p>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
            {SERVICES.map((s, i) => (
              <motion.div key={i} {...FADE(i * 0.1)}
                style={{ background: SL.foam, borderRadius: 18, padding: "1.8rem", border: `1.5px solid ${SL.border}`, transition: "transform .2s, box-shadow .2s" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-4px)"; el.style.boxShadow = `0 8px 24px rgba(51,65,85,0.10)`; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = ""; }}
              >
                <div style={{ fontSize: 28, marginBottom: 14 }}>{s.icon}</div>
                <h3 style={{ fontWeight: 800, color: SL.text, marginBottom: 8, fontSize: "0.97rem" }}>{s.title}</h3>
                <p style={{ color: SL.soft, fontSize: "0.86rem", lineHeight: 1.7 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "4rem 2rem", background: `linear-gradient(135deg, ${SL.foam}, #E2E8F0)`, borderTop: `1.5px solid ${SL.border}` }}>
        <motion.div {...FADE()} style={{ maxWidth: 540, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 900, color: SL.text, marginBottom: 10 }}>
            Besoin d'un conseil technique ?
          </h2>
          <p style={{ color: SL.soft, marginBottom: 28, lineHeight: 1.65 }}>
            Nos techniciens certifiés vous aident à choisir le bon matériel pour votre usage et votre surface.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <a href="tel:+21671333858" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: SL.primary, color: "white", fontWeight: 700, borderRadius: 11, textDecoration: "none" }}>
              <IcoPhone /> (+216) 71 333 858
            </a>
            <Link href={`/${locale}/contact`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: SL.white, color: SL.primary, fontWeight: 600, borderRadius: 11, textDecoration: "none", border: `1.5px solid ${SL.border}` }}>
              Nous contacter <IcoArrow />
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}