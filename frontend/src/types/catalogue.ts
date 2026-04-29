// src/types/catalogue.ts
// Interfaces TypeScript correspondant exactement à la réponse de l'API
// GET /api/public/marques/:slug/tree

// ─── Produit (dans l'arbre) ──────────────────────────────────────────────────

export interface ProduitImage {
  url: string;
  alt: string | null;
}

export interface ProduitInTree {
  id_produit:   number;
  nom:          string;
  slug:         string;
  description:  string | null;
  id_categorie: number;
  division:     "standard" | "pro" | "garden";
  tags:         string[] | null;
  ordre:        number;
  images:       ProduitImage[];
}

// ─── Catégorie récursive ─────────────────────────────────────────────────────

export interface CategorieNode {
  id_categorie: number;
  nom:          string;
  slug:         string;
  description:  string | null;
  image:        string | null;
  id_marque:    number | null;
  id_activite:  number | null;
  parent_id:    number | null;
  ordre:        number;
  actif:        boolean;
  created_at:   string; // ISO string côté JSON
  // Récursif
  sous_cats:    CategorieNode[];
  // Produits directs du nœud courant (feuille ou intermédiaire)
  produits:     ProduitInTree[];
}

// ─── Réponse arbre marque ────────────────────────────────────────────────────

export interface MarqueTree {
  id_marque:   number;
  nom:         string;
  slug:        string;
  logo:        string | null;
  description: string | null;
  categories:  CategorieNode[];
}

// ─── Réponse liste plate ─────────────────────────────────────────────────────

export interface CategorieListItem {
  id_categorie: number;
  nom:          string;
  slug:         string;
  description:  string | null;
  image:        string | null;
  id_marque:    number | null;
  id_activite:  number | null;
  parent_id:    number | null;
  ordre:        number;
  actif:        boolean;
  marque:       { nom: string; slug: string } | null;
  activite:     { nom: string; slug: string } | null;
  _count:       { produits: number };
}
