"use client";
import { useEffect, useState, useCallback } from "react";
import { tokenStore } from "@/lib/admin-api";
import { Search, RefreshCw, ChevronLeft, ChevronRight, Clock, User, Tag, X } from "lucide-react";

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

const ACTION_LABEL: Record<string,string> = {
  CREATE:        "Création",
  UPDATE:        "Modification",
  DELETE:        "Suppression",
  LOGIN:         "Connexion",
  LOGOUT:        "Déconnexion",
  STATUS_CHANGE: "Changement de statut",
  REPLY:         "Réponse",
  TOGGLE:        "Activation/Désactivation",
  VIEW:          "Consultation",
  ADD_IMAGE:     "Ajout image",
  UPDATE_IMAGE:  "Modification image",
  SET_PRINCIPALE:"Image principale définie",
};

const ENTITY_LABEL: Record<string,string> = {
  produit:       "Produit",
  marque:        "Marque",
  activite:      "Activité",
  categorie:     "Catégorie",
  actualite:     "Actualité",
  faq:           "FAQ",
  devis:         "Devis",
  rdv:           "Rendez-vous",
  contact:       "Message contact",
  admin:         "Administrateur",
  produit_image: "Image produit",
  audit:         "Audit",
};

const FIELD_LABEL: Record<string,string> = {
  nom:           "Nom",
  email:         "Email",
  actif:         "Statut actif",
  avatar:        "Photo de profil",
  permissions:   "Permissions",
  id_role:       "Rôle",
  mot_de_passe:  "Mot de passe",
  password:      "Mot de passe",
  titre:         "Titre",
  contenu:       "Contenu",
  statut:        "Statut",
  reponse_admin: "Réponse",
  note_interne:  "Note interne",
  prix:          "Prix",
  description:   "Description",
  image:         "Image",
  actif_label:   "Actif",
  publiee:       "Publiée",
  slug:          "Slug",
  ordre:         "Ordre",
  deleted_at:    "Supprimé le",
};

