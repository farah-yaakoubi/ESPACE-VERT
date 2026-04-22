"use client";
import { useEffect, useState, useCallback } from "react";
import { adminFaq, type FaqAdmin } from "@/lib/admin-api";
import { Plus, Edit2, Trash2, RefreshCw, Search, ChevronDown, ChevronUp } from "lucide-react";

const EMPTY = { question:"", reponse:"", categorie:"", ordre:0, active:true };

export default function AdminFaqPage() {
  const [items,   setItems]   = useState<FaqAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState<"create"|"edit"|null>(null);
  const [editing, setEditing] = useState<FaqAdmin|null>(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");
  const [search,  setSearch]  = useState("");
  const [expanded,setExpanded]= useState<number|null>(null);
  const [catFilter,setCatFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await adminFaq.list(); setItems(Array.isArray(d) ? d : (d as any).data ?? []); }
    finally { setLoading(false); }
  },[]);

  useEffect(()=>{load();},[load]);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setErr(""); setModal("create"); };
  const openEdit   = (f: FaqAdmin) => {
    setForm({question:f.question,reponse:f.reponse,categorie:f.categorie??"",ordre:f.ordre,active:f.active});
    setEditing(f); setErr(""); setModal("edit");
  };

  const handleSave = async () => {
    if(!form.question.trim()||!form.reponse.trim()){setErr("Question et réponse requises.");return;}
    setSaving(true); setErr("");
    try {
      const p = {question:form.question,reponse:form.reponse,categorie:form.categorie||null,ordre:form.ordre,active:form.active};
      if(modal==="create") await adminFaq.create(p);
      else if(editing) await adminFaq.update(editing.id_faq,p);
      setModal(null); load();
    } catch(e){setErr((e as Error).message);}
    finally{setSaving(false);}
  };

  const handleDelete = async (f: FaqAdmin) => {
    if(!confirm("Supprimer cette FAQ ?")) return;
    try { await adminFaq.remove(f.id_faq); load(); }
    catch(e){alert((e as Error).message);}
  };

  const categories = [...new Set(items.map(i=>i.categorie).filter(Boolean))];
  const filtered = items.filter(i =>
    (!search || i.question.toLowerCase().includes(search.toLowerCase())) &&
    (!catFilter || i.categorie===catFilter)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} question{items.length!==1?"s":""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 text-gray-500 hover:text-gray-800 rounded-xl hover:bg-gray-100"><RefreshCw size={16}/></button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-ev-700 hover:bg-ev-800 text-white text-sm font-medium px-4 py-2 rounded-xl">
            <Plus size={16}/>Nouvelle FAQ
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input placeholder="Rechercher…" value={search} onChange={e=>setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"/>
        </div>
        {categories.length>0&&(
          <select value={catFilter} onChange={e=>setCatFilter(e.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white">
            <option value="">Toutes les catégories</option>
            {categories.map(c=><option key={c} value={c!}>{c}</option>)}
          </select>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
        {loading?(<div className="flex items-center justify-center py-16"><div className="w-7 h-7 border-4 border-ev-600 border-t-transparent rounded-full animate-spin"/></div>)
        :filtered.length===0?(<div className="text-center py-16 text-gray-400">Aucune FAQ trouvée</div>)
        :filtered.map(f=>(
          <div key={f.id_faq} className={`${!f.active?"opacity-50":""}`}>
            <div
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50"
              onClick={()=>setExpanded(expanded===f.id_faq?null:f.id_faq)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {f.categorie&&<span className="text-xs bg-ev-50 text-ev-600 px-2 py-0.5 rounded-full">{f.categorie}</span>}
                  <span className="text-xs text-gray-400">Ordre {f.ordre}</span>
                  {!f.active&&<span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">Inactif</span>}
                </div>
                <p className="font-medium text-gray-800 text-sm">{f.question}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={e=>{e.stopPropagation();openEdit(f);}} className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg"><Edit2 size={13}/></button>
                <button onClick={e=>{e.stopPropagation();handleDelete(f);}} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13}/></button>
                {expanded===f.id_faq?<ChevronUp size={16} className="text-gray-400"/>:<ChevronDown size={16} className="text-gray-400"/>}
              </div>
            </div>
            {expanded===f.id_faq&&(
              <div className="px-4 pb-4 text-sm text-gray-600 bg-gray-50 whitespace-pre-wrap">{f.reponse}</div>
            )}
          </div>
        ))}
      </div>

      {modal&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{modal==="create"?"Nouvelle question":"Modifier la FAQ"}</h2>
              <button onClick={()=>setModal(null)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>
            <div className="p-5 space-y-4">
              {err&&<div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{err}</div>}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Question *</label>
                <input value={form.question} onChange={e=>setForm({...form,question:e.target.value})}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Réponse *</label>
                <textarea value={form.reponse} onChange={e=>setForm({...form,reponse:e.target.value})} rows={5}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 resize-none"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Catégorie</label>
                  <input value={form.categorie} onChange={e=>setForm({...form,categorie:e.target.value})}
                    list="faq-cats" placeholder="ex: Irrigation"
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"/>
                  <datalist id="faq-cats">{categories.map(c=><option key={c} value={c!}/>)}</datalist>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ordre</label>
                  <input type="number" value={form.ordre} onChange={e=>setForm({...form,ordre:Number(e.target.value)})}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500"/>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})} className="accent-ev-600"/>
                FAQ active (visible sur le site)
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
