"use client";

import { useState, useEffect } from "react";
import { useParams }           from "next/navigation";
import { motion }              from "framer-motion";
import Image    from "next/image";
import Link     from "next/link";
import { useLocale } from "next-intl";
import { ArrowLeftIcon, CalendarIcon, NewspaperIcon } from "@heroicons/react/24/outline";
import { getActualiteBySlug, type ActualitePublic } from "@/lib/api";
import PageHero from "@/components/PageHero/PageHero";

const EV = { forest:"#0a6030", leaf:"#7dc040", sage:"#4a9060", foam:"#e6f7e8", cream:"#f2faf3" };

export default function ActualiteDetailPage() {
  const locale = useLocale();
  const params = useParams<{ slug: string }>();

  const [article,  setArticle]  = useState<ActualitePublic | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params.slug) return;
    getActualiteBySlug(params.slug).then(res => {
      if (res.success && res.data) setArticle(res.data);
      else setNotFound(true);
      setLoading(false);
    });
  }, [params.slug]);

  if (loading) return (
    <div className="min-h-screen bg-[#f2faf3]">
      <div className="h-72 bg-gray-200 animate-pulse"/>
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"/>
        <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse"/>
        <div className="mt-8 space-y-3">
          {[90,80,100,70,85,95].map((w,i) => (
            <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width:`${w}%` }}/>
          ))}
        </div>
      </div>
    </div>
  );

  if (notFound || !article) return (
    <div className="min-h-screen bg-[#f2faf3] flex items-center justify-center">
      <div className="text-center p-12">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 bg-[#e6f7e8]">
          <NewspaperIcon className="w-10 h-10 text-[#4a9060]"/>
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-3">Article introuvable</h2>
        <p className="text-gray-400 mb-8">Cet article n'existe pas ou a été supprimé.</p>
        <Link href={`/${locale}/actualites`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white"
          style={{ backgroundColor:EV.forest }}>
          <ArrowLeftIcon className="w-4 h-4"/> Retour aux actualités
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor:EV.cream }}>
      <PageHero title={article.titre}
        imageSrc={article.image ?? undefined}
        gradientFrom="#0a6030" gradientTo="#2d6e45" size="lg"
        breadcrumbs={[
          { label:"Actualités", href:"/actualites" },
          { label:article.titre },
        ]}/>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-10 pt-10 pb-0 flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-2 text-sm font-medium" style={{ color:EV.sage }}>
              <CalendarIcon className="w-4 h-4"/>
              {new Date(article.published_at ?? article.created_at).toLocaleDateString("fr-FR",{ day:"numeric", month:"long", year:"numeric" })}
            </span>
          </div>

          {article.image && (
            <div className="relative h-72 mx-10 mt-6 rounded-2xl overflow-hidden">
              <Image src={article.image} alt={article.titre} fill className="object-cover" sizes="700px" priority/>
            </div>
          )}

          <div className="px-10 py-10 prose prose-lg max-w-none
            prose-headings:font-black prose-headings:text-[#0a6030]
            prose-a:text-[#0a6030] prose-a:font-semibold
            prose-strong:text-gray-900 prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html:article.contenu }}/>
        </motion.div>

        <div className="mt-8">
          <Link href={`/${locale}/actualites`}
            className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-[#0a6030] transition-colors">
            <ArrowLeftIcon className="w-4 h-4"/> Toutes les actualités
          </Link>
        </div>
      </div>
    </div>
  );
}
