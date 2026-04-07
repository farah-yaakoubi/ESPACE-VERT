"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarIcon, CheckCircleIcon, ClockIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { sendRendezVous } from "@/lib/api";

const AGENCES = ["Tunis", "Soliman", "Borj Amri", "Sfax"];
const SERVICES = ["Irrigation", "Fertilisation", "Semences & Plants", "Pulvérisation", "Machinisme & Jardinage", "Autre"];

export default function RendezVousPage() {
  const t = useTranslations("appointment");

  const [formData, setFormData] = useState({
    fullName:    "",
    phone:       "",
    email:       "",
    surface:     "",
    cultureType: "",
    date:        "",
    heure:       "",
    agence:      "",
    service:     "",
    message:     "",
  });

  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess]     = useState(false);
  const [apiError, setApiError]       = useState("");

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = "Le nom est requis";
    if (!formData.phone.trim())    errs.phone    = "Le téléphone est requis";
    if (!formData.email.trim())    errs.email    = "L'email est requis";
    if (!formData.date)            errs.date     = "La date est requise";
    if (!formData.agence)          errs.agence   = "L'agence est requise";
    if (!formData.service)         errs.service  = "Le service est requis";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = "Format email invalide";
    if (formData.date) {
      const rdvDate = new Date(formData.date);
      const today   = new Date(); today.setHours(0, 0, 0, 0);
      if (rdvDate < today) errs.date = "La date ne peut pas être dans le passé";
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setApiError("");
    setIsSubmitting(true);

    try {
      // ── Appel backend Express /api/rdv ──────────────────────────────────
      const result = await sendRendezVous({
        nom:            formData.fullName,
        email:          formData.email,
        telephone:      formData.phone,
        date_souhaitee: formData.date,
        heure:          formData.heure   || undefined,
        agence:         formData.agence  || undefined,
        objet:          formData.service || undefined,
        message: [
          formData.cultureType && `Culture : ${formData.cultureType}`,
          formData.surface     && `Surface : ${formData.surface}`,
          formData.message     && formData.message,
        ].filter(Boolean).join("\n") || undefined,
      });

      if (result.success) {
        setIsSuccess(true);
        setFormData({
          fullName: "", phone: "", email: "", surface: "",
          cultureType: "", date: "", heure: "", agence: "", service: "", message: "",
        });
      } else {
        setApiError(result.error ?? "Une erreur est survenue, veuillez réessayer.");
      }
    } catch {
      setApiError("Impossible de joindre le serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inp = (err?: string) =>
    `w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors bg-white ${
      err ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-[#10693B]"
    }`;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] to-white flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-10 text-center max-w-md w-full shadow-xl border border-green-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">Rendez-vous enregistré !</h2>
          <p className="text-gray-600 mb-8">
            Nous vous contacterons dans les 24h pour confirmer votre rendez-vous.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setIsSuccess(false)}
              className="px-6 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              Nouveau RDV
            </button>
            <Link href="/"
              className="px-6 py-3 bg-[#10693B] text-white rounded-xl font-bold hover:bg-[#0a6030] transition-colors">
              Retour à l'accueil
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f7faf5] to-white">

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0a6030] via-[#4a9060] to-[#4a7c2f] text-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-white/40 text-[11px] font-black uppercase tracking-widest mb-3">Rendez-vous</p>
            <h1 className="text-4xl lg:text-5xl font-black mb-3">Prendre Rendez-vous</h1>
            <p className="text-white/70 text-lg max-w-xl">
              Un expert Espace Vert se déplace chez vous pour analyser vos besoins et vous proposer la meilleure solution.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Sidebar info */}
          <div className="space-y-4">
            {[
              { icon: ClockIcon,   title: "Réponse rapide",  desc: "Confirmation sous 24h" },
              { icon: MapPinIcon,  title: "4 agences",       desc: "Tunis, Soliman, Borj Amri, Sfax" },
              { icon: PhoneIcon,   title: "Support direct",  desc: "(+216) 71 333 858" },
              { icon: CalendarIcon,title: "Disponibilité",   desc: "Lun–Sam 8h–17h" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex gap-4">
                <div className="w-10 h-10 bg-[#f0f9eb] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#10693B]" />
                </div>
                <div>
                  <p className="font-black text-gray-900 text-sm">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-2">
            {apiError && (
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 mb-5 text-sm text-red-700 font-semibold">
                ⚠️ {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-5">
              <h2 className="text-xl font-black text-gray-900 mb-2">Vos coordonnées</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Nom complet *</label>
                  <input value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Votre nom" className={inp(errors.fullName)} />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Téléphone *</label>
                  <input type="tel" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+216 xx xxx xxx" className={inp(errors.phone)} />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email *</label>
                <input type="email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="votre@email.com" className={inp(errors.email)} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Agence *</label>
                  <select value={formData.agence}
                    onChange={(e) => setFormData({ ...formData, agence: e.target.value })}
                    className={inp(errors.agence)}>
                    <option value="">Choisir une agence</option>
                    {AGENCES.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                  {errors.agence && <p className="text-red-500 text-xs mt-1">{errors.agence}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Service *</label>
                  <select value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className={inp(errors.service)}>
                    <option value="">Type de service</option>
                    {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.service && <p className="text-red-500 text-xs mt-1">{errors.service}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Date souhaitée *</label>
                  <input type="date" value={formData.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={inp(errors.date)} />
                  {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Heure préférée</label>
                  <select value={formData.heure}
                    onChange={(e) => setFormData({ ...formData, heure: e.target.value })}
                    className={inp()}>
                    <option value="">Indifférent</option>
                    {["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
                      "14:00","14:30","15:00","15:30","16:00","16:30"].map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Type de culture</label>
                  <input value={formData.cultureType}
                    onChange={(e) => setFormData({ ...formData, cultureType: e.target.value })}
                    placeholder="Ex: Tomates, Oliviers..." className={inp()} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Surface (ha)</label>
                  <input value={formData.surface}
                    onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
                    placeholder="Ex: 2.5 ha" className={inp()} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Message / Précisions</label>
                <textarea rows={4} value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Décrivez vos besoins, contraintes particulières..."
                  className={inp() + " resize-none"} />
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-[#0a6030] to-[#3CB648] text-white rounded-xl font-black text-base hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {isSubmitting
                  ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi en cours...</>
                  : <><CalendarIcon className="w-5 h-5" /> Confirmer le rendez-vous</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
