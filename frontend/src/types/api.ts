// ─────────────────────────────────────────────────────────────────────────────
// src/types/api.ts
// Exact mirrors of Prisma models as returned by the backend public endpoints.
// Field names match schema.prisma exactly — zero invented fields.
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared ────────────────────────────────────────────────────────────────────

export interface ApiMeta {
  total: number;
  page:  number;
  pages: number;
  limit: number;
}

export interface ApiSuccess<T> {
  success: true;
  data:    T;
  meta?:   ApiMeta;
}

export interface ApiError {
  success: false;
  error:   string;
  data?:   never;   // guarantees data is absent on error branch
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ── Marque  (GET /api/marques, GET /api/marques/:slug) ────────────────────────

export interface Marque {
  id_marque:   number;
  nom:         string;
  slug:        string;
  logo:        string | null;
  banniere:    string | null;
  description: string | null;
  actif:       boolean;
}

/** Shape returned by GET /api/marques/:slug — includes produits */
export interface MarqueDetail extends Marque {
  categories: MarqueCategorie[];
  produits:   ProduitCard[];   // produits with categorie + 1 image
}

export interface MarqueCategorie {
  id_categorie: number;
  nom:          string;
  slug:         string;
  description:  string | null;
  image:        string | null;
  id_activite:  number | null;
  parent_id:    number | null;
}

// ── Activite  (GET /api/activites) ────────────────────────────────────────────

export interface Activite {
  id_activite: number;
  nom:         string;
  slug:        string;
  description: string | null;
  image:       string | null;
  banniere:    string | null;
  ordre:       number;
  actif:       boolean;
}
/** Shape returned by GET /api/activites/:slug — includes categories + direct produits */
export interface ActiviteDetail extends Activite {
  categories: ActiviteCategorie[];
  produits:   ProduitCard[];
}

export interface ActiviteCategorie {
  id_categorie: number;
  nom:          string;
  slug:         string;
  description:  string | null;
  image:        string | null;
  parent_id:    number | null;
  id_marque:    number | null;
}

// ── Categorie  (GET /api/categories?id_marque=&id_activite=) ─────────────────

export interface Categorie {
  id_categorie: number;
  nom:          string;
  slug:         string;
  description:  string | null;
  image:        string | null;
  id_marque:    number | null;
  id_activite:  number | null;
  parent_id:    number | null;
  ordre:        number;
}

// ── ProduitImage ──────────────────────────────────────────────────────────────

export interface ProduitImage {
  id_imgP?:     number;   // présent dans les réponses admin
  id_produit?:  number;
  url:          string;
  alt:          string | null;
  ordre:        number;
  is_principale?: boolean;
}

// ── ProduitCard  (lightweight — used inside Marque/Activite lists) ────────────

export interface ProduitCard {
  id_categorie:    number;
  id_marque:       number;
  id_produit:      number;
  nom:             string;
  slug:            string;
  description:     string | null;
  fiche_technique: string | null;
  division:        string;
  tags:            unknown;
  created_at:      string;
  categorie:       { nom: string; slug: string };
  images:          { url: string; alt: string | null }[];
}

// ── Produit full detail  (GET /api/produits/:slug) ────────────────────────────

export interface Produit {
  id_produit:      number;
  nom:             string;
  slug:            string;
  description:     string | null;
  fiche_technique: string | null;
  division:        string;
  tags:            string[];
  actif:           boolean;
  ordre:           number;
  created_at:      string;
  updated_at:      string;
  id_categorie:    number;
  id_marque:       number;
  id_activite?:    number | null;
  categorie: {
    id_categorie: number;
    nom:          string;
    slug:         string;
    parent:       { nom: string; slug: string } | null;
    sous_cats:    { nom: string; slug: string }[];
  };
  marque: {
    nom:         string;
    slug:        string;
    logo:        string | null;
    description: string | null;
  };
  activite?: {
    nom:  string;
    slug: string;
  } | null;
  images: ProduitImage[];
}

// ── Actualite  (GET /api/actualites, GET /api/actualites/:slug) ───────────────

export interface Actualite {
  id_actualite: number;
  titre:        string;
  contenu:      string;
  image:        string | null;
  slug:         string;
  publiee:      boolean;
  published_at: string | null;
  created_at:   string;
}

export interface ActualiteDetail extends Actualite {
  admin: { nom: string } | null;
}

// ── DevisDemande  (POST /api/devis) ───────────────────────────────────────────

/** Payload sent by frontend — exact fields expected by backend schema */
export interface CreateDevisPayload {
  nom:             string;
  email:           string;
  telephone?:      string;
  message?:        string;
  id_produit?:     number;      // links to Produit.id_produit
  token_visiteur?: string;
}

// ── ContactMessage  (POST /api/contact) ──────────────────────────────────────

export interface CreateContactPayload {
  nom:             string;
  email:           string;
  sujet?:          string;
  message:         string;
  token_visiteur?: string;
}

// ── RendezVous  (POST /api/rdv) — only for Matar + Irrigation ────────────────

export interface CreateRdvPayload {
  nom:             string;
  email:           string;
  telephone?:      string;
  date_souhaitee:  string;   // YYYY-MM-DD
  heure?:          string;   // e.g. "09:00"
  objet?:          string;
  agence?:         string;
  message?:        string;
  token_visiteur?: string;
}

// ── CategorieDetail  (GET /api/categories/:slug) ─────────────────────────────
// Retourné par findBySlugWithChildren — contient sous-catégories + produits

export interface CategorieDetailProduit {
  id_produit:   number;
  nom:          string;
  slug:         string;
  description:  string | null;
  division:     string;
  tags:         unknown;
  ordre:        number;
  id_categorie: number;
  images:       { url: string; alt: string | null }[];
}

export interface CategorieDetailSousCat {
  id_categorie: number;
  nom:          string;
  slug:         string;
  description:  string | null;
  image:        string | null;
  ordre:        number;
  produits:     CategorieDetailProduit[];
}

export interface CategorieDetail {
  id_categorie: number;
  nom:          string;
  slug:         string;
  description:  string | null;
  image:        string | null;
  parent_id:    number | null;
  parent:       { nom: string; slug: string } | null;
  sous_cats:    CategorieDetailSousCat[];
  produits:     CategorieDetailProduit[];
}