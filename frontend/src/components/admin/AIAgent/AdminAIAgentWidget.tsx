"use client";
/**
 * AdminAIAgentWidget.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Agent IA flottant "Espace Vert" — accessible depuis n'importe quelle page admin
 *
 * Fonctionnalités :
 *  • Widget flottant en bas à droite (bouton pulsant)
 *  • Panneau latéral coulissant avec historique de conversation
 *  • Détection d'intention et proposition d'actions structurées
 *  • Confirmation avant exécution (CREATE / UPDATE / DELETE)
 *  • Exécution réelle via les APIs admin (produits, actualités, FAQ, CRM…)
 *  • Enregistrement de chaque action IA dans le journal d'audit
 *  • Respect strict des permissions et rôles utilisateur
 *  • Suggestions contextuelles selon la page active
 *
 * INSTALLATION :
 *  1. Copier dans src/components/admin/AIAgent/AdminAIAgentWidget.tsx
 *  2. Dans AdminLayoutInner.tsx, importer et ajouter <AdminAIAgentWidget /> 
 *     juste avant </div> final (à l'intérieur du layout principal)
 *  3. S'assurer que NEXT_PUBLIC_ANTHROPIC_KEY est défini (ou utiliser l'endpoint backend)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Bot, X, Send, Minimize2, Maximize2, Trash2, RefreshCw,
  CheckCircle2, XCircle, AlertTriangle, Sparkles, ChevronRight,
  Package, Newspaper, HelpCircle, FileText, Calendar,
  MessageSquare, BarChart3, Zap, Copy, Check, ArrowRight,
  Clock, Shield, User, Activity, Layers,
} from "lucide-react";
import Image from "next/image";
import {
  tokenStore, isSuperAdmin,
  adminProduits, adminActualites, adminFaq, adminDevis, adminRdv,
  adminContact, adminMarques, adminActivites, adminCategories,
  type Admin,
} from "@/lib/admin-api";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { toast } from "@/components/admin/Toast";

// ─── Palette Espace Vert ──────────────────────────────────────────────────────
const EV = {
  bg:        "#0f1a14",
  bg2:       "#162117",
  accent:    "#2e7d4f",
  accentLt:  "#3a9e63",
  accentXl:  "#4fbb7a",
  gold:      "#f59e0b",
  danger:    "#ef4444",
  info:      "#3b82f6",
  warn:      "#f59e0b",
  textDim:   "rgba(255,255,255,0.35)",
  textMid:   "rgba(255,255,255,0.55)",
  textBright:"rgba(255,255,255,0.9)",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type ActionType =
  | "CREATE_PRODUIT" | "UPDATE_PRODUIT" | "DELETE_PRODUIT"
  | "CREATE_ACTUALITE" | "UPDATE_ACTUALITE"
  | "CREATE_FAQ" | "UPDATE_FAQ" | "DELETE_FAQ"
  | "UPDATE_DEVIS_STATUS" | "UPDATE_RDV_STATUS"
  | "NAVIGATE" | "ANALYZE" | "SUMMARIZE";

interface AgentAction {
  type:        ActionType;
  label:       string;           // "Créer le produit X"
  description: string;           // détail de ce qui va se passer
  payload:     Record<string, any>;
  risk:        "low" | "medium" | "high"; // low = auto-exec, medium/high = confirm
  icon:        string;           // emoji ou nom lucide
}

type MessageRole = "user" | "assistant" | "system";

interface AgentMessage {
  id:        string;
  role:      MessageRole;
  content:   string;
  timestamp: Date;
  actions?:  AgentAction[];
  executedActions?: string[];    // ids des actions exécutées
  error?:    boolean;
  thinking?: boolean;
}

interface AuditPayload {
  action:      string;
  entity_name: string;
  entity_id?:  number | null;
  detail:      Record<string, any>;
  origin:      "AI_AGENT";
}

// ─── Audit logger (appel backend) ─────────────────────────────────────────────
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function logAuditAction(payload: AuditPayload) {
  try {
    const token = tokenStore.get();
    await fetch(`${BASE}/admin/audit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      } as Record<string, string>,
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.warn("[AIAgent] Audit log failed:", e);
  }
}

// ─── Suggestions contextuelles selon la page ──────────────────────────────────
function getContextualSuggestions(pathname: string): string[] {
  if (pathname.includes("/produits"))
    return [
      "Liste les produits sans description",
      "Quels produits sont désactivés ?",
      "Crée un produit engrais NPK standard",
      "Optimise la description du produit #1",
    ];
  if (pathname.includes("/actualites"))
    return [
      "Rédige une actualité sur la saison d'automne",
      "Résume les dernières actualités publiées",
      "Quelles actualités sont en brouillon ?",
    ];
  if (pathname.includes("/faq"))
    return [
      "Génère 3 FAQs sur l'arrosage automatique",
      "Quelles FAQs sont les plus consultées ?",
      "Améliore la réponse de la FAQ #5",
    ];
  if (pathname.includes("/devis"))
    return [
      "Résume les devis en attente",
      "Combien de devis ce mois-ci ?",
      "Quels devis sont urgents ?",
    ];
  if (pathname.includes("/dashboard"))
    return [
      "Analyse les performances de ce mois",
      "Quelles anomalies détectes-tu ?",
      "Résume l'activité des 7 derniers jours",
    ];
  return [
    "Analyse les données du dashboard",
    "Crée un produit engrais NPK",
    "Rédige une actualité saison printemps",
    "Résume les devis en attente",
    "Génère 3 FAQs sur l'arrosage",
    "Détecte les anomalies dans le catalogue",
  ];
}

// ─── Action executor ──────────────────────────────────────────────────────────
async function executeAction(
  action: AgentAction,
  admin: Admin | null,
): Promise<{ success: boolean; message: string; entityId?: number }> {
  const superAdmin = isSuperAdmin(admin);

  switch (action.type) {
    // ── Produits ──────────────────────────────────────────────────────────────
    case "CREATE_PRODUIT": {
      if (!hasPermission(admin, PERMISSIONS.PRODUITS_WRITE))
        return { success: false, message: "Permission refusée : produits.write requis" };
      const res = await fetch(`${BASE}/admin/produits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenStore.get()}`,
        },
        body: JSON.stringify(action.payload),
      });
      const data = await res.json();
      const id = data?.data?.id_produit ?? data?.id_produit;
      if (res.ok) {
        await logAuditAction({
          action: "CREATE", entity_name: "produit", entity_id: id,
          detail: { ...action.payload, _ai: true },
          origin: "AI_AGENT",
        });
        return { success: true, message: `Produit "${action.payload.nom}" créé avec succès.`, entityId: id };
      }
      return { success: false, message: data?.message ?? "Erreur création produit" };
    }

    case "UPDATE_PRODUIT": {
      if (!hasPermission(admin, PERMISSIONS.PRODUITS_WRITE))
        return { success: false, message: "Permission refusée : produits.write requis" };
      const { id_produit, ...fields } = action.payload;
      const res = await fetch(`${BASE}/admin/produits/${id_produit}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenStore.get()}`,
        },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (res.ok) {
        await logAuditAction({
          action: "UPDATE", entity_name: "produit", entity_id: id_produit,
          detail: { changes: fields, _ai: true },
          origin: "AI_AGENT",
        });
        return { success: true, message: `Produit #${id_produit} mis à jour.` };
      }
      return { success: false, message: data?.message ?? "Erreur mise à jour" };
    }

    case "DELETE_PRODUIT": {
      if (!hasPermission(admin, PERMISSIONS.PRODUITS_DELETE))
        return { success: false, message: "Permission refusée : produits.delete requis" };
      const res = await fetch(`${BASE}/admin/produits/${action.payload.id_produit}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tokenStore.get()}` },
      });
      if (res.ok) {
        await logAuditAction({
          action: "DELETE", entity_name: "produit", entity_id: action.payload.id_produit,
          detail: { _ai: true, nom: action.payload.nom },
          origin: "AI_AGENT",
        });
        return { success: true, message: `Produit #${action.payload.id_produit} supprimé.` };
      }
      return { success: false, message: "Erreur suppression produit" };
    }

    // ── Actualités ────────────────────────────────────────────────────────────
    case "CREATE_ACTUALITE": {
      if (!hasPermission(admin, PERMISSIONS.ACTUALITES_WRITE))
        return { success: false, message: "Permission refusée : actualites.write requis" };
      const res = await fetch(`${BASE}/admin/actualites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenStore.get()}`,
        },
        body: JSON.stringify(action.payload),
      });
      const data = await res.json();
      const id = data?.data?.id_actualite ?? data?.id_actualite;
      if (res.ok) {
        await logAuditAction({
          action: "CREATE", entity_name: "actualite", entity_id: id,
          detail: { ...action.payload, _ai: true },
          origin: "AI_AGENT",
        });
        return { success: true, message: `Actualité "${action.payload.titre}" créée.`, entityId: id };
      }
      return { success: false, message: data?.message ?? "Erreur création actualité" };
    }

    case "UPDATE_ACTUALITE": {
      if (!hasPermission(admin, PERMISSIONS.ACTUALITES_WRITE))
        return { success: false, message: "Permission refusée : actualites.write requis" };
      const { id_actualite, ...fields } = action.payload;
      const res = await fetch(`${BASE}/admin/actualites/${id_actualite}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenStore.get()}`,
        },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (res.ok) {
        await logAuditAction({
          action: "UPDATE", entity_name: "actualite", entity_id: id_actualite,
          detail: { changes: fields, _ai: true },
          origin: "AI_AGENT",
        });
        return { success: true, message: `Actualité #${id_actualite} mise à jour.` };
      }
      return { success: false, message: data?.message ?? "Erreur mise à jour actualité" };
    }

    // ── FAQ ───────────────────────────────────────────────────────────────────
    case "CREATE_FAQ": {
      if (!hasPermission(admin, PERMISSIONS.FAQ_WRITE))
        return { success: false, message: "Permission refusée : faq.write requis" };
      const res = await fetch(`${BASE}/admin/faq`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenStore.get()}`,
        },
        body: JSON.stringify(action.payload),
      });
      const data = await res.json();
      const id = data?.data?.id_faq ?? data?.id_faq;
      if (res.ok) {
        await logAuditAction({
          action: "CREATE", entity_name: "faq", entity_id: id,
          detail: { ...action.payload, _ai: true },
          origin: "AI_AGENT",
        });
        return { success: true, message: `FAQ créée avec succès.`, entityId: id };
      }
      return { success: false, message: data?.message ?? "Erreur création FAQ" };
    }

    case "UPDATE_FAQ": {
      if (!hasPermission(admin, PERMISSIONS.FAQ_WRITE))
        return { success: false, message: "Permission refusée : faq.write requis" };
      const { id_faq, ...fields } = action.payload;
      const res = await fetch(`${BASE}/admin/faq/${id_faq}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenStore.get()}`,
        },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (res.ok) {
        await logAuditAction({
          action: "UPDATE", entity_name: "faq", entity_id: id_faq,
          detail: { changes: fields, _ai: true },
          origin: "AI_AGENT",
        });
        return { success: true, message: `FAQ #${id_faq} mise à jour.` };
      }
      return { success: false, message: data?.message ?? "Erreur mise à jour FAQ" };
    }

    case "DELETE_FAQ": {
      if (!hasPermission(admin, PERMISSIONS.FAQ_WRITE))
        return { success: false, message: "Permission refusée : faq.write requis" };
      const res = await fetch(`${BASE}/admin/faq/${action.payload.id_faq}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tokenStore.get()}` },
      });
      if (res.ok) {
        await logAuditAction({
          action: "DELETE", entity_name: "faq", entity_id: action.payload.id_faq,
          detail: { _ai: true },
          origin: "AI_AGENT",
        });
        return { success: true, message: `FAQ #${action.payload.id_faq} supprimée.` };
      }
      return { success: false, message: "Erreur suppression FAQ" };
    }

    // ── Devis ─────────────────────────────────────────────────────────────────
    case "UPDATE_DEVIS_STATUS": {
      if (!hasPermission(admin, PERMISSIONS.DEVIS_WRITE))
        return { success: false, message: "Permission refusée : devis.write requis" };
      const res = await fetch(`${BASE}/admin/devis/${action.payload.id_devis}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenStore.get()}`,
        },
        body: JSON.stringify({ statut: action.payload.statut }),
      });
      if (res.ok) {
        await logAuditAction({
          action: "STATUS_CHANGE", entity_name: "devis", entity_id: action.payload.id_devis,
          detail: { statut: action.payload.statut, _ai: true },
          origin: "AI_AGENT",
        });
        return { success: true, message: `Devis #${action.payload.id_devis} → ${action.payload.statut}` };
      }
      return { success: false, message: "Erreur mise à jour statut devis" };
    }

    // ── RDV ───────────────────────────────────────────────────────────────────
    case "UPDATE_RDV_STATUS": {
      if (!hasPermission(admin, PERMISSIONS.RDV_WRITE))
        return { success: false, message: "Permission refusée : rdv.write requis" };
      const res = await fetch(`${BASE}/admin/rdv/${action.payload.id_rdv}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenStore.get()}`,
        },
        body: JSON.stringify({ statut: action.payload.statut }),
      });
      if (res.ok) {
        await logAuditAction({
          action: "STATUS_CHANGE", entity_name: "rdv", entity_id: action.payload.id_rdv,
          detail: { statut: action.payload.statut, _ai: true },
          origin: "AI_AGENT",
        });
        return { success: true, message: `RDV #${action.payload.id_rdv} → ${action.payload.statut}` };
      }
      return { success: false, message: "Erreur mise à jour statut RDV" };
    }

    case "NAVIGATE":
      if (typeof window !== "undefined")
        window.location.href = action.payload.href;
      return { success: true, message: `Navigation vers ${action.payload.href}` };

    case "ANALYZE":
    case "SUMMARIZE":
      return { success: true, message: "Analyse terminée — voir le résumé ci-dessus." };

    default:
      return { success: false, message: "Action non reconnue" };
  }
}

// ─── System prompt pour l'agent ───────────────────────────────────────────────
function buildSystemPrompt(admin: Admin | null, pathname: string): string {
  const superAdmin = isSuperAdmin(admin);
  const perms = (admin as any)?.permissions ?? [];
  const permList = superAdmin ? "TOUTES LES PERMISSIONS" : perms.join(", ") || "aucune";

  return `Tu es l'Assistant IA de "Espace Vert", un dashboard d'administration SaaS pour une entreprise d'espaces verts et de jardinage en Tunisie.

CONTEXTE UTILISATEUR :
- Nom : ${admin?.nom ?? "Administrateur"}
- Rôle : ${superAdmin ? "Super Administrateur" : admin?.role?.nom ?? "Admin"}
- Page actuelle : ${pathname}
- Permissions : ${permList}

TES CAPACITÉS :
1. Répondre aux questions sur les données (catalogue, CRM, analytics, contenu)
2. Rédiger du contenu (descriptions produits, actualités, FAQs)
3. Analyser et résumer (devis, messages, tendances)
4. EXÉCUTER DES ACTIONS dans le système (si l'utilisateur en a la permission)
5. Détecter des anomalies et suggérer des optimisations

RÈGLES D'ACTION :
- Tu DOIS toujours vérifier les permissions avant de proposer une action
- Pour les actions destructives (DELETE), le risque est TOUJOURS "high"
- Pour les créations, le risque est "medium" (nécessite confirmation)
- Pour les analyses et navigations, le risque est "low"
- Tu dois TOUJOURS demander confirmation pour les actions medium/high

FORMAT DE RÉPONSE AVEC ACTIONS :
Quand tu identifies une action à effectuer, inclus un bloc JSON structuré à la fin de ta réponse :

\`\`\`actions
[
  {
    "type": "CREATE_PRODUIT",
    "label": "Créer le produit Engrais NPK 20-20-20",
    "description": "Créer un nouveau produit engrais avec les informations fournies",
    "payload": {
      "nom": "Engrais NPK 20-20-20",
      "slug": "engrais-npk-20-20-20",
      "description": "...",
      "actif": true,
      "division": "pro"
    },
    "risk": "medium",
    "icon": "📦"
  }
]
\`\`\`

TYPES D'ACTIONS DISPONIBLES :
- CREATE_PRODUIT, UPDATE_PRODUIT, DELETE_PRODUIT
- CREATE_ACTUALITE, UPDATE_ACTUALITE
- CREATE_FAQ, UPDATE_FAQ, DELETE_FAQ
- UPDATE_DEVIS_STATUS (payload: {id_devis, statut: "nouveau"|"en_cours"|"traite"|"rejete"})
- UPDATE_RDV_STATUS (payload: {id_rdv, statut: "nouveau"|"confirme"|"termine"|"annule"})
- NAVIGATE (payload: {href: "/admin/..."})
- ANALYZE, SUMMARIZE

PERSONNALITÉ :
- Précis, professionnel, bienveillant
- Proactif : tu proposes des actions concrètes, pas juste des réponses théoriques
- Tu réponds dans la langue de l'utilisateur : français si la demande est en français, arabe naturel si la demande est en arabe
- Tu utilises du **gras** pour les informations importantes
- Tu es concis mais complet`;
}

// ─── Parsing des actions dans la réponse IA ───────────────────────────────────
function parseActionsFromResponse(content: string): { text: string; actions: AgentAction[] } {
  const actionBlockRegex = /```actions\s*([\s\S]*?)```/g;
  const actions: AgentAction[] = [];
  let cleanText = content;

  let match;
  while ((match = actionBlockRegex.exec(content)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      actions.push(...arr);
      cleanText = cleanText.replace(match[0], "").trim();
    } catch (e) {
      console.warn("[AIAgent] Failed to parse action block:", e);
    }
  }

  return { text: cleanText, actions };
}

// ─── Formateur markdown léger ─────────────────────────────────────────────────
function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code style=\"background:rgba(46,125,79,0.2);padding:1px 5px;border-radius:3px;font-family:monospace;font-size:0.85em\">$1</code>")
    .replace(/^## (.*)/gm, "<h3 style=\"font-size:13px;font-weight:700;color:#4fbb7a;margin:10px 0 4px\">$1</h3>")
    .replace(/^### (.*)/gm, "<h4 style=\"font-size:12px;font-weight:700;color:#3a9e63;margin:8px 0 3px\">$1</h4>")
    .replace(/^- (.*)/gm, "<div style=\"display:flex;gap:6px;margin:2px 0\"><span style=\"color:#4fbb7a;flex-shrink:0\">•</span><span>$1</span></div>")
    .replace(/\n\n/g, "<br><br>")
    .replace(/\n/g, "<br>");
}

// ─── Composant Typing dots ────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "12px 16px" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: EV.accentXl, display: "inline-block",
          animation: `aiAgentBounce 1.2s ease-in-out ${i * 0.18}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes aiAgentBounce {
          0%,80%,100%{transform:translateY(0);opacity:0.6}
          40%{transform:translateY(-6px);opacity:1}
        }
        @keyframes aiAgentPulse {
          0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(46,125,79,0.4)}
          50%{transform:scale(1.05);box-shadow:0 0 0 10px rgba(46,125,79,0)}
        }
        @keyframes aiAgentSlideIn {
          from{transform:translateX(120%);opacity:0}
          to{transform:translateX(0);opacity:1}
        }
        @keyframes aiAgentFadeUp {
          from{transform:translateY(10px);opacity:0}
          to{transform:translateY(0);opacity:1}
        }
        @keyframes aiAgentShine {
          0%{transform:translateX(-100%)}
          100%{transform:translateX(200%)}
        }
      `}</style>
    </div>
  );
}

// ─── Carte d'action ────────────────────────────────────────────────────────────
function ActionCard({
  action,
  onConfirm,
  onReject,
  executed,
  executing,
}: {
  action: AgentAction;
  onConfirm: () => void;
  onReject: () => void;
  executed?: boolean;
  executing?: boolean;
}) {
  const riskColors = {
    low:    { bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.2)", text: "#4ade80", badge: "Sûr" },
    medium: { bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)", text: "#fbbf24", badge: "Confirmation" },
    high:   { bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)",  text: "#ef4444", badge: "Attention" },
  }[action.risk];

  return (
    <div style={{
      background: executed ? "rgba(46,125,79,0.08)" : riskColors.bg,
      border: `1px solid ${executed ? "rgba(46,125,79,0.3)" : riskColors.border}`,
      borderRadius: 12,
      padding: "12px 14px",
      marginTop: 8,
      animation: "aiAgentFadeUp 0.3s ease",
      opacity: executing ? 0.7 : 1,
    }}>
      {/* Header action */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>
          {executed ? "✅" : action.icon}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 12.5, fontWeight: 700, color: executed ? EV.accentXl : EV.textBright,
            lineHeight: 1.3, marginBottom: 3,
          }}>
            {action.label}
          </p>
          <p style={{ fontSize: 11, color: EV.textMid, lineHeight: 1.4 }}>
            {executed ? "Action exécutée avec succès" : action.description}
          </p>
        </div>
        {!executed && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
            padding: "2px 7px", borderRadius: 20,
            background: riskColors.bg, color: riskColors.text,
            border: `1px solid ${riskColors.border}`,
            flexShrink: 0, textTransform: "uppercase",
          }}>
            {riskColors.badge}
          </span>
        )}
      </div>

      {/* Payload preview (si CREATE/UPDATE) */}
      {!executed && action.risk !== "low" && Object.keys(action.payload).length > 0 && (
        <div style={{
          background: "rgba(0,0,0,0.2)",
          borderRadius: 8,
          padding: "8px 10px",
          marginBottom: 10,
          maxHeight: 120,
          overflowY: "auto",
        }}>
          {Object.entries(action.payload).slice(0, 5).map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 8, fontSize: 10.5, lineHeight: 1.6 }}>
              <span style={{ color: EV.textDim, flexShrink: 0, minWidth: 90 }}>{k} :</span>
              <span style={{ color: EV.textMid, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {String(v).slice(0, 80)}
              </span>
            </div>
          ))}
          {Object.keys(action.payload).length > 5 && (
            <p style={{ fontSize: 10, color: EV.textDim, marginTop: 2 }}>
              +{Object.keys(action.payload).length - 5} autres champs…
            </p>
          )}
        </div>
      )}

      {/* Boutons */}
      {!executed && (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onReject}
            disabled={executing}
            style={{
              flex: 1, height: 32, borderRadius: 8,
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
              color: "#ef4444", fontSize: 12, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            }}
          >
            <XCircle size={12} /> Refuser
          </button>
          <button
            onClick={onConfirm}
            disabled={executing}
            style={{
              flex: 2, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${EV.accent}, ${EV.accentLt})`,
              border: "none", color: "#fff", fontSize: 12, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              boxShadow: "0 2px 8px rgba(46,125,79,0.3)",
            }}
          >
            {executing ? <RefreshCw size={12} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle2 size={12} />}
            {executing ? "Exécution…" : "Confirmer & Exécuter"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Bulle de message ─────────────────────────────────────────────────────────
function MessageBubble({
  msg,
  admin,
  onExecuteAction,
}: {
  msg: AgentMessage;
  admin: Admin | null;
  onExecuteAction: (msgId: string, action: AgentAction, index: number) => void;
}) {
  const isUser = msg.role === "user";
  const [executingIdx, setExecutingIdx] = useState<number | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (msg.role === "system") return null;

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  };

  const handleExecute = async (action: AgentAction, idx: number) => {
    setExecutingIdx(idx);
    await onExecuteAction(msg.id, action, idx);
    setExecutingIdx(null);
  };

  return (
    <div style={{
      display: "flex", gap: 10, marginBottom: 16,
      flexDirection: isUser ? "row-reverse" : "row",
      animation: "aiAgentFadeUp 0.25s ease",
    }}>
      {/* Avatar */}
      <div style={{
        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
        background: isUser ? "rgba(255,255,255,0.1)" : `linear-gradient(135deg,${EV.accent},${EV.accentXl})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `1px solid ${isUser ? "rgba(255,255,255,0.15)" : "rgba(79,187,122,0.3)"}`,
      }}>
        {isUser
          ? <User size={13} style={{ color: EV.textMid }} />
          : <Sparkles size={13} style={{ color: "#fff" }} />
        }
      </div>

      {/* Contenu */}
      <div style={{ maxWidth: "80%", display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
        {/* Bulle texte */}
        <div style={{
          padding: "10px 14px",
          borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
          background: isUser
            ? `linear-gradient(135deg, ${EV.accent}, ${EV.accentLt})`
            : "rgba(255,255,255,0.05)",
          border: isUser ? "none" : "1px solid rgba(255,255,255,0.08)",
          fontSize: 13,
          lineHeight: 1.6,
          color: EV.textBright,
        }}>
          {msg.thinking
            ? <TypingDots />
            : (
              <div
                dangerouslySetInnerHTML={{
                  __html: formatMarkdown(msg.content),
                }}
              />
            )
          }
        </div>

        {/* Actions cards */}
        {msg.actions && msg.actions.length > 0 && (
          <div style={{ width: "100%", marginTop: 4 }}>
            {msg.actions.map((action, idx) => (
              <ActionCard
                key={idx}
                action={action}
                executed={msg.executedActions?.includes(`${msg.id}-${idx}`)}
                executing={executingIdx === idx}
                onConfirm={() => handleExecute(action, idx)}
                onReject={() => toast.warning(`Action "${action.label}" annulée.`)}
              />
            ))}
          </div>
        )}

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <span style={{ fontSize: 10, color: EV.textDim }}>
            {msg.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
          {!isUser && !msg.thinking && (
            <button
              onClick={() => handleCopy(msg.content, 0)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: EV.textDim, display: "flex", alignItems: "center", gap: 3,
                fontSize: 10, padding: "2px 5px", borderRadius: 5,
                transition: "color 0.15s",
              }}
              title="Copier"
            >
              {copiedIdx === 0 ? <Check size={10} /> : <Copy size={10} />}
              {copiedIdx === 0 ? "Copié" : ""}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Widget principal ─────────────────────────────────────────────────────────
export function AdminAIAgentWidget({ pathname }: { pathname: string }) {
  const [open, setOpen]         = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Bonjour ! Je suis votre **Assistant IA Espace Vert**. Je peux analyser vos données, répondre en français ou en arabe, faire des calculs, rédiger du contenu et **préparer des actions réelles** à confirmer dans le dashboard.\n\nQue puis-je faire pour vous ?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [unread, setUnread]         = useState(0);
  const admin                       = tokenStore.getAdmin();
  const bottomRef                   = useRef<HTMLDivElement>(null);
  const inputRef                    = useRef<HTMLTextAreaElement>(null);
  const suggestions                 = useMemo(() => getContextualSuggestions(pathname), [pathname]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  // ── Envoi message ────────────────────────────────────────────────────────────
  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: AgentMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    const thinkingId = `t-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      userMsg,
      { id: thinkingId, role: "assistant", content: "", timestamp: new Date(), thinking: true },
    ]);
    setInput("");
    setLoading(true);

    try {
      // Historique pour l'API (sans le message "thinking")
      const history = messages
        .filter(m => !m.thinking && m.id !== "welcome")
        .slice(-10)
        .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

      const res = await fetch(`${BASE}/admin/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenStore.get()}`,
        },
        body: JSON.stringify({
          message: text.trim(),
          history,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? data?.reply ?? "Erreur assistant IA");
      const rawContent = data?.reply ?? "Je n'ai pas pu générer de réponse.";

      // Parser les actions du bloc JSON
      const parsed = parseActionsFromResponse(rawContent);
      const cleanText = parsed.text;
      const actions = Array.isArray(data?.actions) && data.actions.length > 0
        ? data.actions as AgentAction[]
        : parsed.actions;

      // Remplacer le message "thinking"
      setMessages(prev => prev.map(m =>
        m.id === thinkingId
          ? {
              id: `a-${Date.now()}`,
              role: "assistant" as MessageRole,
              content: cleanText,
              timestamp: new Date(),
              actions: actions.length > 0 ? actions : undefined,
              executedActions: [],
            }
          : m
      ));

      // Si widget fermé, incrémenter le badge
      if (!open) setUnread(n => n + 1);

    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === thinkingId
          ? {
              id: `e-${Date.now()}`,
              role: "assistant" as MessageRole,
              content: "Une erreur est survenue. Vérifiez votre connexion.",
              timestamp: new Date(),
              error: true,
            }
          : m
      ));
    } finally {
      setLoading(false);
    }
  }, [loading, messages, admin, pathname, open]);

  // ── Exécution d'action ───────────────────────────────────────────────────────
  const handleExecuteAction = useCallback(async (
    msgId: string,
    action: AgentAction,
    actionIndex: number,
  ) => {
    const result = await executeAction(action, admin);

    // Mettre à jour l'état executed
    setMessages(prev => prev.map(m =>
      m.id === msgId
        ? {
            ...m,
            executedActions: [...(m.executedActions ?? []), `${msgId}-${actionIndex}`],
          }
        : m
    ));

    if (result.success) {
      toast.success(result.message);
      // Ajouter un message de confirmation de l'IA
      setMessages(prev => [...prev, {
        id: `exec-${Date.now()}`,
        role: "assistant",
        content: `✅ **Action exécutée :** ${result.message}${result.entityId ? `\n\nID créé : **#${result.entityId}**` : ""}`,
        timestamp: new Date(),
      }]);
    } else {
      toast.error(result.message);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `❌ **Échec :** ${result.message}`,
        timestamp: new Date(),
        error: true,
      }]);
    }
  }, [admin]);

  // ── Clear ────────────────────────────────────────────────────────────────────
  const clearChat = () => {
    setMessages([{
      id: "welcome-new",
      role: "assistant",
      content: "Conversation réinitialisée. Comment puis-je vous aider ?",
      timestamp: new Date(),
    }]);
  };

  const panelW = expanded ? 560 : 400;

  // ── Rendu ────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Bouton flottant ────────────────────────────────────────────────── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 9999,
            width: 56, height: 56, borderRadius: "50%",
            background: `linear-gradient(135deg, ${EV.accent}, ${EV.accentXl})`,
            border: "none", cursor: "pointer",
            boxShadow: "0 4px 20px rgba(46,125,79,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "aiAgentPulse 2.5s ease-in-out infinite",
            transition: "transform 0.2s",
          }}
          title="Assistant IA Espace Vert"
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          <Sparkles size={22} style={{ color: "#fff" }} />
          {unread > 0 && (
            <span style={{
              position: "absolute", top: -2, right: -2,
              width: 18, height: 18, borderRadius: "50%",
              background: EV.danger, color: "#fff",
              fontSize: 10, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid white",
            }}>
              {unread}
            </span>
          )}
        </button>
      )}

      {/* ── Panneau latéral ────────────────────────────────────────────────── */}
      {open && (
        <div style={{
          position: "fixed", bottom: 0, right: 0, zIndex: 9999,
          width: panelW, height: "100vh", maxHeight: "100vh",
          background: EV.bg,
          boxShadow: "-8px 0 40px rgba(0,0,0,0.4)",
          display: "flex", flexDirection: "column",
          animation: "aiAgentSlideIn 0.35s cubic-bezier(0.22,1,0.36,1)",
          borderLeft: `1px solid rgba(255,255,255,0.08)`,
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 16px",
            background: EV.bg2,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", gap: 12,
            flexShrink: 0,
          }}>
            {/* Logo + status */}
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, ${EV.accent}, ${EV.accentXl})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, position: "relative",
            }}>
              <Sparkles size={16} style={{ color: "#fff" }} />
              <span style={{
                position: "absolute", bottom: -2, right: -2,
                width: 10, height: 10, borderRadius: "50%",
                background: "#22c55e", border: "2px solid " + EV.bg2,
              }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: EV.textBright, lineHeight: 1 }}>
                Assistant IA
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                <Shield size={9} style={{ color: EV.accentXl }} />
                <span style={{ fontSize: 10, color: EV.accentXl, fontWeight: 600 }}>
                  {isSuperAdmin(admin) ? "Accès complet" : "Accès limité aux permissions"}
                </span>
              </div>
            </div>

            {/* Actions header */}
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={clearChat} title="Effacer" style={{
                width: 30, height: 30, borderRadius: 8,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                color: EV.textDim, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Trash2 size={13} />
              </button>
              <button onClick={() => setExpanded(e => !e)} title={expanded ? "Réduire" : "Agrandir"} style={{
                width: 30, height: 30, borderRadius: 8,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                color: EV.textDim, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
              <button onClick={() => setOpen(false)} title="Fermer" style={{
                width: 30, height: 30, borderRadius: 8,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                color: EV.textDim, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Suggestions rapides (si début de conversation) */}
          {messages.length <= 1 && (
            <div style={{
              padding: "12px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              flexShrink: 0,
            }}>
              <p style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em",
                color: EV.textDim, textTransform: "uppercase", marginBottom: 8,
              }}>
                Suggestions
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => send(s)} style={{
                    fontSize: 11, padding: "5px 10px", borderRadius: 20,
                    background: "rgba(46,125,79,0.1)",
                    border: "1px solid rgba(46,125,79,0.2)",
                    color: EV.accentXl, cursor: "pointer",
                    transition: "all 0.15s", lineHeight: 1.3,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = EV.accent;
                    (e.currentTarget as HTMLElement).style.color = "#fff";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(46,125,79,0.1)";
                    (e.currentTarget as HTMLElement).style.color = EV.accentXl;
                  }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Zone messages */}
          <div style={{
            flex: 1, overflowY: "auto",
            padding: "16px 14px",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.1) transparent",
          }}>
            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                admin={admin}
                onExecuteAction={handleExecuteAction}
              />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Zone input */}
          <div style={{
            padding: "12px 14px 16px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            flexShrink: 0,
            background: EV.bg2,
          }}>
            <div style={{
              display: "flex", gap: 10, alignItems: "flex-end",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: "10px 12px",
              transition: "border-color 0.2s",
            }}
            onFocusCapture={e => (e.currentTarget.style.borderColor = "rgba(79,187,122,0.4)")}
            onBlurCapture={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
                }}
                placeholder="Posez une question, en français ou en arabe, ou donnez un ordre… (⏎ pour envoyer)"
                rows={2}
                disabled={loading}
                style={{
                  flex: 1, background: "transparent", border: "none",
                  outline: "none", resize: "none",
                  color: EV.textBright, fontSize: 13, lineHeight: 1.5,
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: !input.trim() || loading
                    ? "rgba(46,125,79,0.2)"
                    : `linear-gradient(135deg, ${EV.accent}, ${EV.accentLt})`,
                  border: "none", cursor: !input.trim() || loading ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.2s",
                  boxShadow: !input.trim() || loading ? "none" : "0 2px 8px rgba(46,125,79,0.3)",
                }}
              >
                {loading
                  ? <RefreshCw size={14} style={{ color: EV.accentXl, animation: "spin 1s linear infinite" }} />
                  : <Send size={14} style={{ color: !input.trim() ? EV.textDim : "#fff" }} />
                }
                <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
              </button>
            </div>

            {/* Footer meta */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 6, marginTop: 8,
            }}>
              <Zap size={9} style={{ color: EV.accentXl }} />
              <span style={{ fontSize: 10, color: EV.textDim }}>
                IA admin sécurisée · Actions réelles confirmées · Permissions respectées
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
