// src/types/catalogue.ts
// Interfaces TypeScript correspondant exactement à la réponse de l'API
// GET /api/public/marques/:slug/tree

// ─── Produit (dans l'arbre) ──────────────────────────────────────────────────

export interface ProduitImage {
  url: string;
  alt: string | null;
}

export type LocaleCode = "fr" | "ar" | "en";
export type EntityTranslations = Partial<Record<LocaleCode, Record<string, string | null>>>;

export interface ProduitInTree {
  id_produit:   number;
  nom:          string;
  slug:         string;
  description:  string | null;
  translations?: EntityTranslations | null;
  id_categorie: number;
  id_marque:    number | null;
  id_activite:  number | null;
  division:     "standard" | "pro" | "garden";
  tags:         string[] | null;
  ordre:        number;
  marque?:      { nom: string; slug: string; logo?: string | null; translations?: EntityTranslations | null } | null;
  activite?:    { nom: string; slug: string; translations?: EntityTranslations | null } | null;
  images:       ProduitImage[];
}

// ─── Catégorie récursive ─────────────────────────────────────────────────────

export interface CategorieNode {
  id_categorie: number;
  nom:          string;
  slug:         string;
  description:  string | null;
  translations?: EntityTranslations | null;
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
  translations?: EntityTranslations | null;
  categories:  CategorieNode[];
}

// ─── Réponse liste plate ─────────────────────────────────────────────────────

export interface CategorieListItem {
  id_categorie: number;
  nom:          string;
  slug:         string;
  description:  string | null;
  translations?: EntityTranslations | null;
  image:        string | null;
  id_marque:    number | null;
  id_activite:  number | null;
  parent_id:    number | null;
  ordre:        number;
  actif:        boolean;
  marque:       { nom: string; slug: string; translations?: EntityTranslations | null } | null;
  activite:     { nom: string; slug: string; translations?: EntityTranslations | null } | null;
  _count:       { produits: number };
}
