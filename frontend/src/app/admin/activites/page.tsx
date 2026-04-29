"use client";
import { useEffect, useState, useCallback } from "react";
import { adminActivites, type ActiviteAdmin } from "@/lib/admin-api";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Plus, Edit2, Trash2, RefreshCw, CheckCircle, XCircle, ExternalLink, X } from "lucide-react";
import Image from "next/image";

function toSlug(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}
const EMPTY = { nom:"", slug:"", description:"", image:"", ordre:0, actif:true };

export default function AdminActivitesPage() {
  const [items,  setItems]  = useState<ActiviteAdmin[]>([]);
  const [loading,setLoading]= useState(true);
  const [modal,  setModal]  = useState<"create"|"edit"|null>(null);
  const [editing,setEditing]= useState<ActiviteAdmin|null>(null);
  const [form,   setForm]   = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await adminActivites.list(); setItems(Array.isArray(d) ? d : (d as any).data ?? []); }
    finally { setLoading(false); }
  },[]);

  useEffect(() => { load(); },[load]);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setErr(""); setModal("create"); };
  const openEdit   = (a: ActiviteAdmin) => {
    setForm({nom:a.nom,slug:a.slug,description:a.description??"",image:a.image??"",ordre:a.ordre,actif:a.actif});
    setEditing(a); setErr(""); setModal("edit");
  };

  const handleSave = async () => {
    if(!form.nom.trim()||!form.slug.trim()){setErr("Nom et slug requis.");return;}
    setSaving(true); setErr("");
    try {
      const p = {nom:form.nom,slug:form.slug,description:form.description||null,image:form.image||null,ordre:form.ordre,...(modal==="edit"?{actif:form.actif}:{})};
      if(modal==="create") await adminActivites.create(p as any);
      else if(editing) await adminActivites.update(editing.id_activite,p as any);
      setModal(null); load();
    } catch(e){setErr((e as Error).message);}
    finally{setSaving(false);}
  };

  const handleDelete = async (a: ActiviteAdmin) => {
    if(!confirm(`Supprimer l'activité "${a.nom}" ?`)) return;
    try { await adminActivites.remove(a.id_activite); load(); }
    catch(e){alert((e as Error).message);}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activités</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} activité{items.length!==1?"s":""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 text-gray-500 hover:text-gray-800 rounded-xl hover:bg-gray-100"><RefreshCw size={16}/></button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-ev-700 hover:bg-ev-800 text-white text-sm font-medium px-4 py-2 rounded-xl">
            <Plus size={16}/>Nouvelle activité
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (<div className="flex items-center justify-center py-16"><div className="w-7 h-7 border-4 border-ev-600 border-t-transparent rounded-full animate-spin"/></div>)
        : items.length===0 ? (<div className="text-center py-16 text-gray-400">Aucune activité</div>)
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{["Nom","Slug","Ordre","Statut","Actions"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(a=>(
                  <tr key={a.id_activite} className={`hover:bg-gray-50 ${!a.actif?"opacity-50":""}`}>
                    <td className="px-4 py-3 font-medium text-gray-800">{a.nom}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{a.slug}</td>
                    <td className="px-4 py-3 text-gray-500">{a.ordre}</td>
                    <td className="px-4 py-3">
                      {a.actif?<span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle size={12}/>Actif</span>
                              :<span className="flex items-center gap-1 text-xs text-red-500"><XCircle size={12}/>Inactif</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <a href={`/activites/${a.slug}`} target="_blank" className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg"><ExternalLink size={13}/></a>
                        <button onClick={()=>openEdit(a)} className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg"><Edit2 size={13}/></button>
                        <button onClick={()=>handleDelete(a)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{modal==="create"?"Nouvelle activité":`Modifier — ${editing?.nom}`}</h2>
              <button onClick={()=>setModal(null)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>
            <div className="p-5 space-y-4">
              {err&&<div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{err}</div>}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
                <input value={form.nom} onChange={e=>{setForm({...form,nom:e.target.value,slug:modal==="create"?toSlug(e.target.value):form.slug});}}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Slug *</label>
                <input value={form.slug} onChange={e=>setForm({...form,slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"")})}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 font-mono"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Image</label>
                <ImageUploader onUpload={url=>setForm(f=>({...f,image:url}))} label="Image de l'activité" />
                {form.image&&(
                  <div className="mt-2 flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-12 h-12 rounded-lg border border-gray-200 bg-white overflow-hidden flex-shrink-0">
                      <Image src={form.image} alt="Aperçu" width={48} height={48} className="w-full h-full object-cover" onError={()=>{}}/>
                    </div>
                    <p className="flex-1 text-xs font-mono text-gray-400 truncate">{form.image}</p>
                    <button type="button" onClick={()=>setForm(f=>({...f,image:""}))} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 shrink-0">
                      <X size={13}/>
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 resize-none"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ordre d'affichage</label>
                <input type="number" value={form.ordre} onChange={e=>setForm({...form,ordre:Number(e.target.value)})}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"/>
              </div>
              {modal==="edit"&&(
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.actif} onChange={e=>setForm({...form,actif:e.target.checked})} className="accent-ev-600"/>
                  Activité active
                </label>
              )}
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
