"use client";
// app/[locale]/marques/fertivert/components/FertivertData.tsx
// Charge TOUTES les données depuis le backend Express — aucune donnée statique

import { useEffect, useState, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ProduitImage {
  id_imgp: number;
  url: string;
  alt: string | null;
  is_principale: boolean;
}

export interface Produit {
  id_produit:      number;
  nom:             string;
  slug:            string;
  description:     string | null;
  fiche_technique: string | null;
  division:        string; // "pro" | "garden"
  tags:            string[];
  ordre:           number;
  actif:           boolean;
  categorie:       { id_categorie: number; nom: string; slug: string; parent?: { nom: string; slug: string } | null };
  marque:          { nom: string; slug: string };
  images:          ProduitImage[];
}

export interface Categorie {
  id_categorie: number;
  nom:          string;
  slug:         string;
  description:  string | null;
  parent_id:    number | null;
  sous_cats?:   Categorie[];
  produits?:    Produit[];
  _count?:      { produits: number };
}

export interface FertivertData {
  produits:   Produit[];
  categories: Categorie[];
  loading:    boolean;
  error:      string | null;
}

/**
 * Division — objet de configuration UI pour Fertivert Pro / Garden
 * Utilisé par FertivertFooterCTA et les composants visuels
 */
export interface Division {
  id:       "pro" | "garden";
  label:    string;
  heroGrad: string;   // gradient CSS pour le fond hero/footer
  dark:     string;   // couleur foncée (texte, boutons)
  light:    string;   // couleur claire (badges, fonds)
  badge:    string;   // fond badge
  badgeText:string;   // texte badge
}

/** Configurations des deux divisions Fertivert */
export const DIVISIONS: Record<"pro" | "garden", Division> = {
  pro: {
    id:        "pro",
    label:     "Fertivert Pro",
    heroGrad:  "linear-gradient(135deg, #0a6030 0%, #2d5a1b 55%, #4a7c2f 100%)",
    dark:      "#0a6030",
    light:     "#f0f9eb",
    badge:     "#dcfce7",
    badgeText: "#166534",
  },
  garden: {
    id:        "garden",
    label:     "Fertivert Garden",
    heroGrad:  "linear-gradient(135deg, #2d5a1b 0%, #4a7c2f 55%, #6b9e3e 100%)",
    dark:      "#2d5a1b",
    light:     "#f5fdf0",
    badge:     "#d9f99d",
    badgeText: "#365314",
  },
};

// ─── API helpers ──────────────────────────────────────────────────────────────

/**
 * Récupère les produits Fertivert depuis la route publique /api/produits
 * CORRECTION : on utilise uniquement la route publique, pas /admin/
 */
async function fetchProduits(division?: string): Promise<Produit[]> {
  const qs = new URLSearchParams({ limit: "200" });
  if (division) qs.set("division", division);

  const res  = await fetch(`${API_BASE}/produits?${qs}`);
  if (!res.ok) throw new Error(`Erreur serveur : ${res.status}`);

  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? "Erreur inconnue");

  // Filtrer côté client pour ne garder que les produits Fertivert
  return (json.data as Produit[]).filter(
    (p) => p.marque?.slug?.toLowerCase() === "fertivert"
  );
}

// ─── Main hook ────────────────────────────────────────────────────────────────
export function useFertivertData(division?: "pro" | "garden"): FertivertData {
  const [produits,   setProduits]   = useState<Produit[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const prods = await fetchProduits(division);
      setProduits(prods);

      // Construire l'arbre de catégories à partir des produits
      const catMap = new Map<number, Categorie>();
      prods.forEach((p) => {
        const c = p.categorie;
        if (!catMap.has(c.id_categorie)) {
          catMap.set(c.id_categorie, {
            id_categorie: c.id_categorie,
            nom:          c.nom,
            slug:         c.slug,
            description:  null,
            parent_id:    null,
            produits:     [],
            _count:       { produits: 0 },
          });
        }
        catMap.get(c.id_categorie)!.produits!.push(p);
        catMap.get(c.id_categorie)!._count!.produits++;
      });

      setCategories(Array.from(catMap.values()));
    } catch (e: any) {
      setError(e.message ?? "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [division]);

  useEffect(() => { load(); }, [load]);

  return { produits, categories, loading, error };
}

// ─── Hook pour un seul produit ────────────────────────────────────────────────
export function useProduit(slug: string) {
  const [produit, setProduit] = useState<Produit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API_BASE}/produits/${slug}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setProduit(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  return { produit, loading };
}

// ─── Utilitaires ──────────────────────────────────────────────────────────────

/** Groupe les produits par catégorie nom */
export function groupByCategorie(produits: Produit[]): Record<string, Produit[]> {
  return produits.reduce<Record<string, Produit[]>>((acc, p) => {
    const key = p.categorie.nom;
    (acc[key] = acc[key] ?? []).push(p);
    return acc;
  }, {});
}

/** Filtre les produits par texte (nom, description, tags) */
export function filterProduits(produits: Produit[], q: string): Produit[] {
  if (!q.trim()) return produits;
  const lq = q.toLowerCase();
  return produits.filter(
    (p) =>
      p.nom.toLowerCase().includes(lq) ||
      p.description?.toLowerCase().includes(lq) ||
      p.tags.some((t) => t.toLowerCase().includes(lq)) ||
      p.categorie.nom.toLowerCase().includes(lq)
  );
}

/** Trie les produits par ordre */
export function sortByOrdre(produits: Produit[]): Produit[] {
  return [...produits].sort((a, b) => a.ordre - b.ordre);
}