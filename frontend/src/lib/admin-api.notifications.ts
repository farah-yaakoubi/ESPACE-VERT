// ── Notifications & Compte — méthodes supplémentaires ────────────────────────
// Ce fichier étend admin-api.ts avec les endpoints notifications et compte.
// À importer séparément dans les composants qui en ont besoin.

import { tokenStore } from "./admin-api";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...init, headers, cache: "no-store" });
  if (res.status === 401) {
    tokenStore.clear();
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    throw new Error("Session expirée");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? err.message ?? `Erreur ${res.status}`);
  }
  const json = await res.json();
  return (json.data !== undefined ? json.data : json) as T;
}

// ── Notifications ─────────────────────────────────────────────────────────────
// Construit à partir des données existantes (devis, rdv, messages non lus)
// sans nécessiter un endpoint dédié.
export interface Notification {
  id:      string;
  type:    "devis" | "rdv" | "message";
  titre:   string;
  sous:    string;
  href:    string;
  date:    string;
  lu:      boolean;
}

export interface NotifSummary {
  total:    number;
  devis:    number;
  rdv:      number;
  messages: number;
  items:    Notification[];
}

/** Récupère le résumé des notifications depuis /admin/stats */
export async function fetchNotifications(): Promise<NotifSummary> {
  try {
    const stats = await req<any>("/admin/stats");
    const items: Notification[] = [];

    // Devis en attente
    const devisAttente = stats.devis?.par_statut?.["en_attente"] ?? 0;
    if (stats.recents?.devis) {
      for (const d of stats.recents.devis.slice(0, 5)) {
        if (d.statut === "en_attente") {
          items.push({
            id:    `devis-${d.id_devis}`,
            type:  "devis",
            titre: `Nouveau devis — ${d.nom}`,
            sous:  d.produit?.nom ?? d.email,
            href:  "/admin/devis",
            date:  d.created_at,
            lu:    false,
          });
        }
      }
    }

    // RDV en attente
    if (stats.recents?.rdv) {
      for (const r of stats.recents.rdv.slice(0, 5)) {
        if (r.statut === "en_attente") {
          items.push({
            id:    `rdv-${r.id_rdv}`,
            type:  "rdv",
            titre: `RDV demandé — ${r.nom}`,
            sous:  new Date(r.date_souhaitee).toLocaleDateString("fr-FR"),
            href:  "/admin/rdv",
            date:  r.date_souhaitee,
            lu:    false,
          });
        }
      }
    }

    // Messages non lus
    if (stats.recents?.messages) {
      for (const m of stats.recents.messages.slice(0, 5)) {
        if (!m.lu) {
          items.push({
            id:    `msg-${m.id_contact}`,
            type:  "message",
            titre: `Message — ${m.nom}`,
            sous:  m.sujet ?? "Sans sujet",
            href:  "/admin/contact",
            date:  m.created_at,
            lu:    false,
          });
        }
      }
    }

    // Trier par date décroissante
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      total:    items.length,
      devis:    devisAttente,
      rdv:      stats.rdv?.par_statut?.["en_attente"] ?? 0,
      messages: stats.messages?.non_lus ?? 0,
      items:    items.slice(0, 10),
    };
  } catch {
    return { total: 0, devis: 0, rdv: 0, messages: 0, items: [] };
  }
}

// ── Compte admin ───────────────────────────────────────────────────────────────
export const adminCompte = {
  /** Changer le mot de passe */
  changePassword: (current_password: string, new_password: string) =>
    req<void>("/admin/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ current_password, new_password }),
    }),

  /** Mettre à jour son profil (nom) */
  updateProfile: (nom: string) =>
    req<{ id_admin: number; nom: string; email: string }>("/admin/auth/me", {
      method: "PUT",
      body: JSON.stringify({ nom }),
    }),
};