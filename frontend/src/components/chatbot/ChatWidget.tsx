"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id:        string;
  role:      "user" | "assistant";
  content:   string;
  timestamp: Date;
  actions?:  Action[];
}

interface Action {
  label: string;
  href?: string;
  type:  "link" | "suggestion";
}

interface PagePreview {
  href:        string;
  title:       string;
  description: string;
  emoji:       string;
}

// ─── Mapping routes → aperçus de pages ───────────────────────────────────────

const PAGE_PREVIEWS: Record<string, PagePreview> = {
  "/produits":    { href: "/produits",    title: "Catalogue Produits",    description: "Irrigation, fertilisation, semences, machinisme…", emoji: "🌿" },
  "/activites":   { href: "/activites",   title: "Nos Activités",         description: "Découvrez nos 6 domaines d'expertise agricoles",   emoji: "🌱" },
  "/marques":     { href: "/marques",     title: "Nos Marques",           description: "Fertivert, Pulvert, Matar, Semences et plus",      emoji: "🏷️" },
  "/devis":       { href: "/devis",       title: "Demander un Devis",     description: "Obtenez une offre personnalisée sous 24h",         emoji: "📋" },
  "/rendez-vous": { href: "/rendez-vous", title: "Prendre Rendez-vous",   description: "Rencontrez nos experts en agence",                 emoji: "📅" },
  "/contact":     { href: "/contact",     title: "Nous Contacter",        description: "Équipe disponible du lundi au samedi",             emoji: "📞" },
  "/actualites":  { href: "/actualites",  title: "Actualités & Conseils", description: "Guides techniques, conseils agronomiques",         emoji: "📰" },
};

function getPreview(href: string): PagePreview | null {
  if (PAGE_PREVIEWS[href]) return PAGE_PREVIEWS[href];
  for (const key of Object.keys(PAGE_PREVIEWS)) {
    if (href.startsWith(key) && key !== "/") return { ...PAGE_PREVIEWS[key], href };
  }
  return null;
}

// ─── Quick suggestions ────────────────────────────────────────────────────────

const QUICK_SUGGESTIONS = [
  "Produits Fertivert disponibles ?",
  "Comment choisir un pulvérisateur ?",
  "Demander un devis",
  "Vos agences en Tunisie",
];

// ─── Icônes SVG ───────────────────────────────────────────────────────────────

