"use client";
import { useState } from "react";
import {
  Barcode, Scale, Package,
  FlaskConical, Target, Star,
  Sprout, Zap, TestTube, Globe, Waves, Leaf,
  CheckCircle2, Wheat, Apple, Grape, TreePine, Carrot, Sun,
} from "lucide-react";

interface TechTableProps {
  sku?:                string | null;
  poids?:              string | null;
  nature?:             string | null;
  composition_chimique?: string | null;
  usage?:              string | null;
  biologique?:         boolean | null;
  conditionnement?:    string | null;
  slug?:               string;
  categorie?:          string | null;
  tags?:               string[];
}

/* ── Palettes couleurs par famille ──────────────────────────── */
type Palette = {
  headerBg: string; headerText: string;
  subHeaderBg: string; subHeaderText: string;
  rowAlt: string; border: string; metaBg: string;
  FamilyIcon: React.ElementType; famille: string;
};

const PALETTES: Record<string, Palette> = {
  biostimulant: {
    headerBg: "#bf360c", headerText: "#ffffff",
    subHeaderBg: "#e64a19", subHeaderText: "#fbe9e7",
    rowAlt: "#fff3e0", border: "#ffccbc", metaBg: "#fffaf8",
    FamilyIcon: Zap, famille: "Biostimulant",
  },
  organique: {
    headerBg: "#1b5e20", headerText: "#ffffff",
    subHeaderBg: "#2e7d32", subHeaderText: "#e8f5e9",
    rowAlt: "#f1f8e9", border: "#c8e6c9", metaBg: "#f9fdf9",
    FamilyIcon: Sprout, famille: "Engrais Organique",
  },
  carence: {
    headerBg: "#b71c1c", headerText: "#ffffff",
    subHeaderBg: "#c62828", subHeaderText: "#ffebee",
    rowAlt: "#fce4ec", border: "#ef9a9a", metaBg: "#fff8f8",
    FamilyIcon: TestTube, famille: "Correcteur de Carences",
  },
  sol: {
    headerBg: "#4a148c", headerText: "#ffffff",
    subHeaderBg: "#6a1b9a", subHeaderText: "#f3e5f5",
    rowAlt: "#ede7f6", border: "#ce93d8", metaBg: "#fdf8ff",
    FamilyIcon: Globe, famille: "Gestion du Sol",
  },
  algue: {
    headerBg: "#01579b", headerText: "#ffffff",
    subHeaderBg: "#0277bd", subHeaderText: "#e1f5fe",
    rowAlt: "#e3f2fd", border: "#90caf9", metaBg: "#f8fcff",
    FamilyIcon: Waves, famille: "Extrait d'Algue",
  },
  default: {
    headerBg: "#1b5e38", headerText: "#ffffff",
    subHeaderBg: "#2e7d4f", subHeaderText: "#e8f5ee",
    rowAlt: "#f0faf4", border: "#a8d5b8", metaBg: "#f8fdf9",
    FamilyIcon: Leaf, famille: "",
  },
};

function getPalette(slug?: string, nature?: string | null, categorie?: string | null): Palette {
  const s = (slug ?? "").toLowerCase();
  const n = (nature ?? "").toLowerCase();
  const c = (categorie ?? "").toLowerCase();
  if (s.includes("oceano") || n.includes("algue"))              return PALETTES.algue;
  if (s.includes("fulvical") || s.includes("sweeter") || n.includes("sol") || c.includes("sol")) return PALETTES.sol;
  if (s.includes("calcial") || s.includes("calcimag") || n.includes("carence") || c.includes("carence")) return PALETTES.carence;
  if (s.includes("aminal") || s.includes("fortstart") || s.includes("poussroots") || n.includes("biostimul") || c.includes("biostimul")) return PALETTES.biostimulant;
  if (n.includes("organique") || s.includes("ferti") || c.includes("organique") || c.includes("engrais")) return PALETTES.organique;
  return PALETTES.default;
}

