"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ExternalLink, MessageCircle, Send, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

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
  type: "link" | "suggestion" | "pdf";
}

interface PagePreview {
  href: string;
  title: string;
  description: string;
  label: string;
}

const PAGE_PREVIEWS: Record<string, PagePreview> = {
  "/activites":                    { href: "/activites",                    title: "Nos activités",             description: "Irrigation, fertilisation, semences, pulvérisation", label: "AC" },
  "/activites/semences-et-plants": { href: "/activites/semences-et-plants", title: "Semences & Plants",         description: "Catalogue semences + outil de recommandation",        label: "SM" },
  "/marques":                      { href: "/marques",                      title: "Nos marques",               description: "Fertivert, Pulvert, Matar et partenaires",            label: "MQ" },
  "/devis":                        { href: "/devis",                        title: "Demande de devis",          description: "Obtenez une offre adaptée à votre besoin",            label: "DV" },
  "/rendez-vous":                  { href: "/rendez-vous",                  title: "Rendez-vous",               description: "Bureau d'étude & installation systèmes d'irrigation", label: "RV" },
  "/contact":                      { href: "/contact",                      title: "Contact",                   description: "Coordonnées et message direct",                       label: "CT" },
  "/actualites":                   { href: "/actualites",                   title: "Actualités & Conseils",     description: "Articles techniques et informations",                 label: "NT" },
  "/qui-sommes-nous":              { href: "/qui-sommes-nous",              title: "Qui sommes-nous",           description: "Notre histoire, agences et sociétés du groupe",       label: "QN" },
};

const FALLBACK_SUGGESTIONS = [
  "Quels produits d'irrigation proposez-vous ?",
  "Je cherche des semences adaptées à ma culture",
  "Trouver une agence proche de moi",
  "Demander un devis personnalisé",
];

function getPreview(href: string): PagePreview | null {
  const cleanHref = href.split("#")[0].split("?")[0];
  const preview = PAGE_PREVIEWS[cleanHref];
  if (preview) return { ...preview, href };

  const parts = cleanHref.split("/").filter(Boolean);
  const titleFromSlug = (slug: string) => slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

  if (parts[0] === "marques" && parts[1] && parts.length === 2) {
    const title = titleFromSlug(parts[1]);
    return { href, title, description: "Page marque et catalogue associé", label: "MQ" };
  }

  if (parts[0] === "activites" && parts[1] && parts.length === 2) {
    const title = titleFromSlug(parts[1]);
    return { href, title, description: "Page activité et produits associés", label: "AC" };
  }

  if (parts.includes("produits")) {
    return { href, title: titleFromSlug(parts[parts.length - 1] ?? "Produit"), description: "Fiche produit détaillée", label: "PR" };
  }

  return null;
}

function TypingDots() {
  return (
    <div className="flex h-9 items-center gap-1 px-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-700"
          style={{ animation: `evChatTyping 1.15s ease-in-out ${i * 0.16}s infinite` }}
        />
      ))}
      <style>{`@keyframes evChatTyping{0%,80%,100%{transform:translateY(0);opacity:.45}40%{transform:translateY(-4px);opacity:1}}`}</style>
    </div>
  );
}

function PagePreviewCard({ preview }: { preview: PagePreview }) {
  const iframeSrc = preview.href.split("#")[0];
  const src = `${iframeSrc}${iframeSrc.includes("?") ? "&" : "?"}preview=chat`;
  return (
    <a
      href={preview.href}
      className="group block w-[278px] overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md sm:w-[310px]"
      style={{ textDecoration: "none" }}
    >
      <span className="relative block h-32 overflow-hidden border-b border-slate-200 bg-slate-100">
        <iframe
          src={src}
          title={`Aperçu ${preview.title}`}
          loading="lazy"
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 border-0"
          style={{ width: 1240, height: 540, transform: "scale(0.25)", transformOrigin: "top left" }}
        />
        <span className="absolute left-2 top-2 rounded bg-white/95 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-700 shadow-sm">
          Aperçu
        </span>
      </span>
      <span className="flex items-center gap-3 p-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-[11px] font-bold text-emerald-800">
          {preview.label}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-semibold text-slate-900">{preview.title}</span>
          <span className="block truncate text-[11px] text-slate-500">{preview.description}</span>
        </span>
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-700" />
      </span>
    </a>
  );
}

