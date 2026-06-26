import type { Metadata } from "next";
import { Clock3, FileText, Headphones, ShieldCheck } from "lucide-react";
import { PageHeroStatic } from "@/components/sections/PageHeroStatic";
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

const BENEFITS = [
  { icon: Clock3, label: "Réponse sous 24-48h" },
  { icon: Headphones, label: "Conseil technique inclus" },
  { icon: ShieldCheck, label: "Demande sans engagement" },
];

export default function DevisPage() {
  return (
    <>
      <PageHeroStatic
        page="devis"
        eyebrow="Sans engagement"
        title="Demandez un devis"
        subtitle="Réponse sous 24–48h par un expert de notre équipe."
        fallbackImage="/images/hero/fertivert.webp"
        imagePosition="center 40%"
        imagePositionTablet="center 35%"
        imagePositionMobile="center 28%"
        contentMaxWidth="40rem"
      />

      <section className="section bg-[linear-gradient(180deg,#faf9f7_0%,#f1f7ed_46%,#ffffff_100%)]">
        <div className="container-ev">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">

            {/* ── Left: Steps ──────────────────────────────────── */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 rounded-[1.5rem] border border-ev-100 bg-white p-5 shadow-[0_18px_60px_rgba(10,92,46,0.10)] sm:p-7">
                <div className="mb-6">
                  <span className="inline-flex items-center gap-2 rounded-full border border-ev-200 bg-ev-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-ev-800">
                    <FileText size={13} />
                    Devis personnalisé
                  </span>
                  <h2 className="site-subheading mt-3">Comment ça marche ?</h2>
                  <p className="mt-2 text-sm leading-7 text-gray-600">
                    Une demande claire nous aide à vous proposer le bon produit, service ou accompagnement.
                  </p>
                </div>

                <div className="space-y-4">
                  {STEPS.map((s) => (
                    <div key={s.n} className="flex gap-4 rounded-xl border border-sand-200 bg-sand-50/70 p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ev-800 text-sm font-black text-white shadow-[0_10px_22px_rgba(10,92,46,0.22)]">
                        {s.n}
                      </span>
                      <div>
                        <p className="text-[15px] font-black text-ev-950">{s.label}</p>
                        <p className="mt-1 text-sm leading-7 text-gray-500">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3">
                  {BENEFITS.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                      <Icon size={17} className="text-ev-600" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: Form ──────────────────────────────────── */}
            <div className="lg:col-span-3">
              <div className="overflow-hidden rounded-[1.5rem] border border-ev-100 bg-white shadow-[0_24px_80px_rgba(10,92,46,0.12)]">
                <div className="border-b border-ev-100 bg-[linear-gradient(135deg,#f5fbf1_0%,#eaf6e3_50%,#fff7e6_100%)] px-5 py-5 sm:px-8">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-ev-700">Votre besoin</p>
                  <h2 className="site-subheading mt-1 text-[1.35rem]">
                    Demande de devis
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-600">
                    Indiquez le domaine, les quantités ou les contraintes du projet pour recevoir une réponse plus précise.
                  </p>
                </div>
                <div className="p-5 sm:p-8">
                  {/* No id_produit here — standalone form */}
                  <DevisForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
