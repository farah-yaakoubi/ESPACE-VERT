"use client";
import { motion } from "framer-motion";
import { BeakerIcon, WrenchScrewdriverIcon, CheckCircleIcon, ArrowRightIcon, CalendarIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";

const FADE = (delay=0) => ({ initial:{opacity:0,y:24}, whileInView:{opacity:1,y:0}, viewport:{once:true}, transition:{duration:0.55,ease:[0.22,1,0.36,1],delay} });

export default function IrrigationPage() {
  const t = useTranslations("activities.irrigation");
  const locale = useLocale();
  const [tab, setTab] = useState<"products"|"bureau">("products");

  const products = [
    { icon:"💧", name:"Système Goutte-à-Goutte Premium", brand:"Matar", cat:"Irrigation localisée", desc:"Solution de précision pour cultures maraîchères et arboricoles", features:["Économie d'eau jusqu'à 70%","Distribution uniforme","Durabilité 10 ans","Installation rapide"] },
    { icon:"🌀", name:"Aspersion Intelligente",           brand:"Matar", cat:"Aspersion",           desc:"Système haute performance pour grandes surfaces",               features:["Couverture jusqu'à 50m","Réglage automatique","Résistant aux intempéries","Maintenance minimale"] },
    { icon:"🌱", name:"Irrigation Souterraine",           brand:"Matar", cat:"Irrigation enterrée", desc:"Technologie souterraine pour cultures intensives",              features:["Invisible en surface","Réduction évaporation 95%","Optimal cultures pérennes","Anti-colmatage"] },
  ];

  const bureauServices = [
    { icon:"📐", title:"Étude hydraulique",    desc:"Calcul des besoins en eau, dimensionnement des réseaux et optimisation des débits pour chaque parcelle." },
    { icon:"🗺️", title:"Plan d'irrigation",    desc:"Conception détaillée avec cartographie des zones, placement des équipements et schémas d'installation." },
    { icon:"⚙️", title:"Installation & suivi", desc:"Équipe technique certifiée pour l'installation, la mise en route et la maintenance de vos systèmes." },
  ];

  return (
    <div style={{background:"#fafaf8",minHeight:"100vh"}}>

      {/* ── HERO ── */}
      <section style={{background:"linear-gradient(135deg,#e8e4ff 0%,#5A3E98 50%,#6B4EA0 100%)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.06) 1px,transparent 1px)",backgroundSize:"28px 28px"}}/>
        <div style={{position:"absolute",bottom:-1,left:0,right:0}}>
          <svg viewBox="0 0 1440 60" style={{width:"100%",height:60,display:"block"}} preserveAspectRatio="none">
            <path d="M0,60L1440,60L1440,20C1200,52,960,0,720,28C480,56,240,4,0,36Z" fill="#fafaf8"/>
          </svg>
        </div>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"6rem 2rem 7rem"}}>
          <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.6,ease:[0.22,1,0.36,1]}} style={{maxWidth:680}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.25)",color:"white",padding:"6px 16px",borderRadius:99,fontSize:13,fontWeight:600,marginBottom:24}}>
              💧 {t("tag")}
            </span>
            <h1 style={{fontSize:"clamp(2.2rem,5vw,3.5rem)",fontWeight:900,color:"white",lineHeight:1.1,letterSpacing:"-0.025em",marginBottom:20}}>{t("pageTitle")}</h1>
            <p style={{fontSize:"1.1rem",color:"rgba(255,255,255,0.75)",lineHeight:1.7,marginBottom:36,maxWidth:560}}>{t("pageSubtitle")}</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
              <Link href={`/${locale}/contact`} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"13px 28px",background:"white",color:"#5A3E98",fontWeight:700,borderRadius:99,fontSize:"0.95rem",textDecoration:"none",boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}>
                {t("ctaContact")} <ArrowRightIcon style={{width:16,height:16}}/>
              </Link>
              <Link href={`/${locale}/rendez-vous`} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"13px 28px",background:"rgba(255,255,255,0.12)",color:"white",fontWeight:600,borderRadius:99,fontSize:"0.95rem",textDecoration:"none",border:"1.5px solid rgba(255,255,255,0.4)"}}>
                <CalendarIcon style={{width:18,height:18}}/> {t("ctaAppointment")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TABS ── */}
      <section style={{padding:"4rem 2rem",background:"white"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{display:"flex",gap:8,background:"#f4f3f0",borderRadius:14,padding:6,width:"fit-content",margin:"0 auto 3rem",boxShadow:"inset 0 1px 3px rgba(0,0,0,0.06)"}}>
            {[{key:"products",label:t("productsTab")},{key:"bureau",label:t("bureauTab")}].map(tb=>(
              <button key={tb.key} onClick={()=>setTab(tb.key as any)}
                style={{padding:"10px 28px",borderRadius:10,fontWeight:600,fontSize:"0.9rem",border:"none",cursor:"pointer",transition:"all .2s",background:tab===tb.key?"white":"transparent",color:tab===tb.key?"#4a7ab8":"#716e67",boxShadow:tab===tb.key?"0 2px 8px rgba(0,0,0,0.10)":""}}>
                {tb.label}
              </button>
            ))}
          </div>

          {tab==="products" && (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:24}}>
              {products.map((p,i)=>(
                <motion.div key={i} {...FADE(i*0.1)} style={{background:"#F5F0FF",borderRadius:20,padding:"1.75rem",border:"1.5px solid #D4C8F0",transition:"box-shadow .2s,transform .2s"}} onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 32px rgba(37,99,235,0.15)";e.currentTarget.style.transform="translateY(-4px)"}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="";e.currentTarget.style.transform=""}}>
                  <div style={{fontSize:"2.2rem",marginBottom:12}}>{p.icon}</div>
                  <div style={{display:"inline-block",background:"#EDE9F6",color:"#5A3E98",padding:"3px 12px",borderRadius:99,fontSize:"0.78rem",fontWeight:700,marginBottom:12}}>{p.cat}</div>
                  <h3 style={{fontWeight:800,color:"#eff8ff",marginBottom:6,fontSize:"1.05rem",lineHeight:1.3}}>{p.name}</h3>
                  <p style={{color:"#7060A0",fontSize:"0.88rem",lineHeight:1.6,marginBottom:16}}>{p.desc}</p>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {p.features.map((f,j)=>(
                      <div key={j} style={{display:"flex",alignItems:"center",gap:8}}>
                        <CheckCircleIcon style={{width:15,height:15,color:"#6B4EA0",flexShrink:0}}/>
                        <span style={{fontSize:"0.83rem",color:"#6B4EA0"}}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:16,display:"flex",alignItems:"center",gap:6,color:"#6B4EA0",fontWeight:700,fontSize:"0.88rem"}}>
                    <Link href={`/${locale}/marques/matar`} style={{color:"inherit",textDecoration:"none",display:"flex",alignItems:"center",gap:6}}>
                      {p.brand} <ArrowRightIcon style={{width:14,height:14}}/>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {tab==="bureau" && (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:24}}>
              {bureauServices.map((s,i)=>(
                <motion.div key={i} {...FADE(i*0.12)} style={{background:"white",borderRadius:20,padding:"2rem",border:"1.5px solid #e8e6e1",transition:"box-shadow .2s,transform .2s"}} onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 32px rgba(0,0,0,0.10)";e.currentTarget.style.transform="translateY(-4px)"}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="";e.currentTarget.style.transform=""}}>
                  <div style={{fontSize:"2.5rem",marginBottom:16}}>{s.icon}</div>
                  <h3 style={{fontWeight:800,color:"#eff8ff",marginBottom:10,fontSize:"1.1rem"}}>{s.title}</h3>
                  <p style={{color:"#716e67",lineHeight:1.65,fontSize:"0.92rem"}}>{s.desc}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{padding:"5rem 2rem",background:"linear-gradient(135deg,#e8e4ff 0%,#6B4EA0 100%)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)",backgroundSize:"32px 32px"}}/>
        <motion.div {...FADE()} style={{maxWidth:580,margin:"0 auto",textAlign:"center",position:"relative"}}>
          <h2 style={{fontSize:"clamp(1.6rem,3.5vw,2.2rem)",fontWeight:800,color:"white",marginBottom:12}}>{t("ctaTitle")}</h2>
          <p style={{color:"rgba(255,255,255,0.72)",marginBottom:36,lineHeight:1.6}}>{t("ctaSubtitle")}</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:12,justifyContent:"center"}}>
            <a href="tel:+21671333858" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"13px 28px",background:"white",color:"#5A3E98",fontWeight:700,borderRadius:99,textDecoration:"none"}}>📞 (+216) 71 333 858</a>
            <Link href={`/${locale}/rendez-vous`} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"13px 28px",background:"rgba(255,255,255,0.12)",color:"white",fontWeight:600,borderRadius:99,textDecoration:"none",border:"1.5px solid rgba(255,255,255,0.4)"}}>
              <CalendarIcon style={{width:18,height:18}}/> {t("ctaAppointment")}
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
