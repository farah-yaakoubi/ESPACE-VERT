"use client";
/**
 * Liste hiérarchique de catégories pour les formulaires admin.
 *
 *  - Niveaux distingués par une couleur de la charte et une taille de texte
 *    dégressive : catégorie principale (grand, vert forêt) → sous-catégories
 *    (plus petit, teintes plus claires).
 *  - Recherche intégrée (insensible aux accents).
 *  - Mode "single" (une seule valeur, ex. catégorie parente) ou "multi"
 *    (cases à cocher, ex. parents supplémentaires).
 *
 * Exporte aussi `levelStyle(depth)`, réutilisé par l'arbre de la page
 * Catégories pour garder exactement les mêmes couleurs et tailles.
 */
import { useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LevelStyle {
  /** Couleur de la barre latérale et de l'icône */
  bar: string;
  /** Classes du nom */
  name: string;
  /** Classes du slug / texte secondaire */
  sub: string;
  /** Fond de la ligne */
  bg: string;
  /** Libellé du niveau */
  label: string;
}

const LEVELS: LevelStyle[] = [
  { bar: "#1f4d34", name: "text-lg font-bold text-[#1f4d34]",       sub: "text-xs",   bg: "bg-[#f0f5f1]", label: "Catégorie" },
  { bar: "#2f6b4a", name: "text-base font-semibold text-[#2f6b4a]", sub: "text-xs",   bg: "bg-[#f7faf8]", label: "Niveau 2" },
  { bar: "#7c8f6a", name: "text-sm font-medium text-gray-800",      sub: "text-[11px]", bg: "bg-white",   label: "Niveau 3" },
  { bar: "#c9a24a", name: "text-[13px] font-medium text-gray-600",  sub: "text-[11px]", bg: "bg-white",   label: "Niveau 4+" },
];

export function levelStyle(depth: number): LevelStyle {
  return LEVELS[Math.min(Math.max(depth, 0), LEVELS.length - 1)];
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .split("")
    .map((c) => (c.normalize("NFD").replace(/[\u0300-\u036f]/g, "") || c).charAt(0))
    .join("");
}

export interface TreeOption {
  id: number;
  nom: string;
  depth: number;
}

type Props = {
  options: TreeOption[];
  /** Texte de l'option « aucune » (mode single uniquement) */
  rootLabel?: string;
  maxHeightClass?: string;
} & (
  | { mode: "single"; value: string; onChange: (id: string) => void }
  | { mode: "multi"; value: number[]; onChange: (ids: number[]) => void }
);

export function CategoryTreeSelect(props: Props) {
  const { options, rootLabel = "Aucune (catégorie racine)", maxHeightClass = "max-h-60" } = props;
  const [query, setQuery] = useState("");

  const tokens = useMemo(() => normalize(query).split(/\s+/).filter(Boolean), [query]);
  const visible = useMemo(
    () => (tokens.length ? options.filter((o) => tokens.every((t) => normalize(o.nom).includes(t))) : options),
    [options, tokens],
  );

  const isSelected = (id: number) =>
    props.mode === "single" ? props.value === String(id) : props.value.includes(id);

  const toggle = (id: number) => {
    if (props.mode === "single") props.onChange(props.value === String(id) ? "" : String(id));
    else props.onChange(props.value.includes(id) ? props.value.filter((v) => v !== id) : [...props.value, id]);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-200 px-3">
        <Search size={16} className="shrink-0 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une catégorie…"
          className="h-11 w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" title="Effacer">
            <X size={14} />
          </button>
        )}
      </div>

      <div className={cn("overflow-y-auto overscroll-contain", maxHeightClass)}>
        {props.mode === "single" && !query && (
          <button
            type="button"
            onClick={() => props.onChange("")}
            className={cn(
              "flex w-full items-center gap-3 border-l-4 px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50",
              props.value === "" ? "border-[#1f4d34] bg-[#f0f5f1] font-semibold text-[#1f4d34]" : "border-transparent text-gray-600",
            )}
          >
            <span className="flex h-5 w-5 items-center justify-center">{props.value === "" && <Check size={16} strokeWidth={2.5} />}</span>
            {rootLabel}
          </button>
        )}

        {visible.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-500">Aucune catégorie trouvée.</p>
        ) : (
          visible.map((o) => {
            const st = levelStyle(o.depth);
            const sel = isSelected(o.id);
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => toggle(o.id)}
                className={cn(
                  "flex w-full items-center gap-3 border-l-4 py-2 pr-3 text-left transition-colors hover:bg-[#f0f5f1]",
                  sel ? "bg-[#e3eee6]" : st.bg,
                )}
                style={{ borderLeftColor: st.bar, paddingLeft: `${12 + (query ? 0 : o.depth * 18)}px` }}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center border",
                    props.mode === "multi" ? "rounded" : "rounded-full",
                    sel ? "border-[#1f4d34] bg-[#1f4d34] text-white" : "border-gray-300 bg-white",
                  )}
                >
                  {sel && <Check size={13} strokeWidth={3} />}
                </span>
                <span className={cn("min-w-0 flex-1 truncate", st.name)}>{o.nom}</span>
                <span className="hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white sm:inline" style={{ background: st.bar }}>
                  {st.label}
                </span>
              </button>
            );
          })
        )}
      </div>

      {props.mode === "multi" && props.value.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600">
          <span>{props.value.length} sélectionnée{props.value.length > 1 ? "s" : ""}</span>
          <button type="button" onClick={() => props.onChange([])} className="font-semibold text-[#1f4d34] hover:underline">
            Tout décocher
          </button>
        </div>
      )}
    </div>
  );
}