function FormattedText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function MessageBubble({ msg, onSuggestion }: { msg: Message; onSuggestion: (label: string) => void }) {
  const isUser = msg.role === "user";
  const previews = (msg.actions ?? [])
    .filter((a) => a.type === "link" && a.href && !a.href.startsWith("http"))
    .map((a) => getPreview(a.href!))
    .filter((p): p is PagePreview => p !== null);
  const rawLinks = (msg.actions ?? []).filter((a) => a.type === "link" && a.href && !a.href.startsWith("http") && !getPreview(a.href));
  const externalLinks = (msg.actions ?? []).filter((a) => a.type === "link" && a.href?.startsWith("http"));
  const pdfLinks = (msg.actions ?? []).filter((a) => a.type === "pdf" && a.href);
  const suggestions = (msg.actions ?? []).filter((a) => a.type === "suggestion");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex max-w-[88%] gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {!isUser && (
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            <Image src="/logos/logo-espace-vert.png" alt="Espace Vert" width={26} height={26} className="h-full w-full object-contain" />
          </div>
        )}
        <div className="min-w-0">
          <div
            className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-sm ${
              isUser
                ? "rounded-br-md bg-emerald-700 text-white"
                : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
            }`}
          >
            {isUser ? msg.content : <FormattedText text={msg.content} />}
          </div>

          {previews.length > 0 && (
            <div className="mt-2 space-y-2">
              {previews.map((preview, index) => (
                <PagePreviewCard key={`${preview.href}-${index}`} preview={preview} />
              ))}
            </div>
          )}

          {rawLinks.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {rawLinks.map((action, index) => (
                <a
                  key={`${action.href}-${index}`}
                  href={action.href}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:border-emerald-400"
                >
                  {action.label}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          )}

          {externalLinks.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {externalLinks.map((action, index) => (
                <a
                  key={`${action.href}-${index}`}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 transition hover:border-sky-400"
                >
                  {action.label}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          )}

          {pdfLinks.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {pdfLinks.map((action, index) => (
                <a
                  key={`${action.href}-${index}`}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800 transition hover:border-red-400 hover:bg-red-100"
                >
                  📄 {action.label}
                </a>
              ))}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {suggestions.map((action, index) => (
                <button
                  key={`${action.label}-${index}`}
                  onClick={() => onSuggestion(action.label)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          <p className={`mt-1 px-1 text-[10px] text-slate-400 ${isUser ? "text-right" : "text-left"}`}>
            {msg.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatWidget() {
  const [embedded, setEmbedded] = useState(false);
  const [open, setOpen]         = useState(false);
  const makeWelcome = (suggestions: string[]): Message => ({
    id:        "welcome",
    role:      "assistant",
    content:   "Bonjour ! Je suis l'assistant du Groupe Espace Vert.\nComment puis-je vous aider aujourd'hui ?\n\nChoisissez une option ou posez votre question :",
    timestamp: new Date(),
    actions:   suggestions.map((label) => ({ label, type: "suggestion" as const })),
  });

  const [messages, setMsgs] = useState<Message[]>([makeWelcome(FALLBACK_SUGGESTIONS)]);

  // ── Charger les suggestions depuis les FAQs actives ──────────────────────
  useEffect(() => {
    const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
    fetch(`${BASE}/faq?limit=4&active=true`)
      .then((r) => r.json())
      .then((data) => {
        const faqs: { question: string }[] = Array.isArray(data) ? data : (data.data ?? []);
        const labels = faqs.slice(0, 4).map((f) => f.question);
        if (labels.length > 0) {
          setMsgs([makeWelcome(labels)]);
        }
      })
      .catch(() => {}); // garde les suggestions fallback si erreur
  }, []);
  const [input,      setInput]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [unread,     setUnread]     = useState(0);
  const [showScroll, setShowScroll] = useState(false);

  const bottomRef          = useRef<HTMLDivElement>(null);
  const inputRef           = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setEmbedded(window.self !== window.top); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 180); }
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;
      const cleanText = text.trim();
      const userMsg: Message = {
        id:        Date.now().toString(),
        role:      "user",
        content:   cleanText,
        timestamp: new Date(),
      };
      setMsgs((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: cleanText,
            history: messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        const data = await res.json();
        // ── Si réponse FAQ → incrémenter nb_consultations uniquement ────────
        if (data.id_faq && typeof window !== "undefined" && (window as any).trackEvFaq) {
          (window as any).trackEvFaq(data.id_faq);
        }
        // ── Si PAS de FAQ → logger dans recherches fréquentes ─────────────
        if (!data.id_faq && typeof window !== "undefined" && (window as any).trackSearch) {
          (window as any).trackSearch(cleanText, 0);
        }
        setMsgs((prev) => [
          ...prev,
          {
            id:        (Date.now() + 1).toString(),
            role:      "assistant",
            content:   data.reply ?? "Désolé, je n'ai pas pu traiter votre demande.",
            timestamp: new Date(),
            actions:   Array.isArray(data.actions) ? data.actions : [],
          },
        ]);
        if (!open) setUnread((c) => c + 1);
      } catch {
        setMsgs((prev) => [
          ...prev,
          {
            id:        (Date.now() + 1).toString(),
            role:      "assistant",
            content:   "Une erreur s'est produite. Vous pouvez contacter directement notre équipe.",
            timestamp: new Date(),
            actions:   [{ label: "Nous contacter", href: "/contact", type: "link" as const }],
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, open],
  );

  if (embedded) return null;

  return (
    <div className="fixed bottom-4 left-3 right-3 z-50 flex flex-col items-stretch gap-3 pb-[max(env(safe-area-inset-bottom),0px)] sm:bottom-6 sm:left-auto sm:right-6 sm:items-end">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{    opacity: 0, y: 14,  scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl sm:w-[390px]"
            style={{ height: "min(600px, calc(100dvh - 6.25rem))" }}
          >
            <div className="flex min-h-0 w-full flex-col">

              {/* Header */}
              <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-1.5">
                  <Image src="/logos/logo-espace-vert.png" alt="Espace Vert" width={34} height={34} className="h-full w-full object-contain" priority />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-slate-950">Assistant Espace Vert</p>
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="truncate text-xs text-slate-500">Semences · Irrigation · Fertilisation · Devis</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Fermer le chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="relative min-h-0 flex-1 bg-slate-50">
                <div
                  ref={scrollContainerRef}
                  className="h-full overflow-y-auto px-3 py-4 sm:px-4"
                  style={{ scrollbarWidth: "thin" }}
                  onScroll={() => {
                    const el = scrollContainerRef.current;
                    if (!el) return;
                    setShowScroll(el.scrollHeight - el.scrollTop - el.clientHeight > 90);
                  }}
                >
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} onSuggestion={sendMessage} />
                  ))}

                  {loading && (
                    <div className="mb-4 flex justify-start gap-2">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                        <Image src="/logos/logo-espace-vert.png" alt="Espace Vert" width={26} height={26} className="h-full w-full object-contain" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white shadow-sm">
                        <TypingDots />
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                <AnimatePresence>
                  {showScroll && (
                    <motion.button
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{    opacity: 0, y: 6 }}
                      onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
                      className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition hover:text-emerald-700"
                      aria-label="Défiler vers le bas"
                    >
                      <ArrowRight className="h-4 w-4 rotate-90" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Input */}
              <div className="shrink-0 border-t border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 transition focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                    placeholder="Posez votre question..."
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    disabled={loading}
                    aria-label="Message"
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-700 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    aria-label="Envoyer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-center text-[10px] text-slate-400">
                  Pour les prix et disponibilités, nos conseillers restent à votre disposition.
                </p>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton flottant */}
      <div className="flex items-end justify-end gap-2">
        {!open && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-lg sm:block"
          >
            Besoin d&apos;aide ?
          </motion.div>
        )}
        <motion.button
          onClick={() => setOpen((v) => !v)}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.96 }}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-white shadow-xl transition hover:bg-emerald-800"
          aria-label={open ? "Fermer le chat" : "Ouvrir le chat Espace Vert"}
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span key="close" initial={{ opacity: 0, rotate: -45 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 45 }} transition={{ duration: 0.15 }}>
                <X className="h-6 w-6" />
              </motion.span>
            ) : (
              <motion.span key="chat" initial={{ opacity: 0, rotate: 45 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -45 }} transition={{ duration: 0.15 }}>
                <MessageCircle className="h-6 w-6" />
              </motion.span>
            )}
          </AnimatePresence>

          {unread > 0 && !open && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {unread}
            </span>
          )}
        </motion.button>
      </div>
    </div>
  );
}