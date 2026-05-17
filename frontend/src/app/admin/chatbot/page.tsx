"use client";
// src/app/admin/chatbot/page.tsx
// Assistant IA admin — propulsé par Claude (Anthropic) via /api/chat/admin
// Migré depuis OpenAI GPT-4o mini

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Trash2, RefreshCw, Bot, User,
  ExternalLink, Zap, MessageSquare,
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

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-2 h-2 rounded-full bg-[#7dc040] inline-block"
          style={{ animation: `adminBounce 1.2s ease-in-out ${i * 0.18}s infinite` }} />
      ))}
      <style>{`@keyframes adminBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}`}</style>
    </div>
  );
}

// ─── Bulle message ─────────────────────────────────────────────────────────────
function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  // Formater les retours à la ligne et le gras **texte**
  const formatted = msg.content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-3 mb-4 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-gray-200" : ""
        }`}
        style={!isUser ? { background: "linear-gradient(135deg,#0a6030,#7dc040)" } : {}}>
        {isUser
          ? <User size={14} className="text-gray-600" />
          : <Bot size={14} className="text-white" />
        }
      </div>

      <div className={`max-w-[78%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "text-white rounded-tr-sm"
              : "text-gray-800 rounded-tl-sm border border-gray-100"
          }`}
          style={isUser
            ? { background: "linear-gradient(135deg,#0a6030,#2e7d4f)" }
            : { background: "#f8faf9" }
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
                  style={{ color: "#0a6030", borderColor: "#a8d5b5", background: "#f0fdf4" }}>
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
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto px-4 py-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#0a6030,#7dc040)" }}>
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Assistant Admin</h1>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Zap size={10} className="text-[#7dc040]" /> Propulsé par Claude (Anthropic)
            </p>
          </div>
        </div>
        <button onClick={clearChat}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
          <Trash2 size={12} /> Effacer
        </button>
      </div>

      {/* Suggestions rapides */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2">
          {ADMIN_SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => send(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-[#7dc040] hover:text-[#0a6030] transition-all">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Zone messages */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-4"
        style={{ scrollbarWidth: "thin" }}>
        {messages.map(msg => <Bubble key={msg.id} msg={msg} />)}
        {loading && (
          <div className="flex gap-3 mb-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#0a6030,#7dc040)" }}>
              <Bot size={14} className="text-white" />
            </div>
            <div className="rounded-2xl rounded-tl-sm border border-gray-100" style={{ background: "#f8faf9" }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden focus-within:border-[#7dc040] transition-colors shadow-sm">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Posez votre question… (Entrée pour envoyer, Maj+Entrée pour saut de ligne)"
          rows={2}
          disabled={loading}
          className="w-full px-4 pt-3.5 pb-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none resize-none"
        />
        <div className="flex items-center justify-between px-3 pb-3">
          <p className="text-[10px] text-gray-400 flex items-center gap-1">
            <MessageSquare size={10} /> Historique des 12 derniers messages conservé
          </p>
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl text-white transition-all disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#0a6030,#7dc040)" }}>
            {loading
              ? <RefreshCw size={13} className="animate-spin" />
              : <Send size={13} />
            }
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
