"use client";
import { motion } from "framer-motion";
import { WrenchScrewdriverIcon, CogIcon, CheckCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

const FADE = (delay=0) => ({ initial:{opacity:0,y:24}, whileInView:{opacity:1,y:0}, viewport:{once:true}, transition:{duration:0.55,ease:[0.22,1,0.36,1],delay} });

// Viking / Machinisme: rouge + gris acier + blanc
const MC = { red:"#c0392b", darkRed:"#922b21", gray:"#4a4a4a", steel:"#64748b", lightGray:"#f1f5f9", bg:"#f8f8f7" };

export default function MachinismePage() {
  const t = useTranslations("activities.machinisme");
  const locale = useLocale();

  const categories = [
    { icon:"🚜", name:"Tondeuses à Gazon", desc:"Tondeuses thermiques, électriques et robots pour tous terrains", products:[
      {name:"Autoportée", model:"Viking MT 6127 ZL", power:"27 HP", width:"122 cm"},
      {name:"Thermique",  model:"Viking MB 650 T",   power:"2.9 kW", width:"48 cm"},
      {name:"Électrique", model:"Viking ME 339",      power:"1400 W", width:"37 cm"},
      {name:"Robot",      model:"Viking iMow",        power:"Auto",   width:"20 cm"},
    ]},
    { icon:"✂️", name:"Taille-Haies & Tronçonneuses", desc:"Outillage de précision pour l'entretien de vos espaces verts", products:[
      {name:"Taille-haie thermique", model:"Viking HT 5050", power:"0.9 kW", width:"50 cm"},
      {name:"Taille-haie électrique",model:"Viking HE 610",  power:"600 W",  width:"60 cm"},
      {name:"Tronçonneuse",         model:"Viking MT 6000",  power:"2.0 kW", width:"37 cm"},
    ]},
    { icon:"💨", name:"Souffleurs & Aspirateurs", desc:"Collecte et évacuation rapide des feuilles mortes et déchets", products:[
      {name:"Souffleur thermique",  model:"Viking LB 700",  power:"0.9 kW", width:"—"},
      {name:"Souffleur électrique", model:"Viking EB 235 E",power:"2300 W", width:"—"},
    ]},
  ];

  const services = [
    { icon: WrenchScrewdriverIcon, title:"Service Après-Vente",   desc:"Réparation et entretien par nos techniciens certifiés Viking." },
    { icon: CogIcon,               title:"Pièces Détachées",       desc:"Large stock de pièces d'origine pour toutes les marques." },
    { icon: CheckCircleIcon,       title:"Garantie Constructeur",  desc:"Tous nos équipements neufs sont garantis par le fabricant." },
  ];

  return (
    <div style={{background:MC.bg,minHeight:"100vh"}}>

      {/* ── HERO — rouge + gris acier ── */}
      <section style={{background:`linear-gradient(135deg,${MC.darkRed} 0%,${MC.red} 50%,#e74c3c 100%)`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.07) 1px,transparent 1px)",backgroundSize:"28px 28px"}}/>
        {/* Accent gris acier */}
        <div style={{position:"absolute",top:-80,right:-80,width:320,height:320,borderRadius:"50%",background:"radial-gradient(circle,rgba(100,116,139,0.3) 0%,transparent 70%)"}}/>
        <div style={{position:"absolute",bottom:-1,left:0,right:0}}>
          <svg viewBox="0 0 1440 60" style={{width:"100%",height:60,display:"block"}} preserveAspectRatio="none">
            <path d="M0,60L1440,60L1440,20C1200,52,960,0,720,28C480,56,240,4,0,36Z" fill={MC.bg}/>
          </svg>
        </div>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"6rem 2rem 7rem"}}>
          <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.6,ease:[0.22,1,0.36,1]}} style={{maxWidth:680}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.25)",color:"white",padding:"6px 16px",borderRadius:99,fontSize:13,fontWeight:600,marginBottom:24}}>
              🔧 {t("tag")}
            </span>
            <h1 style={{fontSize:"clamp(2.2rem,5vw,3.5rem)",fontWeight:900,color:"white",lineHeight:1.1,letterSpacing:"-0.025em",marginBottom:20}}>{t("pageTitle")}</h1>
            <p style={{fontSize:"1.1rem",color:"rgba(255,255,255,0.78)",lineHeight:1.7,marginBottom:36,maxWidth:560}}>{t("pageSubtitle")}</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
              <Link href={`/${locale}/contact`} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"13px 28px",background:"white",color:MC.darkRed,fontWeight:700,borderRadius:99,textDecoration:"none",boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}>
                {t("ctaContact")} <ArrowRightIcon style={{width:16,height:16}}/>
              </Link>
              <Link href={`/${locale}/rendez-vous`} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"13px 28px",background:"rgba(255,255,255,0.12)",color:"white",fontWeight:600,borderRadius:99,textDecoration:"none",border:"1.5px solid rgba(255,255,255,0.4)"}}>
                {t("ctaAppointment")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CATÉGORIES ── */}
      <section style={{padding:"5rem 2rem",background:"white"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <motion.div {...FADE()} style={{textAlign:"center",marginBottom:"3.5rem"}}>
            <h2 style={{fontSize:"clamp(1.6rem,3.5vw,2.4rem)",fontWeight:800,color:"#1a1a1a",marginBottom:12}}>{t("categoriesTitle")}</h2>
          </motion.div>
          <div style={{display:"flex",flexDirection:"column",gap:32}}>
            {categories.map((cat,i)=>(
              <motion.div key={i} {...FADE(i*0.1)} style={{borderRadius:20,overflow:"hidden",border:"1.5px solid #e8e6e1"}}>
                {/* En-tête catégorie */}
                <div style={{background:`linear-gradient(90deg,${MC.gray} 0%,${MC.steel} 100%)`,padding:"1.25rem 1.75rem",display:"flex",alignItems:"center",gap:14}}>
                  <span style={{fontSize:"1.8rem"}}>{cat.icon}</span>
                  <div>
                    <h3 style={{fontWeight:800,color:"white",fontSize:"1.1rem"}}>{cat.name}</h3>
                    <p style={{color:"rgba(255,255,255,0.7)",fontSize:"0.83rem"}}>{cat.desc}</p>
                  </div>
                </div>
                {/* Grille produits */}
                <div style={{background:"white",padding:"1.5rem",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
                  {cat.products.map((p,j)=>(
                    <div key={j} style={{background:MC.lightGray,borderRadius:12,padding:"1rem",border:`2px solid ${MC.red}15`}}>
                      <div style={{fontWeight:700,color:"#1a1a1a",fontSize:"0.9rem",marginBottom:4}}>{p.name}</div>
                      <div style={{fontSize:"0.78rem",color:MC.steel,fontFamily:"monospace",marginBottom:8}}>{p.model}</div>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        <span style={{background:`${MC.red}18`,color:MC.red,padding:"2px 8px",borderRadius:99,fontSize:"0.75rem",fontWeight:700}}>{p.power}</span>
                        {p.width!=="—" && <span style={{background:"#f1f5f9",color:MC.steel,padding:"2px 8px",borderRadius:99,fontSize:"0.75rem",fontWeight:600}}>{p.width}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section style={{padding:"5rem 2rem",background:MC.bg}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <motion.div {...FADE()} style={{textAlign:"center",marginBottom:"3.5rem"}}>
            <h2 style={{fontSize:"clamp(1.6rem,3.5vw,2.4rem)",fontWeight:800,color:"#1a1a1a",marginBottom:12}}>{t("servicesTitle")}</h2>
          </motion.div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20}}>
            {services.map((s,i)=>(
              <motion.div key={i} {...FADE(i*0.12)} style={{background:"white",borderRadius:18,padding:"2rem",border:`1.5px solid ${MC.red}20`,transition:"box-shadow .2s,transform .2s"}} onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 8px 24px ${MC.red}18`;e.currentTarget.style.transform="translateY(-4px)"}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="";e.currentTarget.style.transform=""}}>
                <div style={{width:48,height:48,background:`linear-gradient(135deg,${MC.red},${MC.darkRed})`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16}}>
                  <s.icon style={{width:22,height:22,color:"white"}}/>
                </div>
                <h3 style={{fontWeight:700,color:"#1a1a1a",marginBottom:8}}>{s.title}</h3>
                <p style={{color:MC.steel,fontSize:"0.9rem",lineHeight:1.65}}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{padding:"5rem 2rem",background:`linear-gradient(135deg,${MC.darkRed} 0%,${MC.gray} 100%)`,position:"relative",overflow:"hidden"}}>
        <motion.div {...FADE()} style={{maxWidth:580,margin:"0 auto",textAlign:"center",position:"relative"}}>
          <h2 style={{fontSize:"clamp(1.6rem,3.5vw,2.2rem)",fontWeight:800,color:"white",marginBottom:12}}>{t("ctaTitle")}</h2>
          <p style={{color:"rgba(255,255,255,0.72)",marginBottom:36}}>{t("ctaSubtitle")}</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:12,justifyContent:"center"}}>
            <a href="tel:+21671333858" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"13px 28px",background:"white",color:MC.darkRed,fontWeight:700,borderRadius:99,textDecoration:"none"}}>📞 (+216) 71 333 858</a>
            <Link href={`/${locale}/contact`} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"13px 28px",background:"rgba(255,255,255,0.12)",color:"white",fontWeight:600,borderRadius:99,textDecoration:"none",border:"1.5px solid rgba(255,255,255,0.4)"}}>
              {t("ctaContact")}
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