function fmt(iso:string){
  return new Date(iso).toLocaleString("fr-FR",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
}

/** Génère une phrase lisible à partir du détail de l'audit */
function renderDetail(log: AuditLog): React.ReactNode {
  const d = log.detail;
  if (!d || Object.keys(d).length === 0) return null;

  const entity = ENTITY_LABEL[log.entity_name] ?? log.entity_name;
  const lines: string[] = [];

  // Suppression avec snapshot
  if (d.snapshot) {
    const snap = d.snapshot;
    const name = snap.nom ?? snap.titre ?? snap.email ?? `#${log.entity_id}`;
    lines.push(`"${name}" a été supprimé définitivement.`);
    if (d.deleted_at) lines.push(`Supprimé le ${fmt(d.deleted_at)}`);
    return (
      <div className="space-y-1">
        {lines.map((l,i) => <p key={i} className="text-xs text-red-700">{l}</p>)}
      </div>
    );
  }

  // Changement de statut
  if (d.action === "change_password") return <p className="text-xs text-blue-700">Mot de passe modifié</p>;
  if (d.ancien_statut && d.nouveau_statut) {
    return <p className="text-xs text-amber-700">Statut changé : <b>{d.ancien_statut}</b> → <b>{d.nouveau_statut}</b></p>;
  }

  // Champs modifiés (before/after)
  if (d.before || d.after) {
    const before = d.before ?? {};
    const after  = d.after  ?? {};
    const keys   = [...new Set([...Object.keys(before), ...Object.keys(after)])];
    return (
      <div className="space-y-1">
        {keys.map(k => {
          const label = FIELD_LABEL[k] ?? k;
          const prev  = before[k];
          const next  = after[k];
          if (prev === next) return null;
          if (Array.isArray(next)) {
            return <p key={k} className="text-xs text-blue-700"><b>{label}</b> mis à jour ({next.length} valeur{next.length>1?"s":""})</p>;
          }
          if (typeof next === "boolean") {
            return <p key={k} className="text-xs text-blue-700"><b>{label}</b> : {next ? "Activé" : "Désactivé"}</p>;
          }
          return (
            <p key={k} className="text-xs text-blue-700">
              <b>{label}</b> modifié{prev !== undefined ? ` (ancienne valeur : ${String(prev).substring(0,40)})` : ""}
            </p>
          );
        })}
      </div>
    );
  }

  // Champs libres lisibles
  const knownKeys = Object.keys(d).filter(k => k !== "action");
  if (knownKeys.length > 0) {
    return (
      <div className="space-y-0.5">
        {knownKeys.map(k => {
          const label = FIELD_LABEL[k] ?? k;
          const val   = d[k];
          if (Array.isArray(val)) return <p key={k} className="text-xs text-gray-600"><b>{label}</b> : {val.length} élément{val.length>1?"s":""}</p>;
          if (typeof val === "boolean") return <p key={k} className="text-xs text-gray-600"><b>{label}</b> : {val?"Oui":"Non"}</p>;
          return <p key={k} className="text-xs text-gray-600"><b>{label}</b> : {String(val).substring(0,80)}</p>;
        })}
      </div>
    );
  }

  return null;
}

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
          <p className="text-sm text-gray-400 mt-0.5">{meta.total} entrée{meta.total!==1?"s":""} — traçabilité complète</p>
        </div>
        <button onClick={()=>load(curPage)} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100"><RefreshCw size={16}/></button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input placeholder="Rechercher…" value={search} onChange={e=>setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50"/>
        </div>
        <select value={action} onChange={e=>setAction(e.target.value)}
          className="h-9 px-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none min-w-44">
          <option value="">Toutes les actions</option>
          {ACTIONS.map(a=><option key={a} value={a}>{ACTION_LABEL[a]??a}</option>)}
        </select>
        <select value={entity} onChange={e=>setEntity(e.target.value)}
          className="h-9 px-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none min-w-44">
          <option value="">Toutes les entités</option>
          {ENTITIES.map(e=><option key={e} value={e}>{ENTITY_LABEL[e]??e}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading?(<div className="flex justify-center py-16"><div className="w-7 h-7 rounded-full animate-spin" style={{border:"3px solid #dcfce7",borderTopColor:"#16a34a"}}/></div>)
        :logs.length===0?(<div className="text-center py-16 text-gray-400"><p className="text-4xl mb-2 opacity-20">🔍</p><p>Aucune entrée</p></div>):(
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{["Date","Admin","Action","Entité","Détail"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map(l=>{
                  const ac=ACTION_COLOR[l.action]??{bg:"#f9fafb",text:"#374151"};
                  const detailNode = renderDetail(l);
                  const entity = ENTITY_LABEL[l.entity_name] ?? l.entity_name;
                  return(
                    <tr key={l.id_log} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5"><Clock size={11} className="text-gray-300"/>{fmt(l.date_action)}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {l.admin?<div className="flex items-center gap-1.5"><User size={11} className="text-gray-300"/>{l.admin.nom}</div>:<span className="text-gray-300">Système</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{background:ac.bg,color:ac.text}}>
                          {ACTION_LABEL[l.action]??l.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Tag size={11} className="text-gray-300 flex-shrink-0"/>
                          {entity}
                          {l.entity_id && <span className="text-gray-400 font-mono">#{l.entity_id}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        {detailNode ?? <span className="text-gray-300 text-xs">—</span>}
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
                className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-30 hover:border-green-400"><ChevronLeft size={14} className="text-gray-600"/></button>
              {Array.from({length:Math.min(meta.pages,7)},(_,i)=>i+1).map(pg=>(
                <button key={pg} onClick={()=>load(pg)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold ${pg===curPage?"bg-green-700 text-white":"border border-gray-200 text-gray-600 hover:border-green-400"}`}>
                  {pg}
                </button>
              ))}
              <button disabled={curPage>=meta.pages} onClick={()=>load(curPage+1)}
                className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-30 hover:border-green-400"><ChevronRight size={14} className="text-gray-600"/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}