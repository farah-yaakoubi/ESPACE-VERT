import { PageHeroStatic } from "@/components/sections/PageHeroStatic";
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Droplets, Info } from "lucide-react";
import { RdvForm } from "@/components/forms/RdvForm";

export const metadata: Metadata = {
  title: "Prendre rendez-vous — Matar Irrigation",
  description:
    "Prenez rendez-vous avec un expert Matar pour vos besoins en irrigation : audit, installation, maintenance.",
};

export default function RendezVousPage() {
  return (
    <>
      {/* Hero image fixe + zoom-in */}
      <PageHeroStatic
        page="rendez-vous"
        eyebrow="Matar — Irrigation"
        title="Prendre rendez-vous"
        subtitle="Un expert Matar se déplace ou vous reçoit en agence pour évaluer vos besoins en irrigation."
        fallbackImage="/images/hero/matar.webp"
      />

      <section className="section">
        <div className="container-ev">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* ── Sidebar info ─────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Notice */}
              <div className="flex gap-3 p-5 rounded-2xl bg-sky-50 border border-sky-200 text-sm text-sky-900">
                <Info size={18} className="shrink-0 text-sky-500 mt-px" />
                <div>
                  <p className="font-semibold mb-1">Service réservé à Matar Irrigation</p>
                  <p className="text-sky-700 leading-relaxed text-xs">
                    Ce formulaire de prise de rendez-vous est exclusivement dédié aux
                    produits et solutions d&apos;irrigation de la marque <strong>Matar</strong>.
                    Pour toute autre demande, veuillez utiliser notre{" "}
                    <Link href="/contact" className="underline hover:text-sky-900">
                      formulaire de contact
                    </Link>
                    .
                  </p>
                </div>
              </div>

              {/* What to expect */}
              <div>
                <h2 className="font-bold text-ev-900 text-lg mb-4 font-display">
                  Ce que vous obtiendrez
                </h2>
                <ul className="space-y-3">
                  {[
                    "Audit gratuit de votre installation actuelle",
                    "Conseils personnalisés de nos ingénieurs irrigation",
                    "Devis détaillé sans engagement",
                    "Suivi post-installation par notre équipe SAV",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center shrink-0 mt-px">
                        <CalendarDays size={11} className="text-sky-600" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Browse Matar link */}
              <div className="card p-5">
                <p className="text-sm font-semibold text-ev-900 mb-2">
                  Découvrir les produits Matar
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Consultez notre gamme de solutions d&apos;irrigation avant votre rendez-vous.
                </p>
                <Link href="/marques/matar" className="btn-outline btn-sm w-full justify-center">
                  Voir les produits Matar
                </Link>
              </div>
            </div>

            {/* ── Form ─────────────────────────────────────────── */}
            <div className="lg:col-span-3">
              <div className="card p-8">
                <h2 className="text-xl font-bold text-ev-900 mb-6 font-display">
                  Votre demande de rendez-vous
                </h2>
                <RdvForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}