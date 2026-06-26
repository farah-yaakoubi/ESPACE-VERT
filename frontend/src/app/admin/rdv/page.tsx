"use client";
/**
 * app/admin/rdv/page.tsx — VERSION CORRIGÉE
 * ─────────────────────────────────────────────────────────────────────────────
 * CORRECTIONS v2 :
 *  • Suppression du statut "en_cours" qui n'existe PAS dans le backend
 *    (backend accepte uniquement : nouveau → confirme/annule → termine/annule)
 *  • Boutons d'action rapide filtrés selon les transitions autorisées
 *  • Pipeline simplifié avec libellés clairs pour les non-techniciens
 *  • Rapport de visite affiché uniquement pour statut "termine"
 *  • Gestion d'erreur claire lors d'une transition refusée
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import { adminRdv, tokenStore, type RdvItem } from "@/lib/admin-api";
import {
  Search, RefreshCw, Calendar, ChevronRight, ChevronLeft, X,
  Clock, User, Mail, Phone, MapPin, StickyNote, CheckCircle2,
  XCircle, AlertCircle, Loader2, Droplets, Building2, Filter,
  CalendarDays, Star, Send,
} from "lucide-react";
import { toast } from "@/components/admin/Toast";

// ─── Types de service ─────────────────────────────────────────────────────────
const SERVICE_TYPES = {
  bureau_etudes: {
    key: "bureau_etudes",
    label: "Bureau d'études",
    labelShort: "Bureau d'études",
    icon: Building2,
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    textLight: "#1d4ed8",
    agences: ["Tunis — Bureau central", "Sfax — Antenne Sud"],
    description: "Étude de projet, plans, dimensionnement",
  },
  irrigation: {
    key: "irrigation",
    label: "Installation d'irrigation",
    labelShort: "Irrigation",
    icon: Droplets,
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    textLight: "#047857",
    agences: ["Tunis", "Soliman", "Borj Amri", "Sfax"],
    description: "Installation, maintenance système d'irrigation",
  },
};

// ─── Pipeline statuts CORRECT (aligné sur le backend) ─────────────────────────
// Backend RDV_STATUTS = ["nouveau", "confirme", "annule", "termine"]
// Transitions autorisées :
//   nouveau  → confirme | annule
//   confirme → termine  | annule
//   annule   → (terminal)
//   termine  → (terminal)
const PIPELINE = [
  { key: "nouveau",  label: "À confirmer", icon: AlertCircle,  color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", textLight: "#1d4ed8" },
  { key: "confirme", label: "Confirmé",    icon: CheckCircle2, color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", textLight: "#047857" },
  { key: "termine",  label: "Terminé",     icon: Star,         color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", textLight: "#6d28d9" },
  { key: "annule",   label: "Annulé",      icon: XCircle,      color: "#dc2626", bg: "#fef2f2", border: "#fecaca", textLight: "#b91c1c" },
];
const STATUT_MAP = Object.fromEntries(PIPELINE.map(s => [s.key, s]));

// Transitions valides (miroir exact du backend)
const VALID_TRANSITIONS: Record<string, string[]> = {
  nouveau:  ["confirme", "annule"],
  confirme: ["termine",  "annule"],
  annule:   [],
  termine:  [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(d: string) {
  return new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}
function fmtDateShort(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}
function isToday(d: string) {
  return new Date(d).toDateString() === new Date().toDateString();
}
function isThisWeek(d: string) {
  const now = new Date();
  const dt  = new Date(d);
  const startWeek = new Date(now); startWeek.setDate(now.getDate() - now.getDay());
  const endWeek   = new Date(startWeek); endWeek.setDate(startWeek.getDate() + 7);
  return dt >= startWeek && dt <= endWeek;
}
function detectService(rdv: RdvItem): "bureau_etudes" | "irrigation" | null {
  const objet = (rdv.objet ?? "").toLowerCase();
  const msg   = (rdv.message ?? "").toLowerCase();
  if (objet.includes("bureau") || objet.includes("étude") || objet.includes("plan") || objet.includes("dimensi")) return "bureau_etudes";
  if (objet.includes("irrigat") || objet.includes("arros") || objet.includes("goute") || objet.includes("aspers")) return "irrigation";
  if (msg.includes("bureau") || msg.includes("étude")) return "bureau_etudes";
  if (msg.includes("irrigat") || msg.includes("arros")) return "irrigation";
  return null;
}

// ─── Badge statut ─────────────────────────────────────────────────────────────
function StatusBadge({ statut }: { statut: string }) {
  const s = STATUT_MAP[statut] ?? { label: statut, color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb", textLight: "#374151", icon: AlertCircle };
  const Icon = s.icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: s.bg, color: s.textLight, border: `1px solid ${s.border}`, fontSize: 11, fontWeight: 700 }}>
      <Icon size={10} />{s.label}
    </span>
  );
}

// ─── Badge type de service ────────────────────────────────────────────────────
function ServiceBadge({ service }: { service: typeof SERVICE_TYPES[keyof typeof SERVICE_TYPES] | null }) {
  if (!service) return null;
  const Icon = service.icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 20, background: service.bg, color: service.textLight, border: `1px solid ${service.border}`, fontSize: 10, fontWeight: 700 }}>
      <Icon size={9} />{service.labelShort}
    </span>
  );
}

// ─── Mini agenda semaine ──────────────────────────────────────────────────────
function WeekAgenda({ items, onDayClick }: { items: RdvItem[]; onDayClick: (day: string) => void }) {
  const today = new Date();
  const days  = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - today.getDay() + i + 1);
    return d;
  });

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>Semaine en cours</p>
        <CalendarDays size={14} style={{ color: "#9ca3af" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {days.map(d => {
          const dayStr  = d.toISOString().split("T")[0];
          const dayName = d.toLocaleDateString("fr-FR", { weekday: "short" });
          const dayNum  = d.getDate();
          const rdvsDay = items.filter(r => r.date_souhaitee?.startsWith(dayStr));
          const isNow   = d.toDateString() === new Date().toDateString();
          return (
            <button key={dayStr} onClick={() => rdvsDay.length > 0 && onDayClick(dayStr)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 4px", borderRadius: 10, background: isNow ? "#2e7d4f" : "transparent", cursor: rdvsDay.length > 0 ? "pointer" : "default", border: "none", transition: "background 0.15s" }}>
              <span style={{ fontSize: 9, color: isNow ? "rgba(255,255,255,0.7)" : "#9ca3af", textTransform: "uppercase" as const, fontWeight: 600 }}>{dayName}</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: isNow ? "#fff" : "#111827" }}>{dayNum}</span>
              {rdvsDay.length > 0 && (
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: isNow ? "rgba(255,255,255,0.3)" : "#2e7d4f22", color: isNow ? "#fff" : "#2e7d4f", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {rdvsDay.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Panneau de détail RDV ────────────────────────────────────────────────────
function RdvDetailPanel({ item, onClose, onSaved }: { item: RdvItem; onClose: () => void; onSaved: () => void }) {
  const [saving,         setSaving]         = useState(false);
  const [statut,         setStatut]         = useState(item.statut);
  const [note,           setNote]           = useState(item.note_interne ?? "");
  const [dateConfirmee,  setDateConfirmee]  = useState(item.date_souhaitee?.split("T")[0] ?? "");
  const [heureConfirmee, setHeureConfirmee] = useState(item.heure ?? "");
  const [technicien,     setTechnicien]     = useState((item as any).technicien ?? "");
  const [rapport,        setRapport]        = useState((item as any).rapport_visite ?? "");
  const [reponse,        setReponse]        = useState((item as any).reponse_admin ?? "");

  const service     = SERVICE_TYPES[detectService(item) as keyof typeof SERVICE_TYPES] ?? null;
  const ServiceIcon = service?.icon ?? Calendar;

  // Transitions autorisées depuis le statut courant
  const nextStatuts = VALID_TRANSITIONS[statut] ?? [];
  const isTerminal  = nextStatuts.length === 0;

  const save = async () => {
    setSaving(true);
    try {
      await adminRdv.update(item.id_rdv, {
        statut,
        note_interne:     note,
        ...(dateConfirmee  ? { date_confirmee: dateConfirmee }  : {}),
        ...(heureConfirmee ? { heure_confirmee: heureConfirmee } : {}),
        ...(technicien     ? { technicien }                     : {}),
        ...(rapport        ? { rapport_visite: rapport }        : {}),
        ...(reponse        ? { reponse_admin: reponse }         : {}),
      } as any);
      toast.success("RDV mis à jour");
      onSaved(); onClose();
    } catch (e: any) {
      const msg = e?.message ?? "Erreur de sauvegarde";
      toast.error(msg.includes("Transition") ? "Ce changement de statut n'est pas autorisé à ce stade." : msg);
    }
    finally { setSaving(false); }
  };

  // Changer statut avec validation côté client avant envoi
  const quickStatus = async (s: string) => {
    const allowed = VALID_TRANSITIONS[statut] ?? [];
    if (!allowed.includes(s)) {
      toast.error(`Impossible de passer de "${STATUT_MAP[statut]?.label}" à "${STATUT_MAP[s]?.label}".`);
      return;
    }
    try {
      await adminRdv.update(item.id_rdv, { statut: s });
      setStatut(s);
      toast.success(`Statut mis à jour → ${STATUT_MAP[s]?.label ?? s}`);
    } catch (e: any) {
      toast.error("Erreur lors du changement de statut.");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 580, background: "#fff", height: "100vh", display: "flex", flexDirection: "column", animation: "slideInRight 0.3s cubic-bezier(0.22,1,0.36,1)", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
        <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}} @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: service ? service.bg : "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ServiceIcon size={20} style={{ color: service ? service.color : "#059669" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, marginBottom: 4 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>RDV #{item.id_rdv}</h2>
                <StatusBadge statut={statut} />
                {service && <ServiceBadge service={service} />}
                {isToday(item.date_souhaitee) && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" }}>📅 Aujourd'hui</span>
                )}
              </div>
              <p style={{ fontSize: 12, color: "#9ca3af" }}>Demandé le {fmt(item.created_at)}</p>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, flexShrink: 0 }}><X size={18} /></button>
          </div>
        </div>

        {/* Corps */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 22 }}>

          {/* Infos client */}
          <section>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#9ca3af", textTransform: "uppercase" as const, marginBottom: 10 }}>Client</p>
            <div style={{ background: "#f9fafb", borderRadius: 12, padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { icon: User,   label: "Nom",       val: item.nom },
                { icon: Mail,   label: "Email",      val: item.email },
                { icon: Phone,  label: "Téléphone",  val: item.telephone ?? "—" },
                { icon: MapPin, label: "Agence",     val: item.agence ?? "—" },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label}>
                  <p style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2, display: "flex", alignItems: "center", gap: 4 }}>
                    <Icon size={10} />{label}
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{val}</p>
                </div>
              ))}
              {item.objet && (
                <div style={{ gridColumn: "1/-1" }}>
                  <p style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>Objet de la demande</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: service ? service.color : "#111827" }}>{item.objet}</p>
                </div>
              )}
            </div>
          </section>

          {/* Message */}
          {item.message && (
            <section>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#9ca3af", textTransform: "uppercase" as const, marginBottom: 8 }}>Détails de la demande</p>
              <div style={{ background: "#f9fafb", borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "#374151", lineHeight: 1.7, whiteSpace: "pre-wrap" as const }}>{item.message}</div>
            </section>
          )}

          {/* Étapes du dossier — transitions valides uniquement */}
          <section>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#9ca3af", textTransform: "uppercase" as const, marginBottom: 10 }}>
              Avancement du dossier
            </p>

            {isTerminal ? (
              <div style={{ background: statut === "annule" ? "#fef2f2" : "#f5f3ff", border: `1px solid ${statut === "annule" ? "#fecaca" : "#ddd6fe"}`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                {statut === "annule"
                  ? <XCircle size={16} style={{ color: "#dc2626" }} />
                  : <Star size={16} style={{ color: "#7c3aed" }} />}
                <span style={{ fontSize: 13, fontWeight: 600, color: statut === "annule" ? "#b91c1c" : "#6d28d9" }}>
                  {statut === "annule" ? "Ce rendez-vous a été annulé." : "Ce rendez-vous est terminé."}
                </span>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 10 }}>
                  Prochaine étape — cliquez pour changer le statut :
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                  {nextStatuts.map(key => {
                    const s = STATUT_MAP[key];
                    if (!s) return null;
                    const Icon = s.icon;
                    return (
                      <button key={key} onClick={() => quickStatus(key)} style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
                        borderRadius: 12, border: `1.5px solid ${s.border}`,
                        background: s.bg, color: s.textLight, cursor: "pointer",
                        fontSize: 13, fontWeight: 700, transition: "all 0.15s",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      }}>
                        <Icon size={14} />
                        {key === "confirme" ? "✓ Confirmer ce RDV" :
                         key === "termine"  ? "✓ Marquer comme terminé" :
                         key === "annule"   ? "✗ Annuler" : s.label}
                      </button>
                    );
                  })}
                </div>
                <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
                  Statut actuel : <strong style={{ color: "#374151" }}>{STATUT_MAP[statut]?.label ?? statut}</strong>
                </p>
              </div>
            )}
          </section>

          {/* Planification */}
          <section>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#9ca3af", textTransform: "uppercase" as const, marginBottom: 10 }}>
              Planification du rendez-vous
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, display: "block", marginBottom: 6 }}>
                  Date souhaitée (client)
                </label>
                <div style={{ padding: "9px 12px", background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 13, color: "#374151" }}>
                  {fmtDate(item.date_souhaitee)}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, display: "block", marginBottom: 6 }}>
                  Heure demandée
                </label>
                <div style={{ padding: "9px 12px", background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 13, color: "#374151" }}>
                  {item.heure ?? "Non précisée"}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#059669", fontWeight: 700, display: "block", marginBottom: 6 }}>
                  ✓ Date confirmée
                </label>
                <input type="date" value={dateConfirmee} onChange={e => setDateConfirmee(e.target.value)}
                  style={{ width: "100%", height: 38, padding: "0 12px", border: "1.5px solid #a7f3d0", borderRadius: 10, fontSize: 13, background: "#ecfdf5", color: "#111827", outline: "none", boxSizing: "border-box" as const }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#059669", fontWeight: 700, display: "block", marginBottom: 6 }}>
                  ✓ Heure confirmée
                </label>
                <select value={heureConfirmee} onChange={e => setHeureConfirmee(e.target.value)}
                  style={{ width: "100%", height: 38, padding: "0 12px", border: "1.5px solid #a7f3d0", borderRadius: 10, fontSize: 13, background: "#ecfdf5", color: "#111827", outline: "none", boxSizing: "border-box" as const }}>
                  <option value="">Choisir un créneau</option>
                  {["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30"].map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Technicien assigné */}
          <section>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#9ca3af", textTransform: "uppercase" as const, display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
              {service?.key === "bureau_etudes" ? "Ingénieur assigné" : "Technicien assigné"}
            </label>
            <input
              type="text"
              value={technicien}
              onChange={e => setTechnicien(e.target.value)}
              placeholder={service?.key === "bureau_etudes" ? "Nom de l'ingénieur responsable…" : "Nom du technicien d'irrigation…"}
              style={{ width: "100%", height: 38, padding: "0 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13, outline: "none", fontFamily: "inherit", color: "#111827", boxSizing: "border-box" as const }}
              onFocus={e => (e.currentTarget.style.borderColor = service ? service.color : "#2e7d4f")}
              onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
            />
          </section>

          {/* Réponse au client */}
          <section>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#9ca3af", textTransform: "uppercase" as const, display: "block", marginBottom: 8 }}>
              Message de confirmation au client
            </label>
            <textarea value={reponse} onChange={e => setReponse(e.target.value)} rows={3}
              placeholder="Message de confirmation envoyé au client…"
              style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "12px 14px", fontSize: 13, lineHeight: 1.6, resize: "vertical", outline: "none", fontFamily: "inherit", color: "#111827", boxSizing: "border-box" as const }}
              onFocus={e => (e.currentTarget.style.borderColor = "#2e7d4f")}
              onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
            />
          </section>

          {/* Rapport de visite — uniquement si le RDV est terminé */}
          {statut === "termine" && (
            <section>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#9ca3af", textTransform: "uppercase" as const, display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                <Star size={11} />
                Rapport de visite / Compte-rendu
              </label>
              <textarea value={rapport} onChange={e => setRapport(e.target.value)} rows={4}
                placeholder="Travaux effectués, observations, recommandations…"
                style={{ width: "100%", border: "1.5px solid #ddd6fe", borderRadius: 12, padding: "12px 14px", fontSize: 13, lineHeight: 1.6, resize: "vertical", outline: "none", fontFamily: "inherit", background: "#f5f3ff", color: "#111827", boxSizing: "border-box" as const }}
              />
            </section>
          )}

          {/* Note interne */}
          <section>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#9ca3af", textTransform: "uppercase" as const, display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
              <StickyNote size={11} />
              Note interne (équipe uniquement)
            </label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              placeholder="Notes privées pour l'équipe…"
              style={{ width: "100%", border: "1.5px solid #fde68a", borderRadius: 12, padding: "12px 14px", fontSize: 13, lineHeight: 1.6, resize: "vertical", outline: "none", fontFamily: "inherit", background: "#fffbeb", color: "#111827", boxSizing: "border-box" as const }}
            />
          </section>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, height: 42, border: "1.5px solid #e5e7eb", borderRadius: 12, fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer", background: "#fff" }}>
            Fermer
          </button>
          <button onClick={save} disabled={saving} style={{
            flex: 2, height: 42, borderRadius: 12, fontSize: 13, fontWeight: 700,
            background: service ? `linear-gradient(135deg,${service.color},${service.color}dd)` : "linear-gradient(135deg,#2e7d4f,#3a9e63)",
            color: "#fff", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            opacity: saving ? 0.7 : 1, boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
          }}>
            {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={14} />}
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Ligne de tableau ─────────────────────────────────────────────────────────
function RdvRow({ rdv, onClick, onQuickStatus }: { rdv: RdvItem; onClick: () => void; onQuickStatus: (id: number, s: string) => void }) {
  const service = SERVICE_TYPES[detectService(rdv) as keyof typeof SERVICE_TYPES] ?? null;
  const today   = isToday(rdv.date_souhaitee);
  // Seules les transitions autorisées sont affichées
  const nextStatuts = (VALID_TRANSITIONS[rdv.statut] ?? []).slice(0, 2);

  return (
    <tr style={{ borderBottom: "1px solid #f3f4f6", transition: "background 0.1s", cursor: "pointer", background: today ? "#fffbeb" : "transparent" }}
      onMouseEnter={e => !today && (e.currentTarget.style.background = "#fafafa")}
      onMouseLeave={e => !today && (e.currentTarget.style.background = "transparent")}
      onClick={onClick}
    >
      {/* Client */}
      <td style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: service ? `linear-gradient(135deg,${service.color},${service.color}aa)` : "linear-gradient(135deg,#6b7280,#9ca3af)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {rdv.nom[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>{rdv.nom}</p>
            <p style={{ fontSize: 11, color: "#9ca3af" }}>{rdv.email}</p>
          </div>
        </div>
      </td>

      {/* Service */}
      <td style={{ padding: "12px 16px" }}>
        {service ? <ServiceBadge service={service} /> : <span style={{ fontSize: 11, color: "#d1d5db" }}>—</span>}
      </td>

      {/* Date souhaitée */}
      <td style={{ padding: "12px 16px" }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: today ? "#b45309" : isThisWeek(rdv.date_souhaitee) ? "#2563eb" : "#374151", display: "flex", alignItems: "center", gap: 5 }}>
            {today && "📅 "}
            {fmtDate(rdv.date_souhaitee)}
          </p>
          <p style={{ fontSize: 11, color: "#9ca3af" }}>{rdv.heure ?? "Heure à confirmer"}</p>
        </div>
      </td>

      {/* Agence */}
      <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <MapPin size={11} style={{ color: "#d1d5db" }} />
          {rdv.agence ?? "—"}
        </span>
      </td>

      {/* Statut */}
      <td style={{ padding: "12px 16px" }} onClick={e => e.stopPropagation()}>
        <StatusBadge statut={rdv.statut} />
      </td>

      {/* Actions rapides — uniquement transitions valides */}
      <td style={{ padding: "12px 16px" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", gap: 4 }}>
          {nextStatuts.length === 0 ? (
            <span style={{ fontSize: 10, color: "#d1d5db", fontStyle: "italic" }}>—</span>
          ) : (
            nextStatuts.map(key => {
              const s = STATUT_MAP[key];
              if (!s) return null;
              return (
                <button key={key} onClick={() => onQuickStatus(rdv.id_rdv, key)} style={{
                  padding: "4px 9px", borderRadius: 20, fontSize: 10, fontWeight: 600,
                  background: s.bg, color: s.textLight, border: `1px solid ${s.border}`,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                }}>
                  <s.icon size={9} />{s.label}
                </button>
              );
            })
          )}
        </div>
      </td>

      {/* Ouvrir */}
      <td style={{ padding: "12px 16px" }}>
        <button style={{ width: 30, height: 30, borderRadius: 8, background: "#f0fdf4", border: "1px solid #a7f3d0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ChevronRight size={14} style={{ color: "#059669" }} />
        </button>
      </td>
    </tr>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function AdminRdvPage() {
  const [items,     setItems]     = useState<RdvItem[]>([]);
  const [meta,      setMeta]      = useState({ total: 0, page: 1, pages: 1 });
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [statut,    setStatut]    = useState("");
  const [tab,       setTab]       = useState<"all" | "bureau_etudes" | "irrigation">("all");
  const [selected,  setSelected]  = useState<RdvItem | null>(null);
  const [curPage,   setCurPage]   = useState(1);
  const [dayFilter, setDayFilter] = useState("");

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const p: Record<string, string> = { page: String(page), limit: "25" };
      if (search)    p.search = search;
      if (statut)    p.statut = statut;
      if (dayFilter) p.date   = dayFilter;
      const res = await adminRdv.list(p);
      setItems(res.data);
      setMeta(res.meta as any);
      setCurPage(page);
    } catch { }
    finally { setLoading(false); }
  }, [search, statut, dayFilter]);

  useEffect(() => { load(1); }, [load]);

  // Changement rapide de statut avec validation préventive
  const quickStatus = async (id: number, s: string) => {
    const rdv = items.find(r => r.id_rdv === id);
    if (!rdv) return;
    const allowed = VALID_TRANSITIONS[rdv.statut] ?? [];
    if (!allowed.includes(s)) {
      toast.error(`Impossible : "${STATUT_MAP[rdv.statut]?.label}" ne peut pas devenir "${STATUT_MAP[s]?.label}".`);
      return;
    }
    try {
      await adminRdv.update(id, { statut: s });
      load(curPage);
      toast.success(`RDV #${id} → ${STATUT_MAP[s]?.label ?? s}`);
    } catch {
      toast.error("Erreur lors du changement de statut.");
    }
  };

  const openDetail = async (rdv: RdvItem) => {
    try { const full = await adminRdv.getById(rdv.id_rdv); setSelected(full); }
    catch { setSelected(rdv); }
  };

  const filtered = useMemo(() => {
    if (tab === "all") return items;
    return items.filter(r => detectService(r) === tab);
  }, [items, tab]);

  const todayCount   = items.filter(r => isToday(r.date_souhaitee)).length;
  const weekCount    = items.filter(r => isThisWeek(r.date_souhaitee)).length;
  const pendingCount = items.filter(r => r.statut === "nouveau").length;
  const bureauCount  = items.filter(r => detectService(r) === "bureau_etudes").length;
  const irrigCount   = items.filter(r => detectService(r) === "irrigation").length;

  // Compteurs par statut (uniquement les statuts réels)
  const COUNTS_BY_STATUS = Object.fromEntries(PIPELINE.map(s => [s.key, items.filter(r => r.statut === s.key).length]));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* En-tête */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: "-0.04em", display: "flex", alignItems: "center", gap: 10 }}>
            <Calendar size={22} style={{ color: "#2e7d4f" }} />
            Rendez-vous
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
            {meta.total} rendez-vous · Bureau d'études & Irrigation
          </p>
        </div>
        <button onClick={() => load(curPage)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 10, background: "#f9fafb", border: "1px solid #e5e7eb", cursor: "pointer", fontSize: 13, color: "#374151" }}>
          <RefreshCw size={13} />Actualiser
        </button>
      </div>

      {/* KPIs + agenda */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr) 300px", gap: 12, alignItems: "start" }}>
        {[
          { label: "Aujourd'hui",   value: todayCount,   icon: CalendarDays, color: "#d97706", bg: "#fffbeb" },
          { label: "Cette semaine", value: weekCount,    icon: Calendar,     color: "#2563eb", bg: "#eff6ff" },
          { label: "À confirmer",   value: pendingCount, icon: AlertCircle,  color: "#dc2626", bg: "#fef2f2" },
          { label: "Total",         value: meta.total,   icon: Star,         color: "#7c3aed", bg: "#f5f3ff" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "14px 16px" }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
              <Icon size={15} style={{ color }} />
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: "-0.04em", lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{label}</p>
          </div>
        ))}
        <WeekAgenda items={items} onDayClick={day => setDayFilter(d => d === day ? "" : day)} />
      </div>

      {/* Compteurs statuts */}
      <div style={{ display: "flex", gap: 8 }}>
        {PIPELINE.map(s => (
          <button key={s.key} onClick={() => setStatut(v => v === s.key ? "" : s.key)} style={{
            flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
            borderRadius: 12, cursor: "pointer", transition: "all 0.15s",
            background: statut === s.key ? s.color : "#fff",
            border: `1.5px solid ${statut === s.key ? s.color : "#e5e7eb"}`,
            boxShadow: statut === s.key ? `0 2px 12px ${s.color}33` : "0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <s.icon size={14} style={{ color: statut === s.key ? "#fff" : s.color, flexShrink: 0 }} />
            <div style={{ textAlign: "left" as const }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: statut === s.key ? "#fff" : "#111827", lineHeight: 1 }}>{COUNTS_BY_STATUS[s.key] ?? 0}</p>
              <p style={{ fontSize: 10, color: statut === s.key ? "rgba(255,255,255,0.75)" : "#9ca3af", marginTop: 2 }}>{s.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Onglets type de service */}
      <div style={{ display: "flex", gap: 0, background: "#f9fafb", borderRadius: 12, padding: 4, width: "fit-content" }}>
        {[
          { key: "all",           label: "Tous",            count: meta.total,  color: "#374151" },
          { key: "bureau_etudes", label: "Bureau d'études", count: bureauCount, color: "#2563eb" },
          { key: "irrigation",    label: "Irrigation",      count: irrigCount,  color: "#059669" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)} style={{
            display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
            borderRadius: 10, border: "none", cursor: "pointer",
            background: tab === t.key ? "#fff" : "transparent",
            boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
            fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
            color: tab === t.key ? t.color : "#9ca3af",
            transition: "all 0.15s",
          }}>
            {t.key === "bureau_etudes" && <Building2 size={13} />}
            {t.key === "irrigation"    && <Droplets size={13} />}
            {t.label}
            <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 20, background: tab === t.key ? t.color + "22" : "#e5e7eb", color: tab === t.key ? t.color : "#9ca3af", fontWeight: 700 }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "12px 16px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" as const }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" as const }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, email, agence…"
            style={{ width: "100%", height: 36, paddingLeft: 36, border: "1px solid #e5e7eb", borderRadius: 9, fontSize: 13, outline: "none", background: "#f9fafb", boxSizing: "border-box" as const, color: "#111827" }}
          />
        </div>
        {dayFilter && (
          <button onClick={() => setDayFilter("")} style={{ display: "flex", alignItems: "center", gap: 5, height: 36, padding: "0 12px", borderRadius: 9, background: "#fffbeb", border: "1px solid #fde68a", color: "#b45309", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            <CalendarDays size={12} />
            {new Date(dayFilter).toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })}
            <X size={11} />
          </button>
        )}
        {statut && (
          <button onClick={() => setStatut("")} style={{ display: "flex", alignItems: "center", gap: 5, height: 36, padding: "0 12px", borderRadius: 9, background: STATUT_MAP[statut]?.bg, border: `1px solid ${STATUT_MAP[statut]?.border}`, color: STATUT_MAP[statut]?.textLight, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            <Filter size={12} />{STATUT_MAP[statut]?.label}<X size={11} />
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #dcfce7", borderTopColor: "#059669", animation: "spin3 0.8s linear infinite" }} />
            <style>{`@keyframes spin3{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center" as const, padding: "64px 0", color: "#9ca3af" }}>
            <Calendar size={40} style={{ margin: "0 auto 12px", opacity: 0.2 }} />
            <p style={{ fontWeight: 600 }}>Aucun rendez-vous</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["Client", "Service", "Date souhaitée", "Agence", "Statut", "Action rapide", ""].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" as const, letterSpacing: "0.06em", whiteSpace: "nowrap" as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(rdv => (
                  <RdvRow key={rdv.id_rdv} rdv={rdv} onClick={() => openDetail(rdv)} onQuickStatus={quickStatus} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.pages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid #f3f4f6" }}>
            <p style={{ fontSize: 12, color: "#9ca3af" }}>{meta.total} RDV · page {curPage}/{meta.pages}</p>
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

      {selected && <RdvDetailPanel item={selected} onClose={() => setSelected(null)} onSaved={() => load(curPage)} />}
    </div>
  );
}