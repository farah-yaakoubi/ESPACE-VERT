"use client";
/**
 * app/admin/devis/page.tsx — CORRIGÉ v2
 * ─────────────────────────────────────────────────────────────────────────────
 * CORRECTIONS :
 *  • Pipeline panel : seules les transitions valides sont cliquables
 *    nouveau → en_cours | rejete
 *    en_cours → traite  | rejete
 *    traite / rejete → terminal (aucun bouton)
 *  • Tableau actions rapides : filtrées sur VALID_TRANSITIONS uniquement
 *  • Message d'erreur clair si tentative de transition invalide
 *  • Libellés simplifiés ("En attente" au lieu de "nouveau", etc.)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState, useCallback } from "react";
import { adminDevis, adminStats, tokenStore, type DevisItem } from "@/lib/admin-api";
import {
  Search, RefreshCw, FileText, ChevronRight, X, Send,
  Clock, User, Mail, Phone, Package, StickyNote, CheckCircle2,
  XCircle, AlertCircle, Loader2, ChevronLeft, Filter,
} from "lucide-react";
import { toast } from "@/components/admin/Toast";

// ─── Statuts (miroir exact du backend) ───────────────────────────────────────
const PIPELINE = [
  { key: "nouveau",  label: "En attente",   icon: AlertCircle,  color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", textLight: "#1d4ed8" },
  { key: "en_cours", label: "En cours",     icon: Clock,        color: "#d97706", bg: "#fffbeb", border: "#fde68a", textLight: "#b45309" },
  { key: "traite",   label: "Traité",       icon: CheckCircle2, color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", textLight: "#047857" },
  { key: "rejete",   label: "Refusé",       icon: XCircle,      color: "#dc2626", bg: "#fef2f2", border: "#fecaca", textLight: "#b91c1c" },
];
const STATUT_MAP = Object.fromEntries(PIPELINE.map(s => [s.key, s]));

// Miroir exact du backend devis.service.ts
const VALID_TRANSITIONS: Record<string, string[]> = {
  nouveau:  ["en_cours", "rejete"],
  en_cours: ["traite",   "rejete"],
  traite:   [],
  rejete:   [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(d: string) {
  return new Date(d).toLocaleString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function fmtShort(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}
function hoursAgo(d: string) {
  const h = Math.floor((Date.now() - new Date(d).getTime()) / 36e5);
  if (h < 1)  return "À l'instant";
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
}
function isUrgent(item: DevisItem) {
  if (item.statut !== "nouveau") return false;
  return (Date.now() - new Date(item.created_at).getTime()) / 36e5 > 48;
}

// ─── Badge statut ─────────────────────────────────────────────────────────────
function StatusBadge({ statut }: { statut: string }) {
  const s = STATUT_MAP[statut] ?? { label: statut, color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb", textLight: "#374151", icon: AlertCircle };
  const Icon = s.icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: s.bg, color: s.textLight, border: `1px solid ${s.border}`, fontSize: 12, fontWeight: 700 }}>
      <Icon size={10} />{s.label}
    </span>
  );
}

// ─── Carte pipeline (compteur cliquable) ──────────────────────────────────────
function PipelineCard({ stage, count, active, onClick }: { stage: typeof PIPELINE[0]; count: number; active: boolean; onClick: () => void }) {
  const Icon = stage.icon;
  return (
    <button onClick={onClick} style={{ flex: 1, minWidth: 0, background: active ? stage.bg : "#fff", border: `1.5px solid ${active ? stage.color : "#e5e7eb"}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", textAlign: "left" as const, transition: "all 0.15s", boxShadow: active ? `0 2px 12px ${stage.color}22` : "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: active ? stage.color : stage.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={15} style={{ color: active ? "#fff" : stage.color }} />
        </div>
        {active && <span style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color }} />}
      </div>
      <p style={{ fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: "-0.04em", lineHeight: 1 }}>{count}</p>
      <p style={{ fontSize: 12, color: active ? stage.textLight : "#6b7280", marginTop: 4, fontWeight: active ? 600 : 400 }}>{stage.label}</p>
    </button>
  );
}

// ─── Panneau de détail ────────────────────────────────────────────────────────
function DevisDetailPanel({ item, onClose, onSaved }: { item: DevisItem; onClose: () => void; onSaved: () => void }) {
  const [saving,  setSaving]  = useState(false);
  const [statut,  setStatut]  = useState(item.statut);
  const [reponse, setReponse] = useState(item.reponse_admin ?? "");
  const [note,    setNote]    = useState(item.note_interne ?? "");

  const nextStatuts = VALID_TRANSITIONS[statut] ?? [];
  const isTerminal  = nextStatuts.length === 0;

  // Changement de statut avec validation préventive
  const quickStatus = async (s: string) => {
    const allowed = VALID_TRANSITIONS[statut] ?? [];
    if (!allowed.includes(s)) {
      toast.error(`Impossible : "${STATUT_MAP[statut]?.label}" ne peut pas passer à "${STATUT_MAP[s]?.label}".`);
      return;
    }
    try {
      await adminDevis.update(item.id_devis, { statut: s });
      setStatut(s);
      toast.success(`Statut mis à jour → ${STATUT_MAP[s]?.label ?? s}`);
    } catch (e: any) {
      toast.error(e?.message?.includes("Transition") ? "Ce changement de statut n'est pas autorisé." : "Erreur lors du changement de statut.");
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await adminDevis.update(item.id_devis, { reponse_admin: reponse, note_interne: note });
      toast.success("Enregistré");
      onSaved(); onClose();
    } catch { toast.error("Erreur lors de la sauvegarde"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 560, background: "#fff", height: "100vh", display: "flex", flexDirection: "column", animation: "slideInRight 0.3s cubic-bezier(0.22,1,0.36,1)", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
        <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}} @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FileText size={18} style={{ color: "#059669" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>Devis #{item.id_devis}</h2>
              <StatusBadge statut={statut} />
              {isUrgent(item) && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>⚡ Urgent</span>}
            </div>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>{hoursAgo(item.created_at)} · {fmt(item.created_at)}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}><X size={18} /></button>
        </div>

        {/* Corps */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Infos client */}
          <section>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#9ca3af", textTransform: "uppercase" as const, marginBottom: 10 }}>Informations client</p>
            <div style={{ background: "#f9fafb", borderRadius: 12, padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { icon: User,    label: "Nom",      val: item.nom },
                { icon: Mail,    label: "Email",     val: item.email },
                { icon: Phone,   label: "Téléphone", val: item.telephone ?? "—" },
                { icon: FileText,label: "Date",      val: fmtShort(item.created_at) },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label}>
                  <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2, display: "flex", alignItems: "center", gap: 4 }}><Icon size={10} /> {label}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{val}</p>
                </div>
              ))}
              {item.produit && (
                <div style={{ gridColumn: "1/-1" }}>
                  <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2, display: "flex", alignItems: "center", gap: 4 }}><Package size={10} /> Produit concerné</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#059669" }}>{item.produit.nom}</p>
                </div>
              )}
            </div>
          </section>

          {/* Message */}
          {item.message && (
            <section>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#9ca3af", textTransform: "uppercase" as const, marginBottom: 8 }}>Message du client</p>
              <div style={{ background: "#f9fafb", borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "#374151", lineHeight: 1.7, whiteSpace: "pre-wrap" as const }}>{item.message}</div>
            </section>
          )}

          {/* Étapes — uniquement les transitions autorisées */}
          <section>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#9ca3af", textTransform: "uppercase" as const, marginBottom: 10 }}>Avancement du dossier</p>

            {isTerminal ? (
              <div style={{ background: statut === "rejete" ? "#fef2f2" : "#ecfdf5", border: `1px solid ${statut === "rejete" ? "#fecaca" : "#a7f3d0"}`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                {statut === "rejete" ? <XCircle size={16} style={{ color: "#dc2626" }} /> : <CheckCircle2 size={16} style={{ color: "#059669" }} />}
                <span style={{ fontSize: 13, fontWeight: 600, color: statut === "rejete" ? "#b91c1c" : "#047857" }}>
                  {statut === "rejete" ? "Cette demande a été refusée." : "Cette demande est traitée."}
                </span>
              </div>
            ) : (
              <div>
                {/* Visualisation de la progression */}
                <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 16 }}>
                  {PIPELINE.filter(s => s.key !== "rejete").map((s, i, arr) => {
                    const steps    = ["nouveau","en_cours","traite"];
                    const curIdx   = steps.indexOf(statut);
                    const stepIdx  = steps.indexOf(s.key);
                    const isDone   = stepIdx < curIdx;
                    const isCurrent = stepIdx === curIdx;
                    return (
                      <div key={s.key} style={{ display: "flex", alignItems: "center", flex: i < arr.length - 1 ? 1 : undefined }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: isDone ? s.color : isCurrent ? s.color : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", border: isCurrent ? `2px solid ${s.color}` : "none", boxShadow: isCurrent ? `0 0 0 4px ${s.color}22` : "none" }}>
                            {isDone ? <CheckCircle2 size={14} style={{ color: "#fff" }} /> : <s.icon size={12} style={{ color: isDone || isCurrent ? "#fff" : "#9ca3af" }} />}
                          </div>
                          <span style={{ fontSize: 10, color: isCurrent ? s.textLight : isDone ? s.textLight : "#9ca3af", fontWeight: isCurrent ? 700 : 500, whiteSpace: "nowrap" as const }}>{s.label}</span>
                        </div>
                        {i < arr.length - 1 && <div style={{ flex: 1, height: 2, background: isDone ? PIPELINE[i + 1]?.color ?? "#e5e7eb" : "#e5e7eb", margin: "0 4px", marginBottom: 16 }} />}
                      </div>
                    );
                  })}
                </div>

                <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Prochaine étape — choisissez une action :</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                  {nextStatuts.map(key => {
                    const s = STATUT_MAP[key];
                    if (!s) return null;
                    const Icon = s.icon;
                    return (
                      <button key={key} onClick={() => quickStatus(key)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 12, border: `1.5px solid ${s.border}`, background: s.bg, color: s.textLight, cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "all 0.15s", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                        <Icon size={14} />
                        {key === "en_cours" ? "▶ Prendre en charge" :
                         key === "traite"   ? "✓ Marquer comme traité" :
                         key === "rejete"   ? "✗ Refuser la demande" : s.label}
                      </button>
                    );
                  })}
                </div>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
                  Statut actuel : <strong style={{ color: "#374151" }}>{STATUT_MAP[statut]?.label ?? statut}</strong>
                </p>
              </div>
            )}
          </section>

          {/* Réponse admin */}
          <section>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#9ca3af", textTransform: "uppercase" as const, display: "block", marginBottom: 8 }}>Réponse au client</label>
            <textarea value={reponse} onChange={e => setReponse(e.target.value)} rows={4}
              placeholder="Rédigez votre réponse qui sera envoyée au client…"
              style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "12px 14px", fontSize: 13, lineHeight: 1.6, resize: "vertical", outline: "none", fontFamily: "inherit", color: "#111827", boxSizing: "border-box" as const }}
              onFocus={e => (e.currentTarget.style.borderColor = "#2e7d4f")}
              onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
            />
          </section>

          {/* Note interne */}
          <section>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#9ca3af", textTransform: "uppercase" as const, display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
              <StickyNote size={11} />Note interne (non visible par le client)
            </label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              placeholder="Note privée pour l'équipe…"
              style={{ width: "100%", border: "1.5px solid #fde68a", borderRadius: 12, padding: "12px 14px", fontSize: 13, lineHeight: 1.6, resize: "vertical", outline: "none", fontFamily: "inherit", background: "#fffbeb", color: "#111827", boxSizing: "border-box" as const }}
            />
          </section>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, height: 42, border: "1.5px solid #e5e7eb", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer", background: "#fff" }}>Fermer</button>
          <button onClick={save} disabled={saving} style={{ flex: 2, height: 42, borderRadius: 12, fontSize: 13, fontWeight: 700, background: "linear-gradient(135deg,#2e7d4f,#3a9e63)", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, opacity: saving ? 0.7 : 1, boxShadow: "0 2px 10px rgba(46,125,79,0.3)" }}>
            {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={14} />}
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function AdminDevisPage() {
  const [items,    setItems]    = useState<DevisItem[]>([]);
  const [meta,     setMeta]     = useState({ total: 0, page: 1, pages: 1 });
  const [counts,   setCounts]   = useState<Record<string, number>>({});
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [statut,   setStatut]   = useState("");
  const [selected, setSelected] = useState<DevisItem | null>(null);
  const [curPage,  setCurPage]  = useState(1);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const p: Record<string, string> = { page: String(page), limit: "20" };
      if (search) p.search = search;
      if (statut) p.statut = statut;
      const [res, statsData] = await Promise.all([
        adminDevis.list(p),
        adminStats.dashboard().catch(() => null),
      ]);
      setItems(res.data);
      setMeta(res.meta as any);
      setCurPage(page);
      // Compteurs depuis l'endpoint /admin/devis/stats (plus fiable)
      const statsRes = await adminDevis.stats().catch(() => null);
      if (statsRes) {
        setCounts(statsRes as Record<string, number>);
      } else if (statsData?.devis?.par_statut) {
        setCounts(statsData.devis.par_statut);
      } else {
        // Fallback: calculer depuis la page courante
        const c: Record<string, number> = {};
        res.data.forEach((d: DevisItem) => { c[d.statut] = (c[d.statut] ?? 0) + 1; });
        setCounts(c);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, statut]);

  useEffect(() => { load(1); }, [load]);

  const openDetail = async (item: DevisItem) => {
    try { const full = await adminDevis.getById(item.id_devis); setSelected(full); }
    catch { setSelected(item); }
  };

  // Action rapide dans le tableau — avec validation préventive
  const quickStatus = async (item: DevisItem, s: string) => {
    const allowed = VALID_TRANSITIONS[item.statut] ?? [];
    if (!allowed.includes(s)) {
      toast.error(`Impossible : "${STATUT_MAP[item.statut]?.label}" ne peut pas passer à "${STATUT_MAP[s]?.label}".`);
      return;
    }
    try {
      await adminDevis.update(item.id_devis, { statut: s });
      load(curPage);
      toast.success(`${item.nom} → ${STATUT_MAP[s]?.label ?? s}`);
    } catch (e: any) {
      toast.error(e?.message?.includes("Transition") ? "Changement de statut non autorisé." : "Erreur.");
    }
  };

  const urgents = items.filter(isUrgent);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* En-tête */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: "-0.04em", display: "flex", alignItems: "center", gap: 10 }}>
            <FileText size={22} style={{ color: "#2e7d4f" }} />Demandes de devis
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            {meta.total} demandes au total
            {urgents.length > 0 && <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 700, color: "#dc2626", background: "#fef2f2", padding: "2px 8px", borderRadius: 20, border: "1px solid #fecaca" }}>⚡ {urgents.length} urgente{urgents.length > 1 ? "s" : ""}</span>}
          </p>
        </div>
        <button onClick={() => load(curPage)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 10, background: "#f9fafb", border: "1px solid #e5e7eb", cursor: "pointer", fontSize: 13, color: "#374151" }}>
          <RefreshCw size={13} />Actualiser
        </button>
      </div>

      {/* Pipeline compteurs */}
      <div style={{ display: "flex", gap: 12 }}>
        {PIPELINE.map(stage => (
          <PipelineCard key={stage.key} stage={stage} count={counts[stage.key] ?? 0} active={statut === stage.key} onClick={() => setStatut(s => s === stage.key ? "" : stage.key)} />
        ))}
      </div>

      {/* Filtres */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "12px 16px", display: "flex", gap: 10, flexWrap: "wrap" as const, alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" as const }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, email, produit…"
            style={{ width: "100%", height: 36, paddingLeft: 36, border: "1px solid #e5e7eb", borderRadius: 9, fontSize: 13, outline: "none", background: "#f9fafb", boxSizing: "border-box" as const, color: "#111827" }}
          />
        </div>
        {statut && (
          <button onClick={() => setStatut("")} style={{ display: "flex", alignItems: "center", gap: 5, height: 36, padding: "0 12px", borderRadius: 9, background: STATUT_MAP[statut]?.bg, border: `1px solid ${STATUT_MAP[statut]?.border}`, color: STATUT_MAP[statut]?.textLight, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            <Filter size={12} />{STATUT_MAP[statut]?.label}<X size={11} />
          </button>
        )}
      </div>

      {/* Tableau */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #dcfce7", borderTopColor: "#059669", animation: "spin2 0.8s linear infinite" }} />
            <style>{`@keyframes spin2{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center" as const, padding: "64px 0", color: "#9ca3af" }}>
            <FileText size={40} style={{ margin: "0 auto 12px", opacity: 0.2 }} />
            <p style={{ fontWeight: 600 }}>Aucune demande {statut ? `"${STATUT_MAP[statut]?.label}"` : ""}</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["Client", "Produit", "Statut", "Date", "Délai", "Action rapide", ""].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left" as const, fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" as const, letterSpacing: "0.06em", whiteSpace: "nowrap" as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  // Actions rapides = uniquement les transitions autorisées depuis ce statut
                  const actions = VALID_TRANSITIONS[item.statut] ?? [];
                  return (
                    <tr key={item.id_devis}
                      style={{ borderBottom: "1px solid #f3f4f6", background: isUrgent(item) ? "#fffbeb" : "transparent", transition: "background 0.1s", cursor: "pointer" }}
                      onMouseEnter={e => !isUrgent(item) && (e.currentTarget.style.background = "#fafafa")}
                      onMouseLeave={e => !isUrgent(item) && (e.currentTarget.style.background = "transparent")}
                      onClick={() => openDetail(item)}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#2e7d4f,#4fbb7a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                            {item.nom[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>
                              {item.nom}{isUrgent(item) && <span style={{ marginLeft: 6, fontSize: 11, color: "#dc2626" }}>⚡</span>}
                            </p>
                            <p style={{ fontSize: 12, color: "#9ca3af" }}>{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#374151" }}>
                        {item.produit ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Package size={11} style={{ color: "#9ca3af" }} />{item.produit.nom.slice(0, 30)}{item.produit.nom.length > 30 ? "…" : ""}</span>
                        ) : <span style={{ color: "#d1d5db" }}>—</span>}
                      </td>
                      <td style={{ padding: "12px 16px" }} onClick={e => e.stopPropagation()}>
                        <StatusBadge statut={item.statut} />
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" as const }}>{fmt(item.created_at)}</td>
                      <td style={{ padding: "12px 16px", fontSize: 12, whiteSpace: "nowrap" as const }}>
                        <span style={{ color: isUrgent(item) ? "#dc2626" : "#9ca3af", fontWeight: isUrgent(item) ? 700 : 400 }}>{hoursAgo(item.created_at)}</span>
                      </td>
                      {/* Actions rapides : uniquement VALID_TRANSITIONS */}
                      <td style={{ padding: "12px 16px" }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 4 }}>
                          {actions.length === 0 ? (
                            <span style={{ fontSize: 11, color: "#d1d5db", fontStyle: "italic" }}>—</span>
                          ) : (
                            actions.map(key => {
                              const s = STATUT_MAP[key];
                              if (!s) return null;
                              return (
                                <button key={key} onClick={() => quickStatus(item, key)} style={{ padding: "4px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.textLight, border: `1px solid ${s.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                                  <s.icon size={9} />{s.label}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <button style={{ width: 30, height: 30, borderRadius: 8, background: "#f0fdf4", border: "1px solid #a7f3d0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <ChevronRight size={14} style={{ color: "#059669" }} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {meta.pages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid #f3f4f6" }}>
            <p style={{ fontSize: 12, color: "#9ca3af" }}>{meta.total} demandes · page {curPage}/{meta.pages}</p>
            <div style={{ display: "flex", gap: 6 }}>
              <button disabled={curPage <= 1} onClick={() => load(curPage - 1)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: curPage <= 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: curPage <= 1 ? 0.4 : 1 }}>
                <ChevronLeft size={14} style={{ color: "#6b7280" }} />
              </button>
              <button disabled={curPage >= meta.pages} onClick={() => load(curPage + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: curPage >= meta.pages ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: curPage >= meta.pages ? 0.4 : 1 }}>
                <ChevronRight size={14} style={{ color: "#6b7280" }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selected && <DevisDetailPanel item={selected} onClose={() => setSelected(null)} onSaved={() => load(curPage)} />}
    </div>
  );
}