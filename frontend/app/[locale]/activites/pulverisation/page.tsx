"use client";

import { motion } from "framer-motion";
import { 
  ShieldCheckIcon,
  BeakerIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function PulverisationPage() {
  const t = useTranslations("activities.pulverisation");

  const equipment = [
    {
      name: "Pulvérisateurs à dos",
      description: "Pour petites surfaces et jardins",
      capacity: "15-20L",
      features: ["Ergonomique", "Réglable", "Facile d'entretien"],
    },
    {
      name: "Pulvérisateurs tractés",
      description: "Pour grandes cultures et vergers",
      capacity: "400-1000L",
      features: ["Haute capacité", "Distribution uniforme", "GPS intégré"],
    },
    {
      name: "Atomiseurs",
      description: "Pour arboriculture et vignobles",
      capacity: "200-600L",
      features: ["Pulvérisation fine", "Économie de produit", "Efficacité optimale"],
    },
  ];

  const safetyTips = [
    "Porter un équipement de protection complet (combinaison, masque, gants)",
    "Respecter les doses recommandées par le fabricant",
    "Éviter de pulvériser par temps venteux (> 15 km/h)",
    "Maintenir une distance de sécurité avec les habitations",
    "Nettoyer l'équipement après chaque utilisation",
    "Stocker les produits dans un local sécurisé et ventilé",
  ];

  const services = [
    {
      icon: BeakerIcon,
      title: "Conseil technique",
      description: "Accompagnement dans le choix des produits phytosanitaires adaptés",
    },
    {
      icon: ShieldCheckIcon,
      title: "Formation sécurité",
      description: "Formation aux bonnes pratiques de pulvérisation",
    },
    {
      icon: CheckCircleIcon,
      title: "Maintenance",
      description: "Entretien et réparation de vos équipements",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-700 via-orange-600 to-amber-600 text-white">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, white 2px, transparent 2px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative max-w-screen-xl mx-auto px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold mb-6">
              🌾 Nos Activités
            </div>

            <h1 className="text-6xl font-black mb-6 leading-tight">
              Solutions de Pulvérisation
            </h1>

            <p className="text-xl text-orange-50 mb-8 leading-relaxed">
              Équipements professionnels et conseils techniques pour la protection
              efficace et responsable de vos cultures
            </p>

            <div className="flex gap-4">
              <Link
                href="/fr/contact"
                className="px-8 py-4 bg-white text-orange-700 font-bold rounded-2xl hover:bg-orange-50 transition-all hover:scale-105 shadow-xl"
              >
                Nous contacter
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Équipements */}
      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Nos Équipements de Pulvérisation
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Large gamme d'équipements adaptés à tous types de cultures
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {equipment.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border-2 border-gray-100 hover:border-orange-200"
              >
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🚜</span>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 mb-2">{item.description}</p>
                  <div className="inline-block px-4 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm font-bold">
                    {item.capacity}
                  </div>
                </div>

                <div className="space-y-2">
                  {item.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircleIcon className="w-4 h-4 text-orange-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Nos Services d'Accompagnement
            </h2>
            <p className="text-lg text-gray-600">
              Expertise et formation pour une utilisation optimale
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                  <service.icon className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Consignes de sécurité */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-8">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-10 border-2 border-orange-100">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <ExclamationTriangleIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">
                  Consignes de Sécurité
                </h2>
                <p className="text-gray-600">
                  Règles essentielles pour une pulvérisation en toute sécurité
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {safetyTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 bg-white rounded-xl"
                >
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    {idx + 1}
                  </div>
                  <p className="text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-orange-700 to-amber-600 text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-black mb-6">
            Besoin de conseils techniques ?
          </h2>
          <p className="text-xl text-orange-50 mb-8">
            Nos experts sont à votre disposition pour vous accompagner
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+21671333858"
              className="px-8 py-4 bg-white text-orange-700 font-bold rounded-2xl hover:bg-orange-50 transition-all shadow-xl"
            >
              📞 (+216) 71 333 858
            </a>
            <Link
              href="/fr/contact"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-bold rounded-2xl hover:bg-white/20 transition-all"
            >
              Demander un devis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}