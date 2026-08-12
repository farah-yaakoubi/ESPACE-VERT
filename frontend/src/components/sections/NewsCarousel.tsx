"use client";
/**
 * NewsCarousel — Carrousel horizontal fluide avec style minimaliste
 * 100% données backend.
 */
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Leaf, Newspaper, ChevronLeft, ChevronRight } from "lucide-react";

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

const CATEGORIES = [
  { name: "Actualité", color: "text-green-800" },
  { name: "Actualité", color: "text-amber-600" },
  { name: "Actualité", color: "text-blue-800" },
];

function fmtDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function stripHtml(h: string) {
  return h.replace(/<[^>]+>/g, "").slice(0, 100);
}

export default function NewsCarousel() {
  const [news, setNews] = useState<Actu[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: false, margin: "-80px" });

  useEffect(() => {
    fetch(`${BASE}/actualites?limit=8&publiee=true`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) setNews(d.data);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (!loading && news.length === 0) return null;

  return (
    <section className="w-full bg-[#fdfdfc] py-20 overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6">
        {/* Header avec Icône Feuille */}
        <div ref={headerRef} className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={headerInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4"
          >
            <Leaf className="text-green-800 w-10 h-10 md:w-12 md:h-12" strokeWidth={1.2} />
            <h2 className="section-title">
              Nos actualités
            </h2>
          </motion.div>

          <div className="flex items-center gap-4">
            <Link
              href="/actualites"
              className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-[#1b2118] border-b-2 border-green-800 pb-1 mr-4 transition-all hover:text-green-800"
            >
              Voir tout
            </Link>
            
            {/* Contrôles du Carrousel */}
            <div className="flex gap-2">
              <button 
                onClick={() => scroll("left")}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-all hover:bg-green-800 hover:text-white hover:border-green-800 shadow-sm"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={() => scroll("right")}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-all hover:bg-green-800 hover:text-white hover:border-green-800 shadow-sm"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Carrousel */}
        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-800 border-t-transparent" />
          </div>
        ) : (
          <div 
            ref={scrollContainerRef}
            className="flex gap-8 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-8 -mx-4 px-4 md:mx-0 md:px-0"
            style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}
          >
            {news.map((item, index) => (
              <motion.div
                key={item.id_actualite}
                className="flex-shrink-0 w-[85vw] md:w-[400px] snap-start"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={headerInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/actualites/${item.slug}`} className="group block">
                  {/* Image sans cadre */}
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-gray-100 mb-6 shadow-sm">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.titre}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-50">
                        <Newspaper className="h-12 w-12 text-gray-200" />
                      </div>
                    )}
                    
                    {/* Badge Date */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                       <p className="text-xs font-bold text-gray-600 flex items-center gap-2">
                         <Calendar size={12} className="text-green-800" />
                         {fmtDate(item.published_at ?? item.created_at)}
                       </p>
                    </div>
                  </div>

                  {/* Infos */}
                  <div className="space-y-3 px-1">
                    <span className={`text-xs font-black uppercase tracking-wide ${CATEGORIES[index % CATEGORIES.length].color}`}>
                      {CATEGORIES[index % CATEGORIES.length].name}
                    </span>
                    
                    <h3 className="text-xl font-bold text-[#1b2118] leading-tight group-hover:text-green-800 transition-colors line-clamp-2">
                      {item.titre}
                    </h3>
                    
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 font-light">
                      {stripHtml(item.contenu)}...
                    </p>

                    <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#1b2118] uppercase tracking-wider group-hover:gap-4 transition-all">
                      Lire la suite <ArrowRight size={14} className="text-green-800" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}