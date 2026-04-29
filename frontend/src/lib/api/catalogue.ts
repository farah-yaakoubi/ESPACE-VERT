// src/lib/api/catalogue.ts
import type { MarqueTree, CategorieListItem } from "@/types/catalogue";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/**
 * Récupère l'arbre complet d'une marque (côté serveur, SSG/SSR).
 * GET /api/public/marques/:slug/tree
 *
 * Utilisez cette fonction dans generateStaticParams() ou dans un
 * Server Component Next.js App Router.
 */
export async function fetchMarqueTree(slug: string): Promise<MarqueTree | null> {
  const res = await fetch(`${API_BASE}/marques/${slug}/tree`, {
    // En production : revalidation toutes les 60 secondes (ISR)
    next: { revalidate: 60 },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`fetchMarqueTree failed: ${res.status}`);

  const json = await res.json();
  return json.data as MarqueTree;
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
  const qs = new URLSearchParams();
  if (params?.id_marque)   qs.set("id_marque",   String(params.id_marque));
  if (params?.id_activite) qs.set("id_activite", String(params.id_activite));
  if (params?.tree)        qs.set("tree", "true");

  const res = await fetch(`${API_BASE}/public/categories?${qs.toString()}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`fetchCategories failed: ${res.status}`);
  const json = await res.json();
  return json.data as CategorieListItem[];
}
