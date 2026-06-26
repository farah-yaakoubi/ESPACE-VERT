"use client";

import { useState } from "react";
import { FileText, Mail, MessageSquareText, Phone } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";
import { DevisForm } from "@/components/forms/DevisForm";
import { cn } from "@/lib/utils";

type PanelMode = "contact" | "devis";

const MODES: Array<{
  id: PanelMode;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof MessageSquareText;
}> = [
  {
    id: "contact",
    label: "Contactez-nous",
    eyebrow: "Message direct",
    title: "Envoyez-nous un message",
    description: "Une question, une information à vérifier ou un besoin de suivi ? Notre équipe vous répond rapidement.",
    icon: MessageSquareText,
  },
  {
    id: "devis",
    label: "Demande de devis",
    eyebrow: "Offre personnalisée",
    title: "Demander un devis",
    description: "Décrivez votre projet, les quantités ou le produit recherché pour recevoir une réponse adaptée.",
    icon: FileText,
  },
];

export function ContactRequestToggle() {
  const [mode, setMode] = useState<PanelMode>("contact");
  const activeMode = MODES.find((item) => item.id === mode) ?? MODES[0];
  const ActiveIcon = activeMode.icon;

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-ev-100 bg-white shadow-[0_24px_80px_rgba(10,92,46,0.12)]">
      <div className="relative border-b border-ev-100 bg-[linear-gradient(135deg,#f5fbf1_0%,#eaf6e3_45%,#fff7e6_100%)] p-5 sm:p-8 lg:p-10">
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#7dc040,#0a5c2e,#f2b84b)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-ev-200 bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-ev-800 shadow-sm">
              <ActiveIcon size={13} />
              {activeMode.eyebrow}
            </div>
            <h2 className="site-subheading mb-2 text-ev-950">{activeMode.title}</h2>
            <p className="max-w-xl text-sm leading-7 text-gray-600">{activeMode.description}</p>
          </div>

          <div className="grid grid-cols-2 rounded-2xl border border-white/90 bg-white/80 p-1.5 shadow-[0_12px_34px_rgba(10,92,46,0.10)] backdrop-blur">
            {MODES.map(({ id, label, icon: Icon }) => {
              const active = id === mode;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className={cn(
                    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-xs font-black transition-all sm:min-w-[180px] sm:px-5 sm:text-sm",
                    active
                      ? "bg-ev-800 text-white shadow-[0_12px_28px_rgba(10,92,46,0.28)]"
                      : "text-gray-600 hover:bg-white hover:text-ev-900",
                  )}
                  aria-pressed={active}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[0.9fr_1.6fr]">
        <aside className="border-b border-ev-100 bg-sand-50/70 p-5 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
          <div className="space-y-5">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-ev-700">Réponse rapide</p>
              <h3 className="mt-2 text-lg font-black text-ev-950">Un conseiller vous oriente vers la bonne solution.</h3>
              <p className="mt-2 text-sm leading-7 text-gray-600">
                Produits, disponibilité, installation ou devis: ajoutez les détails utiles et l'équipe vous recontacte.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 rounded-xl border border-ev-100 bg-white px-4 py-3 text-gray-700">
                <Phone size={16} className="text-ev-700" />
                <span>Conseil commercial et technique</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-ev-100 bg-white px-4 py-3 text-gray-700">
                <Mail size={16} className="text-ev-700" />
                <span>Suivi par e-mail ou téléphone</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="p-5 sm:p-8 lg:p-10">
          {mode === "contact" ? <ContactForm /> : <DevisForm />}
        </div>
      </div>
    </div>
  );
}
