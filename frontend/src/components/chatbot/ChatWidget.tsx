"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, ChevronLeft, ChevronRight, Droplet, ExternalLink, FileText,
  HelpCircle, ImagePlus, MapPin, Menu, Mic, Package, Plus, Send, Sprout, X,
} from "lucide-react";
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

interface StoredConversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

interface PagePreview {
  href: string;
  title: string;
  description: string;
  label: string;
}

const STORAGE_KEY = "ev_chat_conversations_v1";

const PAGE_PREVIEWS: Record<string, PagePreview> = {
  "/activites":                              { href: "/activites",                              title: "Nos activités",             description: "Irrigation, fertilisation, semences, pulvérisation", label: "AC" },
  "/activites/semences-et-plants":           { href: "/activites/semences-et-plants",           title: "Semences & Plants",         description: "Catalogue semences + outil de recommandation",        label: "SM" },
  "/activites/irrigation/etude-installation": { href: "/activites/irrigation/etude-installation", title: "Solution d'irrigation",      description: "Bureau d'étude & installation de systèmes d'irrigation", label: "IR" },
  "/marques":                                { href: "/marques",                                title: "Nos marques",               description: "Fertivert, Pulvert, Matar et partenaires",            label: "MQ" },
  "/devis":                                  { href: "/devis",                                  title: "Demande de devis",          description: "Obtenez une offre adaptée à votre besoin",            label: "DV" },
  "/rendez-vous":                            { href: "/rendez-vous",                            title: "Rendez-vous",               description: "Bureau d'étude & installation systèmes d'irrigation", label: "RV" },
  "/contact":                                { href: "/contact",                                title: "Contact",                   description: "Coordonnées et message direct",                       label: "CT" },
  "/actualites":                             { href: "/actualites",                             title: "Actualités & Conseils",     description: "Articles techniques et informations",                 label: "NT" },
  "/qui-sommes-nous":                        { href: "/qui-sommes-nous",                        title: "Qui sommes-nous",           description: "Notre histoire, agences et sociétés du groupe",       label: "QN" },
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

  // Format /activites/{activite}/{marque}/{produit} (produit avec activite + marque)
  if (parts[0] === "activites" && parts.length === 4) {
    return { href, title: titleFromSlug(parts[3]), description: "Fiche produit détaillée", label: "PR" };
  }

  // Sous-page d'une activité (ex: /activites/irrigation/etude-installation)
  // non listée explicitement ci-dessus : on génère quand même une carte d'aperçu
  // plutôt qu'un simple lien texte.
  if (parts[0] === "activites" && parts.length === 3) {
    const title = titleFromSlug(parts[2]);
    const activiteTitle = titleFromSlug(parts[1]);
    return { href, title, description: `Page dédiée · ${activiteTitle}`, label: "AC" };
  }

  return null;
}

