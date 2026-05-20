"use client";
// src/app/admin/analytics/page.tsx
// ══════════════════════════════════════════════════════════════════
//  ESPACE VERT — Analytics Dashboard
//  Charts interactifs inspirés de NextAdmin Template
//  Données réelles via /api/admin/stats/analytics
// ══════════════════════════════════════════════════════════════════
import { useEffect, useState, useRef, useCallback } from "react";
import { tokenStore } from "@/lib/admin-api";
import {
  Users, Eye, Clock, TrendingUp, FileText, Map,
  Search, ArrowUp, ArrowDown, MousePointerClick,
  BarChart3, Globe, Zap,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────
interface Analytics {
  kpis: {
    visiteurs_actifs: number;
    total_visiteurs: number;
    nouveaux_visiteurs: number;
    page_views: number;
    avg_duree_sec: number;
    pages_par_visite: number;
    devis_total: number;
    taux_conversion: number;
    growth_visiteurs: number;
    growth_pages: number;
  };
  series: {
    visiteurs_par_jour: { date: string; nb: number }[];
    pages_par_jour:     { date: string; nb: number }[];
    devis_par_jour:     { date: string; nb: number }[];
  };
  top_pages: { url: string; titre: string; vues: number; duree: number }[];
  geo: {
    pays:    { pays: string; nb: number }[];
    regions: { region: string; nb: number }[];
  };
  recherches: { query: string; nb: number }[];
  conversions: { devis_par_statut: Record<string, number>; total: number; taux: number };
  periode: { days: number; depuis: string };
}

interface HeatmapCell { heure: number; jour_semaine: number; nb: number; }
interface Entonnoir   { label: string; nb: number; pct: number; }

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// ── Utilitaires ───────────────────────────────────────────────────
const fmtSec = (s: number) => s < 60 ? `${s}s` : `${Math.floor(s / 60)}min ${s % 60}s`;
const fmtNum = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
const JOURS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const STATUT_COLORS: Record<string, string> = {
  nouveau:  "#3C50E0",
  en_cours: "#F59E0B",
  traite:   "#10B981",
  rejete:   "#EF4444",
};
const STATUT_LABELS: Record<string, string> = {
  nouveau: "Nouveau", en_cours: "En cours", traite: "Traité", rejete: "Rejeté",
};

// ── Composant: Courbe SVG interactive ────────────────────────────
function LineChart({
  data, color, label, height = 200
}: {
  data: { date: string; nb: number }[];
  color: string;
  label: string;
  height?: number;
}) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; val: number; date: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (!data.length) return (
    <div className="flex items-center justify-center h-48 text-gray-300 text-sm">Aucune donnée</div>
  );

  const W = 600, H = height, pad = { t: 16, r: 20, b: 32, l: 44 };
  const maxVal = Math.max(...data.map(d => d.nb), 1);
  const pts = data.map((d, i) => ({
    x: pad.l + (i / Math.max(data.length - 1, 1)) * (W - pad.l - pad.r),
    y: pad.t + ((1 - d.nb / maxVal) * (H - pad.t - pad.b)),
    val: d.nb, date: d.date,
  }));

  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L${pts[pts.length - 1].x},${H - pad.b} L${pts[0].x},${H - pad.b} Z`;
  const gradId = `grad-${color.replace("#", "")}`;

  // Ticks Y
  const yTicks = Array.from({ length: 5 }, (_, i) => ({
    y: pad.t + (i / 4) * (H - pad.t - pad.b),
    val: Math.round(maxVal * (1 - i / 4)),
  }));

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    let closest = pts[0];
    pts.forEach(p => { if (Math.abs(p.x - relX) < Math.abs(closest.x - relX)) closest = p; });
    setTooltip({ x: closest.x, y: closest.y, val: closest.val, date: closest.date });
  };

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0"   />
          </linearGradient>
        </defs>

        {/* Grille */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={pad.l} y1={t.y} x2={W - pad.r} y2={t.y}
              stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4,4" />
            <text x={pad.l - 6} y={t.y + 4} textAnchor="end" fontSize="11" fill="#94A3B8">{fmtNum(t.val)}</text>
          </g>
        ))}

        {/* Ticks X — affiche 6 labels */}
        {pts.filter((_, i) => i % Math.ceil(pts.length / 6) === 0 || i === pts.length - 1).map((p, i) => (
          <text key={i} x={p.x} y={H - 6} textAnchor="middle" fontSize="10" fill="#94A3B8">
            {new Date(p.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
          </text>
        ))}

        {/* Aire */}
        <path d={areaD} fill={`url(#${gradId})`} />
        {/* Courbe */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Points au hover */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke={color} strokeWidth="2"
            opacity={tooltip && tooltip.x === p.x ? 1 : 0} />
        ))}

        {/* Ligne verticale tooltip */}
        {tooltip && (
          <line x1={tooltip.x} y1={pad.t} x2={tooltip.x} y2={H - pad.b}
            stroke={color} strokeWidth="1" strokeDasharray="4,2" opacity="0.6" />
        )}

        {/* Bulle tooltip */}
        {tooltip && (() => {
          const bw = 90, bh = 42, bx = Math.min(Math.max(tooltip.x - bw / 2, 4), W - bw - 4), by = tooltip.y - bh - 10;
          return (
            <g>
              <rect x={bx} y={Math.max(by, 2)} width={bw} height={bh} rx="8"
                fill="#1E293B" opacity="0.95" />
              <text x={bx + bw / 2} y={Math.max(by, 2) + 16} textAnchor="middle" fontSize="13"
                fill="white" fontWeight="700">{tooltip.val}</text>
              <text x={bx + bw / 2} y={Math.max(by, 2) + 32} textAnchor="middle" fontSize="10" fill="#94A3B8">
                {new Date(tooltip.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

// ── Composant: Barres horizontales ───────────────────────────────
function HBarChart({
  data, maxVal, color, keyLabel, valLabel
}: {
  data: { label: string; nb: number }[];
  maxVal: number;
  color: string;
  keyLabel: string;
  valLabel: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="space-y-2.5">
      {data.map((item, i) => {
        const pct = maxVal > 0 ? (item.nb / maxVal) * 100 : 0;
        return (
          <div key={i}
            className="group cursor-default"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 truncate max-w-[70%] group-hover:text-gray-900 transition-colors">
                {item.label}
              </span>
              <span className="text-xs font-bold text-gray-700">{fmtNum(item.nb)}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(pct, 1)}%`,
                  background: hovered === i ? color : `${color}cc`,
                  boxShadow: hovered === i ? `0 0 8px ${color}66` : "none",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Composant: Donut Chart SVG ────────────────────────────────────
function DonutChart({ data }: { data: { label: string; nb: number; color: string }[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((a, d) => a + d.nb, 0) || 1;
  const R = 70, r = 45, cx = 90, cy = 90;

  let startAngle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const angle = (d.nb / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = cx + R * Math.cos(startAngle), y1 = cy + R * Math.sin(startAngle);
    const x2 = cx + R * Math.cos(endAngle),   y2 = cy + R * Math.sin(endAngle);
    const ix1 = cx + r * Math.cos(startAngle), iy1 = cy + r * Math.sin(startAngle);
    const ix2 = cx + r * Math.cos(endAngle),   iy2 = cy + r * Math.sin(endAngle);
    const large = angle > Math.PI ? 1 : 0;
    const path = `M${x1.toFixed(2)},${y1.toFixed(2)} A${R},${R} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)} L${ix2.toFixed(2)},${iy2.toFixed(2)} A${r},${r} 0 ${large},0 ${ix1.toFixed(2)},${iy1.toFixed(2)} Z`;
    const mid = startAngle + angle / 2;
    startAngle = endAngle;
    return { ...d, path, mid, pct: Math.round((d.nb / total) * 100) };
  });

  const hov = hovered !== null ? slices[hovered] : null;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 180 180" className="w-36 h-36 shrink-0">
        {slices.map((s, i) => (
          <path key={i} d={s.path}
            fill={s.color}
            opacity={hovered === null || hovered === i ? 1 : 0.4}
            className="cursor-pointer transition-opacity duration-200"
            style={{ filter: hovered === i ? `drop-shadow(0 2px 6px ${s.color}88)` : "none" }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="20" fontWeight="700" fill="#1E293B">
          {hov ? `${hov.pct}%` : `${total}`}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#94A3B8">
          {hov ? hov.label : "total"}
        </text>
      </svg>
      <div className="space-y-2 flex-1">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 cursor-default"
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
            <span className="text-xs text-gray-600 flex-1 truncate">{s.label}</span>
            <span className="text-xs font-bold text-gray-700">{s.nb}</span>
            <span className="text-xs text-gray-400 w-8 text-right">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Composant: Heatmap horaire ────────────────────────────────────
function HeatmapChart({ data }: { data: HeatmapCell[] }) {
  const [tooltip, setTooltip] = useState<{ h: number; j: number; nb: number } | null>(null);
  const maxNb = Math.max(...data.map(d => d.nb), 1);

  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  data.forEach(d => { if (d.jour_semaine >= 1 && d.jour_semaine <= 7) grid[d.jour_semaine - 1][d.heure] = d.nb; });

  const getColor = (nb: number) => {
    if (nb === 0) return "#F8FAFC";
    const intensity = nb / maxNb;
    if (intensity < 0.25) return "#DCFCE7";
    if (intensity < 0.5)  return "#86EFAC";
    if (intensity < 0.75) return "#22C55E";
    return "#15803D";
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[520px] sm:min-w-[640px]">
        {/* Heures */}
        <div className="mb-1 ml-8 flex gap-0.5 sm:ml-10">
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="flex-1 text-center text-[8px] text-gray-400 sm:text-[9px]">
              {h % 4 === 0 ? `${h}h` : ""}
            </div>
          ))}
        </div>
        {/* Grille */}
        {JOURS.map((jour, ji) => (
          <div key={ji} className="flex items-center gap-0.5 mb-0.5">
            <span className="w-8 shrink-0 pr-2 text-right text-[9px] text-gray-500 sm:w-10 sm:text-[10px]">{jour}</span>
            {Array.from({ length: 24 }, (_, h) => {
              const nb = grid[ji][h];
              return (
                <div key={h}
                  className="flex-1 aspect-square rounded-sm cursor-default relative"
                  style={{ background: getColor(nb) }}
                  onMouseEnter={() => setTooltip({ h, j: ji, nb })}
                  onMouseLeave={() => setTooltip(null)}>
                  {tooltip?.h === h && tooltip?.j === ji && nb > 0 && (
                    <div className="absolute z-20 -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap pointer-events-none">
                      {jour} {h}h : {nb} vues
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {/* Légende */}
        <div className="ml-8 mt-3 flex items-center gap-2 sm:ml-10">
          <span className="text-[10px] text-gray-400">Moins</span>
          {["#F8FAFC", "#DCFCE7", "#86EFAC", "#22C55E", "#15803D"].map((c, i) => (
            <div key={i} className="w-4 h-4 rounded-sm" style={{ background: c }} />
          ))}
          <span className="text-[10px] text-gray-400">Plus</span>
        </div>
      </div>
    </div>
  );
}

// ── Composant: Entonnoir ─────────────────────────────────────────
function FunnelChart({ data }: { data: Entonnoir[] }) {
  return (
    <div className="space-y-3">
      {data.map((step, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-ev-500 text-white text-[10px] flex items-center justify-center font-bold" style={{ background: "#3C50E0" }}>
                {i + 1}
              </span>
              <span className="text-sm text-gray-700">{step.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-800">{fmtNum(step.nb)}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${["#EEF2FF","#DCFCE7","#FEF3C7","#FEE2E2"][i]}`, color: ["#3C50E0","#16A34A","#D97706","#DC2626"][i] }}>
                {step.pct}%
              </span>
            </div>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.max(step.pct, 0.5)}%`, background: ["#3C50E0","#10B981","#F59E0B","#EF4444"][i] }} />
          </div>
          {i < data.length - 1 && (
            <div className="ml-2.5 flex items-center gap-1.5 mt-1">
              <span className="text-[10px] text-gray-400">
                ↓ {data[i + 1].nb > 0 && data[i].nb > 0 ? Math.round((data[i + 1].nb / data[i].nb) * 100) : 0}% continuent
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Composant: KPI Card ─────────────────────────────────────────
function KpiCard({
  label, value, growth, growthUp, icon: Icon, color, colorLt, sub
}: {
  label: string; value: string; growth?: number; growthUp?: boolean;
  icon: any; color: string; colorLt: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: colorLt }}>
          <Icon size={20} style={{ color }} />
        </div>
        {growth !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${growthUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
            {growthUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />}{Math.abs(growth)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-800 mb-0.5" style={{ letterSpacing: "-0.03em" }}>{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── Sélecteur de période ─────────────────────────────────────────
function PeriodSelector({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const opts = [{ v: 7, l: "7j" }, { v: 30, l: "30j" }, { v: 90, l: "90j" }];
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
      {opts.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
          style={{
            background: value === o.v ? "white" : "transparent",
            color: value === o.v ? "#1E293B" : "#64748B",
            boxShadow: value === o.v ? "0 1px 3px rgba(0,0,0,.1)" : "none",
          }}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

// ── Squelette de chargement ──────────────────────────────────────
function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
}

// ═══════════════════════════════════════════════════════════════════
//  PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════════════
export default function AnalyticsPage() {
  const [days, setDays]         = useState(30);
  const [data, setData]         = useState<Analytics | null>(null);
  const [heatmap, setHeatmap]   = useState<HeatmapCell[]>([]);
  const [entonnoir, setEntonnoir] = useState<Entonnoir[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<"trafic" | "geo" | "comportement" | "conversion">("trafic");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const token = tokenStore.get();
    const h = { Authorization: `Bearer ${token}` };

    try {
      const [ana, hm, ent] = await Promise.all([
        fetch(`${BASE}/admin/stats/analytics?days=${days}`, { headers: h }).then(r => r.json()),
        fetch(`${BASE}/admin/stats/heatmap?days=${days}`, { headers: h }).then(r => r.json()),
        fetch(`${BASE}/admin/stats/entonnoir?days=${days}`, { headers: h }).then(r => r.json()),
      ]);
      setData(ana.data ?? ana);
      setHeatmap(hm.data ?? hm);
      setEntonnoir(ent.data ?? ent);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Rendu ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-10">

      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ letterSpacing: "-0.03em" }}>
            Analytics Visiteurs
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Analyse comportementale en temps réel — visiteurs publics uniquement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PeriodSelector value={days} onChange={setDays} />
          <button onClick={fetchAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: "#3C50E0", color: "white" }}>
            <Zap size={14} />Actualiser
          </button>
        </div>
      </div>

      {/* ── KPIs ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : data ? (<>
          <KpiCard label="Visiteurs actifs"    value={fmtNum(data.kpis.visiteurs_actifs)}
            growth={data.kpis.growth_visiteurs} growthUp={data.kpis.growth_visiteurs >= 0}
            icon={Users} color="#3C50E0" colorLt="#EEF2FF"
            sub={`${data.kpis.nouveaux_visiteurs} nouveaux`} />
          <KpiCard label="Pages vues"          value={fmtNum(data.kpis.page_views)}
            growth={data.kpis.growth_pages} growthUp={data.kpis.growth_pages >= 0}
            icon={Eye} color="#8B5CF6" colorLt="#EDE9FE" />
          <KpiCard label="Durée moyenne"       value={fmtSec(data.kpis.avg_duree_sec)}
            icon={Clock} color="#F59E0B" colorLt="#FEF3C7"
            sub={`${data.kpis.pages_par_visite} pages/visite`} />
          <KpiCard label="Taux de conversion"  value={`${data.kpis.taux_conversion}%`}
            icon={MousePointerClick} color="#10B981" colorLt="#D1FAE5"
            sub={`${data.kpis.devis_total} devis générés`} />
          <KpiCard label="Total visiteurs"     value={fmtNum(data.kpis.total_visiteurs)}
            icon={Globe} color="#0EA5E9" colorLt="#E0F2FE" />
          <KpiCard label="Nouvelles visites"   value={fmtNum(data.kpis.nouveaux_visiteurs)}
            icon={TrendingUp} color="#EC4899" colorLt="#FCE7F3" />
          <KpiCard label="Devis soumis"        value={String(data.kpis.devis_total)}
            icon={FileText} color="#F97316" colorLt="#FFF7ED" />
          <KpiCard label="Pages/visite"        value={String(data.kpis.pages_par_visite)}
            icon={BarChart3} color="#6366F1" colorLt="#EEF2FF" />
        </>) : null}
      </div>

      {/* ── Onglets ───────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-gray-100">
        {(["trafic", "geo", "comportement", "conversion"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2.5 text-sm font-medium capitalize rounded-t-lg transition-all duration-150"
            style={{
              color: tab === t ? "#3C50E0" : "#64748B",
              borderBottom: tab === t ? "2px solid #3C50E0" : "2px solid transparent",
              background: tab === t ? "#EEF2FF" : "transparent",
            }}>
            {t === "trafic" ? "📈 Trafic" :
             t === "geo" ? "🌍 Géographie" :
             t === "comportement" ? "🔍 Comportement" : "🎯 Conversion"}
          </button>
        ))}
      </div>

      {/* ── TAB: Trafic ──────────────────────────────────────────── */}
      {tab === "trafic" && (
        <div className="space-y-5">
          {/* Courbe visiteurs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Visiteurs par jour</h3>
            {loading ? <Skeleton className="h-48" /> :
              <LineChart data={data?.series.visiteurs_par_jour ?? []} color="#3C50E0" label="Visiteurs" height={200} />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Courbe pages vues */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Pages vues</h3>
              {loading ? <Skeleton className="h-40" /> :
                <LineChart data={data?.series.pages_par_jour ?? []} color="#8B5CF6" label="Pages" height={160} />}
            </div>

            {/* Courbe devis */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Devis soumis</h3>
              {loading ? <Skeleton className="h-40" /> :
                <LineChart data={data?.series.devis_par_jour ?? []} color="#10B981" label="Devis" height={160} />}
            </div>
          </div>

          {/* Heatmap horaire */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-1">Activité par heure et jour</h3>
            <p className="text-xs text-gray-400 mb-4">Quand vos visiteurs sont-ils les plus actifs ?</p>
            {loading ? <Skeleton className="h-40" /> : <HeatmapChart data={heatmap} />}
          </div>
        </div>
      )}

      {/* ── TAB: Géographie ──────────────────────────────────────── */}
      {tab === "geo" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Map size={16} className="text-blue-500" />
              <h3 className="font-semibold text-gray-800">Top pays</h3>
            </div>
            {loading ? <Skeleton className="h-48" /> :
              <HBarChart
                data={(data?.geo.pays ?? []).map(p => ({ label: p.pays, nb: p.nb }))}
                maxVal={data?.geo.pays[0]?.nb ?? 1}
                color="#3C50E0"
                keyLabel="Pays"
                valLabel="Visiteurs"
              />}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Map size={16} className="text-purple-500" />
              <h3 className="font-semibold text-gray-800">Top régions</h3>
            </div>
            {loading ? <Skeleton className="h-48" /> :
              <HBarChart
                data={(data?.geo.regions ?? []).map(r => ({ label: r.region, nb: r.nb }))}
                maxVal={data?.geo.regions[0]?.nb ?? 1}
                color="#8B5CF6"
                keyLabel="Région"
                valLabel="Visiteurs"
              />}
          </div>
        </div>
      )}

      {/* ── TAB: Comportement ────────────────────────────────────── */}
      {tab === "comportement" && (
        <div className="space-y-5">
          {/* Top pages */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-3 border-b border-gray-50">
              <h3 className="font-semibold text-gray-800">Pages les plus visitées</h3>
            </div>
            {loading ? <Skeleton className="h-64 m-6" /> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Page</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vues</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Durée moy.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.top_pages ?? []).map((p, i) => (
                      <tr key={i} className="border-t border-gray-50 transition-colors hover:bg-gray-50">
                        <td className="px-6 py-3.5 font-mono text-xs text-gray-400">{String(i + 1).padStart(2, "0")}</td>
                        <td className="px-6 py-3.5">
                          <div className="max-w-xs truncate font-medium text-gray-800">{p.titre}</div>
                          <div className="max-w-xs truncate text-xs text-gray-400">{p.url}</div>
                        </td>
                        <td className="px-6 py-3.5 text-right font-bold text-gray-700">{fmtNum(p.vues)}</td>
                        <td className="px-6 py-3.5 text-right text-gray-500">{fmtSec(p.duree)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recherches */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Search size={16} className="text-amber-500" />
              <h3 className="font-semibold text-gray-800">Recherches fréquentes</h3>
            </div>
            {loading ? <Skeleton className="h-48" /> : (
              <div className="flex flex-wrap gap-2">
                {(data?.recherches ?? []).map((r, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border"
                    style={{
                      background: `rgba(245,158,11,${0.05 + (r.nb / (data?.recherches[0]?.nb ?? 1)) * 0.15})`,
                      borderColor: "#FDE68A",
                      fontSize: `${Math.max(11, Math.min(14, 10 + (r.nb / (data?.recherches[0]?.nb ?? 1)) * 4))}px`,
                    }}>
                    <span className="text-gray-700">{r.query}</span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">{r.nb}</span>
                  </span>
                ))}
                {!(data?.recherches?.length) && <p className="text-gray-400 text-sm">Aucune recherche enregistrée</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Conversion ──────────────────────────────────────── */}
      {tab === "conversion" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Entonnoir */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-1">Entonnoir de conversion</h3>
            <p className="text-xs text-gray-400 mb-4">De la visite au devis</p>
            {loading ? <Skeleton className="h-48" /> : <FunnelChart data={entonnoir} />}
          </div>

          {/* Devis par statut */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-1">Statuts des devis</h3>
            <p className="text-xs text-gray-400 mb-4">Répartition sur la période</p>
            {loading ? <Skeleton className="h-48" /> : (
              <DonutChart
                data={Object.entries(data?.conversions.devis_par_statut ?? {}).map(([k, v]) => ({
                  label: STATUT_LABELS[k] ?? k,
                  nb: v,
                  color: STATUT_COLORS[k] ?? "#94A3B8",
                }))}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
