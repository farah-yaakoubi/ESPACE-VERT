"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Edit2, ExternalLink, PlaySquare, Plus, RefreshCw, Trash2 } from "lucide-react";
import { adminTutorialVideos, type TutorialVideoAdmin } from "@/lib/admin-api";

const EMPTY = {
  titre: "",
  description: "",
  url: "",
  thumbnail: "",
  page: "pulvert",
  ordre: 0,
  actif: true,
};

export default function AdminTutorialVideosPage() {
  const [items, setItems] = useState<TutorialVideoAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<TutorialVideoAdmin | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await adminTutorialVideos.list({ page: "pulvert" }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setErr("");
    setModal("create");
  };

  const openEdit = (video: TutorialVideoAdmin) => {
    setEditing(video);
    setForm({
      titre: video.titre,
      description: video.description ?? "",
      url: video.url,
      thumbnail: video.thumbnail ?? "",
      page: video.page,
      ordre: video.ordre,
      actif: video.actif,
    });
    setErr("");
    setModal("edit");
  };

  const save = async () => {
    if (!form.titre.trim() || !form.url.trim()) {
      setErr("Titre et URL vidéo requis.");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const payload = {
        ...form,
        description: form.description.trim() || null,
        thumbnail: form.thumbnail.trim() || null,
        ordre: Number(form.ordre) || 0,
      };
      if (modal === "create") await adminTutorialVideos.create(payload);
      if (modal === "edit" && editing) await adminTutorialVideos.update(editing.id_video, payload);
      setModal(null);
      await load();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (video: TutorialVideoAdmin) => {
    await adminTutorialVideos.update(video.id_video, { actif: !video.actif });
    await load();
  };

  const remove = async (id: number) => {
    if (!confirm("Supprimer cette vidéo ?")) return;
    await adminTutorialVideos.remove(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vidéos tutoriels</h1>
          <p className="mt-0.5 text-sm text-gray-500">Section tutoriels de la page Pulvert</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"><RefreshCw size={16} /></button>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-ev-700 px-4 py-2 text-sm font-medium text-white hover:bg-ev-800">
            <Plus size={16} />Nouvelle vidéo
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="flex justify-center py-16"><div className="h-7 w-7 animate-spin rounded-full border-4 border-ev-600 border-t-transparent" /></div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-gray-400">Aucune vidéo tutoriel</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((video) => (
              <div key={video.id_video} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                  {video.thumbnail ? (
                    <Image src={video.thumbnail} alt={video.titre} width={96} height={64} className="h-full w-full object-cover" />
                  ) : (
                    <PlaySquare size={24} className="text-gray-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-800">{video.titre}</p>
                  <p className="mt-0.5 truncate text-xs text-gray-400">{video.url}</p>
                </div>
                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">Ordre {video.ordre}</span>
                <button onClick={() => toggle(video)} className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${video.actif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {video.actif ? "Actif" : "Masqué"}
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  <a href={video.url} target="_blank" className="rounded-lg p-1.5 text-gray-400 hover:bg-ev-50 hover:text-ev-600"><ExternalLink size={13} /></a>
                  <button onClick={() => openEdit(video)} className="rounded-lg p-1.5 text-gray-400 hover:bg-ev-50 hover:text-ev-600"><Edit2 size={13} /></button>
                  <button onClick={() => remove(video.id_video)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="font-bold text-gray-900">{modal === "create" ? "Nouvelle vidéo" : `Modifier - ${editing?.titre}`}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-700">x</button>
            </div>
            <div className="space-y-4 p-5">
              {err && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{err}</div>}
              <Field label="Titre *" value={form.titre} onChange={(titre) => setForm({ ...form, titre })} />
              <Field label="URL vidéo *" value={form.url} onChange={(url) => setForm({ ...form, url })} placeholder="https://www.youtube.com/watch?v=..." />
              <VideoPreview url={form.url} title={form.titre || "Aperçu vidéo"} />
              <Field label="Miniature" value={form.thumbnail} onChange={(thumbnail) => setForm({ ...form, thumbnail })} placeholder="https://..." />
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ev-500" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Page" value={form.page} onChange={(page) => setForm({ ...form, page })} />
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Ordre</label>
                  <input type="number" value={form.ordre} onChange={(e) => setForm({ ...form, ordre: Number(e.target.value) })}
                    className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ev-500" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.checked })} className="accent-ev-600" />
                Afficher sur la page publique
              </label>
            </div>
            <div className="flex gap-3 p-5 pt-0">
              <button onClick={() => setModal(null)} className="h-10 flex-1 rounded-xl border text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
              <button onClick={save} disabled={saving} className="flex h-10 flex-1 items-center justify-center rounded-xl bg-ev-700 text-sm text-white hover:bg-ev-800 disabled:opacity-60">
                {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ev-500" />
    </div>
  );
}

function VideoPreview({ url, title }: { url: string; title: string }) {
  const trimmedUrl = url.trim();
  const embed = getVideoEmbed(trimmedUrl);

  if (!trimmedUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
        Aperçu vidéo
      </div>
    );
  }

  if (!embed) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 text-center text-sm font-medium text-amber-700">
        Utilisez un lien YouTube, Vimeo, Facebook ou TikTok pour afficher la vidéo intégrée sur la page.
      </div>
    );
  }

  return (
    <div className={embed.isVertical ? "mx-auto w-full max-w-[260px] overflow-hidden rounded-xl border border-gray-200 bg-slate-950" : "overflow-hidden rounded-xl border border-gray-200 bg-slate-950"}>
      <iframe
        src={embed.url}
        title={title}
        className={embed.isVertical ? "aspect-[9/16] w-full" : "aspect-video w-full"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

function getVideoEmbed(url: string): { url: string; isVertical: boolean } | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const id =
        parsed.searchParams.get("v") ||
        (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live" ? parts[1] : null);
      return id ? { url: `https://www.youtube.com/embed/${id}`, isVertical: parts[0] === "shorts" } : null;
    }

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? { url: `https://www.youtube.com/embed/${id}`, isVertical: false } : null;
    }

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id ? { url: `https://player.vimeo.com/video/${id}`, isVertical: false } : null;
    }

    if (host === "facebook.com" || host === "m.facebook.com" || host === "fb.watch") {
      return { url: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560`, isVertical: false };
    }

    if (host === "tiktok.com" || host === "vm.tiktok.com" || host === "vt.tiktok.com") {
      const id = extractTikTokId(parsed);
      return id ? { url: `https://www.tiktok.com/embed/v2/${id}`, isVertical: true } : null;
    }
  } catch {
    return null;
  }
  return null;
}

function extractTikTokId(url: URL) {
  const parts = url.pathname.split("/").filter(Boolean);
  const videoIndex = parts.indexOf("video");
  if (videoIndex >= 0 && parts[videoIndex + 1]) return parts[videoIndex + 1];
  return null;
}