function makeId() {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function iconForLabel(label: string) {
  const l = label.toLowerCase();
  if (l.includes("irrigation") || l.includes("arros")) return Droplet;
  if (l.includes("semence") || l.includes("plant") || l.includes("culture")) return Sprout;
  if (l.includes("devis")) return FileText;
  if (l.includes("agence") || l.includes("proche") || l.includes("adresse")) return MapPin;
  if (l.includes("produit")) return Package;
  return HelpCircle;
}

function dateLabel(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (sameDay(d, now)) return "Aujourd'hui";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
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

function QuickChips({ suggestions, onPick }: { suggestions: string[]; onPick: (s: string) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  if (!suggestions.length) return null;

  const scrollBy = (dir: 1 | -1) => scrollRef.current?.scrollBy({ left: dir * 170, behavior: "smooth" });

  return (
    <div className="flex shrink-0 items-center gap-1 border-t border-slate-200 bg-white px-2 py-2">
      <button
        onClick={() => scrollBy(-1)}
        className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-emerald-300 hover:text-emerald-700 sm:flex"
        aria-label="Suggestions précédentes"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
      <div
        ref={scrollRef}
        className="flex flex-1 gap-2 overflow-x-auto scroll-smooth px-1 py-0.5 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {suggestions.map((s, i) => {
          const Icon = iconForLabel(s);
          return (
            <button
              key={i}
              onClick={() => onPick(s)}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
            >
              <Icon className="h-3.5 w-3.5 text-emerald-600" />
              {s}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => scrollBy(1)}
        className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-emerald-300 hover:text-emerald-700 sm:flex"
        aria-label="Suggestions suivantes"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function HistoryPanel({
  open,
  conversations,
  onClose,
  onSelect,
  onDelete,
}: {
  open: boolean;
  conversations: StoredConversation[];
  onClose: () => void;
  onSelect: (c: StoredConversation) => void;
  onDelete: (id: string) => void;
}) {
  const groups: { label: string; items: StoredConversation[] }[] = [];
  conversations.forEach((c) => {
    const label = dateLabel(c.updatedAt);
    const group = groups.find((g) => g.label === label);
    if (group) group.items.push(c);
    else groups.push({ label, items: [c] });
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 z-30 flex flex-col"
          style={{ background: "#173224" }}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3.5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/85">Historique</p>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Fermer l'historique"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            {conversations.length === 0 ? (
              <p className="mt-12 text-center text-xs leading-relaxed text-white/45">
                Aucune conversation enregistrée pour l&apos;instant.
                <br />
                Vos échanges apparaîtront ici.
              </p>
            ) : (
              groups.map((g) => (
                <div key={g.label} className="mb-4">
                  <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide" style={{ color: "#e0b060" }}>
                    {g.label}
                  </p>
                  <div className="space-y-2">
                    {g.items.map((conv) => (
                      <div
                        key={conv.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelect(conv)}
                        onKeyDown={(e) => e.key === "Enter" && onSelect(conv)}
                        className="group relative w-full cursor-pointer rounded-xl bg-white/5 px-4 py-3 pr-16 text-left transition hover:bg-white/10"
                      >
                        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                          {conv.messages.filter((m) => m.role === "user").length} msg
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                          className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-white/0 transition group-hover:text-white/60 hover:!bg-white/20 hover:!text-white"
                          aria-label="Supprimer la conversation"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <p className="line-clamp-2 pr-8 text-sm font-semibold leading-snug text-white">
                          {conv.title || "Nouvelle conversation"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="shrink-0 border-t border-white/10 px-4 py-3 text-center text-[11px] text-white/50">
            {conversations.length} conversation{conversations.length > 1 ? "s" : ""} sauvegardée{conversations.length > 1 ? "s" : ""}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ChatWidget() {
  const [embedded, setEmbedded] = useState(false);
  const [open, setOpen]         = useState(false);

  const makeWelcome = (): Message => ({
    id:        "welcome",
    role:      "assistant",
    content:   "Bonjour et bienvenue chez Espace Vert ! 🌿\nJe suis ravi de vous accueillir. Comment puis-je vous aider aujourd'hui ?",
    timestamp: new Date(),
  });

  const [suggestions, setSuggestions] = useState<string[]>(FALLBACK_SUGGESTIONS);
  const [messages, setMsgs]           = useState<Message[]>([makeWelcome()]);

  // ── Historique des conversations (persisté en local) ─────────────────────
  const [historyOpen,   setHistoryOpen]   = useState(false);
  const [conversations, setConversations] = useState<StoredConversation[]>([]);
  const [activeId,      setActiveId]      = useState("");

  useEffect(() => {
    setActiveId(makeId());
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setConversations(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const hasUserMsg = messages.some((m) => m.role === "user");
    if (!hasUserMsg) return;
    const firstUserMsg = messages.find((m) => m.role === "user");
    const title = firstUserMsg ? firstUserMsg.content.slice(0, 60) : "Nouvelle conversation";
    const updated: StoredConversation = { id: activeId, title, messages, updatedAt: Date.now() };

    setConversations((prev) => {
      const next = [updated, ...prev.filter((c) => c.id !== activeId)].sort((a, b) => b.updatedAt - a.updatedAt);
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [messages, activeId]);

  const startNewConversation = () => {
    setMsgs([makeWelcome()]);
    setActiveId(makeId());
    setHistoryOpen(false);
  };

  const openConversation = (conv: StoredConversation) => {
    setMsgs(conv.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })));
    setActiveId(conv.id);
    setHistoryOpen(false);
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // ── Charger les suggestions depuis les FAQs actives ──────────────────────
  useEffect(() => {
    const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
    fetch(`${BASE}/faq?limit=4&active=true`)
      .then((r) => r.json())
      .then((data) => {
        const faqs: { question: string }[] = Array.isArray(data) ? data : (data.data ?? []);
        const labels = faqs.slice(0, 4).map((f) => f.question);
        if (labels.length > 0) {
          setSuggestions(labels);
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
  const fileInputRef       = useRef<HTMLInputElement>(null);

  // ── Message vocal (Web Speech API, dégrade proprement si non supporté) ──
  const [listening, setListening]       = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    setMicSupported(true);
    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e: any) => {
      const transcript = e.results?.[0]?.[0]?.transcript ?? "";
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  const toggleMic = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening) { recognition.stop(); setListening(false); }
    else { recognition.start(); setListening(true); }
  };

  // ── Pièce jointe image (aperçu de fonctionnalité, envoi à venir) ─────────
  const [imageNotice, setImageNotice] = useState(false);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setImageNotice(true);
      setTimeout(() => setImageNotice(false), 3000);
    }
    e.target.value = "";
  };

  useEffect(() => { setEmbedded(window.self !== window.top); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 180); }
  }, [open]);
  useEffect(() => {
    const handleOpenChat = () => {
      setOpen(true);
      setHistoryOpen(false);
    };

    window.addEventListener("ev:open-chat", handleOpenChat);
    return () => window.removeEventListener("ev:open-chat", handleOpenChat);
  }, []);

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
            <div className="relative flex min-h-0 w-full flex-col">

              <HistoryPanel
                open={historyOpen}
                conversations={conversations}
                onClose={() => setHistoryOpen(false)}
                onSelect={openConversation}
                onDelete={deleteConversation}
              />

              {/* Header */}
              <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 py-3.5">
                <button
                  onClick={() => setHistoryOpen(true)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
                  aria-label="Historique des conversations"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-1.5">
                  <Image src="/logos/logo-espace-vert.png" alt="Espace Vert" width={34} height={34} className="h-full w-full object-contain" priority />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-slate-950">Assistant Espace Vert</p>
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-medium text-emerald-700">En ligne</span>
                  </div>
                  <p className="truncate text-xs text-slate-500">Semences · Irrigation · Fertilisation · Devis</p>
                </div>
                <button
                  onClick={startNewConversation}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
                  aria-label="Nouvelle conversation"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
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

              {/* Suggestions rapides */}
              <QuickChips suggestions={suggestions} onPick={sendMessage} />

              {/* Input */}
              <div className="shrink-0 border-t border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMic}
                    disabled={!micSupported}
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition ${
                      listening
                        ? "border-red-300 bg-red-50 text-red-600"
                        : "border-slate-200 text-slate-500 hover:bg-slate-100"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                    aria-label={listening ? "Arrêter l'enregistrement" : "Message vocal"}
                    title={micSupported ? undefined : "Non disponible sur ce navigateur"}
                  >
                    <Mic className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100"
                    aria-label="Joindre une image"
                  >
                    <ImagePlus className="h-4 w-4" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />

                  <div className="flex min-w-0 flex-1 items-center rounded-full border border-slate-300 bg-white px-4 py-2.5 transition focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                      placeholder="Votre message..."
                      className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      disabled={loading}
                      aria-label="Message"
                    />
                  </div>

                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    aria-label="Envoyer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {imageNotice ? (
                    <motion.p
                      key="notice"
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-2 text-center text-[11px] font-medium text-emerald-700"
                    >
                      📎 L&apos;envoi d&apos;images arrive bientôt.
                    </motion.p>
                  ) : (
                    <motion.p
                      key="hint"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="mt-2 text-center text-[10px] text-slate-400"
                    >
                      Pour les prix et disponibilités, nos conseillers restent à votre disposition.
                    </motion.p>
                  )}
                </AnimatePresence>
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
                <Image src="/icons/chatbot icon.webp" alt="" width={38} height={38} className="h-9 w-9" />
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
