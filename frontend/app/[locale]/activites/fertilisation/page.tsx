"use client";

import { motion } from "framer-motion";
import { 
  SparklesIcon, 
  BeakerIcon, 
  CheckCircleIcon,
  ArrowRightIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function FertilisationPage() {
  const t = useTranslations("activities.fertilisation");

  const brands = [
    {
      id: "fertivert-pro",
      name: "Fertivert Pro",
      subtitle: "Agriculture Professionnelle",
      description: "Solutions de fertilisation pour l'agriculture intensive et cultures spécialisées",
      image: "/brands/fertivert-pro-hero.jpg",
      link: "/fr/marques/fertivert?division=pro",
      color: "#2d5a1b",
      gradient: "from-green-800 to-green-600",
      products: ["Engrais de fond", "Engrais organique", "Fertilisants spécialisés"],
    },
    {
      id: "fertivert-garden",
      name: "Fertivert Garden",
      subtitle: "Jardin & Gazon",
      description: "Gamme complète pour jardins, espaces verts et pelouses",
      image: "/brands/fertivert-garden-hero.jpg",
      link: "/fr/marques/fertivert?division=garden",
      color: "#6b9e3e",
      gradient: "from-green-600 to-green-400",
      products: ["Gazon", "Plantes vertes", "Engrais chimiques"],
    }
  ];

  const benefits = [
    {
      icon: ChartBarIcon,
      title: "Amélioration du rendement",
      value: "+30%",
      description: "Augmentation moyenne du rendement avec nos solutions",
    },
    {
      icon: SparklesIcon,
      title: "Solutions sur-mesure",
      value: "100%",
      description: "Programmes adaptés à chaque type de culture",
    },
    {
      icon: CheckCircleIcon,
      title: "Certification bio",
      value: "✓",
      description: "Produits certifiés agriculture biologique disponibles",
    },
  ];

  const expertises = [
    {
      icon: BeakerIcon,
      title: "Analyse de sol",
      description: "Diagnostic complet pour optimiser vos apports nutritifs et corriger les carences",
    },
    {
      icon: SparklesIcon,
      title: "Plans de fertilisation",
      description: "Programmes sur-mesure adaptés à vos cultures et objectifs de rendement",
    },
    {
      icon: CheckCircleIcon,
      title: "Suivi agronomique",
      description: "Accompagnement tout au long de la saison par nos experts",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-800 via-green-700 to-green-600 text-white">
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
              <SparklesIcon className="w-4 h-4" />
              Nos Activités
            </div>

            <h1 className="text-6xl font-black mb-6 leading-tight">
              Fertilisation Professionnelle
            </h1>

            <p className="text-xl text-green-50 mb-8 leading-relaxed">
              Solutions complètes de fertilisation pour optimiser vos rendements et
              préserver la santé de vos sols. Expertise agronomique et produits de qualité.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/fr/contact"
                className="px-8 py-4 bg-white text-green-800 font-bold rounded-2xl hover:bg-green-50 transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                Contactez nos experts
              </Link>
              <a
                href="#marques"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-bold rounded-2xl hover:bg-white/20 transition-all"
              >
                Voir nos produits
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Pourquoi choisir nos solutions de fertilisation ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Depuis plus de 20 ans, nous accompagnons les agriculteurs et jardiniers
              avec des solutions innovantes et respectueuses de l'environnement
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 text-center"
              >
                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-5xl font-black text-green-600 mb-2">
                  {benefit.value}
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Expertises */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Nos Services d'Expertise
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Un accompagnement complet pour maximiser l'efficacité de vos apports
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {expertises.map((expertise, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                  <expertise.icon className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">
                  {expertise.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {expertise.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nos Marques */}
      <section id="marques" className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Nos Gammes de Produits
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez nos marques partenaires et leurs solutions innovantes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {brands.map((brand, idx) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="group"
              >
                <Link href={brand.link}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-transparent">
                    {/* Image */}
                    <div className="relative h-56">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${brand.gradient} opacity-90`}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white p-6">
                          <h3 className="text-3xl font-black mb-2">{brand.name}</h3>
                          <p className="text-sm font-semibold opacity-90">{brand.subtitle}</p>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {brand.description}
                      </p>

                      {/* Products list */}
                      <div className="space-y-2 mb-6">
                        {brand.products.map((product, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: brand.color }}
                            />
                            <span className="text-gray-600">{product}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <div
                        className="inline-flex items-center gap-2 font-bold group-hover:gap-3 transition-all"
                        style={{ color: brand.color }}
                      >
                        Découvrir la gamme <ArrowRightIcon className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-800 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-black mb-6">
            Besoin de conseils personnalisés ?
          </h2>
          <p className="text-xl text-green-50 mb-8">
            Nos experts agronomes sont à votre disposition pour vous accompagner
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+21671333858"
              className="px-8 py-4 bg-white text-green-800 font-bold rounded-2xl hover:bg-green-50 transition-all hover:scale-105 shadow-xl"
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