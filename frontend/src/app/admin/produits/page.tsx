"use client";
import {
  adminActivites, adminCategories, adminMarques, adminProduits,
  adminProduitsCreate, adminUpload,
  type ActiviteAdmin, type CategorieAdmin, type MarqueAdmin, type ProduitAdmin,
} from "@/lib/admin-api";
import type { ProduitImage } from "@/types/api";
import { toast } from "@/components/admin/Toast";
import {
  AlertCircle, Edit2, ExternalLink, FileText, ImageIcon, Info,
  Link as LinkIcon, Loader2, Package, Plus, RefreshCw, Search, Star,
  ToggleLeft, ToggleRight, Trash2, Upload, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { LogoObtenteurUploader } from "@/components/admin/LogoObtenteurUploader";
import { useCallback, useEffect, useRef, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const DIVISIONS: Record<string, string> = {
  standard: "bg-gray-100 text-gray-600",
  pro:      "bg-blue-100 text-blue-700",
  garden:   "bg-green-100 text-green-700",
};
function toSlug(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}
const EMPTY = { nom:"",slug:"",id_categorie:"",division:"standard",description:"",fiche_technique:"",ordre:0,actif:true,
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
      <p className="text-[10px] font-black uppercase tracking-wider mb-1.5" style={{color}}>{label}</p>
      <div className="flex gap-1 flex-wrap">
        {arr.map((v,i) => (
          <button key={i} type="button" onClick={() => toggle(i)}
            className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg text-[9px] font-bold transition-all border"
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
          {loading && <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-ev-500"/></div>}
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
                <p className="text-[11px] font-mono text-gray-400 truncate mb-1.5">{img.url.split("/").pop()}</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Badge principale — assignable / transférable */}
                  {img.is_principale
                    ? <div className="flex items-center gap-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
                          ⭐ Principale
                        </span>
                        <button onClick={() => unsetPrincipale(img.id_imgP)}
                          className="text-[10px] px-1.5 py-0.5 rounded-full border border-dashed border-gray-200 text-gray-300 hover:border-red-300 hover:text-red-400 transition-colors"
                          title="Retirer le statut principale">
                          ✕
                        </button>
                      </div>
                    : <button onClick={() => setPrincipale(img.id_imgP)}
                        className="text-[10px] px-2 py-0.5 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-amber-400 hover:text-amber-600 transition-colors"
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
                          className="h-6 px-2 text-[11px] border border-blue-400 rounded-lg focus:outline-none w-32"/>
                        <datalist id="cond-list">{condList.map(c => <option key={c} value={c}/>)}</datalist>
                        <button onClick={() => saveConditionnement(img.id_imgP)} className="h-6 px-2 text-[11px] bg-blue-600 text-white rounded-lg">✓</button>
                        <button onClick={() => setEditing(null)} className="h-6 px-1.5 text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg text-[11px]">✕</button>
                      </div>
                    : img.conditionnement
                      ? <button onClick={() => { setEditing(img.id_imgP); setEditCond(img.conditionnement); }}
                          className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border cursor-pointer hover:opacity-75 transition-opacity"
                          style={{ background: condColor(img.conditionnement) + "22", borderColor: condColor(img.conditionnement), color: condColor(img.conditionnement) }}>
                          <Package size={8}/> {img.conditionnement} <Edit2 size={7}/>
                        </button>
                      : <button onClick={() => { setEditing(img.id_imgP); setEditCond(""); }}
                          className="text-[10px] px-2 py-0.5 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors">
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
                  ${tab===t ? "bg-ev-700 text-white border-ev-700" : "bg-white text-gray-600 border-gray-200 hover:border-ev-300"}`}>
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
                ${saving ? "border-ev-400 bg-ev-50" : dragOver ? "border-ev-500 bg-ev-50" : "border-gray-200 hover:border-ev-400 hover:bg-white"}`}>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onClick={e => e.stopPropagation()}
                onChange={e => { const f=e.target.files?.[0]; if(f) uploadFile(f); e.target.value=""; }}/>
              {saving
                ? <div className="flex flex-col items-center gap-2"><Loader2 size={20} className="animate-spin text-ev-600"/><p className="text-sm text-ev-700">Upload…</p></div>
                : <div className="flex flex-col items-center gap-1"><Upload size={18} className="text-gray-400"/><p className="text-sm font-medium text-gray-600">Glisser ou cliquer</p><p className="text-xs text-gray-400">JPG, PNG, WEBP — 10 MB max</p></div>
              }
            </div>
          ) : (
            <div className="flex gap-2">
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…"
                className="flex-1 h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-400"/>
              <button onClick={addUrl} disabled={saving || !url.trim()}
                className="px-4 h-9 bg-ev-700 hover:bg-ev-800 text-white text-sm rounded-xl disabled:opacity-50 flex items-center gap-1.5">
                {saving ? <Loader2 size={12} className="animate-spin"/> : <><Plus size={12}/>Ajouter</>}
              </button>
            </div>
          )}
          <p className="text-[10px] text-gray-400 text-center">
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
            <div className="flex items-center gap-3 p-3 bg-ev-50 border border-ev-200 rounded-xl">
              <FileText size={18} className="text-ev-600 shrink-0"/>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-ev-800">Fiche actuelle</p>
                <a href={currentUrl} target="_blank" rel="noreferrer"
                  className="text-xs text-ev-600 hover:underline truncate block font-mono">{currentUrl}</a>
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
                  ${tab===t ? "bg-ev-700 text-white border-ev-700" : "bg-white text-gray-600 border-gray-200"}`}>
                {t==="file" ? <><Upload size={12}/>Uploader PDF</> : <><LinkIcon size={12}/>Par URL</>}
              </button>
            ))}
          </div>
          {tab==="file" ? (
            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-ev-400 rounded-2xl p-8 text-center cursor-pointer hover:bg-gray-50">
              <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
                onChange={e => { const f=e.target.files?.[0]; if(f) uploadPdf(f); }}/>
              {saving ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={24} className="animate-spin text-ev-600"/>
                  <p className="text-sm text-ev-700">Upload en cours…</p>
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
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"/>
              <button onClick={saveUrl} disabled={saving}
                className="w-full h-10 bg-ev-700 hover:bg-ev-800 text-white text-sm rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={13} className="animate-spin"/> : "Enregistrer l'URL"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Page principale ──────────────────────────────────────────── */
export default function AdminProduitsPage() {
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
  const [err,      setErr]      = useState("");
  const [confirmDel, setConfirmDel] = useState<number|null>(null);

  interface CatNode extends CategorieAdmin { children:CatNode[]; depth:number }
  const catsFlat = (() => {
    const map=new Map<number,CatNode>();
    categories.forEach(c=>map.set(c.id_categorie,{...c,children:[],depth:0}));
    const roots:CatNode[]=[];
    map.forEach(node=>{
      if(node.parent_id&&map.has(node.parent_id)){map.get(node.parent_id)!.children.push(node);}
      else roots.push(node);
    });
    const sort=(arr:CatNode[])=>arr.sort((a,b)=>a.ordre-b.ordre||a.nom.localeCompare(b.nom,"fr"));
    const assignDepth=(nodes:CatNode[],d:number)=>{sort(nodes);nodes.forEach(n=>{n.depth=d;assignDepth(n.children,d+1);});};
    assignDepth(roots,0);
    const flat:CatNode[]=[], walk=(arr:CatNode[])=>arr.forEach(n=>{flat.push(n);walk(n.children);});
    walk(roots); return flat;
  })();

  // Catégorie sélectionnée → marque/activité héritées en lecture seule
  const selectedCat = form.id_categorie
    ? categories.find(c=>String(c.id_categorie)===form.id_categorie)
    : null;
  const inheritedMarque   = selectedCat?.id_marque   ? marques.find(m=>m.id_marque===selectedCat.id_marque)     : null;
  const inheritedActivite = selectedCat?.id_activite ? activites.find(a=>a.id_activite===selectedCat.id_activite) : null;

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
      if(search) p.search=search; if(actif) p.actif=actif; if(division) p.division=division;
      const res=await adminProduits.list(p);
      setItems(res.data); setMeta(res.meta as any);
    } finally { setLoading(false); }
  },[search,actif,division]);

  useEffect(() => { load(1); loadRefs(); },[load,loadRefs]);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setErr(""); setModal("create"); };
  const openEdit   = (p: ProduitAdmin) => {
    const catId = p.id_categorie ?? p.categorie?.id_categorie
                  ?? categories.find(c => c.slug === p.categorie?.slug)?.id_categorie;
    setForm({
      nom:p.nom, slug:p.slug,
      id_categorie:catId ? String(catId) : "",
      division:p.division,
      description:(p as any).description??"", fiche_technique:(p as any).fiche_technique??"",
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

  const handleSave = async () => {
    if(!form.nom.trim()||!form.slug.trim()||!form.id_categorie){setErr("Nom, slug et catégorie requis.");return;}
    setSaving(true); setErr("");
    try {
      const base={ nom:form.nom, slug:form.slug, id_categorie:Number(form.id_categorie),
        division:form.division, ordre:form.ordre,
        description:form.description||null, fiche_technique:form.fiche_technique||null,
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
      if(modal==="create") await adminProduitsCreate.create(base as any);
      else if(editing) await adminProduitsCreate.update(editing.id_produit,{...base,actif:form.actif});
      setModal(null);
      toast.success(modal==="create"?"Produit créé !":"Produit mis à jour !");
      load(meta.page);
    } catch(e) { setErr((e as Error).message); }
    finally { setSaving(false); }
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{letterSpacing:"-0.04em"}}>Produits</h1>
          <p className="text-sm text-gray-400 mt-0.5">{meta.total} produit{meta.total!==1?"s":""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>load(1)} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100"><RefreshCw size={16}/></button>
          <button onClick={openCreate} className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm"
            style={{background:"linear-gradient(135deg,#3C50E0,#4F60E8)"}}>
            <Plus size={16}/>Nouveau produit
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input placeholder="Nom du produit…" value={search} onChange={e=>setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"/>
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
            <div className="w-7 h-7 border-4 border-t-transparent rounded-full animate-spin" style={{borderColor:"#E2E8F0",borderTopColor:"#3C50E0"}}/>
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
                            ${hasFiche?"bg-green-50 text-green-700 border-green-200":"bg-gray-50 text-gray-500 border-gray-200 hover:border-blue-300"}`}>
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
                          <button onClick={()=>setImgModal(p)} title="Photos" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><ImageIcon size={13}/></button>
                          <a href={`/produits/${p.slug}`} target="_blank" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><ExternalLink size={13}/></a>
                          <button onClick={()=>openEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={13}/></button>
                          <button onClick={()=>toggleActif(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                            {p.actif?<ToggleRight size={16} className="text-blue-600"/>:<ToggleLeft size={16}/>}
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

      {/* Modals */}
      {imgModal && <ImagesModal produit={imgModal} onClose={() => { setImgModal(null); load(meta.page); }}/>}
      {ficheModal && (
        <FicheModal produit={ficheModal} onClose={()=>setFicheModal(null)}
          onUpdated={url => {
            setItems(prev => prev.map(p => p.id_produit===ficheModal.id_produit ? ({...p,fiche_technique:url||null} as any) : p));
            setFicheModal(null);
          }}/>
      )}

      {/* Modal create/edit */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900">{modal==="create"?"Nouveau produit":`Modifier — ${editing?.nom}`}</h2>
              <button onClick={()=>setModal(null)} className="text-gray-400 hover:text-gray-700"><X size={18}/></button>
            </div>
            <div className="p-5 space-y-4">
              {err && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-start gap-2"><AlertCircle size={14} className="shrink-0 mt-0.5"/>{err}</div>}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nom *</label>
                  <input value={form.nom} onChange={e=>setForm({...form,nom:e.target.value,slug:modal==="create"?toSlug(e.target.value):form.slug})}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Slug *</label>
                  <input value={form.slug} onChange={e=>setForm({...form,slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"")})}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Catégorie *</label>
                <select value={form.id_categorie} onChange={e=>setForm({...form,id_categorie:e.target.value})}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white">
                  <option value="">— Choisir —</option>
                  {catsFlat.map(c=><option key={c.id_categorie} value={c.id_categorie}>
                    {"　".repeat(c.depth)}{c.depth>0?"└ ":""}{c.nom}{c.marque?.nom?` 🏷 ${(c.marque as any).nom}`:""}{c.activite?.nom?` ⚡ ${(c.activite as any).nom}`:""}
                  </option>)}
                </select>
              </div>

              {/* Marque & Activité héritées de la catégorie — lecture seule */}
              {form.id_categorie && (inheritedMarque || inheritedActivite) && (
                <div className="flex gap-3 flex-wrap">
                  {inheritedMarque && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-blue-100 bg-blue-50 text-xs text-blue-700">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">Marque héritée</span>
                      <span className="font-semibold">🏷 {inheritedMarque.nom}</span>
                    </div>
                  )}
                  {inheritedActivite && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-purple-100 bg-purple-50 text-xs text-purple-700">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">Activité héritée</span>
                      <span className="font-semibold">⚡ {inheritedActivite.nom}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Division</label>
                  <select value={form.division} onChange={e=>setForm({...form,division:e.target.value})}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white">
                    <option value="standard">Standard</option>
                    <option value="pro">Pro</option>
                    <option value="garden">Garden</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Ordre</label>
                  <input type="number" value={form.ordre} onChange={e=>setForm({...form,ordre:Number(e.target.value)})}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"/>
              </div>


              {/* ══════════════════════════════════════════════
                  DONNÉES TECHNIQUES — style catalogue fertivert
                  ══════════════════════════════════════════════ */}
              <div className="pt-2">

                {/* Séparateur */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1" style={{background:"linear-gradient(to right,transparent,#2e7d4f,transparent)"}}/>
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border"
                    style={{color:"#1a6b3a",background:"#e8f5ee",borderColor:"#2e7d4f"}}>
                    📋 Données techniques
                  </span>
                  <div className="h-px flex-1" style={{background:"linear-gradient(to right,transparent,#2e7d4f,transparent)"}}/>
                </div>

                {/* Ligne 1 : SKU + Poids + Nature */}
                <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-3" style={{gridTemplateColumns:"1fr 2fr 1fr"}}>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{color:"#1a6b3a"}}>
                      SKU / Référence
                    </label>
                    <input value={(form as any).sku||""} onChange={e=>setForm({...form,sku:e.target.value} as any)}
                      placeholder="FV-001-1L"
                      className="w-full h-9 px-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2 font-mono"
                      style={{borderColor:"#a8d5b5","--tw-ring-color":"#2e7d4f"} as React.CSSProperties}/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{color:"#1a6b3a"}}>
                      Poids / Volume
                    </label>
                    <input value={(form as any).poids||""} onChange={e=>setForm({...form,poids:e.target.value} as any)}
                      placeholder="1L, 5 kg…"
                      className="w-full h-9 px-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
                      style={{borderColor:"#a8d5b5"}}/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{color:"#1a6b3a"}}>
                      Nature
                    </label>
                    <input value={(form as any).nature||""} onChange={e=>setForm({...form,nature:e.target.value} as any)}
                      placeholder="Engrais foliaire…"
                      className="w-full h-9 px-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
                      style={{borderColor:"#a8d5b5"}}/>
                  </div>
                </div>

                {/* Conditionnement */}
                <div className="mb-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{color:"#1a6b3a"}}>
                    Conditionnements
                  </label>
                  <input value={(form as any).conditionnement||""} onChange={e=>setForm({...form,conditionnement:e.target.value} as any)}
                    placeholder="Flacon 1L, Bidon 5L…"
                    className="w-full h-9 px-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
                    style={{borderColor:"#a8d5b5"}}/>
                </div>

                {/* Composition chimique — prévisualisation style catalogue */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-black uppercase tracking-wider" style={{color:"#1a6b3a"}}>
                      Composition chimique
                    </label>
                    
                  </div>
                  <textarea value={(form as any).composition_chimique||""} onChange={e=>setForm({...form,composition_chimique:e.target.value} as any)}
                    rows={5} placeholder={"Azote (N) Total — 4%\nAzote (N) Organique — 3,7%\nCarbone (C) Organique — 14%\nFer (Fe) Organique — 700 ppm"}
                    className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 font-mono resize-y"
                    style={{borderColor:"#a8d5b5",lineHeight:1.8}}/>
                </div>

                {/* Usage / Application — prévisualisation style catalogue */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-black uppercase tracking-wider" style={{color:"#c0580a"}}>
                      Mode d'emploi &amp; Application
                    </label>
                    
                  </div>
                  <textarea value={(form as any).usage||""} onChange={e=>setForm({...form,usage:e.target.value} as any)}
                    rows={5} placeholder={"Traitement Racinaire : 7 - 9 Litres / ha\nTraitement Foliaire : 300 - 500 ml / hl\nArboriculture | 0,25 L/100L | 3-5 L/Ha\nMaraîchage | 0,25 L/100L | 3-5 L/Ha\nGrandes Cultures | 1-3 L/100L | -"}
                    className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 font-mono resize-y"
                    style={{borderColor:"#e0a87a",lineHeight:1.8}}/>
                </div>

                {/* Biologique */}
                <div className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{background:"#e8f5ee",borderColor:"#2e7d4f"}}>
                  <input type="checkbox" id="biologique" checked={!!(form as any).biologique}
                    onChange={e=>setForm({...form,biologique:e.target.checked} as any)}
                    className="w-4 h-4 cursor-pointer" style={{accentColor:"#1a6b3a"}}/>
                  <label htmlFor="biologique" className="text-sm font-bold cursor-pointer" style={{color:"#1a6b3a"}}>
                    Certifié biologique / 100% végétal
                  </label>
                </div>
              </div>

              {/* ══════════════════════════════════════════════
                  DONNÉES SEMENCES — style catalogue Espace Vert
                  ══════════════════════════════════════════════ */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1" style={{background:"linear-gradient(to right,transparent,#16803c,transparent)"}}/>
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border"
                    style={{color:"#14532d",background:"#dcfce7",borderColor:"#16803c"}}>
                    🌱 Données Semences
                  </span>
                  <div className="h-px flex-1" style={{background:"linear-gradient(to right,transparent,#16803c,transparent)"}}/>
                </div>
                <p className="text-[10px] text-gray-400 mb-3 -mt-2">
                  Remplir uniquement pour les produits semences (haricot, fenouil, piment, tomate…)
                </p>

                {/* Saison + Obtenteur + Type */}
                <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{color:"#15803d"}}>
                      Saison
                    </label>
                    <input value={(form as any).saison||""} onChange={e=>setForm({...form,saison:e.target.value} as any)}
                      placeholder="Printemps / Automne-Hiver"
                      className="w-full h-9 px-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
                      style={{borderColor:"#86efac"}}/>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{color:"#15803d"}}>
                      Obtenteur
                    </label>
                    <input value={(form as any).obtenteur||""} onChange={e=>setForm({...form,obtenteur:e.target.value} as any)}
                      placeholder="NEXEEDS / CORASEEDS (Italie)…"
                      className="w-full h-9 px-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2 mb-2"
                      style={{borderColor:"#86efac"}}/>
                    <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{color:"#15803d"}}>
                      Logo obtenteur
                    </p>
                    <LogoObtenteurUploader
                      value={(form as any).obtenteur_logo||""}
                      onChange={v=>setForm({...form,obtenteur_logo:v} as any)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{color:"#15803d"}}>
                      Type / Variété
                    </label>
                    <input value={(form as any).type_semence||""} onChange={e=>setForm({...form,type_semence:e.target.value} as any)}
                      placeholder="Hybride / Borlotto / Anaheim…"
                      className="w-full h-9 px-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
                      style={{borderColor:"#86efac"}}/>
                  </div>
                </div>

                {/* Productivité + Longueur fruit */}
                <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{color:"#15803d"}}>
                      Productivité / Rendement
                    </label>
                    <input value={(form as any).productivite||""} onChange={e=>setForm({...form,productivite:e.target.value} as any)}
                      placeholder="Productivité élevée / Rendement élevé…"
                      className="w-full h-9 px-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
                      style={{borderColor:"#86efac"}}/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{color:"#15803d"}}>
                      Longueur / Taille du fruit
                    </label>
                    <input value={(form as any).longueur_fruit||""} onChange={e=>setForm({...form,longueur_fruit:e.target.value} as any)}
                      placeholder="13 à 16 cm / 18-22cm…"
                      className="w-full h-9 px-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
                      style={{borderColor:"#86efac"}}/>
                  </div>
                </div>

                {/* Descriptif variétal */}
                <div className="mb-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{color:"#15803d"}}>
                    Descriptif variétal
                  </label>
                  <textarea value={(form as any).descriptif_var||""} onChange={e=>setForm({...form,descriptif_var:e.target.value} as any)}
                    rows={2} placeholder="Couleur rose dominante / Forme ronde, Couleur Blanche Attractive / Fruit Blanche Très Attractive…"
                    className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 resize-none"
                    style={{borderColor:"#86efac"}}/>
                </div>

                {/* Résistances / Tolérances */}
                <div className="mb-3">
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{color:"#15803d"}}>
                    Résistances / Tolérances (HR)
                  </label>
                  <input value={(form as any).resistance||""} onChange={e=>setForm({...form,resistance:e.target.value} as any)}
                    placeholder="Mosaïque commune et anthracnose / TMV…"
                    className="w-full h-9 px-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
                    style={{borderColor:"#86efac"}}/>
                </div>

                {/* Calendrier */}
                <div className="p-3 rounded-xl border space-y-3" style={{background:"#f0fdf4",borderColor:"#86efac"}}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-green-800">
                    📅 Calendrier cultural — cliquer sur les mois actifs
                  </p>
                  <CalendrierEditor
                    label="🟢 Semis / Repiquage"
                    color="#16a34a"
                    value={(form as any).calendrier_semis||"000000000000"}
                    onChange={v=>setForm({...form,calendrier_semis:v} as any)}
                  />
                  <CalendrierEditor
                    label="🔴 Récolte"
                    color="#dc2626"
                    value={(form as any).calendrier_recolte||"000000000000"}
                    onChange={v=>setForm({...form,calendrier_recolte:v} as any)}
                  />
                </div>
              </div>

              {modal==="edit" && (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.actif} onChange={e=>setForm({...form,actif:e.target.checked})}
                    className="w-4 h-4 accent-blue-600"/>
                  Produit actif
                </label>
              )}
              {modal==="create" && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                  💡 Après création, ajoutez les <strong>photos</strong> via le bouton dans la liste. La fiche PDF peut être gérée via le bouton dédié.
                </div>
              )}
            </div>
            <div className="p-5 pt-0 flex gap-3">
              <button onClick={()=>setModal(null)} className="flex-1 h-10 border text-sm text-gray-600 rounded-xl hover:bg-gray-50">Annuler</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 h-10 text-white text-sm rounded-xl disabled:opacity-60 flex items-center justify-center"
                style={{background:"linear-gradient(135deg,#3C50E0,#4F60E8)"}}>
                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : modal==="create"?"Créer":"Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}