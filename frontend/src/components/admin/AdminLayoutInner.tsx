"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, Calendar, MessageSquare,
  Package, Newspaper, LogOut, Menu, X, Users,
  Shield, ExternalLink, Tag, Layers, Activity, HelpCircle,
  ChevronRight, BarChart3, Globe, ImageIcon, Bot, Crown,
  Sparkles, PlaySquare,
} from "lucide-react";
import { tokenStore, adminAuth, isSuperAdmin, type Admin } from "@/lib/admin-api";
import { hasPermission, hasAnyPermission, PERMISSIONS } from "@/lib/permissions";
import Image from "next/image";
import { ToastContainer } from "@/components/admin/Toast";
import { NotificationsDropdown } from "@/components/admin/NotificationsDropDown";
import { EspaceCompte } from "@/components/admin/EspaceCompte";
import { useTheme } from "@/hooks/useTheme";
import { AdminAIWidget } from "@/components/admin/AdminAIWidget";
import { GlobalCommandPalette } from "@/components/admin/GlobalCommandPalette";

const A = {
  bg: "#0f1a14", bg2: "#162117", accent: "#2e7d4f",
  accentLt: "#3a9e63", accentXl: "#4fbb7a", gold: "#f59e0b",
  line: "rgba(255,255,255,0.06)", text: "rgba(255,255,255,0.85)",
  textMid: "rgba(255,255,255,0.45)", textDim: "rgba(255,255,255,0.22)",
};

interface NavItem {
  href:       string;
  icon:       React.ComponentType<any>;
  label:      string;
  permission: string | null;
  superOnly?: boolean;
  isAI?:      boolean;   // ← nouveau: badge IA spécial
}
interface NavGroup { label: string; items: NavItem[]; }

const NAV_GROUPS: NavGroup[] = [
  { label: "VUE D'ENSEMBLE", items: [
    { href: "/admin/dashboard",  icon: LayoutDashboard, label: "Dashboard",     permission: null },
    { href: "/admin/analytics",  icon: BarChart3,       label: "Analytiques",   permission: PERMISSIONS.ANALYTICS_READ },
  ]},
  { label: "CATALOGUE", items: [
    { href: "/admin/marques",    icon: Tag,       label: "Marques",      permission: PERMISSIONS.PRODUITS_READ },
    { href: "/admin/activites",  icon: Activity,  label: "Activités",    permission: PERMISSIONS.PRODUITS_READ },
    { href: "/admin/categories", icon: Layers,    label: "Catégories",   permission: PERMISSIONS.PRODUITS_READ },
    { href: "/admin/produits",   icon: Package,   label: "Produits",     permission: PERMISSIONS.PRODUITS_READ },
    { href: "/admin/catalogue",  icon: ImageIcon, label: "Médias",       permission: PERMISSIONS.PRODUITS_WRITE },
  ]},
  { label: "CONTENU", items: [
    { href: "/admin/hero",       icon: ImageIcon,  label: "Hero Slides",   permission: PERMISSIONS.ACTUALITES_WRITE },
    { href: "/admin/actualites", icon: Newspaper,  label: "Actualités",   permission: PERMISSIONS.ACTUALITES_WRITE },
    { href: "/admin/tutorial-videos", icon: PlaySquare, label: "Vidéos tutoriels", permission: PERMISSIONS.ACTUALITES_WRITE },
    { href: "/admin/faq",        icon: HelpCircle, label: "FAQ",          permission: PERMISSIONS.FAQ_WRITE },
  ]},
  { label: "CRM & CONTACTS", items: [
    { href: "/admin/devis",   icon: FileText,      label: "Devis",        permission: PERMISSIONS.DEVIS_READ },
    { href: "/admin/rdv",     icon: Calendar,      label: "RDV",          permission: PERMISSIONS.RDV_READ },
    { href: "/admin/contact", icon: MessageSquare, label: "Messages",     permission: PERMISSIONS.CONTACT_READ },
    { href: "/admin/chat",    icon: MessageSquare, label: "Chat interne", permission: null },
  ]},
  { label: "SYSTÈME", items: [
    { href: "/admin/visiteurs", icon: Users,  label: "Visiteurs",          permission: PERMISSIONS.VISITEURS_READ },
    { href: "/admin/admins",    icon: Users,  label: "Administrateurs",    permission: PERMISSIONS.ADMINS_READ, superOnly: true },
    { href: "/admin/audit",     icon: Shield, label: "Journal d'audit",    permission: PERMISSIONS.ADMINS_READ, superOnly: true },
  ]},
];

