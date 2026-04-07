"use client";
/**
 * app/[locale]/activites/irrigation/page.tsx
 * Thème : bleu-ciel pastel — teal #1b6b7a sur #eff8ff
 * VERSION DYNAMIQUE — produits chargés depuis /api/produits?id_activite=...
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { getProduits, getCategories, type ProduitPublic } from "@/lib/api";

const FADE = (d = 0) => ({ initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay: d } });

const MT = { primary: "#1b6b7a", acc: "#4ba8d8", bg: "#eff8ff", foam: "#e0f4f8", border: "#bae6fd", text: "#0c2a32", mid: "#1e5566", soft: "#4a7a8a" };

const bureauServices = [
  { title: "Étude hydraulique",    desc: "Calcul des besoins en eau, dimensionnement des réseaux et optimisation des débits pour chaque parcelle." },
  { title: "Plan d'irrigation",    desc: "Conception détaillée avec cartographie des zones, placement des équipements et schémas d'installation." },
  { title: "Installation & suivi", desc: "Équipe technique certifiée pour l'installation, la mise en route et la maintenance de vos systèmes." },
];

const IcoDroplets = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" /></svg>;
const IcoWrench   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>;
const IcoRuler    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z" /><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2" /></svg>;
const IcoCheck    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
const IcoArrow    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
const IcoCal      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>;
const IcoPhone    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.89 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.22 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z" /></svg>;
const SRV_ICONS = [<IcoRuler />, <svg key="c" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M7 16l4-4 4 4 4-4" /></svg>, <IcoWrench />];

export default function IrrigationPage() {
  const t      = useTranslations("activities.irrigation");
  const locale = useLocale();

  const [tab,      setTab]      = useState<"products" | "bureau">("products");
  const [produits, setProduits] = useState<ProduitPublic[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    // Charger les produits liés à l'activité irrigation
    // On filtre par marque "matar" car Matar = irrigation
    getProduits({ limit: 50, marque: "matar" } as any).then(res => {
      if (res.success && res.data) setProduits(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ background: "#fafffe", minHeight: "100vh" }}>

      {/* HERO — identique à l'original */}
      <section style={{ background: `linear-gradient(135deg,${MT.foam} 0%,${MT.bg} 60%,#cce8f4 100%)`, position: "relative", overflow: "hidden", padding: "6rem 2rem 5.5rem", borderBottom: `1.5px solid ${MT.border}` }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(rgba(27,107,122,0.055) 1px,transparent 1px)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 48" style={{ width: "100%", height: 48, display: "block" }} preserveAspectRatio="none">
            <path d="M0,48L1440,48L1440,14C1080,44,720,2,360,26C180,38,90,12,0,22Z" fill="#fafffe" />
          </svg>
        </div>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} style={{ maxWidth: 680 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: MT.primary, color: "white", padding: "5px 16px", borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 22 }}>
              <IcoDroplets /> {t("tag")}
            </span>
            <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)", fontWeight: 900, color: MT.text, lineHeight: 1.08, letterSpacing: "-0.025em", marginBottom: 18 }}>
              {t("heroTitle")}<br /><span style={{ color: MT.primary }}>{t("heroTitleAccent")}</span>
            </h1>
            <p style={{ fontSize: "1.02rem", color: MT.mid, lineHeight: 1.76, marginBottom: 32, maxWidth: 560 }}>{t("heroDesc")}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link href={`/${locale}/rendez-vous`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: MT.primary, color: "white", fontWeight: 700, borderRadius: 11, textDecoration: "none" }}>
                <IcoCal /> {t("bookAppointment")}
              </Link>
              <Link href={`/${locale}/marques/matar`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: "white", color: MT.primary, fontWeight: 600, borderRadius: 11, textDecoration: "none", border: `1.5px solid ${MT.border}` }}>
                {t("seeRange")} <IcoArrow />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TABS */}
      <section style={{ padding: "0 2rem", background: "white", borderBottom: `1.5px solid ${MT.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 0 }}>
          {(["products", "bureau"] as const).map(t2 => (
            <button key={t2} onClick={() => setTab(t2)}
              style={{ padding: "1.1rem 2rem", fontWeight: 700, fontSize: "0.9rem", border: "none", cursor: "pointer", borderBottom: tab === t2 ? `2.5px solid ${MT.primary}` : "2.5px solid transparent", background: "transparent", color: tab === t2 ? MT.primary : MT.soft, transition: "all .2s" }}>
              {t2 === "products" ? t("tabProducts") : t("tabBureau")}
            </button>
          ))}
        </div>
      </section>

      {/* CONTENU */}
      <section style={{ padding: "4rem 2rem", background: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {tab === "products" && (
            <>
              {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 18 }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ background: MT.bg, borderRadius: 18, padding: "1.5rem", border: `1.5px solid ${MT.border}`, height: 200, animation: "pulse 1.5s infinite" }} />
                  ))}
                </div>
              ) : produits.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 18 }}>
                  {produits.map((p, i) => {
                    const img = p.images?.[0];
                    return (
                      <motion.div key={p.id_produit} {...FADE(i * 0.07)}
                        style={{ background: MT.bg, borderRadius: 18, border: `1.5px solid ${MT.border}`, overflow: "hidden", transition: "transform .2s, box-shadow .2s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${MT.primary}18`; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
                        {img?.url && (
                          <div style={{ position: "relative", height: 120, background: "white" }}>
                            <Image src={img.url} alt={img.alt ?? p.nom} fill className="object-contain p-3" sizes="300px" />
                          </div>
                        )}
                        <div style={{ padding: "1.2rem" }}>
                          <span style={{ display: "inline-block", background: `${MT.primary}14`, color: MT.primary, padding: "2px 10px", borderRadius: 99, fontSize: "0.65rem", fontWeight: 800, marginBottom: 8, textTransform: "uppercase" }}>
                            {p.categorie.nom}
                          </span>
                          <h3 style={{ fontWeight: 800, color: MT.text, fontSize: "0.95rem", marginBottom: 6, lineHeight: 1.3 }}>{p.nom}</h3>
                          {p.description && (
                            <p style={{ color: MT.soft, fontSize: "0.78rem", lineHeight: 1.6, marginBottom: 10 }}>
                              {p.description.replace(/<[^>]+>/g, "").substring(0, 100)}
                            </p>
                          )}
                          {p.fiche_technique && (
                            <div style={{ marginBottom: 10 }}>
                              {["Économie d'eau", "Distribution uniforme", "Durabilité"].map((f, fi) => (
                                <div key={fi} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                  <span style={{ color: MT.primary }}><IcoCheck /></span>
                                  <span style={{ color: MT.mid, fontSize: "0.75rem" }}>{f}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <Link href={`/${locale}/produits/${p.slug}`}
                            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 16px", background: MT.primary, color: "white", fontWeight: 700, borderRadius: 9, fontSize: "0.8rem", textDecoration: "none" }}>
                            Détail <IcoArrow />
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                /* Fallback si pas de produits en DB — cartes statiques */
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 18 }}>
                  {[
                    { name: "Goutte-à-Goutte Premium", cat: "Irrigation localisée", features: ["Économie d'eau jusqu'à 70%", "Distribution uniforme", "Durabilité 10 ans"] },
                    { name: "Aspersion Intelligente",  cat: "Aspersion",           features: ["Couverture jusqu'à 50m", "Réglage automatique", "Maintenance minimale"] },
                    { name: "Irrigation Souterraine",  cat: "Irrigation enterrée", features: ["Invisible en surface", "Réduction évaporation 95%", "Anti-colmatage"] },
                  ].map((p, i) => (
                    <motion.div key={i} {...FADE(i * 0.07)}
                      style={{ background: MT.bg, borderRadius: 18, padding: "1.5rem", border: `1.5px solid ${MT.border}` }}>
                      <span style={{ display: "inline-block", background: `${MT.primary}14`, color: MT.primary, padding: "2px 10px", borderRadius: 99, fontSize: "0.65rem", fontWeight: 800, marginBottom: 10, textTransform: "uppercase" }}>{p.cat}</span>
                      <h3 style={{ fontWeight: 800, color: MT.text, fontSize: "0.95rem", marginBottom: 10 }}>{p.name}</h3>
                      {p.features.map((f, fi) => (
                        <div key={fi} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                          <span style={{ color: MT.primary }}><IcoCheck /></span>
                          <span style={{ color: MT.mid, fontSize: "0.75rem" }}>{f}</span>
                        </div>
                      ))}
                      <Link href={`/${locale}/marques/matar`}
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 12, padding: "7px 16px", background: MT.primary, color: "white", fontWeight: 700, borderRadius: 9, fontSize: "0.8rem", textDecoration: "none" }}>
                        Voir la gamme <IcoArrow />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "bureau" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
              {bureauServices.map((s, i) => (
                <motion.div key={i} {...FADE(i * 0.1)}
                  style={{ background: MT.bg, borderRadius: 18, padding: "1.8rem", border: `1.5px solid ${MT.border}` }}>
                  <div style={{ width: 42, height: 42, background: MT.primary, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, color: "white" }}>
                    {SRV_ICONS[i]}
                  </div>
                  <h3 style={{ fontWeight: 800, color: MT.text, fontSize: "1rem", marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ color: MT.soft, fontSize: "0.83rem", lineHeight: 1.7 }}>{s.desc}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "4rem 2rem", background: MT.foam, borderTop: `1.5px solid ${MT.border}` }}>
        <motion.div {...FADE()} style={{ maxWidth: 540, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, color: MT.text, marginBottom: 10 }}>{t("ctaTitle")}</h2>
          <p style={{ color: MT.soft, marginBottom: 28, lineHeight: 1.65 }}>{t("ctaDesc")}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            <a href="tel:+21671333858" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: MT.primary, color: "white", fontWeight: 700, borderRadius: 11, textDecoration: "none" }}>
              <IcoPhone /> (+216) 71 333 858
            </a>
            <Link href={`/${locale}/rendez-vous`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: "white", color: MT.primary, fontWeight: 600, borderRadius: 11, textDecoration: "none", border: `1.5px solid ${MT.border}` }}>
              <IcoCal /> {t("bookAppointment")}
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
