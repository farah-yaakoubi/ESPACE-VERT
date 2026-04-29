"use client";
import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, Link2, X, Image as ImageIcon, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface Props {
  onUpload: (url: string) => void;
  accept?:  string;
  label?:   string;
}

type Mode = "url" | "file";

export function ImageUploader({ onUpload, accept = "image/*" }: Props) {
  const [mode,      setMode]      = useState<Mode>("url");
  const [url,       setUrl]       = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview,   setPreview]   = useState<string | null>(null);
  const [err,       setErr]       = useState("");
  const [done,      setDone]      = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("ev_admin_token") ?? "" : "";

  const handleFile = useCallback(async (file: File) => {
    setErr(""); setDone(false); setUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`${BASE}/admin/upload/image`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body:    form,
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? "Erreur upload"); }
      const data   = await res.json();
      const fileUrl = data.data?.url ?? data.url;
      setPreview(fileUrl); onUpload(fileUrl); setDone(true);
    } catch (e) { setErr((e as Error).message); }
    finally { setUploading(false); }
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleUrlConfirm = () => {
    if (!url.trim()) { setErr("URL requise"); return; }
    setPreview(url.trim()); onUpload(url.trim()); setDone(true); setErr("");
  };

  const reset = () => { setUrl(""); setPreview(null); setDone(false); setErr(""); };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(["url", "file"] as Mode[]).map(m => (
          <button key={m} type="button" onClick={() => { setMode(m); reset(); }}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              mode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
            {m === "url" ? <><Link2 size={12} />URL</> : <><Upload size={12} />Fichier local</>}
          </button>
        ))}
      </div>

      {mode === "url" && (
        <div className="flex gap-2">
          <input value={url} onChange={e => { setUrl(e.target.value); setDone(false); }}
            placeholder="https://example.com/image.jpg"
            className="flex-1 h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500" />
          <button type="button" onClick={handleUrlConfirm}
            className="px-3 h-9 bg-ev-700 text-white text-xs font-semibold rounded-xl hover:bg-ev-800 shrink-0">Valider</button>
        </div>
      )}

      {mode === "file" && (
        <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className={cn("border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all",
            uploading ? "border-ev-400 bg-ev-50" : "border-gray-200 hover:border-ev-400 hover:bg-ev-50/50")}>
          <input ref={fileRef} type="file" accept={accept} className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-ev-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-ev-600 font-medium">Upload en cours…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-ev-50 border border-ev-100 flex items-center justify-center">
                <ImageIcon size={16} className="text-ev-500" />
              </div>
              <p className="text-sm font-medium text-gray-700">Glissez ou cliquez pour choisir</p>
              <p className="text-xs text-gray-400">JPG, PNG, WEBP, GIF · max 8 Mo</p>
            </div>
          )}
        </div>
      )}

      {preview && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-gray-200 shrink-0">
            <Image src={preview} alt="Aperçu" width={48} height={48} className="w-full h-full object-contain" onError={() => {}} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-gray-500 truncate">{preview}</p>
            {done && <p className="flex items-center gap-1 text-xs text-green-600 font-semibold mt-0.5"><CheckCircle size={10} />Prêt</p>}
          </div>
          <button type="button" onClick={reset} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 shrink-0">
            <X size={13} />
          </button>
        </div>
      )}

      {err && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{err}</p>}
    </div>
  );
}