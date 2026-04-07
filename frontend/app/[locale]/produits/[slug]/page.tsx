"use client";

import { useState, useEffect }   from "react";
import { useParams }             from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image    from "next/image";
import Link     from "next/link";
import { useLocale } from "next-intl";
import {
  ArrowLeftIcon, DocumentTextIcon, TagIcon,
  BuildingStorefrontIcon, CheckCircleIcon, EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { getProduitBySlug, sendDevis, type ProduitPublic } from "@/lib/api";
import PageHero from "@/components/PageHero/PageHero";

const EV = { forest:"#0a6030", leaf:"#7dc040", sage:"#4a9060", foam:"#e6f7e8", cream:"#f2faf3" };

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function ProduitDetailPage() {
  const locale = useLocale();
  const params = useParams<{ slug: string }>();

  const [produit,  setProduit]  = useState<ProduitPublic | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [selImg,   setSelImg]   = useState(0);
  const [devisOk,  setDevisOk]  = useState(false);
  const [sending,  setSending]  = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ nom:"", email:"", telephone:"", message:"" });
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  useEffect(() => {
    if (!params.slug) return;
    getProduitBySlug(params.slug).then(res => {
      if (res.success && res.data) setProduit(res.data);
      setLoading(false);
    });
  }, [params.slug]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nom.trim())   e.nom   = "Nom requis";
    if (!form.email.trim()) e.email = "Email requis";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email invalide";
    return e;
  };

  const handleDevis = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSending(true);
    const res = await sendDevis({
      nom:        form.nom,
      email:      form.email,
      telephone:  form.telephone  || undefined,
      message:    form.message    || undefined,
      id_produit: produit?.id_produit,
    });
    setSending(false);
    if (res.success) { setDevisOk(true); setShowForm(false); }
  };

  // Loading skeleton
  if (loading) return (
    <div className="min-h-screen bg-[#f2faf3]">
      <div className="h-64 bg-gray-200 animate-pulse"/>
      <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-10">
        <div className="aspect-square bg-gray-200 rounded-3xl animate-pulse"/>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"/>
          <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"/>
          {[80,100,70,90,65].map((w,i) => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width:`${w}%` }}/>)}
        </div>
      </div>
    </div>
  );

  if (!produit) return (
    <div className="min-h-screen bg-[#f2faf3] flex items-center justify-center">
      <div className="text-center p-12">
        <h2 className="text-2xl font-black text-gray-800 mb-3">Produit introuvable</h2>
        <Link href={`/${locale}/produits`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white"
          style={{ backgroundColor:EV.forest }}>
          <ArrowLeftIcon className="w-4 h-4"/> Voir tous les produits
        </Link>
      </div>
    </div>
  );

  const imgs = produit.images ?? [];
  const cur  = imgs[selImg];

  return (
    <div className="min-h-screen" style={{ backgroundColor:EV.cream }}>
      <PageHero title={produit.nom} subtitle={produit.categorie.nom}
        imageSrc={imgs[0]?.url ?? undefined}
        gradientFrom="#0a6030" gradientTo="#2d6e45" size="sm"
        breadcrumbs={[
          { label:"Produits", href:"/produits" },
          { label:produit.marque.nom },
          { label:produit.nom },
        ]}/>

      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Galerie */}
          <div>
            <div className="relative aspect-square rounded-3xl overflow-hidden border border-gray-100 shadow-lg mb-4"
              style={{ background:"linear-gradient(135deg,#e6f7e8,#c8eccc)" }}>
              {cur?.url ? (
                <Image src={cur.url} alt={cur.alt ?? produit.nom} fill
                  className="object-contain p-8" sizes="(max-width:1024px)100vw,50vw" priority/>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke={EV.forest} strokeWidth="1" strokeLinecap="round">
                    <path d="M12 22V12M12 12C12 6 7 4 2 5c0 6 3 10 8 11 1 .3 2 0 2-4z"/>
                    <path d="M12 12c0-6 5-8 10-7-1 6-4 10-8 11-1 .3-2 0-2-4z"/>
                  </svg>
                </div>
              )}
              {produit.division !== "standard" && (
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl text-xs font-black text-white uppercase"
                  style={{ backgroundColor:EV.leaf }}>
                  {produit.division}
                </div>
              )}
            </div>
            {imgs.length > 1 && (
              <div className="flex gap-3 flex-wrap">
                {imgs.map((img, i) => (
                  <button key={i} onClick={() => setSelImg(i)}
                    className="relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all hover:scale-105"
                    style={{ borderColor: i===selImg ? EV.forest : "#e5e7eb" }}>
                    <Image src={img.url} alt={img.alt??"thumbnail"} fill className="object-contain p-1" sizes="64px"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Infos */}
          <div>
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
                style={{ backgroundColor:EV.foam, color:EV.forest }}>
                <BuildingStorefrontIcon className="w-3.5 h-3.5"/>{produit.marque.nom}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
                style={{ backgroundColor:"#f3f4f6", color:"#374151" }}>
                <TagIcon className="w-3.5 h-3.5"/>{produit.categorie.nom}
              </span>
            </div>

            <h1 className="text-3xl font-black text-gray-900 leading-tight mb-5">{produit.nom}</h1>

            {produit.description && (
              <div className="mb-8">
                <h2 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Description</h2>
                <div className="text-gray-600 leading-relaxed prose prose-sm"
                  dangerouslySetInnerHTML={{ __html:produit.description }}/>
              </div>
            )}

            {produit.fiche_technique && (
              <div className="mb-8 p-5 rounded-2xl border" style={{ borderColor:"#daf0dc", backgroundColor:EV.foam }}>
                <div className="flex items-center gap-2 mb-3">
                  <DocumentTextIcon className="w-5 h-5" style={{ color:EV.sage }}/>
                  <h2 className="text-xs font-black uppercase tracking-wider" style={{ color:EV.sage }}>Fiche technique</h2>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed prose prose-sm"
                  dangerouslySetInnerHTML={{ __html:produit.fiche_technique }}/>
              </div>
            )}

            {/* CTA Devis */}
            {devisOk ? (
              <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }}
                className="flex items-center gap-3 p-5 rounded-2xl"
                style={{ backgroundColor:EV.foam, border:`1px solid ${EV.leaf}` }}>
                <CheckCircleIcon className="w-7 h-7 flex-shrink-0" style={{ color:EV.leaf }}/>
                <div>
                  <p className="font-black" style={{ color:EV.forest }}>Demande envoyée !</p>
                  <p className="text-sm text-gray-500">Notre équipe vous contactera sous 24h.</p>
                </div>
              </motion.div>
            ) : (
              <>
                <button onClick={() => setShowForm(v => !v)}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white text-lg transition-all hover:scale-[1.02] hover:shadow-xl shadow-lg"
                  style={{ backgroundColor:EV.forest }}>
                  <EnvelopeIcon className="w-5 h-5"/> Demander un devis
                </button>

                <AnimatePresence>
                  {showForm && (
                    <motion.form onSubmit={handleDevis}
                      initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
                      className="overflow-hidden mt-4 space-y-4">
                      <Field label="Nom complet *" error={errors.nom}>
                        <input type="text" value={form.nom} onChange={e => setForm(f=>({...f,nom:e.target.value}))}
                          placeholder="Votre nom"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-[#0a6030] transition-colors"/>
                      </Field>
                      <Field label="Email *" error={errors.email}>
                        <input type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))}
                          placeholder="votre@email.com"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-[#0a6030] transition-colors"/>
                      </Field>
                      <Field label="Téléphone">
                        <input type="tel" value={form.telephone} onChange={e => setForm(f=>({...f,telephone:e.target.value}))}
                          placeholder="+216 XX XXX XXX"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-[#0a6030] transition-colors"/>
                      </Field>
                      <Field label="Message (optionnel)">
                        <textarea value={form.message} onChange={e => setForm(f=>({...f,message:e.target.value}))}
                          rows={3} placeholder="Précisez vos besoins…"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-[#0a6030] transition-colors resize-none"/>
                      </Field>
                      <button type="submit" disabled={sending}
                        className="w-full py-3.5 rounded-xl font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-60"
                        style={{ backgroundColor:EV.sage }}>
                        {sending ? "Envoi…" : "Envoyer la demande"}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </>
            )}

            <div className="mt-8">
              <Link href={`/${locale}/produits`}
                className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-[#0a6030] transition-colors">
                <ArrowLeftIcon className="w-4 h-4"/> Retour au catalogue
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
