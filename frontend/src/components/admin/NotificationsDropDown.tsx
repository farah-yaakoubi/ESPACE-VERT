"use client";
// src/components/admin/NotificationsDropdown.tsx
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Check, Trash2, X, FileText, Calendar, MessageSquare } from "lucide-react";
import { adminNotifs, tokenStore, type AdminNotif } from "@/lib/admin-api";

const A = { accent: "#2e7d4f", accentXl: "#4fbb7a" };

const ICONS: Record<string, { Icon: any; bg: string; color: string }> = {
  nouveau_devis:   { Icon: FileText,      bg: "#EEF2FF", color: "#3C50E0" },
  nouveau_rdv:     { Icon: Calendar,      bg: "#D1FAE5", color: "#10B981" },
  nouveau_message: { Icon: MessageSquare, bg: "#FEF3C7", color: "#F59E0B" },
  message_interne: { Icon: MessageSquare, bg: "#E0F2FE", color: "#0284C7" },
};

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1)  return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function senderMeta(n: AdminNotif) {
  if (n.emetteur?.nom) {
    return {
      label: `De ${n.emetteur.nom}`,
      avatar: n.emetteur.avatar ?? null,
      initials: n.emetteur.nom.charAt(0).toUpperCase(),
    };
  }
  if (n.source_label) {
    return {
      label: `Depuis le site : ${n.source_label}`,
      avatar: null,
      initials: n.source_label.charAt(0).toUpperCase(),
    };
  }
  if (n.type === "message_interne") {
    return { label: "Message interne", avatar: null, initials: "A" };
  }
  return { label: "Depuis le site", avatar: null, initials: "S" };
}

