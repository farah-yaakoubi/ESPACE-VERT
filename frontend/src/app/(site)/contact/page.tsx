import type { Metadata } from "next";
import { ContactHero } from "@/components/sections/ContactHero";
import { AgencesContactSection } from "@/components/sections/AgencesContactSection";
import { ContactRequestToggle } from "@/components/forms/ContactRequestToggle";
import { AGENCES } from "@/config/agences";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez le Groupe Espace Vert : formulaire, téléphone, e-mail et adresses de nos agences.",
};

export default function ContactPage() {
  return (
    <>
      {/* Bandeau simple, même style que les pages d'activité */}
      <ContactHero
        eyebrow="Groupe Espace Vert"
        title="Contactez-nous"
        subtitle="Notre équipe vous répond dans les plus brefs délais — produits, disponibilité, installation ou devis."
      />

      {/* Sélecteur d'agences interactif + carte dynamique — toutes les coordonnées, un seul endroit */}
      <AgencesContactSection agences={AGENCES} />

      <section className="py-12 md:py-16" style={{ backgroundColor: "#f3ecd9" }}>
        <div className="container-ev">
          <div className="mx-auto max-w-6xl">
            <ContactRequestToggle />
          </div>
        </div>
      </section>
    </>
  );
}