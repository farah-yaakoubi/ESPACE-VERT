// lib/api.ts — version finale alignée backend v2

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export interface ApiMeta {
  total: number;
  page:  number;
  pages: number;
  limit: number;
}

async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; error?: string; meta?: ApiMeta }> {
  try {
    const res  = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.error ?? `Erreur ${res.status}` };
    return json;
  } catch {
    return { success: false, error: "Impossible de joindre le serveur." };
  }
}

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface ProduitImagePublic { url: string; alt: string | null; ordre: number; is_principale?: boolean; }

export interface ProduitPublic {
  id_produit:      number;
  nom:             string;
  slug:            string;
  description:     string | null;
  fiche_technique: string | null;
  division:        string;
  tags:            unknown;
  created_at:      string;
  marque:          { nom: string; slug: string; logo: string | null };
  categorie:       { nom: string; slug: string; parent?: { nom: string; slug: string } | null };
  images:          ProduitImagePublic[];
}

export interface MarquePublic {
  id_marque:   number;
  nom:         string;
  slug:        string;
  logo:        string | null;
  description: string | null;
  actif:       boolean;
}

export interface CategoriePublic {
  id_categorie: number;
  nom:          string;
  slug:         string;
  description:  string | null;
  image:        string | null;
  id_marque:    number | null;
  id_activite:  number | null;
  parent_id:    number | null;
}

export interface ActualitePublic {
  id_actualite: number;
  titre:        string;
  slug:         string;
  image:        string | null;
  published_at: string | null;
  created_at:   string;
  contenu:      string;
  publiee:      boolean;
}

export interface FaqPublic {
  id_faq:    number;
  question:  string;
  reponse:   string;
  categorie: string | null;
  ordre:     number;
}

export interface ContactPayload  { nom: string; email: string; sujet?: string; message: string; token_visiteur?: string; }
export interface RdvPayload       { nom: string; email: string; telephone?: string; date_souhaitee: string; heure?: string; objet?: string; agence?: string; message?: string; token_visiteur?: string; }
export interface DevisPayload     { nom: string; email: string; telephone?: string; message?: string; id_produit?: number; token_visiteur?: string; }
export interface TrackPayload     { token_visiteur?: string; url?: string; titre?: string; duree?: number; }

// ─── PRODUITS ─────────────────────────────────────────────────────────────────

export interface ProduitsParams {
  page?:         number;
  limit?:        number;
  id_marque?:    number;
  id_categorie?: number;
  marque?:       string;   // slug de marque
  division?:     string;
  search?:       string;
}

export async function getProduits(params?: ProduitsParams) {
  const qs = new URLSearchParams();
  if (params?.page)         qs.set("page",         String(params.page));
  if (params?.limit)        qs.set("limit",        String(params.limit));
  if (params?.id_marque)    qs.set("id_marque",    String(params.id_marque));
  if (params?.id_categorie) qs.set("id_categorie", String(params.id_categorie));
  if (params?.marque)       qs.set("marque",       params.marque);
  if (params?.division)     qs.set("division",     params.division);
  if (params?.search)       qs.set("search",       params.search);
  return apiFetch<ProduitPublic[]>(`/produits?${qs}`);
}

export async function getProduitBySlug(slug: string) {
  return apiFetch<ProduitPublic>(`/produits/${slug}`);
}

// ─── MARQUES ──────────────────────────────────────────────────────────────────

export async function getMarques() {
  return apiFetch<MarquePublic[]>("/marques");
}

export async function getMarqueBySlug(slug: string) {
  return apiFetch<MarquePublic & { categories: CategoriePublic[]; produits: ProduitPublic[] }>(`/marques/${slug}`);
}

// ─── CATÉGORIES ───────────────────────────────────────────────────────────────

export async function getCategories(params?: { id_marque?: number; id_activite?: number }) {
  const qs = new URLSearchParams();
  if (params?.id_marque)   qs.set("id_marque",   String(params.id_marque));
  if (params?.id_activite) qs.set("id_activite", String(params.id_activite));
  return apiFetch<CategoriePublic[]>(`/categories?${qs}`);
}

// ─── ACTUALITÉS ───────────────────────────────────────────────────────────────

export async function getActualites(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.page)  qs.set("page",  String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  return apiFetch<ActualitePublic[]>(`/actualites?${qs}`);
}

export async function getActualiteBySlug(slug: string) {
  return apiFetch<ActualitePublic>(`/actualites/${slug}`);
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export async function getFaqs(params?: { categorie?: string }) {
  const qs = new URLSearchParams();
  if (params?.categorie) qs.set("categorie", params.categorie);
  return apiFetch<FaqPublic[]>(`/faq?${qs}`);
}

// ─── FORMULAIRES ──────────────────────────────────────────────────────────────

export function sendContact(data: ContactPayload) {
  return apiFetch("/contact", { method: "POST", body: JSON.stringify(data) });
}

export function sendRendezVous(data: RdvPayload) {
  return apiFetch("/rdv",     { method: "POST", body: JSON.stringify(data) });
}

export function sendDevis(data: DevisPayload) {
  return apiFetch("/devis",   { method: "POST", body: JSON.stringify(data) });
}

export async function getCreneaux(): Promise<string[]> {
  const res = await apiFetch<string[]>("/rdv/creneaux");
  return res.data ?? [];
}

// ─── VISITEUR ─────────────────────────────────────────────────────────────────

export async function trackVisiteur(data: TrackPayload): Promise<string | null> {
  const res = await apiFetch<never>("/visiteurs/track", { method: "POST", body: JSON.stringify(data) });
  return (res as any).token_visiteur ?? (res as any).data?.token_visiteur ?? null;
}
