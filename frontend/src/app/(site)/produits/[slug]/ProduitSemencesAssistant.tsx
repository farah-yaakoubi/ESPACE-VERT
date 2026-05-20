"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Sprout, X } from "lucide-react";
import { SemencesRecommandation } from "../../activites/[slug]/SemencesRecommandation";

export function ProduitSemencesAssistant({ productName }: { productName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-ev-200 bg-white text-ev-700 shadow-[0_16px_36px_rgba(21,128,61,0.18)] transition-all hover:-translate-y-0.5 hover:border-ev-300 hover:text-ev-800 sm:bottom-6 sm:right-6"
        aria-label="Ouvrir l'assistant semences"
      >
        <span className="absolute -top-2 -left-2 flex h-7 min-w-[28px] items-center justify-center rounded-full bg-ev-700 px-2 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
          IA
        </span>
        <Sprout size={22} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
            />

            <motion.aside
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-0 bottom-0 z-[60] max-h-[88dvh] overflow-hidden rounded-t-[28px] border border-white/10 bg-white shadow-2xl sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[min(560px,100vw)] sm:rounded-none sm:rounded-l-[28px]"
            >
              <div className="flex items-start justify-between gap-4 border-b border-sand-200 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ev-600">
                    Assistant semences
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-ev-950">
                    Besoin d&apos;une recommandation autour de {productName} ?
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Renseignez votre culture et vos conditions de semis pour obtenir des suggestions simples et ciblées.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sand-200 text-gray-500 transition-colors hover:bg-sand-50 hover:text-gray-700"
                  aria-label="Fermer le panneau"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[calc(88dvh-88px)] overflow-y-auto px-5 py-5 sm:max-h-screen sm:px-6">
                <div className="mb-4 flex items-center gap-2 rounded-2xl border border-ev-100 bg-ev-50 px-4 py-3 text-sm text-ev-800">
                  <Sparkles size={15} className="shrink-0 text-ev-700" />
                  Cet outil vous aide à comparer rapidement les semences adaptées à votre contexte.
                </div>

                <SemencesRecommandation
                  variant="panel"
                  title="Calculez vos recommandations"
                  subtitle="Choisissez votre culture, le mois, le sol et le climat pour obtenir une sélection ciblée."
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
