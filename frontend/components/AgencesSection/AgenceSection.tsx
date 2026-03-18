"use client";
/**
 * components/AgencesSection/AgenceSection.tsx
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MapPin, Phone, Mail, X } from "lucide-react";

const C = {
  forest: "#10693B",
  leaf  : "#4CAF50",
  foam  : "#F1FDF4",
  mist  : "#E8F5E9",
  mint  : "#C8E6C9",
  text  : "#1B3A2F",
  soft  : "#5A8A6A",
  mid   : "#2E7D52",
  white : "#FFFFFF",
};

const AG_STYLE = `
@keyframes agPulse {
  0%,100% { opacity:.45; transform:scale(1); }
  50%     { opacity:.1;  transform:scale(1.65); }
}
.ag-pulse { animation: agPulse 1.6s ease-in-out infinite; }
`;

type Agence = {
  id    : string;
  name  : string;
  region: string;
  color : string;
  pinX  : number;
  pinY  : number;
  tel   : string;
  tel2? : string;
  email?: string;
  image : string | null;
};

const AGENCES: Agence[] = [
  { id:"borj",    name:"Borj El Amri", region:"Grand Tunis — Nord-Ouest", color:"#7C3AED", pinX:44, pinY:12, tel:"(+216) 71 234 567",                                                                    image:null },
  { id:"tunis",   name:"Tunis Centre", region:"Capitale — Grand Tunis",   color:"#10693B", pinX:50, pinY:14, tel:"(+216) 71 333 858", tel2:"(+216) 71 348 404", email:"secretariat.groupeev@planet.tn", image:null },
  { id:"soliman", name:"Soliman",      region:"Cap Bon — Nord-Est",       color:"#0277BD", pinX:62, pinY:17, tel:"(+216) 72 333 143",                                                                    image:null },
  { id:"sfax",    name:"Sfax",         region:"Sud — 2ème ville",         color:"#F59E0B", pinX:60, pinY:38, tel:"(+216) 74 000 000",                                                                    image:null },
];

function AgencePopup({ agence, onClose }: { agence: Agence; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity:0, scale:.92, y:8 }}
      animate={{ opacity:1, scale:1,   y:0 }}
      exit  ={{ opacity:0, scale:.92, y:8 }}
      transition={{ duration:.22 }}
      style={{
        position :"absolute",
        left     :`${agence.pinX}%`,
        top      :`${agence.pinY}%`,
        transform:"translate(-50%,calc(-100% - 22px))",
        zIndex   :20, background:C.white, borderRadius:14,
        boxShadow:"0 8px 40px rgba(0,0,0,.17)",
        border   :`2px solid ${agence.color}2a`, width:234, overflow:"hidden",
      }}
    >
      {/* Image zone */}
      <div style={{ width:"100%",height:108,position:"relative",background:`${agence.color}0d` }}>
        {agence.image ? (
          <Image src={agence.image} alt={agence.name} fill style={{ objectFit:"cover" }}/>
        ) : (
          <div style={{ width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5 }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={agence.color} strokeWidth="1.2" opacity=".3">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            <span style={{ fontSize:9.5,color:agence.color,opacity:.45 }}>Photo à importer</span>
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={{ position:"absolute",top:8,right:8,width:24,height:24,borderRadius:"50%",background:"rgba(255,255,255,.92)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 4px rgba(0,0,0,.14)" }}
        >
          <X size={12} color="#555"/>
        </button>
      </div>

      {/* Content */}
      <div style={{ padding:"11px 14px 14px" }}>
        <div style={{ fontSize:".6rem",fontWeight:800,color:agence.color,textTransform:"uppercase",letterSpacing:".1em",marginBottom:3 }}>{agence.region}</div>
        <div style={{ fontSize:".95rem",color:C.text,marginBottom:9 }}>Agence {agence.name}</div>
        <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
          <div style={{ display:"flex",alignItems:"center",gap:7,fontSize:".74rem",color:C.soft }}>
            <Phone size={11} style={{ color:agence.color,flexShrink:0 }}/>{agence.tel}
          </div>
          {agence.tel2 && (
            <div style={{ display:"flex",alignItems:"center",gap:7,fontSize:".74rem",color:C.soft }}>
              <Phone size={11} style={{ color:agence.color,flexShrink:0 }}/>{agence.tel2}
            </div>
          )}
          {agence.email && (
            <div style={{ display:"flex",alignItems:"center",gap:7,fontSize:".74rem",color:C.soft }}>
              <Mail size={11} style={{ color:agence.color,flexShrink:0 }}/>
              <span style={{ wordBreak:"break-all" }}>{agence.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div style={{ position:"absolute",bottom:-9,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"9px solid transparent",borderRight:"9px solid transparent",borderTop:`9px solid ${C.white}`,filter:"drop-shadow(0 2px 2px rgba(0,0,0,.08))" }}/>
    </motion.div>
  );
}

export default function AgenceSection() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeAgence = AGENCES.find(a => a.id === activeId) ?? null;
  const handlePin = (id: string) => setActiveId(prev => prev === id ? null : id);

  return (
    <section style={{ padding:"72px 24px",background:C.foam,borderTop:`1.5px solid ${C.mist}` }}>
      <style>{AG_STYLE}</style>
      <div style={{ maxWidth:1080,margin:"0 auto" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity:0,y:28 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ duration:.6 }}
          style={{ textAlign:"center",marginBottom:"2.5rem" }}
        >
          <span style={{ display:"inline-flex",alignItems:"center",gap:7,background:C.forest,color:C.white,padding:"5px 16px",borderRadius:99,fontSize:10.5,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:14 }}>
            <MapPin size={11} strokeWidth={2.5}/> Présence Nationale
          </span>
          <h2 style={{ fontSize:"clamp(1.4rem,3.5vw,2.2rem)",fontWeight:900,color:C.text }}>
            4 Agences sur tout le <span style={{ color:C.forest }}>territoire tunisien</span>
          </h2>
          <p style={{ color:C.soft,marginTop:8,fontSize:".88rem" }}>Cliquez sur un pin pour découvrir l&apos;agence</p>
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ duration:.6,delay:.1 }}
          style={{ position:"relative",maxWidth:440,margin:"0 auto" }}
        >
          <Image
            src="/images/maptunisie.png"
            alt="Carte Tunisie — Espace Vert"
            width={1092} height={2058}
            style={{ width:"100%",height:"auto",display:"block",borderRadius:16,border:`1px solid rgba(15,96,53,.12)` }}
            priority
          />

          {activeId && (
            <div onClick={() => setActiveId(null)} style={{ position:"absolute",inset:0,zIndex:5,cursor:"pointer" }}/>
          )}

          {AGENCES.map(ag => {
            const isActive = activeId === ag.id;
            return (
              <button
                key={ag.id}
                onClick={(e) => { e.stopPropagation(); handlePin(ag.id); }}
                style={{ position:"absolute",left:`${ag.pinX}%`,top:`${ag.pinY}%`,transform:"translate(-50%,-50%)",background:"none",border:"none",padding:0,cursor:"pointer",zIndex:10 }}
              >
                {isActive && (
                  <span className="ag-pulse" style={{ position:"absolute",inset:-10,borderRadius:"50%",background:`${ag.color}22`,display:"block" }}/>
                )}
                <span style={{
                  display       :"flex",alignItems:"center",justifyContent:"center",
                  width         :isActive?30:22, height:isActive?30:22,
                  borderRadius  :"50%",
                  background    :isActive?ag.color:C.white,
                  border        :`2.5px solid ${ag.color}`,
                  boxShadow     :isActive?`0 4px 16px ${ag.color}55`:`0 2px 8px ${ag.color}38`,
                  transition    :"all .2s", position:"relative",
                }}>
                  <span style={{ width:isActive?12:9,height:isActive?12:9,borderRadius:"50%",background:isActive?C.white:ag.color,display:"block",transition:"all .2s" }}/>
                </span>
              </button>
            );
          })}

          <AnimatePresence>
            {activeAgence && (
              <AgencePopup key={activeAgence.id} agence={activeAgence} onClose={() => setActiveId(null)}/>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Legend buttons */}
        <motion.div
          initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ duration:.5,delay:.2 }}
          style={{ display:"flex",flexWrap:"wrap",gap:10,justifyContent:"center",marginTop:"2rem" }}
        >
          {AGENCES.map(ag => (
            <motion.button
              key={ag.id}
              onClick={() => handlePin(ag.id)}
              whileHover={{ y:-2 }}
              style={{
                display    :"flex",alignItems:"center",gap:8,padding:"9px 17px",borderRadius:11,
                border     :`1.5px solid ${activeId===ag.id?ag.color:C.mint}`,
                background :activeId===ag.id?`${ag.color}0e`:C.white,
                color      :activeId===ag.id?ag.color:C.soft,
                fontWeight :600,fontSize:".8rem",
                cursor     :"pointer",transition:"all .2s",
                boxShadow  :activeId===ag.id?`0 4px 14px ${ag.color}22`:"none",
              }}
            >
              <div style={{ width:9,height:9,borderRadius:"50%",background:ag.color,flexShrink:0 }}/>
              {ag.name}
            </motion.button>
          ))}
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ duration:.5,delay:.25 }}
          style={{ display:"flex",justifyContent:"center",marginTop:"1.5rem" }}
        >
          <div style={{ background:`linear-gradient(135deg,${C.forest} 0%,${C.leaf} 100%)`,borderRadius:13,padding:".9rem 2.4rem",textAlign:"center" }}>
            <div style={{ fontSize:"1rem",color:C.white }}>4 Points de Vente Espace Vert</div>
            <div style={{ fontSize:".7rem",color:"rgba(255,255,255,.7)",marginTop:3 }}>innovation · qualité · rentabilité</div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}