function pageLabel(p: string) {
  const seg = p.split("/").filter(Boolean).pop() ?? "dashboard";
  const map: Record<string, string> = {
    dashboard: "Dashboard", marques: "Marques", activites: "Activités",
    categories: "Catégories", produits: "Produits", catalogue: "Médias",
    hero: "Hero Slides",
    actualites: "Actualités", faq: "FAQ", devis: "Devis", rdv: "Rendez-vous",
    "tutorial-videos": "Vidéos tutoriels",
    contact: "Messages", visiteurs: "Visiteurs", audit: "Journal d'audit",
    admins: "Administrateurs", analytics: "Analytiques", compte: "Mon compte",
    chat: "Chat", chatbot: "Assistant IA",
  };
  return map[seg] ?? seg.replace(/-/g, " ");
}

function LeafMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M20 5c0 0-8 0-13 5C4 13 4 19 4 19s6 0 9-3c5-5 5-11 7-11z" />
      <path d="M4 19l7-7" />
    </svg>
  );
}

/**
 * NavItem — Version étendue avec support du badge IA
 */
function NavItemComp({ href, icon: Icon, label, active, onClick, superOnly, isAI }: {
  href: string; icon: any; label: string; active: boolean; onClick: () => void;
  superOnly?: boolean; isAI?: boolean;
}) {
  return (
    <Link href={href} onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 relative"
      style={{
        color: active ? "#fff" : A.textMid,
        background: active
          ? isAI
            ? `linear-gradient(90deg,#1d4ed8,#3b82f6)`
            : `linear-gradient(90deg,${A.accent},${A.accentLt})`
          : "transparent",
        boxShadow: active
          ? isAI ? "0 3px 12px rgba(59,130,246,0.35)" : "0 3px 12px rgba(46,125,79,0.35)"
          : "none",
      }}>
      {active && <span className="absolute top-2 bottom-2 w-0.5 rounded-full" style={{ background: "#fff", opacity: 0.5, left: "-1px" }} />}
      <Icon size={15} style={{ flexShrink: 0, opacity: active ? 1 : 0.7 }} />
      <span className="flex-1 leading-none">{label}</span>
      {superOnly && <Crown size={8} style={{ opacity: 0.5, color: A.gold }} />}
      {isAI && !superOnly && (
        <span style={{
          fontSize: 8, fontWeight: 800, padding: "1px 5px",
          borderRadius: 20, letterSpacing: "0.05em",
          background: active ? "rgba(255,255,255,0.2)" : "rgba(59,130,246,0.2)",
          color: active ? "#fff" : "#93c5fd",
          border: `1px solid ${active ? "rgba(255,255,255,0.3)" : "rgba(59,130,246,0.3)"}`,
          textTransform: "uppercase",
        }}>
          IA
        </span>
      )}
    </Link>
  );
}

