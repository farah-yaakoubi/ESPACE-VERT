"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, Calendar, MessageSquare,
  Package, Newspaper, LogOut, Menu, X, Leaf, Users,
  Shield, ExternalLink, Tag, Layers, Activity, HelpCircle,
  Bell, Eye, ChevronDown,
} from "lucide-react";
import { tokenStore, adminAuth, isSuperAdmin, type Admin } from "@/lib/admin-api";

const NAV_GROUPS = [
  {
    label: "MENU PRINCIPAL",
    items: [
      { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "CATALOGUE",
    items: [
      { href: "/admin/marques",    icon: Tag,         label: "Marques"    },
      { href: "/admin/activites",  icon: Activity,    label: "Activités"  },
      { href: "/admin/categories", icon: Layers,      label: "Catégories" },
      { href: "/admin/produits",   icon: Package,     label: "Produits"   },
    ],
  },
  {
    label: "CONTENU",
    items: [
      { href: "/admin/actualites", icon: Newspaper,   label: "Actualités" },
      { href: "/admin/faq",        icon: HelpCircle,  label: "FAQ"        },
    ],
  },
  {
    label: "CRM",
    items: [
      { href: "/admin/devis",   icon: FileText,      label: "Devis"    },
      { href: "/admin/rdv",     icon: Calendar,      label: "RDV"      },
      { href: "/admin/contact", icon: MessageSquare, label: "Messages" },
    ],
  },
  {
    label: "SYSTÈME",
    items: [
      { href: "/admin/visiteurs", icon: Eye,    label: "Visiteurs", superOnly: false },
      { href: "/admin/audit",     icon: Shield, label: "Audit",     superOnly: true  },
      { href: "/admin/admins",    icon: Users,  label: "Admins",    superOnly: true  },
    ],
  },
];

/* page label from pathname */
function pageLabel(pathname: string) {
  const seg = pathname.split("/").filter(Boolean).pop() ?? "dashboard";
  const map: Record<string, string> = {
    dashboard:"Dashboard",marques:"Marques",activites:"Activités",categories:"Catégories",
    produits:"Produits",actualites:"Actualités",faq:"FAQ",devis:"Devis",rdv:"Rendez-vous",
    contact:"Messages",visiteurs:"Visiteurs",audit:"Audit",admins:"Administrateurs",
  };
  return map[seg] ?? seg.replace(/-/g," ");
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [admin,     setAdmin]    = useState<Admin | null>(() => tokenStore.getAdmin());
  const [sideOpen,  setSideOpen] = useState(false);
  const [authReady, setAuthReady]= useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-[#EEF2FF] border-t-[#3C50E0] animate-spin" style={{ borderWidth: 3 }} />
        <p className="text-sm text-gray-400">Chargement…</p>
      </div>
    </div>
  );

  const superAdmin = isSuperAdmin(admin);
  const handleLogout = async () => {
    try { await adminAuth.logout(tokenStore.getRefresh()); } catch {}
    tokenStore.clear(); router.push("/admin/login");
  };
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen flex bg-[#F1F5F9]">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col transition-transform duration-300
          ${sideOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        style={{ background: "#1C2434", boxShadow: "4px 0 20px rgba(0,0,0,0.15)" }}>

        {/* Logo */}
        <div className="h-[70px] flex items-center gap-3 px-6 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,#3C50E0,#7B8FF0)" }}>
            <Leaf size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-[15px] leading-none" style={{ letterSpacing: "-0.02em" }}>EspaceVert</p>
            <p className="text-[11px] mt-1 font-medium" style={{ color: "#3C50E0" }}>Administration</p>
          </div>
          <button onClick={() => setSideOpen(false)} className="lg:hidden ml-auto text-gray-500 hover:text-white p-1 rounded">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-5">
          {NAV_GROUPS.map(group => {
            const visibleItems = group.items.filter((item: any) => !item.superOnly || superAdmin);
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.label}>
                <p className="px-3 mb-2 text-[10px] font-semibold tracking-[0.12em]"
                  style={{ color: "rgba(255,255,255,0.2)" }}>{group.label}</p>
                <div className="space-y-0.5">
                  {visibleItems.map((item: any) => {
                    const Icon   = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setSideOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-150"
                        style={{
                          color:      active ? "#fff"                         : "rgba(255,255,255,0.5)",
                          background: active ? "linear-gradient(90deg,#3C50E0,#4F60E8)" : "transparent",
                          boxShadow:  active ? "0 4px 10px rgba(60,80,224,0.3)" : "none",
                        }}>
                        <Icon size={16} />
                        <span className="flex-1">{item.label}</span>
                        {(item as any).superOnly && <Shield size={9} style={{ opacity: 0.4 }} />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom user card */}
        <div className="p-4 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {admin && (
            <div className="flex items-center gap-3 p-3 rounded-xl mb-2"
              style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold"
                style={{ background: "linear-gradient(135deg,#3C50E0,#7B8FF0)" }}>
                {admin.nom[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-[13px] font-semibold truncate leading-none">{admin.nom}</p>
                <span className="text-[11px] font-medium mt-0.5 block" style={{ color: superAdmin ? "#F59E0B" : "#3C50E0" }}>
                  {superAdmin ? "Super Admin" : admin.role?.nom ?? "Admin"}
                </span>
              </div>
              <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
            </div>
          )}
          <Link href="/" target="_blank"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] transition-all mb-0.5 hover:bg-white/5"
            style={{ color: "rgba(255,255,255,0.35)" }}>
            <ExternalLink size={13} /> Voir le site public
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] transition-all text-left hover:bg-red-900/20 hover:text-red-400"
            style={{ color: "rgba(255,255,255,0.35)" }}>
            <LogOut size={13} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sideOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSideOpen(false)} />
      )}

      {/* ── MAIN ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen">

        {/* Topbar */}
        <header className="h-[70px] bg-white flex items-center justify-between px-5 lg:px-7 sticky top-0 z-30"
          style={{ borderBottom: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSideOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
              <Menu size={18} />
            </button>
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-gray-400">Admin</span>
              <span className="text-gray-300">/</span>
              <span className="font-semibold text-gray-700">{pageLabel(pathname)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <Link href="/admin/contact"
              className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
              <Bell size={17} />
            </Link>

            {/* Site link */}
            <Link href="/" target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#3C50E0] px-3 py-1.5 rounded-lg hover:bg-[#EEF2FF] transition-colors border border-transparent hover:border-[#C7D2FE]">
              <ExternalLink size={12} /> Site public
            </Link>

            {/* User */}
            {admin && (
              <div className="flex items-center gap-2.5 pl-3 ml-1" style={{ borderLeft: "1px solid #E2E8F0" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: "linear-gradient(135deg,#3C50E0,#7B8FF0)" }}>
                  {admin.nom[0]?.toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-700 leading-none">{admin.nom}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: superAdmin ? "#F59E0B" : "#3C50E0" }}>
                    {superAdmin ? "Super Admin" : admin.role?.nom ?? "Admin"}
                  </p>
                </div>
                <ChevronDown size={13} className="text-gray-400 hidden sm:block" />
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 lg:p-8 max-w-[1400px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
