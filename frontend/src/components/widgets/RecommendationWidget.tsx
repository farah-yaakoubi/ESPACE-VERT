'use client';

import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import Image from 'next/image';
import { ProduitCard } from '../cards/ProduitCard';
import type { ProduitCard as Product } from '@/types/api';

export interface RecommendationWidgetProps {
  triggerIcon?: string; // URL de l'image/logo du widget
  products?: Product[];
}

export default function RecommendationWidget({
  triggerIcon,
  products = [],
}: RecommendationWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>(products);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleOpenWidget = () => {
    setIsOpen(true);
  };

  const handleCloseWidget = () => {
    setIsOpen(false);
  };

  const fetchRecommendations = async (categoryId?: string) => {
    setLoading(true);
    try {
      // TODO: Intégrer l'endpoint de recommandation IA du backend
      // const response = await fetch(`/api/produits/recommendations?category=${categoryId}`);
      // const data = await response.json();
      // setRecommendations(data.data);
      
      // Pour l'instant, utiliser les produits fournis
      console.log('Fetching recommendations for category:', categoryId);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button - Floating Widget Icon */}
      <button
        onClick={handleOpenWidget}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-16 h-16 rounded-full bg-ev-700 hover:bg-ev-900 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
        aria-label="Ouvrir les recommandations"
      >
        {triggerIcon ? (
          <Image
            src={triggerIcon}
            alt="Recommandations"
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="text-2xl">✨</div>
        )}
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {recommendations.length}
        </span>
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
          <div
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={handleCloseWidget}
          aria-hidden="true"
        />
      )}

      {/* Modal Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
          <div
            className="pointer-events-auto bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-ev-700 to-ev-900 text-white p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                {triggerIcon && (
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Image
                      src={triggerIcon}
                      alt="Widget Icon"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">Produits Recommandés</h2>
                  <p className="text-white/80 text-sm">
                    Découvrez les produits spécialement sélectionnés pour vous
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseWidget}
                className="ml-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Fermer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Filters Section */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Filtrer par catégorie
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                      selectedCategory === ''
                        ? 'bg-ev-700 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tous
                  </button>
                  {/* TODO: Ajouter les catégories dynamiquement depuis l'API */}
                  {['Semences', 'Engrais', 'Outils'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        fetchRecommendations(cat);
                      }}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        selectedCategory === cat
                          ? 'bg-ev-700 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ev-700" />
                </div>
              )}

              {/* Products Grid */}
              {!loading && recommendations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((product) => (
                    <ProduitCard key={product.id_produit} produit={product} />
                  ))}
                </div>
              ) : !loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg mb-4">
                    Aucun produit recommandé pour l'instant
                  </p>
                  <button
                    onClick={() => fetchRecommendations()}
                    className="px-6 py-2 bg-ev-700 text-white rounded-full hover:bg-ev-900 transition-colors"
                  >
                    Charger les recommandations
                  </button>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-3xl">
              <p className="text-gray-600 text-sm text-center">
                💡 Ces recommandations sont basées sur vos préférences et votre historique
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