const Icons = {
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
      strokeLinecap="round" className="w-5 h-5">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
  Send: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  ExternalLink: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" className="w-3 h-3">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" className="w-3.5 h-3.5">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
  // Double chevron vers le haut (style "swipe" de l'image)
  DoubleChevronUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.8}
      strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <polyline points="17 11 12 6 7 11"/>
      <polyline points="17 18 12 13 7 18"/>
    </svg>
  ),
};

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-[#7dc040] inline-block"
          style={{ animation: `chatBounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
      <style>{`@keyframes chatBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}`}</style>
    </div>
  );
}

// ─── Page Preview Card ────────────────────────────────────────────────────────

function PagePreviewCard({ preview }: { preview: PagePreview }) {
  return (
    <a
      href={preview.href}
      className="group flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer"
      style={{ borderColor: "#d1ead8", background: "linear-gradient(135deg,#f0fdf4 0%,#e8f8ee 100%)", textDecoration: "none" }}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
        style={{ background: "linear-gradient(135deg,#0a6030 0%,#7dc040 100%)" }}>
        <span role="img" aria-label={preview.title}>{preview.emoji}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 leading-none mb-0.5 truncate">{preview.title}</p>
        <p className="text-[10px] text-gray-500 truncate leading-tight">{preview.description}</p>
      </div>
      <span className="flex-shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: "#0a6030" }}>
        <Icons.ArrowRight />
      </span>
    </a>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg, onSuggestion }: { msg: Message; onSuggestion: (label: string) => void }) {
  const isUser = msg.role === "user";

  const previews: PagePreview[] = (msg.actions ?? [])
    .filter(a => a.type === "link" && a.href)
    .map(a => getPreview(a.href!))
    .filter((p): p is PagePreview => p !== null);

  const rawLinks  = (msg.actions ?? []).filter(a => a.type === "link" && a.href && !getPreview(a.href));
  const suggestions = (msg.actions ?? []).filter(a => a.type === "suggestion");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mr-2 mt-0.5 border border-green-100"
          style={{ background: "#fff" }}>
          <Image src="/logos/logo-espace-vert.png" alt="Espace Vert" width={28} height={28}
            className="w-full h-full object-contain" />
        </div>
      )}

      <div className="max-w-[90%] sm:max-w-[82%] min-w-0">
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser ? "text-white rounded-br-sm" : "text-gray-800 rounded-bl-sm border border-green-100"
          }`}
          style={isUser
            ? { background: "linear-gradient(135deg,#0a6030,#2e7d4f)" }
            : { background: "#f0fdf4" }}
        >
          <span className="break-words">{msg.content}</span>
        </div>

        {previews.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {previews.map((p, i) => <PagePreviewCard key={i} preview={p} />)}
          </div>
        )}

        {rawLinks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {rawLinks.map((action, i) => (
              <a key={i} href={action.href}
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all hover:shadow-sm"
                style={{ color: "#0a6030", borderColor: "#a8d5b5", background: "#f0fdf4" }}>
                {action.label} <Icons.ExternalLink />
              </a>
            ))}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {suggestions.map((action, i) => (
              <button key={i} onClick={() => onSuggestion(action.label)}
                className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition-all hover:shadow-sm active:scale-95"
                style={{ color: "#2e7d4f", borderColor: "#c8e6d4", background: "#fff" }}>
                {action.label}
              </button>
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
  const [open, setOpen]         = useState(false);
  const [messages, setMsgs]     = useState<Message[]>([
    {
      id:        "welcome",
      role:      "assistant",
      content:   "Bonjour ! 👋 Je suis l'assistant d'Espace Vert. Je réponds à vos questions, vous aide à trouver un produit ou vous redirige vers nos équipes.",
      timestamp: new Date(),
      actions:   QUICK_SUGGESTIONS.map(s => ({ label: s, type: "suggestion" as const })),
    },
  ]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [unread, setUnread]     = useState(0);
  const [showScroll, setShowScroll] = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLInputElement>(null);
  const scrollContainerRef      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: Message = {
        id:        Date.now().toString(),
        role:      "user",
        content:   text.trim(),
        timestamp: new Date(),
      };

      setMsgs(prev => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            message: text.trim(),
            history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
          }),
        });

        const data = await res.json();

        setMsgs(prev => [
          ...prev,
          {
            id:        (Date.now() + 1).toString(),
            role:      "assistant",
            content:   data.reply ?? "Désolé, je n'ai pas pu traiter votre demande.",
            timestamp: new Date(),
            actions:   data.actions ?? [],
          },
        ]);
        if (!open) setUnread(u => u + 1);
      } catch {
        setMsgs(prev => [
          ...prev,
          {
            id:        (Date.now() + 1).toString(),
            role:      "assistant",
            content:   "Une erreur s'est produite. Veuillez réessayer ou nous contacter directement.",
            timestamp: new Date(),
            actions:   [{ label: "Nous contacter", href: "/contact", type: "link" }],
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, open],
  );

  return (
    <>
      {/* ── Position : BAS GAUCHE ──────────────────────────────────────────── */}
      <div className="fixed bottom-4 left-3 right-3 z-50 flex flex-col items-stretch gap-2 pb-[max(env(safe-area-inset-bottom),0px)] sm:bottom-6 sm:left-6 sm:right-auto sm:items-start sm:gap-3">

        {/* ── Fenêtre chat ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.94 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[390px] rounded-2xl overflow-hidden flex flex-col"
              style={{
                height:     "min(540px, calc(100dvh - 6.5rem))",
                background: "#fff",
                boxShadow:  "0 28px 72px rgba(0,0,0,0.16), 0 0 0 1px rgba(46,125,79,0.12)",
              }}
            >
              {/* ── Header avec vrai logo ── */}
              <div
                className="flex items-center gap-3 px-3.5 py-3.5 sm:px-4 flex-shrink-0 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg,#0a6030 0%,#1a7a40 50%,#2e7d4f 100%)" }}
              >
                <div className="absolute inset-0 opacity-10"
                  style={{ backgroundImage: "radial-gradient(circle at 80% 20%,#7dc040 0%,transparent 60%)" }} />

                {/* Logo image réel */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative p-1.5"
                  style={{ background: "rgba(255,255,255,0.92)" }}
                >
                  <Image
                    src="/logos/logo-espace-vert.png"
                    alt="Espace Vert"
                    width={36}
                    height={36}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>

                <div className="flex-1 min-w-0 relative">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-white font-bold text-sm leading-none">Espace Vert</p>
                    <span
                      className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgba(125,192,64,0.3)", color: "#c8f0a0" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7dc040] inline-block animate-pulse" />
                      En ligne
                    </span>
                  </div>
                  <p className="text-white/60 text-[11px] mt-0.5">Assistant virtuel · répond en secondes</p>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-colors relative"
                  aria-label="Fermer le chat"
                >
                  <Icons.Close />
                </button>
              </div>

              {/* ── Messages ── */}
              <div className="relative flex-1 min-h-0">
              <div
                ref={scrollContainerRef}
                className="h-full overflow-y-auto px-3 py-3 sm:px-4 sm:py-4"
                style={{ scrollbarWidth: "none" }}
                onScroll={() => {
                  const el = scrollContainerRef.current;
                  if (!el) return;
                  setShowScroll(el.scrollHeight - el.scrollTop - el.clientHeight > 80);
                }}
              >
                {messages.map(msg => (
                  <MessageBubble key={msg.id} msg={msg} onSuggestion={sendMessage} />
                ))}

                {loading && (
                  <div className="flex justify-start mb-3">
                    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mr-2 border border-green-100"
                      style={{ background: "#fff" }}>
                      <Image src="/logos/logo-espace-vert.png" alt="Espace Vert" width={28} height={28}
                        className="w-full h-full object-contain" />
                    </div>
                    <div className="rounded-2xl rounded-bl-sm border border-green-100" style={{ background: "#f0fdf4" }}>
                      <TypingDots />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* ── Bouton scroll to bottom ── */}
              <AnimatePresence>
                {showScroll && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.7, y: 8 }}
                    transition={{ duration: 0.18 }}
                    onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
                    className="absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg"
                    style={{ background: "linear-gradient(135deg,#0a6030 0%,#7dc040 100%)" }}
                    aria-label="Défiler vers le bas"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.8}
                      strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <polyline points="7 6 12 11 17 6"/>
                      <polyline points="7 13 12 18 17 13"/>
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
              </div>

              {/* ── Input ── */}
              <div className="px-3 py-3 border-t border-gray-100 flex-shrink-0">
                <div
                  className="flex items-center gap-2 rounded-xl border bg-gray-50 px-3 py-2 transition-all focus-within:bg-white"
                  style={{ borderColor: "#e2e8f0" }}
                  onFocus={e => e.currentTarget.style.borderColor = "#7dc040"}
                  onBlur={e => e.currentTarget.style.borderColor = "#e2e8f0"}
                >
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                    placeholder="Posez votre question…"
                    className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
                    disabled={loading}
                    aria-label="Message"
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all active:scale-90 disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg,#0a6030,#7dc040)" }}
                    aria-label="Envoyer"
                  >
                    <Icons.Send />
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2 text-center">
                  <span className="text-[10px] text-gray-400">Propulsé par Groq ·</span>
                  <span className="text-[10px] font-semibold" style={{ color: "#0a6030" }}>Espace Vert</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bouton toggle avec logo Espace Vert ── */}
        <motion.button
          onClick={() => setOpen(v => !v)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white"
          style={{
            background: "linear-gradient(135deg,#0a6030 0%,#7dc040 100%)",
            boxShadow:  "0 8px 32px rgba(10,96,48,0.45)",
          }}
          aria-label={open ? "Fermer le chat" : "Ouvrir le chat Espace Vert"}
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}>
                <Icons.Close />
              </motion.div>
            ) : (
              <motion.div key="logo"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.18 }}>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-white p-1">
                  <Image src="/logos/logo-espace-vert.png" alt="Espace Vert" width={36} height={36}
                    className="w-full h-full object-contain" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Badge messages non lus */}
          {unread > 0 && !open && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
            >
              {unread}
            </motion.span>
          )}
        </motion.button>
      </div>
    </>
  );
}
