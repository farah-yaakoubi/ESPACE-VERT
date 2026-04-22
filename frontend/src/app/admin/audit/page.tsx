"use client";
import { useEffect, useState, useCallback } from "react";
import { tokenStore } from "@/lib/admin-api";
import { Search, RefreshCw, ChevronLeft, ChevronRight, Clock, User, Tag } from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface AuditLog {
  id_log:      number;
  id_admin:    number | null;
  action:      string;
  entity_name: string;
  entity_id:   number | null;
  detail:      any;
  ip_address:  string | null;
  date_action: string;
  admin?: { nom: string; email: string } | null;
}
interface AuditMeta { total:number; page:number; pages:number; limit:number; }

const ACTION_COLOR: Record<string,{bg:string;text:string}> = {
  CREATE:        {bg:"#f0fdf4",text:"#16a34a"},
  UPDATE:        {bg:"#eff6ff",text:"#2563eb"},
  DELETE:        {bg:"#fef2f2",text:"#dc2626"},
  LOGIN:         {bg:"#f0fdf4",text:"#0d9488"},
  LOGOUT:        {bg:"#f9fafb",text:"#6b7280"},
  STATUS_CHANGE: {bg:"#fefce8",text:"#ca8a04"},
  REPLY:         {bg:"#fdf4ff",text:"#9333ea"},
  TOGGLE:        {bg:"#fff7ed",text:"#ea580c"},
};

function fmt(iso:string){return new Date(iso).toLocaleString("fr-FR",{day:"2-digit",month:"short",year:"2-digit",hour:"2-digit",minute:"2-digit"});}

