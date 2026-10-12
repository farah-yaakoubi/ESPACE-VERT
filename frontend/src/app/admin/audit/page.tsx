"use client";
/**
 * app/admin/audit/page.tsx — VERSION AMÉLIORÉE
 * ─────────────────────────────────────────────────────────────────────────────
 * Journal d'audit enrichi avec :
 *  • Filtre "Origine IA" pour isoler les actions de l'Agent IA
 *  • Badge visuel distinct pour les actions AI_AGENT
 *  • Diff viewer : affichage before/after pour UPDATE et STATUS_CHANGE
 *  • Export CSV des logs filtrés
 *  • Statistiques en temps réel (actions IA vs humaines)
 *  • Timeline améliorée avec groupe par journée
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState, useCallback } from "react";
import { tokenStore } from "@/lib/admin-api";
import {
  Search, RefreshCw, ChevronLeft, ChevronRight, Clock, User, Tag, X,
  Bot, Download, Filter, Sparkles, Eye, Shield, TrendingUp,
  AlertTriangle, CheckCircle2,
} from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuditLog {
  id_log:      number;
  id_admin:    number | null;
  action:      string;
  entity_name: string;
  entity_id:   number | null;
  detail:      any;
  ip_address:  string | null;
  date_action: string;
  admin?: { nom: string; email: string } | null;
}
interface AuditMeta { total: number; page: number; pages: number; limit: number; }

// ─── Constantes ───────────────────────────────────────────────────────────────
const ACTIONS  = ["CREATE","UPDATE","DELETE","LOGIN","LOGOUT","STATUS_CHANGE","REPLY","TOGGLE","VIEW","ADD_IMAGE"];
const ENTITIES = ["produit","marque","activite","categorie","actualite","faq","devis","rdv","contact","admin","produit_image"];

const ACTION_COLOR: Record<string, { bg: string; text: string }> = {
  CREATE:        { bg: "#f0fdf4", text: "#16a34a" },
  UPDATE:        { bg: "#eff6ff", text: "#2563eb" },
  DELETE:        { bg: "#fef2f2", text: "#dc2626" },
  LOGIN:         { bg: "#f0fdf4", text: "#0d9488" },
  LOGOUT:        { bg: "#f9fafb", text: "#6b7280" },
  STATUS_CHANGE: { bg: "#fefce8", text: "#ca8a04" },
  REPLY:         { bg: "#fdf4ff", text: "#9333ea" },
  TOGGLE:        { bg: "#fff7ed", text: "#ea580c" },
};

const ACTION_LABEL: Record<string, string> = {
  CREATE: "Création", UPDATE: "Modification", DELETE: "Suppression",
  LOGIN: "Connexion", LOGOUT: "Déconnexion", STATUS_CHANGE: "Changement statut",
  REPLY: "Réponse", TOGGLE: "Activation", VIEW: "Consultation",
  ADD_IMAGE: "Ajout image", UPDATE_IMAGE: "Modif. image",
  SET_PRINCIPALE: "Image principale",
};

const ENTITY_LABEL: Record<string, string> = {
  produit: "Produit", marque: "Marque", activite: "Activité", categorie: "Catégorie",
  actualite: "Actualité", faq: "FAQ", devis: "Devis", rdv: "Rendez-vous",
  contact: "Message", admin: "Administrateur", produit_image: "Image produit",
};

const FIELD_LABEL: Record<string, string> = {
  nom: "Nom", email: "Email", actif: "Statut actif", titre: "Titre",
  contenu: "Contenu", statut: "Statut", prix: "Prix", description: "Description",
  reponse_admin: "Réponse admin", publiee: "Publié", question: "Question",
  reponse: "Réponse", ordre: "Ordre",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function isAIAction(log: AuditLog): boolean {
  return log.detail?._ai === true || log.detail?.origin === "AI_AGENT";
}

// ─── Composant Diff Viewer ────────────────────────────────────────────────────
function DiffBadge({ field, before, after }: { field: string; before?: any; after?: any }) {
  const label = FIELD_LABEL[field] ?? field;
  const b = String(before ?? "—").slice(0, 60);
  const a = String(after ?? "—").slice(0, 60);

  return (
    <div style={{ marginBottom: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", marginRight: 6 }}>{label} :</span>
      {before !== undefined && (
        <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 4, background: "#fee2e2", color: "#dc2626", marginRight: 4, textDecoration: "line-through", fontFamily: "monospace" }}>
          {b}
        </span>
      )}
      {after !== undefined && (
        <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 4, background: "#dcfce7", color: "#16a34a", fontFamily: "monospace" }}>
          {a}
        </span>
      )}
    </div>
  );
}

function DetailCell({ log }: { log: AuditLog }) {
  const [expanded, setExpanded] = useState(false);
  const d = log.detail;
  if (!d || Object.keys(d).length === 0) return <span style={{ color: "#d1d5db", fontSize: 12 }}>—</span>;

  // Suppression
  if (d.snapshot) {
    const snap = d.snapshot;
    return (
      <div style={{ fontSize: 12 }}>
        <span style={{ color: "#dc2626", fontWeight: 600 }}>Supprimé : </span>
        <span style={{ color: "#374151" }}>{snap.nom ?? snap.titre ?? snap.question ?? `#${log.entity_id}`}</span>
      </div>
    );
  }

  // Changement de statut
  if (d.ancien_statut || d.statut) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
        {d.ancien_statut && (
          <span style={{ padding: "1px 6px", borderRadius: 4, background: "#fee2e2", color: "#dc2626", textDecoration: "line-through" }}>
            {d.ancien_statut}
          </span>
        )}
        {d.ancien_statut && <span style={{ color: "#9ca3af" }}>→</span>}
        <span style={{ padding: "1px 6px", borderRadius: 4, background: "#dcfce7", color: "#16a34a" }}>
          {d.statut ?? d.nouveau_statut}
        </span>
      </div>
    );
  }

  // Modifications de champs (before/after)
  if (d.changes && typeof d.changes === "object") {
    const entries = Object.entries(d.changes).filter(([k]) => !["_ai","origin"].includes(k));
    if (entries.length === 0) return <span style={{ color: "#9ca3af", fontSize: 12 }}>Aucune modification</span>;
    return (
      <div>
        {(expanded ? entries : entries.slice(0, 2)).map(([k, v]: [string, any]) => (
          <DiffBadge key={k} field={k}
            before={v?.before ?? (typeof v === "object" ? undefined : v)}
            after={v?.after ?? (typeof v === "object" ? undefined : undefined)}
          />
        ))}
        {entries.length > 2 && (
          <button onClick={e => { e.stopPropagation(); setExpanded(x => !x); }}
            style={{ fontSize: 11, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 2 }}>
            {expanded ? "Réduire" : `+${entries.length - 2} champ(s) de plus`}
          </button>
        )}
      </div>
    );
  }

  // Payload simple (CREATE, etc.)
  const entries = Object.entries(d).filter(([k]) => !["_ai","origin","payload"].includes(k));
  const relevant = entries.filter(([k]) => ["nom","titre","question","email"].includes(k));

  if (relevant.length > 0) {
    return (
      <span style={{ fontSize: 12, color: "#374151" }}>
        {relevant.map(([, v]) => String(v)).join(" · ").slice(0, 80)}
      </span>
    );
  }

  if (d.payload) {
    const p = d.payload;
    return (
      <span style={{ fontSize: 12, color: "#374151" }}>
        {(p.nom ?? p.titre ?? p.question ?? "").slice(0, 60)}
      </span>
    );
  }

  return <span style={{ fontSize: 12, color: "#9ca3af" }}>Voir détails</span>;
}

// ─── Row ──────────────────────────────────────────────────────────────────────
function AuditRow({ log }: { log: AuditLog }) {
  const ac = ACTION_COLOR[log.action] ?? { bg: "#f9fafb", text: "#374151" };
  const isAI = isAIAction(log);
  const entity = ENTITY_LABEL[log.entity_name] ?? log.entity_name;

  return (
    <tr style={{ borderBottom: "1px solid #f3f4f6", transition: "background 0.1s" }}
      onMouseEnter={e => (e.currentTarget.style.background = isAI ? "rgba(59,130,246,0.02)" : "#fafafa")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      {/* Date */}
      <td style={{ padding: "11px 16px", fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" as const }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <Clock size={11} style={{ color: "#d1d5db" }} />
          {fmt(log.date_action)}
        </div>
      </td>

      {/* Origine (Admin / IA) */}
      <td style={{ padding: "11px 16px", fontSize: 12 }}>
        {isAI ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Sparkles size={11} style={{ color: "#fff" }} />
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>Agent IA</span>
              {log.admin && <div style={{ fontSize: 11, color: "#9ca3af" }}>via {log.admin.nom}</div>}
            </div>
          </div>
        ) : log.admin ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#2e7d4f,#4fbb7a)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 700, color: "#fff" }}>
              {log.admin.nom[0]?.toUpperCase()}
            </div>
            <span style={{ color: "#374151", fontWeight: 500 }}>{log.admin.nom}</span>
          </div>
        ) : (
          <span style={{ color: "#d1d5db", fontSize: 12 }}>Système</span>
        )}
      </td>

      {/* Action */}
      <td style={{ padding: "11px 16px" }}>
        <span style={{
          fontSize: 12, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
          background: ac.bg, color: ac.text,
          border: `1px solid ${ac.text}22`,
        }}>
          {ACTION_LABEL[log.action] ?? log.action}
        </span>
      </td>

      {/* Entité */}
      <td style={{ padding: "11px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
          <Tag size={10} style={{ color: "#d1d5db", flexShrink: 0 }} />
          <span style={{ color: "#374151", fontWeight: 500 }}>{entity}</span>
          {log.entity_id && <span style={{ color: "#9ca3af", fontFamily: "monospace", fontSize: 11 }}>#{log.entity_id}</span>}
        </div>
      </td>

      {/* Détail */}
      <td style={{ padding: "11px 16px", maxWidth: 280 }}>
        <DetailCell log={log} />
      </td>

      {/* IP */}
      <td style={{ padding: "11px 16px", fontSize: 11, color: "#d1d5db", fontFamily: "monospace", whiteSpace: "nowrap" as const }}>
        {log.ip_address ?? "—"}
      </td>
    </tr>
  );
}

// ─── Statistiques ─────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sublabel }: { label: string; value: number | string; icon: any; color: string; sublabel?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p style={{ fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: "-0.04em", lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{label}</p>
        {sublabel && <p style={{ fontSize: 11, color: color, fontWeight: 600, marginTop: 1 }}>{sublabel}</p>}
      </div>
    </div>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function AuditPage() {
  const [logs,      setLogs]      = useState<AuditLog[]>([]);
  const [meta,      setMeta]      = useState<AuditMeta>({ total: 0, page: 1, pages: 1, limit: 25 });
  const [loading,   setLoading]   = useState(true);
  const [curPage,   setCurPage]   = useState(1);
  const [search,    setSearch]    = useState("");
  const [action,    setAction]    = useState("");
  const [entity,    setEntity]    = useState("");
  const [aiOnly,    setAiOnly]    = useState(false);
  const [stats,     setStats]     = useState({ total: 0, aiActions: 0, todayActions: 0, deleteActions: 0 });

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const token = tokenStore.get();
      const q = new URLSearchParams({
        page: String(page), limit: "25",
        ...(search ? { search } : {}),
        ...(action ? { action } : {}),
        ...(entity ? { entity_name: entity } : {}),
        ...(aiOnly  ? { origin: "AI_AGENT" } : {}),
      });

      const res = await fetch(`${BASE}/admin/audit?${q}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      const items: AuditLog[] = data?.data ?? data?.logs ?? data ?? [];
      const m = data?.meta ?? { total: items.length, page, pages: 1, limit: 25 };

      setLogs(items);
      setMeta(m);
      setCurPage(page);

      // Stats calculées depuis les résultats
      const today = new Date().toDateString();
      setStats({
        total: m.total,
        aiActions: items.filter(isAIAction).length,
        todayActions: items.filter(l => new Date(l.date_action).toDateString() === today).length,
        deleteActions: items.filter(l => l.action === "DELETE").length,
      });
    } finally { setLoading(false); }
  }, [search, action, entity, aiOnly]);

  useEffect(() => { load(1); }, [search, action, entity, aiOnly]);

  // ── Export CSV ───────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const header = "ID,Date,Admin,Origine,Action,Entité,ID Entité,IP\n";
    const rows = logs.map(l => [
      l.id_log,
      fmt(l.date_action),
      l.admin?.nom ?? "Système",
      isAIAction(l) ? "AI_AGENT" : "HUMAN",
      l.action,
      l.entity_name,
      l.entity_id ?? "",
      l.ip_address ?? "",
    ].join(",")).join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Groupement par jour ───────────────────────────────────────────────────────
  const grouped: { day: string; items: AuditLog[] }[] = [];
  let currentDay = "";
  for (const log of logs) {
    const day = new Date(log.date_action).toDateString();
    if (day !== currentDay) {
      grouped.push({ day: log.date_action, items: [] });
      currentDay = day;
    }
    grouped[grouped.length - 1].items.push(log);
  }

  return (
    <div>
      {/* ── Titre ── */}
      <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: "-0.04em", display: "flex", alignItems: "center", gap: 10 }}>
            <Shield size={22} style={{ color: "#2e7d4f" }} />
            Journal d'audit
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            Historique complet de toutes les actions — humaines et IA — dans le dashboard
          </p>
        </div>
        <button onClick={exportCSV}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 10, background: "#f9fafb", border: "1px solid #e5e7eb", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151", transition: "all 0.15s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#2e7d4f"; (e.currentTarget as HTMLElement).style.color = "#2e7d4f"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb"; (e.currentTarget as HTMLElement).style.color = "#374151"; }}
        >
          <Download size={14} /> Exporter CSV
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="Total entrées" value={meta.total.toLocaleString()} icon={Shield} color="#2e7d4f" />
        <StatCard label="Actions IA" value={stats.aiActions} icon={Sparkles} color="#3b82f6" sublabel="Agent IA Espace Vert" />
        <StatCard label="Aujourd'hui" value={stats.todayActions} icon={TrendingUp} color="#f59e0b" sublabel="Sur cette page" />
        <StatCard label="Suppressions" value={stats.deleteActions} icon={AlertTriangle} color="#ef4444" sublabel="Haut risque" />
      </div>

      {/* ── Filtres ── */}
      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 10, marginBottom: 16, background: "#fff", padding: "14px 16px", borderRadius: 14, border: "1px solid #e5e7eb" }}>
        {/* Recherche */}
        <div style={{ flex: 1, minWidth: 200, position: "relative" as const }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par admin, entité…"
            style={{ width: "100%", height: 36, paddingLeft: 36, paddingRight: 12, border: "1px solid #e5e7eb", borderRadius: 9, fontSize: 13, color: "#111827", outline: "none", background: "#f9fafb", boxSizing: "border-box" as const }}
          />
        </div>

        {/* Action */}
        <select value={action} onChange={e => setAction(e.target.value)}
          style={{ height: 36, padding: "0 12px", border: "1px solid #e5e7eb", borderRadius: 9, fontSize: 13, color: "#374151", background: "#f9fafb", cursor: "pointer", outline: "none", minWidth: 170 }}>
          <option value="">Toutes les actions</option>
          {ACTIONS.map(a => <option key={a} value={a}>{ACTION_LABEL[a] ?? a}</option>)}
        </select>

        {/* Entité */}
        <select value={entity} onChange={e => setEntity(e.target.value)}
          style={{ height: 36, padding: "0 12px", border: "1px solid #e5e7eb", borderRadius: 9, fontSize: 13, color: "#374151", background: "#f9fafb", cursor: "pointer", outline: "none", minWidth: 170 }}>
          <option value="">Toutes les entités</option>
          {ENTITIES.map(e => <option key={e} value={e}>{ENTITY_LABEL[e] ?? e}</option>)}
        </select>

        {/* ── Bouton Filtre IA (NOUVEAU) ── */}
        <button
          onClick={() => setAiOnly(x => !x)}
          style={{
            display: "flex", alignItems: "center", gap: 7, height: 36, padding: "0 14px",
            borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 600,
            border: `1px solid ${aiOnly ? "#3b82f6" : "#e5e7eb"}`,
            background: aiOnly ? "rgba(59,130,246,0.08)" : "#f9fafb",
            color: aiOnly ? "#3b82f6" : "#6b7280",
            transition: "all 0.15s",
          }}
        >
          <Sparkles size={13} />
          Actions IA uniquement
          {aiOnly && <X size={12} />}
        </button>

        {/* Reset */}
        {(search || action || entity || aiOnly) && (
          <button onClick={() => { setSearch(""); setAction(""); setEntity(""); setAiOnly(false); }}
            style={{ display: "flex", alignItems: "center", gap: 5, height: 36, padding: "0 12px", borderRadius: 9, background: "none", border: "1px solid #fecaca", color: "#ef4444", fontSize: 13, cursor: "pointer" }}>
            <X size={12} /> Effacer
          </button>
        )}

        <button onClick={() => load(curPage)}
          style={{ width: 36, height: 36, borderRadius: 9, background: "#f9fafb", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
          title="Actualiser">
          <RefreshCw size={14} style={{ color: "#9ca3af" }} />
        </button>
      </div>

      {/* ── Indicateur filtre IA actif ── */}
      {aiOnly && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 12, marginBottom: 14 }}>
          <Sparkles size={14} style={{ color: "#3b82f6", flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "#1d4ed8", fontWeight: 600 }}>
            Filtrage actif : actions de l'Agent IA uniquement
          </span>
          <span style={{ fontSize: 12, color: "#3b82f6" }}>
            Ces actions ont été exécutées par l'IA après confirmation de l'administrateur
          </span>
        </div>
      )}

      {/* ── Table ── */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #dcfce7", borderTopColor: "#16a34a", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: "center" as const, padding: "64px 0", color: "#9ca3af" }}>
            <Shield size={40} style={{ margin: "0 auto 12px", opacity: 0.2 }} />
            <p style={{ fontWeight: 600 }}>Aucune entrée d'audit</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>{search || action || entity || aiOnly ? "Modifiez vos filtres" : "Le journal est vide"}</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["Date", "Origine", "Action", "Entité", "Détail", "IP"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left" as const, fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" as const, letterSpacing: "0.06em", whiteSpace: "nowrap" as const }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => <AuditRow key={log.id_log} log={log} />)}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.pages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid #f3f4f6" }}>
            <p style={{ fontSize: 12, color: "#9ca3af" }}>{meta.total.toLocaleString()} entrées · page {curPage}/{meta.pages}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <button disabled={curPage <= 1} onClick={() => load(curPage - 1)}
                style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: curPage <= 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: curPage <= 1 ? 0.4 : 1 }}>
                <ChevronLeft size={14} style={{ color: "#6b7280" }} />
              </button>

              {Array.from({ length: Math.min(meta.pages, 7) }, (_, i) => {
                const pg = Math.max(1, Math.min(curPage - 3 + i, meta.pages - 6 + i));
                return (
                  <button key={pg} onClick={() => load(pg)}
                    style={{ width: 32, height: 32, borderRadius: 8, border: pg === curPage ? "none" : "1px solid #e5e7eb", background: pg === curPage ? "#2e7d4f" : "#fff", color: pg === curPage ? "#fff" : "#374151", fontSize: 12, fontWeight: pg === curPage ? 700 : 500, cursor: "pointer" }}>
                    {pg}
                  </button>
                );
              })}

              <button disabled={curPage >= meta.pages} onClick={() => load(curPage + 1)}
                style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: curPage >= meta.pages ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: curPage >= meta.pages ? 0.4 : 1 }}>
                <ChevronRight size={14} style={{ color: "#6b7280" }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}