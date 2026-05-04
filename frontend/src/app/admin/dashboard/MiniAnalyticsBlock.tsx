"use client";
export function MiniAnalyticsBlock({
  data,
}: {
  data: { visiteurs_actifs: number; page_views: number; taux_conversion: number; series_visiteurs: { date: string; nb: number }[] } | null;
}) {
  if (!data) return null;

  // Mini sparkline SVG
  const Spark = ({ values, color }: { values: number[]; color: string }) => {
    if (values.length < 2) return null;
    const W = 80, H = 32;
    const max = Math.max(...values, 1);
    const pts = values.map((v, i) => ({
      x: (i / (values.length - 1)) * W,
      y: H - (v / max) * (H - 4) - 2,
    }));
    const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <path d={`${d} L${W},${H} L0,${H} Z`} fill={color} fillOpacity="0.15" />
        <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  };

  const sparkVals = data.series_visiteurs.map(s => s.nb);

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-5" style={{ borderColor: "#E2E8F0" }}>
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#F1F5F9" }}>
        <h3 className="font-semibold text-gray-800 text-sm">Trafic — 7 derniers jours</h3>
        <a href="/admin/analytics"
          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: "#EEF2FF", color: "#3C50E0" }}>
          Voir Analytics →
        </a>
      </div>
      <div className="grid grid-cols-3 divide-x" style={{ divideColor: "#F1F5F9" }}>
        {[
          { label: "Visiteurs actifs", value: data.visiteurs_actifs, color: "#3C50E0", spark: sparkVals },
          { label: "Pages vues",       value: data.page_views,       color: "#8B5CF6", spark: null     },
          { label: "Taux conversion",  value: `${data.taux_conversion}%`, color: "#10B981", spark: null },
        ].map((item, i) => (
          <div key={i} className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">{item.label}</p>
              <p className="text-xl font-bold text-gray-800">{item.value}</p>
            </div>
            {item.spark && <Spark values={item.spark} color={item.color} />}
          </div>
        ))}
      </div>
    </div>
  );
}
