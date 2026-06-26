// src/app/api/ai/execute/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Route API Next.js — Exécution d'actions par l'Agent IA
//
// Cette route est appelée par le widget AdminAIAgentWidget et la page chatbot
// quand l'utilisateur confirme une action proposée par l'IA.
//
// Elle :
//  1. Valide le token JWT de l'administrateur
//  2. Vérifie les permissions de l'action demandée
//  3. Exécute l'action via l'API backend (Node/Express)
//  4. Enregistre l'action dans le journal d'audit avec origin="AI_AGENT"
//  5. Retourne le résultat à l'appelant
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AgentAction {
  type:    string;
  label:   string;
  payload: Record<string, any>;
  risk:    "low" | "medium" | "high";
}

interface AdminInfo {
  id_admin: number;
  nom:      string;
  id_role:  number;
  permissions?: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function getAdminInfo(token: string): Promise<AdminInfo | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data ?? data ?? null;
  } catch { return null; }
}

function isSuperAdmin(admin: AdminInfo | null) {
  return admin?.id_role === 1;
}

function hasPermission(admin: AdminInfo | null, perm: string): boolean {
  if (!admin) return false;
  if (isSuperAdmin(admin)) return true;
  return (admin.permissions ?? []).includes(perm);
}

async function logAudit(
  token: string,
  action: string,
  entityName: string,
  entityId: number | null,
  detail: Record<string, any>,
) {
  try {
    await fetch(`${BACKEND_URL}/admin/audit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action,
        entity_name: entityName,
        entity_id: entityId,
        detail: { ...detail, origin: "AI_AGENT" },
      }),
      cache: "no-store",
    });
  } catch (e) {
    console.warn("[AI Execute] Audit log failed:", e);
  }
}

// ─── Exécuteurs par type d'action ─────────────────────────────────────────────
const ACTION_HANDLERS: Record<string, (
  token:   string,
  admin:   AdminInfo,
  payload: Record<string, any>,
) => Promise<{ success: boolean; message: string; entityId?: number }>> = {

  // ── CREATE_PRODUIT ──────────────────────────────────────────────────────────
  async CREATE_PRODUIT(token, admin, payload) {
    if (!hasPermission(admin, "produits.write"))
      return { success: false, message: "Permission refusée : produits.write requis" };

    const res = await fetch(`${BACKEND_URL}/admin/produits`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const data = await res.json();
    const id = data?.data?.id_produit ?? data?.id_produit ?? null;

    if (res.ok) {
      await logAudit(token, "CREATE", "produit", id, { payload, _ai: true });
      return { success: true, message: `Produit "${payload.nom}" créé avec succès (ID #${id}).`, entityId: id };
    }
    return { success: false, message: data?.message ?? `Erreur ${res.status}` };
  },

  // ── UPDATE_PRODUIT ──────────────────────────────────────────────────────────
  async UPDATE_PRODUIT(token, admin, payload) {
    if (!hasPermission(admin, "produits.write"))
      return { success: false, message: "Permission refusée : produits.write requis" };

    const { id_produit, ...fields } = payload;
    const res = await fetch(`${BACKEND_URL}/admin/produits/${id_produit}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(fields),
      cache: "no-store",
    });
    const data = await res.json();

    if (res.ok) {
      await logAudit(token, "UPDATE", "produit", id_produit, { changes: fields, _ai: true });
      return { success: true, message: `Produit #${id_produit} mis à jour.` };
    }
    return { success: false, message: data?.message ?? `Erreur ${res.status}` };
  },

  // ── DELETE_PRODUIT ──────────────────────────────────────────────────────────
  async DELETE_PRODUIT(token, admin, payload) {
    if (!hasPermission(admin, "produits.delete"))
      return { success: false, message: "Permission refusée : produits.delete requis" };

    const res = await fetch(`${BACKEND_URL}/admin/produits/${payload.id_produit}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.ok) {
      await logAudit(token, "DELETE", "produit", payload.id_produit, { nom: payload.nom, _ai: true });
      return { success: true, message: `Produit #${payload.id_produit} supprimé.` };
    }
    return { success: false, message: `Erreur suppression produit (${res.status})` };
  },

  // ── CREATE_ACTUALITE ────────────────────────────────────────────────────────
  async CREATE_ACTUALITE(token, admin, payload) {
    if (!hasPermission(admin, "actualites.write"))
      return { success: false, message: "Permission refusée : actualites.write requis" };

    const res = await fetch(`${BACKEND_URL}/admin/actualites`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const data = await res.json();
    const id = data?.data?.id_actualite ?? data?.id_actualite ?? null;

    if (res.ok) {
      await logAudit(token, "CREATE", "actualite", id, { payload, _ai: true });
      return { success: true, message: `Actualité "${payload.titre}" créée (ID #${id}).`, entityId: id };
    }
    return { success: false, message: data?.message ?? `Erreur ${res.status}` };
  },

  // ── UPDATE_ACTUALITE ────────────────────────────────────────────────────────
  async UPDATE_ACTUALITE(token, admin, payload) {
    if (!hasPermission(admin, "actualites.write"))
      return { success: false, message: "Permission refusée : actualites.write requis" };

    const { id_actualite, ...fields } = payload;
    const res = await fetch(`${BACKEND_URL}/admin/actualites/${id_actualite}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(fields),
      cache: "no-store",
    });
    const data = await res.json();

    if (res.ok) {
      await logAudit(token, "UPDATE", "actualite", id_actualite, { changes: fields, _ai: true });
      return { success: true, message: `Actualité #${id_actualite} mise à jour.` };
    }
    return { success: false, message: data?.message ?? `Erreur ${res.status}` };
  },

  // ── CREATE_FAQ ──────────────────────────────────────────────────────────────
  async CREATE_FAQ(token, admin, payload) {
    if (!hasPermission(admin, "faq.write"))
      return { success: false, message: "Permission refusée : faq.write requis" };

    const res = await fetch(`${BACKEND_URL}/admin/faq`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const data = await res.json();
    const id = data?.data?.id_faq ?? data?.id_faq ?? null;

    if (res.ok) {
      await logAudit(token, "CREATE", "faq", id, { payload, _ai: true });
      return { success: true, message: `FAQ créée (ID #${id}).`, entityId: id };
    }
    return { success: false, message: data?.message ?? `Erreur ${res.status}` };
  },

  // ── UPDATE_FAQ ──────────────────────────────────────────────────────────────
  async UPDATE_FAQ(token, admin, payload) {
    if (!hasPermission(admin, "faq.write"))
      return { success: false, message: "Permission refusée : faq.write requis" };

    const { id_faq, ...fields } = payload;
    const res = await fetch(`${BACKEND_URL}/admin/faq/${id_faq}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(fields),
      cache: "no-store",
    });
    const data = await res.json();

    if (res.ok) {
      await logAudit(token, "UPDATE", "faq", id_faq, { changes: fields, _ai: true });
      return { success: true, message: `FAQ #${id_faq} mise à jour.` };
    }
    return { success: false, message: data?.message ?? `Erreur ${res.status}` };
  },

  // ── DELETE_FAQ ──────────────────────────────────────────────────────────────
  async DELETE_FAQ(token, admin, payload) {
    if (!hasPermission(admin, "faq.write"))
      return { success: false, message: "Permission refusée : faq.write requis" };

    const res = await fetch(`${BACKEND_URL}/admin/faq/${payload.id_faq}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.ok) {
      await logAudit(token, "DELETE", "faq", payload.id_faq, { _ai: true });
      return { success: true, message: `FAQ #${payload.id_faq} supprimée.` };
    }
    return { success: false, message: `Erreur suppression FAQ (${res.status})` };
  },

  // ── UPDATE_DEVIS_STATUS ─────────────────────────────────────────────────────
  async UPDATE_DEVIS_STATUS(token, admin, payload) {
    if (!hasPermission(admin, "devis.write"))
      return { success: false, message: "Permission refusée : devis.write requis" };

    const res = await fetch(`${BACKEND_URL}/admin/devis/${payload.id_devis}/statut`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ statut: payload.statut }),
      cache: "no-store",
    });
    const data = await res.json();

    if (res.ok) {
      await logAudit(token, "STATUS_CHANGE", "devis", payload.id_devis, { statut: payload.statut, _ai: true });
      return { success: true, message: `Devis #${payload.id_devis} → ${payload.statut}` };
    }
    return { success: false, message: data?.message ?? `Erreur ${res.status}` };
  },

  // ── UPDATE_RDV_STATUS ───────────────────────────────────────────────────────
  async UPDATE_RDV_STATUS(token, admin, payload) {
    if (!hasPermission(admin, "rdv.write"))
      return { success: false, message: "Permission refusée : rdv.write requis" };

    const res = await fetch(`${BACKEND_URL}/admin/rdv/${payload.id_rdv}/statut`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ statut: payload.statut }),
      cache: "no-store",
    });
    const data = await res.json();

    if (res.ok) {
      await logAudit(token, "STATUS_CHANGE", "rdv", payload.id_rdv, { statut: payload.statut, _ai: true });
      return { success: true, message: `RDV #${payload.id_rdv} → ${payload.statut}` };
    }
    return { success: false, message: data?.message ?? `Erreur ${res.status}` };
  },

  // ── NAVIGATE / ANALYZE / SUMMARIZE ─────────────────────────────────────────
  async NAVIGATE(_token, _admin, payload) {
    return { success: true, message: `Navigation suggérée vers ${payload.href}` };
  },
  async ANALYZE(_token, _admin, _payload) {
    return { success: true, message: "Analyse effectuée." };
  },
  async SUMMARIZE(_token, _admin, _payload) {
    return { success: true, message: "Résumé généré." };
  },
};

