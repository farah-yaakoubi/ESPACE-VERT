
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import type { CategorieAdmin } from "@/lib/admin-api";
import type { CatNodeFlat } from "@/lib/admin-catalog-utils";
import { cn } from "@/lib/utils";
import { levelStyle } from "@/components/admin/Categorytreeselect";

const ACCENT = "#1f4d34";

interface Entry {
  key: string;
  id: string;
  nom: string;
  path: string[];
  group: string;
  marque?: string;
  activite?: string;
  extra: boolean;
  norm: string;
  normNom: string;
}

type Row =
  | { type: "group"; label: string; key: string; path: string[] }
  | { type: "item"; entry: Entry; idx: number };

/* ── Utilitaires de texte ───────────────────────────────────────── */

/** Minuscule + sans accents, en conservant exactement la longueur du texte
 *  (nécessaire pour surligner au bon endroit dans le texte d'origine). */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .split("")
    .map((c) => {
      const n = c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return n ? n.charAt(0) : c;
    })
    .join("");
}

function Highlight({ text, tokens }: { text: string; tokens: string[] }) {
  if (tokens.length === 0) return <>{text}</>;
  const norm = normalize(text);
  const mask = new Array<boolean>(text.length).fill(false);
  tokens.forEach((t) => {
    let from = 0;
    while (t && (from = norm.indexOf(t, from)) !== -1) {
      for (let i = from; i < from + t.length; i++) mask[i] = true;
      from += t.length;
    }
  });
  const parts: { s: string; on: boolean }[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = parts[parts.length - 1];
    if (last && last.on === mask[i]) last.s += text[i];
    else parts.push({ s: text[i], on: mask[i] });
  }
  return (
    <>
      {parts.map((p, i) =>
        p.on ? (
          <mark key={i} className="rounded-[3px] bg-[#f3e6b8] px-0 text-inherit">{p.s}</mark>
        ) : (
          <span key={i}>{p.s}</span>
        ),
      )}
    </>
  );
}

/* ── Construction des entrées (chemin, marque, activité) ────────── */

function buildEntries(options: CatNodeFlat[], all: CategorieAdmin[]): Entry[] {
  const byId = new Map(all.map((c) => [c.id_categorie, c]));

  const ancestors = (startParentId: number | null): CategorieAdmin[] => {
    const chain: CategorieAdmin[] = [];
    const seen = new Set<number>();
    let id = startParentId;
    while (id != null && byId.has(id) && !seen.has(id)) {
      seen.add(id);
      const n = byId.get(id)!;
      chain.unshift(n);
      id = n.parent_id ?? null;
    }
    return chain;
  };

  return options.map((o) => {
    const extraMatch = /-extra-(\d+)$/.exec(o.optionKey ?? "");
    const extra = !!o.isExtraLink && !!extraMatch;
    const startParent = extra ? Number(extraMatch![1]) : o.parent_id ?? null;
    const chain = ancestors(startParent);

    // Marque / activité : celle de la catégorie, sinon la plus proche héritée.
    let marque = o.marque?.nom;
    let activite = o.activite?.nom;
    for (let i = chain.length - 1; i >= 0 && (!marque || !activite); i--) {
      marque ??= chain[i].marque?.nom;
      activite ??= chain[i].activite?.nom;
    }

    const path = chain.map((c) => c.nom);
    return {
      key: o.optionKey ?? String(o.id_categorie),
      id: String(o.id_categorie),
      nom: o.nom,
      path,
      group: path.length ? path.join(" › ") : "Catégories principales",
      marque,
      activite,
      extra,
      norm: normalize([o.nom, ...path, marque ?? "", activite ?? ""].join(" ")),
      normNom: normalize(o.nom),
    };
  });
}

/* ── Composant ──────────────────────────────────────────────────── */

