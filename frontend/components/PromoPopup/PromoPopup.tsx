"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function PromoPopup() {
  const t = useTranslations("promo");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Vérifier si le popup a déjà été fermé
    const hasClosedPromo = localStorage.getItem("promoPopupClosed");
    
    if (!hasClosedPromo) {
      // Afficher après 2 secondes
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Enregistrer dans localStorage que l'utilisateur a fermé le popup
    localStorage.setItem("promoPopupClosed", "true");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] max-w-2xl"
          >
            <div className="relative bg-gradient-to-br from-white via-[#f0f9e8] to-white rounded-3xl shadow-2xl overflow-hidden border-4 border-[#0a6030]">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 group"
              >
                <XMarkIcon className="w-6 h-6 text-gray-700 group-hover:text-[#6b9e3e]" />
              </button>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#0a6030]/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#6b9e3e]/20 rounded-full blur-3xl" />

              {/* Content */}
              <div className="relative p-8 md:p-12">
                {/* Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0a6030] to-[#6b9e3e] text-white rounded-full text-sm font-bold mb-6"
                >
                  <SparklesIcon className="w-5 h-5" />
                  <span>Offre Limitée</span>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl font-black text-[#2d5016] mb-4"
                >
                  {t("title")}
                </motion.h2>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-gray-700 mb-8"
                >
                  {t("subtitle")}
                </motion.p>

                {/* Promo Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-[#0a6030]/30"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-5xl font-black text-[#0a6030] mb-2">-25%</div>
                      <div className="text-sm font-semibold text-gray-700">
                        Sur tous les produits Fertivert
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-5xl font-black text-[#6b9e3e] mb-2">-15%</div>
                      <div className="text-sm font-semibold text-gray-700">
                        Sur la gamme Pulvert
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-full">
                      <span className="text-2xl">⏰</span>
                      <span className="text-sm font-bold text-gray-700">
                        Offre valable jusqu'au 31 Mars 2025
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <button
                    onClick={handleClose}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-[#0a6030] to-[#6b9e3e] text-white rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all"
                  >
                    Découvrir les offres
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-8 py-4 bg-white/50 hover:bg-white text-gray-700 rounded-xl font-bold border-2 border-[#0a6030]/30 hover:border-[#0a6030] transition-all"
                  >
                    Plus tard
                  </button>
                </motion.div>

                {/* Fine Print */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-xs text-gray-500 text-center mt-6"
                >
                  * Offre non cumulable avec d'autres promotions. Valable dans nos agences de Tunis, Soliman et Kairouan.
                </motion.p>
              </div>

              {/* Animated Border Effect */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: "linear-gradient(45deg, transparent 30%, #0a6030 50%, transparent 70%)",
                  backgroundSize: "200% 200%",
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}