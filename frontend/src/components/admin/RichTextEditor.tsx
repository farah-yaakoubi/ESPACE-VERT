"use client";
/**
 * Éditeur de texte enrichi façon "Word" pour les champs description de
 * l'admin (gras, italique, souligné, couleur, taille et police de texte,
 * listes, alignement…). Basé sur `contentEditable` + `document.execCommand`
 * pour éviter d'ajouter une dépendance npm (type TipTap/Quill) au projet.
 *
 * La valeur manipulée est une chaîne HTML (`value` / `onChange`). Le rendu
 * public doit passer cette valeur dans le sanitizer (`@/lib/sanitize-html`)
 * avant de l'injecter via `dangerouslySetInnerHTML`.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Eraser, Palette, Type,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FONT_SIZES: { label: string; value: string }[] = [
  { label: "Petit", value: "2" },
  { label: "Normal", value: "3" },
  { label: "Moyen", value: "4" },
  { label: "Grand", value: "5" },
  { label: "Très grand", value: "6" },
];

const FONT_FAMILIES: { label: string; value: string }[] = [
  { label: "Police par défaut", value: "" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
];

const SWATCHES = [
  "#1f2937", "#dc2626", "#ea580c", "#ca8a04", "#16a34a",
  "#0891b2", "#2563eb", "#7c3aed", "#db2777", "#ffffff",
];

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

function ToolbarButton({
  onClick, active, title, children,
}: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      // onMouseDown + preventDefault : on garde la sélection de texte active
      // dans la zone éditable, sinon le clic sur le bouton la ferait perdre
      // avant que la commande ne s'applique.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
        active
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-800"
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ value, onChange, placeholder, rows = 4, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [colorOpen, setColorOpen] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!value);

  // Injecte la valeur initiale / les changements externes (ex. reset du
  // formulaire) sans écraser la frappe en cours de l'utilisateur.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== (value || "")) {
      el.innerHTML = value || "";
    }
    setIsEmpty(!value || value === "<br>");
  }, [value]);

  const emitChange = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML === "<br>" ? "" : el.innerHTML;
    setIsEmpty(!html);
    onChange(html);
  }, [onChange]);

  const exec = useCallback((command: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    emitChange();
  }, [emitChange]);

  const minHeight = `${rows * 1.6}rem`;

  return (
    <div className={cn("rounded-xl border border-gray-200 overflow-hidden bg-white", className)}>
      {/* ── Barre d'outils ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 bg-gray-50 px-2 py-1.5">
        <ToolbarButton title="Gras" onClick={() => exec("bold")}>
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton title="Italique" onClick={() => exec("italic")}>
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton title="Souligné" onClick={() => exec("underline")}>
          <Underline size={15} />
        </ToolbarButton>
        <ToolbarButton title="Barré" onClick={() => exec("strikeThrough")}>
          <Strikethrough size={15} />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-gray-200" />

        {/* Police */}
        <div className="flex items-center gap-1">
          <Type size={13} className="text-gray-400" />
          <select
            title="Police"
            defaultValue=""
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => { if (e.target.value) exec("fontName", e.target.value); e.target.value = ""; }}
            className="h-7 rounded-md border border-gray-200 bg-white px-1.5 text-xs text-gray-600 focus:outline-none"
          >
            <option value="" disabled>Police…</option>
            {FONT_FAMILIES.filter(f => f.value).map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Taille */}
        <select
          title="Taille du texte"
          defaultValue=""
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => { if (e.target.value) exec("fontSize", e.target.value); e.target.value = ""; }}
          className="h-7 rounded-md border border-gray-200 bg-white px-1.5 text-xs text-gray-600 focus:outline-none"
        >
          <option value="" disabled>Taille…</option>
          {FONT_SIZES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {/* Couleur */}
        <div className="relative">
          <ToolbarButton title="Couleur du texte" onClick={() => setColorOpen((v) => !v)}>
            <Palette size={15} />
          </ToolbarButton>
          {colorOpen && (
            <div
              className="absolute left-0 top-9 z-20 grid grid-cols-5 gap-1.5 rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
              onMouseDown={(e) => e.preventDefault()}
            >
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onClick={() => { exec("foreColor", c); setColorOpen(false); }}
                  className="h-6 w-6 rounded-full border border-gray-200"
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                title="Couleur personnalisée"
                onChange={(e) => { exec("foreColor", e.target.value); setColorOpen(false); }}
                className="col-span-5 h-7 w-full cursor-pointer rounded-md border border-gray-200"
              />
            </div>
          )}
        </div>

        <span className="mx-1 h-5 w-px bg-gray-200" />

        <ToolbarButton title="Liste à puces" onClick={() => exec("insertUnorderedList")}>
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton title="Liste numérotée" onClick={() => exec("insertOrderedList")}>
          <ListOrdered size={15} />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-gray-200" />

        <ToolbarButton title="Aligner à gauche" onClick={() => exec("justifyLeft")}>
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton title="Centrer" onClick={() => exec("justifyCenter")}>
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton title="Aligner à droite" onClick={() => exec("justifyRight")}>
          <AlignRight size={15} />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-gray-200" />

        <ToolbarButton title="Effacer la mise en forme" onClick={() => exec("removeFormat")}>
          <Eraser size={15} />
        </ToolbarButton>
      </div>

      {/* ── Zone éditable ──────────────────────────────────────────── */}
      <div className="relative">
        {isEmpty && placeholder && (
          <p className="pointer-events-none absolute left-3 top-2 text-sm text-gray-400">
            {placeholder}
          </p>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onBlur={emitChange}
          onFocus={() => setColorOpen(false)}
          style={{ minHeight }}
          className="w-full resize-y overflow-auto px-3 py-2 text-sm leading-relaxed text-gray-800 focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
        />
      </div>
    </div>
  );
}