"use client";
/**
 * Éditeur de texte enrichi pour les champs description de l'admin (gras,
 * italique, souligné, couleur, taille et police, listes, alignement…).
 * Basé sur `contentEditable` + `document.execCommand` pour ne pas ajouter de
 * dépendance (TipTap/Quill) au projet.
 *
 * Points d'attention :
 *  - Le collage se fait TOUJOURS en texte brut : on ne récupère ni les
 *    cadres, ni les arrière-plans, ni les polices du site ou du document
 *    d'origine. Le texte prend la mise en forme de l'éditeur.
 *  - Toute propriété de « cadre » (background, border, box-shadow, outline)
 *    qui s'introduirait malgré tout (glisser-déposer…) est retirée.
 *  - La palette de couleurs est modifiable : saisie d'un code hexadécimal,
 *    ajout / suppression de couleurs, réinitialisation. Elle est mémorisée
 *    dans le navigateur.
 *
 * La valeur manipulée est une chaîne HTML (`value` / `onChange`). Le rendu
 * public doit passer cette valeur dans le sanitizer (`@/lib/sanitize-html`)
 * avant de l'injecter via `dangerouslySetInnerHTML`.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Eraser, Palette, Type, Plus, RotateCcw, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT = "#1f4d34";

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

/** Palette par défaut : charte Espace Vert + couleurs de texte sobres. */
const DEFAULT_PALETTE = [
  "#1b2118", "#1f4d34", "#7c8f6a", "#c9a24a",
  "#374151", "#6b7280", "#b42318", "#c2570c",
  "#0f766e", "#1d4ed8", "#6d28d9", "#ffffff",
];

const PALETTE_STORAGE_KEY = "ev_admin_color_palette";
const MAX_COLORS = 24;

/** Accepte #abc, abc, #aabbcc, aabbcc → "#aabbcc" (ou null si invalide). */
function normalizeHex(input: string): string | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input.trim());
  if (!m) return null;
  let h = m[1].toLowerCase();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return `#${h}`;
}

function loadPalette(): string[] {
  try {
    const raw = localStorage.getItem(PALETTE_STORAGE_KEY);
    if (!raw) return DEFAULT_PALETTE;
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return DEFAULT_PALETTE;
    const clean = arr.map((c) => (typeof c === "string" ? normalizeHex(c) : null)).filter((c): c is string => !!c);
    return clean.length ? clean.slice(0, MAX_COLORS) : DEFAULT_PALETTE;
  } catch {
    return DEFAULT_PALETTE;
  }
}

function savePalette(p: string[]) {
  try { localStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify(p)); } catch { /* stockage indisponible */ }
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Retire les propriétés qui dessinent un « cadre » autour du texte. */
const FRAME_PROPS = [
  "background", "background-color", "background-image",
  "border", "border-top", "border-right", "border-bottom", "border-left", "border-radius",
  "box-shadow", "outline",
];
function stripFrames(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[style]").forEach((n) => {
    FRAME_PROPS.forEach((p) => n.style.removeProperty(p));
    if (!n.getAttribute("style")?.trim()) n.removeAttribute("style");
  });
  root.querySelectorAll("[bgcolor]").forEach((n) => n.removeAttribute("bgcolor"));
}

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
        "inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors",
        active
          ? "border-[#c3d6c9] bg-[#f0f5f1] text-[#1f4d34]"
          : "border-transparent text-gray-500 hover:bg-gray-200/60 hover:text-gray-900",
      )}
    >
      {children}
    </button>
  );
}

const Sep = () => <span className="mx-1 h-5 w-px bg-gray-300/70" />;

