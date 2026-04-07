"use client";
/**
 * app/[locale]/activites/fertilisation/page.tsx
 * Thème : vert foncé #0f2d12 → #2d8c35
 * VERSION DYNAMIQUE — charge les produits Fertivert depuis /api/produits
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SparklesIcon, BeakerIcon, CheckCircleIcon, ArrowRightIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { getProduits, type ProduitPublic } from "@/lib/api";

const FADE = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
});

export default function FertilisationPage() {
  const t      = useTranslations("activities.fertilisation");
  const locale = useLocale();

  const [produits, setProduits] = useState<ProduitPublic[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    // Charger les produits Fertivert (marque fertivert = fertilisation)
    getProduits({ limit: 12, marque: "fertivert" } as any).then(res => {
      if (res.success && res.data) setProduits(res.data);
      setLoading(false);
    });
  }, []);

  const benefits = [
    { icon: ChartBarIcon,    value: "+30%", title: t("yieldImprovement"), desc: t("yieldDesc") },
    { icon: SparklesIcon,    value: "100%", title: t("customSolutions"),  desc: t("customDesc") },
    { icon: CheckCircleIcon, value: "✓",    title: t("bioCert"),          desc: t("bioCertDesc") },
  ];

  const expertises = [
    { icon: BeakerIcon,       title: t("soilAnalysis"),     desc: t("soilAnalysisDesc") },
    { icon: SparklesIcon,     title: t("fertPlans"),         desc: t("fertPlansDesc") },
    { icon: CheckCircleIcon,  title: t("agronomicSupport"), desc: t("agronomicSupportDesc") },
  ];

  const brands = [
    { name: "Fertivert Pro",    sub: "Agriculture Professionnelle", href: `/${locale}/marques/fertivert?division=pro`,    color: "#1f5226", division: "pro" },
    { name: "Fertivert Garden", sub: "Jardin & Gazon",              href: `/${locale}/marques/fertivert?division=garden`, color: "#2d8c35", division: "garden" },
  ];

  return (
    <div style={{ background: "#fafaf8", minHeight: "100vh" }}>

      {/* HERO — identique à l'original */}
      <section style={{ background: "linear-gradient(135deg,#0f2d12 0%,#1f5226 55%,#2d8c35 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.07) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        <div style={{ position: "absolute", bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 60" style={{ width: "100%", height: 60, display: "block" }} preserveAspectRatio="none">
            <path d="M0,60L1440,60L1440,20C1200,52,960,0,720,28C480,56,240,4,0,36Z" fill="#fafaf8" />
          </svg>
        </div>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "6rem 2rem 5.5rem" }}>
          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} style={{ maxWidth: 700 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", color: "#7dc040", padding: "5px 16px", borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 22, border: "1px solid rgba(125,192,64,0.3)" }}>
              <SparklesIcon style={{ width: 14, height: 14 }} /> {t("tag")}
            </span>
            <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)", fontWeight: 900, color: "white", lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: 18 }}>
              {t("heroTitle")}<br /><span style={{ color: "#7dc040" }}>{t("heroTitleAccent")}</span>
            </h1>
            <p style={{ fontSize: "1.02rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.76, marginBottom: 32, maxWidth: 560 }}>{t("heroDesc")}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link href={`/${locale}/marques/fertivert`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: "#7dc040", color: "#0f2d12", fontWeight: 700, borderRadius: 11, textDecoration: "none" }}>
                {t("seeRange")} <ArrowRightIcon style={{ width: 15, height: 15 }} />
              </Link>
              <Link href={`/${locale}/contact`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", color: "white", fontWeight: 600, borderRadius: 11, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>
                {t("bookConsult")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* BÉNÉFICES */}
      <section style={{ padding: "4rem 2rem", background: "#fafaf8" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
          {benefits.map((b, i) => (
            <motion.div key={i} {...FADE(i * 0.1)}
              style={{ background: "white", borderRadius: 18, padding: "1.8rem", border: "1.5px solid #e8f0e9", textAlign: "center" }}>
              <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#1f5226", marginBottom: 8 }}>{b.value}</div>
              <h3 style={{ fontWeight: 800, color: "#002810", fontSize: "0.95rem", marginBottom: 6 }}>{b.title}</h3>
              <p style={{ color: "#4a6b4e", fontSize: "0.8rem", lineHeight: 1.6 }}>{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* GAMMES DYNAMIQUES */}
      <section style={{ padding: "4rem 2rem", background: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div {...FADE()} style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "clamp(1.5rem,3.5vw,2.2rem)", fontWeight: 900, color: "#002810" }}>Nos Gammes Fertivert</h2>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {brands.map((brand, i) => {
              const brandProduits = produits.filter(p => p.division === brand.division).slice(0, 4);
              return (
                <motion.div key={i} {...FADE(i * 0.1)}
                  style={{ background: "#f8fef8", borderRadius: 20, padding: "2rem", border: "1.5px solid #e0e8e1", transition: "transform .2s,box-shadow .2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(0,40,16,0.1)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
                  <div style={{ width: 44, height: 44, background: brand.color, borderRadius: 12, marginBottom: 14 }} />
                  <h3 style={{ fontWeight: 900, color: "#002810", fontSize: "1.1rem", marginBottom: 4 }}>{brand.name}</h3>
                  <p style={{ color: "#4a6b4e", fontSize: "0.78rem", marginBottom: 16 }}>{brand.sub}</p>

                  {loading ? (
                    <div style={{ height: 60, background: "#e8f5e9", borderRadius: 8, animation: "pulse 1.5s infinite" }} />
                  ) : brandProduits.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                      {brandProduits.map(p => (
                        <span key={p.id_produit} style={{ background: "white", border: `1.5px solid ${brand.color}22`, color: brand.color, padding: "3px 10px", borderRadius: 99, fontSize: "0.7rem", fontWeight: 700 }}>
                          {p.nom.substring(0, 22)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                      {["Engrais de fond", "Biostimulants", "Spéciaux"].map(name => (
                        <span key={name} style={{ background: "white", border: `1.5px solid ${brand.color}22`, color: brand.color, padding: "3px 10px", borderRadius: 99, fontSize: "0.7rem", fontWeight: 700 }}>{name}</span>
                      ))}
                    </div>
                  )}

                  <Link href={brand.href}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 20px", background: brand.color, color: "white", fontWeight: 700, borderRadius: 10, textDecoration: "none", fontSize: "0.85rem" }}>
                    Découvrir la gamme <ArrowRightIcon style={{ width: 14, height: 14 }} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* EXPERTISE */}
      <section style={{ padding: "4rem 2rem", background: "#f8fef8" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div {...FADE()} style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "clamp(1.5rem,3.5vw,2.2rem)", fontWeight: 900, color: "#002810" }}>{t("expertiseTitle")}</h2>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18 }}>
            {expertises.map((e, i) => (
              <motion.div key={i} {...FADE(i * 0.1)}
                style={{ background: "white", borderRadius: 18, padding: "1.6rem", border: "1.5px solid #e0e8e1" }}>
                <div style={{ width: 42, height: 42, background: "linear-gradient(135deg,#1f5226,#2d8c35)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <e.icon style={{ width: 20, height: 20, color: "white" }} />
                </div>
                <h3 style={{ fontWeight: 800, color: "#002810", fontSize: "0.95rem", marginBottom: 8 }}>{e.title}</h3>
                <p style={{ color: "#4a6b4e", fontSize: "0.8rem", lineHeight: 1.65 }}>{e.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "4rem 2rem", background: "white" }}>
        <motion.div {...FADE()} style={{ maxWidth: 540, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, color: "#002810", marginBottom: 10 }}>{t("ctaTitle")}</h2>
          <p style={{ color: "#4a6b4e", marginBottom: 28, lineHeight: 1.65 }}>{t("ctaDesc")}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <Link href={`/${locale}/rendez-vous`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: "#1f5226", color: "white", fontWeight: 700, borderRadius: 11, textDecoration: "none" }}>
              {t("bookConsult")} <ArrowRightIcon style={{ width: 15, height: 15 }} />
            </Link>
            <Link href={`/${locale}/marques/fertivert`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: "#f0f9f1", color: "#1f5226", fontWeight: 600, borderRadius: 11, textDecoration: "none", border: "1.5px solid #c8eccc" }}>
              {t("seeRange")}
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
