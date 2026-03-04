"use client";

import {
  ArrowRightIcon,
  CheckCircleIcon,
  CogIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function MachinismePage() {
  const t = useTranslations("activities.machinisme");

  const categories = [
    {
      id: "tondeuses",
      name: "Tondeuses à Gazon",
      icon: "🚜",
      description:
        "Tondeuses thermiques et électriques pour tous types de terrains",
      products: [
        {
          name: "Tondeuse autoportée",
          model: "Viking MT 6127 ZL",
          power: "27 HP",
          width: "122 cm",
        },
        {
          name: "Tondeuse thermique",
          model: "Viking MB 650 T",
          power: "2.9 kW",
          width: "48 cm",
        },
        {
          name: "Tondeuse électrique",
          model: "Viking ME 339",
          power: "1400 W",
          width: "37 cm",
        },
        {
          name: "Tondeuse robot",
          model: "Viking iMow",
          power: "Auto",
          width: "20 cm",
        },
      ],
    }
  ];

  const services = [
    {
      icon: WrenchScrewdriverIcon,
      title: "Service Après-Vente",
      description:
        "Réparation et entretien de tous vos équipements par nos techniciens certifiés",
    },
    {
      icon: CogIcon,
      title: "Pièces Détachées",
      description: "Large stock de pièces d'origine pour toutes les marques",
    },
    {
      icon: CheckCircleIcon,
      title: "Garantie",
      description: "Tous nos équipements neufs sont garantis constructeur",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 text-white">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 2px, transparent 2px)",
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
              🔧 Nos Activités
            </div>

            <h1 className="text-6xl font-black mb-6 leading-tight">
              Machinisme et Jardinage
            </h1>

            <p className="text-xl text-gray-50 mb-8 leading-relaxed">
              Équipements professionnels Viking pour l'entretien de vos espaces
              verts. Vente, service après-vente et pièces détachées.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Catégories d'équipements */}
      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Notre Gamme d'Équipements
            </h2>
            <p className="text-lg text-gray-600">
              Matériel professionnel Viking pour tous vos besoins
            </p>
          </div>

          <div className="space-y-12">
            {categories.map((category, catIdx) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: catIdx * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-5xl">{category.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-black text-gray-900 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {category.products.map((product, idx) => (
                    <div
                      key={idx}
                      className="p-5 border-2 border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-md transition-all"
                    >
                      <h4 className="font-bold text-gray-900 mb-2 text-sm">
                        {product.name}
                      </h4>
                      <div className="text-xs text-gray-500 mb-3">
                        {product.model}
                      </div>
                      <div className="space-y-1">
                        {Object.entries(product)
                          .filter(([key]) => !["name", "model"].includes(key))
                          .map(([key, value], i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 text-xs"
                            >
                              <CheckCircleIcon className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">
                                {key === "power" && "Puissance: "}
                                {key === "width" && "Largeur: "}
                                {key === "guide" && "Guide: "}
                                {key === "coupe" && "Largeur coupe: "}
                                {key === "vitesse" && "Vitesse: "}
                                {key === "fil" && "Fil: "}
                                {key === "pression" && "Pression: "}
                                {key === "diamètre" && "Ø max: "}
                                {key === "lame" && "Lame: "}
                                {value}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-right">
                  <Link
                    href={`/fr/marques/viking?category=${category.id}`}
                    className="inline-flex items-center gap-2 text-gray-700 font-bold hover:text-gray-900 hover:gap-3 transition-all"
                  >
                    Voir tous les {category.name.toLowerCase()}{" "}
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
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
              Nos Services
            </h2>
            <p className="text-lg text-gray-600">
              Un accompagnement complet pour vos équipements
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
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                  <service.icon className="w-7 h-7 text-gray-700" />
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

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-gray-800 to-gray-600 text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-black mb-6">
            Besoin d'un conseil pour votre équipement ?
          </h2>
          <p className="text-xl text-gray-50 mb-8">
            Notre équipe technique est à votre disposition
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+21671333858"
              className="px-8 py-4 bg-white text-gray-800 font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-xl"
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
