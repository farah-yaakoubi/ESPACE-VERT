"use client";
/**
 * SemencesRecommandation
 * ─────────────────────────────────────────────────────────────────────────
 * Bouton pill INLINE dans la barre des catégories (ml-auto, pas fixed).
 * Ouvre un panneau latéral depuis la droite.
 */

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Loader2, ChevronRight, Sprout,
  RotateCcw, AlertCircle,
  SunMedium, CloudSun, CloudRain, Wind, Warehouse, X,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const EV  = { forest:"#0a5c2e", mid:"#1a7040", leaf:"#7dc040", bg:"#f2faf0", border:"#c0ebb1" };

const MOIS    = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const SOLS    = ["Sableux","Argileux","Limoneux","Siliceux","Calcaire","Humifère","Irrigué","Sec / aride"];
const CLIMATS = [
  { label:"Chaud et sec", icon:SunMedium },
  { label:"Tempéré",      icon:CloudSun  },
  { label:"Humide",       icon:CloudRain },
  { label:"Venteux",      icon:Wind      },
  { label:"Sous serre",   icon:Warehouse },
];
const TAGS = ["Tomate","Poivron","Concombre","Courgette","Laitue","Carotte","Piment","Pastèque","Melon","Oignon","Haricot"];

interface Rec { id_produit:number; nom:string; slug:string; raison:string; categorie:string; images:{url:string;alt:string|null}[] }

