import type { ProduitImage } from "@/types/api";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// ── Token store ───────────────────────────────────────────────────────────────
export const tokenStore = {
  get:        () => (typeof window !== "undefined" ? localStorage.getItem("ev_admin_token") ?? "" : ""),
  set:        (t: string) => typeof window !== "undefined" && localStorage.setItem("ev_admin_token", t),
  clear:      () => typeof window !== "undefined" && (localStorage.removeItem("ev_admin_token"), localStorage.removeItem("ev_admin_refresh")),
  getRefresh: () => (typeof window !== "undefined" ? localStorage.getItem("ev_admin_refresh") ?? "" : ""),
  setRefresh: (t: string) => typeof window !== "undefined" && localStorage.setItem("ev_admin_refresh", t),
  getAdmin:   (): Admin | null => {
    if (typeof window === "undefined") return null;
    try { return JSON.parse(localStorage.getItem("ev_admin_info") ?? "null"); } catch { return null; }
  },
  setAdmin: (a: Admin) => typeof window !== "undefined" && localStorage.setItem("ev_admin_info", JSON.stringify(a)),
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseResponse<T>(json: any): T {
  if (json.meta !== undefined) return { data: json.data, meta: json.meta } as T;
  return (json.data !== undefined ? json.data : json) as T;
}

let _refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  // Éviter les appels parallèles de refresh
  if (_refreshing) return _refreshing;
  _refreshing = (async () => {
    try {
      const refresh_token = tokenStore.getRefresh();
      if (!refresh_token) return false;
      const res = await fetch(`${BASE}/admin/auth/refresh`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ refresh_token }),
        cache:   "no-store",
      });
      if (!res.ok) return false;
      const json = await res.json();
      const data = json.data ?? json;
      if (data.access_token) {
        tokenStore.set(data.access_token);
        if (data.refresh_token) tokenStore.setRefresh(data.refresh_token);
        return true;
      }
      return false;
    } catch { return false; }
    finally  { _refreshing = null; }
  })();
  return _refreshing;
}

// ── Requête de base avec refresh automatique ─────────────────────────────────
// Access token expire en 15 min → sur 401, on tente le refresh puis on réessaie.
// Si le refresh échoue → on redirige vers /admin/login.
async function request<T>(path: string, init: RequestInit = {}, auth = true): Promise<T> {
  const buildHeaders = () => {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string>),
    };
    if (auth) {
      const token = tokenStore.get();
      if (token) h["Authorization"] = `Bearer ${token}`;
    }
    return h;
  };

  let res = await fetch(`${BASE}${path}`, { ...init, headers: buildHeaders(), cache: "no-store" });

  // 401 → tenter le refresh puis réessayer une seule fois
  if (res.status === 401 && auth) {
    const ok = await tryRefresh();
    if (ok) {
      res = await fetch(`${BASE}${path}`, { ...init, headers: buildHeaders(), cache: "no-store" });
    } else {
      // Refresh impossible → déconnecter proprement
      tokenStore.clear();
      if (typeof window !== "undefined") window.location.href = "/admin/login";
      throw new Error("Session expirée, veuillez vous reconnecter.");
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error ?? err.message ?? `Erreur ${res.status}`);
  }

  return parseResponse<T>(await res.json());
}

// ── Auth ──────────────────────────────────────────────────────────────────────
// IMPORTANT: backend LoginSchema → { email, password }
export const adminAuth = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, false),
  me:     () => request<Admin>("/admin/auth/me"),
  logout: (refresh_token: string) =>
    request<void>("/admin/auth/logout", { method: "POST", body: JSON.stringify({ refresh_token }) }),
  changePassword: (current_password: string, new_password: string) =>
    request<void>("/admin/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ current_password, new_password }),
    }),
};

// ── Stats ─────────────────────────────────────────────────────────────────────
export const adminStats = {
  dashboard: () => request<DashboardStats>("/admin/stats"),
};

