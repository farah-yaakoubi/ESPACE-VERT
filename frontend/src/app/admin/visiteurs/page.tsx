"use client";
import {
  adminVisiteurs,
  type VisiteurItem,
  type VisiteurStats,
} from "@/lib/admin-api";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Eye,
  Globe,
  HelpCircle,
  MapPin,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

function fmt(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function fmtDuree(s: number) {
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "ev",
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  const colors: Record<string, string> = {
    ev: "bg-ev-50 text-ev-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-start gap-4">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ProgressBar({
  value,
  max,
  label,
  sub,
}: {
  value: number;
  max: number;
  label: string;
  sub?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-start justify-between mb-1 gap-2">
        <p className="text-sm text-gray-700 font-medium truncate flex-1">
          {label}
        </p>
        <span className="text-xs text-gray-500 shrink-0">{value}</span>
      </div>
      {sub && <p className="text-xs text-gray-400 mb-1 truncate">{sub}</p>}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-ev-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function VisiteurRow({ v }: { v: VisiteurItem }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (detail) {
      setOpen((o) => !o);
      return;
    }
    setLoading(true);
    try {
      const d = await adminVisiteurs.getById(v.id_visiteur);
      setDetail(d);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <tr className="hover:bg-gray-50 cursor-pointer" onClick={toggle}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-ev-100 flex items-center justify-center shrink-0">
              <Users size={13} className="text-ev-600" />
            </div>
            <span className="text-xs font-mono text-gray-500">
              {v.token_visiteur.substring(0, 8)}…
            </span>
          </div>
        </td>
        <td className="px-4 py-3">
          <p className="text-xs text-gray-600">
            {v.pays ? (
              <>
                <MapPin size={11} className="inline mr-1 text-gray-400" />
                {v.pays}
                {v.region ? ` · ${v.region}` : ""}
              </>
            ) : (
              <span className="text-gray-300">—</span>
            )}
          </p>
          <p className="text-[12px] text-gray-400 font-mono">{v.ip_address}</p>
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Eye size={11} />
              {v._count.visites_pages}
            </span>
            <span className="flex items-center gap-1">
              <Search size={11} />
              {v._count.search_queries}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-xs text-gray-500">{fmt(v.last_visit)}</td>
        <td className="px-4 py-3 text-xs text-gray-400">
          {fmt(v.first_visit)}
        </td>
        <td className="px-4 py-3 text-gray-400">
          {loading ? (
            <span className="w-4 h-4 border-2 border-ev-500 border-t-transparent rounded-full animate-spin inline-block" />
          ) : open ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )}
        </td>
      </tr>
      {open && detail && (
        <tr>
          <td
            colSpan={6}
            className="bg-gray-50 px-6 py-4 border-t border-gray-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Pages visitées ({detail.visites_pages?.length ?? 0})
                </p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {(detail.visites_pages ?? []).map((p: any) => (
                    <div
                      key={p.id_vp}
                      className="flex items-start justify-between gap-2 py-1 border-b border-gray-100"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-gray-700">
                          {p.titre ?? p.url}
                        </p>
                        <p className="text-gray-400 font-mono text-[11px] truncate">
                          {p.url}
                        </p>
                      </div>
                      <span className="shrink-0 text-gray-400">
                        {fmtDuree(p.duree)}
                      </span>
                    </div>
                  ))}
                  {!detail.visites_pages?.length && (
                    <p className="text-gray-400 py-2">
                      Aucune page enregistrée
                    </p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Recherches ({detail.search_queries?.length ?? 0})
                </p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {(detail.search_queries ?? []).map((s: any) => (
                    <div
                      key={s.id_search}
                      className="flex items-center justify-between gap-2 py-1 border-b border-gray-100"
                    >
                      <span className="text-gray-700">"{s.query}"</span>
                      <span className="text-gray-400 shrink-0">
                        {s.nb_results} résultats
                      </span>
                    </div>
                  ))}
                  {!detail.search_queries?.length && (
                    <p className="text-gray-400 py-2">Aucune recherche</p>
                  )}
                </div>
              </div>
            </div>
            {detail.user_agent && (
              <p className="text-[11px] text-gray-400 mt-3 truncate">
                <span className="font-semibold">UA:</span> {detail.user_agent}
              </p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminVisteurPage() {
  const [stats, setStats] = useState<VisiteurStats | null>(null);
  const [visiteurs, setVisiteurs] = useState<VisiteurItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [tab, setTab] = useState<"stats" | "visiteurs">("stats");
  const [exporting, setExporting] = useState(false);

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const [s, v] = await Promise.all([
          adminVisiteurs.getStats(days),
          adminVisiteurs.list({ page: String(page) } as any),
        ]);
        setStats(s as any);
        setVisiteurs((v as any).data ?? []);
        setMeta((v as any).meta ?? { total: 0, page: 1, pages: 1 });
      } finally {
        setLoading(false);
      }
    },
    [days],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  // ── Export CSV ────────────────────────────────────────────────
  const exportCsv = async () => {
    if (!stats) return;
    setExporting(true);
    try {
      // Récupérer tous les visiteurs (toutes pages) pour l'export
      const allPages = await Promise.all(
        Array.from({ length: meta.pages }, (_, i) =>
          adminVisiteurs.list({ page: String(i + 1) } as any).then((r: any) => r.data ?? [])
        )
      );
      const allVisiteurs: VisiteurItem[] = allPages.flat();

      const escape = (v: string | number | null | undefined) => {
        if (v == null) return "";
        const s = String(v).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
      };

      const headers = ["Token", "IP", "Pays", "Région", "Pages vues", "Recherches", "Première visite", "Dernière visite"];
      const rows = allVisiteurs.map((v) => [
        escape(v.token_visiteur),
        escape(v.ip_address),
        escape(v.pays),
        escape(v.region),
        escape(v._count.visites_pages),
        escape(v._count.search_queries),
        escape(new Date(v.first_visit).toLocaleString("fr-FR")),
        escape(new Date(v.last_visit).toLocaleString("fr-FR")),
      ]);

      // Feuille 2 : stats Top Pages
      const statsRows: string[][] = [];
      statsRows.push(["--- TOP PAGES ---"]);
      statsRows.push(["URL", "Titre", "Vues"]);
      (stats.topPages ?? []).forEach((p) => statsRows.push([escape(p.url), escape(p.titre), escape(p.vues)]));
      statsRows.push([]);
      statsRows.push(["--- RECHERCHES FREQUENTES ---"]);
      statsRows.push(["Requête", "Occurrences"]);
      (stats.searchStats ?? []).forEach((s) => statsRows.push([escape(s.query), escape(s.count)]));
      statsRows.push([]);
      statsRows.push(["--- REPARTITION PAYS ---"]);
      statsRows.push(["Pays", "Visiteurs"]);
      (stats.paysStats ?? []).forEach((p) => statsRows.push([escape(p.pays), escape(p.count)]));
      statsRows.push([]);
      statsRows.push(["--- FAQ LES PLUS CONSULTEES ---"]);
      statsRows.push(["Question", "Rubrique", "Consultations"]);
      (stats.faqStats ?? []).forEach((f) => statsRows.push([escape(f.question), escape(f.rubrique), escape(f.nb_consultations)]));

      const csvContent =
        "\uFEFF" + // BOM UTF-8 pour Excel
        [headers, ...rows, [], ...statsRows]
          .map((row) => (Array.isArray(row) ? row.join(",") : row))
          .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `visiteurs-stats-${days}j-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const topPageMax = stats?.topPages?.[0]?.vues ?? 1;
  const searchMax = stats?.searchStats?.[0]?.count ?? 1;
  const paysMax = stats?.paysStats?.[0]?.count ?? 1;
  const faqMax = stats?.faqStats?.[0]?.nb_consultations ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Visiteurs & Comportement
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Analyse du trafic et des interactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="h-9 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none"
          >
            <option value={7}>7 derniers jours</option>
            <option value={30}>30 derniers jours</option>
            <option value={90}>90 derniers jours</option>
          </select>
          <button
            onClick={exportCsv}
            disabled={exporting || !stats}
            className="flex items-center gap-2 h-9 px-3 text-sm border border-gray-200 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Exporter en CSV"
          >
            {exporting ? (
              <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download size={15} className="text-gray-500" />
            )}
            Exporter CSV
          </button>
          <button
            onClick={() => load(1)}
            className="p-2 text-gray-500 hover:text-gray-800 rounded-xl hover:bg-gray-100"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(["stats", "visiteurs"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {t === "stats" ? "Statistiques" : `Visiteurs (${meta.total})`}
          </button>
        ))}
      </div>

      {loading && !stats ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-ev-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === "stats" && stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="Total visiteurs"
              value={stats.totalVisiteurs}
              color="ev"
            />
            <StatCard
              icon={TrendingUp}
              label="Actifs (période)"
              value={stats.visiteursActifs}
              sub={`${days} jours`}
              color="blue"
            />
            <StatCard
              icon={Eye}
              label="Pages vues"
              value={stats.totalPages}
              color="purple"
            />
            <StatCard
              icon={Clock}
              label="Durée moy./page"
              value={fmtDuree(stats.avgDuree)}
              color="amber"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-5">
                <Eye size={16} className="text-ev-600" />
                <h3 className="font-semibold text-gray-800">
                  Top pages visitées
                </h3>
              </div>
              <div className="space-y-4">
                {stats.topPages.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">
                    Pas encore de données
                  </p>
                ) : (
                  stats.topPages.map((p, i) => (
                    <ProgressBar
                      key={i}
                      value={p.vues}
                      max={topPageMax}
                      label={p.titre !== p.url ? p.titre : p.url}
                      sub={p.titre !== p.url ? p.url : undefined}
                    />
                  ))
                )}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-5">
                <Search size={16} className="text-ev-600" />
                <h3 className="font-semibold text-gray-800">
                  Recherches fréquentes
                </h3>
              </div>
              <div className="space-y-4">
                {stats.searchStats.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">
                    Aucune recherche enregistrée
                  </p>
                ) : (
                  stats.searchStats.map((s, i) => (
                    <ProgressBar
                      key={i}
                      value={s.count}
                      max={searchMax}
                      label={`"${s.query}"`}
                    />
                  ))
                )}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-5">
                <Globe size={16} className="text-ev-600" />
                <h3 className="font-semibold text-gray-800">
                  Répartition géographique
                </h3>
              </div>
              <div className="space-y-4">
                {stats.paysStats.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">
                    Pays non encore résolus — les nouvelles visites seront
                    géolocalisées
                  </p>
                ) : (
                  stats.paysStats.map((p, i) => (
                    <ProgressBar
                      key={i}
                      value={p.count}
                      max={paysMax}
                      label={p.pays}
                    />
                  ))
                )}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-5">
                <HelpCircle size={16} className="text-ev-600" />
                <h3 className="font-semibold text-gray-800">
                  FAQs les plus consultées
                </h3>
              </div>
              <div className="space-y-4">
                {stats.faqStats.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">
                    Aucune consultation enregistrée
                  </p>
                ) : (
                  stats.faqStats.map((f, i) => (
                    <ProgressBar
                      key={i}
                      value={f.nb_consultations}
                      max={faqMax}
                      label={
                        f.question.length > 65
                          ? f.question.substring(0, 65) + "…"
                          : f.question
                      }
                      sub={f.rubrique ?? undefined}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      ) : tab === "visiteurs" ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    "Visiteur",
                    "Localisation",
                    "Activité",
                    "Dernière visite",
                    "Première visite",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visiteurs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      Aucun visiteur
                    </td>
                  </tr>
                ) : (
                  visiteurs.map((v) => (
                    <VisiteurRow key={v.id_visiteur} v={v} />
                  ))
                )}
              </tbody>
            </table>
          </div>
          {meta.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Page {meta.page} / {meta.pages} — {meta.total} visiteurs
              </p>
              <div className="flex gap-2">
                <button
                  disabled={meta.page <= 1}
                  onClick={() => load(meta.page - 1)}
                  className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  Précédent
                </button>
                <button
                  disabled={meta.page >= meta.pages}
                  onClick={() => load(meta.page + 1)}
                  className="px-3 py-1.5 text-xs border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}