export function NotificationsDropdown({ isDark, pollInterval = 60000 }: { isDark: boolean; pollInterval?: number }) {
  const [open,   setOpen]   = useState(false);
  const [notifs, setNotifs] = useState<AdminNotif[]>([]);
  const [unread, setUnread] = useState(0);
  const [pulse,  setPulse]  = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const r = await adminNotifs.list();
      setNotifs(r.notifs);
      setUnread(r.unread);
    } catch {}
  };

  // Polling de secours
  useEffect(() => {
    load();
    const t = setInterval(load, pollInterval);
    return () => clearInterval(t);
  }, [pollInterval]);

  // SSE temps réel
  useEffect(() => {
    let es: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        const token = tokenStore.get() ?? "";
        const url = `${BASE}/admin/notifications/events${token ? `?token=${encodeURIComponent(token)}` : ""}`;
        es = new EventSource(url);

        es.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data);
            if (data?.type) {
              load();
              setPulse(true);
              setTimeout(() => setPulse(false), 1000);
            }
          } catch {}
        };

        es.onerror = () => {
          es?.close();
          retryTimer = setTimeout(connect, 5000);
        };
      } catch {}
    };

    connect();
    return () => {
      es?.close();
      clearTimeout(retryTimer);
    };
  }, []);

  // Fermer au clic extérieur
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const markRead = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await adminNotifs.markRead(id).catch(() => {});
    setNotifs(n => n.map(x => x.id_notif === id ? { ...x, lu: true } : x));
    setUnread(u => Math.max(0, u - 1));
  };

  const remove = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const was = notifs.find(x => x.id_notif === id);
    await adminNotifs.remove(id).catch(() => {});
    setNotifs(n => n.filter(x => x.id_notif !== id));
    if (was && !was.lu) setUnread(u => Math.max(0, u - 1));
  };

  const markAll = async () => {
    await adminNotifs.markAll().catch(() => {});
    setNotifs(n => n.map(x => ({ ...x, lu: true })));
    setUnread(0);
  };

  // Thème
  const bg     = isDark ? "#1e2d22" : "#fff";
  const bdr    = isDark ? "rgba(255,255,255,0.08)" : "#e5ede8";
  const tPri   = isDark ? "#e8f0ea" : "#1a2e20";
  const tSec   = isDark ? "rgba(232,240,234,0.5)" : "#7a9980";
  const hoverB = isDark ? "rgba(46,125,79,0.06)" : "#f8fffe";

  return (
    <div ref={ref} style={{ position: "relative" }}>

      {/* Bouton cloche */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 36, height: 36, display: "flex", alignItems: "center",
          justifyContent: "center", borderRadius: 10, border: "none",
          background: open ? (isDark ? "rgba(255,255,255,0.08)" : "#f0faf4") : "transparent",
          cursor: "pointer", position: "relative",
          color: isDark ? "rgba(232,240,234,0.5)" : "#6B7280",
          transition: "background 0.15s",
        }}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: 7, right: 7, width: 7, height: 7,
            borderRadius: "50%", background: A.accent,
            border: `1.5px solid ${isDark ? "#131f16" : "#fff"}`,
            transition: "transform 0.2s",
            transform: pulse ? "scale(1.8)" : "scale(1)",
          }} />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0, width: 360,
          background: bg, borderRadius: 16, border: `1px solid ${bdr}`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)", zIndex: 100, overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            padding: "14px 16px", display: "flex", alignItems: "center",
            justifyContent: "space-between", borderBottom: `1px solid ${bdr}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: tPri }}>Notifications</span>
              {unread > 0 && (
                <span style={{
                  padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                  background: isDark ? "rgba(46,125,79,0.2)" : "#f0faf4", color: A.accentXl,
                }}>
                  {unread} non {unread > 1 ? "lues" : "lue"}
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {unread > 0 && (
                <button
                  onClick={markAll}
                  style={{
                    display: "flex", alignItems: "center", gap: 4, padding: "4px 8px",
                    borderRadius: 7, border: "none",
                    background: isDark ? "rgba(46,125,79,0.15)" : "#f0faf4",
                    color: A.accentXl, fontSize: 11, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  <Check size={11} /> Tout lire
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: 28, height: 28, display: "flex", alignItems: "center",
                  justifyContent: "center", borderRadius: 7, border: "none",
                  background: "transparent", color: tSec, cursor: "pointer",
                }}
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Liste */}
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {notifs.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <Bell size={28} style={{ color: isDark ? "#2e5040" : "#ddd", margin: "0 auto 8px", display: "block" }} />
                <p style={{ fontSize: 13, color: tSec }}>Aucune notification</p>
              </div>
            ) : notifs.map(n => {
              const cfg  = ICONS[n.type] ?? ICONS.nouveau_message;
              const Icon = cfg.Icon;
              const meta = senderMeta(n);
              return (
                <Link
                  key={n.id_notif}
                  href={n.lien ?? "#"}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "12px 16px", textDecoration: "none",
                    background: n.lu ? bg : hoverB,
                    borderBottom: `1px solid ${bdr}`, position: "relative",
                  }}
                >
                  {!n.lu && (
                    <div style={{
                      position: "absolute", left: 0, top: "50%",
                      transform: "translateY(-50%)", width: 3, height: 28,
                      borderRadius: "0 3px 3px 0", background: A.accent,
                    }} />
                  )}

                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={16} style={{ color: cfg.color }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: n.lu ? 500 : 700, color: tPri, lineHeight: 1.3, marginBottom: 3 }}>
                      {n.titre}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: n.corps ? 4 : 0 }}>
                      {meta.avatar ? (
                        <img
                          src={meta.avatar}
                          alt={meta.label}
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <span
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            fontSize: 10,
                            fontWeight: 700,
                            background: isDark ? "rgba(46,125,79,0.16)" : "#eef6f0",
                            color: isDark ? "#9ed8b1" : A.accent,
                          }}
                        >
                          {meta.initials}
                        </span>
                      )}
                      <p style={{ fontSize: 11.5, color: tSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {meta.label}
                      </p>
                    </div>
                    {n.corps && (
                      <p style={{ fontSize: 11.5, color: tSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {n.corps}
                      </p>
                    )}
                    <p style={{ fontSize: 11, color: isDark ? "rgba(255,255,255,0.2)" : "#bbb", marginTop: 4 }}>
                      {timeAgo(n.created_at)}
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                    {!n.lu && (
                      <button
                        onClick={e => markRead(n.id_notif, e)}
                        title="Marquer lu"
                        style={{
                          width: 24, height: 24, borderRadius: 6, border: "none",
                          background: isDark ? "rgba(46,125,79,0.2)" : "#f0faf4",
                          color: A.accentXl, cursor: "pointer", display: "flex",
                          alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Check size={11} />
                      </button>
                    )}
                    <button
                      onClick={e => remove(n.id_notif, e)}
                      title="Supprimer"
                      style={{
                        width: 24, height: 24, borderRadius: 6, border: "none",
                        background: isDark ? "rgba(239,68,68,0.15)" : "#fff0f0",
                        color: "#ef4444", cursor: "pointer", display: "flex",
                        alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
