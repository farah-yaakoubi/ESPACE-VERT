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
  titre: string;
  slug: string;
  image: string | null;
  contenu: string;
  published_at: string | null;
  created_at: string;
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
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [news, setNews] = useState<Actu[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/actualites?limit=8&publiee=true`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) setNews(d.data);
      })
      .catch(() => undefined)
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
    const cardWidth = firstCard.offsetWidth + gap;
    const total = news.length * cardWidth;
    let pos = 0;
    let raf = 0;

    const step = () => {
      if (!paused) {
        pos += 0.55;
        if (pos >= total) pos = 0;
        track.style.transform = `translateX(-${pos}px)`;
      }
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isMobile, paused, news.length]);

  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: false, margin: "-80px" });

  if (!loading && news.length === 0) return null;

  const doubled = news.length > 0 ? [...news, ...news] : [];
  const items = isMobile ? news : doubled;

  return (
    <section className="w-full overflow-hidden bg-[#f6f4ee] py-0">
      <div className="mx-auto max-w-[1200px] px-4 pt-10 pb-7 sm:px-6 sm:pt-11 sm:pb-8">
        <div ref={headerRef} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <motion.div
              className="mb-3 flex items-center gap-3"
              animate={{ opacity: headerInView ? 1 : 0, y: headerInView ? 0 : 16 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Newspaper size={15} strokeWidth={1.5} style={{ color: "#1f4d34" }} />
              <p style={{ color: "#7c8f6a", fontSize: 10, fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase" }}>
                Actualités
              </p>
            </motion.div>
            <h2
              className="section-title overflow-hidden"
              style={{ color: "#1b2118" }}
            >
              <motion.span
                className="inline-block"
                initial={{ y: "120%" }}
                animate={{ y: headerInView ? "0%" : "120%" }}
                transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
              >
                Nos dernières <span style={{ color: "#1f4d34" }}>nouvelles</span>
              </motion.span>
            </h2>
            <motion.div
              className="mt-4 h-px rounded-full"
              style={{ background: "#1f4d34" }}
              animate={{ width: headerInView ? 48 : 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
          <Link
            href="/actualites"
            className="hidden rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-colors sm:inline-flex sm:items-center sm:gap-2"
            style={{ background: "#1b5e38" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#0a6030")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1b5e38")}
          >
            Voir tout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Link
          href="/actualites"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors sm:hidden"
          style={{ background: "#1b5e38" }}
        >
          Voir tout <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="flex h-[220px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0a6030] border-t-transparent" />
        </div>
      ) : (
        <div
          className={`relative w-full ${isMobile ? "overflow-x-auto scrollbar-none snap-x snap-mandatory px-4 sm:px-6 pb-6" : "overflow-hidden"}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {!isMobile && (
            <div
              className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 sm:w-16"
              style={{ background: "linear-gradient(to right,#f6f4ee,transparent)" }}
            />
          )}
          {!isMobile && (
            <div
              className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 sm:w-16"
              style={{ background: "linear-gradient(to left,#f6f4ee,transparent)" }}
            />
          )}

          <div
            ref={trackRef}
            className={`flex ${isMobile ? "w-max gap-4 pr-4" : "gap-5 pb-3"}`}
            style={{ width: "max-content", willChange: isMobile ? undefined : "transform", paddingLeft: isMobile ? 0 : 24 }}
          >
            {items.map((item, index) => (
              <Link
                key={`${item.id_actualite}-${index}`}
                href={`/actualites/${item.slug}`}
                data-news-card
                className={`group flex-shrink-0 ${isMobile ? "snap-start" : ""}`}
                style={{ width: isMobile ? "min(86vw, 320px)" : "360px" }}
              >
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className="relative h-[220px] overflow-hidden rounded-2xl shadow-md transition-shadow hover:shadow-xl"
                  style={{ background: GRADS[index % GRADS.length] }}
                >
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.titre}
                      fill
                      className="object-cover opacity-30"
                      sizes="(max-width: 767px) 84vw, 360px"
                    />
                  )}

                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.07) 1px,transparent 1px)", backgroundSize: "24px 24px" }}
                  />
                  <div className="pointer-events-none absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-white/40" />

                  <div className="relative z-10 flex h-full flex-col justify-between p-6">
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white/80">
                          Actualite
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-white/60">
                          <Calendar className="h-3.5 w-3.5" />
                          {fmtDate(item.published_at ?? item.created_at)}
                        </div>
                      </div>
                      <h3 className="mb-2 line-clamp-2 text-[17px] font-black leading-snug text-white">{item.titre}</h3>
                      <p className="line-clamp-2 text-[13px] leading-relaxed text-white/70">{stripHtml(item.contenu)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-white/80 transition-colors group-hover:text-white">Lire la suite</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-all group-hover:bg-white/30">
                        <ArrowRight className="h-4 w-4 text-white" />
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