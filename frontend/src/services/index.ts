// src/services/index.ts
import { get, post, unwrapOrThrow } from "@/lib/api-client";
import type {
  Marque, MarqueDetail,
  Activite, ActiviteDetail,
  Categorie, CategorieDetail,
  Produit, ProduitCard,
  Actualite, ActualiteDetail,
  ApiMeta,
  CreateDevisPayload,
  CreateContactPayload,
  CreateRdvPayload,
} from "@/types/api";

// ── Marques ───────────────────────────────────────────────────────────────────

export const marquesService = {
  list:    () => unwrapOrThrow(get<Marque[]>("/marques", { revalidate: 300 })),
  bySlug:  (slug: string) =>
    unwrapOrThrow(get<MarqueDetail>(`/marques/${slug}`, { revalidate: 300 })),
};

// ── Activites ─────────────────────────────────────────────────────────────────

export const activitesService = {
  list:    () => unwrapOrThrow(get<Activite[]>("/activites", { revalidate: 300 })),
  bySlug:  (slug: string) =>
    unwrapOrThrow(get<ActiviteDetail>(`/activites/${slug}`, { revalidate: 300 })),
};

// ── Categories ────────────────────────────────────────────────────────────────

export const categoriesService = {
  list: (params: { id_marque?: number; id_activite?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.id_marque)   qs.set("id_marque",   String(params.id_marque));
    if (params.id_activite) qs.set("id_activite",  String(params.id_activite));
    const q = qs.toString();
    return unwrapOrThrow(
      get<Categorie[]>(`/categories${q ? `?${q}` : ""}`, { revalidate: 300 })
    );
  },
  bySlug: (slug: string) =>
    get<CategorieDetail>(`/categories/${slug}`, { revalidate: 60 }),
};

// ── Produits ──────────────────────────────────────────────────────────────────

export interface ProduitsListResult {
  data: ProduitCard[];
  meta: ApiMeta;
}

export const produitsService = {
  list: async (params: {
    page?:         number;
    limit?:        number;
    id_marque?:    number;
    id_activite?:  number;   // ← backend accepte ?id_activite= via categories
    id_categorie?: number;
    division?:     string;
    search?:       string;
  } = {}): Promise<ProduitsListResult> => {
    const qs = new URLSearchParams();
    if (params.page)         qs.set("page",         String(params.page));
    if (params.limit)        qs.set("limit",         String(params.limit));
    if (params.id_marque)    qs.set("id_marque",     String(params.id_marque));
    if (params.id_activite)  qs.set("id_activite",   String(params.id_activite));
    if (params.id_categorie) qs.set("id_categorie",  String(params.id_categorie));
    if (params.division)     qs.set("division",      params.division);
    if (params.search)       qs.set("search",        params.search);
    const q = qs.toString();
    const res = await get<ProduitCard[]>(`/produits${q ? `?${q}` : ""}`, { revalidate: 60 });
    if (!res.success) throw new Error(res.error);
    return { data: res.data, meta: res.meta! };
  },

  bySlug: (slug: string) =>
    unwrapOrThrow(get<Produit>(`/produits/${slug}`, { revalidate: 60 })),
};

// ── Actualites ────────────────────────────────────────────────────────────────

export interface ActualitesListResult {
  data: Actualite[];
  meta: ApiMeta;
}

export const actualitesService = {
  list: async (page = 1, limit = 9): Promise<ActualitesListResult> => {
    const res = await get<Actualite[]>(`/actualites?page=${page}&limit=${limit}`, { revalidate: 120 });
    if (!res.success) throw new Error(res.error);
    return { data: res.data, meta: res.meta! };
  },
  bySlug: (slug: string) =>
    unwrapOrThrow(get<ActualiteDetail>(`/actualites/${slug}`, { revalidate: 120 })),
};

// ── DevisDemande ──────────────────────────────────────────────────────────────

export const devisService = {
  create: (payload: CreateDevisPayload) =>
    post<{ id_devis: number }>("/devis", payload),
};

// ── ContactMessage ────────────────────────────────────────────────────────────

export const contactService = {
  send: (payload: CreateContactPayload) =>
    post<{ id_contact: number }>("/contact", payload),
};

// ── RendezVous ────────────────────────────────────────────────────────────────

export const rdvService = {
  creneaux: () => unwrapOrThrow(get<string[]>("/rdv/creneaux")),
  book:     (payload: CreateRdvPayload) =>
    post<{ id_rdv: number }>("/rdv", payload),
};