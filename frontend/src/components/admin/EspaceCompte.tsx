"use client";
// src/components/admin/EspaceCompte.tsx
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  User, Settings, LogOut, Sun, Moon,
  ChevronDown, Shield,
} from "lucide-react";
import { adminCompte, type Admin } from "@/lib/admin-api";

const A = { accent: "#2e7d4f", accentXl: "#4fbb7a", gold: "#f59e0b" };

/* ── Toggle soleil/lune style NextAdmin ── */
function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} title={isDark ? "Mode clair" : "Mode sombre"}
      style={{ display: "flex", alignItems: "center", padding: 3, borderRadius: 10, border: "none", background: isDark ? "rgba(255,255,255,0.08)" : "#f0f4f1", cursor: "pointer", transition: "background 0.2s", gap: 2 }}>
      {/* Soleil */}
      <span style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: !isDark ? "#fff" : "transparent", boxShadow: !isDark ? "0 1px 4px rgba(0,0,0,0.12)" : "none", color: !isDark ? "#f59e0b" : "rgba(255,255,255,0.25)", transition: "all 0.2s" }}>
        <Sun size={14} />
      </span>
      {/* Lune */}
      <span style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: isDark ? "rgba(255,255,255,0.12)" : "transparent", boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "none", color: isDark ? "#a5c8b0" : "rgba(0,0,0,0.2)", transition: "all 0.2s" }}>
        <Moon size={14} />
      </span>
    </button>
  );
}

export function EspaceCompte({ admin, isDark, onToggle, onLogout }: {
  admin: Admin; isDark: boolean; onToggle: () => void; onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const isSuperAdmin = admin.role?.nom === "super_admin" || admin.id_role === 1;

  // Thème couleurs dropdown
  const bg   = isDark ? "#1e2d22" : "#fff";
  const bdr  = isDark ? "rgba(255,255,255,0.08)" : "#e5ede8";
  const tPri = isDark ? "#e8f0ea" : "#1a2e20";
  const tSec = isDark ? "rgba(232,240,234,0.5)" : "#7a9980";
  const hov  = isDark ? "rgba(255,255,255,0.05)" : "#f8faf9";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Avatar bouton */}
      <button onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px 4px 4px", borderRadius: 10, border: `1px solid ${open ? (isDark ? "rgba(46,125,79,0.4)" : "#c9e0d3") : "transparent"}`, background: open ? (isDark ? "rgba(46,125,79,0.1)" : "#f0faf4") : "transparent", cursor: "pointer", transition: "all 0.15s" }}>
        {/* Avatar */}
        {admin.avatar ? (
          <img src={admin.avatar} alt={admin.nom} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${A.accent},${A.accentXl})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {admin.nom[0]?.toUpperCase()}
          </div>
        )}
        <div className="hidden sm:block" style={{ lineHeight: 1, textAlign: "left" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: isDark ? "#e8f0ea" : "#1a2e20" }}>{admin.nom}</p>
          <p style={{ fontSize: 10, fontWeight: 600, marginTop: 2, color: isSuperAdmin ? A.gold : A.accent }}>
            {isSuperAdmin ? "Super Admin" : admin.role?.nom ?? "Admin"}
          </p>
        </div>
        <ChevronDown size={12} style={{ color: tSec, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 240, background: bg, borderRadius: 16, border: `1px solid ${bdr}`, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", zIndex: 100, overflow: "hidden" }}>

          {/* Header profil */}
          <div style={{ padding: "16px", borderBottom: `1px solid ${bdr}`, display: "flex", alignItems: "center", gap: 12 }}>
            {admin.avatar ? (
              <img src={admin.avatar} alt={admin.nom} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg,${A.accent},${A.accentXl})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {admin.nom[0]?.toUpperCase()}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: tPri, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{admin.nom}</p>
              <p style={{ fontSize: 11, color: tSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{admin.email}</p>
              <span style={{ display: "inline-block", marginTop: 4, padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: isSuperAdmin ? "rgba(245,158,11,0.15)" : "rgba(46,125,79,0.12)", color: isSuperAdmin ? A.gold : A.accentXl }}>
                {isSuperAdmin ? "Super Admin" : admin.role?.nom ?? "Admin"}
              </span>
            </div>
          </div>

          {/* Menu items */}
          <div style={{ padding: "6px" }}>
            <Link href="/admin/compte" onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, textDecoration: "none", color: tPri, fontSize: 13, fontWeight: 500, transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = hov)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <User size={14} style={{ color: tSec }} />
              Mon profil
            </Link>
          </div>

          {/* Toggle dark/light */}
          <div style={{ padding: "10px 16px", borderTop: `1px solid ${bdr}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: tSec }}>Apparence</span>
            <ThemeToggle isDark={isDark} onToggle={onToggle} />
          </div>

          {/* Déconnexion */}
          <div style={{ padding: "6px", borderTop: `1px solid ${bdr}` }}>
            <button onClick={() => { setOpen(false); onLogout(); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, border: "none", background: "transparent", color: "#ef4444", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "background 0.15s", textAlign: "left" }}
              onMouseEnter={e => (e.currentTarget.style.background = isDark ? "rgba(239,68,68,0.1)" : "#fff0f0")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <LogOut size={14} />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
