"use client";
/**
 * LogoObtenteurUploader
 * Upload depuis le desktop (drag & drop ou clic) OU URL manuelle.
 * Affiche le logo à sa taille naturelle (sans crop, sans distorsion).
 */
import { useState, useRef, useCallback } from "react";
import { Upload, Link2, X, CheckCircle, ImageIcon, Loader2 } from "lucide-react";
import { adminUpload } from "@/lib/admin-api";

interface Props {
  value?: string | null;
  onChange: (url: string) => void;
  /** Texte affiché dans la zone de dépôt (défaut : "Glissez le logo ici…") */
  dropLabel?: string;
  /** Texte alt de la prévisualisation (défaut : "Logo obtenteur") */
  altText?: string;
  /** Libellé "prêt" affiché une fois l'upload terminé (défaut : "Logo prêt") */
  readyLabel?: string;
}

export function LogoObtenteurUploader({
  value, onChange,
  dropLabel  = "Glissez le logo ici ou",
  altText    = "Logo obtenteur",
  readyLabel = "Logo prêt",
  previewMaxWidth = 240,
  previewMaxHeight = 120,
}: Props & { previewMaxWidth?: number; previewMaxHeight?: number }) {
  const [mode,      setMode]      = useState<"file" | "url">("file");
  const [urlInput,  setUrlInput]  = useState(value ?? "");
  const [preview,   setPreview]   = useState<string | null>(value ?? null);
  const [uploading, setUploading] = useState(false);
  const [dragOver,  setDragOver]  = useState(false);
  const [err,       setErr]       = useState("");
  const [done,      setDone]      = useState(!!value);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    setErr(""); setDone(false); setUploading(true);
    try {
      const data = await adminUpload.image(file);
      const url  = data.url;
      setPreview(url);
      onChange(url);
      setDone(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const confirmUrl = () => {
    const u = urlInput.trim();
    if (!u) { setErr("URL requise"); return; }
    setPreview(u); onChange(u); setDone(true); setErr("");
  };

  const reset = () => {
    setPreview(null); setUrlInput(""); setDone(false); setErr("");
    onChange("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-2">

      {/* Toggle mode */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(["file", "url"] as const).map(m => (
          <button key={m} type="button"
            onClick={() => { setMode(m); setErr(""); }}
            className={[
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              mode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700",
            ].join(" ")}>
            {m === "file"
              ? <><Upload size={11} />Depuis l&apos;ordinateur</>
              : <><Link2  size={11} />URL</>}
          </button>
        ))}
      </div>

      {/* Zone upload fichier */}
      {mode === "file" && !preview && (
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileRef.current?.click()}
          className="relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all select-none"
          style={{
            borderColor: dragOver ? "#16a34a" : "#86efac",
            background:  dragOver ? "#f0fdf4" : "#f8fdf9",
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            className="hidden"
            onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0])}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={22} className="animate-spin text-green-600" />
              <p className="text-xs text-green-700 font-medium">Upload en cours…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "#dcfce7", border: "1px solid #86efac" }}>
                <ImageIcon size={18} className="text-green-600" />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {dropLabel}{" "}
                <span className="text-green-700 underline">cliquez pour choisir</span>
              </p>
              <p className="text-[11px] text-gray-400">PNG · SVG · JPG · WEBP — taille originale conservée</p>
            </div>
          )}
        </div>
      )}

      {/* Champ URL */}
      {mode === "url" && !preview && (
        <div className="flex gap-2">
          <input
            value={urlInput}
            onChange={e => { setUrlInput(e.target.value); setDone(false); }}
            placeholder="https://… ou /logos/nexeeds.png"
            className="flex-1 h-9 px-3 text-xs border rounded-xl focus:outline-none focus:ring-2 font-mono"
            style={{ borderColor: "#86efac" }}
          />
          <button type="button" onClick={confirmUrl}
            className="px-3 h-9 text-white text-xs font-bold rounded-xl shrink-0"
            style={{ background: "#16a34a" }}>
            OK
          </button>
        </div>
      )}

      {/* Prévisualisation — taille naturelle */}
      {preview && (
        <div className="rounded-2xl border overflow-hidden"
          style={{ borderColor: "#86efac", background: "#f0fdf4" }}>
          <div className="flex items-center justify-between px-3 py-2 border-b"
            style={{ borderColor: "#86efac", background: "#dcfce7" }}>
            <div className="flex items-center gap-1.5">
              {done && <CheckCircle size={12} className="text-green-700" />}
              <span className="text-[11px] font-bold text-green-800">
                {done ? readyLabel : "Aperçu"}
              </span>
            </div>
            <button type="button" onClick={reset}
              className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
              <X size={13} />
            </button>
          </div>
          <div className="flex items-center justify-center p-4 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={altText}
              style={{ maxWidth: previewMaxWidth, maxHeight: previewMaxHeight, width: "auto", height: "auto", display: "block" }}
              onError={() => setErr("Impossible de charger l'image")}
            />
          </div>
          <div className="px-3 py-1.5 border-t" style={{ borderColor: "#bbf7d0" }}>
            <p className="text-[10px] font-mono text-gray-400 truncate">{preview}</p>
          </div>
        </div>
      )}

      {err && (
        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">{err}</p>
      )}
    </div>
  );
}