export default function AuditPage(){
  const[logs,    setLogs]    = useState<AuditLog[]>([]);
  const[meta,    setMeta]    = useState<AuditMeta>({total:0,page:1,pages:1,limit:30});
  const[loading, setLoading] = useState(true);
  const[search,  setSearch]  = useState("");
  const[action,  setAction]  = useState("");
  const[entity,  setEntity]  = useState("");
  const[detail,  setDetail]  = useState<AuditLog|null>(null);
  const[curPage, setCurPage] = useState(1);

  const load=useCallback(async(page=1)=>{
    setLoading(true);
    const p=new URLSearchParams({page:String(page),limit:"30"});
    if(search)p.set("search",search);
    if(action)p.set("action",action);
    if(entity)p.set("entity_name",entity);
    try{
      const r=await fetch(`${BASE}/admin/audit?${p}`,{headers:{Authorization:`Bearer ${tokenStore.get()}`}});
      const j=await r.json();
      setLogs(j.data??[]);setMeta(j.meta??{total:0,page:1,pages:1,limit:30});setCurPage(page);
    }finally{setLoading(false);}
  },[search,action,entity]);

  useEffect(()=>{load(1);},[load]);

  const ACTIONS=["CREATE","UPDATE","DELETE","LOGIN","LOGOUT","STATUS_CHANGE","REPLY","TOGGLE"];
  const ENTITIES=["produit","marque","activite","categorie","actualite","faq","devis","rdv","contact","admin","produit_image"];

  return(
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journal d'audit</h1>
          <p className="text-sm text-gray-400 mt-0.5">{meta.total} entrée{meta.total!==1?"s":""} — traçabilité complète avec historique des suppressions</p>
        </div>
        <button onClick={()=>load(curPage)} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100"><RefreshCw size={16}/></button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input placeholder="Rechercher…" value={search} onChange={e=>setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ev-500 bg-gray-50"/>
        </div>
        <select value={action} onChange={e=>setAction(e.target.value)}
          className="h-9 px-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none min-w-36">
          <option value="">Toutes les actions</option>
          {ACTIONS.map(a=><option key={a} value={a}>{a}</option>)}
        </select>
        <select value={entity} onChange={e=>setEntity(e.target.value)}
          className="h-9 px-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none min-w-36">
          <option value="">Toutes les entités</option>
          {ENTITIES.map(e=><option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading?(<div className="flex justify-center py-16"><div className="w-7 h-7 rounded-full animate-spin" style={{border:"3px solid #dcfce7",borderTopColor:"#16a34a"}}/></div>)
        :logs.length===0?(<div className="text-center py-16 text-gray-400"><p className="text-4xl mb-2 opacity-20">🔍</p><p>Aucune entrée</p></div>):(
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{["Date","Admin","Action","Entité","ID","IP","Détail"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map(l=>{
                  const ac=ACTION_COLOR[l.action]??{bg:"#f9fafb",text:"#374151"};
                  const hasDetail=l.detail&&Object.keys(l.detail).length>0;
                  return(
                    <tr key={l.id_log} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5"><Clock size={11} className="text-gray-300"/>{fmt(l.date_action)}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {l.admin?<div className="flex items-center gap-1.5"><User size={11} className="text-gray-300"/>{l.admin.nom}</div>:<span className="text-gray-300">Système</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{background:ac.bg,color:ac.text}}>{l.action}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-xs text-gray-600"><Tag size={11} className="text-gray-300 flex-shrink-0"/>{l.entity_name}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{l.entity_id??"-"}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{l.ip_address??"—"}</td>
                      <td className="px-4 py-3">
                        {hasDetail?(
                          <button onClick={()=>setDetail(l)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-medium">
                            Voir
                          </button>
                        ):<span className="text-gray-300 text-xs">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {meta.pages>1&&(
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50">
            <p className="text-xs text-gray-400">{meta.total} entrées · page {curPage}/{meta.pages}</p>
            <div className="flex items-center gap-1.5">
              <button disabled={curPage<=1} onClick={()=>load(curPage-1)}
                className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-30 hover:border-ev-400"><ChevronLeft size={14} className="text-gray-600"/></button>
              {Array.from({length:Math.min(meta.pages,7)},(_,i)=>i+1).map(pg=>(
                <button key={pg} onClick={()=>load(pg)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold ${pg===curPage?"bg-ev-700 text-white":"border border-gray-200 text-gray-600 hover:border-ev-400"}`}>
                  {pg}
                </button>
              ))}
              <button disabled={curPage>=meta.pages} onClick={()=>load(curPage+1)}
                className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-30 hover:border-ev-400"><ChevronRight size={14} className="text-gray-600"/></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal détail */}
      {detail&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-900">Détail de l'action</p>
                <p className="text-xs text-gray-400 mt-0.5">{detail.action} · {detail.entity_name} #{detail.entity_id} · {fmt(detail.date_action)}</p>
              </div>
              <button onClick={()=>setDetail(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"><Search size={16}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {detail.detail?.snapshot&&(
                <div className="mb-4">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">📸 Snapshot avant suppression</p>
                  <pre className="bg-red-50 rounded-xl p-4 text-xs font-mono text-red-800 overflow-auto whitespace-pre-wrap">{JSON.stringify(detail.detail.snapshot,null,2)}</pre>
                </div>
              )}
              {detail.detail?.before&&(
                <div className="mb-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Avant</p>
                  <pre className="bg-gray-50 rounded-xl p-4 text-xs font-mono text-gray-700 overflow-auto">{JSON.stringify(detail.detail.before,null,2)}</pre>
                </div>
              )}
              {detail.detail?.after&&(
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Après</p>
                  <pre className="bg-ev-50 rounded-xl p-4 text-xs font-mono text-ev-800 overflow-auto">{JSON.stringify(detail.detail.after,null,2)}</pre>
                </div>
              )}
              {!detail.detail?.snapshot&&!detail.detail?.before&&!detail.detail?.after&&(
                <pre className="bg-gray-50 rounded-xl p-4 text-xs font-mono text-gray-700 overflow-auto whitespace-pre-wrap">{JSON.stringify(detail.detail,null,2)}</pre>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={()=>setDetail(null)} className="w-full h-10 border border-gray-200 text-sm text-gray-600 rounded-xl hover:bg-gray-50">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
