"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

// ─── AGENCES ────────────────────────────────────────────────────────────────

const agences = [
  {
    id: "tunis",
    nom: "Agence Tunis",
    court: "Tunis",
    emoji: "🏢",
    adresse: "69, rue Abderrazak Chraibi",
    ville: "Tunis, 1001",
    tel: "+21671333858",
    telDisplay: "(+216) 71 333 858",
    tel2: "+21671348404",
    tel2Display: "(+216) 71 348 404",
    fax: "(+216) 71 344 158",
    email: "secretariat.groupeev@planet.tn",
    horaires: "Lun–Ven 8h–17h · Sam 8h–12h",
    lat: 36.8095,
    lng: 10.1761,
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=69+rue+Abderrazak+Chraibi+Tunis",
    iframeSrc: "https://maps.google.com/maps?q=36.8095,10.1761&z=16&output=embed",
    color: "#1a3d0a",
  },
  {
    id: "soliman",
    nom: "Agence Soliman",
    court: "Soliman",
    emoji: "🏪",
    adresse: "MGR2+XGH, Route R43",
    ville: "Soliman",
    tel: "+21672333143",
    telDisplay: "(+216) 72 333 143",
    horaires: "Lun–Ven 8h–17h · Sam 8h–12h",
    lat: 36.7011,
    lng: 10.4886,
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=36.7011,10.4886",
    iframeSrc: "https://maps.google.com/maps?q=36.7011,10.4886&z=15&output=embed",
    color: "#0d3b6e",
  },
  {
    id: "borj-amri",
    nom: "Agence Borj Amri",
    court: "Borj Amri",
    emoji: "🏭",
    adresse: "PXQ2+R9, Sidi Ali El Hattab",
    ville: "Borj Amri",
    tel: "+21671234567",
    telDisplay: "(+216) 71 234 567",
    horaires: "Lun–Ven 8h–17h · Sam 8h–12h",
    lat: 36.9117,
    lng: 9.9728,
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=36.9117,9.9728",
    iframeSrc: "https://maps.google.com/maps?q=36.9117,9.9728&z=15&output=embed",
    color: "#7c2d12",
  },
  {
    id: "sfax",
    nom: "Agence Sfax",
    court: "Sfax",
    emoji: "🏬",
    adresse: "MPV7+GG3, rue béjaia",
    ville: "Route de Gabes, Sfax 3049",
    tel: "+21674000000",
    telDisplay: "(+216) 74 000 000",
    horaires: "Lun–Ven 8h–17h · Sam 8h–12h",
    lat: 34.7252,
    lng: 10.7605,
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=34.7252,10.7605",
    iframeSrc: "https://maps.google.com/maps?q=34.7252,10.7605&z=15&output=embed",
    color: "#134e4a",
  },
];

// ─── TYPES FORMULAIRE ─────────────────────────────────────────────────────────

type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  agence: string;
};

type QuoteFormData = {
  name: string;
  email: string;
  phone: string;
  company: string;
  product: string;
  quantity: string;
  details: string;
  agence: string;
};

