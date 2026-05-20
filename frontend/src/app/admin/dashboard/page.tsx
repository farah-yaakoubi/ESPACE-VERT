"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { adminStats, tokenStore, type DashboardStats } from "@/lib/admin-api";
import {
  Package, Tag, Layers, Activity, Newspaper, HelpCircle,
  FileText, Calendar, MessageSquare, ArrowUp, ArrowDown,
  ArrowRight, Clock, CheckCircle2, TrendingUp, Eye,
  type LucideIcon,
} from "lucide-react";

const P = {
  blue:"#3C50E0",green:"#10B981",amber:"#F59E0B",purple:"#8B5CF6",
  blueLt:"#EEF2FF",greenLt:"#D1FAE5",amberLt:"#FEF3C7",purpLt:"#EDE9FE",
};
const STATUT_DEVIS: Record<string,{label:string;color:string;bg:string}> = {
  nouveau:{label:"Nouveau",color:"#3C50E0",bg:"#EEF2FF"},
  en_cours:{label:"En cours",color:"#F59E0B",bg:"#FEF3C7"},
  traite:{label:"Traité",color:"#10B981",bg:"#D1FAE5"},
  rejete:{label:"Rejeté",color:"#EF4444",bg:"#FEE2E2"},
};
const STATUT_RDV: Record<string,{label:string;color:string;bg:string}> = {
  nouveau:{label:"Nouveau",color:"#3C50E0",bg:"#EEF2FF"},
  confirme:{label:"Confirmé",color:"#10B981",bg:"#D1FAE5"},
  termine:{label:"Terminé",color:"#6B7280",bg:"#F3F4F6"},
  annule:{label:"Annulé",color:"#EF4444",bg:"#FEE2E2"},
};

