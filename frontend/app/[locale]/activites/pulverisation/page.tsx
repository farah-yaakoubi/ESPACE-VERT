"use client";
import { motion } from "framer-motion";
import { ShieldCheckIcon, BeakerIcon, CheckCircleIcon, ArrowRightIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

const FADE = (delay=0) => ({ initial:{opacity:0,y:24}, whileInView:{opacity:1,y:0}, viewport:{once:true}, transition:{duration:0.55,ease:[0.22,1,0.36,1],delay} });

// Pulvert colors: vert foncé + jaune
const PV = { dark:"#1D6B2A", mid:"#27932F", light:"#3CB648", yellow:"#F2C200", orange:"#E8A800", bg:"#FAFEF0" };

export default function PulverisationPage() {
  const t = useTranslations("activities.pulverisation");
  const locale = useLocale();

  const equipment = [
    { icon:"🎒", name:"Pulvérisateurs à dos",     desc:"Pour petites surfaces et jardins",          cap:"15–20L", color:PV.mid, features:["Ergonomique","Réglable","Facile d'entretien"] },
    { icon:"🚜", name:"Pulvérisateurs tractés",   desc:"Pour grandes cultures et vergers",          cap:"400–1000L", color:PV.dark, features:["Haute capacité","Distribution uniforme","GPS intégré"] },
    { icon:"🌪️", name:"Atomiseurs",               desc:"Pour arboriculture et vignobles",           cap:"200–600L", color:PV.orange, features:["Pulvérisation fine","Économie de produit","Efficacité optimale"] },
  ];

  const safetyTips = [
    "Porter un équipement de protection complet (combinaison, masque, gants)",
    "Respecter les doses recommandées par le fabricant",
    "Éviter de pulvériser par temps venteux (> 15 km/h)",
    "Maintenir une distance de sécurité avec les habitations",
    "Nettoyer l'équipement après chaque utilisation",
    "Stocker les produits dans un local sécurisé et ventilé",
  ];

  const services = [
    { icon: BeakerIcon,       title:"Conseil technique",  desc:"Accompagnement dans le choix des produits phytosanitaires adaptés à vos cultures." },
    { icon: ShieldCheckIcon,  title:"Formation sécurité", desc:"Formation aux bonnes pratiques de pulvérisation et sécurité opérateur." },
    { icon: CheckCircleIcon,  title:"Maintenance",        desc:"Entretien et réparation de vos équipements par nos techniciens certifiés." },
  ];

  return (
    <div style={{background:"#fafaf8",minHeight:"100vh"}}>

      {/* ── HERO — vert Pulvert ── */}
      <section style={{background:`linear-gradient(135deg,${PV.dark} 0%,${PV.mid} 55%,${PV.light} 100%)`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.07) 1px,transparent 1px)",backgroundSize:"28px 28px"}}/>
        {/* Accent jaune en coin */}
        <div style={{position:"absolute",top:-60,right:-60,width:300,height:300,borderRadius:"50%",background:`radial-gradient(circle,${PV.yellow}44 0%,transparent 70%)`}}/>
        <div style={{position:"absolute",bottom:-1,left:0,right:0}}>
          <svg viewBox="0 0 1440 60" style={{width:"100%",height:60,display:"block"}} preserveAspectRatio="none">
            <path d="M0,60L1440,60L1440,20C1200,52,960,0,720,28C480,56,240,4,0,36Z" fill="#fafaf8"/>
          </svg>
        </div>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"6rem 2rem 7rem"}}>
          <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.6,ease:[0.22,1,0.36,1]}} style={{maxWidth:680}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.25)",color:"white",padding:"6px 16px",borderRadius:99,fontSize:13,fontWeight:600,marginBottom:24}}>
              🌿 {t("tag")}
            </span>
            <h1 style={{fontSize:"clamp(2.2rem,5vw,3.5rem)",fontWeight:900,color:"white",lineHeight:1.1,letterSpacing:"-0.025em",marginBottom:20}}>{t("pageTitle")}</h1>
            <p style={{fontSize:"1.1rem",color:"rgba(255,255,255,0.75)",lineHeight:1.7,marginBottom:36,maxWidth:560}}>{t("pageSubtitle")}</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
              <Link href={`/${locale}/marques/pulvert`} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"13px 28px",background:"white",color:PV.dark,fontWeight:700,borderRadius:99,textDecoration:"none",boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}>
                Voir Pulvert <ArrowRightIcon style={{width:16,height:16}}/>
              </Link>
              <Link href={`/${locale}/rendez-vous`} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"13px 28px",background:"rgba(255,255,255,0.12)",color:"white",fontWeight:600,borderRadius:99,textDecoration:"none",border:"1.5px solid rgba(255,255,255,0.4)"}}>
                {t("ctaAppointment")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ÉQUIPEMENTS ── */}
      <section style={{padding:"5rem 2rem",background:"white"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <motion.div {...FADE()} style={{textAlign:"center",marginBottom:"3.5rem"}}>
            <h2 style={{fontSize:"clamp(1.6rem,3.5vw,2.4rem)",fontWeight:800,color:"#1a3833",marginBottom:12}}>{t("equipmentTitle")}</h2>
          </motion.div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:24}}>
            {equipment.map((eq,i)=>(
              <motion.div key={i} {...FADE(i*0.12)} style={{borderRadius:20,overflow:"hidden",border:"1.5px solid #e8e6e1",transition:"box-shadow .2s,transform .2s"}} onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 32px rgba(0,0,0,0.12)";e.currentTarget.style.transform="translateY(-4px)"}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="";e.currentTarget.style.transform=""}}>
                <div style={{background:eq.color,padding:"1.5rem",display:"flex",alignItems:"center",gap:16}}>
                  <span style={{fontSize:"2.2rem"}}>{eq.icon}</span>
                  <div>
                    <h3 style={{fontWeight:800,color:"white",fontSize:"1.05rem"}}>{eq.name}</h3>
                    <p style={{color:"rgba(255,255,255,0.75)",fontSize:"0.83rem"}}>{eq.cap}</p>
                  </div>
                </div>
                <div style={{padding:"1.5rem",background:"white"}}>
                  <p style={{color:"#716e67",fontSize:"0.9rem",lineHeight:1.6,marginBottom:14}}>{eq.desc}</p>
                  {eq.features.map((f,j)=>(
                    <div key={j} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:eq.color,flexShrink:0}}/>
                      <span style={{fontSize:"0.85rem",color:"#524f49"}}>{f}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SÉCURITÉ — fond jaune doux ── */}
      <section style={{padding:"5rem 2rem",background:"#fffbeb"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <motion.div {...FADE()} style={{display:"flex",alignItems:"center",gap:12,marginBottom:"2.5rem"}}>
            <ExclamationTriangleIcon style={{width:28,height:28,color:PV.yellow,flexShrink:0}}/>
            <h2 style={{fontSize:"clamp(1.5rem,3vw,2rem)",fontWeight:800,color:"#78350f"}}>{t("safetyTitle")}</h2>
          </motion.div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
            {safetyTips.map((tip,i)=>(
              <motion.div key={i} {...FADE(i*0.06)} style={{display:"flex",alignItems:"flex-start",gap:12,background:"white",borderRadius:14,padding:"1rem 1.25rem",border:"1.5px solid #fde68a"}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:PV.yellow,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:12,fontWeight:800,color:"white"}}>{i+1}</div>
                <p style={{fontSize:"0.88rem",color:"#92400e",lineHeight:1.6}}>{tip}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section style={{padding:"5rem 2rem",background:"white"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <motion.div {...FADE()} style={{textAlign:"center",marginBottom:"3.5rem"}}>
            <h2 style={{fontSize:"clamp(1.6rem,3.5vw,2.4rem)",fontWeight:800,color:"#1a3833",marginBottom:12}}>{t("servicesTitle")}</h2>
          </motion.div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20}}>
            {services.map((s,i)=>(
              <motion.div key={i} {...FADE(i*0.12)} style={{background:"#f0fdfa",borderRadius:18,padding:"2rem",border:`1.5px solid ${PV.light}44`,transition:"box-shadow .2s,transform .2s"}} onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 8px 24px ${PV.mid}22`;e.currentTarget.style.transform="translateY(-4px)"}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="";e.currentTarget.style.transform=""}}>
                <div style={{width:48,height:48,background:PV.mid,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16}}>
                  <s.icon style={{width:22,height:22,color:"white"}}/>
                </div>
                <h3 style={{fontWeight:700,color:"#134e4a",marginBottom:8}}>{s.title}</h3>
                <p style={{color:"#4a7b78",fontSize:"0.9rem",lineHeight:1.65}}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{padding:"5rem 2rem",background:`linear-gradient(135deg,${PV.dark} 0%,${PV.mid} 100%)`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:200,height:200,borderRadius:"50%",background:`radial-gradient(circle,${PV.yellow}33 0%,transparent 70%)`}}/>
        <motion.div {...FADE()} style={{maxWidth:580,margin:"0 auto",textAlign:"center",position:"relative"}}>
          <h2 style={{fontSize:"clamp(1.6rem,3.5vw,2.2rem)",fontWeight:800,color:"white",marginBottom:12}}>{t("ctaTitle")}</h2>
          <p style={{color:"rgba(255,255,255,0.72)",marginBottom:36}}>{t("ctaSubtitle")}</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:12,justifyContent:"center"}}>
            <a href="tel:+21671333858" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"13px 28px",background:"white",color:PV.dark,fontWeight:700,borderRadius:99,textDecoration:"none"}}>📞 (+216) 71 333 858</a>
            <Link href={`/${locale}/contact`} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"13px 28px",background:"rgba(255,255,255,0.12)",color:"white",fontWeight:600,borderRadius:99,textDecoration:"none",border:"1.5px solid rgba(255,255,255,0.4)"}}>
              {t("ctaContact")}
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