// ─── POST handler ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return NextResponse.json({ success: false, message: "Non authentifié" }, { status: 401 });
    }

    // 2. Récupérer infos admin
    const admin = await getAdminInfo(token);
    if (!admin) {
      return NextResponse.json({ success: false, message: "Token invalide ou expiré" }, { status: 401 });
    }

    // 3. Parser la requête
    const body: { action: AgentAction } = await req.json();
    const { action } = body;

    if (!action?.type || !action?.payload) {
      return NextResponse.json({ success: false, message: "Action invalide" }, { status: 400 });
    }

    // 4. Trouver le handler
    const handler = ACTION_HANDLERS[action.type];
    if (!handler) {
      return NextResponse.json(
        { success: false, message: `Type d'action inconnu: ${action.type}` },
        { status: 400 }
      );
    }

    // 5. Exécuter
    const result = await handler(token, admin, action.payload);

    // 6. Répondre
    return NextResponse.json({
      success:  result.success,
      message:  result.message,
      entityId: result.entityId,
      admin:    { nom: admin.nom, id: admin.id_admin },
      action:   action.type,
    });

  } catch (error) {
    console.error("[AI Execute] Unexpected error:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur inattendue" },
      { status: 500 }
    );
  }
}

// ─── GET handler (sanity check) ────────────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    status:   "ok",
    version:  "1.0.0",
    endpoint: "POST /api/ai/execute",
    actions:  Object.keys(ACTION_HANDLERS),
  });
}