/* ── Parsing ─────────────────────────────────────────────────── */
function parseComposition(raw: string): { label: string; value: string }[] {
  return raw.split("\n").map(l => l.trim()).filter(Boolean).map(line => {
    const dashMatch = line.match(/^(.+?)\s[—\-]\s(.+)$/);
    if (dashMatch) return { label: dashMatch[1].trim(), value: dashMatch[2].trim() };
    const idx = line.lastIndexOf(":");
    if (idx < 0) return { label: line, value: "" };
    return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
  });
}

/* ── Icônes culture ──────────────────────────────────────────── */
const CULTURE_ICONS: Record<string, React.ElementType> = {
  maraîchage: Carrot, maraichage: Carrot,
  arboriculture: Apple,
  "grandes cultures": Wheat,
  viticulture: Grape,
  agrumes: Sun,
  forêt: TreePine, foret: TreePine,
  default: Sprout,
};

function getCultureIcon(name: string): React.ElementType {
  const key = name.toLowerCase();
  return CULTURE_ICONS[key] ?? CULTURE_ICONS.default;
}

interface UsageCard { culture: string; detail: string; dose: string }
interface UsageData { cards: UsageCard[]; textLines: string[] }

function parseUsage(raw: string): UsageData {
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const cards: UsageCard[] = [];
  const textLines: string[] = [];
  for (const line of lines) {
    if (line.includes("|")) {
      const parts = line.split("|").map(p => p.trim());
      if (parts.length >= 2) {
        cards.push({
          culture: parts[0],
          detail:  parts[1] ?? "",
          dose:    parts[2] ?? "",
        });
      }
    } else {
      textLines.push(line.replace(/^[•\-]\s*/, ""));
    }
  }
  return { cards, textLines };
}

/* ── Onglets ─────────────────────────────────────────────────── */
type Tab = "composition" | "usage" | "avantages";

const TABS: { key: Tab; label: string; Icon: React.ElementType }[] = [
  { key: "composition", label: "Composition",   Icon: FlaskConical },
  { key: "usage",       label: "Mode d'emploi", Icon: Target       },
  { key: "avantages",   label: "Avantages",      Icon: Star         },
];