export function CategoryPicker({
  value,
  onChange,
  options,
  allCategories,
  placeholder = "Rechercher ou choisir une catégorie…",
  inline = false,
}: {
  value: string;
  onChange: (id: string) => void;
  /** Catégories sélectionnables, aplaties dans l'ordre de l'arborescence */
  options: CatNodeFlat[];
  /** Toutes les catégories (sert à reconstituer le fil d'Ariane) */
  allCategories: CategorieAdmin[];
  placeholder?: string;
  /** true : la liste s'affiche dans le flux (utile dans une modale scrollable) */
  inline?: boolean;
}) {
  const uid = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const entries = useMemo(() => buildEntries(options, allCategories), [options, allCategories]);

  const tokens = useMemo(() => normalize(query).split(/\s+/).filter(Boolean), [query]);

  const filtered = useMemo(() => {
    if (tokens.length === 0) return entries;
    const first = tokens[0];
    return entries
      .map((e, i) => ({ e, i }))
      .filter(({ e }) => tokens.every((t) => e.norm.includes(t)))
      .sort((a, b) => {
        const rank = (x: Entry) => (x.normNom.startsWith(first) ? 0 : x.normNom.includes(first) ? 1 : 2);
        return rank(a.e) - rank(b.e) || a.i - b.i;
      })
      .map(({ e }) => e);
  }, [entries, tokens]);

  // Lignes affichées : en-têtes de groupe (hors recherche) + items.
  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    let idx = 0;
    if (tokens.length > 0) {
      filtered.forEach((entry) => out.push({ type: "item", entry, idx: idx++ }));
      return out;
    }
    let lastGroup = "";
    filtered.forEach((entry) => {
      if (entry.group !== lastGroup) {
        lastGroup = entry.group;
        out.push({ type: "group", label: entry.group, key: `g-${out.length}-${entry.group}`, path: entry.path });
      }
      out.push({ type: "item", entry, idx: idx++ });
    });
    return out;
  }, [filtered, tokens.length]);

  const selected = useMemo(() => {
    if (!value) return null;
    const found = entries.find((e) => e.id === value);
    if (found) return found;
    const raw = allCategories.find((c) => String(c.id_categorie) === value);
    return raw
      ? ({ key: value, id: value, nom: raw.nom, path: [], group: "", extra: false, norm: "", normNom: "" } as Entry)
      : null;
  }, [value, entries, allCategories]);

  /* Fermeture au clic extérieur */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  /* À l'ouverture : focus sur la recherche, curseur sur l'élément choisi */
  useEffect(() => {
    if (!open) return;
    setQuery("");
    const i = entries.findIndex((e) => e.id === value);
    setActive(i >= 0 ? i : 0);
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => { setActive(0); }, [query]);

  /* Garde l'élément actif visible */
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open, rows]);

  const choose = (entry: Entry) => {
    onChange(entry.id);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) choose(filtered[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  const listId = `${uid}-list`;

  const panel = (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-gray-200 bg-white",
        inline ? "mt-2" : "absolute left-0 right-0 top-full z-30 mt-1.5 shadow-[0_12px_32px_-8px_rgba(17,24,39,0.18)]",
      )}
    >
      {/* Recherche */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-3">
        <Search size={15} className="shrink-0 text-gray-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Tapez pour filtrer (nom, parent, marque…)"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          className="h-12 w-full bg-transparent text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            title="Effacer la recherche"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Liste */}
      <div ref={listRef} id={listId} role="listbox" className="max-h-[26rem] overflow-y-auto overscroll-contain py-1">
        {rows.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm font-medium text-gray-700">Aucune catégorie trouvée</p>
            <p className="mt-1 text-xs text-gray-400">
              {query ? <>Aucun résultat pour « {query} ».</> : "Aucune catégorie disponible."}
            </p>
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-3 text-xs font-semibold hover:underline"
                style={{ color: ACCENT }}
              >
                Réinitialiser la recherche
              </button>
            )}
          </div>
        ) : (
          rows.map((row) => {
            if (row.type === "group") {
              const hdr = row.path.length ? row.path : [row.label];
              return (
                <div
                  key={row.key}
                  className="sticky top-0 z-[1] flex flex-wrap items-center gap-x-2 gap-y-0.5 border-y border-[#c3d6c9] bg-[#e3eee6] px-3 py-2.5"
                  style={{ borderLeft: `5px solid ${levelStyle(Math.max(hdr.length - 1, 0)).bar}` }}
                >
                  {hdr.map((seg, i) => (
                    <span key={i} className="inline-flex items-center gap-2">
                      {i > 0 && <span className="text-gray-400">›</span>}
                      <span
                        className={cn(i === hdr.length - 1 ? "text-base font-bold" : "text-sm font-semibold")}
                        style={{ color: levelStyle(i).bar }}
                      >
                        {seg}
                      </span>
                    </span>
                  ))}
                </div>
              );
            }
            const { entry, idx } = row;
            const isSel = entry.id === value;
            const isActive = idx === active;
            return (
              <button
                key={entry.key}
                type="button"
                role="option"
                aria-selected={isSel}
                data-idx={idx}
                onMouseEnter={() => setActive(idx)}
                onClick={() => choose(entry)}
                className={cn(
                  "flex w-full items-center gap-3 border-l-[5px] py-2.5 pl-6 pr-3 text-left transition-colors",
                  isSel ? "bg-[#dcebe1]" : isActive ? "bg-[#f0f5f1]" : "bg-white",
                )}
                style={{ borderLeftColor: levelStyle(entry.path.length).bar }}
              >
                <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", isSel ? "border-[#1f4d34] bg-[#1f4d34] text-white" : "border-gray-300 bg-white")}>
                  {isSel && <Check size={13} strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-[15px]", isSel ? "font-bold text-[#1f4d34]" : "font-medium text-gray-900")}>
                    <Highlight text={entry.nom} tokens={tokens} />
                    {entry.extra && (
                      <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 align-middle text-[10px] font-medium text-gray-500">
                        lien
                      </span>
                    )}
                  </span>
                  {tokens.length > 0 && entry.path.length > 0 && (
                    <span className="mt-0.5 block truncate text-xs text-gray-600">
                      <Highlight text={entry.path.join(" › ")} tokens={tokens} />
                    </span>
                  )}
                </span>
                {(entry.activite || entry.marque) && (
                  <span className="hidden shrink-0 items-center gap-1.5 sm:flex">
                    {entry.activite && (
                      <span className="max-w-[150px] truncate rounded-full border border-[#e8dcb6] bg-[#faf6e9] px-2.5 py-1 text-xs font-semibold text-[#6b5518]">
                        {entry.activite}
                      </span>
                    )}
                    {entry.marque && (
                      <span className="max-w-[150px] truncate rounded-full bg-[#dcebe1] px-2.5 py-1 text-xs font-semibold" style={{ color: ACCENT }}>
                        {entry.marque}
                      </span>
                    )}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Pied */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
        <span>
          {filtered.length} catégorie{filtered.length !== 1 ? "s" : ""}
          {tokens.length > 0 && entries.length !== filtered.length ? ` sur ${entries.length}` : ""}
        </span>
        <span className="hidden sm:inline">↑ ↓ naviguer · Entrée choisir · Échap fermer</span>
      </div>
    </div>
  );

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            "flex min-h-[52px] w-full items-center rounded-lg border bg-white py-1.5 pl-3 text-left transition",
            selected ? "pr-16" : "pr-9",
            open
              ? "border-[#1f4d34] ring-2 ring-[#1f4d34]/20"
              : "border-gray-300 hover:border-gray-400",
          )}
        >
          {selected ? (
            <span className="min-w-0">
              <span className="block truncate text-base font-semibold text-[#1f4d34]">{selected.nom}</span>
              {selected.path.length > 0 && (
                <span className="block truncate text-xs text-gray-600">{selected.path.join(" › ")}</span>
              )}
            </span>
          ) : (
            <span className="truncate text-sm text-gray-400">{placeholder}</span>
          )}
        </button>

        {selected && (
          <button
            type="button"
            onClick={() => onChange("")}
            title="Retirer la catégorie"
            className="absolute right-8 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={14} />
          </button>
        )}
        <ChevronDown
          size={16}
          className={cn(
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </div>

      {open && panel}
    </div>
  );
}