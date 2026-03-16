"use client";
/**
 * app/[locale]/activites/irrigation/page.tsx
 * Thème : bleu-ciel pastel — teal #1b6b7a sur #eff8ff
 * Icônes : SVG Lucide inline (pas de dépendance extra si lucide non installé)
 */

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

const FADE = (d = 0) => ({ initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.55, ease: [0.22,1,0.36,1] as const, delay: d } });

const MT = { primary:"#1b6b7a", acc:"#4ba8d8", bg:"#eff8ff", foam:"#e0f4f8", border:"#bae6fd", text:"#0c2a32", mid:"#1e5566", soft:"#4a7a8a" };

const products = [
  { name:"Goutte-à-Goutte Premium", brand:"Matar", cat:"Irrigation localisée", desc:"Solution de précision pour cultures maraîchères et arboricoles.", features:["Économie d'eau jusqu'à 70 %","Distribution uniforme","Durabilité 10 ans","Installation rapide"] },
  { name:"Aspersion Intelligente",  brand:"Matar", cat:"Aspersion",           desc:"Système haute performance pour grandes surfaces agricoles.",          features:["Couverture jusqu'à 50 m","Réglage automatique","Résistant aux intempéries","Maintenance minimale"] },
  { name:"Irrigation Souterraine",  brand:"Matar", cat:"Irrigation enterrée", desc:"Technologie souterraine pour cultures intensives pérennes.",           features:["Invisible en surface","Réduction évaporation 95 %","Optimal cultures pérennes","Anti-colmatage"] },
];

const bureauServices = [
  { title:"Étude hydraulique",   desc:"Calcul des besoins en eau, dimensionnement des réseaux et optimisation des débits pour chaque parcelle." },
  { title:"Plan d'irrigation",   desc:"Conception détaillée avec cartographie des zones, placement des équipements et schémas d'installation." },
  { title:"Installation & suivi",desc:"Équipe technique certifiée pour l'installation, la mise en route et la maintenance de vos systèmes." },
];

