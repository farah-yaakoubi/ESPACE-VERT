"use client";
import { useEffect, useState } from "react";
import { tokenStore } from "@/lib/admin-api";
import {
  Users, Globe, Clock, Search, TrendingUp, Eye, MapPin,
} from "lucide-react";

interface Analytics {
  totaux: { visiteurs: number; actifs_30j: number; actifs_7j: number; duree_moy_sec: number };
  top_pages:      { url: string; titre: string | null; nb: number }[];
  top_pays:       { pays: string | null; nb: number }[];
  top_recherches: { query: string; nb: number }[];
  visiteurs_par_jour: { date: string; nb: number }[];
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function fmtSec(s: number) {
  if (s < 60) return `${s}s`;
  return `${Math.floor(s/60)}min ${s%60}s`;
}

function MiniBar({ val, max, color="bg-ev-500" }: { val: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((val/max)*100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width:`${pct}%` }}/>
      </div>
      <span className="text-sm font-bold text-gray-700 w-8 text-right">{val}</span>
    </div>
  );
}

function Sparkline({ data }: { data: { date: string; nb: number }[] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.nb), 1);
  const W = 300, H = 60, pad = 4;
  const pts = data.map((d, i) => ({
    x: pad + (i / Math.max(data.length - 1, 1)) * (W - 2*pad),
    y: H - pad - ((d.nb / max) * (H - 2*pad)),
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = path + ` L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 60 }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16a34a" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sg)"/>
      <path d={path} fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p, i) => data[i].nb > 0 && (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#16a34a"/>
      ))}
    </svg>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    const token = tokenStore.get();
    fetch(`${BASE}/admin/visiteurs/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => setData(j.data ?? j))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-9 h-9 rounded-full animate-spin" style={{ border:"3px solid #dcfce7",borderTopColor:"#16a34a" }}/>
    </div>
  );
  if (error) return <div className="rounded-2xl bg-red-50 border border-red-200 p-8 text-red-600 text-sm text-center">{error}</div>;
  if (!data)  return null;

  const maxPages  = data.top_pages[0]?.nb  ?? 1;
  const maxPays   = data.top_pays[0]?.nb   ?? 1;
  const maxSearch = data.top_recherches[0]?.nb ?? 1;

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily:"var(--font-display,Syne)" }}>
          Comportement visiteurs
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">Analyse des 30 derniers jours</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:"Visiteurs totaux",    val:data.totaux.visiteurs,     icon:Users,    color:"#2563eb", bg:"#eff6ff" },
          { label:"Actifs 30j",          val:data.totaux.actifs_30j,    icon:TrendingUp,color:"#16a34a",bg:"#f0fdf4" },
          { label:"Actifs 7j",           val:data.totaux.actifs_7j,     icon:Eye,      color:"#7c3aed",bg:"#f5f3ff" },
          { label:"Durée moy./session",  val:fmtSec(data.totaux.duree_moy_sec), icon:Clock, color:"#ea580c",bg:"#fff7ed" },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:c.bg }}>
                <c.icon size={18} style={{ color:c.color }}/>
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900" style={{ fontFamily:"var(--font-display,Syne)",color:c.color }}>{c.val}</p>
            <p className="text-xs text-gray-400 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Sparkline visiteurs/jour */}
      {data.visiteurs_par_jour.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Visiteurs par jour (30j)</h2>
            <span className="text-xs text-gray-400">{data.visiteurs_par_jour.length} jours de données</span>
          </div>
          <Sparkline data={data.visiteurs_par_jour}/>
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>{data.visiteurs_par_jour[0]?.date}</span>
            <span>{data.visiteurs_par_jour.at(-1)?.date}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Top pages */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Eye size={16} className="text-ev-600"/>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Pages les plus visitées</h2>
          </div>
          {data.top_pages.length === 0
            ? <p className="text-sm text-gray-400 text-center py-8">Aucune donnée</p>
            : <div className="space-y-3">
                {data.top_pages.map((p, i) => (
                  <div key={i}>
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-700 truncate">{p.titre || p.url}</p>
                        <p className="text-[10px] text-gray-400 truncate font-mono">{p.url}</p>
                      </div>
                    </div>
                    <MiniBar val={p.nb} max={maxPages} color="bg-blue-400"/>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Top pays */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={16} className="text-ev-600"/>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Pays d'origine</h2>
          </div>
          {data.top_pays.length === 0
            ? <div className="text-center py-8">
                <MapPin size={28} className="mx-auto mb-2 text-gray-200"/>
                <p className="text-sm text-gray-400">Aucune donnée de géolocalisation</p>
                <p className="text-xs text-gray-300 mt-1">Les nouveaux visiteurs seront géolocalisés automatiquement</p>
              </div>
            : <div className="space-y-3">
                {data.top_pays.map((p, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-700">{p.pays ?? "Inconnu"}</p>
                    </div>
                    <MiniBar val={p.nb} max={maxPays} color="bg-green-400"/>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* Top recherches */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Search size={16} className="text-ev-600"/>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Recherches les + fréquentes</h2>
          </div>
          {data.top_recherches.length === 0
            ? <div className="text-center py-8">
                <Search size={28} className="mx-auto mb-2 text-gray-200"/>
                <p className="text-sm text-gray-400">Aucune recherche enregistrée</p>
                <p className="text-xs text-gray-300 mt-1">Les recherches du Hero seront trackées automatiquement</p>
              </div>
            : <div className="space-y-3">
                {data.top_recherches.map((r, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-700 font-mono truncate">{r.query}</p>
                    </div>
                    <MiniBar val={r.nb} max={maxSearch} color="bg-purple-400"/>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  );
}
