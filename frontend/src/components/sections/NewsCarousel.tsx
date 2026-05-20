"use client";
/**
 * NewsCarousel — 100% données backend
 * Aucune donnée statique. Si aucune actualité publiée → section masquée.
 */
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Newspaper } from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface Actu {
  id_actualite: number;
  titre:        string;
  slug:         string;
  image:        string | null;
  contenu:      string;
  published_at: string | null;
  created_at:   string;
}

const GRADS = [
  "linear-gradient(135deg,#0a6030,#4a7c2f)",
  "linear-gradient(135deg,#1e3a5f,#1a6b78)",
  "linear-gradient(135deg,#0a5c2e,#3a8040)",
  "linear-gradient(135deg,#6b2f00,#c47d1a)",
  "linear-gradient(135deg,#1a3d2a,#2d6b40)",
  "linear-gradient(135deg,#2d1a5f,#5a3a8a)",
];

function fmtDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function stripHtml(h: string) {
  return h.replace(/<[^>]+>/g, "").slice(0, 120);
}

export default function NewsCarousel() {
  const trackRef         = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [news,   setNews]   = useState<Actu[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/actualites?limit=8&publiee=true`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => { if (d.success && Array.isArray(d.data)) setNews(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 767px)");
    const syncMobile = () => setIsMobile(media.matches);
    syncMobile();
    media.addEventListener?.("change", syncMobile);
    return () => media.removeEventListener?.("change", syncMobile);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || news.length === 0 || isMobile) return;

    const firstCard = track.querySelector<HTMLElement>("[data-news-card]");
    if (!firstCard) return;

    const gapValue = window.getComputedStyle(track).gap || window.getComputedStyle(track).columnGap || "0";
    const gap = Number.parseFloat(gapValue) || 0;
    const CARD_W = firstCard.offsetWidth + gap;
    const TOTAL  = news.length * CARD_W;
    let pos = 0, raf: number;
    const step = () => {
      if (!paused) { pos += 0.55; if (pos >= TOTAL) pos = 0; track.style.transform = `translateX(-${pos}px)`; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isMobile, paused, news.length]);

  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: false, margin: "-80px" });

  // Masquer si chargement terminé et aucune actualité
  if (!loading && news.length === 0) return null;

  const doubled = news.length > 0 ? [...news, ...news] : [];
  const items = isMobile ? news : doubled;

  return (
    <section className="w-full overflow-hidden bg-[#f7faf5] py-0">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-14 pb-10">
        <div ref={headerRef} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <motion.div
              className="flex items-center gap-3 mb-3"
              animate={{ opacity: headerInView ? 1 : 0, x: headerInView ? 0 : -40 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="w-1 h-8 rounded-full" style={{ background:"#1b5e38" }} />
              <Newspaper size={18} style={{ color:"#2e7d4f" }} />
              <p style={{ color:"#2e7d4f", fontSize:11, fontWeight:800, letterSpacing:"0.22em", textTransform:"uppercase" }}>Actualités</p>
            </motion.div>
            <motion.h2
              animate={{ opacity: headerInView ? 1 : 0, x: headerInView ? 0 : -48 }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{ color:"#0d1f0d", fontSize:"clamp(2rem,3.5vw,2.8rem)", fontWeight:900, letterSpacing:"-0.02em", lineHeight:1.1 }}
            >
              Nos dernières <span style={{ color:"#1b5e38" }}>nouvelles</span>
            </motion.h2>
            <div style={{ marginTop:10, width:48, height:4, borderRadius:4, overflow:"hidden", background:"#e8f5ee" }}>
              <motion.div
                animate={{ scaleX: headerInView ? 1 : 0 }}
                transition={{ duration: 0.5, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
                style={{ height:"100%", borderRadius:4, background:"linear-gradient(90deg,#7dc040,#1b5e38)", transformOrigin:"left" }}
              />
            </div>
          </div>
          <Link href="/actualites"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-colors"
            style={{ background:"#1b5e38" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#0a6030")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1b5e38")}>
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <Link href="/actualites"
          className="inline-flex sm:hidden items-center gap-2 px-4 py-2.5 text-white text-sm font-bold rounded-xl transition-colors"
          style={{ background:"#1b5e38" }}>
          Voir tout <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="h-[220px] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#0a6030] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className={`w-full relative ${isMobile ? "overflow-x-auto scrollbar-none snap-x snap-mandatory px-4 sm:px-6 pb-6" : "overflow-hidden"}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}>
          {!isMobile && <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to right,#f7faf5,transparent)" }} />
          }
          {!isMobile && <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left,#f7faf5,transparent)" }} />
          }

          <div
            ref={trackRef}
            className={`flex ${isMobile ? "gap-4 w-max pr-4" : "gap-5 pb-6"}`}
            style={{ width: "max-content", willChange: isMobile ? undefined : "transform", paddingLeft: isMobile ? 0 : 24 }}
          >
            {items.map((item, i) => (
              <Link key={`${item.id_actualite}-${i}`} href={`/actualites/${item.slug}`}
                data-news-card
                className={`group flex-shrink-0 ${isMobile ? "snap-start" : ""}`}
                style={{ width: isMobile ? "min(86vw, 320px)" : "360px" }}>
                <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow h-[220px] relative"
                  style={{ background: GRADS[i % GRADS.length] }}>
                  {/* Image de fond si disponible */}
                  {item.image && (
                    <Image src={item.image} alt={item.titre} fill className="object-cover opacity-30" sizes="(max-width: 767px) 84vw, 360px" />
                  )}
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.07) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
                  <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/40 rounded-full pointer-events-none" />

                  <div className="relative z-10 h-full flex flex-col justify-between p-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-black text-white/80 uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
                          Actualité
                        </span>
                        <div className="flex items-center gap-1.5 text-white/60 text-[11px]">
                          <Calendar className="w-3.5 h-3.5" />
                          {fmtDate(item.published_at ?? item.created_at)}
                        </div>
                      </div>
                      <h3 className="text-white font-black text-[17px] leading-snug line-clamp-2 mb-2">{item.titre}</h3>
                      <p className="text-white/70 text-[13px] leading-relaxed line-clamp-2">{stripHtml(item.contenu)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-white/80 group-hover:text-white transition-colors">Lire la suite</span>
                      <div className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center transition-all">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
