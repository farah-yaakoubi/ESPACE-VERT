import { PageHeroStatic } from "@/components/sections/PageHeroStatic";
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Droplets, Info } from "lucide-react";
import { RdvForm } from "@/components/forms/RdvForm";
import { SectionTitleLine } from "@/components/ui/SectionTitleIcon";

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
        imagePosition="center 34%"
        imagePositionTablet="center 28%"
        imagePositionMobile="center 22%"
        contentMaxWidth="42rem"
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
                  <p className="mb-1 text-[15px] font-semibold">Service réservé à Matar Irrigation</p>
                  <p className="text-sm leading-7 text-sky-700">
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
                <h2 className="site-subheading mb-4 text-[1.35rem]">
                  <SectionTitleLine icon="Droplet" size="sm" color="#0284c7" align="left">Ce que vous obtiendrez</SectionTitleLine>
                </h2>
                <ul className="space-y-3">
                  {[
                    "Audit gratuit de votre installation actuelle",
                    "Conseils personnalisés de nos ingénieurs irrigation",
                    "Devis détaillé sans engagement",
                    "Suivi post-installation par notre équipe SAV",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[15px] leading-7 text-gray-600">
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
                <p className="mb-2 text-[15px] font-semibold text-ev-900">
                  Découvrir les produits Matar
                </p>
                <p className="mb-3 text-sm leading-7 text-gray-500">
                  Consultez notre gamme de solutions d&apos;irrigation avant votre rendez-vous.
                </p>
                <Link href="/marques/matar" className="btn-outline btn-sm w-full justify-center">
                  Voir les produits Matar
                </Link>
              </div>
            </div>

            {/* ── Form ─────────────────────────────────────────── */}
            <div className="lg:col-span-3">
              <div className="card p-5 sm:p-8">
                <h2 className="site-subheading mb-6 text-[1.35rem]">
                  <SectionTitleLine icon="Cal" size="sm" color="#0284c7" align="left">Votre demande de rendez-vous</SectionTitleLine>
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