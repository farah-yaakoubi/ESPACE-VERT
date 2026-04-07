"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence }       from "framer-motion";
import {
  ChevronDownIcon, MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon, XMarkIcon,
} from "@heroicons/react/24/outline";
import Link     from "next/link";
import { useLocale } from "next-intl";
import { getFaqs, type FaqPublic } from "@/lib/api";
import { useDebounce }              from "@/lib/usePagination";
import PageHero from "@/components/PageHero/PageHero";

const EV = { forest:"#0a6030", leaf:"#7dc040", sage:"#4a9060", foam:"#e6f7e8", cream:"#f2faf3", mist:"#daf0dc" };

const CAT_COLORS: Record<string, { bg:string; text:string; border:string }> = {
  "Irrigation":    { bg:"#eff8ff", text:"#1b6b7a", border:"#bae6fd" },
  "Fertilisation": { bg:"#fdfbea", text:"#a08000", border:"#f0e080" },
  "Produits":      { bg:"#e6f7e8", text:"#0a6030", border:"#c8eccc" },
  "Commandes":     { bg:"#fff8f2", text:"#c05a20", border:"#fcd9b4" },
  "Livraison":     { bg:"#f0ecff", text:"#5020a0", border:"#ddd4ff" },
  "Général":       { bg:"#f2faf3", text:"#2d6e45", border:"#daf0dc" },
};
const catStyle = (c: string | null) => CAT_COLORS[c ?? ""] ?? { bg:EV.foam, text:EV.forest, border:EV.mist };

function FaqItem({ faq, i }: { faq:FaqPublic; i:number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.04 }}
      className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <button onClick={() => setOpen(v=>!v)}
        className="w-full flex items-center justify-between px-6 py-5 text-left group">
        <span className="font-bold text-gray-900 text-base pr-6 leading-snug group-hover:text-[#0a6030] transition-colors">
          {faq.question}
        </span>
        <motion.div animate={{ rotate:open?180:0 }} transition={{ duration:0.2 }}
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={open ? { backgroundColor:EV.forest, color:"#fff" } : { backgroundColor:EV.foam, color:EV.sage }}>
          <ChevronDownIcon className="w-4 h-4"/>
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="body"
            initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
            transition={{ duration:0.22, ease:"easeInOut" }}>
            <div className="px-6 pb-6 pt-0">
              <div className="h-px mb-5" style={{ backgroundColor:EV.mist }}/>
              <p className="text-gray-600 leading-relaxed text-[15px] whitespace-pre-line">{faq.reponse}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FaqPage() {
  const locale = useLocale();

  const [faqs,    setFaqs]    = useState<FaqPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [selCat,  setSelCat]  = useState<string|null>(null);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    getFaqs().then(res => {
      if (res.success && res.data) setFaqs(res.data);
      setLoading(false);
    });
  }, []);

  // Catégories uniques extraites des données
  const categories = useMemo(() =>
    Array.from(new Set(faqs.map(f=>f.categorie).filter(Boolean) as string[])),
  [faqs]);

  // Filtrage avec debounce
  const filtered = useMemo(() =>
    faqs.filter(f => {
      const matchCat    = !selCat || f.categorie === selCat;
      const matchSearch = !debouncedSearch ||
        f.question.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        f.reponse.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchCat && matchSearch;
    }),
  [faqs, selCat, debouncedSearch]);

  // Groupement par catégorie
  const grouped: Record<string, FaqPublic[]> = {};
  filtered.forEach(f => {
    const key = f.categorie ?? "Général";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(f);
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor:EV.cream }}>
      <PageHero title="Questions fréquentes"
        subtitle="Trouvez rapidement les réponses à vos questions sur nos produits, commandes et services."
        gradientFrom="#0a6030" gradientTo="#4a9060"
        badge="FAQ" badgeColor="#7dc040" size="md"
        breadcrumbs={[{ label:"FAQ" }]}>
        {/* Barre recherche dans le hero */}
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl max-w-lg">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 flex-shrink-0"/>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Chercher une question…"
            className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm font-medium"/>
          {search && (
            <button onClick={() => setSearch("")}><XMarkIcon className="w-4 h-4 text-gray-400 hover:text-gray-600"/></button>
          )}
        </div>
      </PageHero>

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Filtres catégories */}
        {!loading && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            <button onClick={() => setSelCat(null)}
              className="px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all"
              style={!selCat ? { borderColor:EV.forest, backgroundColor:EV.forest, color:"#fff" } : { borderColor:EV.mist, color:EV.sage }}>
              Toutes
            </button>
            {categories.map(cat => {
              const s = catStyle(cat);
              const active = selCat === cat;
              return (
                <button key={cat} onClick={() => setSelCat(active ? null : cat)}
                  className="px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all"
                  style={active
                    ? { borderColor:s.text, backgroundColor:s.text, color:"#fff" }
                    : { borderColor:s.border, backgroundColor:s.bg, color:s.text }}>
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Contenu */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length:6 }).map((_,i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-5 bg-gray-100 rounded w-3/4 mb-3"/>
                <div className="h-3 bg-gray-100 rounded w-1/4"/>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor:EV.foam }}>
              <MagnifyingGlassIcon className="w-9 h-9" style={{ color:EV.sage }}/>
            </div>
            <h3 className="text-xl font-black text-gray-700 mb-2">Aucune question trouvée</h3>
            <p className="text-gray-400 mb-6">Essayez un autre terme.</p>
            <button onClick={() => { setSearch(""); setSelCat(null); }}
              className="px-6 py-3 rounded-xl font-bold text-white" style={{ backgroundColor:EV.forest }}>
              Voir toutes les FAQ
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([cat, items]) => {
              const s = catStyle(cat);
              return (
                <section key={cat}>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="px-4 py-1.5 rounded-full text-sm font-black border-2"
                      style={{ backgroundColor:s.bg, color:s.text, borderColor:s.border }}>
                      {cat}
                    </span>
                    <div className="flex-1 h-px" style={{ backgroundColor:EV.mist }}/>
                    <span className="text-xs text-gray-400">{items.length} question{items.length>1?"s":""}</span>
                  </div>
                  <div className="space-y-3">
                    {items.map((faq,i) => <FaqItem key={faq.id_faq} faq={faq} i={i}/>)}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* CTA contact */}
        {!loading && (
          <motion.div initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
            className="mt-16 rounded-3xl p-10 text-center relative overflow-hidden"
            style={{ background:`linear-gradient(135deg,${EV.forest} 0%,${EV.sage} 100%)` }}>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 bg-white"
              style={{ transform:"translate(30%,-30%)" }}/>
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
              style={{ backgroundColor:EV.leaf, transform:"translate(-30%,30%)" }}/>
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor:"rgba(255,255,255,0.15)" }}>
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-white"/>
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Vous n'avez pas trouvé votre réponse ?</h3>
              <p className="text-white/75 mb-7 max-w-md mx-auto">Notre équipe répond à toutes vos questions personnalisées.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href={`/${locale}/contact`}
                  className="px-8 py-3.5 rounded-xl font-bold text-[#0a6030] bg-white hover:bg-[#f2faf3] transition-all hover:scale-105 shadow-lg">
                  Nous contacter
                </Link>
                <Link href={`/${locale}/rendez-vous`}
                  className="px-8 py-3.5 rounded-xl font-bold text-white border-2 border-white/40 hover:border-white hover:bg-white/10 transition-all">
                  Prendre rendez-vous
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
