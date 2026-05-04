"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, Calendar, MessageSquare,
  Package, Newspaper, LogOut, Menu, X, Leaf, Users,
  Shield, ExternalLink, Tag, Layers, Activity, HelpCircle,
  Bell, Eye, ChevronDown, ChevronRight, BarChart3, Settings,
  Globe, ImageIcon, Inbox, Bot,
} from "lucide-react";
import { tokenStore, adminAuth, isSuperAdmin, type Admin } from "@/lib/admin-api";
import { ToastContainer } from "@/components/admin/Toast";

/* ── Palette admin EspaceVert ──────────────────────────────────── */
const A = {
  bg:       "#0f1a14",    // fond sidebar très sombre
  bg2:      "#162117",    // hover items
  bg3:      "#1e2d22",    // sections
  accent:   "#2e7d4f",    // vert principal EV
  accentLt: "#3a9e63",    // vert clair
  accentXl: "#4fbb7a",    // vert vif hover
  gold:     "#f59e0b",    // super admin
  line:     "rgba(255,255,255,0.06)",
  text:     "rgba(255,255,255,0.85)",
  textMid:  "rgba(255,255,255,0.45)",
  textDim:  "rgba(255,255,255,0.22)",
  danger:   "#ef4444",
};

/* ── Structure de navigation ──────────────────────────────────── */
const NAV_GROUPS = [
  {
    label: "VUE D'ENSEMBLE",
    items: [
      { href:"/admin/dashboard", icon:LayoutDashboard, label:"Dashboard",   badge:null },
      { href:"/admin/analytics", icon:BarChart3,       label:"Analytiques", badge:null },
      { href: "/admin/chatbot", icon: Bot, label: "Assistant IA", badge: null }
    ],
  },
  {
    label: "CATALOGUE",
    items: [
      { href:"/admin/marques",    icon:Tag,      label:"Marques",    badge:null },
      { href:"/admin/activites",  icon:Activity, label:"Activités",  badge:null },
      { href:"/admin/categories", icon:Layers,   label:"Catégories", badge:null },
      { href:"/admin/produits",   icon:Package,  label:"Produits",   badge:null },
      { href:"/admin/catalogue",  icon:ImageIcon,label:"Médias",     badge:null },
    ],
  },
  {
    label: "CONTENU",
    items: [
      { href:"/admin/actualites", icon:Newspaper,     label:"Actualités", badge:null },
      { href:"/admin/faq",        icon:HelpCircle,    label:"FAQ",        badge:null },
    ],
  },
  {
    label: "CRM & CONTACTS",
    items: [
      { href:"/admin/devis",   icon:FileText,      label:"Devis",    badge:"crm" },
      { href:"/admin/rdv",     icon:Calendar,      label:"RDV",      badge:"crm" },
      { href:"/admin/contact", icon:MessageSquare, label:"Messages", badge:"crm" },
    ],
  },
  {
    label: "SYSTÈME",
    items: [
      { href:"/admin/visiteurs", icon:Eye,     label:"Visiteurs",      superOnly:false },
      { href:"/admin/admins",    icon:Users,   label:"Administrateurs", superOnly:true  },
      { href:"/admin/audit",     icon:Shield,  label:"Journal d'audit", superOnly:true  },
    ],
  },
];

function pageLabel(pathname:string) {
  const seg = pathname.split("/").filter(Boolean).pop() ?? "dashboard";
  const map:Record<string,string> = {
    dashboard:"Dashboard", marques:"Marques", activites:"Activités", categories:"Catégories",
    produits:"Produits", catalogue:"Médias", actualites:"Actualités", faq:"FAQ",
    devis:"Devis", rdv:"Rendez-vous", contact:"Messages", visiteurs:"Visiteurs",
    audit:"Journal d'audit", admins:"Administrateurs", analytics:"Analytiques",
  };
  return map[seg] ?? seg.replace(/-/g," ");
}

/* ── Icône feuille SVG ─────────────────────────────────────────── */
function LeafMark({ size=18 }:{ size?:number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M20 5c0 0-8 0-13 5C4 13 4 19 4 19s6 0 9-3c5-5 5-11 7-11z"/>
      <path d="M4 19l7-7"/>
    </svg>
  );
}

