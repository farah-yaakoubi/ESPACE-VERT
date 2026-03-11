"use client";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const FADE = (delay=0) => ({ initial:{opacity:0,y:24}, whileInView:{opacity:1,y:0}, viewport:{once:true}, transition:{duration:0.55,ease:[0.22,1,0.36,1],delay} });

export default function AboutPage() {
  const t = useTranslations("about");

  const values = [
    { icon:"", title:t("quality"),      text:t("qualityText"),      accent:"#d97706", bg:"#fffbeb", border:"#fde68a" },
    { icon:"", title:t("innovation"),   text:t("innovationText"),   accent:"#2563eb", bg:"#eff6ff", border:"#bfdbfe" },
    { icon:"", title:t("service"),      text:t("serviceText"),      accent:"#16a34a", bg:"#f0fdf4", border:"#bbf7d0" },
    { icon:"", title:t("sustainability"),text:t("sustainabilityText"),accent:"#0d9488",bg:"#f0fdfa", border:"#99f6e4" },
  ];

  return (
    <div style={{background:"white",minHeight:"100vh"}}>

      {/* ── HERO ── */}
      <section style={{background:"linear-gradient(135deg,#0f2d12 0%,#1f5226 55%,#2d8c35 100%)",position:"relative",overflow:"hidden",padding:"7rem 2rem 8rem"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.06) 1px,transparent 1px)",backgroundSize:"26px 26px"}}/>
        {/* Accent lumière */}
        <div style={{position:"absolute",top:-100,right:-100,width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(60,182,72,0.25) 0%,transparent 70%)"}}/>
        <div style={{position:"absolute",bottom:-1,left:0,right:0}}>
          <svg viewBox="0 0 1440 60" style={{width:"100%",height:60,display:"block"}} preserveAspectRatio="none">
            <path d="M0,60L1440,60L1440,20C1200,52,960,0,720,28C480,56,240,4,0,36Z" fill="white"/>
          </svg>
        </div>
        <div style={{maxWidth:900,margin:"0 auto",textAlign:"center",position:"relative"}}>
          <motion.div initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} transition={{duration:0.7,ease:[0.22,1,0.36,1]}}>
            <span style={{display:"inline-block",background:"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.3)",color:"rgba(255,255,255,0.9)",padding:"6px 18px",borderRadius:99,fontSize:13,fontWeight:600,letterSpacing:"0.05em",marginBottom:24}}>
               ESPACE VERT
            </span>
            <h1 style={{fontSize:"clamp(2.5rem,6vw,4rem)",fontWeight:900,color:"white",lineHeight:1.05,letterSpacing:"-0.03em",marginBottom:20}}>
              {t("title")}
            </h1>
            <p style={{fontSize:"1.15rem",color:"rgba(255,255,255,0.75)",maxWidth:600,margin:"0 auto",lineHeight:1.7}}>
              {t("subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── HISTOIRE & EVOLUTION ── */}
      <section style={{padding:"5rem 2rem",background:"white"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:24}}>
          <motion.div {...FADE(0)} style={{borderRadius:20,overflow:"hidden",border:"1.5px solid #e8e6e1",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <div style={{height:6,background:"linear-gradient(90deg,#1f5226,#3cb648)"}}/>
            <div style={{padding:"2rem"}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
                <div style={{width:52,height:52,background:"linear-gradient(135deg,#1f5226,#3cb648)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:"1.6rem"}}></div>
                <h2 style={{fontSize:"1.35rem",fontWeight:800,color:"#2d6e45"}}>{t("history")}</h2>
              </div>
              <p style={{color:"#524f49",lineHeight:1.75,fontSize:"0.97rem"}}>{t("historyText")}</p>
            </div>
          </motion.div>

          <motion.div {...FADE(0.1)} style={{borderRadius:20,overflow:"hidden",border:"1.5px solid #e8e6e1",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <div style={{height:6,background:"linear-gradient(90deg,#d97706,#eab308)"}}/>
            <div style={{padding:"2rem"}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
                <div style={{width:52,height:52,background:"linear-gradient(135deg,#d97706,#eab308)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:"1.6rem"}}></div>
                <h2 style={{fontSize:"1.35rem",fontWeight:800,color:"#92400e"}}>{t("evolution")}</h2>
              </div>
              <p style={{color:"#524f49",lineHeight:1.75,fontSize:"0.97rem"}}>{t("evolutionText")}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section style={{padding:"4rem 2rem",background:"#f4f3f0"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <motion.div {...FADE()} style={{background:"linear-gradient(135deg,#2d6e45 0%,#2d8c35 100%)",borderRadius:24,padding:"3rem",color:"white",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)",backgroundSize:"24px 24px"}}/>
            <div style={{position:"absolute",right:-40,top:-40,width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,rgba(60,182,72,0.2) 0%,transparent 70%)"}}/>
            <div style={{position:"relative",display:"flex",alignItems:"flex-start",gap:20}}>
              <div style={{fontSize:"2.5rem",flexShrink:0}}></div>
              <div>
                <h2 style={{fontSize:"1.6rem",fontWeight:800,marginBottom:14,lineHeight:1.2}}>{t("mission")}</h2>
                <p style={{fontSize:"1.05rem",color:"rgba(255,255,255,0.85)",lineHeight:1.75}}>{t("missionText")}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── VALEURS ── */}
      <section style={{padding:"5rem 2rem",background:"white"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <motion.div {...FADE()} style={{textAlign:"center",marginBottom:"3.5rem"}}>
            <h2 style={{fontSize:"clamp(1.6rem,3.5vw,2.4rem)",fontWeight:800,color:"#2d6e45",marginBottom:8}}>{t("values")}</h2>
            <div style={{width:60,height:4,background:"linear-gradient(90deg,#1f5226,#3cb648)",borderRadius:2,margin:"0 auto"}}/>
          </motion.div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:20}}>
            {values.map((v,i)=>(
              <motion.div key={i} {...FADE(i*0.1)} style={{background:v.bg,borderRadius:18,padding:"1.75rem",border:`1.5px solid ${v.border}`,transition:"transform .2s,box-shadow .2s"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-5px)";e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,0.10)"}} onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=""}}>
                <div style={{fontSize:"2.2rem",marginBottom:14}}>{v.icon}</div>
                <h3 style={{fontWeight:800,color:v.accent,marginBottom:8,fontSize:"1.05rem"}}>{v.title}</h3>
                <p style={{color:"#524f49",fontSize:"0.88rem",lineHeight:1.65}}>{v.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
