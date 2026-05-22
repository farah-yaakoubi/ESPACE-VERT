"use client";
// src/app/admin/chatbot/page.tsx
// Assistant IA admin — Claude (Anthropic) — Widget flottant style chatbot site

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Send, Trash2, RefreshCw, Bot, User,
  ExternalLink, Zap, MessageSquare, Sparkles,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id:        string;
  role:      "user" | "assistant";
  content:   string;
  timestamp: Date;
  actions?:  Array<{ label: string; href?: string; type: string }>;
}

// ─── Suggestions rapides admin ────────────────────────────────────────────────
const ADMIN_SUGGESTIONS = [
  "Combien de produits actifs dans le catalogue ?",
  "Quelles FAQs sont les plus consultées ?",
  "Aide-moi à rédiger une description produit",
  "Comment optimiser le catalogue ?",
  "Quelles marques ont le plus de produits ?",
  "Génère une FAQ sur l'irrigation",
];

// ─── Colors Espace Vert ───────────────────────────────────────────────────────
const EV = {
  forest:    "#0a5c2e",
  forestMid: "#1a7040",
  leaf:      "#7dc040",
  leafLight: "#a8d86e",
  bg:        "#f2faf0",
  border:    "#c0ebb1",
};

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-2 h-2 rounded-full inline-block"
          style={{ background: EV.leaf, animation: `adminBounce 1.2s ease-in-out ${i * 0.18}s infinite` }} />
      ))}
      <style>{`@keyframes adminBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}`}</style>
    </div>
  );
}

// ─── Bulle message ─────────────────────────────────────────────────────────────
function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const formatted = msg.content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-3 mb-4 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? "bg-gray-200" : ""}`}
        style={!isUser ? { background: `linear-gradient(135deg,${EV.forest},${EV.leaf})` } : {}}
      >
        {isUser
          ? <User size={14} className="text-gray-600" />
          : (
            <div className="w-5 h-5 flex items-center justify-center">
              <Image src="/logos/logo-espace-vert.png" alt="EV" width={20} height={20} className="w-full h-full object-contain" />
            </div>
          )
        }
      </div>

      <div className={`max-w-[78%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser ? "text-white rounded-tr-sm" : "text-gray-800 rounded-tl-sm"
          }`}
          style={isUser
            ? { background: `linear-gradient(135deg,${EV.forest},${EV.forestMid})` }
            : { background: EV.bg, border: `1px solid ${EV.border}` }
          }
          dangerouslySetInnerHTML={{ __html: formatted }}
        />

        {/* Actions */}
        {msg.actions && msg.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {msg.actions.map((a, i) =>
              a.href ? (
                <a key={i} href={a.href} target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all hover:shadow-sm"
                  style={{ color: EV.forest, borderColor: EV.border, background: EV.bg }}>
                  {a.label} <ExternalLink size={10} />
                </a>
              ) : null
            )}
          </div>
        )}

        <p className="text-[10px] text-gray-400 mt-1">
          {msg.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function AdminChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id:        "welcome",
      role:      "assistant",
      content:   "Bonjour ! Je suis votre assistant IA Espace Vert. Je peux analyser votre catalogue, répondre aux questions sur vos données internes, vous aider à rédiger du contenu (descriptions, FAQ, actualités) et vous donner des conseils de gestion.",
      timestamp: new Date(),
    }
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id:        Date.now().toString(),
      role:      "user",
      content:   text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("ev_admin_token") : "";
      const res = await fetch("/api/chat/admin", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-12).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id:        (Date.now() + 1).toString(),
        role:      "assistant",
        content:   data.reply ?? "Erreur de réponse.",
        timestamp: new Date(),
        actions:   data.actions ?? [],
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id:        (Date.now() + 1).toString(),
        role:      "assistant",
        content:   "Erreur de connexion. Vérifiez votre réseau.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const clearChat = () => setMessages([{
    id:        "welcome-new",
    role:      "assistant",
    content:   "Conversation réinitialisée. Comment puis-je vous aider ?",
    timestamp: new Date(),
  }]);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-3xl mx-auto">

      {/* ── Header ── */}
      <div
        className="flex items-center gap-4 px-5 py-4 rounded-t-2xl flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${EV.forest} 0%, ${EV.forestMid} 60%, ${EV.leaf}22 100%)` }}
      >
        {/* Logo */}
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 p-1.5"
          style={{ background: "rgba(255,255,255,0.92)" }}>
          <Image src="/logos/logo-espace-vert.png" alt="Espace Vert" width={36} height={36}
            className="w-full h-full object-contain" priority />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-bold text-sm leading-none">Assistant IA Admin</p>
            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(125,192,64,0.3)", color: "#c8f0a0" }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: EV.leaf }} />
              Claude · En ligne
            </span>
          </div>
          <p className="text-white/60 text-[11px] mt-0.5">Propulsé par Claude (Anthropic) · Accès données internes</p>
        </div>

        <button onClick={clearChat}
          className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}
          title="Effacer la conversation"
        >
          <Trash2 size={12} /> Effacer
        </button>
      </div>

      {/* ── Suggestions rapides (n'apparaissent qu'au démarrage) ── */}
      <AnimatePresence>
        {messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-shrink-0 px-4 pt-3 pb-1"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: EV.forest }}>
              Suggestions rapides
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ADMIN_SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)}
                  className="text-xs px-3 py-1.5 rounded-full border transition-all"
                  style={{ borderColor: EV.border, color: EV.forest, background: EV.bg }}
                  onMouseEnter={e => {
                    (e.target as HTMLElement).style.background = EV.forest;
                    (e.target as HTMLElement).style.color = "#fff";
                  }}
                  onMouseLeave={e => {
                    (e.target as HTMLElement).style.background = EV.bg;
                    (e.target as HTMLElement).style.color = EV.forest;
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Zone messages ── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ scrollbarWidth: "thin", scrollbarColor: `${EV.border} transparent` }}
      >
        {messages.map(msg => <Bubble key={msg.id} msg={msg} />)}
        {loading && (
          <div className="flex gap-3 mb-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.92)", border: `1px solid ${EV.border}` }}>
              <Image src="/logos/logo-espace-vert.png" alt="EV" width={28} height={28} className="w-full h-full object-contain" />
            </div>
            <div className="rounded-2xl rounded-tl-sm"
              style={{ background: EV.bg, border: `1px solid ${EV.border}` }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div
        className="flex-shrink-0 px-4 py-4 rounded-b-2xl"
        style={{ borderTop: `1px solid ${EV.border}`, background: "#fff" }}
      >
        <div
          className="flex items-end gap-2 rounded-xl border px-3 py-2 transition-all"
          style={{ borderColor: EV.border, background: EV.bg }}
          onFocus={e => e.currentTarget.style.borderColor = EV.leaf}
          onBlur={e => e.currentTarget.style.borderColor = EV.border}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question… (Entrée pour envoyer, Maj+Entrée pour saut de ligne)"
            rows={2}
            disabled={loading}
            className="flex-1 text-sm bg-transparent outline-none resize-none text-gray-800 placeholder-gray-400 py-1"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all active:scale-90 disabled:opacity-40 flex-shrink-0 mb-0.5"
            style={{ background: `linear-gradient(135deg,${EV.forest},${EV.leaf})` }}
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-2">
          <Zap size={9} style={{ color: EV.leaf }} />
          <span className="text-[10px] text-gray-400">Propulsé par Claude (Anthropic) ·</span>
          <span className="text-[10px] font-bold" style={{ color: EV.forest }}>Espace Vert Admin</span>
        </div>
      </div>
    </div>
  );
}