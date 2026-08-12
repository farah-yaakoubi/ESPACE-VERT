"use client";
import { useEffect, useState, useCallback } from "react";
import { adminContact, type ContactItem } from "@/lib/admin-api";
import {
  Search, RefreshCw, MessageSquare, ChevronRight, X, Send,
  Mail, Clock, User, CheckCircle2, AlertCircle,
  Loader2, Reply, StickyNote, Filter, Inbox,
  ChevronLeft, Trash2,
} from "lucide-react";
import { toast } from "@/components/admin/Toast";

// ─── Statuts calculés localement (pas de champ statut en DB pour contact) ─────
// Le backend contact N'A PAS de route /statut — statut est déduit de lu + replied_at
function computeStatut(item: ContactItem): "non_lu" | "lu" | "repondu" {
  if (item.replied_at) return "repondu";
  if (!item.lu)        return "non_lu";
  return "lu";
}

const STATUT_CONFIG = {
  non_lu:  { label: "Non lu",   icon: AlertCircle,  color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", textLight: "#1d4ed8" },
  lu:      { label: "Lu",       icon: Clock,        color: "#d97706", bg: "#fffbeb", border: "#fde68a", textLight: "#b45309" },
  repondu: { label: "Répondu",  icon: CheckCircle2, color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", textLight: "#047857" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(d: string) {
  const dt  = new Date(d);
  const now = new Date();
  const diffH = (now.getTime() - dt.getTime()) / 36e5;
  if (diffH < 1)  return "À l'instant";
  if (diffH < 24) return `Il y a ${Math.floor(diffH)}h`;
  if (diffH < 48) return "Hier " + dt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return dt.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtFull(d: string) {
  return new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─── Badge statut ─────────────────────────────────────────────────────────────
function StatusBadge({ item }: { item: ContactItem }) {
  const key = computeStatut(item);
  const s   = STATUT_CONFIG[key];
  const Icon = s.icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: s.bg, color: s.textLight, border: `1px solid ${s.border}`, fontSize: 11, fontWeight: 700 }}>
      <Icon size={10} />{s.label}
    </span>
  );
}

// ─── Panneau de détail ────────────────────────────────────────────────────────
function ContactDetailPanel({ item, onClose, onSaved }: { item: ContactItem; onClose: () => void; onSaved: () => void }) {
  const [saving,  setSaving]  = useState(false);
  const [reponse, setReponse] = useState("");
  const [tab,     setTab]     = useState<"reply" | "note">("reply");

  const statut     = computeStatut(item);
  const sc         = STATUT_CONFIG[statut];
  const hasReplied = !!item.replied_at;

  const sendReply = async () => {
    if (!reponse.trim()) return;
    setSaving(true);
    try {
      await adminContact.reply(item.id_contact, reponse);
      toast.success("Réponse envoyée par email ✓");
      onSaved(); onClose();
    } catch { toast.error("Erreur lors de l'envoi"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 560, background: "#fff", height: "100vh", display: "flex", flexDirection: "column", animation: "slideInRight 0.3s cubic-bezier(0.22,1,0.36,1)", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
        <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}} @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <MessageSquare size={19} style={{ color: "#2563eb" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, marginBottom: 4 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>{item.nom}</h2>
                <StatusBadge item={item} />
              </div>
              <p style={{ fontSize: 12, color: "#9ca3af" }}>{item.email} · {fmtFull(item.created_at)}</p>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, flexShrink: 0 }}><X size={18} /></button>
          </div>
        </div>

        {/* Corps */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Sujet */}
          {item.sujet && (
            <div style={{ background: "#f9fafb", borderRadius: 12, padding: "12px 16px" }}>
              <p style={{ fontSize: 10, color: "#9ca3af", marginBottom: 4 }}>Sujet</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{item.sujet}</p>
            </div>
          )}

          {/* Message original */}
          <section>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#9ca3af", textTransform: "uppercase" as const, display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
              <Mail size={11} />Message reçu
            </p>
            <div style={{ background: "#f9fafb", borderRadius: 12, padding: "16px", fontSize: 13, color: "#374151", lineHeight: 1.8, whiteSpace: "pre-wrap" as const, borderLeft: "3px solid #e5e7eb" }}>
              {item.message}
            </div>
          </section>

          {/* Réponse déjà envoyée */}
          {item.reponse && (
            <section>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#047857", textTransform: "uppercase" as const, display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                <Reply size={11} />Réponse envoyée · {item.replied_at ? fmtFull(item.replied_at) : ""}
              </p>
              <div style={{ background: "#ecfdf5", borderRadius: 12, padding: "16px", fontSize: 13, color: "#065f46", lineHeight: 1.8, whiteSpace: "pre-wrap" as const, borderLeft: "3px solid #a7f3d0" }}>
                {item.reponse}
              </div>
            </section>
          )}

          {/* Indicateur d'état — honnête, pas de faux boutons de statut */}
          <section>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#9ca3af", textTransform: "uppercase" as const, marginBottom: 10 }}>
              État du message
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {(["non_lu", "lu", "repondu"] as const).map(k => {
                const s    = STATUT_CONFIG[k];
                const Icon = s.icon;
                const steps = ["non_lu", "lu", "repondu"] as const;
                const curIdx  = steps.indexOf(statut);
                const stepIdx = steps.indexOf(k);
                const isDone   = stepIdx < curIdx;
                const isCurrent = stepIdx === curIdx;
                return (
                  <div key={k} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 8px", borderRadius: 12, background: isCurrent ? s.bg : isDone ? "#f9fafb" : "#f9fafb", border: `1.5px solid ${isCurrent ? s.border : "#e5e7eb"}` }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: isDone || isCurrent ? s.color : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isDone ? <CheckCircle2 size={14} style={{ color: "#fff" }} /> : <Icon size={14} style={{ color: isDone || isCurrent ? "#fff" : "#9ca3af" }} />}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? s.textLight : "#9ca3af", textAlign: "center" as const }}>{s.label}</span>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
              {statut === "non_lu" && "Ce message n'a pas encore été ouvert."}
              {statut === "lu"     && "Message lu. En attente d'une réponse."}
              {statut === "repondu"&& "Une réponse a déjà été envoyée à ce contact."}
            </p>
          </section>

          {/* Onglets Réponse / Note */}
          <section>
            <div style={{ display: "flex", gap: 0, background: "#f9fafb", borderRadius: 10, padding: 3, marginBottom: 12, width: "fit-content" }}>
              {[
                { key: "reply", label: "Répondre",     icon: Reply },
                { key: "note",  label: "Note interne", icon: StickyNote },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key as any)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, background: tab === t.key ? "#fff" : "transparent", boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: tab === t.key ? 700 : 500, color: tab === t.key ? "#111827" : "#9ca3af" }}>
                  <t.icon size={12} />{t.label}
                </button>
              ))}
            </div>

            {tab === "reply" && (
              <div>
                {hasReplied && (
                  <div style={{ padding: "10px 14px", background: "#fefce8", borderRadius: 10, border: "1px solid #fde68a", fontSize: 12, color: "#92400e", display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <Reply size={13} />Déjà répondu — vous pouvez envoyer une nouvelle réponse.
                  </div>
                )}
                <textarea value={reponse} onChange={e => setReponse(e.target.value)} rows={5}
                  placeholder={`Bonjour ${item.nom.split(" ")[0]},\n\nMerci pour votre message…`}
                  style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "12px 14px", fontSize: 13, lineHeight: 1.7, resize: "vertical", outline: "none", fontFamily: "inherit", color: "#111827", boxSizing: "border-box" as const, marginBottom: 10 }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#2563eb")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#eff6ff", borderRadius: 10, border: "1px solid #bfdbfe", fontSize: 12, color: "#1d4ed8" }}>
                  <Mail size={13} />
                  <span>La réponse sera envoyée à <strong>{item.email}</strong></span>
                </div>
              </div>
            )}

            {tab === "note" && (
              <div style={{ padding: "12px 16px", background: "#fffbeb", borderRadius: 12, border: "1px solid #fde68a", fontSize: 13, color: "#92400e" }}>
                <StickyNote size={14} style={{ marginBottom: 8 }} />
                <p style={{ fontWeight: 600, marginBottom: 4 }}>Note interne</p>
                <p style={{ fontSize: 12 }}>Les notes internes ne sont pas encore disponibles pour les messages de contact dans cette version.</p>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, height: 42, border: "1.5px solid #e5e7eb", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer", background: "#fff" }}>Fermer</button>
          {tab === "reply" && (
            <button onClick={sendReply} disabled={saving || !reponse.trim()} style={{ flex: 2, height: 42, borderRadius: 12, fontSize: 13, fontWeight: 700, background: "linear-gradient(135deg,#2563eb,#3b82f6)", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, opacity: saving || !reponse.trim() ? 0.55 : 1, boxShadow: "0 2px 10px rgba(37,99,235,0.3)" }}>
              {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={14} />}
              {saving ? "Envoi en cours…" : "Envoyer la réponse"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Carte message ────────────────────────────────────────────────────────────
function MessageCard({ item, onClick, onDelete }: { item: ContactItem; onClick: () => void; onDelete: (id: number) => void }) {
  const statut = computeStatut(item);
  const sc     = STATUT_CONFIG[statut];
  const isNew  = !item.lu;

  return (
    <div
      style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px", borderBottom: "1px solid #f3f4f6", background: isNew ? "#fefce8" : "transparent", cursor: "pointer", transition: "background 0.1s", position: "relative" as const }}
      onMouseEnter={e => !isNew && (e.currentTarget.style.background = "#fafafa")}
      onMouseLeave={e => !isNew && (e.currentTarget.style.background = "transparent")}
      onClick={onClick}
    >
      {isNew && <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "#2563eb", borderRadius: "0 3px 3px 0" }} />}

      {/* Avatar */}
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: isNew ? "#2563eb" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15, fontWeight: 700, color: isNew ? "#fff" : "#6b7280" }}>
        {item.nom[0]?.toUpperCase()}
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: isNew ? 800 : 600, color: "#111827", whiteSpace: "nowrap" as const }}>{item.nom}</p>
            {isNew && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2563eb", flexShrink: 0 }} />}
            <StatusBadge item={item} />
          </div>
          <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" as const, flexShrink: 0 }}>{fmt(item.created_at)}</span>
        </div>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{item.email}</p>
        {item.sujet && <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 3 }}>{item.sujet}</p>}
        <p style={{ fontSize: 12, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
          {item.message.slice(0, 100)}{item.message.length > 100 ? "…" : ""}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        {!item.replied_at && (
          <div style={{ padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", gap: 4 }}>
            <Reply size={9} />Répondre
          </div>
        )}
        <button onClick={() => onDelete(item.id_contact)} style={{ padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          <Trash2 size={9} />Supprimer
        </button>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function AdminContactPage() {
  const [items,    setItems]    = useState<ContactItem[]>([]);
  const [meta,     setMeta]     = useState({ total: 0, page: 1, pages: 1 });
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [luFilter, setLuFilter] = useState("");
  const [selected, setSelected] = useState<ContactItem | null>(null);
  const [curPage,  setCurPage]  = useState(1);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const p: Record<string, string> = { page: String(page), limit: "20" };
      if (search)   p.search = search;
      if (luFilter) p.lu     = luFilter;
      const res = await adminContact.list(p);
      setItems(res.data);
      setMeta(res.meta as any);
      setCurPage(page);
    } catch { }
    finally { setLoading(false); }
  }, [search, luFilter]);

  useEffect(() => { load(1); }, [load]);

  const openDetail = async (item: ContactItem) => {
    try { const full = await adminContact.getById(item.id_contact); setSelected(full); }
    catch { setSelected(item); }
  };

  const remove = async (id: number) => {
    if (!confirm("Supprimer ce message définitivement ?")) return;
    try {
      await adminContact.remove(id);
      toast.success("Message supprimé");
      load(curPage);
    } catch { toast.error("Erreur lors de la suppression"); }
  };

  const nonLus   = items.filter(m => !m.lu).length;
  const repondus = items.filter(m => !!m.replied_at).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* En-tête */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: "-0.04em", display: "flex", alignItems: "center", gap: 10 }}>
            <MessageSquare size={22} style={{ color: "#2563eb" }} />Messages de contact
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            {meta.total} messages au total
            {nonLus > 0 && <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, color: "#2563eb", background: "#eff6ff", padding: "2px 8px", borderRadius: 20, border: "1px solid #bfdbfe" }}>{nonLus} non lu{nonLus > 1 ? "s" : ""}</span>}
          </p>
        </div>
        <button onClick={() => load(curPage)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 10, background: "#f9fafb", border: "1px solid #e5e7eb", cursor: "pointer", fontSize: 13, color: "#374151" }}>
          <RefreshCw size={13} />Actualiser
        </button>
      </div>

      {/* Compteurs état */}
      <div style={{ display: "flex", gap: 12 }}>
        {[
          { key: "non_lu",  label: "Non lus",  count: items.filter(m => !m.lu).length,             icon: AlertCircle,  color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", textLight: "#1d4ed8" },
          { key: "lu",      label: "Lus",       count: items.filter(m => m.lu && !m.replied_at).length, icon: Clock, color: "#d97706", bg: "#fffbeb", border: "#fde68a", textLight: "#b45309" },
          { key: "repondu", label: "Répondus",  count: repondus,                                    icon: CheckCircle2, color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", textLight: "#047857" },
        ].map(({ key, label, count, icon: Icon, color, bg, border, textLight }) => (
          <div key={key} style={{ flex: 1, background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
              <Icon size={15} style={{ color }} />
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: "-0.04em", lineHeight: 1 }}>{count}</p>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "12px 16px", display: "flex", gap: 10, flexWrap: "wrap" as const, alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" as const }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, email, sujet…"
            style={{ width: "100%", height: 36, paddingLeft: 36, border: "1px solid #e5e7eb", borderRadius: 9, fontSize: 13, outline: "none", background: "#f9fafb", boxSizing: "border-box" as const, color: "#111827" }}
          />
        </div>
        <div style={{ display: "flex", gap: 0, background: "#f9fafb", borderRadius: 10, padding: 3 }}>
          {[
            { key: "",      label: "Tous" },
            { key: "false", label: "Non lus" },
            { key: "true",  label: "Lus" },
          ].map(f => (
            <button key={f.key} onClick={() => setLuFilter(v => v === f.key ? "" : f.key)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: luFilter === f.key ? 700 : 500, background: luFilter === f.key ? "#fff" : "transparent", color: luFilter === f.key ? "#111827" : "#9ca3af", boxShadow: luFilter === f.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderBottom: "1px solid #f3f4f6" }}>
          <Inbox size={14} style={{ color: "#9ca3af" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Boîte de réception</span>
          {nonLus > 0 && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, background: "#2563eb", color: "#fff", padding: "2px 8px", borderRadius: 20 }}>{nonLus} nouveau{nonLus > 1 ? "x" : ""}</span>}
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #dbeafe", borderTopColor: "#2563eb", animation: "spin3 0.8s linear infinite" }} />
            <style>{`@keyframes spin3{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center" as const, padding: "64px 0", color: "#9ca3af" }}>
            <Inbox size={40} style={{ margin: "0 auto 12px", opacity: 0.2 }} />
            <p style={{ fontWeight: 600 }}>Aucun message</p>
          </div>
        ) : (
          items.map(item => (
            <MessageCard key={item.id_contact} item={item} onClick={() => openDetail(item)} onDelete={remove} />
          ))
        )}

        {meta.pages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid #f3f4f6" }}>
            <p style={{ fontSize: 12, color: "#9ca3af" }}>{meta.total} messages · page {curPage}/{meta.pages}</p>
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

      {selected && <ContactDetailPanel item={selected} onClose={() => setSelected(null)} onSaved={() => load(curPage)} />}
    </div>
  );
}