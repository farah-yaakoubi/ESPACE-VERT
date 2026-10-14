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
    <div className="overflow-hidden rounded-2xl border border-[#1b2118]/10 bg-white shadow-sm">
      <div className="relative border-b border-[#1b2118]/10 bg-white p-5 sm:p-8 lg:p-10">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.22em] text-[#1b2118]/70">
              <ActiveIcon size={13} />
              {activeMode.eyebrow}
            </div>
            <h2 className="mb-2 text-[clamp(1.5rem,3vw,2.2rem)] font-black leading-[1.1] tracking-tight text-[#1b2118]" style={{ fontFamily: "var(--font-display)" }}>{activeMode.title}</h2>
            <p className="max-w-xl text-sm leading-7 text-gray-600">{activeMode.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MODES.map(({ id, label, icon: Icon }) => {
              const active = id === mode;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className={cn(
                    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-3 text-xs font-bold uppercase tracking-wide transition-colors duration-200 sm:min-w-[180px] sm:px-5 sm:text-[13px]",
                    active
                      ? "border-transparent bg-ev-700 text-white hover:bg-ev-800"
                      : "border-[#1b2118]/10 bg-white text-[#1b2118] hover:bg-sand-50",
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
        <aside className="relative overflow-hidden border-b border-ev-800 bg-ev-800 p-5 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
          <div className="relative space-y-5">
            <div>
              <p className="text-[12px] font-extrabold uppercase tracking-[0.22em] text-white/70">Réponse rapide</p>
              <h3 className="mt-2 text-lg font-black text-white">Un conseiller vous oriente vers la bonne solution.</h3>
              <p className="mt-2 text-sm leading-7 text-white/70">
                Produits, disponibilité, installation ou devis: ajoutez les détails utiles et l'équipe vous recontacte.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-white/90">
                <Phone size={16} className="text-ev-300" />
                <span>Conseil commercial et technique</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-white/90">
                <Mail size={16} className="text-ev-300" />
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