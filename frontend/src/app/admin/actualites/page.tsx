"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import {
  adminActualites, adminActualitesCreate, adminUpload,
  type ActualiteAdmin, type ActualiteDetail
} from "@/lib/admin-api";
import { Plus, Edit2, Search, RefreshCw, ToggleLeft, ToggleRight, Trash2, Newspaper, ExternalLink, Upload, Link as LinkIcon, Loader2, X } from "lucide-react";

function fmt(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day:"2-digit", month:"2-digit", year:"numeric" });
}
function toSlug(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}
const EMPTY = { titre:"", slug:"", contenu:"", image:"", publiee:false };

export default function AdminActualitesPage() {
  const [items,   setItems]   = useState<ActualiteAdmin[]>([]);
  const [meta,    setMeta]    = useState({ total:0, page:1, pages:1 });
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [publiee, setPubliee] = useState("");
  const [modal,   setModal]   = useState<"create"|"edit"|null>(null);
  const [editing, setEditing] = useState<ActualiteDetail|null>(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");
  const [imgTab,  setImgTab]  = useState<"url"|"file">("url");
  const [imgUploading, setImgUploading] = useState(false);
  const imgFileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (page=1) => {
    setLoading(true);
    try {
      const p: Record<string,string> = {page:String(page),limit:"20"};
      if(search)  p.search  = search;
      if(publiee) p.publiee = publiee;
      const res = await adminActualites.list(p);
      setItems(res.data); setMeta(res.meta as any);
    } finally { setLoading(false); }
  },[search,publiee]);

  useEffect(()=>{load(1);},[load]);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setErr(""); setModal("create"); };

  const openEdit = async (a: ActualiteAdmin) => {
    try {
      const detail = await adminActualitesCreate.getById(a.id_actualite);
      setEditing(detail);
      setForm({titre:detail.titre,slug:detail.slug,contenu:detail.contenu,image:detail.image??"",publiee:detail.publiee});
      setErr(""); setModal("edit");
    } catch(e) { alert((e as Error).message); }
  };

  const handleSave = async () => {
    if(!form.titre.trim()||!form.slug.trim()||!form.contenu.trim()){setErr("Titre, slug et contenu requis.");return;}
    setSaving(true); setErr("");
    try {
      const p = {titre:form.titre,slug:form.slug,contenu:form.contenu,image:form.image||null,publiee:form.publiee};
      if(modal==="create") await adminActualitesCreate.create(p);
      else if(editing) await adminActualitesCreate.update(editing.id_actualite,p);
      setModal(null); load(meta.page);
    } catch(e){setErr((e as Error).message);}
    finally{setSaving(false);}
  };

  const togglePubliee = async (a: ActualiteAdmin) => {
    await adminActualites.toggle(a.id_actualite,!a.publiee);
    load(meta.page);
  };

  const remove = async (id: number) => {
    if(!confirm("Supprimer cette actualité ?")) return;
    await adminActualites.remove(id); load(meta.page);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Actualités</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta.total} article{meta.total!==1?"s":""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>load(1)} className="p-2 text-gray-500 hover:text-gray-800 rounded-xl hover:bg-gray-100"><RefreshCw size={16}/></button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-ev-700 hover:bg-ev-800 text-white text-sm font-medium px-4 py-2 rounded-xl">
            <Plus size={16}/>Nouvel article
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input placeholder="Titre…" value={search} onChange={e=>setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"/>
        </div>
        <select value={publiee} onChange={e=>setPubliee(e.target.value)}
          className="h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white">
          <option value="">Tous</option>
          <option value="true">Publiés</option>
          <option value="false">Brouillons</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading?(<div className="flex items-center justify-center py-16"><div className="w-7 h-7 border-4 border-ev-600 border-t-transparent rounded-full animate-spin"/></div>)
        :items.length===0?(<div className="text-center py-16 text-gray-400">Aucun article trouvé</div>)
        :(
          <div className="divide-y divide-gray-100">
            {items.map(a=>(
              <div key={a.id_actualite} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 shrink-0 flex items-center justify-center">
                  {a.image?<Image src={a.image} alt={a.titre} width={56} height={56} className="object-cover w-full h-full"/>
                           :<Newspaper size={20} className="text-gray-300"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate text-sm">{a.titre}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Créé le {fmt(a.created_at)}{a.published_at&&<> · Publié le {fmt(a.published_at)}</>}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${a.publiee?"bg-green-100 text-green-700":"bg-gray-100 text-gray-500"}`}>
                  {a.publiee?"Publié":"Brouillon"}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  {a.publiee&&<a href={`/actualites/${a.slug}`} target="_blank" className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg"><ExternalLink size={13}/></a>}
                  <button onClick={()=>openEdit(a)} className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg"><Edit2 size={13}/></button>
                  <button onClick={()=>togglePubliee(a)} title={a.publiee?"Dépublier":"Publier"} className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg">
                    {a.publiee?<ToggleRight size={16} className="text-ev-600"/>:<ToggleLeft size={16}/>}
                  </button>
                  <button onClick={()=>remove(a.id_actualite)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
        {meta.pages>1&&(
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {meta.page}/{meta.pages}</p>
            <div className="flex gap-2">
              <button disabled={meta.page<=1} onClick={()=>load(meta.page-1)} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Précédent</button>
              <button disabled={meta.page>=meta.pages} onClick={()=>load(meta.page+1)} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Suivant</button>
            </div>
          </div>
        )}
      </div>

      {modal&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{modal==="create"?"Nouvel article":`Modifier — ${editing?.titre}`}</h2>
              <button onClick={()=>setModal(null)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>
            <div className="p-5 space-y-4">
              {err&&<div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{err}</div>}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Titre *</label>
                <input value={form.titre} onChange={e=>{setForm({...form,titre:e.target.value,slug:modal==="create"?toSlug(e.target.value):form.slug});}}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Slug *</label>
                <input value={form.slug} onChange={e=>setForm({...form,slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"")})}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 font-mono text-xs"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Image de couverture</label>
                <div className="flex gap-2 mb-2">
                  {(["url","file"] as const).map(t => (
                    <button key={t} onClick={()=>setImgTab(t)} type="button"
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${imgTab===t?"bg-ev-700 text-white border-ev-700":"bg-white text-gray-600 border-gray-200 hover:border-ev-300"}`}>
                      {t==="url"?<><LinkIcon size={11}/>URL</>:<><Upload size={11}/>Fichier</>}
                    </button>
                  ))}
                </div>
                {imgTab==="url" ? (
                  <input value={form.image} onChange={e=>setForm({...form,image:e.target.value})} placeholder="https://..."
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"/>
                ) : (
                  <div onClick={()=>imgFileRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 hover:border-ev-400 rounded-xl p-4 text-center cursor-pointer transition-colors hover:bg-gray-50">
                    <input ref={imgFileRef} type="file" accept="image/*" className="hidden" onChange={async e=>{
                      const f=e.target.files?.[0]; if(!f) return;
                      setImgUploading(true);
                      try { const d=await adminUpload.image(f); setForm(prev=>({...prev,image:d.url})); }
                      catch(ex){ setErr((ex as Error).message); }
                      finally { setImgUploading(false); }
                    }}/>
                    {imgUploading ? <div className="flex items-center justify-center gap-2"><Loader2 size={18} className="animate-spin text-ev-600"/><span className="text-sm text-ev-700">Upload…</span></div>
                      : <><Upload size={18} className="mx-auto mb-1 text-gray-400"/><p className="text-xs text-gray-500">Cliquer pour choisir une image</p></>}
                  </div>
                )}
                {form.image && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                      <Image src={form.image} alt="Aperçu" width={64} height={64} className="object-cover w-full h-full" onError={()=>{}}/>
                    </div>
                    <button onClick={()=>setForm({...form,image:""})} className="text-xs text-red-500 hover:underline flex items-center gap-1"><X size={11}/>Supprimer</button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contenu * (HTML accepté)</label>
                <textarea value={form.contenu} onChange={e=>setForm({...form,contenu:e.target.value})} rows={10}
                  placeholder="<p>Votre contenu ici...</p>"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 resize-y font-mono text-xs"/>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.publiee} onChange={e=>setForm({...form,publiee:e.target.checked})} className="accent-ev-600"/>
                Publier immédiatement
              </label>
            </div>
            <div className="p-5 pt-0 flex gap-3">
              <button onClick={()=>setModal(null)} className="flex-1 h-10 border text-sm text-gray-600 rounded-xl hover:bg-gray-50">Annuler</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 h-10 bg-ev-700 text-white text-sm rounded-xl hover:bg-ev-800 disabled:opacity-60 flex items-center justify-center">
                {saving?<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:(modal==="create"?"Créer":"Enregistrer")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