export function RichTextEditor({ value, onChange, placeholder, rows = 4, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const lastEmitted = useRef<string | null>(null);

  const [isEmpty, setIsEmpty] = useState(!value);

  // Palette de couleurs (modifiable)
  const [colorOpen, setColorOpen] = useState(false);
  const [palette, setPalette] = useState<string[]>(DEFAULT_PALETTE);
  const [hexInput, setHexInput] = useState("");
  const [lastColor, setLastColor] = useState<string>(ACCENT);
  const colorWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setPalette(loadPalette()); }, []);

  // Injecte la valeur initiale / les changements externes (ex. reset du
  // formulaire) sans toucher au DOM — donc sans déplacer le curseur — quand
  // la valeur vient de la frappe en cours.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (value !== lastEmitted.current && el.innerHTML !== (value || "")) {
      el.innerHTML = value || "";
    }
    setIsEmpty(!value || value === "<br>");
  }, [value]);

  // Ferme la palette au clic à l'extérieur
  useEffect(() => {
    if (!colorOpen) return;
    const onDown = (e: MouseEvent) => {
      if (colorWrapRef.current && !colorWrapRef.current.contains(e.target as Node)) setColorOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [colorOpen]);

  const emitChange = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    stripFrames(el);
    const html = el.innerHTML === "<br>" ? "" : el.innerHTML;
    lastEmitted.current = html;
    setIsEmpty(!html);
    onChange(html);
  }, [onChange]);

  /* Mémorise / restaure la sélection : indispensable quand on clique dans un
     champ de la barre d'outils (code couleur, liste déroulante) qui vole le
     focus à la zone éditable. */
  const rememberSelection = () => {
    const sel = window.getSelection();
    const el = editorRef.current;
    if (sel && sel.rangeCount > 0 && el && el.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  };
  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const exec = useCallback((command: string, arg?: string) => {
    const el = editorRef.current;
    if (!el) return;
    if (document.activeElement !== el) {
      el.focus();
      restoreSelection();
    }
    document.execCommand(command, false, arg);
    rememberSelection();
    emitChange();
  }, [emitChange]);

  /* ── Collage en texte brut ───────────────────────────────────────── */
  const insertPlainText = (text: string) => {
    const html = escapeHtml(text.replace(/\r\n?/g, "\n")).replace(/\n/g, "<br>");
    document.execCommand("insertHTML", false, html);
    emitChange();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    if (text) insertPlainText(text);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const text = e.dataTransfer.getData("text/plain");
    if (!text) return;
    e.preventDefault();
    // Positionne le curseur à l'endroit du dépôt avant d'insérer le texte brut
    const doc = document as Document & {
      caretRangeFromPoint?: (x: number, y: number) => Range | null;
    };
    const range = doc.caretRangeFromPoint?.(e.clientX, e.clientY);
    if (range) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    insertPlainText(text);
  };

  /* ── Effacer la mise en forme (y compris cadres / fonds) ─────────── */
  const clearFormatting = () => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    restoreSelection();
    document.execCommand("removeFormat", false);
    el.querySelectorAll<HTMLElement>("[style]").forEach((n) => n.removeAttribute("style"));
    el.querySelectorAll("font").forEach((n) => {
      n.removeAttribute("face"); n.removeAttribute("size"); n.removeAttribute("color");
    });
    emitChange();
  };

  /* ── Palette ─────────────────────────────────────────────────────── */
  const applyColor = (hex: string) => {
    exec("foreColor", hex);
    setLastColor(hex);
    setHexInput(hex);
  };

  const hexValid = normalizeHex(hexInput);

  const addToPalette = () => {
    if (!hexValid) return;
    setPalette((prev) => {
      if (prev.includes(hexValid) || prev.length >= MAX_COLORS) return prev;
      const next = [...prev, hexValid];
      savePalette(next);
      return next;
    });
  };

  const removeFromPalette = (hex: string) => {
    setPalette((prev) => {
      const next = prev.filter((c) => c !== hex);
      savePalette(next);
      return next;
    });
  };

  const resetPalette = () => {
    setPalette(DEFAULT_PALETTE);
    savePalette(DEFAULT_PALETTE);
  };

  const minHeight = `${rows * 1.6}rem`;

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-300 bg-white transition focus-within:border-[#1f4d34] focus-within:ring-2 focus-within:ring-[#1f4d34]/20",
        className,
      )}
    >
      {/* ── Barre d'outils ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        <ToolbarButton title="Gras" onClick={() => exec("bold")}><Bold size={15} /></ToolbarButton>
        <ToolbarButton title="Italique" onClick={() => exec("italic")}><Italic size={15} /></ToolbarButton>
        <ToolbarButton title="Souligné" onClick={() => exec("underline")}><Underline size={15} /></ToolbarButton>
        <ToolbarButton title="Barré" onClick={() => exec("strikeThrough")}><Strikethrough size={15} /></ToolbarButton>

        <Sep />

        {/* Police */}
        <div className="flex items-center gap-1">
          <Type size={13} className="text-gray-400" />
          <select
            title="Police"
            defaultValue=""
            onMouseDown={(e) => { rememberSelection(); e.stopPropagation(); }}
            onChange={(e) => { if (e.target.value) exec("fontName", e.target.value); e.target.value = ""; }}
            className="h-7 rounded-md border border-gray-300 bg-white px-1.5 text-xs text-gray-700 focus:border-[#1f4d34] focus:outline-none"
          >
            <option value="" disabled>Police…</option>
            {FONT_FAMILIES.filter((f) => f.value).map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Taille */}
        <select
          title="Taille du texte"
          defaultValue=""
          onMouseDown={(e) => { rememberSelection(); e.stopPropagation(); }}
          onChange={(e) => { if (e.target.value) exec("fontSize", e.target.value); e.target.value = ""; }}
          className="h-7 rounded-md border border-gray-300 bg-white px-1.5 text-xs text-gray-700 focus:border-[#1f4d34] focus:outline-none"
        >
          <option value="" disabled>Taille…</option>
          {FONT_SIZES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {/* Couleur */}
        <div className="relative" ref={colorWrapRef}>
          <button
            type="button"
            title="Couleur du texte"
            onMouseDown={(e) => { e.preventDefault(); rememberSelection(); }}
            onClick={() => { setColorOpen((v) => !v); setHexInput((h) => h || lastColor); }}
            className={cn(
              "inline-flex h-8 items-center gap-1 rounded-md border px-1.5 transition-colors",
              colorOpen
                ? "border-[#c3d6c9] bg-[#f0f5f1] text-[#1f4d34]"
                : "border-transparent text-gray-500 hover:bg-gray-200/60 hover:text-gray-900",
            )}
          >
            <Palette size={15} />
            <span className="h-1 w-3.5 rounded-full ring-1 ring-black/10" style={{ backgroundColor: lastColor }} />
          </button>

          {colorOpen && (
            <div className="absolute left-0 top-10 z-30 w-[260px] rounded-xl border border-gray-200 bg-white p-3 shadow-[0_12px_32px_-8px_rgba(17,24,39,0.22)]">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Palette</p>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={resetPalette}
                  title="Rétablir la palette par défaut"
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                  <RotateCcw size={11} /> Réinitialiser
                </button>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {palette.map((c) => (
                  <div key={c} className="group relative">
                    <button
                      type="button"
                      title={c}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyColor(c)}
                      className={cn(
                        "h-8 w-8 rounded-md ring-1 ring-black/10 transition hover:scale-105",
                        lastColor === c && "ring-2 ring-offset-1 ring-[#1f4d34]",
                      )}
                      style={{ backgroundColor: c }}
                    />
                    <button
                      type="button"
                      title="Retirer de la palette"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => removeFromPalette(c)}
                      className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-gray-800 text-white group-hover:flex"
                    >
                      <X size={9} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 border-t border-gray-100 pt-3">
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Code couleur
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    title="Choisir une couleur"
                    value={hexValid ?? "#000000"}
                    onMouseDown={rememberSelection}
                    onChange={(e) => setHexInput(e.target.value)}
                    className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-gray-300 bg-white p-0.5"
                  />
                  <input
                    value={hexInput}
                    onMouseDown={rememberSelection}
                    onChange={(e) => setHexInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && hexValid) { e.preventDefault(); applyColor(hexValid); } }}
                    placeholder="#1f4d34"
                    spellCheck={false}
                    maxLength={7}
                    className={cn(
                      "h-8 min-w-0 flex-1 rounded-md border px-2 font-mono text-xs uppercase text-gray-800 focus:outline-none focus:ring-2",
                      hexInput && !hexValid
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:border-[#1f4d34] focus:ring-[#1f4d34]/20",
                    )}
                  />
                </div>
                <div className="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    disabled={!hexValid}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => hexValid && applyColor(hexValid)}
                    className="h-8 flex-1 rounded-md bg-[#1f4d34] text-xs font-semibold text-white hover:bg-[#173b28] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Appliquer
                  </button>
                  <button
                    type="button"
                    disabled={!hexValid || palette.includes(hexValid) || palette.length >= MAX_COLORS}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={addToPalette}
                    title="Ajouter ce code à la palette"
                    className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-md border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus size={12} /> Ajouter
                  </button>
                </div>
                {hexInput && !hexValid && (
                  <p className="mt-1.5 text-[11px] text-red-600">Code invalide — exemple : #1f4d34</p>
                )}
              </div>
            </div>
          )}
        </div>

        <Sep />

        <ToolbarButton title="Liste à puces" onClick={() => exec("insertUnorderedList")}><List size={15} /></ToolbarButton>
        <ToolbarButton title="Liste numérotée" onClick={() => exec("insertOrderedList")}><ListOrdered size={15} /></ToolbarButton>

        <Sep />

        <ToolbarButton title="Aligner à gauche" onClick={() => exec("justifyLeft")}><AlignLeft size={15} /></ToolbarButton>
        <ToolbarButton title="Centrer" onClick={() => exec("justifyCenter")}><AlignCenter size={15} /></ToolbarButton>
        <ToolbarButton title="Aligner à droite" onClick={() => exec("justifyRight")}><AlignRight size={15} /></ToolbarButton>

        <Sep />

        <ToolbarButton title="Effacer la mise en forme (couleurs, cadres, polices)" onClick={clearFormatting}>
          <Eraser size={15} />
        </ToolbarButton>
      </div>

      {/* ── Zone éditable ──────────────────────────────────────────── */}
      <div className="relative">
        {isEmpty && placeholder && (
          <p className="pointer-events-none absolute left-3 top-2 text-sm text-gray-400">{placeholder}</p>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onBlur={() => { rememberSelection(); emitChange(); }}
          onKeyUp={rememberSelection}
          onMouseUp={rememberSelection}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onFocus={() => setColorOpen(false)}
          style={{ minHeight }}
          className={cn(
            "w-full resize-y overflow-auto rounded-b-lg px-3 py-2 text-sm leading-relaxed text-gray-900 focus:outline-none",
            "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
            // Neutralise tout cadre / fond hérité d'un ancien collage
            "[&_*]:!bg-transparent [&_*]:!border-0 [&_*]:!shadow-none [&_*]:!outline-none [&_*]:!rounded-none",
          )}
        />
      </div>
    </div>
  );
}