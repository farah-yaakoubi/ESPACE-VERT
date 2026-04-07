"use client";

import { useState, useEffect }   from "react";
import { motion }                 from "framer-motion";
import Link     from "next/link";
import Image    from "next/image";
import { useLocale } from "next-intl";
import { CalendarIcon, ArrowRightIcon, NewspaperIcon } from "@heroicons/react/24/outline";
import { getActualites, type ActualitePublic } from "@/lib/api";
import { buildPages }   from "@/lib/usePagination";
import PageHero from "@/components/PageHero/PageHero";

const EV = { forest:"#0a6030", leaf:"#7dc040", sage:"#4a9060", foam:"#e6f7e8", cream:"#f2faf3" };
const LIMIT = 9;

function fmt(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" });
}
const strip = (h: string) => h.replace(/<[^>]+>/g, "");

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-48 bg-gray-100"/>
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-100 rounded w-1/3"/>
        <div className="h-5 bg-gray-100 rounded w-3/4"/>
        <div className="h-3 bg-gray-100 rounded w-full"/>
      </div>
    </div>
  );
}

function CardFeatured({ a, locale }: { a: ActualitePublic; locale: string }) {
  return (
    <motion.article initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
      className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col lg:flex-row">
      <div className="relative lg:w-1/2 h-72 lg:h-auto min-h-[280px] overflow-hidden flex-shrink-0"
        style={{ background:"linear-gradient(135deg,#0a6030,#4a9060)" }}>
        {a.image
          ? <Image src={a.image} alt={a.titre} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width:1024px)100vw,50vw"/>
          : <div className="absolute inset-0 flex items-center justify-center opacity-20"><NewspaperIcon className="w-24 h-24 text-white"/></div>}
        <div className="absolute top-5 left-5 bg-[#7dc040] text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wide">
          À la une
        </div>
      </div>
      <div className="flex flex-col justify-center p-8 lg:p-12 flex-1">
        <div className="flex items-center gap-2 text-sm mb-4" style={{ color:EV.sage }}>
          <CalendarIcon className="w-4 h-4"/>{fmt(a.published_at ?? a.created_at)}
        </div>
        <h2 className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight mb-4 group-hover:text-[#0a6030] transition-colors">
          {a.titre}
        </h2>
        <p className="text-gray-500 leading-relaxed mb-8 line-clamp-3">{strip(a.contenu).substring(0,250)}…</p>
        <Link href={`/${locale}/actualites/${a.slug}`}
          className="self-start flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all hover:scale-105"
          style={{ backgroundColor:EV.forest }}>
          Lire l'article <ArrowRightIcon className="w-4 h-4"/>
        </Link>
      </div>
    </motion.article>
  );
}

function Card({ a, locale, i }: { a: ActualitePublic; locale: string; i: number }) {
  return (
    <motion.article initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.06 }}
      whileHover={{ y:-3 }}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="relative h-48 overflow-hidden flex-shrink-0"
        style={{ background:"linear-gradient(135deg,#e6f7e8,#c8eccc)" }}>
        {a.image
          ? <Image src={a.image} alt={a.titre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px)100vw,(max-width:1024px)50vw,33vw"/>
          : <div className="absolute inset-0 flex items-center justify-center opacity-30"><NewspaperIcon className="w-12 h-12" style={{ color:EV.forest }}/></div>}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs mb-3" style={{ color:EV.sage }}>
          <CalendarIcon className="w-3.5 h-3.5"/>{fmt(a.published_at ?? a.created_at)}
        </div>
        <h3 className="font-black text-gray-900 text-base leading-snug mb-3 group-hover:text-[#0a6030] transition-colors line-clamp-2">
          {a.titre}
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 flex-1 mb-4">
          {strip(a.contenu).substring(0,150)}…
        </p>
        <Link href={`/${locale}/actualites/${a.slug}`}
          className="flex items-center gap-1.5 text-sm font-bold mt-auto transition-all hover:gap-3"
          style={{ color:EV.forest }}>
          Lire <ArrowRightIcon className="w-3.5 h-3.5"/>
        </Link>
      </div>
    </motion.article>
  );
}

export default function ActualitesPage() {
  const locale = useLocale();

  const [articles, setArticles] = useState<ActualitePublic[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);

  useEffect(() => {
    setLoading(true);
    getActualites({ page, limit:LIMIT }).then(res => {
      if (res.success && res.data) {
        setArticles(res.data);
        setTotal(res.meta?.total  ?? res.data.length);
        setPages(res.meta?.pages  ?? 1);
      }
      setLoading(false);
    });
  }, [page]);

  const [featured, ...rest] = articles;

  return (
    <div className="min-h-screen" style={{ backgroundColor:EV.cream }}>
      <PageHero title="Actualités"
        subtitle="Suivez toutes les nouveautés, innovations et événements d'Espace Vert."
        gradientFrom="#0a6030" gradientTo="#1b5e3b"
        badge="Restez informé" badgeColor="#7dc040" size="md"
        breadcrumbs={[{ label:"Actualités" }]}/>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        {loading ? (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl h-64 animate-pulse"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length:6 }).map((_,i) => <SkeletonCard key={i}/>)}
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor:EV.foam }}>
              <NewspaperIcon className="w-9 h-9" style={{ color:EV.sage }}/>
            </div>
            <h3 className="text-xl font-black text-gray-700 mb-2">Aucune actualité disponible</h3>
            <p className="text-gray-400">Revenez bientôt.</p>
          </div>
        ) : (
          <>
            {/* Featured — page 1 seulement */}
            {page === 1 && featured && (
              <div className="mb-10"><CardFeatured a={featured} locale={locale}/></div>
            )}

            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-400">{total} article{total>1?"s":""} publié{total>1?"s":""}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(page===1 ? rest : articles).map((a,i) => (
                <Card key={a.id_actualite} a={a} locale={locale} i={i}/>
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <nav className="flex items-center justify-center gap-1.5 mt-12 flex-wrap">
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-gray-500 hover:border-[#0a6030] disabled:opacity-30 transition-all">‹</button>
                {buildPages(page, pages).map((item,i) =>
                  item==="…"
                    ? <span key={`e${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400">…</span>
                    : <button key={item} onClick={() => setPage(item as number)}
                        className="w-10 h-10 rounded-xl text-sm font-bold transition-all hover:scale-105"
                        style={item===page ? { backgroundColor:EV.forest, color:"#fff" } : { backgroundColor:"#fff", color:"#374151", border:"1px solid #e5e7eb" }}>
                        {item}
                      </button>
                )}
                <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center font-bold text-gray-500 hover:border-[#0a6030] disabled:opacity-30 transition-all">›</button>
                <span className="text-xs text-gray-400 ml-2 hidden sm:block">
                  Page {page}/{pages}
                </span>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