export function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { isDark, toggle } = useTheme();

  const [admin,     setAdmin]     = useState<Admin | null>(() => tokenStore.getAdmin());
  const [sideOpen,  setSideOpen]  = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) { setAuthReady(true); return; }
    const token = tokenStore.get();
    if (!token) { router.replace("/admin/login"); return; }
    adminAuth.me()
      .then(a => { setAdmin(a); tokenStore.setAdmin(a); setAuthReady(true); })
      .catch(() => { tokenStore.clear(); router.replace("/admin/login"); });
  }, [isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;

  if (!authReady) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f1a14" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white overflow-hidden">
          <Image
            src="/logos/logo-espace-vert.png"
            alt="Espace Vert"
            width={44}
            height={44}
            priority
            style={{ objectFit: "contain", width: "auto", height: "auto", maxWidth: "100%", maxHeight: "100%" }}
          />
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: A.accent, animationDelay: `${i * 0.15}s` }} />)}
        </div>
      </div>
    </div>
  );

  const superAdmin  = isSuperAdmin(admin);
  const sideW       = collapsed ? 64 : 240;

  const handleLogout = async () => {
    try { await adminAuth.logout(tokenStore.getRefresh()); } catch {}
    tokenStore.clear(); router.push("/admin/login");
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const visibleGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (item.superOnly && !superAdmin) return false;
      if (!item.permission) return true;
      return hasPermission(admin, item.permission as any);
    }),
  })).filter(group => group.items.length > 0);

  return (
    <div className="min-h-screen flex admin-themed" style={{ background: "var(--admin-bg)" }}>

      {/* ══ SIDEBAR ══ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col ${sideOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        style={{ width: sideW, background: A.bg, boxShadow: "4px 0 24px rgba(0,0,0,0.3)", transition: "width 0.25s, transform 0.3s" }}
      >
        {/* Marque */}
        <div style={{ height: 64, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: `1px solid ${A.line}`, flexShrink: 0, gap: 10, overflow: "hidden" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
            <Image
              src="/logos/logo-espace-vert.png"
              alt="Espace Vert"
              width={30}
              height={30}
              priority
              style={{ objectFit: "contain", width: "auto", height: "auto", maxWidth: "100%", maxHeight: "100%" }}
            />
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: "-0.025em", lineHeight: 1 }}>EspaceVert</p>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                <p style={{ color: A.accent, fontWeight: 600, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>Administration</p>
                {/* Badge SaaS */}
                <span style={{
                  fontSize: 8, fontWeight: 800, padding: "1px 4px",
                  borderRadius: 4, letterSpacing: "0.04em",
                  background: "rgba(59,130,246,0.2)", color: "#93c5fd",
                  border: "1px solid rgba(59,130,246,0.25)", textTransform: "uppercase",
                }}>
                  SaaS
                </span>
              </div>
            </div>
          )}
          <button onClick={() => setSideOpen(false)} className="lg:hidden p-1 rounded-lg" style={{ color: A.textMid, background: "none", border: "none", cursor: "pointer" }}>
            <X size={15} />
          </button>
          <button onClick={() => setCollapsed(c => !c)} className="hidden lg:flex p-1.5 rounded-lg" style={{ color: A.textDim, marginLeft: "auto", flexShrink: 0, background: "none", border: "none", cursor: "pointer" }}>
            <ChevronRight size={13} style={{ transform: collapsed ? "" : "rotate(180deg)", transition: "transform 0.2s" }} />
          </button>
        </div>

        {/* Badge Super Admin */}
        {superAdmin && !collapsed && (
          <div style={{ margin: "8px 8px 0", padding: "6px 10px", background: "rgba(245,158,11,0.12)", borderRadius: 10, border: "1px solid rgba(245,158,11,0.25)", display: "flex", alignItems: "center", gap: 6 }}>
            <Crown size={11} style={{ color: A.gold, flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: A.gold, letterSpacing: "0.06em", textTransform: "uppercase" }}>Super Administrateur</span>
          </div>
        )}

        {/* ── Bannière Agent IA (nouveau) ── */}
        {!collapsed && (
          <div style={{
            margin: "8px 8px 0",
            padding: "8px 10px",
            background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(59,130,246,0.08))",
            borderRadius: 10,
            border: "1px solid rgba(59,130,246,0.2)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Sparkles size={12} style={{ color: "#fff" }} />
            </div>
            <div>
              <p style={{ fontSize: 10.5, fontWeight: 700, color: "#93c5fd", lineHeight: 1 }}>Agent IA actif</p>
              <p style={{ fontSize: 9, color: "rgba(147,197,253,0.6)", marginTop: 2 }}>Cliquez sur ✨ pour interagir</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "12px 8px", display: "flex", flexDirection: "column", gap: 16 }}>
          {visibleGroups.map(group => (
            <div key={group.label}>
              {!collapsed && <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: A.textDim, padding: "0 12px", marginBottom: 4, textTransform: "uppercase" }}>{group.label}</p>}
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {group.items.map(item => {
                  const active = isActive(item.href);
                  if (collapsed) return (
                    <Link key={item.href} href={item.href} onClick={() => setSideOpen(false)} title={item.label}
                      style={{ width: 48, height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, margin: "0 auto",
                        background: active
                          ? item.isAI ? "linear-gradient(135deg,#1d4ed8,#3b82f6)" : `linear-gradient(135deg,${A.accent},${A.accentLt})`
                          : "transparent",
                        color: active ? "#fff" : A.textMid, transition: "all 0.15s" }}>
                      <item.icon size={16} />
                    </Link>
                  );
                  return <NavItemComp key={item.href} href={item.href} icon={item.icon} label={item.label} active={active} onClick={() => setSideOpen(false)} superOnly={(item as any).superOnly} isAI={(item as any).isAI} />;
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div style={{ padding: "10px 8px", borderTop: `1px solid ${A.line}`, flexShrink: 0 }}>
          <Link href="/" target="_blank"
            style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "8px 0" : "8px 12px", borderRadius: 10, textDecoration: "none", color: A.textMid, justifyContent: collapsed ? "center" : "flex-start", transition: "background 0.15s", marginBottom: 4 }}
            className="hover:bg-white/5">
            <Globe size={14} style={{ flexShrink: 0, color: A.accent }} />
            {!collapsed && <><span style={{ fontSize: 12, fontWeight: 500 }}>Voir le site public</span><ExternalLink size={10} style={{ marginLeft: "auto", opacity: 0.4 }} /></>}
          </Link>

          {admin && !collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)", marginBottom: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: superAdmin ? `linear-gradient(135deg,#d97706,${A.gold})` : `linear-gradient(135deg,${A.accent},${A.accentXl})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>
                {admin.nom[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "#fff", fontSize: 12.5, fontWeight: 600, lineHeight: 1, marginBottom: 3 }} className="truncate">{admin.nom}</p>
                <p style={{ fontSize: 10, fontWeight: 600, color: superAdmin ? A.gold : A.accentXl }}>
                  {superAdmin ? "Super Admin" : admin.role?.nom ?? "Admin"}
                </p>
              </div>
            </div>
          )}

          <button onClick={handleLogout}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "8px 0" : "8px 12px", borderRadius: 10, background: "transparent", border: "none", cursor: "pointer", color: A.textDim, justifyContent: collapsed ? "center" : "flex-start", transition: "all 0.15s" }}
            className="hover:bg-red-900/20 hover:!text-red-400">
            <LogOut size={14} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontSize: 12, fontWeight: 500 }}>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sideOpen && <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setSideOpen(false)} />}

      {/* ══ MAIN ══ */}
      <div className="flex-1 flex flex-col min-h-screen">
        <style>{`@media(min-width:1024px){.admin-main{margin-left:${sideW}px}}`}</style>
        <div className="admin-main flex flex-col min-h-screen">

          {/* Topbar */}
          <header className="sticky top-0 z-30 flex items-center justify-between px-5 lg:px-7 admin-themed"
            style={{
              height: 56,
              background: "var(--admin-header)",
              borderBottom: "1px solid var(--admin-border)",
              boxShadow: "var(--admin-shadow)",
            }}>

            <div className="flex items-center gap-3">
              <button onClick={() => setSideOpen(true)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--admin-text2)" }}>
                <Menu size={17} />
              </button>
              <div className="flex items-center gap-2">
                <Link href="/admin/dashboard" style={{ color: "var(--admin-text3)", fontSize: 12, textDecoration: "none" }}>Admin</Link>
                <ChevronRight size={12} style={{ color: "var(--admin-text3)" }} />
                <span style={{ fontWeight: 700, color: "var(--admin-text)", fontSize: 14 }}>{pageLabel(pathname)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* ── GLOBAL SEARCH (nouveau) ─────────────────────────────────── */}
              <div className="hidden sm:block">
                <GlobalCommandPalette />
              </div>

              {/* Voir le site */}
              <Link href="/" target="_blank"
                className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all border"
                style={{ color: A.accent, borderColor: isDark ? "rgba(46,125,79,0.3)" : "#c9e0d3", background: isDark ? "rgba(46,125,79,0.1)" : "#f0faf4", textDecoration: "none" }}>
                <Globe size={12} />
                Site public
                <ExternalLink size={10} style={{ opacity: 0.5 }} />
              </Link>

              {/* Bouton thème */}
              <button
                onClick={toggle}
                title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
                style={{
                  background: "var(--admin-card-alt)",
                  border: "1px solid var(--admin-border)",
                  color: "var(--admin-text2)",
                  cursor: "pointer",
                }}>
                {isDark
                  ? <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                  : <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                }
              </button>

              {/* Notifications */}
              <NotificationsDropdown isDark={isDark} />

              <span style={{ width: 1, height: 24, background: "var(--admin-border)", margin: "0 4px", display: "inline-block" }} />

              {/* Compte admin */}
              {admin && (
                <EspaceCompte
                  admin={admin}
                  isDark={isDark}
                  onToggle={toggle}
                  onLogout={handleLogout}
                />
              )}
            </div>
          </header>

          {/* Contenu */}
          <main className="flex-1 p-4 lg:p-7 admin-themed" style={{ maxWidth: 1440, width: "100%", margin: "0 auto" }}>
            {children}
          </main>

          {/* Footer */}
          <footer className="px-7 py-3 flex items-center justify-between admin-themed"
            style={{ borderTop: "1px solid var(--admin-border)", background: "var(--admin-header)" }}>
            <p style={{ fontSize: 11, color: "var(--admin-text3)" }}>EspaceVert Admin — v3.0 SaaS</p>
            <div className="flex items-center gap-4">
              {/* Indicateur Agent IA */}
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                <span style={{ fontSize: 10, color: "var(--admin-text3)", fontWeight: 500 }}>Agent IA actif</span>
              </div>
              <Link href="/" target="_blank" style={{ fontSize: 11, color: "var(--admin-text3)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                <Globe size={10} /> espace-vert.com.tn
              </Link>
              <span style={{ fontSize: 11, color: A.accent }}>© {new Date().getFullYear()}</span>
            </div>
          </footer>
        </div>
      </div>
<AdminAIWidget />

      <ToastContainer />
    </div>
  );
}
