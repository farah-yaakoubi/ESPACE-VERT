"use client";
import {
  Barcode, Scale, Leaf, FlaskConical, Target, Package,
  Sprout, Zap, TestTube, Globe, Waves, CheckCircle2,
} from "lucide-react";

interface TechTableProps {
  sku?: string | null;
  poids?: string | null;
  nature?: string | null;
  composition_chimique?: string | null;
  usage?: string | null;
  biologique?: boolean | null;
  conditionnement?: string | null;
  slug?: string;
  categorie?: string | null;
}

/* ── Palettes couleurs par famille ──────────────────────────────── */
type Palette = {
  headerBg: string;
  headerText: string;
  subHeaderBg: string;
  subHeaderText: string;
  rowAlt: string;
  border: string;
  metaBg: string;
  FamilyIcon: React.ElementType;
  famille: string;
};

const PALETTES: Record<string, Palette> = {
  organique: {
    headerBg:      "#1b5e20",
    headerText:    "#ffffff",
    subHeaderBg:   "#2e7d32",
    subHeaderText: "#e8f5e9",
    rowAlt:        "#f1f8e9",
    border:        "#c8e6c9",
    metaBg:        "#f9fdf9",
    FamilyIcon:    Sprout,
    famille:       "Engrais Organique",
  },
  biostimulant: {
    headerBg:      "#bf360c",
    headerText:    "#ffffff",
    subHeaderBg:   "#e64a19",
    subHeaderText: "#fbe9e7",
    rowAlt:        "#fff3e0",
    border:        "#ffccbc",
    metaBg:        "#fffaf8",
    FamilyIcon:    Zap,
    famille:       "Biostimulant",
  },
  carence: {
    headerBg:      "#b71c1c",
    headerText:    "#ffffff",
    subHeaderBg:   "#c62828",
    subHeaderText: "#ffebee",
    rowAlt:        "#fce4ec",
    border:        "#ef9a9a",
    metaBg:        "#fff8f8",
    FamilyIcon:    TestTube,
    famille:       "Correcteur de Carences",
  },
  sol: {
    headerBg:      "#4a148c",
    headerText:    "#ffffff",
    subHeaderBg:   "#6a1b9a",
    subHeaderText: "#f3e5f5",
    rowAlt:        "#ede7f6",
    border:        "#ce93d8",
    metaBg:        "#fdf8ff",
    FamilyIcon:    Globe,
    famille:       "Gestion du Sol",
  },
  algue: {
    headerBg:      "#01579b",
    headerText:    "#ffffff",
    subHeaderBg:   "#0277bd",
    subHeaderText: "#e1f5fe",
    rowAlt:        "#e3f2fd",
    border:        "#90caf9",
    metaBg:        "#f8fcff",
    FamilyIcon:    Waves,
    famille:       "Extrait d'Algue",
  },
  default: {
    headerBg:      "#1b5e38",
    headerText:    "#ffffff",
    subHeaderBg:   "#2e7d4f",
    subHeaderText: "#e8f5ee",
    rowAlt:        "#f0faf4",
    border:        "#a8d5b8",
    metaBg:        "#f8fdf9",
    FamilyIcon:    Leaf,
    famille:       "Fertilisant",
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

function parseComposition(raw: string): { label: string; value: string }[] {
  return raw.split("\n").map(l => l.trim()).filter(Boolean).map(line => {
    const dashMatch = line.match(/^(.+?)\s[—\-]\s(.+)$/);
    if (dashMatch) return { label: dashMatch[1].trim(), value: dashMatch[2].trim() };
    const idx = line.lastIndexOf(":");
    if (idx < 0) return { label: line, value: "" };
    return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
  });
}

function parseUsage(raw: string): { tableLines: string[][]; textLines: string[] } {
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  return {
    tableLines: lines.filter(l => l.includes("|")).map(l => l.split("|").map(c => c.trim())),
    textLines:  lines.filter(l => !l.includes("|")),
  };
}

export function ProduitTechTable({ sku, poids, nature, composition_chimique, usage, biologique, conditionnement, slug, categorie }: TechTableProps) {
  const hasData = !!(sku || poids || nature || composition_chimique || usage || conditionnement || biologique != null);
  if (!hasData) return null;

  const pal = getPalette(slug, nature, categorie);
  const { FamilyIcon } = pal;
  const compRows = composition_chimique ? parseComposition(composition_chimique) : [];

  return (
    <div className="rounded-2xl overflow-hidden border bg-white" style={{ borderColor: pal.border, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

      {/* ── Header famille ── */}
      <div className="flex items-center justify-between px-5 py-3.5" style={{ background: pal.headerBg }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
            <FamilyIcon size={16} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.65)" }}>{pal.famille}</p>
            {nature && <p className="text-sm font-bold leading-tight" style={{ color: "#fff" }}>{nature}</p>}
          </div>
        </div>
        {biologique && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(255,255,255,0.18)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
            <CheckCircle2 size={12} />
            100% Biologique
          </div>
        )}
      </div>

      {/* ── Méta : SKU / Poids / Conditionnement ── */}
      {(sku || poids || conditionnement) && (
        <div className="grid divide-x" style={{
          gridTemplateColumns: [sku, poids, conditionnement].filter(Boolean).length === 3 ? "1fr 1fr 1fr" : [sku, poids, conditionnement].filter(Boolean).length === 2 ? "1fr 1fr" : "1fr",
          borderBottom: `1px solid ${pal.border}`,
          background: pal.metaBg,
          divideColor: pal.border,
        }}>
          {[
            { Icon: Barcode,  label: "Référence",       value: sku },
            { Icon: Scale,    label: "Poids / Volume",   value: poids },
            { Icon: Package,  label: "Conditionnement",  value: conditionnement },
          ].filter(({ value }) => value).map(({ Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3" style={{ borderColor: pal.border }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: pal.rowAlt, border: `1px solid ${pal.border}` }}>
                <Icon size={13} style={{ color: pal.subHeaderBg }} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>{label}</p>
                <p className="text-xs font-bold text-gray-800 mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tableau Composition ── */}
      {compRows.length > 0 && (
        <div>
          <div className="flex items-center gap-2.5 px-4 py-2.5" style={{ background: pal.subHeaderBg }}>
            <FlaskConical size={13} color={pal.subHeaderText} strokeWidth={2} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: pal.subHeaderText }}>Composition</span>
          </div>
          <table className="w-full">
            <tbody>
              {compRows.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? pal.rowAlt : "#fff", borderBottom: `1px solid ${pal.border}` }}>
                  <td className="px-4 py-2.5 text-xs font-medium text-gray-700 w-[60%]" style={{ borderRight: `1px solid ${pal.border}` }}>
                    {row.label}
                  </td>
                  <td className="px-4 py-2.5 text-xs font-bold text-right tabular-nums" style={{ color: pal.headerBg }}>
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Mode d'emploi ── */}
      {usage && (() => {
        const { tableLines, textLines } = parseUsage(usage);
        return (
          <div style={{ borderTop: `1px solid ${pal.border}` }}>
            <div className="flex items-center gap-2.5 px-4 py-2.5" style={{ background: pal.subHeaderBg }}>
              <Target size={13} color={pal.subHeaderText} strokeWidth={2} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: pal.subHeaderText }}>Mode d&apos;emploi</span>
            </div>
            {textLines.length > 0 && (
              <div className="px-4 py-3 space-y-1.5" style={{ background: pal.metaBg }}>
                {textLines.map((line, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: pal.subHeaderBg, marginTop: "5px" }} />
                    <p className="text-xs text-gray-700 leading-relaxed">{line.replace(/^[•\-]\s*/, "")}</p>
                  </div>
                ))}
              </div>
            )}
            {tableLines.length > 0 && (
              <div className="px-4 pb-4 pt-2">
                <table className="w-full rounded-xl overflow-hidden" style={{ border: `1px solid ${pal.border}` }}>
                  <thead>
                    <tr style={{ background: pal.rowAlt }}>
                      {["Culture", "Foliaire", "En irrigation"].slice(0, tableLines[0]?.length ?? 3).map(h => (
                        <th key={h} className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: pal.headerBg, borderBottom: `1px solid ${pal.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableLines.map((row, ri) => (
                      <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : pal.rowAlt, borderTop: `1px solid ${pal.border}` }}>
                        {row.map((cell, ci) => (
                          <td key={ci} className={`px-3 py-2 text-xs ${ci === 0 ? "font-semibold" : "text-gray-600"}`} style={{ color: ci === 0 ? pal.headerBg : undefined }}>
                            {cell || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
