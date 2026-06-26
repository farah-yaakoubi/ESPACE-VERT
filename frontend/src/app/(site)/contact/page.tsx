import type { Metadata } from "next";
import { PageHeroStatic } from "@/components/sections/PageHeroStatic";
import { ContactRequestToggle } from "@/components/forms/ContactRequestToggle";
import { AgencesShowcase } from "@/components/sections/AgencesShowcase";
import { AGENCES } from "@/config/agences";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez le Groupe Espace Vert : formulaire, téléphone, e-mail et adresses de nos agences.",
};

export default function ContactPage() {
  return (
    <>
      {/* Hero image fixe + zoom-in */}
      <PageHeroStatic
        page="contact"
        eyebrow="Groupe Espace Vert"
        title="Contactez-nous"
        subtitle="Notre équipe vous répond dans les plus brefs délais."
        fallbackImage="/images/hero/fertivert.webp"
        imagePosition="center 38%"
        imagePositionTablet="center 34%"
        imagePositionMobile="center 26%"
        contentMaxWidth="40rem"
      />

      <section className="section bg-[linear-gradient(180deg,#faf9f7_0%,#f2f7ee_48%,#ffffff_100%)]">
        <div className="container-ev">
          <div className="mx-auto max-w-6xl">
            <ContactRequestToggle />
          </div>
        </div>
      </section>

      <AgencesShowcase agences={AGENCES} />
    </>
  );
}
