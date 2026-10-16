"use client";
import {
  adminActivites, adminCategories, adminMarques, adminProduits,
  adminProduitsCreate, adminUpload,
  type ActiviteAdmin, type CategorieAdmin, type MarqueAdmin, type ProduitAdmin,
} from "@/lib/admin-api";
import type { ProduitImage } from "@/types/api";
import { toast } from "@/components/admin/Toast";
import {
  AlertCircle, ArrowLeft, Edit2, ExternalLink, Eye, FileText, ImageIcon, Info,
  Link as LinkIcon, Loader2, Package, Plus, RefreshCw, Save, Search, Star,
  ToggleLeft, ToggleRight, Trash2, Upload, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { LogoObtenteurUploader } from "@/components/admin/LogoObtenteurUploader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { CategoryPicker } from "@/components/admin/CategoryPicker";
import {
  categoriesUnderActivite,
  categoriesUnderMarque,
  flattenCategoriesForSelect,
  leavesOnly,
  resolveCategoryContext,
  type CatNodeFlat,
} from "@/lib/admin-catalog-utils";
import { useCallback, useEffect, useRef, useState } from "react";

/** Périmètre fixe : le gestionnaire est affiché sous une marque ou une activité. */
export type ProduitsScope = { type: "marque" | "activite"; id: number; label: string };

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const DIVISIONS: Record<string, string> = {
  standard: "bg-gray-100 text-gray-600",
  pro:      "bg-slate-100 text-slate-700",
  garden:   "bg-green-100 text-green-700",
};
function toSlug(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}
const EMPTY = { nom:"",slug:"",id_categorie:"",division:"standard",description:"",fiche_technique:"",image_description:"",ordre:0,actif:true,
  sku:"",poids:"",nature:"",composition_chimique:"",usage:"",biologique:false,conditionnement:"",
  saison:"",obtenteur:"",obtenteur_logo:"",type_semence:"",productivite:"",longueur_fruit:"",resistance:"",descriptif_var:"",
  calendrier_semis:"000000000000",calendrier_recolte:"000000000000" };

const MOIS_ABBR = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

function CalendrierEditor({ label, color, value, onChange }: {
  label: string; color: string; value: string; onChange: (v: string) => void;
}) {
  const arr = (value || "000000000000").padEnd(12,"0").split("");
  const toggle = (i: number) => {
    const next = [...arr]; next[i] = next[i]==="1"?"0":"1";
    onChange(next.join(""));
  };
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-wider mb-1.5" style={{color}}>{label}</p>
      <div className="flex gap-1 flex-wrap">
        {arr.map((v,i) => (
          <button key={i} type="button" onClick={() => toggle(i)}
            className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg text-[10px] font-bold transition-all border"
            style={{
              background: v==="1" ? color : "#f3f4f6",
              color: v==="1" ? "#fff" : "#9ca3af",
              borderColor: v==="1" ? color : "#e5e7eb",
              minWidth: 30,
            }}>
            {MOIS_ABBR[i]}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Confirm Dialog ────────────────────────────────────────────── */
function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={22} className="text-red-600" />
        </div>
        <p className="text-gray-700 text-sm text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 h-10 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-50">Annuler</button>
          <button onClick={onConfirm} className="flex-1 h-10 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700">Supprimer</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal images ─────────────────────────────────────────────── */
function ImagesModal({ produit, onClose }: { produit: ProduitAdmin; onClose: () => void }) {
  const [images,     setImages]     = useState<ProduitImage[]>(produit.images ?? []);
  const [loading,    setLoading]    = useState(false);
  const [tab,        setTab]        = useState<"file"|"url">("file");
  const [url,        setUrl]        = useState("");
  const [saving,     setSaving]     = useState(false);
  const [err,        setErr]        = useState("");
  const [dragOver,   setDragOver]   = useState(false);
  const [confirmDel, setConfirmDel] = useState<number|null>(null);
  // Édition inline par image
  const [editing,    setEditing]    = useState<number|null>(null);
  const [editCond,   setEditCond]   = useState("");
  const fileRef     = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);
  const token = typeof window !== "undefined" ? (localStorage.getItem("ev_admin_token") ?? "") : "";
  const authH = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${BASE}/admin/produits/${produit.id_produit}`, { headers: authH })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!cancelled && d) setImages((d.data ?? d).images ?? produit.images ?? []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [produit.id_produit]);

  // Couleurs par conditionnement
  const COLORS = ["#2e7d32","#1565c0","#e65100","#6a1b9a","#c2185b","#00838f","#5d4037"];
  const condList = [...new Set(images.map((i: any) => i.conditionnement).filter(Boolean) as string[])];
  const condColor = (c: string) => COLORS[condList.indexOf(c) % COLORS.length];

  const uploadFile = async (file: File) => {
    if (uploadingRef.current) return;
    uploadingRef.current = true;
    setSaving(true); setErr("");
    try {
      const data = await adminUpload.produitImage(produit.id_produit, file);
      setImages(prev => [...prev, data]);
      if (fileRef.current) fileRef.current.value = "";
      toast.success("Image uploadée");
    } catch(e) { setErr((e as Error).message); }
    finally { setSaving(false); uploadingRef.current = false; }
  };

  const addUrl = async () => {
    if (!url.trim()) return;
    setSaving(true); setErr("");
    try {
      const res = await fetch(`${BASE}/admin/produits/${produit.id_produit}/images`, {
        method: "POST", headers: { "Content-Type": "application/json", ...authH },
        body: JSON.stringify({ url: url.trim(), is_principale: false }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erreur");
      const d = await res.json();
      setImages(prev => [...prev, d.data]);
      setUrl("");
      toast.success("Image ajoutée");
    } catch(e) { setErr((e as Error).message); }
    finally { setSaving(false); }
  };

  const setPrincipale = async (id_imgP: number) => {
    await fetch(`${BASE}/admin/produits/${produit.id_produit}/images/${id_imgP}`, {
      method: "PUT", headers: { "Content-Type": "application/json", ...authH },
      body: JSON.stringify({ is_principale: true }),
    });
    setImages(prev => prev.map((i: any) => ({ ...i, is_principale: i.id_imgP === id_imgP })));
    toast.success("Image principale définie");
  };

  const unsetPrincipale = async (id_imgP: number) => {
    await fetch(`${BASE}/admin/produits/${produit.id_produit}/images/${id_imgP}`, {
      method: "PUT", headers: { "Content-Type": "application/json", ...authH },
      body: JSON.stringify({ is_principale: false }),
    });
    setImages(prev => prev.map((i: any) => i.id_imgP === id_imgP ? { ...i, is_principale: false } : i));
    toast.success("Statut principale retiré — assignez-le à une autre image");
  };

  const saveConditionnement = async (id_imgP: number) => {
    await fetch(`${BASE}/admin/produits/${produit.id_produit}/images/${id_imgP}`, {
      method: "PUT", headers: { "Content-Type": "application/json", ...authH },
      body: JSON.stringify({ conditionnement: editCond.trim() || null }),
    });
    setImages(prev => prev.map((i: any) => i.id_imgP === id_imgP ? { ...i, conditionnement: editCond.trim() || null } : i));
    setEditing(null);
    toast.success("Conditionnement mis à jour");
  };

  const deleteImage = async (id_imgP: number) => {
    await fetch(`${BASE}/admin/produits/${produit.id_produit}/images/${id_imgP}`, { method: "DELETE", headers: authH });
    setImages(prev => prev.filter((i: any) => i.id_imgP !== id_imgP));
    setConfirmDel(null);
    toast.success("Image supprimée");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
      {confirmDel !== null && (
        <ConfirmDialog message="Supprimer cette image ?" onConfirm={() => deleteImage(confirmDel)} onCancel={() => setConfirmDel(null)}/>
      )}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 text-sm">Photos — {produit.nom}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {images.length} image{images.length !== 1 ? "s" : ""}
              {condList.length > 0 && <> · <span className="text-gray-500">{condList.join(", ")}</span></>}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18}/></button>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading && <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[#2f6b4a]"/></div>}
          {!loading && images.length === 0 && (
            <div className="text-center py-12 text-gray-300">
              <ImageIcon size={36} className="mx-auto mb-2"/>
              <p className="text-sm">Aucune image</p>
            </div>
          )}
          {images.map((img: any) => (
            <div key={img.id_imgP} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50">
              {/* Miniature */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border shrink-0">
                <Image src={img.url} alt="" width={56} height={56} className="object-contain w-full h-full"/>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-mono text-gray-400 truncate mb-1.5">{img.url.split("/").pop()}</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Badge principale — assignable / transférable */}
                  {img.is_principale
                    ? <div className="flex items-center gap-1">
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
                          ⭐ Principale
                        </span>
                        <button onClick={() => unsetPrincipale(img.id_imgP)}
                          className="text-[11px] px-1.5 py-0.5 rounded-full border border-dashed border-gray-200 text-gray-300 hover:border-red-300 hover:text-red-400 transition-colors"
                          title="Retirer le statut principale">
                          ✕
                        </button>
                      </div>
                    : <button onClick={() => setPrincipale(img.id_imgP)}
                        className="text-[11px] px-2 py-0.5 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-amber-400 hover:text-amber-600 transition-colors"
                        title="Définir comme image principale de la card produit">
                        ☆ Définir principale
                      </button>
                  }
                  {/* Badge conditionnement — édition inline */}
                  {editing === img.id_imgP
                    ? <div className="flex items-center gap-1">
                        <input value={editCond} onChange={e => setEditCond(e.target.value)} autoFocus
                          list="cond-list" placeholder="ex: Flacon 1L"
                          onKeyDown={e => { if (e.key === "Enter") saveConditionnement(img.id_imgP); if (e.key === "Escape") setEditing(null); }}
                          className="h-6 px-2 text-[12px] border border-[#5f8a70] rounded-lg focus:outline-none w-32"/>
                        <datalist id="cond-list">{condList.map(c => <option key={c} value={c}/>)}</datalist>
                        <button onClick={() => saveConditionnement(img.id_imgP)} className="h-6 px-2 text-[12px] bg-[#1f4d34] text-white rounded-lg">✓</button>
                        <button onClick={() => setEditing(null)} className="h-6 px-1.5 text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg text-[12px]">✕</button>
                      </div>
                    : img.conditionnement
                      ? <button onClick={() => { setEditing(img.id_imgP); setEditCond(img.conditionnement); }}
                          className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold border cursor-pointer hover:opacity-75 transition-opacity"
                          style={{ background: condColor(img.conditionnement) + "22", borderColor: condColor(img.conditionnement), color: condColor(img.conditionnement) }}>
                          <Package size={8}/> {img.conditionnement} <Edit2 size={7}/>
                        </button>
                      : <button onClick={() => { setEditing(img.id_imgP); setEditCond(""); }}
                          className="text-[11px] px-2 py-0.5 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-[#5f8a70] hover:text-[#1f4d34] transition-colors">
                          + conditionnement
                        </button>
                  }
                </div>
              </div>

              {/* Supprimer */}
              <button onClick={() => setConfirmDel(img.id_imgP)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={13}/>
              </button>
            </div>
          ))}
        </div>

        {/* Zone upload */}
        <div className="p-4 border-t bg-gray-50 rounded-b-3xl shrink-0 space-y-3">
          {err && <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{err}</p>}

          <div className="flex gap-2">
            {(["file","url"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors
                  ${tab===t ? "bg-[#1f4d34] text-white border-[#1f4d34]" : "bg-white text-gray-600 border-gray-200 hover:border-[#8fb09a]"}`}>
                {t==="file" ? <><Upload size={11}/>Fichier</> : <><LinkIcon size={11}/>URL</>}
              </button>
            ))}
          </div>

          {tab === "file" ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f=e.dataTransfer.files[0]; if(f) uploadFile(f); }}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors
                ${saving ? "border-[#5f8a70] bg-[#f0f5f1]" : dragOver ? "border-[#2f6b4a] bg-[#f0f5f1]" : "border-gray-200 hover:border-[#5f8a70] hover:bg-white"}`}>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onClick={e => e.stopPropagation()}
                onChange={e => { const f=e.target.files?.[0]; if(f) uploadFile(f); e.target.value=""; }}/>
              {saving
                ? <div className="flex flex-col items-center gap-2"><Loader2 size={20} className="animate-spin text-[#2a5c40]"/><p className="text-sm text-[#1f4d34]">Upload…</p></div>
                : <div className="flex flex-col items-center gap-1"><Upload size={18} className="text-gray-400"/><p className="text-sm font-medium text-gray-600">Glisser ou cliquer</p><p className="text-xs text-gray-400">JPG, PNG, WEBP — 10 MB max</p></div>
              }
            </div>
          ) : (
            <div className="flex gap-2">
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…"
                className="flex-1 h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5f8a70]"/>
              <button onClick={addUrl} disabled={saving || !url.trim()}
                className="px-4 h-9 bg-[#1f4d34] hover:bg-[#173b28] text-white text-sm rounded-xl disabled:opacity-50 flex items-center gap-1.5">
                {saving ? <Loader2 size={12} className="animate-spin"/> : <><Plus size={12}/>Ajouter</>}
              </button>
            </div>
          )}
          <p className="text-[11px] text-gray-400 text-center">
            Après upload, cliquez sur chaque image pour définir son conditionnement et la photo principale.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal fiche technique PDF ────────────────────────────────── */
function FicheModal({ produit, onClose, onUpdated }: { produit: ProduitAdmin; onClose: () => void; onUpdated: (url: string) => void }) {
  const [tab,    setTab]    = useState<"file"|"url">("file");
  const [url,    setUrl]    = useState((produit as any).fiche_technique ?? "");
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");
  const [confirmDel, setConfirmDel] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const token = typeof window !== "undefined" ? (localStorage.getItem("ev_admin_token") ?? "") : "";
  const currentUrl = (produit as any).fiche_technique;

  const saveUrl = async () => {
    setSaving(true); setErr("");
    try {
      await fetch(`${BASE}/admin/produits/${produit.id_produit}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fiche_technique: url.trim()||null }),
      });
      onUpdated(url.trim()); onClose();
      toast.success("Fiche mise à jour");
    } catch(e) { setErr((e as Error).message); }
    finally { setSaving(false); }
  };

  const uploadPdf = async (file: File) => {
    setSaving(true); setErr("");
    try {
      const data = await adminUpload.produitFiche(produit.id_produit, file);
      onUpdated(data.url); onClose();
      toast.success("Fiche PDF uploadée !");
    } catch(e) { setErr((e as Error).message); }
    finally { setSaving(false); }
  };

  const deleteFiche = async () => {
    setSaving(true); setErr("");
    try {
      await fetch(`${BASE}/admin/produits/${produit.id_produit}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fiche_technique: null }),
      });
      onUpdated(""); onClose();
      toast.success("Fiche supprimée");
    } catch(e) { setErr((e as Error).message); }
    finally { setSaving(false); setConfirmDel(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
      {confirmDel && (
        <ConfirmDialog message="Supprimer la fiche PDF ?" onConfirm={deleteFiche} onCancel={() => setConfirmDel(false)}/>
      )}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="p-5 border-b flex items-center justify-between">
          <div><h2 className="font-bold text-gray-900">Fiche technique PDF</h2><p className="text-xs text-gray-400">{produit.nom}</p></div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18}/></button>
        </div>
        <div className="p-5 space-y-4">
          {err && <div className="p-2 bg-red-50 text-red-600 text-xs rounded-lg">{err}</div>}
          {currentUrl && (
            <div className="flex items-center gap-3 p-3 bg-[#f0f5f1] border border-[#c3d6c9] rounded-xl">
              <FileText size={18} className="text-[#2a5c40] shrink-0"/>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#173b28]">Fiche actuelle</p>
                <a href={currentUrl} target="_blank" rel="noreferrer"
                  className="text-xs text-[#2a5c40] hover:underline truncate block font-mono">{currentUrl}</a>
              </div>
              <button onClick={() => setConfirmDel(true)} disabled={saving}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                <Trash2 size={14}/>
              </button>
            </div>
          )}
          <div className="flex gap-2">
            {(["file","url"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors
                  ${tab===t ? "bg-[#1f4d34] text-white border-[#1f4d34]" : "bg-white text-gray-600 border-gray-200"}`}>
                {t==="file" ? <><Upload size={12}/>Uploader PDF</> : <><LinkIcon size={12}/>Par URL</>}
              </button>
            ))}
          </div>
          {tab==="file" ? (
            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-[#5f8a70] rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-50">
              <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
                onChange={e => { const f=e.target.files?.[0]; if(f) uploadPdf(f); }}/>
              {saving ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={24} className="animate-spin text-[#2a5c40]"/>
                  <p className="text-sm text-[#1f4d34]">Upload en cours…</p>
                </div>
              ) : (
                <><FileText size={28} className="mx-auto mb-2 text-gray-400"/>
                  <p className="text-sm font-medium text-gray-600">Cliquer pour sélectionner un PDF</p>
                  <p className="text-xs text-gray-400 mt-1">Max 50 MB</p></>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://...pdf"
                className="w-full h-10 px-3 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2f6b4a]"/>
              <button onClick={saveUrl} disabled={saving}
                className="w-full h-10 bg-[#1f4d34] hover:bg-[#173b28] text-white text-sm rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={13} className="animate-spin"/> : "Enregistrer l'URL"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Galerie photos inline (page produit, style "cover + vignettes") ─── */
function ProductImagesPanel({
  produit, uploading, onQuickUpload, onManage,
}: {
  produit: ProduitAdmin | null;
  uploading: boolean;
  onQuickUpload: (file: File) => void;
  onManage: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const images = produit?.images ?? [];
  const cover = images.find((i: any) => i.is_principale) ?? images[0];
  const rest = images.filter((i: any) => i !== cover);
  const shown = rest.slice(0, 3);
  const extra = rest.length - 3;

  const tileBase = "relative w-full h-full rounded-xl overflow-hidden border flex items-center justify-center transition-colors";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onQuickUpload(f); e.target.value = ""; }}/>

      {!produit ? (
        <div className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-center px-4 bg-gray-50">
          <ImageIcon size={26} className="text-gray-300"/>
          <p className="text-xs text-gray-400">Enregistrez d&apos;abord le produit<br/>pour ajouter des photos</p>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) onQuickUpload(f); }}
          className={`grid grid-cols-3 grid-rows-2 gap-2 aspect-[4/3] rounded-xl ${dragOver ? "ring-2 ring-[#5f8a70]" : ""}`}>

          {/* Cover — grande tuile */}
          <button type="button" onClick={onManage}
            className={`${tileBase} col-span-1 row-span-2 bg-gray-50 border-gray-100 hover:border-[#8fb09a]`}>
            {cover ? (
              <Image src={cover.url} alt={produit.nom} fill className="object-contain p-2"/>
            ) : (
              <ImageIcon size={22} className="text-gray-300"/>
            )}
            {cover && (
              <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/90 text-gray-600 border border-gray-200">
                Cover
              </span>
            )}
          </button>

          {/* Vignettes */}
          {[0, 1, 2].map(i => {
            const img = shown[i];
            const showOverflow = i === 2 && extra > 0;
            return (
              <button key={i} type="button" onClick={onManage}
                className={`${tileBase} bg-gray-50 border-gray-100 hover:border-[#8fb09a]`}>
                {img ? (
                  <>
                    <Image src={img.url} alt="" fill className="object-contain p-1.5"/>
                    {showOverflow && (
                      <span className="absolute inset-0 bg-black/55 flex items-center justify-center text-white text-xs font-bold">
                        +{extra}
                      </span>
                    )}
                  </>
                ) : i < 2 ? (
                  <ImageIcon size={14} className="text-gray-200"/>
                ) : null}
              </button>
            );
          })}

          {/* Ajout rapide */}
          <button type="button" onClick={() => fileRef.current?.click()}
            className={`${tileBase} border-2 border-dashed ${uploading ? "border-[#8fb09a] bg-[#f0f5f1]" : "border-gray-200 hover:border-[#5f8a70] hover:bg-[#f0f5f1]/40"}`}>
            {uploading ? <Loader2 size={16} className="animate-spin text-[#2f6b4a]"/> : <Plus size={18} className="text-gray-400"/>}
          </button>
        </div>
      )}

      {produit && (
        <button onClick={onManage}
          className="mt-3 w-full text-xs font-semibold text-[#1f4d34] hover:text-[#173b28] flex items-center justify-center gap-1.5 py-1.5 rounded-lg hover:bg-[#f0f5f1] transition-colors">
          <ImageIcon size={12}/> Gérer les {images.length} photo{images.length !== 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}

/* ─── Page plein écran d'ajout / modification produit ─────────────
   Layout inspiré de la maquette : header d'actions, colonne gauche
   (galerie photos + visibilité + aperçu), colonne droite (détails du
   produit avec onglets Général / Avancé). Tout le dashboard (sidebar,
   topbar) reste visible autour pour une navigation fluide.          */
function ProductFormPanel({
  mode, form, setForm, err, saving, editingProduit,
  catsFlat, allCategories, marques, activites, initialScope, fixedScope, inheritedMarque, inheritedActivite,
  onCancel, onSaveAs, onDeleteClick, onOpenImages, onOpenFiche, onQuickImageUpload, uploadingImage,
}: {
  mode: "create" | "edit";
  form: typeof EMPTY;
  setForm: (f: any) => void;
  err: string;
  saving: boolean;
  editingProduit: ProduitAdmin | null;
  catsFlat: CatNodeFlat[];
  allCategories: CategorieAdmin[];
  marques: MarqueAdmin[];
  activites: ActiviteAdmin[];
  initialScope: { marque: string; activite: string };
  fixedScope?: ProduitsScope;
  inheritedMarque: MarqueAdmin | null | undefined;
  inheritedActivite: ActiviteAdmin | null | undefined;
  onCancel: () => void;
  onSaveAs: (actif: boolean) => void;
  onDeleteClick: () => void;
  onOpenImages: () => void;
  onOpenFiche: () => void;
  onQuickImageUpload: (file: File) => void;
  uploadingImage: boolean;
}) {
  const [tab, setTab] = useState<"general" | "avance">("general");

  // Périmètre : on choisit d'abord l'activité et/ou la marque, la liste des
  // catégories est alors limitée à ce qui se trouve en dessous.
  const [scopeActivite, setScopeActivite] = useState<string>(
    initialScope.activite || (inheritedActivite ? String(inheritedActivite.id_activite) : ""));
  const [scopeMarque, setScopeMarque] = useState<string>(
    initialScope.marque || (inheritedMarque ? String(inheritedMarque.id_marque) : ""));

  const inScope = (c: CatNodeFlat, act: string, mar: string) =>
    (!act || String(c.effective_id_activite ?? "") === act) &&
    (!mar || String(c.effective_id_marque ?? "") === mar);

  const scopedCats = catsFlat.filter((c) => inScope(c, scopeActivite, scopeMarque));
  const marquesDispo = marques.filter((m) =>
    catsFlat.some((c) => c.effective_id_marque === m.id_marque && inScope(c, scopeActivite, "")));
  const activitesDispo = activites.filter((a) =>
    catsFlat.some((c) => c.effective_id_activite === a.id_activite && inScope(c, "", scopeMarque)));

  const changeScope = (act: string, mar: string) => {
    setScopeActivite(act);
    setScopeMarque(mar);
    // la catégorie déjà choisie est retirée si elle sort du périmètre
    const cur = catsFlat.find((c) => String(c.id_categorie) === form.id_categorie);
    if (cur && !inScope(cur, act, mar)) setForm({ ...form, id_categorie: "" });
  };
  const lastUpdate = (editingProduit as any)?.updated_at ?? editingProduit?.created_at;
  const lastUpdateLabel = lastUpdate
    ? new Date(lastUpdate).toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Non enregistré";

  return (
    <div className="space-y-4">
      {/* ── Header actions ── */}
      <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onCancel} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 shrink-0">
            <ArrowLeft size={18}/>
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate" style={{letterSpacing:"-0.02em"}}>
              {mode === "create" ? "Nouveau produit" : `Modifier — ${editingProduit?.nom}`}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Dernière mise à jour : {lastUpdateLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {mode === "edit" && (
            <button onClick={onDeleteClick}
              className="p-2.5 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-colors" title="Supprimer">
              <Trash2 size={15}/>
            </button>
          )}
          <button onClick={() => onSaveAs(false)} disabled={saving}
            className="h-10 px-4 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50">
            Enregistrer brouillon
          </button>
          <button onClick={() => onSaveAs(true)} disabled={saving}
            className="h-10 px-4 text-sm font-semibold text-white rounded-xl shadow-sm disabled:opacity-60 flex items-center gap-2"
            style={{background:"#1f4d34"}}>
            {saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
            {mode === "create" ? "Publier" : "Enregistrer"}
          </button>
        </div>
      </div>

      {err && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-start gap-2">
          <AlertCircle size={14} className="shrink-0 mt-0.5"/>{err}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 items-start">
        {/* ══════════ Colonne gauche ══════════ */}
        <div className="space-y-4">
          <ProductImagesPanel produit={editingProduit} uploading={uploadingImage} onQuickUpload={onQuickImageUpload} onManage={onOpenImages}/>

          {/* Visibilité */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-sm font-bold text-gray-800">Visibilité</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-3">Contrôle l&apos;affichage du produit pour les visiteurs</p>
            <button type="button" onClick={() => setForm({ ...form, actif: !form.actif })}
              className="flex items-center gap-2 text-sm font-semibold"
              style={{ color: form.actif ? "#16803c" : "#6b7280" }}>
              {form.actif ? <ToggleRight size={26} className="text-[#2a5c40]" style={{color:"#16803c"}}/> : <ToggleLeft size={26} className="text-gray-300"/>}
              {form.actif ? "Visible" : "Masqué"}
            </button>
          </div>

          {/* Fiche technique PDF */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-sm font-bold text-gray-800 mb-1">Fiche technique</p>
            <p className="text-xs text-gray-400 mb-3">Document PDF téléchargeable sur la fiche produit</p>
            <button onClick={onOpenFiche} disabled={!editingProduit}
              className={`w-full h-9 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-colors
                ${!editingProduit ? "border-gray-100 text-gray-300 cursor-not-allowed"
                  : form.fiche_technique ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100" : "border-gray-200 text-gray-600 hover:border-[#8fb09a] hover:text-[#1f4d34]"}`}>
              <FileText size={13}/>{form.fiche_technique ? "PDF ajoutée · Modifier" : "Ajouter un PDF"}
            </button>
            {!editingProduit && <p className="text-[11px] text-gray-300 mt-1.5">Disponible après l&apos;enregistrement</p>}
          </div>

          {/* Aperçu */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-sm font-bold text-gray-800 mb-1">Aperçu</p>
            <p className="text-xs text-gray-400 mb-3">Voir le rendu de la fiche produit publique</p>
            {editingProduit ? (
              <a href={`/produits/${editingProduit.slug}`} target="_blank" rel="noreferrer"
                className="w-full h-9 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:border-[#8fb09a] hover:text-[#1f4d34] flex items-center justify-center gap-2 transition-colors">
                <Eye size={13}/>Aperçu
              </a>
            ) : (
              <button disabled className="w-full h-9 text-xs font-semibold rounded-xl border border-gray-100 text-gray-300 flex items-center justify-center gap-2 cursor-not-allowed">
                <Eye size={13}/>Aperçu
              </button>
            )}
          </div>
        </div>

        {/* ══════════ Colonne droite — Détails produit ══════════ */}
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-sm font-bold text-gray-900">Détails du produit</p>
              <p className="text-xs text-gray-400 mt-0.5">Informations clés pour décrire et afficher votre produit.</p>
            </div>
            <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full ${form.actif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              Statut : {form.actif ? "Publié" : "Brouillon"}
            </span>
          </div>

          {/* Onglets */}
          <div className="px-5 pt-4">
            <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl">
              {(["general","avance"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`h-9 text-sm font-semibold rounded-lg transition-colors ${tab===t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  {t === "general" ? "Général" : "Avancé"}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 space-y-4">
            {tab === "general" ? (
              <>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Nom du produit *</label>
                  <input value={form.nom} placeholder="ex. Engrais Foliaire Naturel"
                    onChange={e=>setForm({...form,nom:e.target.value,slug:mode==="create"?toSlug(e.target.value):form.slug})}
                    className="w-full h-10 px-3 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-[#1f4d34] focus:ring-[#1f4d34]/20"/>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Slug *</label>
                    <input value={form.slug} onChange={e=>setForm({...form,slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"")})}
                      className="w-full h-10 px-3 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-[#1f4d34] focus:ring-[#1f4d34]/20 font-mono text-xs"/>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Division</label>
                    <select value={form.division} onChange={e=>setForm({...form,division:e.target.value})}
                      className="w-full h-10 px-3 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none bg-white">
                      <option value="standard">Standard</option>
                      <option value="pro">Pro</option>
                      <option value="garden">Garden</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Catégorie *</label>
                  {fixedScope ? (
                    <p className="mb-3 rounded-lg border border-[#c3d6c9] bg-[#f0f5f1] px-3 py-2 text-xs text-[#1f4d34]">
                      {fixedScope.type === "marque" ? "Marque" : "Activité"} : <strong>{fixedScope.label}</strong> — seules ses catégories et sous-catégories sont proposées.
                    </p>
                  ) : (
                  <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs text-gray-500">Activité</p>
                      <select value={scopeActivite} onChange={(e) => changeScope(e.target.value, scopeMarque)}
                        className="w-full h-10 px-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-[#1f4d34] focus:ring-2 focus:ring-[#1f4d34]/20">
                        <option value="">Toutes les activités</option>
                        {activitesDispo.map((a) => <option key={a.id_activite} value={a.id_activite}>{a.nom}</option>)}
                      </select>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-gray-500">Marque</p>
                      <select value={scopeMarque} onChange={(e) => changeScope(scopeActivite, e.target.value)}
                        className="w-full h-10 px-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-[#1f4d34] focus:ring-2 focus:ring-[#1f4d34]/20">
                        <option value="">Toutes les marques</option>
                        {marquesDispo.map((m) => <option key={m.id_marque} value={m.id_marque}>{m.nom}</option>)}
                      </select>
                    </div>
                  </div>
                  )}
                  <CategoryPicker
                    value={form.id_categorie}
                    onChange={(id) => setForm({ ...form, id_categorie: id })}
                    options={scopedCats}
                    allCategories={allCategories}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">{scopedCats.length} catégorie{scopedCats.length!==1?"s":""} disponible{scopedCats.length!==1?"s":""}{(scopeActivite||scopeMarque)?" dans ce périmètre":""} — seules les catégories finales peuvent recevoir un produit.</p>
                </div>

                {form.id_categorie && (inheritedMarque || inheritedActivite) && (
                  <div className="flex gap-3 flex-wrap">
                    {inheritedMarque && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#c3d6c9] bg-[#f0f5f1] text-xs text-[#1f4d34]">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#5f8a70]">Marque héritée</span>
                        <span className="font-semibold">{inheritedMarque.nom}</span>
                      </div>
                    )}
                    {inheritedActivite && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#e8dcb6] bg-[#faf6e9] text-xs text-[#6b5518]">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#a08630]">Activité héritée</span>
                        <span className="font-semibold">{inheritedActivite.nom}</span>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Ordre d&apos;affichage</label>
                  <input type="number" value={form.ordre} onChange={e=>setForm({...form,ordre:Number(e.target.value)})}
                    className="w-full h-10 px-3 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-[#1f4d34] focus:ring-[#1f4d34]/20 sm:max-w-[160px]"/>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Description</label>
                  <RichTextEditor
                    value={form.description}
                    onChange={(html) => setForm({ ...form, description: html })}
                    rows={4}
                    placeholder="Rédigez une courte description mettant en avant les points forts et bénéfices"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Image de description</label>
                  <p className="text-[12px] text-gray-400 mb-2">Affichée à côté du texte de description sur la fiche produit publique.</p>
                  <LogoObtenteurUploader
                    value={(form as any).image_description || ""}
                    onChange={v => setForm({ ...form, image_description: v } as any)}
                    dropLabel="Glissez l'image ici ou"
                    altText="Illustration de la description"
                    readyLabel="Image prête"
                    previewMaxWidth={320}
                    previewMaxHeight={220}
                  />
                </div>

                {mode === "create" && (
                  <div className="p-3 bg-[#f0f5f1] border border-[#c3d6c9] rounded-xl text-xs text-[#173b28]">
                    Après création, ajoutez les <strong>photos</strong> depuis la galerie à gauche, et la fiche PDF via la carte dédiée.
                  </div>
                )}
              </>
            ) : (
              <>
                {/* ══ Données techniques ══ */}
                <div className="pt-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-px flex-1" style={{background:"linear-gradient(to right,transparent,#2e7d4f,transparent)"}}/>
                    <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full border"
                      style={{color:"#1a6b3a",background:"#e8f5ee",borderColor:"#2e7d4f"}}>
                      📋 Données techniques
                    </span>
                    <div className="h-px flex-1" style={{background:"linear-gradient(to right,transparent,#2e7d4f,transparent)"}}/>
                  </div>

                  <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-3" style={{gridTemplateColumns:"1fr 2fr 1fr"}}>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider mb-1" style={{color:"#1a6b3a"}}>SKU / Référence</label>
                      <input value={(form as any).sku||""} onChange={e=>setForm({...form,sku:e.target.value} as any)}
                        placeholder="FV-001-1L"
                        className="w-full h-9 px-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2 font-mono"
                        style={{borderColor:"#a8d5b5"}}/>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider mb-1" style={{color:"#1a6b3a"}}>Poids / Volume</label>
                      <input value={(form as any).poids||""} onChange={e=>setForm({...form,poids:e.target.value} as any)}
                        placeholder="1L, 5 kg…"
                        className="w-full h-9 px-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
                        style={{borderColor:"#a8d5b5"}}/>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider mb-1" style={{color:"#1a6b3a"}}>Nature</label>
                      <input value={(form as any).nature||""} onChange={e=>setForm({...form,nature:e.target.value} as any)}
                        placeholder="Engrais foliaire…"
                        className="w-full h-9 px-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
                        style={{borderColor:"#a8d5b5"}}/>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="block text-[11px] font-black uppercase tracking-wider mb-1" style={{color:"#1a6b3a"}}>Conditionnements</label>
                    <input value={(form as any).conditionnement||""} onChange={e=>setForm({...form,conditionnement:e.target.value} as any)}
                      placeholder="Flacon 1L, Bidon 5L…"
                      className="w-full h-9 px-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
                      style={{borderColor:"#a8d5b5"}}/>
                  </div>

                  <div className="mb-2">
                    <label className="block text-[11px] font-black uppercase tracking-wider mb-1" style={{color:"#1a6b3a"}}>Composition chimique</label>
                    <textarea value={(form as any).composition_chimique||""} onChange={e=>setForm({...form,composition_chimique:e.target.value} as any)}
                      rows={5} placeholder={"Azote (N) Total — 4%\nAzote (N) Organique — 3,7%\nCarbone (C) Organique — 14%\nFer (Fe) Organique — 700 ppm"}
                      className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 font-mono resize-y"
                      style={{borderColor:"#a8d5b5",lineHeight:1.8}}/>
                  </div>

                  <div className="mb-2">
                    <label className="block text-[11px] font-black uppercase tracking-wider mb-1" style={{color:"#c0580a"}}>Mode d&apos;emploi &amp; Application</label>
                    <textarea value={(form as any).usage||""} onChange={e=>setForm({...form,usage:e.target.value} as any)}
                      rows={5} placeholder={"Traitement Racinaire : 7 - 9 Litres / ha\nTraitement Foliaire : 300 - 500 ml / hl\nArboriculture | 0,25 L/100L | 3-5 L/Ha"}
                      className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 font-mono resize-y"
                      style={{borderColor:"#e0a87a",lineHeight:1.8}}/>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl border" style={{background:"#e8f5ee",borderColor:"#2e7d4f"}}>
                    <input type="checkbox" id="biologique" checked={!!(form as any).biologique}
                      onChange={e=>setForm({...form,biologique:e.target.checked} as any)}
                      className="w-4 h-4 cursor-pointer" style={{accentColor:"#1a6b3a"}}/>
                    <label htmlFor="biologique" className="text-sm font-bold cursor-pointer" style={{color:"#1a6b3a"}}>
                      Certifié biologique / 100% végétal
                    </label>
                  </div>
                </div>

                {/* ══ Données semences ══ */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-px flex-1" style={{background:"linear-gradient(to right,transparent,#16803c,transparent)"}}/>
                    <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full border"
                      style={{color:"#14532d",background:"#dcfce7",borderColor:"#16803c"}}>
                      🌱 Données Semences
                    </span>
                    <div className="h-px flex-1" style={{background:"linear-gradient(to right,transparent,#16803c,transparent)"}}/>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-3 -mt-2">
                    Remplir uniquement pour les produits semences (haricot, fenouil, piment, tomate…)
                  </p>

                  <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider mb-1" style={{color:"#15803d"}}>Saison</label>
                      <input value={(form as any).saison||""} onChange={e=>setForm({...form,saison:e.target.value} as any)}
                        placeholder="Printemps / Automne-Hiver"
                        className="w-full h-9 px-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
                        style={{borderColor:"#86efac"}}/>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-[11px] font-black uppercase tracking-wider mb-1" style={{color:"#15803d"}}>Obtenteur</label>
                      <input value={(form as any).obtenteur||""} onChange={e=>setForm({...form,obtenteur:e.target.value} as any)}
                        placeholder="NEXEEDS / CORASEEDS (Italie)…"
                        className="w-full h-9 px-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2 mb-2"
                        style={{borderColor:"#86efac"}}/>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{color:"#15803d"}}>Logo obtenteur</p>
                      <LogoObtenteurUploader
                        value={(form as any).obtenteur_logo||""}
                        onChange={v=>setForm({...form,obtenteur_logo:v} as any)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider mb-1" style={{color:"#15803d"}}>Type / Variété</label>
                      <input value={(form as any).type_semence||""} onChange={e=>setForm({...form,type_semence:e.target.value} as any)}
                        placeholder="Hybride / Borlotto / Anaheim…"
                        className="w-full h-9 px-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
                        style={{borderColor:"#86efac"}}/>
                    </div>
                  </div>

                  <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider mb-1" style={{color:"#15803d"}}>Productivité / Rendement</label>
                      <input value={(form as any).productivite||""} onChange={e=>setForm({...form,productivite:e.target.value} as any)}
                        placeholder="Productivité élevée / Rendement élevé…"
                        className="w-full h-9 px-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
                        style={{borderColor:"#86efac"}}/>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider mb-1" style={{color:"#15803d"}}>Longueur / Taille du fruit</label>
                      <input value={(form as any).longueur_fruit||""} onChange={e=>setForm({...form,longueur_fruit:e.target.value} as any)}
                        placeholder="13 à 16 cm / 18-22cm…"
                        className="w-full h-9 px-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
                        style={{borderColor:"#86efac"}}/>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="block text-[11px] font-black uppercase tracking-wider mb-1" style={{color:"#15803d"}}>Descriptif variétal</label>
                    <textarea value={(form as any).descriptif_var||""} onChange={e=>setForm({...form,descriptif_var:e.target.value} as any)}
                      rows={2} placeholder="Couleur rose dominante / Forme ronde, Couleur Blanche Attractive…"
                      className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 resize-none"
                      style={{borderColor:"#86efac"}}/>
                  </div>

                  <div className="mb-3">
                    <label className="block text-[11px] font-black uppercase tracking-wider mb-1" style={{color:"#15803d"}}>Résistances / Tolérances (HR)</label>
                    <input value={(form as any).resistance||""} onChange={e=>setForm({...form,resistance:e.target.value} as any)}
                      placeholder="Mosaïque commune et anthracnose / TMV…"
                      className="w-full h-9 px-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
                      style={{borderColor:"#86efac"}}/>
                  </div>

                  <div className="p-3 rounded-xl border space-y-3" style={{background:"#f0fdf4",borderColor:"#86efac"}}>
                    <p className="text-[11px] font-black uppercase tracking-widest text-green-800">📅 Calendrier cultural — cliquer sur les mois actifs</p>
                    <CalendrierEditor label="🟢 Semis / Repiquage" color="#16a34a"
                      value={(form as any).calendrier_semis||"000000000000"}
                      onChange={v=>setForm({...form,calendrier_semis:v} as any)}/>
                    <CalendrierEditor label="🔴 Récolte" color="#dc2626"
                      value={(form as any).calendrier_recolte||"000000000000"}
                      onChange={v=>setForm({...form,calendrier_recolte:v} as any)}/>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Actions bas de page */}
          <div className="px-5 pb-5 pt-2 flex gap-3 border-t border-gray-100">
            <button onClick={onCancel} className="flex-1 h-10 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-50 mt-3">
              Annuler
            </button>
            <button onClick={() => onSaveAs(form.actif)} disabled={saving}
              className="flex-1 h-10 text-white text-sm rounded-xl disabled:opacity-60 flex items-center justify-center mt-3"
              style={{background:"#1f4d34"}}>
              {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : mode==="create"?"Créer le produit":"Enregistrer les modifications"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page principale ──────────────────────────────────────────── */
export function ProduitsManager({ scope }: { scope?: ProduitsScope }) {
  const [items,    setItems]    = useState<ProduitAdmin[]>([]);
  const [meta,     setMeta]     = useState({ total:0, page:1, pages:1 });
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [actif,    setActif]    = useState("");
  const [division, setDivision] = useState("");
  const [marques,  setMarques]  = useState<MarqueAdmin[]>([]);
  const [categories,setCategories] = useState<CategorieAdmin[]>([]);
  const [activites, setActivites]  = useState<ActiviteAdmin[]>([]);
  const [modal,    setModal]    = useState<"create"|"edit"|null>(null);
  const [imgModal, setImgModal] = useState<ProduitAdmin|null>(null);
  const [ficheModal,setFicheModal] = useState<ProduitAdmin|null>(null);
  const [editing,  setEditing]  = useState<ProduitAdmin|null>(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [err,      setErr]      = useState("");
  const [confirmDel, setConfirmDel] = useState<number|null>(null);

  // Sous une marque / activité : seules ses catégories et sous-catégories.
  const scopedBase = scope
    ? (scope.type === "marque"
        ? categoriesUnderMarque(categories, scope.id)
        : categoriesUnderActivite(categories, scope.id))
    : flattenCategoriesForSelect(categories);
  const catsFlat = leavesOnly(scopedBase, categories);

  // Catégorie sélectionnée → marque/activité héritées en lecture seule
  const selectedCat = form.id_categorie
    ? categories.find(c=>String(c.id_categorie)===form.id_categorie)
    : null;
  const selectedContext = selectedCat ? resolveCategoryContext(categories, selectedCat.id_categorie) : null;
  const inheritedMarque   = selectedContext?.effective_id_marque   ? marques.find(m=>m.id_marque===selectedContext.effective_id_marque)     : null;
  const inheritedActivite = selectedContext?.effective_id_activite ? activites.find(a=>a.id_activite===selectedContext.effective_id_activite) : null;

  const loadRefs = useCallback(async () => {
    const [mrqs,cats,acts]=await Promise.all([adminMarques.list(),adminCategories.list(),adminActivites.list()]);
    setMarques(Array.isArray(mrqs)?mrqs:(mrqs as any).data??[]);
    setCategories(Array.isArray(cats)?cats:(cats as any).data??[]);
    setActivites(Array.isArray(acts)?acts:(acts as any).data??[]);
  },[]);

  const load = useCallback(async(page=1) => {
    setLoading(true);
    try {
      const p:Record<string,string>={page:String(page),limit:"20"};
      if(scope) p[scope.type === "marque" ? "id_marque" : "id_activite"] = String(scope.id);
      if(search) p.search=search; if(actif) p.actif=actif; if(division) p.division=division;
      const res=await adminProduits.list(p);
      setItems(res.data); setMeta(res.meta as any);
    } finally { setLoading(false); }
  },[search,actif,division,scope?.type,scope?.id]);

  useEffect(() => { load(1); loadRefs(); },[load,loadRefs]);

  const [initialScope, setInitialScope] = useState({ marque: "", activite: "" });
  // Arrivée depuis une page marque / activité : /admin/produits?marque=3&activite=2
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const marque = q.get("marque") ?? "", activite = q.get("activite") ?? "";
    if (!scope && (marque || activite)) {
      setInitialScope({ marque, activite });
      setForm(EMPTY); setEditing(null); setErr(""); setModal("create");
    }
  }, []);

  const openCreate = () => { setInitialScope({ marque: "", activite: "" }); setForm(EMPTY); setEditing(null); setErr(""); setModal("create"); };
  const openEdit   = (p: ProduitAdmin) => {
    setInitialScope({ marque: "", activite: "" });
    const catId = p.id_categorie ?? p.categorie?.id_categorie
                  ?? categories.find(c => c.slug === p.categorie?.slug)?.id_categorie;
    setForm({
      nom:p.nom, slug:p.slug,
      id_categorie:catId ? String(catId) : "",
      division:p.division,
      description:(p as any).description??"", fiche_technique:(p as any).fiche_technique??"",
      image_description:(p as any).image_description??"",
      ordre:p.ordre, actif:p.actif,
      sku:(p as any).sku??"",
      poids:(p as any).poids??"",
      nature:(p as any).nature??"",
      composition_chimique:(p as any).composition_chimique??"",
      usage:(p as any).usage??"",
      biologique:!!(p as any).biologique,
      conditionnement:(p as any).conditionnement??"",
      saison:(p as any).saison??"",
      obtenteur:(p as any).obtenteur??"",
      obtenteur_logo:(p as any).obtenteur_logo??"",
      type_semence:(p as any).type_semence??"",
      productivite:(p as any).productivite??"",
      longueur_fruit:(p as any).longueur_fruit??"",
      resistance:(p as any).resistance??"",
      descriptif_var:(p as any).descriptif_var??"",
      calendrier_semis:(p as any).calendrier_semis??"000000000000",
      calendrier_recolte:(p as any).calendrier_recolte??"000000000000",
    });
    setEditing(p); setErr(""); setModal("edit");
  };

  const handleSave = async (actifOverride?: boolean) => {
    if(!form.nom.trim()||!form.slug.trim()||!form.id_categorie){setErr("Nom, slug et catégorie requis.");return;}
    setSaving(true); setErr("");
    const actifValue = actifOverride ?? form.actif;
    try {
      const base={ nom:form.nom, slug:form.slug, id_categorie:Number(form.id_categorie),
        division:form.division, ordre:form.ordre, actif:actifValue,
        description:form.description||null, fiche_technique:form.fiche_technique||null,
        image_description:(form as any).image_description||null,
        sku:(form as any).sku||null,
        poids:(form as any).poids||null,
        nature:(form as any).nature||null,
        composition_chimique:(form as any).composition_chimique||null,
        usage:(form as any).usage||null,
        biologique:!!(form as any).biologique,
        conditionnement:(form as any).conditionnement||null,
        saison:(form as any).saison||null,
        obtenteur:(form as any).obtenteur||null,
        obtenteur_logo:(form as any).obtenteur_logo||null,
        type_semence:(form as any).type_semence||null,
        productivite:(form as any).productivite||null,
        longueur_fruit:(form as any).longueur_fruit||null,
        resistance:(form as any).resistance||null,
        descriptif_var:(form as any).descriptif_var||null,
        calendrier_semis:(form as any).calendrier_semis||null,
        calendrier_recolte:(form as any).calendrier_recolte||null,
      };
      if(modal==="create") {
        const created = await adminProduitsCreate.create(base as any);
        setEditing(created as any); setModal("edit"); setForm(f=>({...f,actif:actifValue}));
        toast.success("Produit créé ! Vous pouvez maintenant ajouter des photos.");
      } else if(editing) {
        const updated = await adminProduitsCreate.update(editing.id_produit,base);
        setEditing(prev => prev ? ({...prev, ...updated} as any) : prev);
        setForm(f=>({...f,actif:actifValue}));
        toast.success("Produit mis à jour !");
      }
      load(meta.page);
    } catch(e) { setErr((e as Error).message); }
    finally { setSaving(false); }
  };

  const quickUploadImage = async (file: File) => {
    if (!editing) return;
    setUploadingImage(true);
    try {
      const data = await adminUpload.produitImage(editing.id_produit, file, undefined, (editing.images?.length ?? 0) === 0);
      setEditing(prev => prev ? ({ ...prev, images: [...(prev.images ?? []), data] }) : prev);
      toast.success("Image ajoutée");
    } catch(e) { toast.error("Erreur", (e as Error).message); }
    finally { setUploadingImage(false); }
  };

  const toggleActif = async (p: ProduitAdmin) => {
    await adminProduits.toggle(p.id_produit, !p.actif);
    toast.success(p.actif?"Produit désactivé":"Produit activé");
    load(meta.page);
  };

  const remove = async (id: number) => {
    try { await adminProduits.remove(id); toast.success("Produit supprimé"); load(meta.page); }
    catch(e) { toast.error("Erreur", (e as Error).message); }
    finally { setConfirmDel(null); }
  };

  return (
    <div className="space-y-6">
      {confirmDel!==null && (
        <ConfirmDialog message="Supprimer ce produit définitivement ?" onConfirm={()=>remove(confirmDel)} onCancel={()=>setConfirmDel(null)}/>
      )}

      {modal ? (
        <ProductFormPanel
          mode={modal}
          form={form}
          setForm={setForm}
          err={err}
          saving={saving}
          editingProduit={editing}
          catsFlat={catsFlat}
          allCategories={categories}
          marques={marques}
          activites={activites}
          initialScope={initialScope}
          fixedScope={scope}
          inheritedMarque={inheritedMarque}
          inheritedActivite={inheritedActivite}
          onCancel={()=>{ setModal(null); load(meta.page); }}
          onSaveAs={(actifValue)=>handleSave(actifValue)}
          onDeleteClick={()=>{ if(editing) setConfirmDel(editing.id_produit); }}
          onOpenImages={()=>{ if(editing) setImgModal(editing); }}
          onOpenFiche={()=>{ if(editing) setFicheModal(editing); }}
          onQuickImageUpload={quickUploadImage}
          uploadingImage={uploadingImage}
        />
      ) : (
      <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={scope ? "text-lg font-bold text-gray-900" : "text-2xl font-bold text-gray-900"} style={{letterSpacing:"-0.04em"}}>{scope ? `Produits — ${scope.label}` : "Produits"}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{meta.total} produit{meta.total!==1?"s":""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>load(1)} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100"><RefreshCw size={16}/></button>
          <button onClick={openCreate} className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm"
            style={{background:"#1f4d34"}}>
            <Plus size={16}/>Nouveau produit
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input placeholder="Nom du produit…" value={search} onChange={e=>setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-[#1f4d34] focus:ring-[#1f4d34]/20"/>
        </div>
        <select value={actif} onChange={e=>setActif(e.target.value)}
          className="h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white">
          <option value="">Tous statuts</option>
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
        </select>
        <select value={division} onChange={e=>setDivision(e.target.value)}
          className="h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white">
          <option value="">Toutes divisions</option>
          <option value="standard">Standard</option>
          <option value="pro">Pro</option>
          <option value="garden">Garden</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-4 border-t-transparent rounded-full animate-spin" style={{borderColor:"#E2E8F0",borderTopColor:"#1f4d34"}}/>
          </div>
        ) : items.length===0 ? (
          <div className="text-center py-16 text-gray-400">Aucun produit trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{background:"#F8FAFC", borderBottom:"1px solid #E2E8F0"}}>
                <tr>{["","Produit","Marque","Catégorie","Activité","Division","Fiche","Statut","Actions"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(p => {
                  const img=p.images.find(i=>i.is_principale)??p.images[0];
                  const hasFiche=!!(p as any).fiche_technique;
                  return (
                    <tr key={p.id_produit} className={`hover:bg-gray-50 transition-colors ${!p.actif?"opacity-50":""}`}>
                      <td className="px-4 py-3 w-12">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden border flex items-center justify-center">
                          {img ? <Image src={img.url} alt={p.nom} width={40} height={40} className="object-contain"/>
                               : <span className="text-gray-300 text-lg">🌿</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800 max-w-[160px] truncate">{p.nom}</p>
                        <p className="text-xs text-gray-400 font-mono">{p.slug}</p>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-600">{(p.marque as any)?.nom??"—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[110px] truncate">{(p.categorie as any)?.nom??"—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[110px] truncate">{(p as any).activite?.nom??"—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIVISIONS[p.division]??"bg-gray-100 text-gray-600"}`}>{p.division}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={()=>setFicheModal(p)}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-colors
                            ${hasFiche?"bg-green-50 text-green-700 border-green-200":"bg-gray-50 text-gray-500 border-gray-200 hover:border-[#8fb09a]"}`}>
                          <FileText size={11}/>{hasFiche?"PDF ✓":"Ajouter"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.actif?"bg-green-100 text-green-700":"bg-red-100 text-red-700"}`}>
                          {p.actif?"Actif":"Inactif"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={()=>setImgModal(p)} title="Photos" className="p-1.5 text-gray-400 hover:text-[#1f4d34] hover:bg-[#f0f5f1] rounded-lg"><ImageIcon size={13}/></button>
                          <a href={`/produits/${p.slug}`} target="_blank" className="p-1.5 text-gray-400 hover:text-[#1f4d34] hover:bg-[#f0f5f1] rounded-lg"><ExternalLink size={13}/></a>
                          <button onClick={()=>openEdit(p)} className="p-1.5 text-gray-400 hover:text-[#1f4d34] hover:bg-[#f0f5f1] rounded-lg"><Edit2 size={13}/></button>
                          <button onClick={()=>toggleActif(p)} className="p-1.5 text-gray-400 hover:text-[#1f4d34] hover:bg-[#f0f5f1] rounded-lg">
                            {p.actif?<ToggleRight size={16} className="text-[#1f4d34]"/>:<ToggleLeft size={16}/>}
                          </button>
                          <button onClick={()=>setConfirmDel(p.id_produit)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {meta.pages>1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {meta.page}/{meta.pages} — {meta.total} produits</p>
            <div className="flex gap-2">
              <button disabled={meta.page<=1} onClick={()=>load(meta.page-1)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                <ChevronLeft size={12}/>Précédent
              </button>
              <button disabled={meta.page>=meta.pages} onClick={()=>load(meta.page+1)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                Suivant<ChevronRight size={12}/>
              </button>
            </div>
          </div>
        )}
      </div>
      </>
      )}

      {/* Modals */}
      {imgModal && (
        <ImagesModal produit={imgModal} onClose={() => {
          const id = imgModal.id_produit;
          setImgModal(null);
          load(meta.page);
          const token = typeof window !== "undefined" ? (localStorage.getItem("ev_admin_token") ?? "") : "";
          fetch(`${BASE}/admin/produits/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.ok ? r.json() : null)
            .then(d => {
              if (!d) return;
              const fresh = d.data ?? d;
              setEditing(prev => prev && prev.id_produit === id ? ({ ...prev, images: fresh.images ?? prev.images }) : prev);
            })
            .catch(() => {});
        }}/>
      )}
      {ficheModal && (
        <FicheModal produit={ficheModal} onClose={()=>setFicheModal(null)}
          onUpdated={url => {
            setItems(prev => prev.map(p => p.id_produit===ficheModal.id_produit ? ({...p,fiche_technique:url||null} as any) : p));
            if (editing && editing.id_produit === ficheModal.id_produit) {
              setForm(f => ({ ...f, fiche_technique: url || "" }));
              setEditing(prev => prev ? ({ ...prev, fiche_technique: url || null } as any) : prev);
            }
            setFicheModal(null);
          }}/>
      )}

    </div>
  );
}