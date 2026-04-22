"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, Calendar, MessageSquare,
  Package, Newspaper, LogOut, Menu, ChevronRight,
  Leaf, User, Users, Shield, ExternalLink, BarChart2,
  Tag, Layers, HelpCircle, ChevronDown
} from "lucide-react";
import { tokenStore, adminAuth, isSuperAdmin, type Admin } from "@/lib/admin-api";

type NavItem = {
  href: string;
  icon: React.ElementType;
  label: string;
  superAdminOnly?: boolean;
  children?: { href: string; label: string }[];
};

const NAV: NavItem[] = [
  { href: "/admin/dashboard",  icon: LayoutDashboard, label: "Tableau de bord" },
  {
    href: "/admin/catalogue",
    icon: Package,
    label: "Catalogue",
    children: [
      { href: "/admin/marques",    label: "Marques" },
      { href: "/admin/activites",  label: "Activités" },
      { href: "/admin/categories", label: "Catégories" },
      { href: "/admin/produits",   label: "Produits" },
    ],
  },
  { href: "/admin/actualites", icon: Newspaper,        label: "Actualités" },
  { href: "/admin/faq",        icon: HelpCircle,       label: "FAQ" },
  { href: "/admin/devis",      icon: FileText,         label: "Devis" },
  { href: "/admin/rdv",        icon: Calendar,         label: "Rendez-vous" },
  { href: "/admin/contact",    icon: MessageSquare,    label: "Messages" },
  { href: "/admin/visiteurs",   icon: BarChart2, label: "Visiteurs & Stats",  superAdminOnly: true },
  { href: "/admin/admins",     icon: Users,     label: "Administrateurs",    superAdminOnly: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [admin,   setAdmin]   = useState<Admin | null>(() => tokenStore.getAdmin());
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(true);
  const [openSub, setOpenSub] = useState<string | null>("/admin/catalogue");

  useEffect(() => {
    if (pathname === "/admin/login") { setLoading(false); return; }
    const token = tokenStore.get();
    if (!token) { router.replace("/admin/login"); return; }
    adminAuth.me()
      .then((a) => { setAdmin(a); tokenStore.setAdmin(a); })
      .catch(() => { tokenStore.clear(); router.replace("/admin/login"); })
      .finally(() => setLoading(false));
  }, [pathname, router]);

  // Auto-expand submenu if current path is inside it
  useEffect(() => {
    NAV.forEach(n => {
      if (n.children?.some(c => pathname.startsWith(c.href))) {
        setOpenSub(n.href);
      }
    });
  }, [pathname]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (loading && !admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-ev-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = async () => {
    try { await adminAuth.logout(tokenStore.getRefresh()); } catch {}
    tokenStore.clear();
    router.push("/admin/login");
  };

  const superAdmin  = isSuperAdmin(admin);
  const visibleNav  = NAV.filter(n => !n.superAdminOnly || superAdmin);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-ev-950 flex flex-col transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>

        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-ev-600 flex items-center justify-center shrink-0">
            <Leaf size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Espace Vert</p>
            <p className="text-ev-400 text-xs mt-0.5">Administration</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {visibleNav.map((item) => {
            const Icon    = item.icon;
            const hasKids = !!item.children;
            const isOpen  = openSub === item.href;
            const active  = !hasKids && pathname.startsWith(item.href);
            const parentActive = hasKids && item.children!.some(c => pathname.startsWith(c.href));

            if (hasKids) {
              return (
                <div key={item.href}>
                  <button
                    onClick={() => setOpenSub(isOpen ? null : item.href)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${parentActive ? "bg-ev-800 text-white" : "text-ev-300 hover:bg-white/10 hover:text-white"}`}
                  >
                    <Icon size={18} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                      {item.children!.map(child => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all
                            ${pathname.startsWith(child.href) ? "bg-ev-700 text-white" : "text-ev-400 hover:bg-white/10 hover:text-white"}`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active ? "bg-ev-700 text-white" : "text-ev-300 hover:bg-white/10 hover:text-white"}`}
              >
                <Icon size={18} />
                <span className="flex-1">{item.label}</span>
                {item.superAdminOnly && <Shield size={11} className="opacity-30" />}
                {active && <ChevronRight size={14} className="opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 shrink-0 space-y-1">
          {admin && (
            <div className="flex items-center gap-3 mb-2 px-2 py-1">
              <div className="w-8 h-8 rounded-full bg-ev-700 flex items-center justify-center shrink-0">
                <User size={16} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-medium truncate">{admin.nom}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium
                  ${superAdmin ? "bg-yellow-500/20 text-yellow-300" : "bg-ev-600/30 text-ev-300"}`}>
                  {superAdmin ? "Super Admin" : admin.role?.nom ?? "Admin"}
                </span>
              </div>
            </div>
          )}
          <Link href="/" target="_blank"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-ev-400 hover:text-white text-xs transition-all hover:bg-white/5">
            <ExternalLink size={14} />Voir le site
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-ev-300 hover:bg-white/10 hover:text-white text-sm transition-all">
            <LogOut size={16} />Déconnexion
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <button onClick={() => setOpen(true)} className="lg:hidden p-2 text-gray-500 rounded-lg hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <p className="hidden lg:block text-sm text-gray-400">Groupe Espace Vert — Back-office</p>
          <div className="flex items-center gap-3">
            {admin && (
              <span className="text-sm text-gray-500 hidden sm:flex items-center gap-2">
                {admin.nom}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${superAdmin ? "bg-yellow-100 text-yellow-700" : "bg-ev-50 text-ev-700"}`}>
                  {superAdmin ? "Super Admin" : "Admin"}
                </span>
              </span>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
