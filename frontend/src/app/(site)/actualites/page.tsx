"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, Newspaper } from "lucide-react";
import { PageHero }       from "@/components/sections/Hero";
import { Pagination }     from "@/components/ui/Pagination";
import { GridSkeleton }   from "@/components/ui/Skeleton";
import { actualitesService } from "@/services";
import type { Actualite, ApiMeta } from "@/types/api";
import { useI18n } from "@/i18n/I18nProvider";
import { translatedField } from "@/i18n/translated-field";

const LIMIT = 9;

function fmtDate(d: string | null, locale: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString(locale === "ar" ? "ar-TN" : locale === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function stripHtml(h: string) { return h.replace(/<[^>]+>/g, ""); }

function ActuCard({ actu }: { actu: Actualite }) {
  const { locale, t } = useI18n();
  const titre = translatedField(actu as any, "titre", locale) || actu.titre;
  const contenu = translatedField(actu as any, "contenu", locale) || actu.contenu;
  return (
    <Link href={`/actualites/${actu.slug}`} className="group block">
      <article className="bg-white rounded-2xl border border-sand-200 overflow-hidden hover:border-ev-200 hover:shadow-lg transition-all duration-300 h-full flex flex-col"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        {/* Image */}
        <div className="relative h-48 bg-sand-100 overflow-hidden shrink-0">
          {actu.image ? (
            <Image src={actu.image} alt={titre} fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width:640px)100vw,(max-width:1024px)50vw,33vw" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#0a5c2e,#15803d)" }}>
              <Newspaper size={32} className="text-white/30" />
            </div>
          )}
          {/* Date overlay */}
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
              <Calendar size={11} />
              {fmtDate(actu.published_at ?? actu.created_at, locale)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          <h3 className="font-bold text-base leading-snug text-gray-900 group-hover:text-ev-700 transition-colors mb-2 line-clamp-2"
            style={{ fontFamily: "var(--font-display)" }}>
            {titre}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">
            {stripHtml(contenu)}
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-ev-600"
            style={{ fontFamily: "var(--font-display)" }}>
            {t("news.readmore", "Lire la suite")} <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function ActualitesPage() {
  const { locale, t } = useI18n();
  const [actualites, setActualites] = useState<Actualite[]>([]);
  const [meta,       setMeta]       = useState<ApiMeta | null>(null);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    actualitesService.list(page, LIMIT)
      .then(({ data, meta }) => {
        if (cancelled) return;
        setActualites(data);
        setMeta(meta);
      })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : "Erreur"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page]);

  const handlePage = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <>
      <PageHero
        eyebrow={t("activities.eyebrow", "Groupe Espace Vert")}
        title={t("news.title", "Actualités")}
        subtitle={t("news.subtitle", "Dernières nouvelles, innovations et événements du groupe.")}
      />
      <section className="section">
        <div className="container-ev">
          {loading ? (
            <GridSkeleton count={LIMIT} />
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">{error}</p>
              <button onClick={() => setPage(1)} className="btn-outline">{t("news.retry", "Réessayer")}</button>
            </div>
          ) : actualites.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Newspaper size={48} className="mx-auto mb-4 opacity-20" />
              <h3 className="font-semibold text-gray-600 mb-2">{t("news.empty", "Aucun article disponible pour le moment.")}</h3>
              <p className="text-sm">{t("news.empty.desc", "Les actualités seront publiées prochainement.")}</p>
            </div>
          ) : (
            <>
              {/* Featured (first card big) */}
              {page === 1 && actualites.length > 0 && (
                <Link href={`/actualites/${actualites[0].slug}`} className="group block mb-8">
                  {(() => {
                    const featuredTitle = translatedField(actualites[0] as any, "titre", locale) || actualites[0].titre;
                    const featuredContent = translatedField(actualites[0] as any, "contenu", locale) || actualites[0].contenu;
                    return (
                  <article className="bg-white rounded-3xl border border-sand-200 overflow-hidden hover:shadow-xl transition-all duration-300 grid md:grid-cols-2 gap-0"
                    style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                    <div className="relative h-64 md:h-auto bg-sand-100">
                      {actualites[0].image ? (
                        <Image src={actualites[0].image} alt={featuredTitle} fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          sizes="(max-width:768px)100vw,50vw" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg,#052e16,#0a5c2e)" }}>
                          <Newspaper size={48} className="text-white/20" />
                        </div>
                      )}
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      <span className="inline-flex items-center gap-2 text-xs font-bold text-ev-600 mb-4 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-ev-500 animate-pulse" />
                        {t("news.featured", "À la une")}
                      </span>
                      <h2 className="text-2xl font-black text-gray-900 group-hover:text-ev-700 transition-colors leading-snug mb-3"
                        style={{ fontFamily: "var(--font-display)" }}>
                        {featuredTitle}
                      </h2>
                      <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-3">
                        {stripHtml(featuredContent)}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 flex items-center gap-1.5">
                          <Calendar size={12} />
                          {fmtDate(actualites[0].published_at ?? actualites[0].created_at, locale)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-ev-700 group-hover:gap-2.5 transition-all">
                          {t("news.readmore", "Lire l'article")} <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </article>
                    );
                  })()}
                </Link>
              )}

              {/* Grid */}
              {(page === 1 ? actualites.slice(1) : actualites).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {(page === 1 ? actualites.slice(1) : actualites).map(a => (
                    <ActuCard key={a.id_actualite} actu={a} />
                  ))}
                </div>
              )}

              {meta && <Pagination meta={meta} onPageChange={handlePage} />}
              <p className="text-center text-xs text-gray-400 mt-4">
                {meta?.total ?? 0} article{(meta?.total ?? 0) > 1 ? "s" : ""}
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