/* ── Composant principal ─────────────────────────────────────── */
export function ProduitTechTable({
  sku, poids, nature, composition_chimique, usage,
  biologique, conditionnement, slug, categorie, tags,
}: TechTableProps) {
  const hasData = !!(sku || poids || nature || composition_chimique || usage || conditionnement || biologique != null);
  if (!hasData) return null;

  const pal = getPalette(slug, nature, categorie);
  const { FamilyIcon } = pal;

  const compRows   = composition_chimique ? parseComposition(composition_chimique) : [];
  const usageData  = usage ? parseUsage(usage) : null;
  const avantages  = tags?.filter(Boolean) ?? [];

  const hasComp = compRows.length > 0;
  const hasUsage = usageData && (usageData.cards.length > 0 || usageData.textLines.length > 0);
  const hasAvantages = avantages.length > 0;

  // onglet par défaut : premier qui a du contenu
  const defaultTab: Tab = hasComp ? "composition" : hasUsage ? "usage" : "avantages";
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  const metaItems = [
    { Icon: Barcode, label: "Référence",       value: sku          },
    { Icon: Scale,   label: "Poids / Volume",  value: poids        },
    { Icon: Package, label: "Conditionnement", value: conditionnement },
  ].filter(({ value }) => value);

  const tabsAvail = TABS.filter(t =>
    (t.key === "composition" && hasComp) ||
    (t.key === "usage"       && hasUsage) ||
    (t.key === "avantages"   && hasAvantages)
  );

  return (
    <div className="rounded-2xl overflow-hidden border bg-white"
      style={{ borderColor: pal.border, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

      {/* ── Header famille ── */}
      <div className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
        style={{ background: pal.headerBg }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)" }}>
            <FamilyIcon size={16} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.65)" }}>{pal.famille}</p>
            {nature && <p className="text-sm font-bold leading-tight" style={{ color: "#fff" }}>{nature}</p>}
          </div>
        </div>
        {biologique && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.18)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
            <CheckCircle2 size={12} /> 100% Biologique
          </div>
        )}
      </div>

      {/* ── Méta : SKU / Poids / Conditionnement ── */}
      {metaItems.length > 0 && (
        <div className="flex flex-col md:flex-row" style={{ borderBottom: `1px solid ${pal.border}`, background: pal.metaBg }}>
          {metaItems.map(({ Icon, label, value }, index) => (
            <div key={label}
              className={`flex flex-1 items-center gap-3 px-4 py-3 ${index === 0 ? "" : "border-t md:border-t-0 md:border-l"}`}
              style={{ borderColor: pal.border }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: pal.rowAlt, border: `1px solid ${pal.border}` }}>
                <Icon size={13} style={{ color: pal.subHeaderBg }} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>{label}</p>
                <p className="text-xs font-bold text-gray-800 mt-0.5 break-words">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Onglets ── */}
      {tabsAvail.length > 0 && (
        <>
          <div className="flex border-b" style={{ borderColor: pal.border, background: pal.metaBg }}>
            {tabsAvail.map(({ key, label, Icon }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className="flex flex-1 items-center justify-center gap-1.5 px-3 py-3 text-[11px] font-semibold transition-all relative"
                  style={{
                    color: isActive ? pal.headerBg : "#9ca3af",
                    background: isActive ? "#fff" : "transparent",
                    borderBottom: isActive ? `2px solid ${pal.headerBg}` : "2px solid transparent",
                  }}
                >
                  <Icon size={12} />
                  {label}
                </button>
              );
            })}
          </div>

          {/* ── Contenu onglet : Composition ── */}
          {activeTab === "composition" && hasComp && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px]">
                <tbody>
                  {compRows.map((row, i) => (
                    <tr key={i} style={{
                      background: i % 2 === 0 ? pal.rowAlt : "#fff",
                      borderBottom: `1px solid ${pal.border}`,
                    }}>
                      <td className="px-4 py-2.5 text-xs font-medium text-gray-700 break-words md:w-[60%]"
                        style={{ borderRight: `1px solid ${pal.border}` }}>
                        {row.label}
                      </td>
                      <td className="px-4 py-2.5 text-xs font-bold tabular-nums break-words text-right sm:whitespace-nowrap"
                        style={{ color: pal.headerBg }}>
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Contenu onglet : Mode d'emploi ── */}
          {activeTab === "usage" && usageData && (
            <div className="p-4 space-y-3">
              {/* Cartes culture */}
              {usageData.cards.map((card, i) => {
                const CultureIcon = getCultureIcon(card.culture);
                return (
                  <div key={i}
                    className="flex items-center gap-4 rounded-xl p-3.5"
                    style={{ background: i % 2 === 0 ? pal.rowAlt : "#fff", border: `1px solid ${pal.border}` }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: pal.headerBg }}>
                      <CultureIcon size={16} color="#fff" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800">{card.culture}</p>
                      {card.detail && <p className="text-[11px] text-gray-400 mt-0.5">{card.detail}</p>}
                    </div>
                    {card.dose && (
                      <span className="shrink-0 px-3 py-1 rounded-full text-xs font-bold text-white"
                        style={{ background: pal.headerBg }}>
                        {card.dose}
                      </span>
                    )}
                  </div>
                );
              })}
              {/* Lignes texte libres */}
              {usageData.textLines.map((line, i) => (
                <div key={i} className="flex items-start gap-2 px-1">
                  <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full"
                    style={{ background: pal.subHeaderBg }} />
                  <p className="text-xs text-gray-700 leading-relaxed">{line}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Contenu onglet : Avantages ── */}
          {activeTab === "avantages" && hasAvantages && (
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {avantages.map((tag, i) => (
                  <div key={i}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                    style={{ background: pal.rowAlt, border: `1px solid ${pal.border}` }}>
                    <CheckCircle2 size={14} style={{ color: pal.subHeaderBg, flexShrink: 0 }} />
                    <span className="text-xs font-medium text-gray-700">{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}