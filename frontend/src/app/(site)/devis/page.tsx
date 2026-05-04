import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { PageHero } from "@/components/sections/Hero";
import { DevisForm } from "@/components/forms/DevisForm";

export const metadata: Metadata = {
  title: "Demander un devis",
  description:
    "Obtenez un devis personnalisé pour nos produits d'irrigation, fertilisation, semences ou machinisme.",
};

const STEPS = [
  { n: "01", label: "Remplissez le formulaire", desc: "Décrivez votre besoin en quelques mots." },
  { n: "02", label: "Notre équipe vous rappelle", desc: "Un expert vous contacte sous 24–48h." },
  { n: "03", label: "Recevez votre devis",        desc: "Offre personnalisée et sans engagement." },
];

export default function DevisPage() {
  return (
    <>
      <PageHero
        eyebrow="Sans engagement"
        title="Demandez un devis"
        subtitle="Réponse sous 24–48h par un expert de notre équipe."
      />

      <section className="section">
        <div className="container-ev">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* ── Left: Steps ──────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-ev-900 font-display">Comment ça marche ?</h2>

              <div className="space-y-6">
                {STEPS.map((s) => (
                  <div key={s.n} className="flex gap-4">
                    <span className="shrink-0 w-10 h-10 rounded-xl bg-ev-700 text-white flex items-center justify-center text-sm font-bold">
                      {s.n}
                    </span>
                    <div>
                      <p className="font-semibold text-ev-900 text-sm">{s.label}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info box */}
              <div className="rounded-2xl bg-ev-50 border border-ev-100 p-5 mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-ev-600" />
                  <p className="font-semibold text-ev-800 text-sm">Devis gratuit & sans engagement</p>
                </div>
                <p className="text-xs text-ev-700 leading-relaxed">
                  Vous pouvez également préciser le produit concerné dans le champ
                  &ldquo;Précisions&rdquo;, ou retrouver chaque produit depuis notre catalogue
                  et demander un devis directement depuis sa fiche.
                </p>
              </div>
            </div>

            {/* ── Right: Form ──────────────────────────────────── */}
            <div className="lg:col-span-3">
              <div className="card p-8">
                <h2 className="text-xl font-bold text-ev-900 mb-6 font-display">
                  Votre demande
                </h2>
                {/* No id_produit here — standalone form */}
                <DevisForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
