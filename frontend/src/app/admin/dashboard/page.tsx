"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { adminStats, type DashboardStats } from "@/lib/admin-api";
import {
  Package, Tag, Layers, Activity, Newspaper, HelpCircle,
  FileText, Calendar, MessageSquare, TrendingUp,
  ArrowRight, Clock, AlertCircle, CheckCircle2, XCircle,
} from "lucide-react";

const STATUT_DEVIS: Record<string, { label: string; cls: string }> = {
  nouveau:  { label: "Nouveau",   cls: "bg-blue-50 text-blue-700 border-blue-100" },
  en_cours: { label: "En cours",  cls: "bg-amber-50 text-amber-700 border-amber-100" },
  traite:   { label: "Traité",    cls: "bg-green-50 text-green-700 border-green-100" },
  rejete:   { label: "Rejeté",    cls: "bg-red-50 text-red-700 border-red-100" },
};
const STATUT_RDV: Record<string, { label: string; cls: string }> = {
  nouveau:  { label: "Nouveau",    cls: "bg-blue-50 text-blue-700 border-blue-100" },
  confirme: { label: "Confirmé",   cls: "bg-green-50 text-green-700 border-green-100" },
  termine:  { label: "Terminé",    cls: "bg-gray-50 text-gray-600 border-gray-100" },
  annule:   { label: "Annulé",     cls: "bg-red-50 text-red-700 border-red-100" },
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "2-digit" });
}
function StatBadge({ label, val, max }: { label: string; val: number; max: number }) {
  const pct = max > 0 ? Math.round((val / max) * 100) : 0;
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-600 capitalize">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-ev-500" style={{ width: `${pct}%`, transition: "width 0.6s ease" }} />
        </div>
        <span className="text-sm font-bold text-gray-800 w-8 text-right">{val}</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    adminStats.dashboard()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-9 h-9 rounded-full animate-spin" style={{ border: "3px solid #dcfce7", borderTopColor: "#16a34a" }} />
    </div>
  );
  if (error) return (
    <div className="rounded-2xl bg-red-50 border border-red-200 p-8 text-center text-red-600 text-sm">{error}</div>
  );
  if (!stats) return null;

  const catalogueItems = [
    { label: "Produits",    val: stats.catalogue.produits,   icon: Package,   href: "/admin/produits",   color: "text-ev-700",     bg: "bg-ev-50" },
    { label: "Marques",     val: stats.catalogue.marques,    icon: Tag,       href: "/admin/marques",    color: "text-purple-700", bg: "bg-purple-50" },
    { label: "Catégories",  val: stats.catalogue.categories, icon: Layers,    href: "/admin/categories", color: "text-orange-700", bg: "bg-orange-50" },
    { label: "Activités",   val: stats.catalogue.activites,  icon: Activity,  href: "/admin/activites",  color: "text-sky-700",    bg: "bg-sky-50" },
    { label: "Actualités",  val: stats.catalogue.actualites, icon: Newspaper, href: "/admin/actualites", color: "text-pink-700",   bg: "bg-pink-50" },
    { label: "FAQs",        val: stats.catalogue.faqs,       icon: HelpCircle,href: "/admin/faq",        color: "text-teal-700",   bg: "bg-teal-50" },
  ];

  const devisTotal  = stats.devis.total;
  const rdvTotal    = stats.rdv.total;
  const devisNew    = stats.devis.par_statut.nouveau  ?? 0;
  const rdvNew      = stats.rdv.par_statut.nouveau    ?? 0;
  const msgNonLus   = stats.messages.non_lus;

  return (
    <div className="space-y-7">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-display, Syne)" }}>
            Tableau de bord
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {new Date().toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
          </p>
        </div>
        <Link href="/admin/devis?statut=nouveau"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-ev-50 text-ev-700 hover:bg-ev-100 transition-colors border border-ev-100">
          <TrendingUp size={16} />
          {devisNew > 0 ? `${devisNew} nouveau${devisNew > 1 ? "x" : ""} devis` : "Voir les devis"}
        </Link>
      </div>

      {/* KPI CRM */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Devis reçus",    val: devisTotal, new_: devisNew,  icon: FileText,      href: "/admin/devis",   color: "#2563eb", bg: "#eff6ff", unit: "demandes" },
          { label: "Rendez-vous",    val: rdvTotal,   new_: rdvNew,    icon: Calendar,      href: "/admin/rdv",     color: "#16a34a", bg: "#f0fdf4", unit: "planifiés" },
          { label: "Msgs non lus",   val: msgNonLus,  new_: undefined, icon: MessageSquare, href: "/admin/contact", color: "#dc2626", bg: "#fef2f2", unit: "messages" },
        ].map(c => (
          <Link key={c.label} href={c.href}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: c.bg }}>
                <c.icon size={20} style={{ color: c.color }} />
              </div>
              {c.new_ !== undefined && c.new_ > 0 && (
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-50 text-red-600">
                  +{c.new_} nouveau{c.new_ > 1 ? "x" : ""}
                </span>
              )}
            </div>
            <p className="text-3xl font-black text-gray-900" style={{ fontFamily: "var(--font-display, Syne)", color: c.color }}>
              {c.val}
            </p>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              {c.label}
              <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </Link>
        ))}
      </div>

      {/* Catalogue + Statuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Catalogue */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Catalogue</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {catalogueItems.map(({ label, val, icon: Icon, href, color, bg }) => (
              <Link key={label} href={href}
                className="flex flex-col gap-2 p-4 rounded-xl border border-gray-100 hover:border-ev-200 hover:bg-ev-50/30 transition-all group">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg}`}>
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">{val}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Statuts Devis */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Devis par statut</h2>
            <Link href="/admin/devis" className="text-xs text-ev-600 hover:underline font-medium">Voir tout</Link>
          </div>
          <div className="space-y-1 mb-4">
            {Object.entries(stats.devis.par_statut).map(([s, v]) => (
              <StatBadge key={s} label={STATUT_DEVIS[s]?.label ?? s} val={v} max={devisTotal} />
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">RDV par statut</h3>
              <Link href="/admin/rdv" className="text-xs text-ev-600 hover:underline font-medium">Voir tout</Link>
            </div>
            {Object.entries(stats.rdv.par_statut).map(([s, v]) => (
              <StatBadge key={s} label={STATUT_RDV[s]?.label ?? s} val={v} max={rdvTotal} />
            ))}
          </div>
        </div>
      </div>

      {/* Activité récente */}
      {(stats.recents.devis.length > 0 || stats.recents.messages.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Devis récents */}
          {stats.recents.devis.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Derniers devis</h2>
                <Link href="/admin/devis" className="text-xs text-ev-600 hover:underline font-medium">Voir tout</Link>
              </div>
              <div className="space-y-2">
                {stats.recents.devis.slice(0, 5).map(d => {
                  const s = STATUT_DEVIS[d.statut] ?? { label: d.statut, cls: "bg-gray-50 text-gray-600 border-gray-100" };
                  return (
                    <Link key={d.id_devis} href="/admin/devis"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-sm font-bold text-blue-600">
                        {d.nom[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{d.nom}</p>
                        <p className="text-xs text-gray-400">{d.produit?.nom ?? d.email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.cls}`}>{s.label}</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={9}/>{fmt(d.created_at)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Messages récents */}
          {stats.recents.messages.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Derniers messages</h2>
                <Link href="/admin/contact" className="text-xs text-ev-600 hover:underline font-medium">Voir tout</Link>
              </div>
              <div className="space-y-2">
                {stats.recents.messages.slice(0, 5).map(m => (
                  <Link key={m.id_contact} href="/admin/contact"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold
                      ${m.lu ? "bg-gray-100 text-gray-500" : "bg-red-50 text-red-600"}`}>
                      {m.nom[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{m.nom}</p>
                      <p className="text-xs text-gray-400 truncate">{m.sujet ?? "Sans sujet"}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {m.lu
                        ? <CheckCircle2 size={15} className="text-gray-300" />
                        : <span className="w-2 h-2 rounded-full bg-red-500 block" />
                      }
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
