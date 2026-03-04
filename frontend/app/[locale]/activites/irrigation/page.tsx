"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BeakerIcon,
  WrenchScrewdriverIcon,
  CalendarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface IrrigationProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  image: string;
  features: string[];
  brandLink: string;
}

const products: IrrigationProduct[] = [
  {
    id: "matar-drip",
    name: "Système Goutte-à-Goutte Premium",
    brand: "Matar",
    category: "Irrigation localisée",
    description: "Solution d'irrigation de précision pour cultures maraîchères et arboricoles",
    image: "/products/matar-drip.jpg",
    features: [
      "Économie d'eau jusqu'à 70%",
      "Distribution uniforme des nutriments",
      "Durabilité garantie 10 ans",
      "Installation rapide et facile",
    ],
    brandLink: "/marques/matar",
  },
  {
    id: "matar-sprinkler",
    name: "Aspersion Intelligente",
    brand: "Matar",
    category: "Aspersion",
    description: "Système d'aspersion haute performance pour grandes surfaces",
    image: "/products/matar-sprinkler.jpg",
    features: [
      "Couverture optimale jusqu'à 50m",
      "Réglage automatique de débit",
      "Résistant aux intempéries",
      "Maintenance minimale",
    ],
    brandLink: "/marques/matar",
  },
  {
    id: "matar-subsurface",
    name: "Irrigation Souterraine",
    brand: "Matar",
    category: "Irrigation enterrée",
    description: "Technologie d'irrigation souterraine pour cultures intensives",
    image: "/products/matar-subsurface.jpg",
    features: [
      "Invisible en surface",
      "Réduction évaporation 95%",
      "Optimal pour cultures pérennes",
      "Technologie anti-colmatage",
    ],
    brandLink: "/marques/matar",
  },
];

export default function IrrigationPage() {
  const t = useTranslations("activities.irrigation");
  const [activeTab, setActiveTab] = useState<"products" | "bureau">("products");

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
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

        <div className="relative max-w-screen-xl mx-auto px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold mb-6">
              💧 Nos Activités
            </div>

            <h1 className="text-6xl font-black mb-6 leading-tight">
              Solutions d'Irrigation Professionnelle
            </h1>

            <p className="text-xl text-blue-50 mb-8 leading-relaxed">
              Systèmes d'irrigation intelligents pour optimiser votre consommation d'eau
              et maximiser vos rendements. De la conception à l'installation.
            </p>

            <div className="flex gap-6 mb-8">
              <div>
                <div className="text-4xl font-black mb-1">-70%</div>
                <div className="text-blue-100 text-sm">Économie d'eau</div>
              </div>
              <div>
                <div className="text-4xl font-black mb-1">+40%</div>
                <div className="text-blue-100 text-sm">Rendement</div>
              </div>
              <div>
                <div className="text-4xl font-black mb-1">24/7</div>
                <div className="text-blue-100 text-sm">Support technique</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[76px] z-40 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-6 py-4 font-bold transition-all relative ${
                activeTab === "products"
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <WrenchScrewdriverIcon className="w-5 h-5" />
                Produits d'Irrigation
              </div>
              {activeTab === "products" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab("bureau")}
              className={`px-6 py-4 font-bold transition-all relative ${
                activeTab === "bureau"
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <BeakerIcon className="w-5 h-5" />
                Bureau d'Étude & Installation
              </div>
              {activeTab === "bureau" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-screen-xl mx-auto px-8 py-12">
        {/* ONGLET PRODUITS */}
        {activeTab === "products" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-12">
              <h2 className="text-4xl font-black text-gray-900 mb-4">
                Notre Gamme de Produits
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl">
                Solutions d'irrigation Netafim, leader mondial de l'irrigation goutte-à-goutte
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Image */}
                  <div className="relative h-56 bg-gradient-to-br from-blue-100 to-cyan-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg">
                      {product.brand}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="text-xs font-bold text-blue-600 mb-2">
                      {product.category}
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-3">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      {product.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link
                      href={product.brandLink}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all group-hover:scale-105"
                    >
                      En savoir plus <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Marque */}
            <div className="mt-12 text-center">
              <Link
                href="/fr/marques/matar"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-2xl hover:shadow-xl transition-all hover:scale-105"
              >
                Voir toute la gamme de marque Matar <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* ONGLET BUREAU D'ÉTUDE */}
        {activeTab === "bureau" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-black text-gray-900 mb-4">
                  Bureau d'Étude & Installation
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Conception sur-mesure de votre système d'irrigation par nos ingénieurs agronomes
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Services */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h3 className="text-2xl font-black text-gray-900 mb-6">
                    Nos Services
                  </h3>
                  <div className="space-y-4">
                    {[
                      "Étude de faisabilité et dimensionnement",
                      "Plans techniques détaillés",
                      "Installation clé en main",
                      "Formation à l'utilisation",
                      "Maintenance et SAV",
                      "Optimisation des systèmes existants",
                    ].map((service, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Process */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8">
                  <h3 className="text-2xl font-black text-gray-900 mb-6">
                    Notre Processus
                  </h3>
                  <div className="space-y-4">
                    {[
                      { step: "1", title: "Visite terrain", desc: "Analyse de vos besoins" },
                      { step: "2", title: "Étude technique", desc: "Conception du système" },
                      { step: "3", title: "Devis détaillé", desc: "Proposition personnalisée" },
                      { step: "4", title: "Installation", desc: "Pose par nos experts" },
                      { step: "5", title: "Formation", desc: "Prise en main complète" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black flex-shrink-0">
                          {item.step}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{item.title}</div>
                          <div className="text-sm text-gray-600">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bouton de prise de rendez-vous */}
              <div className="bg-white rounded-2xl p-12 shadow-xl border-2 border-blue-100 flex justify-center items-center">
                <Link
                  href="/fr/rendez-vous"
                  className="px-8 py-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-xl rounded-2xl hover:scale-105 hover:shadow-2xl transition-all duration-300 flex items-center gap-3"
                >
                  <CalendarIcon className="w-8 h-8" />
                  Prendre Rendez-vous
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-br from-blue-700 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-black mb-4">Une question ? Besoin de conseils ?</h2>
          <p className="text-xl text-blue-50 mb-8">
            Nos experts en irrigation sont à votre écoute
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+21671333858"
              className="px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-xl"
            >
              📞 (+216) 71 333 858
            </a>
            <Link
              href="/fr/contact"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-bold rounded-2xl hover:bg-white/20 transition-all"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}