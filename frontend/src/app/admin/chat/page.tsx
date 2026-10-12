"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import {
  adminChat,
  isSuperAdmin,
  tokenStore,
  type ChatAdminSummary,
  type ChatConversation,
  type ChatGroupConversation,
  type ChatMsg,
  type ChatTraceItem,
} from "@/lib/admin-api";
import { toast } from "@/components/admin/Toast";
import {
  Check,
  CheckCheck,
  ChevronLeft,
  Download,
  FileText,
  Image,
  MessageSquare,
  Paperclip,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  Shield,
  ThumbsUp,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";

const G = "#0a6030";
const GL = "#f0fdf4";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type ChatRealtimeEvent = {
  kind?: "created" | "updated" | "deleted" | "thumb" | "group_created";
  message?: ChatMsg;
  group?: ChatGroupConversation;
} | ChatMsg;

type ChatThread =
  | { type: "direct"; conversation: ChatConversation }
  | { type: "group"; conversation: ChatGroupConversation };

function fmt(d: string) {
  return new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(d: string) {
  const date = new Date(d);
  const today = new Date();
  const diff = today.getDate() - date.getDate();
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function fmtSize(bytes?: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

function normalizeThumbs(msg: ChatMsg) {
  return Array.isArray(msg.thumbs) ? msg.thumbs : [];
}

function isDeleted(msg: ChatMsg) {
  return Boolean(msg.deleted_at);
}

function upsertMessages(list: ChatMsg[], incoming: ChatMsg) {
  const exists = list.some((message) => message.id_msg === incoming.id_msg && message.scope === incoming.scope);
  const next = exists
    ? list.map((message) =>
        message.id_msg === incoming.id_msg && message.scope === incoming.scope ? incoming : message
      )
    : [...list, incoming];

  return next.sort((a, b) => {
    const tA = new Date(a.created_at).getTime();
    const tB = new Date(b.created_at).getTime();
    return tA === tB ? a.id_msg - b.id_msg : tA - tB;
  });
}

function previewLabel(msg: ChatMsg | null) {
  if (!msg) return "Aucun message";
  if (isDeleted(msg)) return "Message supprimé";
  if (msg.type_message !== "texte") return `📎 ${msg.fichier_nom ?? "Fichier"}`;
  return msg.contenu || "Message sans texte";
}

function thumbLabel(msg: ChatMsg) {
  if (!msg.thumb_admins?.length) return "";
  return `Thumb par ${msg.thumb_admins.map((admin) => admin.nom).join(", ")}`;
}

function Avatar({ nom, avatar, size = 36 }: { nom: string; avatar?: string | null; size?: number }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={nom}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-white text-sm"
      style={{ width: size, height: size, background: G }}
    >
      {nom.charAt(0).toUpperCase()}
    </div>
  );
}

function GroupAvatar({ nom, size = 38 }: { nom: string; size?: number }) {
  return (
    <div
      className="rounded-2xl flex items-center justify-center flex-shrink-0 text-white"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${G}, #1f8f52)` }}
    >
      <Users size={size > 30 ? 18 : 14} />
    </div>
  );
}

function FilePreview({ msg, isMe }: { msg: ChatMsg; isMe: boolean }) {
  if (!msg.fichier_url) return null;

  if (msg.type_message === "image") {
    return (
      <a
        href={msg.fichier_url}
        target="_blank"
        rel="noreferrer"
        className="mt-1 block max-w-full overflow-hidden rounded-xl border border-gray-200 transition-opacity hover:opacity-90 sm:max-w-[220px]"
      >
        <img src={msg.fichier_url} alt={msg.fichier_nom ?? "image"} className="w-full object-cover" />
      </a>
    );
  }

  return (
    <a
      href={msg.fichier_url}
      target="_blank"
      rel="noreferrer"
      download={msg.fichier_nom ?? undefined}
      className={`mt-1 flex max-w-full items-center gap-3 rounded-xl border px-3 py-2.5 transition-all hover:shadow-sm sm:max-w-[260px] ${
        isMe ? "bg-white/15 border-white/25 text-white" : "bg-white border-gray-200 text-gray-800"
      }`}
    >
      <FileText size={22} className={msg.type_message === "pdf" ? "text-red-500" : "text-blue-500"} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">{msg.fichier_nom ?? "Fichier"}</p>
        <p className={`text-[11px] ${isMe ? "text-white/60" : "text-gray-400"}`}>{fmtSize(msg.fichier_size)}</p>
      </div>
      <Download size={14} className={isMe ? "text-white/60" : "text-gray-400"} />
    </a>
  );
}

function MessageActionButton({
  onClick,
  active = false,
  disabled = false,
  destructive = false,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  destructive?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
        destructive
          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
          : active
            ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            : "border-gray-200 bg-white text-gray-500 hover:border-green-200 hover:text-green-700"
      }`}
    >
      {children}
    </button>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full inline-block"
          style={{ background: G, animation: `chatBounce 1.2s ease-in-out ${i * 0.18}s infinite` }}
        />
      ))}
      <style>{`@keyframes chatBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-[12px] text-gray-400 font-medium">{label}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function GroupModal({
  open,
  onClose,
  availableAdmins,
  onSubmit,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  availableAdmins: ChatAdminSummary[];
  onSubmit: (data: { nom: string; description?: string; member_ids: number[] }) => Promise<void>;
  saving: boolean;
}) {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [memberIds, setMemberIds] = useState<number[]>([]);

  useEffect(() => {
    if (!open) {
      setNom("");
      setDescription("");
      setMemberIds([]);
    }
  }, [open]);

  if (!open) return null;

  const toggleMember = (id_admin: number) => {
    setMemberIds((current) =>
      current.includes(id_admin) ? current.filter((id) => id !== id_admin) : [...current, id_admin]
    );
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Créer un groupe</h2>
            <p className="text-xs text-gray-400 mt-0.5">Ajoute des administrateurs au canal interne.</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-green-700">Nom du groupe</label>
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex. Direction & Commerce"
              className="h-11 w-full rounded-2xl border border-gray-200 px-3 text-sm outline-none transition-colors focus:border-green-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-green-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Objet du groupe ou contexte de travail"
              className="w-full rounded-2xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-green-400"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-green-700">Membres</label>
              <span className="text-[12px] text-gray-400">{memberIds.length} sélectionné(s)</span>
            </div>
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50 p-2">
              {availableAdmins.map((admin) => {
                const active = memberIds.includes(admin.id_admin);
                return (
                  <button
                    key={admin.id_admin}
                    type="button"
                    onClick={() => toggleMember(admin.id_admin)}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all ${
                      active ? "border-green-200 bg-green-50" : "border-transparent bg-white hover:border-gray-200"
                    }`}
                  >
                    <Avatar nom={admin.nom} avatar={admin.avatar} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-800">{admin.nom}</p>
                      <p className="truncate text-[12px] text-gray-400">{admin.email}</p>
                    </div>
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        active ? "border-green-600 bg-green-600 text-white" : "border-gray-300"
                      }`}
                    >
                      {active && <Check size={12} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={saving || !nom.trim() || memberIds.length === 0}
            onClick={() => onSubmit({ nom: nom.trim(), description: description.trim(), member_ids: memberIds })}
            className="h-11 flex-1 rounded-2xl bg-green-700 text-sm font-semibold text-white transition-colors hover:bg-green-800 disabled:opacity-50"
          >
            {saving ? "Création..." : "Créer le groupe"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminChatPage() {
  const searchParams = useSearchParams();
  const currentAdmin = tokenStore.getAdmin();
  const superAdmin = isSuperAdmin(currentAdmin);
  const requestedGroup = searchParams.get("group");

  const [directConversations, setDirectConversations] = useState<ChatConversation[]>([]);
  const [groupConversations, setGroupConversations] = useState<ChatGroupConversation[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingSidebar, setLoadingSidebar] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [myId, setMyId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [searchThread, setSearchThread] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);
  const [availableAdmins, setAvailableAdmins] = useState<ChatAdminSummary[]>([]);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [traceItems, setTraceItems] = useState<ChatTraceItem[]>([]);
  const [traceLoading, setTraceLoading] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const [chatError, setChatError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const token = tokenStore.get();
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setMyId(payload.id_admin ?? null);
      }
    } catch {}
  }, []);

  const syncSelectedThread = useCallback((nextDirect: ChatConversation[], nextGroups: ChatGroupConversation[]) => {
    setSelectedThread((current) => {
      if (!current) return current;
      if (current.type === "direct") {
        const updated = nextDirect.find((conversation) => conversation.admin.id_admin === current.conversation.admin.id_admin);
        return updated ? { type: "direct", conversation: updated } : current;
      }
      const updated = nextGroups.find((group) => group.id_group === current.conversation.id_group);
      return updated ? { type: "group", conversation: updated } : current;
    });
  }, []);

  const loadSidebar = useCallback(async () => {
    setLoadingSidebar(true);
    setChatError("");
    try {
      const [direct, groups] = await Promise.all([adminChat.conversations(), adminChat.groups()]);
      setDirectConversations(direct);
      setGroupConversations(groups);
      syncSelectedThread(direct, groups);
    } catch (e) {
      setChatError((e as Error).message);
    } finally {
      setLoadingSidebar(false);
    }
  }, [syncSelectedThread]);

  const loadAvailableAdmins = useCallback(async () => {
    try {
      setAvailableAdmins(await adminChat.availableAdmins());
    } catch (e) {
      toast.error("Erreur", (e as Error).message);
    }
  }, []);

  const loadTrace = useCallback(async () => {
    if (!superAdmin) return;
    setTraceLoading(true);
    try {
      setTraceItems(await adminChat.trace());
    } catch (e) {
      toast.error("Traçabilité", (e as Error).message);
    } finally {
      setTraceLoading(false);
    }
  }, [superAdmin]);

  useEffect(() => {
    loadSidebar();
  }, [loadSidebar]);

  useEffect(() => {
    const id = setInterval(loadSidebar, 10_000);
    return () => clearInterval(id);
  }, [loadSidebar]);

  useEffect(() => {
    const token = tokenStore.get();
    if (!token) return;

    const es = new EventSource(`${API}/admin/chat/events?token=${token}`);

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as ChatRealtimeEvent;

        if ("group" in payload && payload.group) {
          loadSidebar();
          if (superAdmin && showTrace) loadTrace();
          return;
        }

        const message: ChatMsg | undefined =
          "message" in payload && payload.message ? payload.message : (payload as ChatMsg);

        if (!message?.id_msg) return;

        setSelectedThread((current) => {
          if (!current) return current;

          const matches = current.type === "direct"
            ? message.scope !== "group" &&
              (message.id_from === current.conversation.admin.id_admin ||
                message.id_to === current.conversation.admin.id_admin)
            : message.scope === "group" && message.id_group === current.conversation.id_group;

          if (matches) {
            setMessages((previous) => upsertMessages(previous, message));
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
          }
          return current;
        });

        loadSidebar();
        if (superAdmin && showTrace) loadTrace();
      } catch {}
    };

    es.onerror = () => es.close();
    return () => es.close();
  }, [loadSidebar, loadTrace, showTrace, superAdmin]);

  const loadDirectMessages = useCallback(async (conversation: ChatConversation) => {
    setShowTrace(false);
    setSelectedThread({ type: "direct", conversation });
    setMessages([]);
    setLoadingMsgs(true);
    try {
      const response = await adminChat.messages(conversation.admin.id_admin);
      setMessages(response.messages);
      await adminChat.markRead(conversation.admin.id_admin).catch(() => {});
      loadSidebar();
    } catch (e) {
      toast.error("Messages", (e as Error).message);
    } finally {
      setLoadingMsgs(false);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 100);
    }
  }, [loadSidebar]);

  const loadGroupMessages = useCallback(async (conversation: ChatGroupConversation) => {
    setShowTrace(false);
    setSelectedThread({ type: "group", conversation });
    setMessages([]);
    setLoadingMsgs(true);
    try {
      const response = await adminChat.groupMessages(conversation.id_group);
      setMessages(response.messages);
      await adminChat.markGroupRead(conversation.id_group).catch(() => {});
      loadSidebar();
    } catch (e) {
      toast.error("Groupe", (e as Error).message);
    } finally {
      setLoadingMsgs(false);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 100);
    }
  }, [loadSidebar]);

  useEffect(() => {
    if (!requestedGroup || selectedThread || groupConversations.length === 0) return;
    const id_group = Number(requestedGroup);
    if (!Number.isInteger(id_group)) return;
    const group = groupConversations.find((item) => item.id_group === id_group);
    if (group) loadGroupMessages(group);
  }, [groupConversations, loadGroupMessages, requestedGroup, selectedThread]);

  useEffect(() => {
    setEditingId(null);
    setEditingValue("");
  }, [selectedThread?.type, selectedThread && (selectedThread.type === "direct"
    ? selectedThread.conversation.admin.id_admin
    : selectedThread.conversation.id_group)]);

  useEffect(() => {
    if (!selectedThread) return;

    const id = setInterval(async () => {
      try {
        const response = selectedThread.type === "direct"
          ? await adminChat.messages(selectedThread.conversation.admin.id_admin)
          : await adminChat.groupMessages(selectedThread.conversation.id_group);
        setMessages(response.messages);
      } catch {}
    }, 5000);

    return () => clearInterval(id);
  }, [selectedThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!selectedThread || (!input.trim() && !previewFile) || sending) return;

    if (previewFile) {
      await sendFile(previewFile);
      return;
    }

    const text = input.trim();
    setInput("");
    setSending(true);

    try {
      const msg = selectedThread.type === "direct"
        ? await adminChat.send(selectedThread.conversation.admin.id_admin, text)
        : await adminChat.sendGroup(selectedThread.conversation.id_group, text);

      setMessages((previous) => upsertMessages(previous, msg));
      loadSidebar();
    } catch (e) {
      setInput(text);
      toast.error("Envoi", (e as Error).message);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const sendFile = async (file: File) => {
    if (!selectedThread) return;
    setUploadingFile(true);
    setPreviewFile(null);

    try {
      const msg = selectedThread.type === "direct"
        ? await adminChat.sendFile(selectedThread.conversation.admin.id_admin, file, input.trim())
        : await adminChat.sendGroupFile(selectedThread.conversation.id_group, file, input.trim());

      setMessages((previous) => upsertMessages(previous, msg));
      setInput("");
      loadSidebar();
    } catch (e) {
      toast.error("Pièce jointe", (e as Error).message);
    } finally {
      setUploadingFile(false);
      inputRef.current?.focus();
    }
  };

  const startEdit = (msg: ChatMsg) => {
    setEditingId(msg.id_msg);
    setEditingValue(msg.contenu ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const submitEdit = async (msg: ChatMsg) => {
    const nextValue = editingValue.trim();
    if (!msg.fichier_url && !nextValue) return;

    setActingId(msg.id_msg);
    try {
      const updated = msg.scope === "group"
        ? await adminChat.updateGroupMessage(msg.id_msg, editingValue)
        : await adminChat.updateMessage(msg.id_msg, editingValue);
      setMessages((previous) => upsertMessages(previous, updated));
      loadSidebar();
      if (superAdmin && showTrace) loadTrace();
      cancelEdit();
    } catch (e) {
      toast.error("Modification", (e as Error).message);
    } finally {
      setActingId(null);
    }
  };

  const removeMessage = async (msg: ChatMsg) => {
    setActingId(msg.id_msg);
    try {
      const removed = msg.scope === "group"
        ? await adminChat.removeGroupMessage(msg.id_msg)
        : await adminChat.removeMessage(msg.id_msg);
      setMessages((previous) => upsertMessages(previous, removed));
      loadSidebar();
      if (superAdmin && showTrace) loadTrace();
      if (editingId === msg.id_msg) cancelEdit();
    } catch (e) {
      toast.error("Suppression", (e as Error).message);
    } finally {
      setActingId(null);
    }
  };

  const toggleThumb = async (msg: ChatMsg) => {
    setActingId(msg.id_msg);
    try {
      const updated = msg.scope === "group"
        ? await adminChat.toggleGroupThumb(msg.id_msg)
        : await adminChat.toggleThumb(msg.id_msg);
      setMessages((previous) => upsertMessages(previous, updated));
      loadSidebar();
      if (superAdmin && showTrace) loadTrace();
    } catch (e) {
      toast.error("Réaction", (e as Error).message);
    } finally {
      setActingId(null);
    }
  };

  const createGroup = async (data: { nom: string; description?: string; member_ids: number[] }) => {
    setCreatingGroup(true);
    try {
      const group = await adminChat.createGroup(data);
      setGroupConversations((previous) => [group, ...previous.filter((item) => item.id_group !== group.id_group)]);
      setGroupModalOpen(false);
      toast.success("Groupe créé", group.nom);
      await loadGroupMessages(group);
      loadSidebar();
    } catch (e) {
      toast.error("Création du groupe", (e as Error).message);
    } finally {
      setCreatingGroup(false);
    }
  };

  const openGroupModal = async () => {
    await loadAvailableAdmins();
    setGroupModalOpen(true);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviewFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setPreviewFile(file);
  };

  const groupedMessages = useMemo(
    () => messages.reduce<Array<{ dateLabel: string; msgs: ChatMsg[] }>>((acc, msg) => {
      const label = fmtDate(msg.created_at);
      const last = acc[acc.length - 1];
      if (last && last.dateLabel === label) {
        last.msgs.push(msg);
      } else {
        acc.push({ dateLabel: label, msgs: [msg] });
      }
      return acc;
    }, []),
    [messages]
  );

  const filteredDirectConversations = useMemo(
    () =>
      directConversations.filter((conversation) =>
        !searchThread || conversation.admin.nom.toLowerCase().includes(searchThread.toLowerCase())
      ),
    [directConversations, searchThread]
  );

  const filteredGroupConversations = useMemo(
    () =>
      groupConversations.filter((group) =>
        !searchThread || group.nom.toLowerCase().includes(searchThread.toLowerCase())
      ),
    [groupConversations, searchThread]
  );

  const totalUnread = useMemo(
    () =>
      directConversations.reduce((sum, conversation) => sum + conversation.unread, 0) +
      groupConversations.reduce((sum, group) => sum + group.unread, 0),
    [directConversations, groupConversations]
  );

  const selectedTitle = selectedThread?.type === "direct"
    ? selectedThread.conversation.admin.nom
    : selectedThread?.conversation.nom ?? "";

  const traceLabel = showTrace ? "Traçabilité superadmin" : null;

  return (
    <>
      <GroupModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        availableAdmins={availableAdmins}
        onSubmit={createGroup}
        saving={creatingGroup}
      />

      <div
        className="relative flex h-[calc(100vh-80px)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:flex-row"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {dragOver && (
          <div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl"
            style={{ background: "rgba(10,96,48,0.08)", border: "2px dashed #0a6030" }}
          >
            <Paperclip size={36} style={{ color: G }} />
            <p className="mt-2 text-sm font-semibold" style={{ color: G }}>Déposez le fichier ici</p>
          </div>
        )}

        <div className={`${selectedThread || showTrace ? "hidden lg:flex" : "flex"} w-full flex-col border-b border-gray-100 lg:w-80 lg:flex-shrink-0 lg:border-b-0 lg:border-r`}>
          <div className="border-b border-gray-100 px-4 py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} style={{ color: G }} />
                <span className="text-sm font-semibold text-gray-800">Messagerie interne</span>
                {totalUnread > 0 && (
                  <span className="rounded-full px-1.5 py-0.5 text-[11px] font-bold text-white" style={{ background: G }}>
                    {totalUnread}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {superAdmin && (
                  <button
                    type="button"
                    onClick={() => { setShowTrace(true); setSelectedThread(null); loadTrace(); }}
                    className={`rounded-lg p-1.5 transition-colors ${showTrace ? "bg-green-50 text-green-700" : "text-gray-400 hover:bg-gray-100"}`}
                  >
                    <Shield size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={loadSidebar}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100"
                >
                  <RefreshCw size={13} className={loadingSidebar ? "animate-spin" : ""} />
                </button>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={openGroupModal}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl bg-green-700 px-3 text-xs font-semibold text-white transition-colors hover:bg-green-800"
              >
                <Plus size={13} />
                Nouveau groupe
              </button>
              {superAdmin && (
                <button
                  type="button"
                  onClick={() => { setShowTrace((value) => !value); if (!showTrace) loadTrace(); }}
                  className={`inline-flex h-9 items-center justify-center rounded-xl border px-3 text-xs font-semibold transition-colors ${
                    showTrace ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Trace
                </button>
              )}
            </div>
          </div>

          <div className="border-b border-gray-100 px-3 py-2">
            <input
              value={searchThread}
              onChange={(e) => setSearchThread(e.target.value)}
              placeholder="Rechercher un admin ou un groupe…"
              className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs outline-none transition-colors focus:border-green-400"
            />
          </div>

          {chatError ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-gray-400">
              <MessageSquare size={28} />
              <p className="text-sm font-semibold text-gray-600">Messagerie indisponible</p>
              <p className="text-xs">{chatError}</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="border-b border-gray-100 px-4 py-2.5">
                <p className="text-[12px] font-bold uppercase tracking-wider text-gray-400">Admins</p>
              </div>
              {loadingSidebar && directConversations.length === 0 && groupConversations.length === 0 ? (
                <div className="flex h-24 items-center justify-center text-sm text-gray-400">Chargement…</div>
              ) : filteredDirectConversations.length === 0 && filteredGroupConversations.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center gap-2 text-gray-400">
                  <User size={22} />
                  <span className="text-xs">Aucun résultat</span>
                </div>
              ) : (
                <>
                  {filteredDirectConversations.map((conversation) => {
                    const active = selectedThread?.type === "direct" &&
                      selectedThread.conversation.admin.id_admin === conversation.admin.id_admin;
                    return (
                      <button
                        key={`direct-${conversation.admin.id_admin}`}
                        type="button"
                        onClick={() => loadDirectMessages(conversation)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                        style={active ? { background: GL, borderRight: `3px solid ${G}` } : {}}
                      >
                        <div className="relative">
                          <Avatar nom={conversation.admin.nom} avatar={conversation.admin.avatar} size={38} />
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`truncate text-sm ${active ? "font-semibold" : "font-medium"} text-gray-800`}>
                              {conversation.admin.nom}
                            </span>
                            {conversation.last_message && (
                              <span className="ml-1 flex-shrink-0 text-[11px] text-gray-400">
                                {fmt(conversation.last_message.created_at)}
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1">
                            <span className="truncate text-xs text-gray-400">{previewLabel(conversation.last_message)}</span>
                            {conversation.unread > 0 && (
                              <span className="ml-auto flex-shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-bold text-white" style={{ background: G }}>
                                {conversation.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  <div className="border-y border-gray-100 px-4 py-2.5">
                    <p className="text-[12px] font-bold uppercase tracking-wider text-gray-400">Groupes</p>
                  </div>

                  {filteredGroupConversations.map((group) => {
                    const active = selectedThread?.type === "group" && selectedThread.conversation.id_group === group.id_group;
                    return (
                      <button
                        key={`group-${group.id_group}`}
                        type="button"
                        onClick={() => loadGroupMessages(group)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                        style={active ? { background: GL, borderRight: `3px solid ${G}` } : {}}
                      >
                        <GroupAvatar nom={group.nom} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`truncate text-sm ${active ? "font-semibold" : "font-medium"} text-gray-800`}>
                              {group.nom}
                            </span>
                            {group.last_message && (
                              <span className="text-[11px] text-gray-400">{fmt(group.last_message.created_at)}</span>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1">
                            <span className="truncate text-xs text-gray-400">{previewLabel(group.last_message)}</span>
                            {group.unread > 0 && (
                              <span className="ml-auto flex-shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-bold text-white" style={{ background: G }}>
                                {group.unread}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[11px] text-gray-400">{group.members.length} membres</p>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>

        {showTrace && superAdmin ? (
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex flex-shrink-0 items-center gap-3 border-b border-gray-100 px-4 py-3.5 sm:px-5">
              <button
                type="button"
                onClick={() => setShowTrace(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 lg:hidden"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Shield size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Traçabilité complète</p>
                <p className="text-[12px] text-gray-400">Visibilité superadmin sur messages, groupes, modifications et thumbs.</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              {traceLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">Chargement…</div>
              ) : traceItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
                  <Shield size={28} />
                  <span className="text-sm">Aucune activité récente</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {traceItems.map((item) => {
                    const message = item.message;
                    const action = message.deleted_at ? "Supprimé" : message.edited_at ? "Modifié" : "Message";
                    return (
                      <div key={item.trace_id} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-green-700">
                            {item.scope}
                          </span>
                          <span className="text-xs font-semibold text-gray-700">{item.conversation_label}</span>
                          <span className="text-[12px] text-gray-400">{action}</span>
                          <span className="ml-auto text-[12px] text-gray-400">{fmt(message.created_at)}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-700">{previewLabel(message)}</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-[12px] text-gray-500">
                          <span>Émetteur: {message.emetteur.nom}</span>
                          {message.group_name ? <span>Groupe: {message.group_name}</span> : message.recepteur && <span>Destinataire: {message.recepteur.nom}</span>}
                          {message.thumb_admins?.length ? <span>{thumbLabel(message)}</span> : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : selectedThread ? (
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex flex-shrink-0 items-center gap-3 border-b border-gray-100 px-4 py-3.5 sm:px-5">
              <button
                type="button"
                onClick={() => setSelectedThread(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 lg:hidden"
              >
                <ChevronLeft size={18} />
              </button>
              {selectedThread.type === "direct" ? (
                <div className="relative">
                  <Avatar nom={selectedThread.conversation.admin.nom} avatar={selectedThread.conversation.admin.avatar} size={36} />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-400" />
                </div>
              ) : (
                <GroupAvatar nom={selectedThread.conversation.nom} size={36} />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800">{selectedTitle}</p>
                <p className="truncate text-[12px] text-gray-400">
                  {selectedThread.type === "direct"
                    ? selectedThread.conversation.admin.email
                    : `${selectedThread.conversation.members.length} membres · ${selectedThread.conversation.members.map((member) => member.nom).join(", ")}`}
                </p>
              </div>
              <div className="ml-auto hidden items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1 text-[12px] font-semibold text-green-700 sm:flex">
                <MessageSquare size={12} />
                {traceLabel ?? "Chat interne sécurisé"}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5" style={{ scrollbarWidth: "thin" }}>
              {loadingMsgs ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">Chargement…</div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
                  <MessageSquare size={32} strokeWidth={1.5} />
                  <span className="text-sm">Aucun message. Soyez le premier !</span>
                </div>
              ) : (
                groupedMessages.map((group) => (
                  <div key={group.dateLabel}>
                    <DateSeparator label={group.dateLabel} />
                    {group.msgs.map((msg) => {
                      const isMe = msg.id_from === myId;
                      const deleted = isDeleted(msg);
                      const thumbs = normalizeThumbs(msg);
                      const hasThumbed = myId ? thumbs.includes(myId) : false;
                      const thumbNames = thumbLabel(msg);

                      return (
                        <div key={`${msg.scope}-${msg.id_msg}`} className={`group mb-3 flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                          {!isMe && (
                            <Avatar nom={msg.emetteur.nom} avatar={msg.emetteur.avatar} size={28} />
                          )}

                          <div className={`flex max-w-[85%] flex-col ${isMe ? "items-end" : "items-start"} sm:max-w-[68%]`}>
                            {!isMe && selectedThread.type === "group" && (
                              <p className="mb-1 px-1 text-[12px] font-semibold text-gray-500">{msg.emetteur.nom}</p>
                            )}

                            {deleted ? (
                              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-3.5 py-2 text-sm italic text-gray-400">
                                Message supprimé
                              </div>
                            ) : editingId === msg.id_msg ? (
                              <div className="min-w-[260px] max-w-full rounded-2xl border border-green-200 bg-white p-3 shadow-sm">
                                <textarea
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  rows={msg.fichier_url ? 3 : 4}
                                  className="w-full resize-none rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-sm text-gray-800 outline-none focus:border-green-300"
                                  placeholder={msg.fichier_url ? "Ajouter ou modifier la légende…" : "Modifier le message…"}
                                />
                                <div className="mt-3 flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-50"
                                  >
                                    <X size={13} />
                                    Annuler
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => submitEdit(msg)}
                                    disabled={actingId === msg.id_msg || (!msg.fichier_url && !editingValue.trim())}
                                    className="inline-flex items-center gap-1 rounded-full bg-green-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-800 disabled:opacity-50"
                                  >
                                    <Check size={13} />
                                    Enregistrer
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {msg.contenu && (
                                  <div
                                    className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                                      isMe
                                        ? "rounded-br-sm text-white"
                                        : "rounded-bl-sm border border-gray-100 text-gray-800"
                                    }`}
                                    style={isMe ? { background: G } : { background: "#f8faf9" }}
                                  >
                                    {msg.contenu}
                                  </div>
                                )}
                                <FilePreview msg={msg} isMe={isMe} />
                              </>
                            )}

                            {!deleted && editingId !== msg.id_msg && (
                              <div className="mt-1 flex flex-wrap items-center gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                                <MessageActionButton
                                  onClick={() => toggleThumb(msg)}
                                  active={hasThumbed}
                                  disabled={actingId === msg.id_msg}
                                >
                                  <ThumbsUp size={12} className={hasThumbed ? "fill-current" : ""} />
                                  {thumbs.length > 0 ? thumbs.length : "Thumb"}
                                </MessageActionButton>

                                {isMe && (
                                  <MessageActionButton
                                    onClick={() => startEdit(msg)}
                                    disabled={actingId === msg.id_msg}
                                  >
                                    <Pencil size={12} />
                                    Modifier
                                  </MessageActionButton>
                                )}

                                {isMe && (
                                  <MessageActionButton
                                    onClick={() => removeMessage(msg)}
                                    disabled={actingId === msg.id_msg}
                                    destructive
                                  >
                                    <Trash2 size={12} />
                                    Supprimer
                                  </MessageActionButton>
                                )}
                              </div>
                            )}

                            {thumbNames && (
                              <p className="mt-1 px-1 text-[11px] font-medium text-green-700">{thumbNames}</p>
                            )}

                            <div className={`mt-1 flex items-center gap-1 ${isMe ? "flex-row-reverse" : ""}`}>
                              <p className="text-[11px] text-gray-400">{fmt(msg.created_at)}</p>
                              {!deleted && msg.edited_at && (
                                <p className="text-[11px] text-gray-400">modifié</p>
                              )}
                              {msg.scope !== "group" && isMe && (
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
                <div className="mb-3 flex justify-end">
                  <div className="rounded-2xl rounded-br-sm border border-gray-100" style={{ background: "#f8faf9" }}>
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {previewFile && (
              <div className="mx-4 mb-2 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5">
                {previewFile.type.startsWith("image/")
                  ? <Image size={18} style={{ color: G }} />
                  : <FileText size={18} style={{ color: G }} />
                }
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-gray-800">{previewFile.name}</p>
                  <p className="text-[11px] text-gray-400">{fmtSize(previewFile.size)}</p>
                </div>
                <button onClick={() => setPreviewFile(null)} className="p-1 text-gray-400 transition-colors hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="flex-shrink-0 border-t border-gray-100 px-4 py-3">
              <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 transition-all focus-within:border-green-400 focus-within:bg-white">
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                  onChange={handleFileSelect}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mb-1 rounded-lg p-1 text-gray-400 transition-colors hover:text-green-700"
                  title="Joindre un fichier"
                >
                  <Paperclip size={16} />
                </button>

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={`Message à ${selectedTitle}… (Entrée pour envoyer)`}
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
                  disabled={sending || uploadingFile}
                  style={{ maxHeight: 100 }}
                />

                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={(!input.trim() && !previewFile) || sending || uploadingFile}
                  className="mb-0.5 flex h-8 w-8 items-center justify-center rounded-xl text-white transition-all disabled:opacity-40"
                  style={{ background: G }}
                >
                  {sending || uploadingFile
                    ? <RefreshCw size={13} className="animate-spin" />
                    : <Send size={13} />
                  }
                </button>
              </div>
              <p className="mt-1.5 text-center text-[11px] text-gray-400">
                Glissez un fichier dans la fenêtre · Entrée pour envoyer · Maj+Entrée pour saut de ligne
              </p>
            </div>
          </div>
        ) : (
          <div className="hidden flex-1 flex-col items-center justify-center gap-3 text-gray-400 lg:flex">
            <MessageSquare size={40} strokeWidth={1.5} />
            <p className="text-sm font-medium">Sélectionnez une conversation ou un groupe</p>
            <p className="text-xs">Créez un groupe, envoyez des fichiers et suivez les thumbs dans un seul écran.</p>
          </div>
        )}
      </div>
    </>
  );
}