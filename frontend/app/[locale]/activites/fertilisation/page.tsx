"use client";
import { motion } from "framer-motion";
import { SparklesIcon, BeakerIcon, CheckCircleIcon, ArrowRightIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

const FADE = (delay=0) => ({ initial:{opacity:0,y:24}, whileInView:{opacity:1,y:0}, viewport:{once:true}, transition:{duration:0.55,ease:[0.22,1,0.36,1],delay} });

export default function FertilisationPage() {
  const t = useTranslations("activities.fertilisation");
  const locale = useLocale();

  const benefits = [
    { icon: ChartBarIcon, value: "+30%", title: t("yieldImprovement"), desc: t("yieldDesc") },
    { icon: SparklesIcon, value: "100%", title: t("customSolutions"),   desc: t("customDesc") },
    { icon: CheckCircleIcon,value:"✓",  title: t("bioCert"),            desc: t("bioCertDesc") },
  ];
  const expertises = [
    { icon: BeakerIcon,       title: t("soilAnalysis"),      desc: t("soilAnalysisDesc") },
    { icon: SparklesIcon,     title: t("fertPlans"),          desc: t("fertPlansDesc") },
    { icon: CheckCircleIcon,  title: t("agronomicSupport"),  desc: t("agronomicSupportDesc") },
  ];
  const brands = [
    { name:"Fertivert Pro",    sub:"Agriculture Professionnelle", desc:"Solutions pour l'agriculture intensive et cultures spécialisées", href:`/${locale}/marques/fertivert?division=pro`,  products:["Engrais de fond","Engrais organique","Fertilisants spécialisés"], color:"#1f5226" },
    { name:"Fertivert Garden", sub:"Jardin & Gazon",              desc:"Gamme complète pour jardins, espaces verts et pelouses",          href:`/${locale}/marques/fertivert?division=garden`, products:["Gazon","Plantes vertes","Engrais chimiques"],                  color:"#2d8c35" },
  ];

  return (
    <div style={{background:"#fafaf8",minHeight:"100vh"}}>

      {/* ── HERO ── */}
      <section style={{background:"linear-gradient(135deg,#0f2d12 0%,#1f5226 55%,#2d8c35 100%)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.07) 1px,transparent 1px)",backgroundSize:"28px 28px"}}/>
        <div style={{position:"absolute",bottom:-1,left:0,right:0}}>
          <svg viewBox="0 0 1440 60" style={{width:"100%",height:60,display:"block"}} preserveAspectRatio="none">
            <path d="M0,60L1440,60L1440,20C1200,52,960,0,720,28C480,56,240,4,0,36Z" fill="#fafaf8"/>
          </svg>
        </div>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"6rem 2rem 7rem"}}>
          <motion.div {...FADE()} style={{maxWidth:680}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.25)",color:"white",padding:"6px 16px",borderRadius:99,fontSize:13,fontWeight:600,marginBottom:24}}>
              🌱 {t("tag")}
            </span>
            <h1 style={{fontSize:"clamp(2.2rem,5vw,3.5rem)",fontWeight:900,color:"white",lineHeight:1.1,letterSpacing:"-0.025em",marginBottom:20}}>
              {t("pageTitle")}
            </h1>
            <p style={{fontSize:"1.1rem",color:"rgba(255,255,255,0.75)",lineHeight:1.7,marginBottom:36,maxWidth:560}}>
              {t("pageSubtitle")}
            </p>
            <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
              <Link href={`/${locale}/contact`} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"13px 28px",background:"white",color:"#1f5226",fontWeight:700,borderRadius:99,fontSize:"0.95rem",textDecoration:"none",boxShadow:"0 4px 16px rgba(0,0,0,0.15)",transition:"transform .2s"}} onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-2px)")} onMouseLeave={e=>(e.currentTarget.style.transform="")}>
                {t("contactExperts")} <ArrowRightIcon style={{width:16,height:16}}/>
              </Link>
              <a href="#marques" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"13px 28px",background:"rgba(255,255,255,0.12)",color:"white",fontWeight:600,borderRadius:99,fontSize:"0.95rem",textDecoration:"none",border:"1.5px solid rgba(255,255,255,0.4)",backdropFilter:"blur(8px)"}}>
                {t("viewProducts")}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── BÉNÉFICES ── */}
      <section style={{padding:"5rem 2rem",background:"white"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <motion.div {...FADE()} style={{textAlign:"center",marginBottom:"3.5rem"}}>
            <h2 style={{fontSize:"clamp(1.6rem,3.5vw,2.4rem)",fontWeight:800,color:"#2d6e45",marginBottom:12,letterSpacing:"-0.02em"}}>{t("whyTitle")}</h2>
            <p style={{color:"#716e67",maxWidth:520,margin:"0 auto",lineHeight:1.65}}>{t("whySubtitle")}</p>
          </motion.div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:24}}>
            {benefits.map((b,i)=>(
              <motion.div key={i} {...FADE(i*0.12)} style={{background:"#f8fdf8",borderRadius:20,padding:"2rem",textAlign:"center",border:"1.5px solid #dcf0de"}}>
                <div style={{width:56,height:56,background:"linear-gradient(135deg,#236b28,#3cb648)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1.25rem"}}>
                  <b.icon style={{width:26,height:26,color:"white"}}/>
                </div>
                <div style={{fontSize:"2.5rem",fontWeight:900,color:"#2d8c35",marginBottom:6}}>{b.value}</div>
                <h3 style={{fontWeight:700,color:"#2d6e45",marginBottom:8,fontSize:"1.05rem"}}>{b.title}</h3>
                <p style={{color:"#716e67",fontSize:"0.9rem",lineHeight:1.6}}>{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXPERTISES ── */}
      <section style={{padding:"5rem 2rem",background:"#f4f3f0"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <motion.div {...FADE()} style={{textAlign:"center",marginBottom:"3.5rem"}}>
            <h2 style={{fontSize:"clamp(1.6rem,3.5vw,2.4rem)",fontWeight:800,color:"#2d6e45",marginBottom:12}}>{t("servicesTitle")}</h2>
            <p style={{color:"#716e67",maxWidth:480,margin:"0 auto"}}>{t("servicesSubtitle")}</p>
          </motion.div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20}}>
            {expertises.map((e,i)=>(
              <motion.div key={i} {...FADE(i*0.12)} style={{background:"white",borderRadius:18,padding:"2rem",border:"1.5px solid #e8e6e1",transition:"box-shadow .2s,transform .2s",cursor:"default"}} onMouseEnter={ev=>{ev.currentTarget.style.boxShadow="0 8px 32px rgba(0,0,0,0.10)";ev.currentTarget.style.transform="translateY(-4px)"}} onMouseLeave={ev=>{ev.currentTarget.style.boxShadow="";ev.currentTarget.style.transform=""}}>
                <div style={{width:48,height:48,background:"#f2faf3",border:"1.5px solid #dcf0de",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20}}>
                  <e.icon style={{width:22,height:22,color:"#2d8c35"}}/>
                </div>
                <h3 style={{fontWeight:700,color:"#262420",marginBottom:8}}>{e.title}</h3>
                <p style={{color:"#716e67",fontSize:"0.9rem",lineHeight:1.65}}>{e.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUES ── */}
      <section id="marques" style={{padding:"5rem 2rem",background:"white"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <motion.div {...FADE()} style={{textAlign:"center",marginBottom:"3.5rem"}}>
            <h2 style={{fontSize:"clamp(1.6rem,3.5vw,2.4rem)",fontWeight:800,color:"#2d6e45",marginBottom:12}}>{t("brandsTitle")}</h2>
            <p style={{color:"#716e67",maxWidth:480,margin:"0 auto"}}>{t("brandsSubtitle")}</p>
          </motion.div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:24}}>
            {brands.map((brand,i)=>(
              <motion.div key={i} {...FADE(i*0.15)}>
                <Link href={brand.href} style={{textDecoration:"none",display:"block"}}>
                  <div style={{borderRadius:20,overflow:"hidden",border:"1.5px solid #e8e6e1",transition:"box-shadow .2s,transform .2s"}} onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 12px 40px rgba(0,0,0,0.12)";e.currentTarget.style.transform="translateY(-5px)"}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="";e.currentTarget.style.transform=""}}>
                    <div style={{padding:"2rem",background:`linear-gradient(135deg,${brand.color},#3cb648)`,color:"white",position:"relative",overflow:"hidden"}}>
                      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.08) 1px,transparent 1px)",backgroundSize:"20px 20px"}}/>
                      <div style={{position:"relative"}}>
                        <h3 style={{fontSize:"1.5rem",fontWeight:900,marginBottom:4}}>{brand.name}</h3>
                        <p style={{fontSize:"0.85rem",opacity:0.8}}>{brand.sub}</p>
                      </div>
                    </div>
                    <div style={{padding:"1.5rem",background:"white"}}>
                      <p style={{color:"#716e67",fontSize:"0.9rem",marginBottom:16,lineHeight:1.6}}>{brand.desc}</p>
                      {brand.products.map((p,j)=>(
                        <div key={j} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:brand.color,flexShrink:0}}/>
                          <span style={{fontSize:"0.85rem",color:"#524f49"}}>{p}</span>
                        </div>
                      ))}
                      <div style={{display:"inline-flex",alignItems:"center",gap:6,color:brand.color,fontWeight:700,fontSize:"0.9rem",marginTop:12}}>
                        {t("discoverRange")} <ArrowRightIcon style={{width:15,height:15}}/>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{padding:"5rem 2rem",background:"linear-gradient(135deg,#2d6e45 0%,#2d8c35 100%)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.06) 1px,transparent 1px)",backgroundSize:"32px 32px"}}/>
        <motion.div {...FADE()} style={{maxWidth:640,margin:"0 auto",textAlign:"center",position:"relative"}}>
          <h2 style={{fontSize:"clamp(1.6rem,3.5vw,2.2rem)",fontWeight:800,color:"white",marginBottom:12}}>{t("ctaTitle")}</h2>
          <p style={{color:"rgba(255,255,255,0.75)",marginBottom:36,lineHeight:1.6}}>{t("ctaSubtitle")}</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:12,justifyContent:"center"}}>
            <a href="tel:+21671333858" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"13px 28px",background:"white",color:"#1f5226",fontWeight:700,borderRadius:99,textDecoration:"none",boxShadow:"0 4px 16px rgba(0,0,0,0.15)"}}>📞 (+216) 71 333 858</a>
            <Link href={`/${locale}/contact`} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"13px 28px",background:"rgba(255,255,255,0.12)",color:"white",fontWeight:600,borderRadius:99,textDecoration:"none",border:"1.5px solid rgba(255,255,255,0.4)"}}>{t("ctaQuote")}</Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
