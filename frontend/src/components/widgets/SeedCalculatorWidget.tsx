'use client';

import { useState } from 'react';
import { X, Sprout, Calculator, Info } from 'lucide-react';
import Image from 'next/image';

interface SeedCalculatorResult {
  seedQuantity: number;
  unit: string;
  spacing: string;
  depthInfo: string;
}

interface SeedCalculatorWidgetProps {
  triggerIcon?: string; // URL de l'image/logo du widget
}

export default function SeedCalculatorWidget({
  triggerIcon,
}: SeedCalculatorWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [soilArea, setSoilArea] = useState<number>(100); // en m²
  const [areaUnit, setAreaUnit] = useState<'m2' | 'hectare'>('m2');
  const [plantType, setPlantType] = useState<string>('tomate');
  const [seedingDepth, setSeedingDepth] = useState<number>(0.5);
  const [result, setResult] = useState<SeedCalculatorResult | null>(null);

  // Base de données des semences (à enrichir)
  const seedDatabase: Record<
    string,
    {
      name: string;
      seedsPerM2: number;
      unit: string;
      spacing: string;
      depthCm: { min: number; max: number };
    }
  > = {
    tomate: {
      name: 'Tomate',
      seedsPerM2: 30,
      unit: 'graines',
      spacing: '45-60 cm entre les plants',
      depthCm: { min: 0.5, max: 1 },
    },
    laitue: {
      name: 'Laitue',
      seedsPerM2: 20,
      unit: 'graines',
      spacing: '30 cm entre les plants',
      depthCm: { min: 0.5, max: 1 },
    },
    carotte: {
      name: 'Carotte',
      seedsPerM2: 100,
      unit: 'graines',
      spacing: '5-8 cm entre les plants',
      depthCm: { min: 1, max: 2 },
    },
    oignon: {
      name: 'Oignon',
      seedsPerM2: 50,
      unit: 'graines',
      spacing: '15-20 cm entre les plants',
      depthCm: { min: 1, max: 1.5 },
    },
    courge: {
      name: 'Courge',
      seedsPerM2: 2,
      unit: 'graines',
      spacing: '1-1.5 m entre les plants',
      depthCm: { min: 2, max: 3 },
    },
    haricot: {
      name: 'Haricot',
      seedsPerM2: 10,
      unit: 'graines',
      spacing: '15-20 cm entre les plants',
      depthCm: { min: 2, max: 4 },
    },
  };

  const handleCalculate = () => {
    const plantData = seedDatabase[plantType];
    if (!plantData) return;

    // Convertir la surface en m²
    const areaInM2 = areaUnit === 'hectare' ? soilArea * 10000 : soilArea;

    // Calculer la quantité de semences
    const seedQuantity = Math.ceil(areaInM2 * plantData.seedsPerM2);

    setResult({
      seedQuantity,
      unit: plantData.unit,
      spacing: plantData.spacing,
      depthInfo: `${plantData.depthCm.min}-${plantData.depthCm.max} cm`,
    });
  };

  const handleOpenWidget = () => {
    setIsOpen(true);
  };

  const handleCloseWidget = () => {
    setIsOpen(false);
    setResult(null);
  };

  return (
    <>
      {/* Trigger Button - Floating Widget Icon */}
      <button
        onClick={handleOpenWidget}
        className="fixed bottom-24 right-6 z-40 flex items-center justify-center w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
        aria-label="Calculateur de semences"
      >
        {triggerIcon ? (
          <Image
            src={triggerIcon}
            alt="Calculateur"
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <Sprout size={32} />
        )}
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"
          onClick={handleCloseWidget}
          aria-hidden="true"
        />
      )}

      {/* Modal Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div
            className="pointer-events-auto bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white p-6 flex items-center justify-between z-10">
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
                {!triggerIcon && (
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Sprout size={24} />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">Calculateur de Semences</h2>
                  <p className="text-white/80 text-sm">
                    Calculez facilement vos besoins en semences
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
            <div className="p-8">
              {/* Info Box */}
              <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex gap-3">
                <Info size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-800">
                  Entrez vos paramètres pour obtenir une estimation du nombre de semences nécessaires
                </p>
              </div>

              {/* Form Section */}
              <div className="space-y-6">
                {/* Plant Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type de plante
                  </label>
                  <select
                    value={plantType}
                    onChange={(e) => setPlantType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    {Object.entries(seedDatabase).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Area Input */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Surface à cultiver
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={soilArea}
                      onChange={(e) => setSoilArea(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Entrez la surface"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Unité
                    </label>
                    <select
                      value={areaUnit}
                      onChange={(e) => setAreaUnit(e.target.value as 'm2' | 'hectare')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="m2">m²</option>
                      <option value="hectare">Hectare</option>
                    </select>
                  </div>
                </div>

                {/* Seeding Depth */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Profondeur de semis (cm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={seedingDepth}
                    onChange={(e) => setSeedingDepth(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Profondeur en cm"
                  />
                </div>

                {/* Calculate Button */}
                <button
                  onClick={handleCalculate}
                  className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mt-8"
                >
                  <Calculator size={20} />
                  Calculer
                </button>
              </div>

              {/* Results Section */}
              {result && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">📊 Résultats du calcul</h3>

                  <div className="space-y-4">
                    {/* Seed Quantity */}
                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200">
                      <p className="text-sm text-emerald-700 font-medium mb-1">Quantité de semences</p>
                      <p className="text-3xl font-bold text-emerald-800">
                        {result.seedQuantity.toLocaleString()} {result.unit}
                      </p>
                    </div>

                    {/* Spacing Info */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <p className="text-sm text-blue-700 font-medium mb-1">Espacement recommandé</p>
                      <p className="text-blue-900">{result.spacing}</p>
                    </div>

                    {/* Depth Info */}
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                      <p className="text-sm text-amber-700 font-medium mb-1">Profondeur de semis</p>
                      <p className="text-amber-900">{result.depthInfo}</p>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                      💡 Conseils
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Ajoutez 10-15% de semences supplémentaires pour compenser les pertes</li>
                      <li>• Respectez les dates de semis selon votre région</li>
                      <li>• Conservez les semences dans un endroit frais et sec</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-3xl">
              <p className="text-gray-600 text-xs text-center">
                Les calculs sont estimatifs. Pour des résultats précis, consultez les recommandations du fabricant.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