// Icônes Lucide SVG
const IcoDroplets  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>;
const IcoWrench    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
const IcoRuler     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2"/></svg>;
const IcoCheck     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IcoArrow     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
const IcoCal       = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const IcoPhone     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.89 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.22 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/></svg>;
const PROD_ICONS = [<IcoDroplets/>, <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M3 12h.01M21 12h.01M12 3v.01M12 21v.01M5.636 5.636l.01.01M18.354 18.354l.01.01M5.636 18.354l.01.01M18.354 5.636l.01.01"/></svg>, <IcoRuler/>];
const SRV_ICONS  = [<IcoRuler/>, <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-4"/></svg>, <IcoWrench/>];

export default function IrrigationPage() {
  const t = useTranslations("activities.irrigation");
  const locale = useLocale();
  const [tab, setTab] = useState<"products"|"bureau">("products");

  return (
    <div style={{ background:"#fafffe", minHeight:"100vh" }}>

      {/* HERO */}
      <section style={{ background:`linear-gradient(135deg,${MT.foam} 0%,${MT.bg} 60%,#cce8f4 100%)`, position:"relative", overflow:"hidden", padding:"6rem 2rem 5.5rem", borderBottom:`1.5px solid ${MT.border}` }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(rgba(27,107,122,0.055) 1px,transparent 1px)`, backgroundSize:"28px 28px", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-1, left:0, right:0 }}>
          <svg viewBox="0 0 1440 48" style={{ width:"100%", height:48, display:"block" }} preserveAspectRatio="none">
            <path d="M0,48L1440,48L1440,14C1080,44,720,2,360,26C180,38,90,12,0,22Z" fill="#fafffe"/>
          </svg>
        </div>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <motion.div initial={{ opacity:0, y:26 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.65 }} style={{ maxWidth:680 }}>
            <span style={{ display:"inline-flex", alignItems:"center", gap:7, background:MT.primary, color:"white", padding:"5px 16px", borderRadius:99, fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:22 }}>
              <IcoDroplets/> {t("tag")}
            </span>
            <h1 style={{ fontSize:"clamp(2.2rem,5vw,3.6rem)", fontWeight:900, color:MT.text, lineHeight:1.08, letterSpacing:"-0.025em", marginBottom:18 }}>{t("pageTitle")}</h1>
            <p style={{ fontSize:"1.02rem", color:MT.mid, lineHeight:1.76, marginBottom:32, maxWidth:560 }}>{t("pageSubtitle")}</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
              <Link href={`/${locale}/contact`} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"11px 24px", background:MT.primary, color:"white", fontWeight:700, borderRadius:11, textDecoration:"none", boxShadow:`0 4px 16px ${MT.primary}2e` }}>
                {t("ctaContact")} <IcoArrow/>
              </Link>
              <Link href={`/${locale}/rendez-vous`} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"11px 24px", background:"white", color:MT.primary, fontWeight:600, borderRadius:11, textDecoration:"none", border:`1.5px solid ${MT.border}` }}>
                <IcoCal/> {t("ctaAppointment")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TABS */}
      <section style={{ padding:"4rem 2rem", background:"white" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"flex", gap:5, background:MT.bg, borderRadius:13, padding:5, width:"fit-content", margin:"0 auto 3rem", border:`1.5px solid ${MT.border}` }}>
            {[{k:"products",l:t("productsTab")},{k:"bureau",l:t("bureauTab")}].map(tb=>(
              <button key={tb.k} onClick={()=>setTab(tb.k as "products"|"bureau")}
                style={{ padding:"9px 24px", borderRadius:10, fontWeight:700, fontSize:"0.86rem", border:"none", cursor:"pointer", transition:"all .2s", background:tab===tb.k?MT.primary:"transparent", color:tab===tb.k?"white":MT.soft, boxShadow:tab===tb.k?`0 2px 10px ${MT.primary}28`:"" }}>
                {tb.l}
              </button>
            ))}
          </div>

          {tab==="products" && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:20 }}>
              {products.map((p,i)=>(
                <motion.div key={i} {...FADE(i*0.1)}
                  style={{ background:MT.bg, borderRadius:20, padding:"1.7rem", border:`1.5px solid ${MT.border}`, transition:"transform .2s,box-shadow .2s" }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.transform="translateY(-5px)";el.style.boxShadow=`0 12px 36px ${MT.primary}18`;}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.transform="";el.style.boxShadow="";}}
                >
                  <div style={{ width:44,height:44,borderRadius:12,background:`${MT.primary}12`,border:`1.5px solid ${MT.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:MT.primary,marginBottom:14 }}>
                    {PROD_ICONS[i]}
                  </div>
                  <span style={{ display:"inline-block",background:`${MT.acc}1a`,color:MT.primary,padding:"3px 10px",borderRadius:99,fontSize:"0.7rem",fontWeight:800,marginBottom:10,border:`1px solid ${MT.border}` }}>{p.cat}</span>
                  <h3 style={{ fontWeight:800,color:MT.text,marginBottom:7,fontSize:"0.97rem",lineHeight:1.3 }}>{p.name}</h3>
                  <p style={{ color:MT.soft,fontSize:"0.83rem",lineHeight:1.65,marginBottom:14 }}>{p.desc}</p>
                  <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                    {p.features.map((f,j)=>(
                      <div key={j} style={{ display:"flex",alignItems:"center",gap:7,color:MT.primary }}>
                        <IcoCheck/> <span style={{ fontSize:"0.79rem",color:MT.mid }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={`/${locale}/marques/matar`} style={{ display:"inline-flex",alignItems:"center",gap:5,marginTop:14,color:MT.primary,fontWeight:700,fontSize:"0.82rem",textDecoration:"none" }}>
                    {p.brand} <IcoArrow/>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {tab==="bureau" && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20 }}>
              {bureauServices.map((s,i)=>(
                <motion.div key={i} {...FADE(i*0.12)}
                  style={{ background:"white",borderRadius:20,padding:"2rem",border:`1.5px solid ${MT.border}`,transition:"transform .2s,box-shadow .2s" }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.transform="translateY(-5px)";el.style.boxShadow=`0 12px 36px ${MT.primary}12`;}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.transform="";el.style.boxShadow="";}}
                >
                  <div style={{ width:44,height:44,borderRadius:12,background:`${MT.primary}10`,border:`1.5px solid ${MT.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:MT.primary,marginBottom:16 }}>
                    {SRV_ICONS[i]}
                  </div>
                  <h3 style={{ fontWeight:800,color:MT.text,marginBottom:10,fontSize:"1rem" }}>{s.title}</h3>
                  <p style={{ color:MT.soft,lineHeight:1.7,fontSize:"0.88rem" }}>{s.desc}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"4rem 2rem",background:`linear-gradient(135deg,${MT.foam},${MT.bg})`,borderTop:`1.5px solid ${MT.border}` }}>
        <motion.div {...FADE()} style={{ maxWidth:540,margin:"0 auto",textAlign:"center" }}>
          <h2 style={{ fontSize:"clamp(1.4rem,3vw,2rem)",fontWeight:900,color:MT.text,marginBottom:10 }}>{t("ctaTitle")}</h2>
          <p style={{ color:MT.soft,marginBottom:28,lineHeight:1.65 }}>{t("ctaSubtitle")}</p>
          <div style={{ display:"flex",flexWrap:"wrap",gap:12,justifyContent:"center" }}>
            <a href="tel:+21671333858" style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"11px 24px",background:MT.primary,color:"white",fontWeight:700,borderRadius:11,textDecoration:"none" }}>
              <IcoPhone/> (+216) 71 333 858
            </a>
            <Link href={`/${locale}/rendez-vous`} style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"11px 24px",background:"white",color:MT.primary,fontWeight:600,borderRadius:11,textDecoration:"none",border:`1.5px solid ${MT.border}` }}>
              <IcoCal/> {t("ctaAppointment")}
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
