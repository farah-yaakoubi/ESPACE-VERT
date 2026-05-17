"use client";
// src/app/admin/chat/page.tsx
// Chat interne entre administrateurs
// — SSE temps réel (fallback polling 5s)
// — Pièces jointes : images, PDF, fichiers
// — Drag & drop fichiers
// — Réactions emoji

import { useEffect, useState, useRef, useCallback } from "react";
import {
  adminChat, tokenStore,
  type ChatMsg, type ChatConversation,
} from "@/lib/admin-api";
import {
  Send, RefreshCw, MessageSquare, User, Paperclip,
  FileText, Image, X, Download, CheckCheck, Check,
  Smile, MoreHorizontal,
} from "lucide-react";

const G   = "#0a6030";
const GL  = "#f0fdf4";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(d: string) {
  return new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(d: string) {
  const date = new Date(d);
  const today = new Date();
  const diff  = today.getDate() - date.getDate();
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}
function fmtSize(bytes?: number | null) {
  if (!bytes) return "";
  if (bytes < 1024)       return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ nom, avatar, size = 36 }: { nom: string; avatar?: string; size?: number }) {
  if (avatar) return (
    <img src={avatar} alt={nom} className="rounded-full object-cover flex-shrink-0"
      style={{ width: size, height: size }} />
  );
  return (
    <div className="rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-white text-sm"
      style={{ width: size, height: size, background: G }}>
      {nom.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Prévisualisation fichier dans le message ─────────────────────────────────
function FilePreview({ msg, isMe }: { msg: ChatMsg; isMe: boolean }) {
  if (!msg.fichier_url) return null;

  if (msg.type_message === "image") {
    return (
      <a href={msg.fichier_url} target="_blank" rel="noreferrer"
        className="block mt-1 rounded-xl overflow-hidden max-w-[220px] border border-gray-200 hover:opacity-90 transition-opacity">
        <img src={msg.fichier_url} alt={msg.fichier_nom ?? "image"} className="w-full object-cover" />
      </a>
    );
  }

  const icon = msg.type_message === "pdf" ? <FileText size={22} className="text-red-500" /> : <FileText size={22} className="text-blue-500" />;

  return (
    <a href={msg.fichier_url} target="_blank" rel="noreferrer" download={msg.fichier_nom}
      className={`flex items-center gap-3 mt-1 px-3 py-2.5 rounded-xl border transition-all hover:shadow-sm max-w-[260px] ${
        isMe ? "bg-white/15 border-white/25 text-white" : "bg-white border-gray-200 text-gray-800"
      }`}>
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">{msg.fichier_nom ?? "Fichier"}</p>
        <p className={`text-[10px] ${isMe ? "text-white/60" : "text-gray-400"}`}>{fmtSize(msg.fichier_size)}</p>
      </div>
      <Download size={14} className={isMe ? "text-white/60" : "text-gray-400"} />
    </a>
  );
}

// ─── Indicateur typing ────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2.5">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full inline-block"
          style={{ background: G, animation: `chatBounce 1.2s ease-in-out ${i * 0.18}s infinite` }} />
      ))}
      <style>{`@keyframes chatBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}

// ─── Séparateur de date ───────────────────────────────────────────────────────
function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-[11px] text-gray-400 font-medium">{label}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function AdminChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selected,      setSelected]      = useState<ChatConversation | null>(null);
  const [messages,      setMessages]      = useState<ChatMsg[]>([]);
  const [input,         setInput]         = useState("");
  const [sending,       setSending]       = useState(false);
  const [loadingConvs,  setLoadingConvs]  = useState(true);
  const [loadingMsgs,   setLoadingMsgs]   = useState(false);
  const [myId,          setMyId]          = useState<number | null>(null);
  const [dragOver,      setDragOver]      = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [previewFile,   setPreviewFile]   = useState<File | null>(null);
  const [searchConv,    setSearchConv]    = useState("");

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const fileRef    = useRef<HTMLInputElement>(null);
  const sseRef     = useRef<EventSource | null>(null);

  // ── Récupérer l'id admin depuis le token JWT ──────────────────────────────
  useEffect(() => {
    try {
      const token = tokenStore.get();
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setMyId(payload.id_admin ?? null);
      }
    } catch {}
  }, []);

  // ── Charger conversations ─────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const data = await adminChat.conversations();
      setConversations(data);
    } catch {}
    finally { setLoadingConvs(false); }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Polling léger toutes les 10s pour mettre à jour les conversations
  useEffect(() => {
    const id = setInterval(loadConversations, 10_000);
    return () => clearInterval(id);
  }, [loadConversations]);

  // ── SSE temps réel ────────────────────────────────────────────────────────
  useEffect(() => {
    const token = tokenStore.get();
    if (!token) return;

    const es = new EventSource(`${API}/admin/chat/events?token=${token}`);
    sseRef.current = es;

    es.onmessage = (e) => {
      try {
        const msg: ChatMsg = JSON.parse(e.data);
        // Ajouter au fil si la conv est ouverte
        setSelected(sel => {
          if (sel && (msg.id_from === sel.admin.id_admin || msg.id_to === sel.admin.id_admin)) {
            setMessages(prev => {
              if (prev.find(m => m.id_msg === msg.id_msg)) return prev;
              return [...prev, msg];
            });
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
          }
          return sel;
        });
        // Rafraîchir liste des conversations
        loadConversations();
      } catch {}
    };

    es.onerror = () => {
      // SSE déconnecté — le polling prend le relais
      es.close();
    };

    return () => { es.close(); };
  }, [myId, loadConversations]);

  // ── Charger messages d'une conversation ───────────────────────────────────
  const loadMessages = useCallback(async (conv: ChatConversation) => {
    setSelected(conv);
    setMessages([]);
    setLoadingMsgs(true);
    try {
      const res = await adminChat.messages(conv.admin.id_admin);
      setMessages(res.messages);
    } catch {}
    finally {
      setLoadingMsgs(false);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 100);
    }
  }, []);

  // Polling messages toutes les 5s (fallback si SSE non dispo)
  useEffect(() => {
    if (!selected) return;
    const id = setInterval(async () => {
      try {
        const res = await adminChat.messages(selected.admin.id_admin);
        setMessages(res.messages);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      } catch {}
    }, 5000);
    return () => clearInterval(id);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Envoyer un message texte ───────────────────────────────────────────────
  const sendMessage = async () => {
    if (!selected || (!input.trim() && !previewFile) || sending) return;

    if (previewFile) {
      await sendFile(previewFile);
      return;
    }

    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      const msg = await adminChat.send(selected.admin.id_admin, text);
      setMessages(prev => [...prev, msg]);
      loadConversations();
    } catch { setInput(text); }
    finally { setSending(false); inputRef.current?.focus(); }
  };

  // ── Envoyer un fichier ─────────────────────────────────────────────────────
  const sendFile = async (file: File) => {
    if (!selected) return;
    setUploadingFile(true);
    setPreviewFile(null);
    try {
      const form = new FormData();
      form.append("fichier", file);
      if (input.trim()) form.append("contenu", input.trim());

      const token = tokenStore.get();
      const res   = await fetch(`${API}/admin/chat/${selected.admin.id_admin}/upload`, {
        method:  "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body:    form,
      });
      if (!res.ok) throw new Error("Upload échoué");
      const data = await res.json();
      const msg: ChatMsg = data.data ?? data;
      setMessages(prev => [...prev, msg]);
      setInput("");
      loadConversations();
    } catch {}
    finally { setUploadingFile(false); inputRef.current?.focus(); }
  };

  // ── Gestion fichier input ──────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviewFile(file);
    e.target.value = "";
  };

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setPreviewFile(file);
  };

  // ── Grouper les messages par date ──────────────────────────────────────────
  const groupedMessages = messages.reduce<Array<{ dateLabel: string; msgs: ChatMsg[] }>>((acc, msg) => {
    const label = fmtDate(msg.created_at);
    const last  = acc[acc.length - 1];
    if (last && last.dateLabel === label) {
      last.msgs.push(msg);
    } else {
      acc.push({ dateLabel: label, msgs: [msg] });
    }
    return acc;
  }, []);

  const filteredConvs = conversations.filter(c =>
    !searchConv || c.admin.nom.toLowerCase().includes(searchConv.toLowerCase())
  );

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  return (
    <div
      className="flex h-[calc(100vh-80px)] rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm"
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Overlay drag & drop */}
      {dragOver && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl"
          style={{ background: "rgba(10,96,48,0.08)", border: "2px dashed #0a6030" }}>
          <Paperclip size={36} style={{ color: G }} />
          <p className="mt-2 font-semibold text-sm" style={{ color: G }}>Déposez le fichier ici</p>
        </div>
      )}

      {/* ── Colonne conversations ── */}
      <div className="w-72 flex-shrink-0 border-r border-gray-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} style={{ color: G }} />
            <span className="font-semibold text-gray-800 text-sm">Messages</span>
            {totalUnread > 0 && (
              <span className="text-[10px] font-bold text-white rounded-full px-1.5 py-0.5"
                style={{ background: G }}>
                {totalUnread}
              </span>
            )}
          </div>
          <button onClick={loadConversations}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
            <RefreshCw size={13} className={loadingConvs ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Recherche */}
        <div className="px-3 py-2 border-b border-gray-100">
          <input
            value={searchConv}
            onChange={e => setSearchConv(e.target.value)}
            placeholder="Rechercher un admin…"
            className="w-full h-8 px-3 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-green-400"
          />
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto">
          {loadingConvs && conversations.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
              Chargement…
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 gap-2 text-gray-400">
              <User size={22} />
              <span className="text-xs">Aucun admin trouvé</span>
            </div>
          ) : (
            filteredConvs.map(conv => {
              const active = selected?.admin.id_admin === conv.admin.id_admin;
              const preview = conv.last_message
                ? (conv.last_message.type_message !== "texte"
                    ? `📎 ${conv.last_message.fichier_nom ?? "Fichier"}`
                    : conv.last_message.contenu)
                : "Démarrer une conversation";
              return (
                <button key={conv.admin.id_admin}
                  onClick={() => loadMessages(conv)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                  style={active ? { background: GL, borderRight: `3px solid ${G}` } : {}}>
                  <div className="relative">
                    <Avatar nom={conv.admin.nom} avatar={conv.admin.avatar} size={38} />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm truncate ${active ? "font-semibold" : "font-medium"} text-gray-800`}>
                        {conv.admin.nom}
                      </span>
                      {conv.last_message && (
                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
                          {fmt(conv.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs text-gray-400 truncate">{preview}</span>
                      {conv.unread > 0 && (
                        <span className="flex-shrink-0 ml-auto text-[10px] font-bold text-white rounded-full px-1.5 py-0.5"
                          style={{ background: G }}>
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Zone messages ── */}
      {selected ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header conversation */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
            <div className="relative">
              <Avatar nom={selected.admin.nom} avatar={selected.admin.avatar} size={36} />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{selected.admin.nom}</p>
              <p className="text-[11px] text-gray-400">{selected.admin.email}</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                title="Plus d'options">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: "thin" }}>
            {loadingMsgs ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Chargement…
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                <MessageSquare size={32} strokeWidth={1.5} />
                <span className="text-sm">Aucun message. Soyez le premier !</span>
              </div>
            ) : (
              groupedMessages.map(group => (
                <div key={group.dateLabel}>
                  <DateSeparator label={group.dateLabel} />
                  {group.msgs.map(msg => {
                    const isMe = msg.id_from === myId;
                    return (
                      <div key={msg.id_msg} className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2 mb-3`}>
                        {!isMe && (
                          <Avatar nom={msg.emetteur.nom} avatar={msg.emetteur.avatar} size={28} />
                        )}
                        <div className={`max-w-[68%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                          {/* Bulle texte */}
                          {msg.contenu && (
                            <div
                              className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                                isMe
                                  ? "rounded-br-sm text-white"
                                  : "rounded-bl-sm text-gray-800 border border-gray-100"
                              }`}
                              style={isMe ? { background: G } : { background: "#f8faf9" }}
                            >
                              {msg.contenu}
                            </div>
                          )}
                          {/* Pièce jointe */}
                          <FilePreview msg={msg} isMe={isMe} />
                          {/* Méta */}
                          <div className={`flex items-center gap-1 mt-1 ${isMe ? "flex-row-reverse" : ""}`}>
                            <p className="text-[10px] text-gray-400">{fmt(msg.created_at)}</p>
                            {isMe && (
                              msg.lu
                                ? <CheckCheck size={12} style={{ color: G }} />
                                : <Check size={12} className="text-gray-300" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
            {(sending || uploadingFile) && (
              <div className="flex justify-end mb-3">
                <div className="rounded-2xl rounded-br-sm border border-gray-100" style={{ background: "#f8faf9" }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Prévisualisation fichier en attente */}
          {previewFile && (
            <div className="mx-4 mb-2 flex items-center gap-3 px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl">
              {previewFile.type.startsWith("image/")
                ? <Image size={18} style={{ color: G }} />
                : <FileText size={18} style={{ color: G }} />
              }
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{previewFile.name}</p>
                <p className="text-[10px] text-gray-400">{fmtSize(previewFile.size)}</p>
              </div>
              <button onClick={() => setPreviewFile(null)} className="p-1 text-gray-400 hover:text-red-500">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
            <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2
              focus-within:border-green-400 focus-within:bg-white transition-all">

              {/* Bouton fichier */}
              <input ref={fileRef} type="file" className="hidden"
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                onChange={handleFileSelect} />
              <button
                onClick={() => fileRef.current?.click()}
                className="mb-1 p-1 rounded-lg text-gray-400 hover:text-green-700 transition-colors"
                title="Joindre un fichier">
                <Paperclip size={16} />
              </button>

              <textarea
                ref={inputRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                }}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                }}
                placeholder={`Message à ${selected.admin.nom}… (Entrée pour envoyer)`}
                rows={1}
                className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400 resize-none"
                disabled={sending || uploadingFile}
                style={{ maxHeight: 100 }}
              />

              <button
                onClick={sendMessage}
                disabled={(!input.trim() && !previewFile) || sending || uploadingFile}
                className="mb-0.5 w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40"
                style={{ background: G }}>
                {sending || uploadingFile
                  ? <RefreshCw size={13} className="animate-spin" />
                  : <Send size={13} />
                }
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1.5">
              Glissez un fichier dans la fenêtre · Entrée pour envoyer · Maj+Entrée pour saut de ligne
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
          <MessageSquare size={40} strokeWidth={1.5} />
          <p className="text-sm font-medium">Sélectionnez une conversation</p>
          <p className="text-xs">Choisissez un administrateur dans la liste à gauche</p>
        </div>
      )}
    </div>
  );
}
