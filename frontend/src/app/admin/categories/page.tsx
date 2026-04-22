"use client";
import { useEffect, useState, useCallback } from "react";
import { adminCategories, adminMarques, adminActivites, type CategorieAdmin, type MarqueAdmin, type ActiviteAdmin } from "@/lib/admin-api";
import { Plus, Edit2, Trash2, RefreshCw, CheckCircle, XCircle } from "lucide-react";

function toSlug(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}
const EMPTY = { nom:"", slug:"", description:"", image:"", id_activite:"", id_marque:"", parent_id:"", ordre:0, actif:true };

export default function AdminCategoriesPage() {
  const [items,     setItems]     = useState<CategorieAdmin[]>([]);
  const [marques,   setMarques]   = useState<MarqueAdmin[]>([]);
  const [activites, setActivites] = useState<ActiviteAdmin[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState<"create"|"edit"|null>(null);
  const [editing,   setEditing]   = useState<CategorieAdmin|null>(null);
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const [err,       setErr]       = useState("");
  const [search,    setSearch]    = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, mrqs, acts] = await Promise.all([
        adminCategories.list(),
        adminMarques.list(),
        adminActivites.list(),
      ]);
      setItems(Array.isArray(cats) ? cats : (cats as any).data ?? []);
      setMarques(Array.isArray(mrqs) ? mrqs : (mrqs as any).data ?? []);
      setActivites(Array.isArray(acts) ? acts : (acts as any).data ?? []);
    } finally { setLoading(false); }
  },[]);

  useEffect(()=>{load();},[load]);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setErr(""); setModal("create"); };
  const openEdit   = (c: CategorieAdmin) => {
    setForm({nom:c.nom,slug:c.slug,description:c.description??"",image:c.image??"",
      id_activite:c.id_activite?String(c.id_activite):"",
      id_marque:c.id_marque?String(c.id_marque):"",
      parent_id:c.parent_id?String(c.parent_id):"",
      ordre:c.ordre,actif:c.actif});
    setEditing(c); setErr(""); setModal("edit");
  };

  const handleSave = async () => {
    if(!form.nom.trim()||!form.slug.trim()){setErr("Nom et slug requis.");return;}
    setSaving(true); setErr("");
    try {
      const p = {
        nom:form.nom, slug:form.slug,
        description:form.description||null, image:form.image||null,
        id_activite:form.id_activite?Number(form.id_activite):null,
        id_marque:form.id_marque?Number(form.id_marque):null,
        parent_id:form.parent_id?Number(form.parent_id):null,
        ordre:form.ordre,
        ...(modal==="edit"?{actif:form.actif}:{}),
      };
      if(modal==="create") await adminCategories.create(p as any);
      else if(editing) await adminCategories.update(editing.id_categorie,p as any);
      setModal(null); load();
    } catch(e){setErr((e as Error).message);}
    finally{setSaving(false);}
  };

  const handleDelete = async (c: CategorieAdmin) => {
    if(!confirm(`Supprimer la catégorie "${c.nom}" ?`)) return;
    try { await adminCategories.remove(c.id_categorie); load(); }
    catch(e){alert((e as Error).message);}
  };

  const filtered = items.filter(c =>
    !search || c.nom.toLowerCase().includes(search.toLowerCase()) || c.slug.includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} catégorie{items.length!==1?"s":""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 text-gray-500 hover:text-gray-800 rounded-xl hover:bg-gray-100"><RefreshCw size={16}/></button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-ev-700 hover:bg-ev-800 text-white text-sm font-medium px-4 py-2 rounded-xl">
            <Plus size={16}/>Nouvelle catégorie
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <input placeholder="Rechercher…" value={search} onChange={e=>setSearch(e.target.value)}
          className="w-full h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"/>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (<div className="flex items-center justify-center py-16"><div className="w-7 h-7 border-4 border-ev-600 border-t-transparent rounded-full animate-spin"/></div>)
        : filtered.length===0 ? (<div className="text-center py-16 text-gray-400">Aucune catégorie trouvée</div>)
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{["Nom","Slug","Marque","Activité","Parent","Ordre","Statut","Actions"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(c=>(
                  <tr key={c.id_categorie} className={`hover:bg-gray-50 ${!c.actif?"opacity-50":""}`}>
                    <td className="px-4 py-3 font-medium text-gray-800">{c.nom}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{c.slug}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{c.marque?.nom??<span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{c.activite?.nom??<span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{c.parent?.nom??<span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3 text-gray-500">{c.ordre}</td>
                    <td className="px-4 py-3">
                      {c.actif?<span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle size={12}/>Actif</span>
                              :<span className="flex items-center gap-1 text-xs text-red-500"><XCircle size={12}/>Inactif</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={()=>openEdit(c)} className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg"><Edit2 size={13}/></button>
                        <button onClick={()=>handleDelete(c)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13}/></button>
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{modal==="create"?"Nouvelle catégorie":`Modifier — ${editing?.nom}`}</h2>
              <button onClick={()=>setModal(null)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>
            <div className="p-5 space-y-4">
              {err&&<div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{err}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
                  <input value={form.nom} onChange={e=>{setForm({...form,nom:e.target.value,slug:modal==="create"?toSlug(e.target.value):form.slug});}}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"/>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Slug *</label>
                  <input value={form.slug} onChange={e=>setForm({...form,slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"")})}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 font-mono text-xs"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Marque</label>
                  <select value={form.id_marque} onChange={e=>setForm({...form,id_marque:e.target.value})}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white">
                    <option value="">— Aucune —</option>
                    {marques.map(m=><option key={m.id_marque} value={m.id_marque}>{m.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Activité</label>
                  <select value={form.id_activite} onChange={e=>setForm({...form,id_activite:e.target.value})}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white">
                    <option value="">— Aucune —</option>
                    {activites.map(a=><option key={a.id_activite} value={a.id_activite}>{a.nom}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Catégorie parente</label>
                  <select value={form.parent_id} onChange={e=>setForm({...form,parent_id:e.target.value})}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white">
                    <option value="">— Aucune —</option>
                    {items.filter(c=>!editing||c.id_categorie!==editing.id_categorie).map(c=>(
                      <option key={c.id_categorie} value={c.id_categorie}>{c.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ordre</label>
                  <input type="number" value={form.ordre} onChange={e=>setForm({...form,ordre:Number(e.target.value)})}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Image (URL)</label>
                <input value={form.image} onChange={e=>setForm({...form,image:e.target.value})} placeholder="https://..."
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 resize-none"/>
              </div>
              {modal==="edit"&&(
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.actif} onChange={e=>setForm({...form,actif:e.target.checked})} className="accent-ev-600"/>
                  Catégorie active
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
