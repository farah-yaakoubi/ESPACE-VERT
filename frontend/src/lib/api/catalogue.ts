// src/lib/api/catalogue.ts
import type { MarqueTree, CategorieListItem } from "@/types/catalogue";

// API_URL est disponible uniquement côté serveur (SSR / Server Components).
// Fallback sur NEXT_PUBLIC_API_URL pour la compatibilité client.
const API_BASE =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000/api";

/**
 * Récupère l'arbre complet d'une marque (côté serveur, SSG/SSR).
 * GET /api/public/marques/:slug/tree
 */
export async function fetchMarqueTree(slug: string): Promise<MarqueTree | null> {
  try {
    const res = await fetch(`${API_BASE}/marques/${slug}/tree`, {
      next: { revalidate: 60 },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as MarqueTree;
  } catch {
    return null;
  }
}

/**
 * Liste plate des catégories, optionnellement filtrée par marque.
 * GET /api/public/categories?id_marque=X&tree=false
 */
export async function fetchCategories(params?: {
  id_marque?: number;
  id_activite?: number;
  tree?: boolean;
}): Promise<CategorieListItem[]> {
  try {
    const qs = new URLSearchParams();
    if (params?.id_marque)   qs.set("id_marque",   String(params.id_marque));
    if (params?.id_activite) qs.set("id_activite", String(params.id_activite));
    if (params?.tree)        qs.set("tree", "true");

    const res = await fetch(`${API_BASE}/categories?${qs.toString()}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data as CategorieListItem[];
  } catch {
    return [];
  }
}