"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function RendezVousPage() {
  const t = useTranslations("appointment");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    surface: "",
    cultureType: "",
    date: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/rendez-vous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSuccess(true);
        setFormData({
          fullName: "",
          phone: "",
          email: "",
          surface: "",
          cultureType: "",
          date: "",
          message: "",
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const process = [
    {
      step: "1",
      title: "Visite terrain",
      desc: "Analyse de vos besoins sur place",
      time: "1-2h",
    },
    {
      step: "2",
      title: "Étude technique",
      desc: "Conception du système optimal",
      time: "2-3 jours",
    },
    {
      step: "3",
      title: "Devis détaillé",
      desc: "Proposition personnalisée",
      time: "1 jour",
    },
    {
      step: "4",
      title: "Installation",
      desc: "Pose par nos experts",
      time: "Variable",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600 text-white">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, white 2px, transparent 2px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative max-w-screen-xl mx-auto px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <Link
              href="/fr/activites/irrigation"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold mb-6 hover:bg-white/30 transition-all"
            >
              ← Retour à Irrigation
            </Link>

            <div className="flex items-center gap-4 mb-6">
              <CalendarIcon className="w-16 h-16" />
              <div>
                <h1 className="text-5xl font-black mb-2">Prendre Rendez-vous</h1>
                <p className="text-xl text-blue-100">
                  Bureau d'Étude & Installation Irrigation
                </p>
              </div>
            </div>

            <p className="text-lg text-blue-50 leading-relaxed">
              Rencontrez nos ingénieurs agronomes pour concevoir votre système
              d'irrigation sur-mesure. Visite terrain gratuite et sans engagement.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Formulaire */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-blue-100">
              {isSuccess ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircleIcon className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">
                    Demande envoyée avec succès !
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Notre équipe vous contactera dans les 24h pour confirmer
                    votre rendez-vous.
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                  >
                    Nouvelle demande
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-6">
                      Informations de contact
                    </h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 outline-none transition-colors"
                        placeholder="Votre nom"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 outline-none transition-colors"
                        placeholder="+216"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 outline-none transition-colors"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">
                      Détails du projet
                    </h4>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Surface à irriguer (ha)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.surface}
                          onChange={(e) =>
                            setFormData({ ...formData, surface: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 outline-none transition-colors"
                          placeholder="Ex: 5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Type de culture
                        </label>
                        <select
                          value={formData.cultureType}
                          onChange={(e) =>
                            setFormData({ ...formData, cultureType: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 outline-none transition-colors"
                        >
                          <option value="">Sélectionner...</option>
                          <option value="maraichage">Maraîchage</option>
                          <option value="arboriculture">Arboriculture</option>
                          <option value="grandes">Grandes cultures</option>
                          <option value="serres">Serres</option>
                          <option value="espaces">Espaces verts</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Date souhaitée
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                          }
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Message / Détails du projet
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 outline-none transition-colors resize-none"
                      placeholder="Décrivez votre projet, vos besoins spécifiques..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Envoi en cours..." : "Demander un rendez-vous"}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    En soumettant ce formulaire, vous acceptez d'être contacté par
                    notre équipe concernant votre projet.
                  </p>
                </form>
              )}
            </div>
          </motion.div>

          {/* Informations complémentaires */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Notre processus */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8">
              <h3 className="text-2xl font-black text-gray-900 mb-6">
                Notre Processus
              </h3>
              <div className="space-y-4">
                {process.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black flex-shrink-0">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-gray-900">{item.title}</h4>
                        <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {item.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact direct */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-black text-gray-900 mb-4">
                Besoin d'aide ?
              </h3>
              <p className="text-gray-600 mb-6">
                Notre équipe est disponible pour répondre à vos questions
              </p>

              <div className="space-y-4">
                <a
                  href="tel:+21671333858"
                  className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all"
                >
                  <PhoneIcon className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500">Téléphone</div>
                    <div className="font-bold text-gray-900">(+216) 71 333 858</div>
                  </div>
                </a>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <MapPinIcon className="w-6 h-6 text-gray-600 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-500">Adresse</div>
                    <div className="font-bold text-gray-900">
                      69,rue abderrazak chraibi Tunis, Tunis 1001
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <ClockIcon className="w-6 h-6 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-500">Horaires</div>
                    <div className="font-bold text-gray-900">
                      Lun-Ven: 8h-18h | Sam: 8h-13h
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Marques partenaires */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-black text-gray-900 mb-4">
                Nos Marques Partenaires
              </h3>
              <div className="space-y-3">
                <Link
                  href="/fr/marques/"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all group"
                >
                  <span className="text-xs text-gray-500">Leader mondial</span>
                </Link>
                <Link
                  href="/fr/marques/matar"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all group"
                >
                  <span className="font-semibold text-gray-700 group-hover:text-blue-600">
                    Matar
                  </span>
                  <span className="text-xs text-gray-500">Fabricant tunisien</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}