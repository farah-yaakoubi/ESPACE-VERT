"use client";
import { useState, useEffect } from "react";
import { PageHero } from "@/components/sections/Hero";
import { ActualiteCard } from "@/components/cards/ActualiteCard";
import { Pagination } from "@/components/ui/Pagination";
import { GridSkeleton } from "@/components/ui/Skeleton";
import { actualitesService } from "@/services";
import type { Actualite, ApiMeta } from "@/types/api";

const LIMIT = 9;

export default function ActualitesPage() {
  const [actualites, setActualites] = useState<Actualite[]>([]);
  const [meta,       setMeta]       = useState<ApiMeta | null>(null);
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    actualitesService.list(page, LIMIT)
      .then(({ data, meta }) => {
        if (cancelled) return;
        setActualites(data);
        setMeta(meta);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Erreur de chargement");
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [page]);

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <PageHero
        eyebrow="Groupe Espace Vert"
        title="Actualités"
        subtitle="Suivez les dernières nouvelles, innovations et événements du groupe."
      />

      <section className="section">
        <div className="container-ev">
          {loading ? (
            <GridSkeleton count={LIMIT} />
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500">{error}</p>
              <button
                onClick={() => setPage(1)}
                className="btn-outline mt-4"
              >
                Réessayer
              </button>
            </div>
          ) : actualites.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-3">📰</p>
              <p>Aucune actualité disponible pour le moment.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {actualites.map((a) => (
                  <ActualiteCard key={a.id_actualite} actualite={a} />
                ))}
              </div>

              {meta && (
                <Pagination meta={meta} onPageChange={handlePageChange} />
              )}

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