/* ── NavItem ──────────────────────────────────────────────────── */
function NavItem({ href, icon:Icon, label, active, onClick, superOnly }: {
  href:string; icon:any; label:string; active:boolean; onClick:()=>void; superOnly?:boolean
}) {
  return (
    <Link href={href} onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 group relative"
      style={{
        color:      active ? "#fff" : A.textMid,
        background: active ? `linear-gradient(90deg,${A.accent},${A.accentLt})` : "transparent",
        boxShadow:  active ? `0 3px 12px rgba(46,125,79,0.35)` : "none",
      }}>
      {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full" style={{ background:"#fff", opacity:0.5, left:"-1px" }}/>}
      <Icon size={15} style={{ flexShrink:0, opacity: active ? 1 : 0.7 }}/>
      <span className="flex-1 leading-none">{label}</span>
      {superOnly && <Shield size={8} style={{ opacity:0.3 }}/>}
    </Link>
  );
}

/* ── Layout principal ─────────────────────────────────────────── */
export default function AdminLayout({ children }:{ children:React.ReactNode }) {
  const pathname   = usePathname();
  const router     = useRouter();
  const [admin,      setAdmin]      = useState<Admin|null>(() => tokenStore.getAdmin());
  const [sideOpen,   setSideOpen]   = useState(false);
  const [authReady,  setAuthReady]  = useState(false);
  const [collapsed,  setCollapsed]  = useState(false);
  const [notifCount, setNotifCount] = useState(0);

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
    <div className="min-h-screen flex items-center justify-center" style={{ background:"#0f1a14" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background:`linear-gradient(135deg,${A.accent},${A.accentLt})` }}>
          <LeafMark size={22}/>
        </div>
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background:A.accent, animationDelay:`${i*0.15}s` }}/>
          ))}
        </div>
      </div>
    </div>
  );

  const superAdmin = isSuperAdmin(admin);
  const handleLogout = async () => {
    try { await adminAuth.logout(tokenStore.getRefresh()); } catch {}
    tokenStore.clear(); router.push("/admin/login");
  };
  const isActive = (href:string) => pathname === href || pathname.startsWith(href+"/");
  const sideW = collapsed ? 64 : 240;

  return (
    <div className="min-h-screen flex" style={{ background:"#f0f4f1" }}>

      {/* ══ SIDEBAR ═══════════════════════════════════════════════ */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ${sideOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        style={{ width:sideW, background:A.bg, boxShadow:"4px 0 24px rgba(0,0,0,0.3)", transition:"width 0.25s, transform 0.3s" }}>

        {/* Marque */}
        <div style={{ height:64, display:"flex", alignItems:"center", padding:"0 16px", borderBottom:`1px solid ${A.line}`, flexShrink:0, gap:10, overflow:"hidden" }}>
          <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${A.accent},${A.accentXl})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:`0 4px 12px rgba(46,125,79,0.4)` }}>
            <LeafMark size={17}/>
          </div>
          {!collapsed && (
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color:"#fff", fontWeight:800, fontSize:15, letterSpacing:"-0.025em", lineHeight:1 }}>EspaceVert</p>
              <p style={{ color:A.accent, fontWeight:600, fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase", marginTop:3 }}>Administration</p>
            </div>
          )}
          <button onClick={() => setSideOpen(false)} className="lg:hidden p-1 rounded-lg" style={{ color:A.textMid }} title="Fermer">
            <X size={15}/>
          </button>
          {/* Collapse toggle desktop */}
          <button onClick={() => setCollapsed(c => !c)} className="hidden lg:flex p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color:A.textDim, marginLeft:"auto", flexShrink:0 }} title={collapsed?"Déplier":"Réduire"}>
            <ChevronRight size={13} style={{ transform:collapsed?"":"rotate(180deg)", transition:"transform 0.2s" }}/>
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, overflowY:"auto", overflowX:"hidden", padding:"12px 8px", display:"flex", flexDirection:"column", gap:16 }}>
          {NAV_GROUPS.map(group => {
            const visible = group.items.filter((it:any) => !it.superOnly || superAdmin);
            if (!visible.length) return null;
            return (
              <div key={group.label}>
                {!collapsed && (
                  <p style={{ fontSize:9, fontWeight:700, letterSpacing:"0.14em", color:A.textDim, padding:"0 12px", marginBottom:4, textTransform:"uppercase" }}>{group.label}</p>
                )}
                <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
                  {visible.map((item:any) => {
                    const active = isActive(item.href);
                    if (collapsed) {
                      return (
                        <Link key={item.href} href={item.href} onClick={() => setSideOpen(false)}
                          title={item.label}
                          style={{ width:48, height:40, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:10, margin:"0 auto", background:active?`linear-gradient(135deg,${A.accent},${A.accentLt})`:"transparent", color:active?"#fff":A.textMid, transition:"all 0.15s" }}
                          className="hover:bg-white/5">
                          <item.icon size={16}/>
                        </Link>
                      );
                    }
                    return <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} active={active} onClick={() => setSideOpen(false)} superOnly={item.superOnly}/>;
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer sidebar */}
        <div style={{ padding:"10px 8px", borderTop:`1px solid ${A.line}`, flexShrink:0 }}>
          {/* Lien site public */}
          <Link href="/" target="_blank" title="Voir le site public"
            style={{ display:"flex", alignItems:"center", gap:10, padding:collapsed?"8px 0":"8px 12px", borderRadius:10, textDecoration:"none", color:A.textMid, justifyContent:collapsed?"center":"flex-start", transition:"background 0.15s", marginBottom:4 }}
            className="hover:bg-white/5 group">
            <Globe size={14} style={{ flexShrink:0, color:A.accent }}/>
            {!collapsed && <span style={{ fontSize:12, fontWeight:500 }}>Voir le site public</span>}
            {!collapsed && <ExternalLink size={10} style={{ marginLeft:"auto", opacity:0.4 }}/>}
          </Link>

          {/* User info */}
          {admin && !collapsed && (
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:10, background:"rgba(255,255,255,0.04)", marginBottom:4 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg,${A.accent},${A.accentXl})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:13, fontWeight:700, color:"#fff" }}>
                {admin.nom[0]?.toUpperCase()}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ color:"#fff", fontSize:12.5, fontWeight:600, letterSpacing:"-0.01em", lineHeight:1, marginBottom:3 }} className="truncate">{admin.nom}</p>
                <p style={{ fontSize:10, fontWeight:600, color: superAdmin ? A.gold : A.accentXl }}>
                  {superAdmin ? "Super Admin" : admin.role?.nom ?? "Admin"}
                </p>
              </div>
            </div>
          )}

          {/* Déconnexion */}
          <button onClick={handleLogout} title="Déconnexion"
            style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:collapsed?"8px 0":"8px 12px", borderRadius:10, background:"transparent", border:"none", cursor:"pointer", color:A.textDim, justifyContent:collapsed?"center":"flex-start", transition:"all 0.15s" }}
            className="hover:bg-red-900/20 hover:!text-red-400">
            <LogOut size={14} style={{ flexShrink:0 }}/>
            {!collapsed && <span style={{ fontSize:12, fontWeight:500 }}>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sideOpen && <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setSideOpen(false)}/>}

      {/* ══ MAIN ════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft:0, transition:"margin-left 0.25s" }}
        // Appliquer margin sur LG via style inline car sideW est dynamique
      >
        <style>{`@media(min-width:1024px){.admin-main{margin-left:${sideW}px}}`}</style>
        <div className="admin-main flex flex-col min-h-screen">

          {/* ── Topbar ─────────────────────────────────────────── */}
          <header className="sticky top-0 z-30 bg-white flex items-center justify-between px-5 lg:px-7"
            style={{ height:56, borderBottom:"1px solid #e5ede8", boxShadow:"0 1px 6px rgba(0,0,0,0.04)" }}>

            <div className="flex items-center gap-3">
              {/* Burger mobile */}
              <button onClick={() => setSideOpen(true)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
                <Menu size={17}/>
              </button>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm">
                <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600 text-xs">Admin</Link>
                <ChevronRight size={12} className="text-gray-300"/>
                <span className="font-semibold text-gray-800 text-sm">{pageLabel(pathname)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Voir le site */}
              <Link href="/" target="_blank"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all border"
                style={{ color:A.accent, borderColor:"#c9e0d3", background:"#f0faf4" }}
                onMouseEnter={e => { (e.currentTarget as any).style.background="#dff2e8"; }}
                onMouseLeave={e => { (e.currentTarget as any).style.background="#f0faf4"; }}>
                <Globe size={12}/>
                Site public
                <ExternalLink size={10} style={{ opacity:0.5 }}/>
              </Link>

              {/* Notifications */}
              <Link href="/admin/contact"
                className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
                <Bell size={16}/>
                {notifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background:A.accent }}/>
                )}
              </Link>

              {/* Divider */}
              <span className="w-px h-6 bg-gray-200 mx-1"/>

              {/* Avatar + nom */}
              {admin && (
                <div className="flex items-center gap-2.5 pl-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background:`linear-gradient(135deg,${A.accent},${A.accentXl})` }}>
                    {admin.nom[0]?.toUpperCase()}
                  </div>
                  <div className="hidden sm:block leading-none">
                    <p className="text-xs font-semibold text-gray-800">{admin.nom}</p>
                    <p className="text-[10px] font-medium mt-0.5" style={{ color: superAdmin ? A.gold : A.accent }}>
                      {superAdmin ? "Super Admin" : admin.role?.nom ?? "Admin"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* ── Contenu ───────────────────────────────────────── */}
          <main className="flex-1 p-4 lg:p-7" style={{ maxWidth:1440, width:"100%", margin:"0 auto" }}>
            {children}
          </main>

          {/* ── Footer admin ─────────────────────────────────── */}
          <footer className="px-7 py-3 flex items-center justify-between" style={{ borderTop:"1px solid #e5ede8", background:"#fff" }}>
            <p className="text-[11px] text-gray-400">EspaceVert Admin — v2.0</p>
            <div className="flex items-center gap-4">
              <Link href="/" target="_blank" className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-1">
                <Globe size={10}/> espace-vert.com.tn
              </Link>
              <span className="text-[11px]" style={{ color:A.accent }}>© {new Date().getFullYear()}</span>
            </div>
          </footer>
        </div>
      </div>

      <ToastContainer/>
    </div>
  );
}
