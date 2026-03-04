"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  PhoneIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

const brandConfig = {
  id: "matar",
  name: "Matar",
  fullName: "Matar Irrigation",
  subtitle: "Solutions d'Irrigation Professionnelles",
  description: "Leader tunisien en systèmes d'irrigation depuis 1985. Fabricant et distributeur de matériel d'irrigation de haute qualité.",
  color: {
    primary: "#2563eb",
    secondary: "#3b82f6",
    light: "#dbeafe",
  },
  logo: "/brands/matar-logo.svg",
  hero: "/brands/matar-hero.jpg",
  founded: "1985",
  expertise: "40+ ans d'expérience",
};

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  features: string[];
  specs?: Record<string, string>;
}

const products: Product[] = [
  {
    id: "gaine-pe",
    name: "Gaine PE Ø16-Ø63mm",
    category: "Tuyauterie",
    description: "Gaine polyéthylène haute densité pour réseau d'irrigation",
    image: "/products/matar-gaine.jpg",
    features: [
      "Résistance UV et intempéries",
      "Flexible et facile à installer",
      "Durée de vie 20+ ans",
      "Normes ISO certifiées",
    ],
    specs: {
      "Diamètres": "16, 20, 25, 32, 40, 50, 63 mm",
      "Pression": "4-16 bars selon Ø",
      "Longueur": "Rouleaux 100-200m",
    },
  },
  {
    id: "goutteurs",
    name: "Goutteurs Intégrés",
    category: "Goutte-à-goutte",
    description: "Goutteurs auto-régulants pour irrigation de précision",
    image: "/products/matar-goutteurs.jpg",
    features: [
      "Débit constant régulé",
      "Anti-colmatage",
      "Espacement ajustable",
      "Compatible fertilisation",
    ],
    specs: {
      "Débit": "2, 4, 8 L/h",
      "Espacement": "20, 30, 40, 50 cm",
      "Pression": "0.5-4 bars",
    },
  },
  {
    id: "asperseurs",
    name: "Asperseurs Rotatifs",
    category: "Aspersion",
    description: "Asperseurs professionnels pour irrigation de surface",
    image: "/products/matar-asperseurs.jpg",
    features: [
      "Rotation complète 360°",
      "Réglage portée et secteur",
      "Construction robuste",
      "Maintenance facile",
    ],
    specs: {
      "Portée": "5-25 mètres",
      "Débit": "0.5-5 m³/h",
      "Raccords": "1/2\" - 1\"",
    },
  },
  {
    id: "vannes",
    name: "Vannes et Raccords",
    category: "Accessoires",
    description: "Vannes manuelles et automatiques, raccords divers",
    image: "/products/matar-vannes.jpg",
    features: [
      "Étanchéité garantie",
      "Résistance corrosion",
      "Installation rapide",
      "Large gamme diamètres",
    ],
    specs: {
      "Types": "Manuel, électrovanne, anti-bélier",
      "Matériaux": "PVC, PP, laiton",
      "Diamètres": "1/2\" à 4\"",
    },
  },
  {
    id: "filtres",
    name: "Filtres à Sable et Tamis",
    category: "Filtration",
    description: "Systèmes de filtration pour eau d'irrigation",
    image: "/products/matar-filtres.jpg",
    features: [
      "Filtration efficace",
      "Nettoyage automatique",
      "Grande capacité",
      "Longue durée de vie",
    ],
    specs: {
      "Types": "Sable, tamis, disques",
      "Débit": "5-100 m³/h",
      "Finesse": "120-200 mesh",
    },
  },
  {
    id: "programmateurs",
    name: "Programmateurs Automatiques",
    category: "Automatisation",
    description: "Contrôleurs d'irrigation programmables",
    image: "/products/matar-programmateurs.jpg",
    features: [
      "Programmation flexible",
      "Détection pluie",
      "Gestion multi-zones",
      "Interface intuitive",
    ],
    specs: {
      "Stations": "4-24 stations",
      "Alimentation": "Pile 9V ou secteur",
      "Programmes": "Jusqu'à 8",
    },
  },
];

const categories = [
  "Tous",
  "Tuyauterie",
  "Goutte-à-goutte",
  "Aspersion",
  "Accessoires",
  "Filtration",
  "Automatisation",
];

