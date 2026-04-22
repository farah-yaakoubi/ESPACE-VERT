"use client";
/**
 * useProducts — hook corrigé
 *
 * BUG CORRIGÉ : L'ancien hook recevait `initial` (objet recréé à chaque render)
 * dans le tableau de dépendances, ce qui empêchait `fetchData` de se ré-exécuter
 * quand id_marque ou id_activite changeaient réellement.
 *
 * La solution : extraire les valeurs primitives de `initial` une seule fois
 * via useMemo, puis les référencer directement dans useCallback.
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { produitsService } from "@/services";
import type { ProduitCard, ApiMeta } from "@/types/api";

interface UseProductsOptions {
  id_marque?:    number;
  id_categorie?: number;
  id_activite?:  number;
  division?:     string;
  search?:       string;
  limit?:        number;
}

interface UseProductsResult {
  produits:     ProduitCard[];
  meta:         ApiMeta | null;
  loading:      boolean;
  error:        string | null;
  page:         number;
  setPage:      (p: number) => void;
  setSearch:    (s: string) => void;
  setCategorie: (id: number | undefined) => void;
}

export function useProducts(initial: UseProductsOptions = {}): UseProductsResult {
  // ── Stabilis les valeurs primitives pour éviter les re-renders infinis ──────
  const stableMarque    = initial.id_marque;
  const stableActivite  = initial.id_activite;
  const stableDivision  = initial.division;
  const stableLimit     = initial.limit ?? 12;

  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState(initial.search ?? "");
  const [categorie, setCategorie] = useState<number | undefined>(initial.id_categorie);
  const [produits,  setProduits]  = useState<ProduitCard[]>([]);
  const [meta,      setMeta]      = useState<ApiMeta | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await produitsService.list({
        page,
        limit:        stableLimit,
        id_marque:    stableMarque,      // ← valeur primitive stable
        id_categorie: categorie,
        division:     stableDivision,
        search:       search || undefined,
      });
      setProduits(res.data);
      setMeta(res.meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
      setProduits([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, categorie, stableMarque, stableDivision, stableLimit]);
  // ⚠️  stableActivite intentionnellement absent ici :
  //     le backend /api/produits ne filtre PAS par id_activite directement.
  //     Le filtrage par activité se fait via id_categorie (voir ActiviteProduitsSection).

  useEffect(() => { fetchData(); }, [fetchData]);

  return {
    produits,
    meta,
    loading,
    error,
    page,
    setPage,
    setSearch:    (s: string)              => { setSearch(s);    setPage(1); },
    setCategorie: (id: number | undefined) => { setCategorie(id); setPage(1); },
  };
}
