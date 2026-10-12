"use client";
/**
 * components/admin/AdminAIWidget.tsx — Widget assistant IA unifié
 * ─────────────────────────────────────────────────────────────────────
 * • Appelle POST /api/admin/ai/chat (backend Groq — protégé)
 * • Widget flottant bas-droite, déplié/réduit d'un clic
 * • Affiche et exécute des actions admin après confirmation
 * • Remplace AdminAIAgentWidget ET la page /admin/chatbot
 * ─────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { Bot, Send, Trash2, X, Sparkles, Loader2, ExternalLink, CheckCircle2, ShieldAlert, Info, PackagePlus } from "lucide-react";
import { tokenStore } from "@/lib/admin-api";
import { toast } from "@/components/admin/Toast";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const SUGGESTIONS = [
  "Quels devis sont en attente ?",
  "Combien de RDV à confirmer ?",
  "Résume les messages non lus",
  "Priorités de gestion aujourd'hui",
];

type AgentActionType =
  | "CREATE_PRODUIT" | "UPDATE_PRODUIT" | "DELETE_PRODUIT"
  | "CREATE_MARQUE" | "UPDATE_MARQUE" | "DELETE_MARQUE"
  | "CREATE_ACTIVITE" | "UPDATE_ACTIVITE" | "DELETE_ACTIVITE"
  | "CREATE_CATEGORIE" | "UPDATE_CATEGORIE" | "DELETE_CATEGORIE"
  | "CREATE_ACTUALITE" | "UPDATE_ACTUALITE"
  | "CREATE_FAQ" | "UPDATE_FAQ" | "DELETE_FAQ"
  | "UPDATE_DEVIS" | "DELETE_DEVIS" | "UPDATE_DEVIS_STATUS"
  | "UPDATE_RDV" | "UPDATE_RDV_STATUS"
  | "REPLY_CONTACT" | "DELETE_CONTACT"
  | "NAVIGATE" | "ANALYZE" | "SUMMARIZE";

interface AgentAction {
  type: AgentActionType;
  label: string;
  description: string;
  payload: Record<string, any>;
  risk: "low" | "medium" | "high";
  icon?: string;
}

interface LegacyAction { label: string; href?: string; type: "link" | "suggestion"; }
interface Msg { role: "user" | "assistant"; content: string; actions?: AgentAction[]; executed?: number[]; }

function formatText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function normalizeActions(actions: unknown[]): AgentAction[] {
  return actions
    .map((action: any): AgentAction | null => {
      if (action?.type === "link" && action.href) {
        return {
          type: "NAVIGATE",
          label: action.label ?? "Ouvrir",
          description: `Ouvrir ${action.href}`,
          payload: { href: action.href },
          risk: "low",
        };
      }
      if (typeof action?.type === "string" && typeof action?.label === "string") {
        return {
          type: action.type,
          label: action.label,
          description: action.description ?? action.label,
          payload: action.payload ?? {},
          risk: ["low", "medium", "high"].includes(action.risk) ? action.risk : "medium",
          icon: action.icon,
        };
      }
      return null;
    })
    .filter(Boolean) as AgentAction[];
}

async function executeAction(action: AgentAction): Promise<string> {
  const token = tokenStore.get() ?? "";
  const jsonHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
  const request = async (path: string, init: RequestInit) => {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { ...jsonHeaders, ...(init.headers as Record<string, string> | undefined) },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error ?? data?.message ?? `Erreur ${res.status}`);
    return data?.data ?? data;
  };

  switch (action.type) {
    case "NAVIGATE":
      if (typeof action.payload.href === "string") window.location.href = action.payload.href;
      return "Navigation ouverte.";
    case "UPDATE_DEVIS_STATUS":
      await request(`/admin/devis/${action.payload.id_devis}`, {
        method: "PUT",
        body: JSON.stringify({ statut: action.payload.statut }),
      });
      return `Devis #${action.payload.id_devis} mis à jour.`;
    case "UPDATE_DEVIS": {
      const { id_devis, ...fields } = action.payload;
      await request(`/admin/devis/${id_devis}`, { method: "PUT", body: JSON.stringify(fields) });
      return `Devis #${id_devis} mis à jour.`;
    }
    case "DELETE_DEVIS":
      await request(`/admin/devis/${action.payload.id_devis}`, { method: "DELETE" });
      return `Devis #${action.payload.id_devis} supprimé.`;
    case "UPDATE_RDV_STATUS":
      await request(`/admin/rdv/${action.payload.id_rdv}`, {
        method: "PUT",
        body: JSON.stringify({ statut: action.payload.statut }),
      });
      return `RDV #${action.payload.id_rdv} mis à jour.`;
    case "UPDATE_RDV": {
      const { id_rdv, ...fields } = action.payload;
      await request(`/admin/rdv/${id_rdv}`, { method: "PUT", body: JSON.stringify(fields) });
      return `RDV #${id_rdv} mis à jour.`;
    }
    case "REPLY_CONTACT":
      await request(`/admin/contact/${action.payload.id_contact}/reply`, {
        method: "POST",
        body: JSON.stringify({ reponse: action.payload.reponse }),
      });
      return `Réponse envoyée au message #${action.payload.id_contact}.`;
    case "DELETE_CONTACT":
      await request(`/admin/contact/${action.payload.id_contact}`, { method: "DELETE" });
      return `Message #${action.payload.id_contact} supprimé.`;
    case "CREATE_FAQ":
      await request("/admin/faq", { method: "POST", body: JSON.stringify(action.payload) });
      return "FAQ créée.";
    case "UPDATE_FAQ": {
      const { id_faq, ...fields } = action.payload;
      await request(`/admin/faq/${id_faq}`, { method: "PUT", body: JSON.stringify(fields) });
      return `FAQ #${id_faq} mise à jour.`;
    }
    case "DELETE_FAQ":
      await request(`/admin/faq/${action.payload.id_faq}`, { method: "DELETE" });
      return `FAQ #${action.payload.id_faq} supprimée.`;
    case "CREATE_ACTUALITE":
      await request("/admin/actualites", { method: "POST", body: JSON.stringify(action.payload) });
      return "Actualité créée.";
    case "UPDATE_ACTUALITE": {
      const { id_actualite, ...fields } = action.payload;
      await request(`/admin/actualites/${id_actualite}`, { method: "PUT", body: JSON.stringify(fields) });
      return `Actualité #${id_actualite} mise à jour.`;
    }
    case "CREATE_MARQUE":
      await request("/admin/marques", { method: "POST", body: JSON.stringify(action.payload) });
      return "Marque créée.";
    case "UPDATE_MARQUE": {
      const { id_marque, ...fields } = action.payload;
      await request(`/admin/marques/${id_marque}`, { method: "PUT", body: JSON.stringify(fields) });
      return `Marque #${id_marque} mise à jour.`;
    }
    case "DELETE_MARQUE":
      await request(`/admin/marques/${action.payload.id_marque}`, { method: "DELETE" });
      return `Marque #${action.payload.id_marque} supprimée.`;
    case "CREATE_ACTIVITE":
      await request("/admin/activites", { method: "POST", body: JSON.stringify(action.payload) });
      return "Activité créée.";
    case "UPDATE_ACTIVITE": {
      const { id_activite, ...fields } = action.payload;
      await request(`/admin/activites/${id_activite}`, { method: "PUT", body: JSON.stringify(fields) });
      return `Activité #${id_activite} mise à jour.`;
    }
    case "DELETE_ACTIVITE":
      await request(`/admin/activites/${action.payload.id_activite}`, { method: "DELETE" });
      return `Activité #${action.payload.id_activite} supprimée.`;
    case "CREATE_CATEGORIE":
      await request("/admin/categories", { method: "POST", body: JSON.stringify(action.payload) });
      return "Catégorie créée.";
    case "UPDATE_CATEGORIE": {
      const { id_categorie, ...fields } = action.payload;
      await request(`/admin/categories/${id_categorie}`, { method: "PUT", body: JSON.stringify(fields) });
      return `Catégorie #${id_categorie} mise à jour.`;
    }
    case "DELETE_CATEGORIE":
      await request(`/admin/categories/${action.payload.id_categorie}`, { method: "DELETE" });
      return `Catégorie #${action.payload.id_categorie} supprimée.`;
    case "CREATE_PRODUIT":
      if (!Number.isFinite(Number(action.payload.id_categorie))) {
        throw new Error("Catégorie obligatoire manquante. Demandez à l'assistant de choisir une catégorie existante ou donnez son ID.");
      }
      await request("/admin/produits", { method: "POST", body: JSON.stringify(action.payload) });
      return "Produit créé.";
    case "UPDATE_PRODUIT": {
      const { id_produit, ...fields } = action.payload;
      await request(`/admin/produits/${id_produit}`, { method: "PUT", body: JSON.stringify(fields) });
      return `Produit #${id_produit} mis à jour.`;
    }
    case "DELETE_PRODUIT":
      await request(`/admin/produits/${action.payload.id_produit}`, { method: "DELETE" });
      return `Produit #${action.payload.id_produit} supprimé.`;
    case "ANALYZE":
    case "SUMMARIZE":
      return "Analyse préparée.";
    default:
      throw new Error("Action non reconnue.");
  }
}

export function AdminAIWidget() {
  const [open,     setOpen]     = useState(false);
  const [input,    setInput]    = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [executing, setExecuting] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    messageIndex: number;
    actionIndex: number;
    action: AgentAction;
  } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, open]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${BASE}/admin/ai/chat`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${tokenStore.get() ?? ""}`,
        },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-6),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setMessages(prev => [...prev, { role: "assistant", content: err?.reply ?? "Erreur serveur. Réessayez." }]);
        return;
      }

      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.reply ?? "Pas de réponse.",
        actions: Array.isArray(data.actions) ? normalizeActions(data.actions) : [],
      }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Erreur de connexion. Vérifiez que le serveur est démarré." }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const executeConfirmedAction = useCallback(async (messageIndex: number, actionIndex: number, action: AgentAction) => {
    const key = `${messageIndex}-${actionIndex}`;
    setExecuting(key);
    try {
      const result = await executeAction(action);
      setMessages(prev => prev.map((msg, idx) =>
        idx === messageIndex
          ? { ...msg, executed: [...(msg.executed ?? []), actionIndex] }
          : msg
      ));
      toast.success("Action exécutée", result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Action impossible.";
      toast.error("Action impossible", message);
    } finally {
      setExecuting(null);
    }
  }, []);

  const runAction = useCallback((messageIndex: number, actionIndex: number, action: AgentAction) => {
    if (action.risk !== "low") {
      setPendingAction({ messageIndex, actionIndex, action });
      return;
    }
    void executeConfirmedAction(messageIndex, actionIndex, action);
  }, [executeConfirmedAction]);

  const confirmPendingAction = useCallback(() => {
    if (!pendingAction) return;
    const { messageIndex, actionIndex, action } = pendingAction;
    setPendingAction(null);
    void executeConfirmedAction(messageIndex, actionIndex, action);
  }, [executeConfirmedAction, pendingAction]);

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 50, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>

      {/* Panneau chat */}
      {open && (
        <div style={{ width: 390, background: "#fff", borderRadius: 18, border: "1px solid #dce6df", boxShadow: "0 10px 42px rgba(15,23,42,0.18)", display: "flex", flexDirection: "column", overflow: "hidden", animation: "fadeUp 0.25s cubic-bezier(0.22,1,0.36,1)" }}>
          <style>{`
            @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
            @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
            @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-4px)}}
          `}</style>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", background: "linear-gradient(135deg,#2e7d4f,#3a9e63)", borderRadius: "20px 20px 0 0" }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Info size={18} style={{ color: "#fff" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.15 }}>Assistant IA</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", fontWeight: 600 }}>Actions confirmées</p>
            </div>
            {messages.length > 0 && (
              <button onClick={() => setMessages([])} title="Effacer" style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Trash2 size={12} style={{ color: "#fff" }} />
              </button>
            )}
            <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={13} style={{ color: "#fff" }} />
            </button>
          </div>

          {/* Suggestions */}
          {messages.length === 0 && (
            <div style={{ padding: "14px 16px 0", display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
              {SUGGESTIONS.map(q => (
                <button key={q} onClick={() => send(q)} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 20, border: "1px solid #a7f3d0", background: "#f0fdf4", color: "#047857", cursor: "pointer", fontWeight: 600 }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div style={{ flex: 1, maxHeight: 360, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 8, flexDirection: m.role === "user" ? "row-reverse" : "row", alignItems: "flex-end" }}>
                  <div style={{ width: 30, height: 30, borderRadius: m.role === "user" ? "50%" : 10, background: m.role === "user" ? "#2e7d4f" : "#ecfdf5", border: m.role === "assistant" ? "1px solid #bbf7d0" : "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 800, color: m.role === "user" ? "#fff" : "#047857" }}>
                    {m.role === "user" ? "V" : <Info size={15} />}
                  </div>
                  <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: 8 }}>
                    <div
                      style={{ padding: "11px 14px", borderRadius: m.role === "user" ? "15px 15px 3px 15px" : "15px 15px 15px 3px", background: m.role === "user" ? "#2e7d4f" : "#f8faf9", color: m.role === "user" ? "#fff" : "#1f2937", fontSize: 13, lineHeight: 1.65, border: m.role === "assistant" ? "1px solid #e5eee8" : "none", whiteSpace: "pre-wrap" as const }}
                      dangerouslySetInnerHTML={{ __html: formatText(m.content) }}
                    >
                    </div>
                    {m.role === "assistant" && m.actions && m.actions.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {m.actions.map((action, idx) => {
                          const done = m.executed?.includes(idx);
                          const busy = executing === `${i}-${idx}`;
                          return (
                          <button
                            key={`${action.type}-${idx}`}
                            onClick={() => runAction(i, idx, action)}
                            disabled={done || busy}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 8,
                              padding: "8px 10px",
                              borderRadius: 12,
                              border: action.risk === "high" ? "1px solid #fecaca" : "1px solid #bbf7d0",
                              background: done ? "#f0fdf4" : action.risk === "high" ? "#fff7f7" : "#f0fdf4",
                              color: action.risk === "high" ? "#b91c1c" : "#047857",
                              fontSize: 12,
                              fontWeight: 700,
                              textAlign: "left",
                              cursor: done || busy ? "default" : "pointer",
                              opacity: busy ? 0.65 : 1,
                            }}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              {action.type === "CREATE_PRODUIT" ? <PackagePlus size={13} /> : action.risk === "high" ? <ShieldAlert size={13} /> : done ? <CheckCircle2 size={13} /> : <ExternalLink size={13} />}
                              {action.label}
                            </span>
                            <span style={{ fontSize: 10, opacity: 0.7 }}>
                              {done ? "fait" : busy ? "..." : ""}
                            </span>
                          </button>
                        )})}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Bot size={12} style={{ color: "#6b7280" }} />
                  </div>
                  <div style={{ padding: "10px 14px", borderRadius: "14px 14px 14px 2px", background: "#f9fafb", border: "1px solid #f3f4f6", display: "flex", gap: 4, alignItems: "center" }}>
                    {[0,1,2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#9ca3af", display: "inline-block", animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Saisie */}
          <div style={{ padding: "12px 14px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Question ou ordre…"
              rows={1}
              style={{ flex: 1, resize: "none", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "8px 12px", fontSize: 12, outline: "none", fontFamily: "inherit", color: "#111827", background: "#f9fafb", maxHeight: 100, minHeight: 36, lineHeight: 1.5, boxSizing: "border-box" as const }}
              onFocus={e => (e.currentTarget.style.borderColor = "#2e7d4f")}
              onBlur={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
            />
            <button onClick={() => send(input)} disabled={!input.trim() || loading} style={{ width: 36, height: 36, borderRadius: 10, background: input.trim() && !loading ? "#2e7d4f" : "#f3f4f6", color: input.trim() && !loading ? "#fff" : "#9ca3af", border: "none", cursor: input.trim() && !loading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
              {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Bouton flottant */}
      <button onClick={() => setOpen(v => !v)} style={{ width: 52, height: 52, borderRadius: "50%", background: open ? "#1a5c37" : "linear-gradient(135deg,#2e7d4f,#3a9e63)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(46,125,79,0.45)", transition: "all 0.2s", position: "relative" as const }}>
        {open ? <X size={20} style={{ color: "#fff" }} /> : <Bot size={22} style={{ color: "#fff" }} />}
        {!open && messages.length === 0 && (
          <span style={{ position: "absolute", top: -2, right: -2, width: 14, height: 14, borderRadius: "50%", background: "#f59e0b", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={7} style={{ color: "#fff" }} />
          </span>
        )}
        {!open && messages.filter(m => m.role === "assistant").length > 0 && (
          <span style={{ position: "absolute", top: -2, right: -2, width: 18, height: 18, borderRadius: "50%", background: "#2563eb", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
            {messages.filter(m => m.role === "assistant").length}
          </span>
        )}
      </button>

      {pendingAction && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15,23,42,0.38)",
            backdropFilter: "blur(3px)",
            padding: 16,
          }}
          onClick={() => setPendingAction(null)}
        >
          <div
            style={{
              width: "min(420px, 100%)",
              borderRadius: 18,
              background: "#fff",
              border: "1px solid #dce6df",
              boxShadow: "0 24px 70px rgba(15,23,42,0.28)",
              overflow: "hidden",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", gap: 12, padding: "18px 18px 14px", borderBottom: "1px solid #edf2ef" }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: pendingAction.action.risk === "high" ? "#fef2f2" : "#ecfdf5", color: pendingAction.action.risk === "high" ? "#b91c1c" : "#047857", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {pendingAction.action.risk === "high" ? <ShieldAlert size={20} /> : <Info size={20} />}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#111827", lineHeight: 1.35 }}>
                  Confirmer l'action
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 700, color: "#166534", lineHeight: 1.45 }}>
                  {pendingAction.action.label}
                </p>
              </div>
            </div>

            <div style={{ padding: "16px 18px 18px" }}>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "#374151" }}>
                {pendingAction.action.description}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 18px", background: "#f8faf9", borderTop: "1px solid #edf2ef" }}>
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                style={{
                  height: 38,
                  padding: "0 14px",
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  color: "#374151",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmPendingAction}
                style={{
                  height: 38,
                  padding: "0 16px",
                  borderRadius: 10,
                  border: "none",
                  background: pendingAction.action.risk === "high" ? "#dc2626" : "#2e7d4f",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: pendingAction.action.risk === "high" ? "0 8px 18px rgba(220,38,38,0.22)" : "0 8px 18px rgba(46,125,79,0.24)",
                }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}