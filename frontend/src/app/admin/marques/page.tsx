"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { adminMarques, type MarqueAdmin } from "@/lib/admin-api";
import { Plus, Edit2, Trash2, RefreshCw, X, AlertCircle, Check, Upload, ExternalLink } from "lucide-react";

function toSlug(s:string){return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
const EMPTY={nom:"",slug:"",description:"",logo:"",actif:true};

export default function AdminMarquesPage(){
  const[items,  setItems]  = useState<MarqueAdmin[]>([]);
  const[loading,setLoading]= useState(true);
  const[modal,  setModal]  = useState<"create"|"edit"|null>(null);
  const[editing,setEditing]= useState<MarqueAdmin|null>(null);
  const[form,   setForm]   = useState(EMPTY);
  const[saving, setSaving] = useState(false);
  const[err,    setErr]    = useState("");
  const[ok,     setOk]     = useState("");
  const flash=(m:string)=>{setOk(m);setTimeout(()=>setOk(""),2500);};
  const F=(k:string,v:any)=>setForm(f=>({...f,[k]:v}));

  const load=useCallback(async()=>{
    setLoading(true);
    try{const d=await adminMarques.list();setItems(Array.isArray(d)?d:(d as any).data??[]);}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{load();},[load]);

  const openCreate=()=>{setForm(EMPTY);setEditing(null);setErr("");setModal("create");};
  const openEdit=(m:MarqueAdmin)=>{
    setForm({nom:m.nom,slug:m.slug,description:m.description??"",logo:m.logo??"",actif:m.actif});
    setEditing(m);setErr("");setModal("edit");
  };
  const handleSave=async()=>{
    if(!form.nom.trim()||!form.slug.trim()){setErr("Nom et slug requis.");return;}
    setSaving(true);setErr("");
    try{
      const p={nom:form.nom,slug:form.slug,description:form.description||null,logo:form.logo||null,...(modal==="edit"?{actif:form.actif}:{})};
      if(modal==="create")await adminMarques.create(p as any);
      else if(editing)await adminMarques.update(editing.id_marque,p as any);
      setModal(null);flash(modal==="create"?"Marque créée !":"Marque mise à jour !");load();
    }catch(e:any){setErr(e.message);}finally{setSaving(false);}
  };
  const remove=async(m:MarqueAdmin)=>{
    if(!confirm(`Supprimer « ${m.nom} » ?`))return;
    await adminMarques.remove(m.id_marque);flash("Marque supprimée");load();
  };

  return(
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marques</h1>
          <p className="text-sm text-gray-400 mt-0.5">{items.length} marque{items.length!==1?"s":""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100"><RefreshCw size={16}/></button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-ev-700 hover:bg-ev-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm">
            <Plus size={16}/>Nouvelle marque
          </button>
        </div>
      </div>

      {ok&&<div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3"><Check size={14}/>{ok}</div>}

      {loading?(<div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full animate-spin" style={{border:"3px solid #dcfce7",borderTopColor:"#16a34a"}}/></div>):(
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(m=>(
            <div key={m.id_marque} className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all ${!m.actif?"opacity-60":""}`}>
              {/* Logo */}
              <div className="h-36 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 relative">
                {m.logo?(
                  <Image src={m.logo} alt={m.nom} width={160} height={80} className="object-contain max-h-20"
                    onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                ):(
                  <div className="w-16 h-16 rounded-2xl bg-ev-100 flex items-center justify-center">
                    <span className="text-2xl font-black text-ev-600">{m.nom[0]}</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.actif?"bg-green-100 text-green-700":"bg-gray-100 text-gray-500"}`}>
                    {m.actif?"Active":"Inactive"}
                  </span>
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-gray-900">{m.nom}</h3>
                  <div className="flex gap-1 ml-2">
                    <a href={`/marques/${m.slug}`} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg"><ExternalLink size={12}/></a>
                    <button onClick={()=>openEdit(m)} className="p-1.5 text-gray-400 hover:text-ev-600 hover:bg-ev-50 rounded-lg"><Edit2 size={12}/></button>
                    <button onClick={()=>remove(m)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={12}/></button>
                  </div>
                </div>
                <p className="text-xs text-gray-400 font-mono mb-1">{m.slug}</p>
                {m.description&&<p className="text-xs text-gray-500 line-clamp-2">{m.description}</p>}
                <div className="flex gap-3 mt-2">
                  <span className="text-xs text-gray-400">{m._count?.produits??0} produits</span>
                  <span className="text-xs text-gray-400">{m._count?.categories??0} catégories</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(modal==="create"||modal==="edit")&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{modal==="create"?"Nouvelle marque":`Modifier — ${editing?.nom}`}</h2>
              <button onClick={()=>setModal(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"><X size={18}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {err&&<div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl"><AlertCircle size={14}/>{err}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nom *</label>
                  <input value={form.nom} onChange={e=>{F("nom",e.target.value);if(modal==="create")F("slug",toSlug(e.target.value));}}
                    placeholder="Ex: FertiVert" className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 bg-gray-50"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Slug *</label>
                  <input value={form.slug} onChange={e=>F("slug",toSlug(e.target.value))} placeholder="fertivert"
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 font-mono text-xs bg-gray-50"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Logo <span className="normal-case font-normal text-gray-400">(URL)</span></label>
                <div className="flex gap-2">
                  <input value={form.logo} onChange={e=>F("logo",e.target.value)} placeholder="https://… ou /logos/marque.png"
                    className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 font-mono text-xs bg-gray-50"/>
                  {form.logo&&(
                    <div className="w-10 h-10 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center flex-shrink-0">
                      <Image src={form.logo} alt="Logo" width={36} height={36} className="object-contain p-1"
                        onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                <textarea value={form.description} onChange={e=>F("description",e.target.value)} rows={3}
                  placeholder="Description de la marque…" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 resize-none bg-gray-50"/>
              </div>
              {modal==="edit"&&(
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.actif} onChange={e=>F("actif",e.target.checked)} className="w-4 h-4 accent-ev-600"/>
                  <span className="font-medium text-gray-700">Marque active</span>
                </label>
              )}
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={()=>setModal(null)} className="flex-1 h-10 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-50">Annuler</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 h-10 bg-ev-700 hover:bg-ev-800 text-white text-sm font-semibold rounded-xl disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm">
                {saving?<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:(modal==="create"?"Créer":"Enregistrer")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