// ── Devis ─────────────────────────────────────────────────────────────────────
export const adminDevis = {
  list:    (p?: Record<string, string>) =>
    request<PaginatedResponse<DevisItem>>(`/admin/devis${qs(p)}`),
  getById: (id: number) => request<DevisItem>(`/admin/devis/${id}`),
  update:  (id: number, data: Partial<{ statut: string; reponse_admin: string; note_interne: string }>) =>
    request<DevisItem>(`/admin/devis/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove:  (id: number) => request<void>(`/admin/devis/${id}`, { method: "DELETE" }),
};

// ── RDV ───────────────────────────────────────────────────────────────────────
export const adminRdv = {
  list:    (p?: Record<string, string>) =>
    request<PaginatedResponse<RdvItem>>(`/admin/rdv${qs(p)}`),
  getById: (id: number) => request<RdvItem>(`/admin/rdv/${id}`),
  update:  (id: number, data: Partial<{ statut: string; note_interne: string }>) =>
    request<RdvItem>(`/admin/rdv/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

// ── Messages de contact ───────────────────────────────────────────────────────
// IMPORTANT: backend monté sur /api/admin/messages (PAS /admin/contact)
export const adminContact = {
  list:    (p?: Record<string, string>) =>
    request<PaginatedResponse<ContactItem>>(`/admin/messages${qs(p)}`),
  getById: (id: number) => request<ContactItem>(`/admin/messages/${id}`),
  reply:   (id: number, reponse: string) =>
    request<ContactItem>(`/admin/messages/${id}/reply`, {
      method: "POST",
      body: JSON.stringify({ reponse }),
    }),
  remove:  (id: number) => request<void>(`/admin/messages/${id}`, { method: "DELETE" }),
};

// ── Produits ──────────────────────────────────────────────────────────────────
export const adminProduits = {
  list:   (p?: Record<string, string>) =>
    request<PaginatedResponse<ProduitAdmin>>(`/admin/produits${qs(p)}`),
  toggle: (id: number, actif: boolean) =>
    request<ProduitAdmin>(`/admin/produits/${id}`, { method: "PUT", body: JSON.stringify({ actif }) }),
  remove: (id: number) => request<void>(`/admin/produits/${id}`, { method: "DELETE" }),
};

// ── Actualités ────────────────────────────────────────────────────────────────
export const adminActualites = {
  list:   (p?: Record<string, string>) =>
    request<PaginatedResponse<ActualiteAdmin>>(`/admin/actualites${qs(p)}`),
  toggle: (id: number, publiee: boolean) =>
    request<ActualiteAdmin>(`/admin/actualites/${id}`, { method: "PUT", body: JSON.stringify({ publiee }) }),
  remove: (id: number) => request<void>(`/admin/actualites/${id}`, { method: "DELETE" }),
};

// ── Gestion des administrateurs (superAdmin seulement) ────────────────────────
export const adminAdmins = {
  list:    () => request<AdminUser[]>("/admin/admins"),
  getRoles:() => request<Role[]>("/admin/admins/roles"),
  create:  (data: { nom: string; email: string; password: string; id_role: number }) =>
    request<AdminUser>("/admin/admins", { method: "POST", body: JSON.stringify(data) }),
  update:  (id: number, data: Partial<{ nom: string; email: string; password: string; id_role: number; actif: boolean }>) =>
    request<AdminUser>(`/admin/admins/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove:  (id: number) => request<void>(`/admin/admins/${id}`, { method: "DELETE" }),
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function qs(p?: Record<string, string>): string {
  return p && Object.keys(p).length > 0 ? "?" + new URLSearchParams(p) : "";
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Admin {
  id_admin: number;
  nom:      string;
  email:    string;
  actif:    boolean;
  id_role:  number;
  role?:    { nom: string };
}

/** Vrai si le compte est superAdmin (role 1) */
export function isSuperAdmin(admin: Admin | null): boolean {
  return admin?.id_role === 1;
}

export interface LoginResponse {
  access_token:  string;
  refresh_token: string;
  admin:         Admin;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; pages: number; limit: number };
}

export interface DashboardStats {
  catalogue: { produits: number; marques: number; categories: number; activites: number; actualites: number; faqs: number };
  devis:     { par_statut: Record<string, number>; total: number };
  rdv:       { par_statut: Record<string, number>; total: number };
  messages:  { non_lus: number };
  recents:   { devis: DevisRecent[]; rdv: RdvRecent[]; messages: ContactRecent[] };
}

export interface DevisItem {
  id_devis:      number;
  nom:           string;
  email:         string;
  telephone?:    string;
  message?:      string;
  reponse_admin?: string;
  note_interne?: string;
  statut:        string;
  id_produit?:   number;
  produit?:      { nom: string };
  created_at:    string;
  updated_at:    string;
}

export interface RdvItem {
  id_rdv:         number;
  nom:            string;
  email:          string;
  telephone?:     string;
  date_souhaitee: string;
  heure?:         string;
  objet?:         string;
  agence?:        string;
  message?:       string;
  statut:         string;
  note_interne?:  string;
  created_at:     string;
}

export interface ContactItem {
  id_contact:  number;
  nom:         string;
  email:       string;
  sujet?:      string;
  message:     string;
  reponse?:    string;
  lu:          boolean;
  created_at:  string;
  replied_at?: string;
}

export interface ProduitAdmin {
  id_produit: number;
  nom:        string;
  slug:       string;
  actif:      boolean;
  division:   string;
  ordre:      number;
  created_at: string;
  fiche_technique?: string | null;
  id_activite?: number | null;
  marque:     { nom: string; slug: string };
  categorie:  { nom: string; slug: string };
  activite?:  { nom: string; slug: string } | null;
  images:     ProduitImage[];
}

export interface ActualiteAdmin {
  id_actualite: number;
  titre:        string;
  slug:         string;
  publiee:      boolean;
  published_at?: string;
  image?:       string;
  created_at:   string;
  updated_at:   string;
}

export interface AdminUser {
  id_admin:   number;
  nom:        string;
  email:      string;
  actif:      boolean;
  id_role:    number;
  created_at: string;
  role:       { nom: string };
}

export interface Role {
  id_role:     number;
  nom:         string;
  permissions: string[];
}

export interface DevisRecent   { id_devis: number; nom: string; email: string; statut: string; created_at: string; produit?: { nom: string } }
export interface RdvRecent     { id_rdv: number; nom: string; date_souhaitee: string; statut: string; agence?: string }
export interface ContactRecent { id_contact: number; nom: string; sujet?: string; lu: boolean; created_at: string }

// ── Marques ───────────────────────────────────────────────────────────────────
export const adminMarques = {
  list:   () => request<MarqueAdmin[]>("/admin/marques"),
  create: (data: { nom: string; slug: string; description?: string | null; logo?: string | null }) =>
    request<MarqueAdmin>("/admin/marques", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<{ nom: string; slug: string; description: string | null; logo: string | null; actif: boolean }>) =>
    request<MarqueAdmin>(`/admin/marques/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: number) => request<void>(`/admin/marques/${id}`, { method: "DELETE" }),
};

// ── Activites ─────────────────────────────────────────────────────────────────
export const adminActivites = {
  list:   () => request<ActiviteAdmin[]>("/admin/activites"),
  create: (data: { nom: string; slug: string; description?: string | null; image?: string | null; ordre?: number }) =>
    request<ActiviteAdmin>("/admin/activites", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<{ nom: string; slug: string; description: string | null; image: string | null; ordre: number; actif: boolean }>) =>
    request<ActiviteAdmin>(`/admin/activites/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: number) => request<void>(`/admin/activites/${id}`, { method: "DELETE" }),
};

// ── Categories ────────────────────────────────────────────────────────────────
export const adminCategories = {
  list:   (p?: Record<string, string>) => request<CategorieAdmin[]>(`/admin/categories${qs(p)}`),
  create: (data: { nom: string; slug: string; description?: string | null; image?: string | null; id_activite?: number | null; id_marque?: number | null; parent_id?: number | null; ordre?: number }) =>
    request<CategorieAdmin>("/admin/categories", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<{ nom: string; slug: string; description: string | null; image: string | null; id_activite: number | null; id_marque: number | null; parent_id: number | null; ordre: number; actif: boolean }>) =>
    request<CategorieAdmin>(`/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: number) => request<void>(`/admin/categories/${id}`, { method: "DELETE" }),
};

// ── FAQ ───────────────────────────────────────────────────────────────────────
export const adminFaq = {
  list:   (p?: Record<string, string>) => request<FaqAdmin[]>(`/admin/faq${qs(p)}`),
  create: (data: { question: string; reponse: string; categorie?: string | null; ordre?: number; active?: boolean }) =>
    request<FaqAdmin>("/admin/faq", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<{ question: string; reponse: string; categorie: string | null; ordre: number; active: boolean }>) =>
    request<FaqAdmin>(`/admin/faq/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: number) => request<void>(`/admin/faq/${id}`, { method: "DELETE" }),
};

// ── Produits CRUD complet ─────────────────────────────────────────────────────
export const adminProduitsCreate = {
  create: (data: { nom: string; slug: string; id_categorie: number; id_marque?: number | null; id_activite?: number | null; division?: string; description?: string | null; fiche_technique?: string | null; ordre?: number }) =>
    request<ProduitAdmin>("/admin/produits", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<{ nom: string; slug: string; id_categorie: number; id_marque: number | null; id_activite: number | null; division: string; description: string | null; fiche_technique: string | null; actif: boolean; ordre: number }>) =>
    request<ProduitAdmin>(`/admin/produits/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

// ── Upload fichiers ───────────────────────────────────────────────
// Utilise FormData (pas Content-Type: application/json)
async function uploadFile(path: string, file: File): Promise<{ url: string; filename: string; size: number }> {
  const form = new FormData();
  form.append("file", file);
  const token = tokenStore.get();
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error ?? `Erreur ${res.status}`);
  }
  const json = await res.json();
  return json.data ?? json;
}

export const adminUpload = {
  image:          (file: File) => uploadFile("/admin/upload/image", file),
  pdf:            (file: File) => uploadFile("/admin/upload/pdf", file),
  produitImage:   (id: number, file: File, alt?: string, isPrinc = false, conditionnement?: string) => {
    const form = new FormData();
    form.append("file", file);
    if (alt)              form.append("alt", alt);
    form.append("is_principale", String(isPrinc));
    if (conditionnement)  form.append("conditionnement", conditionnement);
    const token = tokenStore.get();
    return fetch(`${BASE}/admin/produits/${id}/images/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then(async r => {
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error ?? `Erreur ${r.status}`); }
      const j = await r.json(); return (j.data ?? j) as ProduitImage;
    });
  },
  produitFiche: (id: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    const token = tokenStore.get();
    return fetch(`${BASE}/admin/produits/${id}/fiche-technique`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then(async r => {
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error ?? `Erreur ${r.status}`); }
      const j = await r.json(); return (j.data ?? j) as { url: string };
    });
  },
};

// ── Visiteurs + Statistiques comportement ─────────────────────────────────────
export const adminVisiteurs = {
  list:     (p?: Record<string, string>) => request<PaginatedResponse<VisiteurItem>>(`/admin/visiteurs${qs(p)}`),
  getById:  (id: number)                 => request<VisiteurDetail>(`/admin/visiteurs/${id}`),
  getStats: (days = 30)                  => request<VisiteurStats>(`/admin/visiteurs/stats?days=${days}`),
};

// ── Actualites CRUD complet ───────────────────────────────────────────────────
export const adminActualitesCreate = {
  create: (data: { titre: string; slug: string; contenu: string; image?: string | null; publiee?: boolean }) =>
    request<ActualiteAdmin>("/admin/actualites", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: Partial<{ titre: string; slug: string; contenu: string; image: string | null; publiee: boolean }>) =>
    request<ActualiteAdmin>(`/admin/actualites/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  getById: (id: number) => request<ActualiteDetail>(`/admin/actualites/${id}`),
};

// ── Nouveaux types ────────────────────────────────────────────────────────────
export interface MarqueAdmin {
  id_marque:   number;
  nom:         string;
  slug:        string;
  logo:        string | null;
  description: string | null;
  actif:       boolean;
  created_at:  string;
  _count?:     { produits: number; categories: number };
}

export interface ActiviteAdmin {
  id_activite: number;
  nom:         string;
  slug:        string;
  description: string | null;
  image:       string | null;
  ordre:       number;
  actif:       boolean;
  created_at:  string;
}

export interface CategorieAdmin {
  id_categorie: number;
  nom:          string;
  slug:         string;
  description:  string | null;
  image:        string | null;
  id_activite:  number | null;
  id_marque:    number | null;
  parent_id:    number | null;
  ordre:        number;
  actif:        boolean;
  created_at:   string;
  activite?:    { nom: string } | null;
  marque?:      { nom: string } | null;
  parent?:      { nom: string } | null;
}

export interface FaqAdmin {
  id_faq:     number;
  question:   string;
  reponse:    string;
  categorie:  string | null;
  ordre:      number;
  active:     boolean;
  created_at: string;
}

export interface ActualiteDetail extends ActualiteAdmin {
  contenu: string;
}

// ── Types Visiteurs ───────────────────────────────────────────────────────────
export interface VisiteurItem {
  id_visiteur:    number;
  token_visiteur: string;
  ip_address:     string;
  pays:           string | null;
  region:         string | null;
  first_visit:    string;
  last_visit:     string;
  _count: { visites_pages: number; devis: number; rendez_vous: number; search_queries: number };
}

export interface VisiteurDetail extends VisiteurItem {
  user_agent:     string | null;
  visites_pages:  { id_vp: number; url: string; titre: string | null; duree: number; visited_at: string }[];
  search_queries: { id_search: number; query: string; nb_results: number; searched_at: string }[];
  devis:          { id_devis: number; nom: string; created_at: string }[];
  rendez_vous:    { id_rdv: number; nom: string; date_souhaitee: string }[];
  messages:       { id_contact: number; nom: string; sujet: string | null; created_at: string }[];
}

export interface VisiteurStats {
  totalVisiteurs:  number;
  visiteursActifs: number;
  totalPages:      number;
  avgDuree:        number;
  topPages:        { url: string; titre: string; vues: number; duree: number }[];
  paysStats:       { pays: string; count: number }[];
  searchStats:     { query: string; count: number }[];
  faqStats:        { id_faq: number; question: string; categorie: string | null; nb_consultations: number }[];
}

// ── Types ProduitAdmin enrichi ────────────────────────────────────────────────
export interface ProduitAdminV2 extends ProduitAdmin {
  activite?: { nom: string; slug: string } | null;
  id_activite?: number | null;
}