export default function MatarPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "Tous" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section
        className="relative overflow-hidden text-white"
        style={{
          background: `linear-gradient(135deg, ${brandConfig.color.primary} 0%, ${brandConfig.color.secondary} 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, white 2px, transparent 2px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="relative max-w-screen-xl mx-auto px-8 py-16">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold mb-6">
                Nos Marques
              </div>

              <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 inline-block">
                <h1 className="text-6xl font-black">{brandConfig.name}</h1>
              </div>

              <p className="text-2xl font-bold text-blue-100 mb-4">
                {brandConfig.subtitle}
              </p>

              <p className="text-lg text-blue-50 mb-8 leading-relaxed max-w-xl">
                {brandConfig.description}
              </p>

              {/* Stats */}
              <div className="flex gap-8 mb-8">
                <div>
                  <div className="text-4xl font-black mb-1">{brandConfig.founded}</div>
                  <div className="text-blue-100 text-sm">Année de création</div>
                </div>
                <div>
                  <div className="text-4xl font-black mb-1">{products.length}</div>
                  <div className="text-blue-100 text-sm">Gammes produits</div>
                </div>
                <div>
                  <div className="text-4xl font-black mb-1">100%</div>
                  <div className="text-blue-100 text-sm">Tunisien</div>
                </div>
              </div>

              <Link
                href="/fr/activites/irrigation"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white text-white font-bold rounded-xl hover:bg-white/30 transition-all"
              >
                <ArrowRightIcon className="w-5 h-5 rotate-180" />
                Retour à Irrigation
              </Link>
            </div>

            {/* Right */}
            <div className="flex-1">
              <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={brandConfig.hero}
                  alt={brandConfig.fullName}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <div className="bg-white border-b border-gray-200 sticky top-[76px] z-40 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-8 py-4">
          <div className="flex items-center gap-4">
            {/* Categories */}
            <div className="flex items-center gap-2 flex-1 overflow-x-auto">
              <FunnelIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? "text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  style={
                    selectedCategory === category
                      ? { background: brandConfig.color.primary }
                      : {}
                  }
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-shrink-0">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm w-56 outline-none transition-all focus:w-72"
                onFocus={(e) => (e.target.style.borderColor = brandConfig.color.primary)}
                onBlur={(e) => (e.target.style.borderColor = "")}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <section className="py-12">
        <div className="max-w-screen-xl mx-auto px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2">
              Notre Catalogue de Produits
            </h2>
            <p className="text-gray-600">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""}
              {selectedCategory !== "Tous" && (
                <span style={{ color: brandConfig.color.primary }}>
                  {" "}· {selectedCategory}
                </span>
              )}
            </p>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-blue-200"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-100 to-cyan-100">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl opacity-20">💧</span>
                    </div>
                    <div
                      className="absolute top-4 right-4 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                      style={{ background: brandConfig.color.primary }}
                    >
                      {product.category}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2 mb-4">
                      {product.features.slice(0, 3).map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircleIcon
                            className="w-4 h-4 flex-shrink-0 mt-0.5"
                            style={{ color: brandConfig.color.primary }}
                          />
                          <span className="text-xs text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Specs */}
                    {product.specs && (
                      <div className="border-t border-gray-100 pt-4 mb-4">
                        {Object.entries(product.specs)
                          .slice(0, 2)
                          .map(([key, value], i) => (
                            <div key={i} className="text-xs mb-1">
                              <span className="font-bold text-gray-700">{key}:</span>{" "}
                              <span className="text-gray-600">{value}</span>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* CTA */}
                    <a
                      href="tel:+21671333858"
                      className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90"
                      style={{ background: brandConfig.color.primary }}
                    >
                      <PhoneIcon className="w-4 h-4" /> Demander un devis
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">
                Aucun produit trouvé
              </h3>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Tous");
                }}
                className="mt-4 px-6 py-3 font-bold text-white rounded-xl"
                style={{ background: brandConfig.color.primary }}
              >
                Réinitialiser
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-16 text-white"
        style={{
          background: `linear-gradient(135deg, ${brandConfig.color.primary} 0%, ${brandConfig.color.secondary} 100%)`,
        }}
      >
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-black mb-4">
            Besoin d'un système d'irrigation sur-mesure ?
          </h2>
          <p className="text-xl text-blue-50 mb-8">
            Nos experts vous accompagnent dans votre projet
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+21671333858"
              className="px-8 py-4 bg-white font-bold rounded-2xl hover:bg-blue-50 transition-all"
              style={{ color: brandConfig.color.primary }}
            >
              📞 (+216) 71 333 858
            </a>
            <Link
              href="/fr/rendez-vous"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-bold rounded-2xl hover:bg-white/20 transition-all"
            >
              Prendre rendez-vous
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}