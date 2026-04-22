import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { PageHero } from "@/components/sections/Hero";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez le Groupe Espace Vert : formulaire, téléphone, e-mail et adresses de nos agences.",
};

const AGENCES = [
  {
    ville:    "Tunis — Siège",
    adresse:  "69, rue Abderrazak Chraibi, 1001 Tunis",
    tel:      "(+216) 71 333 858",
    tel2:     "(+216) 71 348 404",
    email:    "secretariat.groupeev@planet.tn",
    horaires: "Lun–Ven 08h–17h  ·  Sam 08h–12h",
    principal: true,
  },
  {
    ville:    "Soliman",
    adresse:  "Route R43, Soliman",
    tel:      "(+216) 72 333 143",
    horaires: "Lun–Ven 08h–17h  ·  Sam 08h–12h",
    principal: false,
  },
  {
    ville:    "Borj Amri",
    adresse:  "Sidi Ali El Hattab, Borj Amri",
    tel:      "(+216) 71 234 567",
    horaires: "Lun–Ven 08h–17h  ·  Sam 08h–12h",
    principal: false,
  },
  {
    ville:    "Sfax",
    adresse:  "Route de Gabes, Sfax 3049",
    tel:      "(+216) 74 000 000",
    horaires: "Lun–Ven 08h–17h  ·  Sam 08h–12h",
    principal: false,
  },
] as const;

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Groupe Espace Vert"
        title="Contactez-nous"
        subtitle="Notre équipe vous répond dans les plus brefs délais."
      />

      <section className="section">
        <div className="container-ev">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* ── Form (wider) ─────────────────────────────────── */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold text-ev-900 mb-6 font-display">
                Envoyez-nous un message
              </h2>
              <div className="card p-8">
                <ContactForm />
              </div>
            </div>

            {/* ── Sidebar: Agences ──────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">
              <h2 className="text-2xl font-bold text-ev-900 font-display">Nos agences</h2>

              {AGENCES.map((ag) => (
                <div
                  key={ag.ville}
                  className={`card p-5 space-y-3 ${ag.principal ? "border-ev-200 bg-ev-50/40" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={15} className="text-ev-600 shrink-0" />
                    <h3 className="font-semibold text-ev-900 text-sm">{ag.ville}</h3>
                    {ag.principal && (
                      <span className="ml-auto badge-green text-[10px] px-2 py-0.5 rounded-full font-bold">
                        Siège
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed pl-5">{ag.adresse}</p>

                  <div className="pl-5 space-y-1.5">
                    <a
                      href={`tel:${ag.tel.replace(/\s/g, "")}`}
                      className="flex items-center gap-2 text-xs text-gray-600 hover:text-ev-700 transition-colors"
                    >
                      <Phone size={13} className="text-ev-500 shrink-0" />
                      {ag.tel}
                    </a>
                    {"tel2" in ag && ag.tel2 && (
                      <a
                        href={`tel:${ag.tel2.replace(/\s/g, "")}`}
                        className="flex items-center gap-2 text-xs text-gray-600 hover:text-ev-700 transition-colors"
                      >
                        <Phone size={13} className="text-ev-500 shrink-0" />
                        {ag.tel2}
                      </a>
                    )}
                    {"email" in ag && ag.email && (
                      <a
                        href={`mailto:${ag.email}`}
                        className="flex items-center gap-2 text-xs text-gray-600 hover:text-ev-700 transition-colors"
                      >
                        <Mail size={13} className="text-ev-500 shrink-0" />
                        {ag.email}
                      </a>
                    )}
                    <p className="flex items-start gap-2 text-xs text-gray-400">
                      <Clock size={13} className="text-ev-400 shrink-0 mt-px" />
                      {ag.horaires}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