/* ── Contenu panneau ────────────────────────────────────────────────────── */
function PanelContent({ onClose }:{ onClose:()=>void }) {
  const [culture, setCulture] = useState("");
  const [mois,    setMois]    = useState("");
  const [sol,     setSol]     = useState("");
  const [climat,  setClimat]  = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Rec[]|null>(null);
  const [error,   setError]   = useState<string|null>(null);
  const [done,    setDone]    = useState(false);

  const submit = useCallback(async (e:React.FormEvent) => {
    e.preventDefault();
    if (!culture.trim()) return;
    setLoading(true); setError(null);
    try {
      const r = await fetch(`${API}/ai/recommend-semences`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ culture:culture.trim(), mois:mois||undefined, sol:sol||undefined, climat:climat||undefined }),
      });
      if (!r.ok) throw new Error("Service indisponible.");
      const d = await r.json();
      setResults(d.recommendations ?? []); setDone(true);
    } catch(e:any) { setError(e.message); }
    finally { setLoading(false); }
  }, [culture,mois,sol,climat]);

  const reset = () => { setCulture(""); setMois(""); setSol(""); setClimat(""); setResults(null); setError(null); setDone(false); };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
        style={{background:`linear-gradient(135deg,${EV.forest},${EV.mid})`}}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center p-1 flex-shrink-0 bg-white/90">
          <Image src="/logos/logo-espace-vert.png" alt="EV" width={28} height={28} className="w-full h-full object-contain"/>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white font-bold text-sm leading-none">Recommandations IA</p>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
              style={{background:"rgba(125,192,64,0.35)",color:"#c8f0a0"}}>IA</span>
          </div>
          <p className="text-white/55 text-[11px] mt-0.5">Sélection intelligente depuis notre catalogue</p>
        </div>
        <button onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-colors"
          aria-label="Fermer"><X size={17}/></button>
      </div>

      {/* Corps */}
      <div className="flex-1 overflow-y-auto px-5 py-5" style={{scrollbarWidth:"thin"}}>

        {!done && (
          <form onSubmit={submit} className="space-y-4">

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-2" style={{color:EV.forest}}>
                Culture *
              </label>
              <input type="text" value={culture} onChange={e=>setCulture(e.target.value)}
                placeholder="Tomate, Poivron, Laitue…" required
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all"
                style={{borderColor:EV.border}}
                onFocus={e=>e.target.style.borderColor=EV.leaf}
                onBlur={e=>e.target.style.borderColor=EV.border}/>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {TAGS.map(t=>(
                  <button key={t} type="button" onClick={()=>setCulture(t)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                    style={culture===t
                      ?{background:EV.forest,color:"#fff"}
                      :{background:EV.bg,color:EV.forest,border:`1px solid ${EV.border}`}}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-gray-500">Mois</label>
                <select value={mois} onChange={e=>setMois(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{borderColor:EV.border}}>
                  <option value="">— Mois —</option>
                  {MOIS.map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-gray-500">Sol</label>
                <select value={sol} onChange={e=>setSol(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                  style={{borderColor:EV.border}}>
                  <option value="">— Sol —</option>
                  {SOLS.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-2 text-gray-500">Climat</label>
              <div className="grid grid-cols-2 gap-2">
                {CLIMATS.map(({label,icon:Icon})=>{
                  const on=climat===label;
                  return (
                    <button key={label} type="button" onClick={()=>setClimat(c=>c===label?"":label)}
                      className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all"
                      style={on?{background:EV.forest,borderColor:EV.forest,color:"#fff"}:{background:"#fff",borderColor:EV.border,color:"#374151"}}>
                      <Icon size={13}/><span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{background:"#fef2f2",border:"1px solid #fecaca"}}>
                <AlertCircle size={13} className="text-red-500 shrink-0"/>
                <p className="text-sm text-red-700 flex-1">{error}</p>
                <button type="button" onClick={()=>setError(null)}><RotateCcw size={11} className="text-red-400"/></button>
              </div>
            )}

            <button type="submit" disabled={loading||!culture.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white shadow-md disabled:opacity-50"
              style={{background:`linear-gradient(135deg,${EV.forest},${EV.mid})`}}>
              {loading
                ?<><Loader2 size={14} className="animate-spin"/>Analyse en cours…</>
                :<><Sparkles size={14}/>Obtenir mes recommandations</>}
            </button>
          </form>
        )}

        {done && results !== null && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <Sprout size={14} style={{color:EV.forest}}/>
                <span style={{color:EV.forest}}>{culture}</span>
                {results.length>0&&<span className="font-normal text-gray-500">— {results.length} résultats</span>}
              </p>
              <button onClick={reset} className="flex items-center gap-1 text-xs font-semibold" style={{color:EV.forest}}>
                <RotateCcw size={10}/>Nouvelle
              </button>
            </div>

            {results.length===0 && (
              <p className="text-sm text-gray-500 rounded-xl px-4 py-3" style={{background:EV.bg}}>
                Aucun produit trouvé. Essayez sans filtre sol/climat.
              </p>
            )}

            <div className="space-y-2.5">
              {results.map((rec,i)=>{
                const img=rec.images?.[0];
                return (
                  <Link key={rec.id_produit} href={`/produits/${rec.slug}`}
                    className="group flex items-center gap-3 rounded-2xl border p-3 transition-all hover:shadow-md"
                    style={{borderColor:EV.border,background:"#fff"}}>
                    <div className="relative w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden" style={{background:EV.bg}}>
                      {img
                        ?<Image src={img.url} alt={img.alt??rec.nom} fill className="object-contain p-1.5" sizes="56px"/>
                        :<div className="absolute inset-0 flex items-center justify-center"><Sprout size={20} style={{color:EV.leaf}}/></div>}
                      <div className="absolute top-1 left-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white" style={{background:EV.forest}}>{i+1}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      {rec.categorie&&<p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{color:EV.leaf}}>{rec.categorie}</p>}
                      <p className="text-sm font-bold text-gray-900 leading-snug group-hover:text-[#0a5c2e] transition-colors truncate">{rec.nom}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{rec.raison}</p>
                    </div>
                    <ChevronRight size={13} className="text-gray-300 group-hover:text-[#0a5c2e] transition-colors flex-shrink-0"/>
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

/* ══════════════════════════════════════════════════════════════════════════
   Export — bouton INLINE (ml-auto dans la barre catégories) + panneau
══════════════════════════════════════════════════════════════════════════ */
export function SemencesRecommandation() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Bouton pill — poussé à droite par ml-auto, inline dans la flex row */}
      <button
        onClick={() => setOpen(v => !v)}
        className="ml-auto shrink-0 flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all"
        style={{
          background: open
            ? "#fff"
            : `linear-gradient(135deg,${EV.forest},${EV.mid})`,
          color:  open ? EV.forest : "#fff",
          border: open ? `1.5px solid ${EV.forest}` : "1.5px solid transparent",
          boxShadow: "0 2px 10px rgba(10,92,46,0.22)",
        }}
        aria-label="Recommandations semences IA"
      >
        {open
          ? <X size={13}/>
          : <Sparkles size={13}/>
        }
        <span className="hidden sm:inline">{open ? "Fermer" : "Recommandations IA"}</span>
        {!open && (
          <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full sm:hidden"
            style={{background:EV.leaf,color:"#fff"}}>IA</span>
        )}
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div key="ov"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={()=>setOpen(false)}/>
        )}
      </AnimatePresence>

      {/* Panneau depuis la droite */}
      <AnimatePresence>
        {open && (
          <motion.aside key="panel"
            initial={{opacity:0,x:"100%"}}
            animate={{opacity:1,x:0}}
            exit={{opacity:0,x:"100%"}}
            transition={{duration:0.28,ease:[0.22,1,0.36,1]}}
            className="fixed inset-y-0 right-0 z-[60] w-full max-w-sm flex flex-col overflow-hidden"
            style={{background:"#fff",boxShadow:"-4px 0 40px rgba(0,0,0,0.14)"}}>
            <PanelContent onClose={()=>setOpen(false)}/>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}