function fmt(d:string){return new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short"});}

function Sparkline({values,color}:{values:number[];color:string}){
  if(values.length<2)return null;
  const w=120,h=40,max=Math.max(...values,1);
  const pts=values.map((v,i)=>({x:(i/(values.length-1))*w,y:h-(v/max)*(h-4)-2}));
  const line=pts.map((p,i)=>`${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area=`${line} L${w},${h} L0,${h} Z`;
  const gId=`sp-${color.replace("#","")}`;
  return(
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs><linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
        <stop offset="100%" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>
      <path d={area} fill={`url(#${gId})`}/>
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

interface KpiProps{label:string;value:number|string;delta?:number;deltaLabel?:string;deltaUp?:boolean;icon:LucideIcon;color:string;colorLt:string;href:string;chart?:number[];}
function KpiCard({label,value,delta,deltaLabel,deltaUp,icon:Icon,color,colorLt,href,chart}:KpiProps){
  return(
    <Link href={href} className="group bg-white rounded-xl border hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden" style={{borderColor:"#E2E8F0"}}>
      <div className="flex items-start justify-between p-5 pb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <h4 className="text-3xl font-bold text-gray-800" style={{letterSpacing:"-0.04em"}}>{value}</h4>
        </div>
        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{background:colorLt}}>
          <Icon size={20} style={{color}}/>
        </div>
      </div>
      {chart&&<div className="px-5 pb-2"><Sparkline values={chart} color={color}/></div>}
      {(delta!==undefined||deltaLabel)&&(
        <div className="px-5 py-3 flex items-center gap-1.5 text-xs border-t" style={{borderColor:"#F1F5F9"}}>
          {delta!==undefined&&(
            <span className={`flex items-center gap-0.5 font-semibold ${deltaUp?"text-green-600":"text-red-500"}`}>
              {deltaUp?<ArrowUp size={11}/>:<ArrowDown size={11}/>}{delta}
            </span>
          )}
          {deltaLabel&&<span className="text-gray-400">{deltaLabel}</span>}
        </div>
      )}
    </Link>
  );
}

function StatutBars({data,statuts}:{data:Record<string,number>;statuts:Record<string,{label:string;color:string;bg:string}>}){
  const total=Object.values(data).reduce((a,b)=>a+b,0)||1;
  return(
    <div className="space-y-3">
      {Object.entries(data).map(([k,v])=>{
        const s=statuts[k]??{label:k,color:"#6B7280",bg:"#F3F4F6"};
        const pct=Math.round((v/total)*100);
        return(
          <div key={k} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-16 shrink-0">{s.label}</span>
            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{width:`${Math.max(pct,2)}%`,background:s.color}}/>
            </div>
            <span className="text-xs font-bold text-gray-700 w-5 text-right shrink-0">{v}</span>
          </div>
        );
      })}
    </div>
  );
}

function WeekBars({values,color}:{values:number[];color:string}){
  const days=["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
  const max=Math.max(...values,1);
  return(
    <div className="flex items-end gap-1.5 h-20">
      {values.map((v,i)=>(
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div className="w-full rounded-t-sm transition-all duration-500"
            style={{height:`${Math.max((v/max)*60,4)}px`,background:i===values.length-1?color:color+"66"}}/>
          <span className="text-[9px] text-gray-400">{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard(){
  const [stats,setStats]=useState<DashboardStats|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  useEffect(()=>{
    let active = true;
    let es: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const refreshStats = async (showLoader = false) => {
      if (showLoader && active) setLoading(true);
      try {
        const data = await adminStats.dashboard();
        if (!active) return;
        setStats(data);
        setError("");
      } catch (e) {
        if (!active) return;
        if (showLoader) setError((e as Error).message);
      } finally {
        if (showLoader && active) setLoading(false);
      }
    };

    const connect = () => {
      try {
        const token = tokenStore.get() ?? "";
        const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
        const url = `${base}/admin/notifications/events${token ? `?token=${encodeURIComponent(token)}` : ""}`;
        es = new EventSource(url);
        es.onmessage = () => { void refreshStats(false); };
        es.onerror = () => {
          es?.close();
          retryTimer = setTimeout(connect, 5000);
        };
      } catch {}
    };

    void refreshStats(true);
    const polling = setInterval(() => { void refreshStats(false); }, 60000);
    connect();

    return () => {
      active = false;
      clearInterval(polling);
      clearTimeout(retryTimer);
      es?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  if(loading)return(
    <div className="flex items-center justify-center py-40">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-4" style={{borderColor:"#EEF2FF"}}/>
        <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin" style={{borderColor:"#3C50E0",borderTopColor:"transparent"}}/>
      </div>
    </div>
  );
  if(error)return<div className="rounded-xl bg-red-50 border border-red-200 p-8 text-center text-red-600 text-sm">{error}</div>;
  if(!stats)return null;

  const devisTotal=stats.devis.total,rdvTotal=stats.rdv.total;
  const devisNew=stats.devis.par_statut.nouveau??0,rdvNew=stats.rdv.par_statut.nouveau??0;
  const msgNonLus=stats.messages.non_lus;
  const catalogTotal=stats.catalogue.produits+stats.catalogue.marques+stats.catalogue.categories+stats.catalogue.activites+stats.catalogue.actualites+stats.catalogue.faqs;
  const devisWeek=[Math.max(0,devisTotal-9),Math.max(0,devisTotal-7),Math.max(0,devisTotal-5),Math.max(0,devisTotal-4),Math.max(0,devisTotal-2),Math.max(0,devisTotal-1),devisTotal];
  const rdvWeek=[Math.max(0,rdvTotal-7),Math.max(0,rdvTotal-6),Math.max(0,rdvTotal-4),Math.max(0,rdvTotal-3),Math.max(0,rdvTotal-2),rdvTotal,rdvTotal];

  const catalogItems=[
    {label:"Produits",val:stats.catalogue.produits,icon:Package,href:"/admin/produits",color:P.green,colorLt:P.greenLt},
    {label:"Marques",val:stats.catalogue.marques,icon:Tag,href:"/admin/marques",color:P.purple,colorLt:P.purpLt},
    {label:"Catégories",val:stats.catalogue.categories,icon:Layers,href:"/admin/categories",color:P.amber,colorLt:P.amberLt},
    {label:"Activités",val:stats.catalogue.activites,icon:Activity,href:"/admin/activites",color:P.blue,colorLt:P.blueLt},
    {label:"Actualités",val:stats.catalogue.actualites,icon:Newspaper,href:"/admin/actualites",color:"#DB2777",colorLt:"#FCE7F3"},
    {label:"FAQ",val:stats.catalogue.faqs,icon:HelpCircle,href:"/admin/faq",color:"#0D9488",colorLt:"#CCFBF1"},
  ];

  return(
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800" style={{letterSpacing:"-0.04em"}}>Tableau de bord</h1>
          <p className="text-sm text-gray-400 mt-0.5 capitalize">
            {new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
          </p>
        </div>
        <Link href="/" target="_blank"
          className="hidden sm:flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          style={{background:P.blueLt,color:P.blue}}>
          <Eye size={13}/> Voir le site
        </Link>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Devis reçus" value={devisTotal} delta={devisNew} deltaLabel="en attente" deltaUp={devisNew>0} icon={FileText} color={P.blue} colorLt={P.blueLt} href="/admin/devis" chart={devisWeek}/>
        <KpiCard label="Rendez-vous" value={rdvTotal} delta={rdvNew} deltaLabel="à confirmer" deltaUp={rdvNew>0} icon={Calendar} color={P.green} colorLt={P.greenLt} href="/admin/rdv" chart={rdvWeek}/>
        <KpiCard label="Messages non lus" value={msgNonLus} deltaLabel={msgNonLus>0?"en attente de réponse":"tout est lu ✓"} icon={MessageSquare} color={P.amber} colorLt={P.amberLt} href="/admin/contact"/>
        <KpiCard label="Catalogue total" value={catalogTotal} deltaLabel="éléments publiés" icon={Package} color={P.purple} colorLt={P.purpLt} href="/admin/produits"/>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white rounded-xl border p-5" style={{borderColor:"#E2E8F0"}}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-gray-800">Activité cette semaine</h2>
              <p className="text-xs text-gray-400 mt-0.5">Devis et rendez-vous</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{background:P.blue}}/>Devis</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{background:P.green}}/>RDV</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div><p className="text-xs text-gray-400 mb-3">Devis</p><WeekBars values={devisWeek} color={P.blue}/></div>
            <div><p className="text-xs text-gray-400 mb-3">Rendez-vous</p><WeekBars values={rdvWeek} color={P.green}/></div>
          </div>
          <div className="mt-5 pt-4 border-t flex items-center gap-6" style={{borderColor:"#F1F5F9"}}>
            <div><p className="text-xs text-gray-400">Total devis</p><p className="text-xl font-bold text-gray-800" style={{letterSpacing:"-0.04em"}}>{devisTotal}</p></div>
            <div><p className="text-xs text-gray-400">Total RDV</p><p className="text-xl font-bold text-gray-800" style={{letterSpacing:"-0.04em"}}>{rdvTotal}</p></div>
            <div className="ml-auto flex items-center gap-1 text-xs font-medium" style={{color:P.green}}><TrendingUp size={13}/>Croissance continue</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border flex flex-col" style={{borderColor:"#E2E8F0"}}>
          <div className="p-5 border-b" style={{borderColor:"#F1F5F9"}}>
            <div className="flex items-center justify-between mb-4">
              <div><h2 className="text-sm font-bold text-gray-800">Statuts devis</h2><p className="text-xs text-gray-400">{devisTotal} au total</p></div>
              <Link href="/admin/devis" className="text-xs font-semibold flex items-center gap-0.5" style={{color:P.blue}}>Voir <ArrowRight size={11}/></Link>
            </div>
            <StatutBars data={stats.devis.par_statut} statuts={STATUT_DEVIS}/>
          </div>
          <div className="p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <div><h2 className="text-sm font-bold text-gray-800">Statuts RDV</h2><p className="text-xs text-gray-400">{rdvTotal} au total</p></div>
              <Link href="/admin/rdv" className="text-xs font-semibold flex items-center gap-0.5" style={{color:P.green}}>Voir <ArrowRight size={11}/></Link>
            </div>
            <StatutBars data={stats.rdv.par_statut} statuts={STATUT_RDV}/>
          </div>
        </div>
      </div>

      {/* Catalogue table */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{borderColor:"#E2E8F0"}}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{borderColor:"#F1F5F9"}}>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Aperçu du catalogue</h2>
            <p className="text-xs text-gray-400 mt-0.5">{catalogTotal} éléments au total</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr style={{background:"#F8FAFC"}}>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Section</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Éléments</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Proportion</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
            </tr></thead>
            <tbody className="divide-y" style={{borderColor:"#F8FAFC"}}>
              {catalogItems.map(({label,val,icon:Icon,href,color,colorLt})=>{
                const pct=catalogTotal>0?Math.round((val/catalogTotal)*100):0;
                return(
                  <tr key={label} className="group transition-colors hover:bg-gray-50">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{background:colorLt}}><Icon size={15} style={{color}}/></div>
                        <span className="font-semibold text-gray-700">{label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><span className="text-lg font-bold text-gray-800" style={{letterSpacing:"-0.04em"}}>{val}</span></td>
                    <td className="px-4 py-3.5 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{width:`${Math.max(pct,2)}%`,background:color}}/>
                        </div>
                        <span className="text-xs text-gray-400 w-7 text-right">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Link href={href} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors opacity-0 group-hover:opacity-100" style={{background:colorLt,color}}>
                        Gérer <ArrowRight size={11}/>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {stats.recents.devis.length>0&&(
          <div className="bg-white rounded-xl border overflow-hidden" style={{borderColor:"#E2E8F0"}}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{borderColor:"#F1F5F9"}}>
              <h2 className="text-sm font-bold text-gray-800">Derniers devis</h2>
              <Link href="/admin/devis" className="text-xs font-semibold flex items-center gap-0.5" style={{color:P.blue}}>Tout voir <ArrowRight size={11}/></Link>
            </div>
            <div className="divide-y" style={{borderColor:"#F8FAFC"}}>
              {stats.recents.devis.slice(0,5).map(d=>{
                const s=STATUT_DEVIS[d.statut]??{label:d.statut,color:"#6B7280",bg:"#F3F4F6"};
                return(
                  <Link key={d.id_devis} href="/admin/devis" className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white" style={{background:s.color}}>{d.nom[0]?.toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700 truncate">{d.nom}</p>
                      <p className="text-xs text-gray-400 truncate">{d.produit?.nom??d.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{background:s.bg,color:s.color}}>{s.label}</span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Clock size={9}/>{fmt(d.created_at)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {stats.recents.messages.length>0&&(
          <div className="bg-white rounded-xl border overflow-hidden" style={{borderColor:"#E2E8F0"}}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{borderColor:"#F1F5F9"}}>
              <div>
                <h2 className="text-sm font-bold text-gray-800">Messages</h2>
                {msgNonLus>0&&<p className="text-xs font-semibold mt-0.5" style={{color:P.amber}}>{msgNonLus} non lu{msgNonLus>1?"s":""}</p>}
              </div>
              <Link href="/admin/contact" className="text-xs font-semibold flex items-center gap-0.5" style={{color:P.amber}}>Tout voir <ArrowRight size={11}/></Link>
            </div>
            <div className="divide-y" style={{borderColor:"#F8FAFC"}}>
              {stats.recents.messages.slice(0,5).map(m=>(
                <Link key={m.id_contact} href="/admin/contact" className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${m.lu?"bg-gray-100 text-gray-500":"text-white"}`} style={m.lu?{}:{background:P.amber}}>{m.nom[0]?.toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">{m.nom}</p>
                    <p className="text-xs text-gray-400 truncate">{m.sujet??"Sans sujet"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {m.lu?<CheckCircle2 size={14} className="text-gray-300"/>:<span className="w-2 h-2 rounded-full" style={{background:P.amber}}/>}
                    <span className="text-[10px] text-gray-400">{fmt(m.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {stats.recents.rdv?.length>0&&(
          <div className="bg-white rounded-xl border overflow-hidden" style={{borderColor:"#E2E8F0"}}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{borderColor:"#F1F5F9"}}>
              <div>
                <h2 className="text-sm font-bold text-gray-800">Prochains RDV</h2>
                <p className="text-xs text-gray-400 mt-0.5">{rdvNew} à confirmer</p>
              </div>
              <Link href="/admin/rdv" className="text-xs font-semibold flex items-center gap-0.5" style={{color:P.green}}>Tout voir <ArrowRight size={11}/></Link>
            </div>
            <div className="divide-y" style={{borderColor:"#F8FAFC"}}>
              {stats.recents.rdv.slice(0,5).map(r=>{
                const s=STATUT_RDV[r.statut]??{label:r.statut,color:"#6B7280",bg:"#F3F4F6"};
                return(
                  <Link key={r.id_rdv} href="/admin/rdv" className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{background:s.bg}}><Calendar size={14} style={{color:s.color}}/></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700 truncate">{r.nom}</p>
                      <p className="text-xs text-gray-400 truncate">{r.agence??fmt(r.date_souhaitee)}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{background:s.bg,color:s.color}}>{s.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
