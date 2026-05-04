"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  actions?: Action[];
}

interface Action {
  label: string;
  href?: string;
  type: "link" | "suggestion";
}

// ─── Quick suggestions initiales ─────────────────────────────────────────────
const QUICK_SUGGESTIONS = [
  "Comment arroser mes cultures ?",
  "Quels engrais biologiques ?",
  "Prendre un rendez-vous",
  "Voir le catalogue",
];

// ─── Icônes SVG inline ────────────────────────────────────────────────────────
const Icons = {
  Chat: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="w-5 h-5">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
  Send: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Leaf: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="w-4 h-4">
      <path d="M20 5c0 0-8 0-13 5C4 13 4 19 4 19s6 0 9-3c5-5 5-11 7-11z"/><path d="M4 19l7-7"/>
    </svg>
  ),
  ExternalLink: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-3 h-3">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  ),
};

// ─── Dot pulsant (typing indicator) ──────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#7dc040] inline-block"
          style={{ animation: `chatBounce 1.2s ease-in-out ${i * 0.2}s infinite` }}/>
      ))}
      <style>{`@keyframes chatBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}

// ─── Bulle message ────────────────────────────────────────────────────────────
function MessageBubble({ msg, onAction }: { msg: Message; onAction: (label: string) => void }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-0.5"
          style={{ background: "linear-gradient(135deg,#0a6030,#7dc040)" }}>
          <Icons.Leaf />
        </div>
      )}
      <div className="max-w-[80%]">
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "text-white rounded-br-sm"
              : "text-gray-800 rounded-bl-sm border border-gray-100"
          }`}
          style={isUser
            ? { background: "linear-gradient(135deg,#0a6030,#2e7d4f)" }
            : { background: "#f8faf9" }
          }
        >
          {msg.content}
        </div>
        {/* Actions / redirections */}
        {msg.actions && msg.actions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {msg.actions.map((action, i) => (
              action.type === "link" && action.href ? (
                <a key={i} href={action.href}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all hover:shadow-sm"
                  style={{ color: "#0a6030", borderColor: "#a8d5b5", background: "#f0fdf4" }}>
                  {action.label} <Icons.ExternalLink />
                </a>
              ) : (
                <button key={i} onClick={() => onAction(action.label)}
                  className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition-all hover:shadow-sm"
                  style={{ color: "#2e7d4f", borderColor: "#c8e6d4", background: "#fff" }}>
                  {action.label}
                </button>
              )
            ))}
          </div>
        )}
        <p className="text-[10px] text-gray-400 mt-1 px-1">
          {msg.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Widget principal ─────────────────────────────────────────────────────────
export default function ChatWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Bonjour ! 👋 Je suis l'assistant d'Espace Vert. Je peux répondre à vos questions, vous aider à trouver un produit ou vous rediriger vers nos équipes.",
      timestamp: new Date(),
      actions: QUICK_SUGGESTIONS.map(s => ({ label: s, type: "suggestion" as const })),
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply ?? "Désolé, je n'ai pas pu traiter votre demande.",
        timestamp: new Date(),
        actions: data.actions ?? [],
      };
      setMessages(prev => [...prev, assistantMsg]);
      if (!open) setUnread(u => u + 1);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Une erreur s'est produite. Veuillez réessayer ou nous contacter directement.",
        timestamp: new Date(),
        actions: [{ label: "Nous contacter", href: "/contact", type: "link" }],
      }]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, open]);

  const handleSuggestion = (label: string) => {
    sendMessage(label);
  };

  return (
    <>
      {/* Bouton flottant */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-[340px] sm:w-[380px] rounded-2xl overflow-hidden flex flex-col"
              style={{
                height: 520,
                background: "#fff",
                boxShadow: "0 24px 64px rgba(0,0,0,0.14), 0 0 0 1px rgba(46,125,79,0.1)",
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#0a6030 0%,#2e7d4f 100%)" }}>
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Icons.Leaf />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm leading-none">Assistant Espace Vert</p>
                  <p className="text-white/60 text-[11px] mt-0.5">Répond en quelques secondes</p>
                </div>
                <button onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-colors">
                  <Icons.Close />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: "none" }}>
                {messages.map(msg => (
                  <MessageBubble key={msg.id} msg={msg} onAction={handleSuggestion} />
                ))}
                {loading && (
                  <div className="flex justify-start mb-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2"
                      style={{ background: "linear-gradient(135deg,#0a6030,#7dc040)" }}>
                      <Icons.Leaf />
                    </div>
                    <div className="rounded-2xl rounded-bl-sm border border-gray-100" style={{ background: "#f8faf9" }}>
                      <TypingDots />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-3 py-3 border-t border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-[#7dc040] focus-within:bg-white transition-all">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                    placeholder="Posez votre question…"
                    className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
                    disabled={loading}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg,#0a6030,#7dc040)" }}
                  >
                    <Icons.Send />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-2">Propulsé par OpenAI · Espace Vert</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bouton toggle */}
        <motion.button
          onClick={() => setOpen(v => !v)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white relative"
          style={{
            background: "linear-gradient(135deg,#0a6030 0%,#7dc040 100%)",
            boxShadow: "0 8px 28px rgba(10,96,48,0.40)",
          }}
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                <Icons.Close />
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                <Icons.Chat />
              </motion.div>
            )}
          </AnimatePresence>
          {/* Badge unread */}
          {unread > 0 && !open && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </motion.button>
      </div>
    </>
  );
}