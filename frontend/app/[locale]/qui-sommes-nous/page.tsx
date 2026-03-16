"use client";
/**
 * app/(pages)/qui-sommes-nous/page.tsx
 */

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  CalendarDays, Award, Users, Globe2, Star, MapPin,
  Leaf, Target, Lightbulb, Handshake,
  Mail, ChevronRight,
} from "lucide-react";
import { TimelineEV } from "@/components/TimelineEV/TimelineEV";
import AgenceSection from "@/components/AgencesSection/AgenceSection";

const C = {
  forest: "#10693B",
  leaf  : "#4CAF50",
  sage  : "#66BB6A",
  foam  : "#F1FDF4",
  cream : "#FAFFF8",
  mint  : "#C8E6C9",
  mist  : "#E8F5E9",
  text  : "#1B3A2F",
  mid   : "#2E7D52",
  soft  : "#5A8A6A",
  white : "#FFFFFF",
};

const PAGE_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
.ev-page { font-family: 'DM Sans', sans-serif; }
.ev-serif { font-family: 'DM Serif Display', serif; font-weight: 400; }
`;

const EASE = [0.22, 1, 0.36, 1] as const;
const FADE = (delay = 0) => ({
  initial    : { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport   : { once: true },
  transition : { duration: 0.6, ease: EASE, delay },
});

const STATS = [
  { value:"1995", label:"Fondation",        icon:CalendarDays, color:C.forest  },
  { value:"30+",  label:"Ans d'expérience", icon:Award,        color:"#D97706" },
  { value:"100",  label:"Collaborateurs",   icon:Users,        color:"#0277BD" },
  { value:"30+",  label:"Marques intl.",    icon:Globe2,       color:"#7C3AED" },
  { value:"6",    label:"Marques propres",  icon:Star,         color:"#C2410C" },
  { value:"4",    label:"Agences Tunisie",  icon:MapPin,       color:C.leaf    },
];

const PARTENAIRES = [
  { name:"Baddar Agricole",    sub:"Pépinière & Semences",   src:"/logosPartenaires/logo baddar agricole.png"    },
  { name:"Mondiale Irrigation",sub:"Fabrication PEHD",       src:"/logosPartenaires/logo mendial irrigation.png" },
  { name:"Stajap",             sub:"Espaces Verts Pro",       src:"/logosPartenaires/logo stajap.png"             },
];

const VALEURS = [
  { icon:Star,      title:"Qualité & Fiabilité", text:"30 ans de confiance bâtie sur la qualité de nos produits et la fiabilité de nos services.",                             color:"#D97706", bg:"#FFFBEB", border:"#FDE68A" },
  { icon:Lightbulb, title:"Innovation",           text:"3 départements dédiés : R&D semences hybrides, irrigation goutte-à-goutte, service après-vente.",                       color:"#1565C0", bg:"#EFF6FF", border:"#BFDBFE" },
  { icon:Handshake, title:"Partenariat",          text:"30+ marques internationales de premier rang, représentées exclusivement sur le marché tunisien.",                       color:C.forest,  bg:C.cream,   border:C.mint    },
  { icon:Globe2,    title:"Présence nationale",   text:"4 agences : Borj El Amri, Tunis, Soliman et Sfax — couvrant tout le territoire.",                                      color:"#7C3AED", bg:"#F5F3FF", border:"#DDD6FE" },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const Icon   = stat.icon;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity:0,y:32 }}
      animate={inView?{opacity:1,y:0}:{}}
      transition={{ duration:.55,ease:EASE,delay:index*.07 }}
      whileHover={{ y:-5,boxShadow:`0 16px 40px ${stat.color}16` }}
      style={{ background:C.white,borderRadius:16,padding:"22px 14px 18px",textAlign:"center",border:`1px solid ${C.mist}`,cursor:"default",transition:"box-shadow .25s" }}
    >
      <motion.div
        initial={{ scale:.5,opacity:0 }}
        animate={inView?{scale:1,opacity:1}:{}}
        transition={{ duration:.4,delay:index*.07+.15,type:"spring",stiffness:200 }}
        style={{ width:44,height:44,borderRadius:12,background:`${stat.color}10`,border:`1.5px solid ${stat.color}20`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 13px" }}
      >
        <Icon size={18} style={{ color:stat.color }} strokeWidth={1.8}/>
      </motion.div>
      <div style={{ fontFamily:"'DM Serif Display',serif",fontSize:"clamp(1.7rem,4vw,2.5rem)",color:stat.color,lineHeight:1,marginBottom:5,letterSpacing:"-.02em" }}>{stat.value}</div>
      <div style={{ fontSize:".67rem",fontWeight:700,color:C.soft,textTransform:"uppercase",letterSpacing:".08em" }}>{stat.label}</div>
    </motion.div>
  );
}

// ─── Partenaire Card ──────────────────────────────────────────────────────────
function PartenaireCard({ p, index, inView }: { p:typeof PARTENAIRES[0]; index:number; inView:boolean }) {
  return (
    <motion.div
      initial={{ opacity:0,y:14 }}
      animate={inView?{opacity:1,y:0}:{opacity:0,y:14}}
      transition={{ delay:.28+index*.09,duration:.5,ease:EASE }}
      whileHover={{ y:-5,scale:1.05,boxShadow:`0 10px 28px rgba(15,96,53,.13)` }}
      style={{ width:172,height:90,borderRadius:14,background:C.white,border:`1.5px solid rgba(15,96,53,.12)`,boxShadow:"0 2px 12px rgba(0,0,0,.06)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",overflow:"hidden",cursor:"pointer",gap:6,padding:"10px" }}
    >
      <motion.div
        animate={{ y:[0,-4,0] }}
        transition={{ repeat:Infinity,duration:3.6+index*.7,ease:"easeInOut",delay:index*1.1 }}
        style={{ width:"76%",height:"54%",display:"flex",alignItems:"center",justifyContent:"center" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.src} alt={p.name}
          style={{ width:"100%",height:"100%",objectFit:"contain",filter:"drop-shadow(0 2px 6px rgba(0,0,0,.09))",opacity:.92 }}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.style.display = "none";
            const span = document.createElement("span");
            span.style.cssText = "font-family:'DM Serif Display',serif;font-size:13px;color:#1B3A2F;text-align:center;";
            span.textContent = p.name;
            img.parentElement?.appendChild(span);
          }}
        />
      </motion.div>
      <span style={{ fontSize:9.5,fontWeight:700,color:C.soft,textTransform:"uppercase",letterSpacing:".07em" }}>{p.sub}</span>
    </motion.div>
  );
}

// ─── Valeur Card ──────────────────────────────────────────────────────────────
function ValeurCard({ v, index }: { v:typeof VALEURS[0]; index:number }) {
  const Icon = v.icon;
  return (
    <motion.div
      {...FADE(index*.1)}
      whileHover={{ y:-5,boxShadow:`0 12px 32px ${v.color}16` }}
      style={{ background:v.bg,borderRadius:16,padding:"1.6rem",border:`1.5px solid ${v.border}`,cursor:"default",transition:"box-shadow .25s" }}
    >
      <motion.div
        whileHover={{ scale:1.14,rotate:6 }}
        transition={{ type:"spring",stiffness:280 }}
        style={{ width:42,height:42,borderRadius:11,background:`${v.color}10`,border:`1.5px solid ${v.color}20`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:15 }}
      >
        <Icon size={18} style={{ color:v.color }} strokeWidth={1.8}/>
      </motion.div>
      <h3 style={{ fontFamily:"'DM Sans',sans-serif",fontWeight:700,color:v.color,marginBottom:8,fontSize:".93rem" }}>{v.title}</h3>
      <p style={{ color:C.soft,fontSize:".8rem",lineHeight:1.72 }}>{v.text}</p>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type Props = {
  params: { locale: string };
};

export default function QuiSommesNousPage({ params }: Props) {
  const partenairesRef    = useRef<HTMLDivElement>(null);
  const partenairesInView = useInView(partenairesRef, { once: true, margin: "-60px" });

  return (
    <div className="ev-page" style={{ background:C.white,minHeight:"100vh" }}>
      <style>{PAGE_STYLE}</style>

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section style={{ background:`linear-gradient(135deg,${C.cream} 0%,#DAF5DE 55%,#CCE9D4 100%)`,position:"relative",overflow:"hidden",padding:"7rem 2rem 6rem",borderBottom:`1px solid ${C.mist}` }}>
        <div style={{ position:"absolute",inset:0,backgroundImage:`radial-gradient(${C.forest}07 1px,transparent 1px)`,backgroundSize:"28px 28px",pointerEvents:"none" }}/>
        <div style={{ position:"absolute",top:-100,right:-100,width:500,height:500,borderRadius:"50%",background:`radial-gradient(circle,${C.leaf}16 0%,transparent 70%)`,pointerEvents:"none" }}/>
        <div style={{ position:"absolute",bottom:-1,left:0,right:0 }}>
          <svg viewBox="0 0 1440 60" style={{ width:"100%",height:52,display:"block" }} preserveAspectRatio="none">
            <path d="M0,60L1440,60L1440,20C1080,52,720,4,360,30C180,44,90,14,0,26Z" fill={C.white}/>
          </svg>
        </div>

        <div style={{ maxWidth:820,margin:"0 auto",textAlign:"center",position:"relative" }}>
          <motion.div initial={{ opacity:0,y:36 }} animate={{ opacity:1,y:0 }} transition={{ duration:.75,ease:EASE }}>
            <motion.span
              initial={{ opacity:0,scale:.8 }} animate={{ opacity:1,scale:1 }} transition={{ delay:.1,duration:.4 }}
              style={{ display:"inline-flex",alignItems:"center",gap:8,background:C.forest,color:C.white,padding:"6px 20px",borderRadius:99,fontSize:10.5,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:28,boxShadow:`0 4px 20px ${C.forest}35` }}
            >
              <Leaf size={12} strokeWidth={2.5}/>
              Groupe Espace Vert · Fondé en 1995
            </motion.span>

            <h1 style={{ fontFamily:"'DM Serif Display',serif",fontSize:"clamp(2.6rem,6vw,4.4rem)",fontWeight:400,color:C.text,lineHeight:1.02,letterSpacing:"-.03em",marginBottom:22 }}>
              Qui sommes-<span style={{ color:C.forest,fontStyle:"italic" }}>nous&nbsp;?</span>
            </h1>

            <motion.p
              initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:.25,duration:.6 }}
              style={{ fontSize:"1.08rem",color:C.mid,maxWidth:580,margin:"0 auto",lineHeight:1.8 }}
            >
              Fondé par M. Abderraouf Ghariani, le Groupe Espace Vert est une référence tunisienne en production agricole, irrigation, espaces verts et animalerie depuis plus de 30 ans.
            </motion.p>

            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:9,marginTop:26 }}>
              <div style={{ width:44,height:1.5,background:"rgba(15,96,53,.22)",borderRadius:99 }}/>
              <div style={{ width:7,height:7,borderRadius:"50%",background:C.forest }}/>
              <div style={{ width:44,height:1.5,background:"rgba(15,96,53,.22)",borderRadius:99 }}/>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ STATS ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding:"56px 2rem",background:C.white }}>
        <div style={{ maxWidth:1100,margin:"0 auto" }}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:13 }}>
            {STATS.map((s,i) => <StatCard key={i} stat={s} index={i}/>)}
          </div>
        </div>
      </section>

      {/* ══ TIMELINE ════════════════════════════════════════════════════════ */}
      <TimelineEV/>

      {/* ══ PARTENAIRES ═════════════════════════════════════════════════════ */}
      <section style={{ padding:"5.5rem 2rem",background:C.white }}>
        <div style={{ maxWidth:1100,margin:"0 auto" }}>
          <motion.div {...FADE()} style={{ textAlign:"center",marginBottom:"3rem" }}>
            <span style={{ display:"inline-flex",alignItems:"center",gap:7,background:C.forest,color:C.white,padding:"5px 18px",borderRadius:99,fontSize:10.5,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:16 }}>
              <Handshake size={11} strokeWidth={2.5}/> Nos Filiales
            </span>
            <h2 style={{ fontFamily:"'DM Serif Display',serif",fontSize:"clamp(1.6rem,3.5vw,2.4rem)",fontWeight:400,color:C.text,letterSpacing:"-.02em" }}>
              3 marques qui nous <span style={{ fontStyle:"italic",color:C.forest }}>définissent</span>
            </h2>
            <p style={{ color:C.soft,marginTop:10,fontSize:".88rem",maxWidth:440,margin:"10px auto 0" }}>
              Des marques propres développées pour répondre aux besoins spécifiques du marché tunisien.
            </p>
          </motion.div>
          <div ref={partenairesRef}>
            <div style={{ display:"flex",justifyContent:"center",gap:24,flexWrap:"wrap" }}>
              {PARTENAIRES.map((p,i) => <PartenaireCard key={p.src} p={p} index={i} inView={partenairesInView}/>)}
            </div>
          </div>
        </div>
      </section>

      {/* ══ MISSION ═════════════════════════════════════════════════════════ */}
      <section style={{ padding:"4rem 2rem",background:C.foam }}>
        <div style={{ maxWidth:900,margin:"0 auto" }}>
          <motion.div {...FADE()}>
            <div style={{ background:`linear-gradient(135deg,${C.forest} 0%,${C.sage} 100%)`,borderRadius:24,padding:"clamp(28px,5vw,48px) clamp(24px,6vw,52px)",position:"relative",overflow:"hidden" }}>
              <div style={{ position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,.04) 1px,transparent 1px)",backgroundSize:"22px 22px",pointerEvents:"none" }}/>
              <div style={{ position:"absolute",right:-60,top:-60,width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,255,255,.07) 0%,transparent 70%)",pointerEvents:"none" }}/>
              <div style={{ position:"relative",display:"flex",alignItems:"flex-start",gap:22,flexWrap:"wrap" }}>
                <motion.div
                  whileHover={{ rotate:15,scale:1.1 }} transition={{ type:"spring",stiffness:250 }}
                  style={{ width:52,height:52,borderRadius:14,background:"rgba(255,255,255,.14)",border:"1px solid rgba(255,255,255,.23)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}
                >
                  <Target size={24} color="white" strokeWidth={1.7}/>
                </motion.div>
                <div>
                  <h2 style={{ fontFamily:"'DM Serif Display',serif",fontSize:"1.55rem",fontWeight:400,marginBottom:14,color:C.white }}>Notre Mission</h2>
                  <p style={{ fontSize:".97rem",color:"rgba(255,255,255,.88)",lineHeight:1.82,maxWidth:680 }}>
                    Véritable partenaire de nos clients, notre mission est de les accompagner dans toutes les phases du processus de la production agricole en leur guidant sur la voie des bonnes pratiques culturales et en leur offrant des produits modernes et des services personnalisés d'assistance technique et d'expertise.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ VALEURS ═════════════════════════════════════════════════════════ */}
      <section style={{ padding:"5.5rem 2rem",background:C.white }}>
        <div style={{ maxWidth:1100,margin:"0 auto" }}>
          <motion.div {...FADE()} style={{ textAlign:"center",marginBottom:"3rem" }}>
            <span style={{ display:"inline-flex",alignItems:"center",gap:7,background:C.forest,color:C.white,padding:"5px 18px",borderRadius:99,fontSize:10.5,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:16 }}>
              <Star size={11} strokeWidth={2.5}/> Nos Valeurs
            </span>
            <h2 style={{ fontFamily:"'DM Serif Display',serif",fontSize:"clamp(1.6rem,3.5vw,2.4rem)",fontWeight:400,color:C.text,letterSpacing:"-.02em" }}>
              Ce qui nous <span style={{ fontStyle:"italic",color:C.forest }}>définit</span>
            </h2>
          </motion.div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(215px,1fr))",gap:16 }}>
            {VALEURS.map((v,i) => <ValeurCard key={i} v={v} index={i}/>)}
          </div>
        </div>
      </section>

      {/* ══ AGENCES ═════════════════════════════════════════════════════════ */}
      <AgenceSection/>

      {/* ══ CTA ═════════════════════════════════════════════════════════════ */}
      <section style={{ padding:"5rem 2rem",background:C.white,textAlign:"center" }}>
        <motion.div {...FADE()}>
          <h2 style={{ fontFamily:"'DM Serif Display',serif",fontSize:"1.55rem",fontWeight:400,color:C.text,marginBottom:10 }}>
            Vous souhaitez <span style={{ fontStyle:"italic",color:C.forest }}>en savoir plus ?</span>
          </h2>
          <p style={{ color:C.soft,marginBottom:32,fontSize:".97rem" }}>Notre équipe d'experts est à votre disposition.</p>
          <div style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap" }}>
            <motion.div whileHover={{ scale:1.03,y:-2 }} whileTap={{ scale:.97 }}>
              <Link href="/contact" style={{ display:"inline-flex",alignItems:"center",gap:8,background:C.forest,color:C.white,padding:".86rem 1.9rem",borderRadius:13,fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:".9rem",textDecoration:"none",boxShadow:`0 4px 18px ${C.forest}33` }}>
                <Mail size={15} strokeWidth={2}/> Nous contacter
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale:1.03,y:-2 }} whileTap={{ scale:.97 }}>
              <Link href="/rendez-vous" style={{ display:"inline-flex",alignItems:"center",gap:8,background:C.cream,color:C.forest,padding:".86rem 1.9rem",borderRadius:13,fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:".9rem",border:`1.5px solid ${C.mint}`,textDecoration:"none" }}>
                <CalendarDays size={15} strokeWidth={2}/> Prendre rendez-vous <ChevronRight size={13} strokeWidth={2.5}/>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}