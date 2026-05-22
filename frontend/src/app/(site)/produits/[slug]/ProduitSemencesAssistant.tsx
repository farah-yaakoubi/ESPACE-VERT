"use client";
/**
 * ProduitSemencesAssistant — Calculateur intégré dans la page détail produit.
 * Affiché UNIQUEMENT sur les pages de produits semences.
 * Pré-détecte le type de plante depuis le nom du produit.
 * L'utilisateur choisit ses facteurs → résultat instantané.
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, LandPlot, ChevronDown, ChevronUp, Leaf, Info, CalendarDays, Sprout } from "lucide-react";

const EV = { forest:"#0a5c2e", mid:"#1a7040", leaf:"#7dc040", bg:"#f2faf0", border:"#c0ebb1" };

/* ── Base agronomique ──────────────────────────────────────────────────── */
interface SeedData { name:string; icon:string; g_m2:number; rangs:number; plants:number; germ:number; prof:[number,number]; kgRatio:number }

const DB: Record<string,SeedData> = {
  tomate:    { name:"Tomate",    icon:"🍅", g_m2:3,   rangs:60,  plants:50,  germ:85, prof:[0.5,1],   kgRatio:250000 },
  poivron:   { name:"Poivron",   icon:"🫑", g_m2:4,   rangs:60,  plants:40,  germ:80, prof:[0.5,1],   kgRatio:160000 },
  piment:    { name:"Piment",    icon:"🌶️", g_m2:5,   rangs:50,  plants:40,  germ:78, prof:[0.5,1],   kgRatio:180000 },
  concombre: { name:"Concombre", icon:"🥒", g_m2:1.5, rangs:120, plants:50,  germ:90, prof:[1,2],     kgRatio:120000 },
  courgette: { name:"Courgette", icon:"🥬", g_m2:1,   rangs:100, plants:80,  germ:92, prof:[2,3],     kgRatio:30000  },
  "pastèque":{ name:"Pastèque",  icon:"🍉", g_m2:0.5, rangs:200, plants:100, germ:88, prof:[2,3],     kgRatio:35000  },
  melon:     { name:"Melon",     icon:"🍈", g_m2:0.8, rangs:150, plants:80,  germ:85, prof:[1.5,2.5], kgRatio:40000  },
  laitue:    { name:"Laitue",    icon:"🥬", g_m2:15,  rangs:30,  plants:25,  germ:82, prof:[0.5,1],   kgRatio:900000 },
  carotte:   { name:"Carotte",   icon:"🥕", g_m2:50,  rangs:25,  plants:8,   germ:75, prof:[1,2],     kgRatio:700000 },
  oignon:    { name:"Oignon",    icon:"🧅", g_m2:25,  rangs:30,  plants:15,  germ:78, prof:[1,1.5],   kgRatio:250000 },
  haricot:   { name:"Haricot",   icon:"🫘", g_m2:8,   rangs:50,  plants:15,  germ:88, prof:[2,4],     kgRatio:2500   },
  pois:      { name:"Pois",      icon:"🟢", g_m2:20,  rangs:40,  plants:8,   germ:90, prof:[3,5],     kgRatio:5000   },
};

const SOL_MOD: Record<string,number> = {
  "Sableux":0.9,"Argileux":1.1,"Limoneux":1.0,"Siliceux":0.95,
  "Calcaire":1.05,"Humifère":1.0,"Irrigué":1.0,"Sec / aride":1.15,
};
const MODE_MOD: Record<string,number> = {
  "Plein champ":1.0,"Sous serre":0.85,"Pépinière":0.7,"Godet / plateau":0.65,
};

function detectPlant(name:string): string {
  const n = name.toLowerCase();
  if (n.includes("tomat"))  return "tomate";
  if (n.includes("poivron")) return "poivron";
  if (n.includes("piment")) return "piment";
  if (n.includes("concombr")) return "concombre";
  if (n.includes("courgett")) return "courgette";
  if (n.includes("past")||n.includes("watermel")) return "pastèque";
  if (n.includes("melon"))  return "melon";
  if (n.includes("laitu")||n.includes("salade")) return "laitue";
  if (n.includes("carot"))  return "carotte";
  if (n.includes("oignon")) return "oignon";
  if (n.includes("haricot")) return "haricot";
  if (n.includes("pois"))   return "pois";
  return "tomate";
}

const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const SOLS = Object.keys(SOL_MOD);
const MODES = Object.keys(MODE_MOD);