// ─── CHAMP INPUT ──────────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2d5a1b] transition-colors bg-white";

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<"contact" | "devis">("contact");
  const [activeAgence, setActiveAgence] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // État formulaire contact
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: "", email: "", phone: "", subject: "", message: "", agence: "tunis",
  });

  // État formulaire devis
  const [quoteForm, setQuoteForm] = useState<QuoteFormData>({
    name: "", email: "", phone: "", company: "", product: "", quantity: "", details: "", agence: "tunis",
  });

  const validate = (data: Record<string, string>, required: string[]) => {
    const errs: Record<string, string> = {};
    required.forEach((f) => {
      if (!data[f]?.trim()) errs[f] = "Ce champ est requis";
    });
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errs.email = "Email invalide";
    }
    return errs;
  };

  const handleSubmit = async (type: "contact" | "devis") => {
    const data = type === "contact" ? contactForm : quoteForm;
    const required = type === "contact"
      ? ["name", "email", "subject", "message"]
      : ["name", "email", "phone", "product", "details"];

    const errs = validate(data as any, required);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...data }),
      });
    } catch (_) {}

    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 6000);
    if (type === "contact") {
      setContactForm({ name: "", email: "", phone: "", subject: "", message: "", agence: "tunis" });
    } else {
      setQuoteForm({ name: "", email: "", phone: "", company: "", product: "", quantity: "", details: "", agence: "tunis" });
    }
  };

  const agence = agences[activeAgence];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f7faf5] to-white">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#1a3d0a] via-[#2d5a1b] to-[#4a7c2f] text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-white/40 text-[11px] font-black uppercase tracking-widest mb-3">Contact</p>
            <h1 className="text-4xl lg:text-5xl font-black mb-3">Contactez-nous</h1>
            <p className="text-white/70 text-lg max-w-xl">Notre équipe d'experts est disponible pour répondre à toutes vos questions agricoles.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ── GAUCHE : Infos + Maps ──────────────────────────────────── */}
          <div className="space-y-6">

            {/* Sélecteur d'agence */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-[#2d5a1b] rounded-full" />
                <h2 className="text-lg font-black text-gray-900">Nos Agences</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {agences.map((a, i) => (
                  <button
                    key={a.id}
                    onClick={() => setActiveAgence(i)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all text-left ${
                      activeAgence === i
                        ? "border-transparent text-white shadow-md"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 bg-white"
                    }`}
                    style={activeAgence === i ? { backgroundColor: a.color } : {}}
                  >
                    <span className="text-lg">{a.emoji}</span>
                    <span>{a.court}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Infos agence sélectionnée */}
            <AnimatePresence mode="wait">
              <motion.div
                key={agence.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: agence.color + "18" }}>
                    <BuildingOffice2Icon className="w-5 h-5" style={{ color: agence.color }} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">{agence.nom}</h3>
                    <p className="text-xs text-gray-400">{agence.ville}</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: agence.color }} />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{agence.adresse}</p>
                      <p className="text-xs text-gray-500">{agence.ville}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-5 h-5 flex-shrink-0" style={{ color: agence.color }} />
                    <div>
                      <a href={`tel:${agence.tel}`} className="text-sm font-bold hover:underline" style={{ color: agence.color }}>{agence.telDisplay}</a>
                      {agence.tel2Display && (
                        <a href={`tel:${agence.tel2}`} className="block text-sm font-semibold text-gray-500 hover:text-gray-800">{agence.tel2Display}</a>
                      )}
                    </div>
                  </div>
                  {agence.email && (
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="w-5 h-5 flex-shrink-0" style={{ color: agence.color }} />
                      <a href={`mailto:${agence.email}`} className="text-sm font-semibold text-gray-700 hover:underline">{agence.email}</a>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <ClockIcon className="w-5 h-5 flex-shrink-0 text-gray-400" />
                    <p className="text-sm text-gray-600">{agence.horaires}</p>
                  </div>
                </div>

                <a
                  href={agence.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 text-sm font-bold text-white rounded-xl hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: agence.color }}
                >
                  <MapPinIcon className="w-4 h-4" /> Obtenir l'itinéraire
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </a>
              </motion.div>
            </AnimatePresence>

            {/* CARTE GOOGLE MAPS ─────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={agence.id + "-map"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
                style={{ height: 320 }}
              >
                <iframe
                  src={agence.iframeSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Localisation ${agence.nom}`}
                />
              </motion.div>
            </AnimatePresence>

            {/* Toutes les agences sur une seule carte */}
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <p className="text-sm font-black text-gray-700">📍 Toutes nos agences en Tunisie</p>
              </div>
              <iframe
                src="https://www.google.com/maps/d/embed?mid=1&q=Espace+Vert+Tunisie"
                width="100%"
                height="260"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Toutes les agences Espace Vert"
              />
              {/* Fallback liens directs */}
              <div className="p-4 bg-gray-50 grid grid-cols-2 gap-2">
                {agences.map((a, i) => (
                  <a
                    key={a.id}
                    href={a.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-white hover:shadow-sm transition-all bg-white"
                  >
                    <span className="text-base">{a.emoji}</span>
                    <span>{a.court}</span>
                    <ArrowRightIcon className="w-3 h-3 ml-auto text-gray-400" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ── DROITE : Formulaires ────────────────────────────────────── */}
          <div>
            {/* Toggle Contact / Devis */}
            <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => { setActiveTab("contact"); setErrors({}); }}
                className={`flex-1 py-3 rounded-lg font-black text-sm transition-all ${
                  activeTab === "contact" ? "bg-white text-[#1a3d0a] shadow-md" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                ✉️ Message
              </button>
              <button
                onClick={() => { setActiveTab("devis"); setErrors({}); }}
                className={`flex-1 py-3 rounded-lg font-black text-sm transition-all ${
                  activeTab === "devis" ? "bg-white text-[#1a3d0a] shadow-md" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                📋 Demande de Devis
              </button>
            </div>

            {/* Succès */}
            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-green-50 border-2 border-green-400 rounded-2xl p-5 mb-5 flex items-center gap-4"
                >
                  <CheckCircleIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-black text-green-900">Message envoyé !</h3>
                    <p className="text-green-700 text-sm mt-0.5">Nous vous répondrons dans les plus brefs délais.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─ FORMULAIRE CONTACT ─ */}
            <AnimatePresence mode="wait">
              {activeTab === "contact" && (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm space-y-5"
                >
                  <h2 className="text-lg font-black text-gray-900 mb-1">Envoyez-nous un message</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Nom complet *" error={errors.name}>
                      <input
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="Votre nom"
                        className={inputCls + (errors.name ? " border-red-300" : "")}
                      />
                    </Field>
                    <Field label="Téléphone" error={errors.phone}>
                      <input
                        type="tel"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        placeholder="+216 xx xxx xxx"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <Field label="Email *" error={errors.email}>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="votre@email.com"
                      className={inputCls + (errors.email ? " border-red-300" : "")}
                    />
                  </Field>

                  <Field label="Agence" error={errors.agence}>
                    <select
                      value={contactForm.agence}
                      onChange={(e) => setContactForm({ ...contactForm, agence: e.target.value })}
                      className={inputCls}
                    >
                      {agences.map((a) => (
                        <option key={a.id} value={a.id}>{a.nom}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Sujet *" error={errors.subject}>
                    <input
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      placeholder="Objet de votre message"
                      className={inputCls + (errors.subject ? " border-red-300" : "")}
                    />
                  </Field>

                  <Field label="Message *" error={errors.message}>
                    <textarea
                      rows={5}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Décrivez votre demande..."
                      className={inputCls + " resize-none" + (errors.message ? " border-red-300" : "")}
                    />
                  </Field>

                  <button
                    onClick={() => handleSubmit("contact")}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-[#1a3d0a] to-[#2d5a1b] text-white rounded-xl font-black hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> Envoi en cours...</>
                    ) : (
                      <><EnvelopeIcon className="w-4 h-4" /> Envoyer le message</>
                    )}
                  </button>
                </motion.div>
              )}

              {/* ─ FORMULAIRE DEVIS ─ */}
              {activeTab === "devis" && (
                <motion.div
                  key="devis"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm space-y-5"
                >
                  <h2 className="text-lg font-black text-gray-900 mb-1">Demande de Devis</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Nom complet *" error={errors.name}>
                      <input
                        value={quoteForm.name}
                        onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                        placeholder="Votre nom"
                        className={inputCls + (errors.name ? " border-red-300" : "")}
                      />
                    </Field>
                    <Field label="Société" error={errors.company}>
                      <input
                        value={quoteForm.company}
                        onChange={(e) => setQuoteForm({ ...quoteForm, company: e.target.value })}
                        placeholder="Nom de la société"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Email *" error={errors.email}>
                      <input
                        type="email"
                        value={quoteForm.email}
                        onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                        placeholder="votre@email.com"
                        className={inputCls + (errors.email ? " border-red-300" : "")}
                      />
                    </Field>
                    <Field label="Téléphone *" error={errors.phone}>
                      <input
                        type="tel"
                        value={quoteForm.phone}
                        onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                        placeholder="+216 xx xxx xxx"
                        className={inputCls + (errors.phone ? " border-red-300" : "")}
                      />
                    </Field>
                  </div>

                  <Field label="Agence">
                    <select
                      value={quoteForm.agence}
                      onChange={(e) => setQuoteForm({ ...quoteForm, agence: e.target.value })}
                      className={inputCls}
                    >
                      {agences.map((a) => (
                        <option key={a.id} value={a.id}>{a.nom}</option>
                      ))}
                    </select>
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Produit / Service *" error={errors.product}>
                      <input
                        value={quoteForm.product}
                        onChange={(e) => setQuoteForm({ ...quoteForm, product: e.target.value })}
                        placeholder="Ex: Fertivert Pro"
                        className={inputCls + (errors.product ? " border-red-300" : "")}
                      />
                    </Field>
                    <Field label="Quantité">
                      <input
                        value={quoteForm.quantity}
                        onChange={(e) => setQuoteForm({ ...quoteForm, quantity: e.target.value })}
                        placeholder="Ex: 100 kg, 5 ha..."
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <Field label="Détails / Besoins *" error={errors.details}>
                    <textarea
                      rows={5}
                      value={quoteForm.details}
                      onChange={(e) => setQuoteForm({ ...quoteForm, details: e.target.value })}
                      placeholder="Décrivez votre culture, surface, besoins spécifiques..."
                      className={inputCls + " resize-none" + (errors.details ? " border-red-300" : "")}
                    />
                  </Field>

                  <button
                    onClick={() => handleSubmit("devis")}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-[#1a3d0a] to-[#2d5a1b] text-white rounded-xl font-black hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> Envoi...</>
                    ) : (
                      <>📋 Envoyer la demande de devis</>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Canaux rapides */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              <a href="tel:+21671333858" className="flex flex-col items-center gap-1.5 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-green-200 transition-all text-center group">
                <div className="w-10 h-10 bg-[#f0f9eb] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PhoneIcon className="w-5 h-5 text-[#2d5a1b]" />
                </div>
                <span className="text-xs font-black text-gray-800">Appeler</span>
                <span className="text-[10px] text-gray-400">71 333 858</span>
              </a>
              <a href="https://wa.me/21671333858" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-green-200 transition-all text-center group">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <span className="text-xs font-black text-gray-800">WhatsApp</span>
                <span className="text-[10px] text-gray-400">Message rapide</span>
              </a>
              <a href="mailto:secretariat.groupeev@planet.tn" className="flex flex-col items-center gap-1.5 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-center group">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <EnvelopeIcon className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-xs font-black text-gray-800">Email</span>
                <span className="text-[10px] text-gray-400">Réponse 24h</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}