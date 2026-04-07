"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CalendarIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const STATIC_NEWS = [
  { id:1, date:"2026-02-10", bg:"linear-gradient(135deg,#0a6030,#4a7c2f)", emoji:"🌱", titre:"Nouveau : Fertivert Pro disponible", extrait:"Découvrez notre gamme professionnelle de biostimulants et engrais organiques.", categorie:"Nouveauté" },
  { id:2, date:"2026-02-05", bg:"linear-gradient(135deg,#c8e4ff,#90c8ff)", emoji:"🏢", titre:"4ème agence ouverte à Sfax", extrait:"Espace Vert étend son réseau avec une nouvelle agence dans le Sud.", categorie:"Expansion" },
  { id:3, date:"2026-01-28", bg:"linear-gradient(135deg,#e0d8ff,#c4b0ff)", emoji:"🎓", titre:"Formation techniciens agricoles", extrait:"50 techniciens formés aux nouvelles techniques d'irrigation connectée.", categorie:"Formation" },
  { id:4, date:"2026-01-20", bg:"linear-gradient(135deg,#fde8c4,#f8b860)", emoji:"🎉", titre:"Partenariat Matar x Smart Agri", extrait:"Nouvelle gamme de contrôleurs IoT pour l'agriculture intelligente.", categorie:"Partenariat" },
  { id:5, date:"2026-01-15", bg:"linear-gradient(135deg,#c0f0ec,#80dcd4)", emoji:"💧", titre:"Solution drip optimisée 2026", extrait:"Réduction de 30% de la consommation d'eau avec le nouveau kit Matar.", categorie:"Innovation" },
  { id:6, date:"2026-01-08", bg:"linear-gradient(135deg,#0a6030,#6b9e3e)", emoji:"⚡", titre:"Ferti Actif : +25% rendement", extrait:"Résultats confirmés sur 500 ha d'essais en conditions réelles.", categorie:"Résultats" },
];

export default function NewsCarousel() {
  const locale    = useLocale();
  const t         = useTranslations("news");
  const trackRef  = useRef<HTMLDivElement>(null);
  const [paused, setPaused]   = useState(false);
  const [news, setNews]       = useState(STATIC_NEWS);

  // Fetch from backend, fallback to static
  useEffect(() => {
    fetch(`${API_BASE}/actualites?limit=8`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data.length > 0) {
          const GRADS = ["linear-gradient(135deg,#0a6030,#4a7c2f)","linear-gradient(135deg,#c8e4ff,#90c8ff)","linear-gradient(135deg,#e0d8ff,#c4b0ff)","linear-gradient(135deg,#fde8c4,#f8b860)","linear-gradient(135deg,#c0f0ec,#80dcd4)","linear-gradient(135deg,#0a6030,#6b9e3e)"];
          const EMOJIS = ["🌱","🏢","🎓","🎉","💧","⚡"];
          setNews(d.data.map((a: any, i: number) => ({
            id:       a.id_actualite,
            date:     a.published_at ?? a.created_at,
            bg:       GRADS[i % GRADS.length],
            emoji:    EMOJIS[i % EMOJIS.length],
            titre:    a.titre,
            extrait:  a.contenu.replace(/<[^>]+>/g,"").substring(0, 120),
            categorie: "Actualité",
            slug:     a.slug,
          })));
        }
      })
      .catch(() => {});
  }, []);

  const doubled = [...news, ...news];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf: number, pos = 0;
    const CARD_W = 360 + 20;
    const TOTAL  = news.length * CARD_W;
    const step = () => {
      if (!paused) { pos += 0.6; if (pos >= TOTAL) pos = 0; track.style.transform = `translateX(-${pos}px)`; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [paused, news.length]);

  return (
    <section className="w-full overflow-hidden bg-[#f7faf5] py-0">
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-[#2d5a1b] rounded-full" />
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">{t("title")}</h2>
            </div>
            <h2 className="text-4xl font-black text-gray-900">{t("heading")}</h2>
          </div>
          <Link href={`/${locale}/actualites`}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-[#0a6030] text-white text-sm font-bold rounded-xl hover:bg-[#2d5a1b] transition-colors">
            {t("viewAll")} <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      <div className="w-full overflow-hidden relative"
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background:"linear-gradient(to right,#f7faf5,transparent)" }} />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background:"linear-gradient(to left,#f7faf5,transparent)" }} />

        <div ref={trackRef} className="flex gap-5 pb-6" style={{ width:"max-content", willChange:"transform", paddingLeft:24 }}>
          {doubled.map((item, i) => (
            <Link key={`${item.id}-${i}`} href={`/${locale}/actualites/${(item as any).slug ?? item.id}`} className="flex-shrink-0 w-[360px] group">
              <motion.div whileHover={{ y:-4, scale:1.02 }} transition={{ type:"spring", stiffness:300, damping:22 }}
                className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow h-[220px] relative"
                style={{ background:item.bg }}>
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.07) 1px,transparent 1px)", backgroundSize:"24px 24px" }} />
                <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/40 rounded-full pointer-events-none" />
                <div className="relative z-10 h-full flex flex-col justify-between p-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-black text-white/80 uppercase tracking-wider bg-white/50 px-2.5 py-1 rounded-full">{item.categorie}</span>
                      <div className="flex items-center gap-1.5 text-[#0a6030]/60 text-[11px]">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {new Date(item.date).toLocaleDateString(locale==="ar"?"ar-TN":locale==="en"?"en-GB":"fr-FR", { day:"numeric", month:"short" })}
                      </div>
                    </div>
                    <h3 className="text-white font-black text-[17px] leading-snug line-clamp-2 mb-2">{item.titre}</h3>
                    <p className="text-[#0a6030]/70 text-[13px] leading-relaxed line-clamp-2">{item.extrait}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-white/80 group-hover:text-white transition-colors">{t("readMore")}</span>
                    <div className="w-8 h-8 rounded-full bg-white/60 group-hover:bg-white/30 flex items-center justify-center transition-all">
                      <ArrowRightIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 text-4xl opacity-20 group-hover:opacity-35 transition-opacity pointer-events-none select-none">{item.emoji}</div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