/* ══════════════════════════════════════════════════════════════════════════ */
export function ProduitSemencesAssistant({ productName }:{ productName:string }) {
  const detected = useMemo(()=>detectPlant(productName),[productName]);
  const [open,    setOpen]    = useState(false);
  const [plante,  setPlante]  = useState(detected);
  const [surface, setSurface] = useState(1000);
  const [unite,   setUnite]   = useState<"m2"|"ha">("m2");
  const [mois,    setMois]    = useState("");
  const [sol,     setSol]     = useState("");
  const [mode,    setMode]    = useState("Plein champ");
  const [marge,   setMarge]   = useState(15);
  const [result,  setResult]  = useState<null|{graines:number;kg:number;plants:number;rangs:number;ecart:string;prof:string;fs:number;fm:number}>(null);

  const p  = DB[plante];
  const m2 = unite==="ha" ? surface*10000 : surface;

  function calc() {
    const fs=SOL_MOD[sol]??1, fm=MODE_MOD[mode]??1;
    const density=p.g_m2*fs*fm;
    const factor=(1+marge/100)/(p.germ/100);
    const graines=Math.ceil(m2*density*factor);
    const kg=graines/p.kgRatio;
    const side=Math.sqrt(m2)*100;
    const rangs=Math.ceil(side/p.rangs);
    const plants=rangs*Math.ceil(side/p.plants);
    setResult({graines,kg,plants,rangs,ecart:`${p.rangs}×${p.plants} cm`,prof:`${p.prof[0]}–${p.prof[1]} cm`,fs,fm});
  }

  return (
    <section className="container-ev pb-10">
      <div className="rounded-3xl overflow-hidden"
        style={{background:"#fff",border:`1.5px solid ${EV.border}`,boxShadow:"0 4px 24px rgba(10,92,46,0.09)"}}>

        {/* ── En-tête accordéon ── */}
        <button onClick={()=>setOpen(v=>!v)}
          className="w-full flex items-center gap-4 px-6 py-5 text-left transition-colors"
          style={{background:open?EV.bg:"#fff"}}>

          {/* Icône calculatrice */}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{background:`linear-gradient(135deg,${EV.leaf},${EV.forest})`}}>
            <Calculator size={24} className="text-white"/>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-gray-900 text-base">Calculateur de semences</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest"
                style={{background:`${EV.leaf}20`,color:EV.forest,border:`1px solid ${EV.border}`}}>
                {p.icon} {p.name} — pré-sélectionné
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Surface · sol · mode de culture · taux de germination · marge de sécurité
            </p>
          </div>

          <div style={{color:EV.forest,flexShrink:0}}>
            {open?<ChevronUp size={20}/>:<ChevronDown size={20}/>}
          </div>
        </button>

        {/* ── Corps ── */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}
              transition={{duration:0.3,ease:[0.22,1,0.36,1]}} style={{overflow:"hidden"}}>
              <div className="px-6 pb-8 pt-4" style={{borderTop:`1px solid ${EV.border}`}}>

                {/* Paramètres */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                  {/* Plante */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{color:EV.forest}}>
                      <Leaf size={10} className="inline mr-1"/>Plante
                    </label>
                    <select value={plante} onChange={e=>{setPlante(e.target.value);setResult(null);}}
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                      style={{borderColor:EV.border}}
                      onFocus={e=>e.target.style.borderColor=EV.leaf}
                      onBlur={e=>e.target.style.borderColor=EV.border}>
                      {Object.entries(DB).map(([k,v])=>(
                        <option key={k} value={k}>{v.icon} {v.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Surface */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{color:EV.forest}}>
                      <LandPlot size={10} className="inline mr-1"/>Surface
                    </label>
                    <div className="flex gap-2">
                      <input type="number" min="1" value={surface}
                        onChange={e=>{setSurface(Number(e.target.value)||0);setResult(null);}}
                        className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none"
                        style={{borderColor:EV.border}}
                        onFocus={e=>e.target.style.borderColor=EV.leaf}
                        onBlur={e=>e.target.style.borderColor=EV.border}/>
                      <select value={unite} onChange={e=>{setUnite(e.target.value as any);setResult(null);}}
                        className="rounded-xl border px-3 py-2.5 text-sm outline-none"
                        style={{borderColor:EV.border}}>
                        <option value="m2">m²</option>
                        <option value="ha">ha</option>
                      </select>
                    </div>
                  </div>

                  {/* Mode culture */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{color:EV.forest}}>
                      <Sprout size={10} className="inline mr-1"/>Mode de culture
                    </label>
                    <select value={mode} onChange={e=>{setMode(e.target.value);setResult(null);}}
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                      style={{borderColor:EV.border}}>
                      {MODES.map(m=><option key={m}>{m}</option>)}
                    </select>
                  </div>

                  {/* Mois */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-gray-400">
                      <CalendarDays size={10} className="inline mr-1"/>Mois de semis
                    </label>
                    <select value={mois} onChange={e=>setMois(e.target.value)}
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                      style={{borderColor:EV.border}}>
                      <option value="">— Optionnel —</option>
                      {MOIS.map(m=><option key={m}>{m}</option>)}
                    </select>
                  </div>

                  {/* Sol */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-gray-400">Sol</label>
                    <select value={sol} onChange={e=>{setSol(e.target.value);setResult(null);}}
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                      style={{borderColor:EV.border}}>
                      <option value="">— Optionnel —</option>
                      {SOLS.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Marge */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 text-gray-400">
                      Marge sécurité : <span style={{color:EV.forest}}>{marge}%</span>
                    </label>
                    <input type="range" min="5" max="30" step="5" value={marge}
                      onChange={e=>{setMarge(Number(e.target.value));setResult(null);}}
                      className="w-full mt-1" style={{accentColor:EV.leaf}}/>
                    <div className="flex justify-between text-[10px] text-gray-400 mt-0.5"><span>5%</span><span>30%</span></div>
                  </div>
                </div>

                {/* Info agronomique */}
                <div className="mt-4 flex items-start gap-2 rounded-xl px-4 py-3"
                  style={{background:EV.bg,border:`1px solid ${EV.border}`}}>
                  <Info size={13} className="mt-0.5 flex-shrink-0" style={{color:EV.forest}}/>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    <span className="font-bold">{p.icon} {p.name}</span> — densité {p.g_m2} g/m²,
                    germination {p.germ}%, écartement {p.rangs}×{p.plants} cm, prof. {p.prof[0]}–{p.prof[1]} cm.
                    {sol&&` Sol "${sol}" : ×${SOL_MOD[sol]}.`}
                    {mode!=="Plein champ"&&` Mode "${mode}" : ×${MODE_MOD[mode]}.`}
                  </p>
                </div>

                {/* CTA */}
                <button onClick={calc} disabled={!surface}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white shadow-md disabled:opacity-50 active:scale-[0.98] transition-transform"
                  style={{background:`linear-gradient(135deg,${EV.leaf},${EV.forest})`}}>
                  <Calculator size={15}/>Calculer mes besoins en semences
                </button>

                {/* Résultat */}
                <AnimatePresence>
                  {result && (
                    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                      transition={{duration:0.3}} className="mt-6">

                      <div className="rounded-2xl p-5 text-center mb-4"
                        style={{background:`linear-gradient(135deg,${EV.bg},#ddf0d0)`,border:`1.5px solid ${EV.border}`}}>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                          Pour {m2.toLocaleString("fr-FR")} m² · {p.icon} {p.name}
                          {mode!=="Plein champ"&&<> · {mode}</>}
                        </p>
                        <p className="text-6xl font-black leading-none" style={{color:EV.forest}}>
                          {result.graines.toLocaleString("fr-FR")}
                        </p>
                        <p className="text-base font-semibold text-gray-600 mt-1">graines</p>
                        <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-bold"
                          style={{background:`${EV.forest}15`,color:EV.forest}}>
                          ≈&nbsp;{result.kg<0.1?`${(result.kg*1000).toFixed(0)} g`:result.kg<1?`${result.kg.toFixed(2)} kg`:`${result.kg.toFixed(1)} kg`}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {[
                          {l:"Plants",    v:result.plants.toLocaleString("fr-FR"),c:"#1d4ed8",bg:"#eff6ff",bd:"#bfdbfe"},
                          {l:"Rangs",     v:result.rangs.toLocaleString("fr-FR"), c:"#7c3aed",bg:"#f5f3ff",bd:"#ddd6fe"},
                          {l:"Écartement",v:result.ecart,                         c:"#0369a1",bg:"#f0f9ff",bd:"#bae6fd"},
                          {l:"Profondeur",v:result.prof,                          c:"#92400e",bg:"#fffbeb",bd:"#fde68a"},
                        ].map(({l,v,c,bg,bd})=>(
                          <div key={l} className="rounded-xl p-3 text-center" style={{background:bg,border:`1px solid ${bd}`}}>
                            <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{color:c}}>{l}</p>
                            <p className="text-sm font-black" style={{color:c}}>{v}</p>
                          </div>
                        ))}
                      </div>

                      {/* Facteurs sol / mode */}
                      {(sol||mode!=="Plein champ")&&(
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {sol&&(
                            <div className="rounded-xl px-3 py-2.5 text-center" style={{background:EV.bg,border:`1px solid ${EV.border}`}}>
                              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Facteur sol</p>
                              <p className="text-base font-black" style={{color:EV.forest}}>×{result.fs}</p>
                              <p className="text-[10px] text-gray-500">{sol}</p>
                            </div>
                          )}
                          {mode!=="Plein champ"&&(
                            <div className="rounded-xl px-3 py-2.5 text-center" style={{background:EV.bg,border:`1px solid ${EV.border}`}}>
                              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Facteur mode</p>
                              <p className="text-base font-black" style={{color:EV.forest}}>×{result.fm}</p>
                              <p className="text-[10px] text-gray-500">{mode}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {mois&&(
                        <p className="mt-3 text-[11px] rounded-xl px-4 py-2.5 text-gray-700"
                          style={{background:"#fffbeb",border:"1px solid #fde68a"}}>
                          📅 <span className="font-bold">Semis en {mois}</span> — vérifiez la compatibilité climatique de votre région.
                        </p>
                      )}

                      <p className="text-[10px] text-center text-gray-400 mt-4">
                        Marge sécurité {marge}% incluse · Valeurs indicatives · Consultez les recommandations du fabricant
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}