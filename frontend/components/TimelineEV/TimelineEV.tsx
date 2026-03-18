"use client";
/**
 * components/TimelineEV/TimelineEV.tsx
 */

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const C = {
  forest : "#10693B",
  leaf   : "#4CAF50",
  sage   : "#66BB6A",
  foam   : "#F1FDF4",
  mint   : "#C8E6C9",
  text   : "#1B3A2F",
  mid    : "#2E7D52",
  soft   : "#5A8A6A",
  muted  : "#90A890",
  white  : "#FFFFFF",
};

const KEYFRAMES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

@keyframes stemGrow {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}
@keyframes nodePop {
  0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
  70%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes pulseRing {
  0%   { transform: scale(1);   opacity: 0.5; }
  100% { transform: scale(2.4); opacity: 0; }
}
@keyframes cardSlideLeft {
  from { opacity: 0; transform: translateX(-44px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes cardSlideRight {
  from { opacity: 0; transform: translateX(44px); }
  to   { opacity: 1; transform: translateX(0); }
}

.tl-card-left  { animation: cardSlideLeft  0.65s cubic-bezier(0.22,1,0.36,1) both; }
.tl-card-right { animation: cardSlideRight 0.65s cubic-bezier(0.22,1,0.36,1) both; }
.tl-node-pop   { animation: nodePop  0.55s cubic-bezier(0.34,1.56,0.64,1) both; }
.tl-stem-grow  { animation: stemGrow 2s   cubic-bezier(0.22,1,0.36,1) both; transform-origin: top center; }
.tl-pulse-ring { animation: pulseRing 2.2s ease-out infinite; }

.flip-wrapper { perspective: 1200px; cursor: pointer; outline: none; }
.flip-inner {
  position: relative; min-height: 238px;
  transform-style: preserve-3d;
  transition: transform 0.62s cubic-bezier(0.34,1.1,0.64,1);
}
.flip-wrapper:hover .flip-inner,
.flip-wrapper:focus-within .flip-inner,
.flip-wrapper.is-flipped .flip-inner { transform: rotateY(180deg); }
.flip-face {
  position: absolute; inset: 0;
  backface-visibility: hidden; -webkit-backface-visibility: hidden;
  border-radius: 18px; overflow: hidden;
}
.flip-face-back { transform: rotateY(180deg); }

.tl-row { display: grid; grid-template-columns: 1fr 80px 1fr; align-items: start; }
.tl-col-left   { display: flex; justify-content: flex-end; padding-right: 28px; }
.tl-col-center { display: flex; flex-direction: column; align-items: center; gap: 8px; padding-top: 10px; overflow: visible; }
.tl-col-right  { padding-left: 28px; }
.tl-col-empty  { }

@media (max-width: 860px) {
  .tl-row { grid-template-columns: 60px 1fr; }
  .tl-col-left, .tl-col-right { grid-column: 2; grid-row: 1; justify-content: flex-start; padding-left: 18px; padding-right: 0; }
  .tl-col-center { grid-column: 1; grid-row: 1; }
  .tl-col-empty  { display: none; }
}
@media (max-width: 500px) {
  .tl-row { grid-template-columns: 48px 1fr; }
  .tl-col-left, .tl-col-right { padding-left: 12px; }
}
`;

const STEPS = [
  {
    year     : "1995",
    label    : "Fondation",
    title    : "Création d'Espace Vert SARL",
    summary  : "Fondée par M. Abderraouf Ghariani — premier acteur tunisien en commercialisation de semences agricoles en gros.",
    detail   : "La société démarre avec une vision claire : devenir la référence nationale en intrants agricoles. Un réseau solide de fournisseurs étrangers de grande renommée est mis en place dès les premières années, jetant les bases d'une croissance durable.",
    accent   : "#10693B", bg:"#F0FDF4", border:"#BBF7D0", highlight:"#D1FAE5",
    stat     : { label:"Activité de départ", value:"Semences" },
    chips    : ["Semences Agricoles","Gros & Détail"],
  },
  {
    year     : "2000+",
    label    : "Diversification",
    title    : "Extension des gammes produits",
    summary  : "Matériel agricole, irrigation, fertilisants, jardinage et animalerie rejoignent le catalogue.",
    detail   : "Grâce à la qualité et la fiabilité de ses services, la société étend son offre à 5 familles : matériel agricole, systèmes d'irrigation, fertilisants, jardinage, animalerie. Le réseau de fournisseurs internationaux se consolide avec des partenaires de premier rang.",
    accent   : "#1565C0", bg:"#EFF6FF", border:"#BFDBFE", highlight:"#DBEAFE",
    stat     : { label:"Familles de produits", value:"5+" },
    chips    : ["Irrigation","Fertilisants","Jardinage"],
  },
  {
    year     : "2005+",
    label    : "STAJAP",
    title    : "2ème société — Espaces Verts Pro",
    summary  : "Filiale spécialisée en matériels pour parcs, stades, golfs et installations sportives.",
    detail   : "STAJAP répond à une demande croissante des collectivités, hôteliers et terrains de golf. Matériels et produits pour espaces verts professionnels, animalerie, semences, engrais et outils.",
    accent   : "#0277BD", bg:"#E0F7FA", border:"#B2EBF2", highlight:"#E0F7FA",
    stat     : { label:"Clients cibles", value:"Golfs • Hôtels" },
    chips    : ["Stades","Parcs","Sport"],
  },
  {
    year     : "2010+",
    label    : "Mondiale Irrigation",
    title    : "3ème société — Fabrication industrielle",
    summary  : "Unité de fabrication de tuyaux PEHD, tubes lisses et tubes à goutteur pour l'irrigation.",
    detail   : "Intégration verticale majeure : fabrication de tuyaux PEHD (Ø 25–110 mm), tubes lisses et tubes à goutteur. Couverture complète de l'irrigation agricole, parcs et jardins.",
    accent   : "#006064", bg:"#E0F7FA", border:"#80DEEA", highlight:"#E0F7FA",
    stat     : { label:"Diamètres fabriqués", value:"Ø 25–110 mm" },
    chips    : ["PEHD","Tube Goutteur","Tube Lisse"],
  },
  {
    year     : "2015+",
    label    : "BADDAR AGRICOLE",
    title    : "4ème société — Pépinière & Semences",
    summary  : "Production et vente de plants francs et greffés, semences maraîchères et florales.",
    detail   : "Quatrième société du groupe, BADDAR AGRICOLE se concentre sur la production végétale : plants maraîchers, fruitiers et ornementaux. Semences florales et maraîchères de haute qualité génétique.",
    accent   : "#E65100", bg:"#FFF3E0", border:"#FFCC80", highlight:"#FFE0B2",
    stat     : { label:"Types de plants", value:"Francs & Greffés" },
    chips    : ["Plants Maraîchers","Fruitiers","Floraux"],
  },
  {
    year     : "Aujourd'hui",
    label    : "Leader National",
    title    : "Groupe Espace Vert — 30 ans",
    summary  : "100 collaborateurs, 30+ marques internationales, 6 marques propres, 5 agences nationales.",
    detail   : "Leader national reconnu. 30 cadres supérieurs — ingénieurs agronomes et techniciens. 5 agences : Borj El Amri, Tunis, Soliman, Kairouan et Sfax. 3 départements dédiés : R&D semences hybrides, irrigation goutte-à-goutte, SAV matériels professionnels.",
    accent   : "#10693B", bg:"#F0FDF4", border:"#86EFAC", highlight:"#DCFCE7",
    stat     : { label:"Collaborateurs", value:"100" },
    chips    : ["30+ Marques Intl.","6 Marques Propres","5 Agences"],
  },
];

// ─── Custom SVG icons ─────────────────────────────────────────────────────────
const Icons = {
  Seed: ({ size=22, color="currentColor" }: { size?:number; color?:string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12"/>
      <path d="M5 3C5 3 5.5 8 9 11C12.5 14 12 12 12 12C12 12 11.5 7 8 5C6 3.8 5 3 5 3Z" fill={color} fillOpacity="0.3"/>
      <path d="M19 3C19 3 18.5 8 15 11C11.5 14 12 12 12 12C12 12 12.5 7 16 5C18 3.8 19 3 19 3Z" fill={color} fillOpacity="0.3"/>
    </svg>
  ),
  Globe: ({ size=22, color="currentColor" }: { size?:number; color?:string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  Building: ({ size=22, color="currentColor" }: { size?:number; color?:string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
    </svg>
  ),
  Pipe: ({ size=22, color="currentColor" }: { size?:number; color?:string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4"/>
      <path d="M4 8a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2"/>
      <path d="M9 12h6"/>
      <circle cx="6" cy="12" r="1" fill={color}/>
      <circle cx="18" cy="12" r="1" fill={color}/>
    </svg>
  ),
  Flower: ({ size=22, color="currentColor" }: { size?:number; color?:string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3z" fill={color} fillOpacity="0.25"/>
      <path d="M12 16a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3z" fill={color} fillOpacity="0.25"/>
      <path d="M2 12a3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3z" fill={color} fillOpacity="0.25"/>
      <path d="M16 12a3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3z" fill={color} fillOpacity="0.25"/>
    </svg>
  ),
  Trophy: ({ size=22, color="currentColor" }: { size?:number; color?:string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16M12 17v5M8 17h8"/>
      <path d="M6 4h12v9a6 6 0 0 1-12 0Z"/>
    </svg>
  ),
};

const STEP_ICONS = [Icons.Seed, Icons.Globe, Icons.Building, Icons.Pipe, Icons.Flower, Icons.Trophy];

// ─── AnimatedStem ─────────────────────────────────────────────────────────────
function AnimatedStem({ inView }: { inView: boolean }) {
  return (
    <div style={{ position:"absolute",left:"50%",top:28,bottom:28,transform:"translateX(-50%)",width:2,pointerEvents:"none",zIndex:0 }}>
      <div
        className={inView ? "tl-stem-grow" : ""}
        style={{ width:"100%",height:"100%",background:`linear-gradient(to bottom,${C.sage} 0%,${C.forest} 60%,${C.mid} 100%)`,borderRadius:3,boxShadow:`0 0 12px ${C.leaf}44` }}
      />
    </div>
  );
}

// ─── Node ─────────────────────────────────────────────────────────────────────
function Node({ step, idx, delay, visible }: { step:typeof STEPS[0]; idx:number; delay:number; visible:boolean }) {
  const Icon = STEP_ICONS[idx];
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:7,overflow:"visible" }}>
      <div style={{ background:step.accent,color:"#fff",padding:"3px 10px",borderRadius:99,fontSize:10,fontWeight:800,whiteSpace:"nowrap",boxShadow:`0 2px 8px ${step.accent}44`,letterSpacing:".04em",zIndex:5 }}>
        {step.year}
      </div>
      <div
        className={visible ? "tl-node-pop" : ""}
        style={{ animationDelay:`${delay}s`,position:"relative",width:52,height:52,zIndex:4,overflow:"visible" }}
      >
        <div className="tl-pulse-ring" style={{ position:"absolute",inset:-6,borderRadius:"50%",border:`2px solid ${step.accent}`,zIndex:3 }}/>
        <div style={{ width:52,height:52,borderRadius:"50%",background:`linear-gradient(135deg,${step.accent} 0%,${step.accent}bb 100%)`,border:"3px solid white",boxShadow:`0 0 0 3px ${step.accent}33,0 6px 20px ${step.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",zIndex:4 }}>
          <Icon size={21} color="white"/>
        </div>
      </div>
    </div>
  );
}

// ─── FlipCard ─────────────────────────────────────────────────────────────────
function FlipCard({ step, idx, isLeft, index, visible }: { step:typeof STEPS[0]; idx:number; isLeft:boolean; index:number; visible:boolean }) {
  const [flipped, setFlipped] = useState(false);
  const Icon = STEP_ICONS[idx];

  return (
    <div
      className={visible ? (isLeft ? "tl-card-left" : "tl-card-right") : ""}
      style={{ animationDelay:`${index*0.13}s`,width:"100%",maxWidth:345 }}
    >
      <div
        className={`flip-wrapper${flipped ? " is-flipped" : ""}`}
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
        onClick={() => setFlipped(f => !f)}
        onFocus={() => setFlipped(true)}
        onBlur={() => setFlipped(false)}
        tabIndex={0}
        role="button"
        aria-label={`Détails : ${step.title}`}
        aria-pressed={flipped}
      >
        <div className="flip-inner">

          {/* ── RECTO ─────────────────────────────────────────────────── */}
          <div className="flip-face" style={{ background:C.white,border:`1.5px solid ${step.border}`,boxShadow:`0 4px 22px ${step.accent}10,0 1px 4px rgba(0,0,0,.05)`,padding:"1.35rem 1.4rem",display:"flex",flexDirection:"column",justifyContent:"space-between" }}>
            <div style={{ position:"absolute",top:0,right:0,width:80,height:80,background:`radial-gradient(circle at top right,${step.highlight},transparent 70%)`,borderRadius:"0 18px 0 0" }}/>
            <div>
              <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:13 }}>
                <div style={{ width:42,height:42,borderRadius:12,background:step.bg,border:`1.5px solid ${step.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 2px 8px ${step.accent}18` }}>
                  <Icon size={19} color={step.accent}/>
                </div>
                <div>
                  <div style={{ fontSize:9.5,fontWeight:800,color:step.accent,textTransform:"uppercase",letterSpacing:".1em" }}>{step.label}</div>
                  <h3 style={{ fontSize:".88rem",fontWeight:700,color:C.text,lineHeight:1.35,margin:0 }}>{step.title}</h3>
                </div>
              </div>
              <p style={{ fontSize:".79rem",color:C.soft,lineHeight:1.73,margin:0 }}>{step.summary}</p>
            </div>
            <div style={{ marginTop:14 }}>
              <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:9 }}>
                {step.chips.map((c,i) => (
                  <span key={i} style={{ fontSize:9.5,fontWeight:700,background:step.bg,color:step.accent,border:`1px solid ${step.border}`,padding:"2px 8px",borderRadius:99 }}>{c}</span>
                ))}
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                <div style={{ width:16,height:1.5,background:step.accent,borderRadius:99 }}/>
                <span style={{ fontSize:".65rem",color:C.muted,fontWeight:600 }}>Survolez pour les détails →</span>
              </div>
            </div>
          </div>

          {/* ── VERSO ─────────────────────────────────────────────────── */}
          <div className="flip-face flip-face-back" style={{ background:`linear-gradient(145deg,${step.accent} 0%,${step.accent}dd 100%)`,padding:"1.4rem",display:"flex",flexDirection:"column",justifyContent:"space-between" }}>
            <div style={{ position:"absolute",top:-40,right:-40,width:110,height:110,borderRadius:"50%",background:"rgba(255,255,255,.07)" }}/>
            <div style={{ position:"absolute",bottom:-28,left:-18,width:88,height:88,borderRadius:"50%",background:"rgba(255,255,255,.05)" }}/>
            <div style={{ position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,.055) 1px,transparent 1px)",backgroundSize:"22px 22px" }}/>
            <div style={{ position:"relative" }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:11 }}>
                <div style={{ width:34,height:34,borderRadius:9,background:"rgba(255,255,255,.17)",border:"1.5px solid rgba(255,255,255,.26)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <Icon size={16} color="white"/>
                </div>
                <span style={{ fontSize:9.5,fontWeight:800,color:"rgba(255,255,255,.62)",textTransform:"uppercase",letterSpacing:".1em" }}>
                  {step.year} · {step.label}
                </span>
              </div>
              <p style={{ fontSize:".79rem",color:"rgba(255,255,255,.92)",lineHeight:1.78,margin:0 }}>{step.detail}</p>
            </div>
            <div style={{ position:"relative",marginTop:14 }}>
              <div style={{ display:"inline-flex",alignItems:"center",gap:13,background:"rgba(255,255,255,.14)",border:"1.5px solid rgba(255,255,255,.2)",borderRadius:12,padding:"9px 14px" }}>
                <div>
                  <div style={{ fontSize:"1.2rem",color:"white",lineHeight:1 }}>{step.stat.value}</div>
                  <div style={{ fontSize:".6rem",color:"rgba(255,255,255,.58)",marginTop:2,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em" }}>{step.stat.label}</div>
                </div>
                <div style={{ width:52,height:3,background:"rgba(255,255,255,.2)",borderRadius:99,overflow:"hidden" }}>
                  <div style={{ width:"72%",height:"100%",background:"rgba(255,255,255,.68)",borderRadius:99 }}/>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── TimelineEV ───────────────────────────────────────────────────────────────
export function TimelineEV() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView     = useInView(sectionRef, { once: true, margin: "-8%" });

  return (
    <section style={{ padding:"80px 24px",background:`linear-gradient(180deg,${C.foam} 0%,white 60%,${C.foam} 100%)`,position:"relative",overflow:"hidden" }}>
      <style>{KEYFRAMES}</style>

      {/* Background textures */}
      <div style={{ position:"absolute",inset:0,opacity:.025,backgroundImage:`url("data:image/svg+xml,%3Csvg width='52' height='52' viewBox='0 0 52 52' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='26' cy='26' r='2' fill='%2310693B'/%3E%3C/svg%3E")`,backgroundSize:"52px 52px",pointerEvents:"none" }}/>
      <div style={{ position:"absolute",top:"8%",left:"-80px",width:300,height:300,borderRadius:"50%",background:`radial-gradient(circle,${C.sage}15 0%,transparent 70%)`,pointerEvents:"none" }}/>
      <div style={{ position:"absolute",bottom:"12%",right:"-60px",width:240,height:240,borderRadius:"50%",background:`radial-gradient(circle,${C.leaf}12 0%,transparent 70%)`,pointerEvents:"none" }}/>

      <div ref={sectionRef} style={{ maxWidth:980,margin:"0 auto",position:"relative" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity:0,y:24 }}
          animate={inView ? {opacity:1,y:0} : {}}
          transition={{ duration:.65 }}
          style={{ textAlign:"center",marginBottom:"5rem" }}
        >
          <span style={{ display:"inline-flex",alignItems:"center",gap:8,background:C.forest,color:"white",padding:"5px 17px",borderRadius:99,fontSize:10.5,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:18,boxShadow:`0 4px 16px ${C.forest}33` }}>
            <Icons.Seed size={12} color="white"/> Notre Histoire depuis 1995
          </span>
          <h2 style={{ fontSize:"clamp(1.9rem,4.5vw,2.8rem)",fontWeight:900,color:C.text,letterSpacing:"-.025em",lineHeight:1.1,marginBottom:13 }}>
            30 ans de croissance <span style={{ color:C.forest }}>&amp; d&apos;innovation</span>
          </h2>
          <p style={{ color:C.soft,fontSize:".97rem",maxWidth:500,margin:"0 auto",lineHeight:1.78 }}>
            De la commercialisation de semences à un groupe de 4 sociétés, 100 collaborateurs et 5 agences nationales.
          </p>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:9,marginTop:24 }}>
            <div style={{ width:40,height:1.5,background:C.mint,borderRadius:99 }}/>
            <div style={{ width:7,height:7,borderRadius:"50%",background:C.forest }}/>
            <div style={{ width:40,height:1.5,background:C.mint,borderRadius:99 }}/>
          </div>
        </motion.div>

        {/* Timeline body */}
        <div style={{ position:"relative",overflow:"visible" }}>
          <AnimatedStem inView={inView}/>
          <div style={{ display:"flex",flexDirection:"column",rowGap:48,position:"relative",zIndex:1,overflow:"visible" }}>
            {STEPS.map((step, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div key={i} className="tl-row" style={{ overflow:"visible" }}>
                  <div className={`tl-col-left${!isLeft ? " tl-col-empty" : ""}`}>
                    {isLeft && <FlipCard step={step} idx={i} isLeft index={i} visible={inView}/>}
                  </div>
                  <div className="tl-col-center" style={{ zIndex:4 }}>
                    <Node step={step} idx={i} delay={i*0.13} visible={inView}/>
                  </div>
                  <div className={`tl-col-right${isLeft ? " tl-col-empty" : ""}`}>
                    {!isLeft && <FlipCard step={step} idx={i} isLeft={false} index={i} visible={inView}/>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer hint */}
        <motion.div
          initial={{ opacity:0 }}
          animate={inView ? {opacity:1} : {}}
          transition={{ delay:1.2,duration:.6 }}
          style={{ textAlign:"center",marginTop:"3.5rem" }}
        >
          <span style={{ display:"inline-flex",alignItems:"center",gap:8,background:"white",border:`1.5px solid ${C.mint}`,color:C.muted,padding:"7px 19px",borderRadius:99,fontSize:".7rem",fontWeight:700,boxShadow:"0 2px 12px rgba(16,105,59,.07)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m7 15 5 5 5-5M7 9l5-5 5 5"/>
            </svg>
            Survolez chaque carte pour découvrir les détails complets
          </span>
        </motion.div>

      </div>
    </section>
  );
}