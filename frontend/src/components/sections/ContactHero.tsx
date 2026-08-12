"use client";

import { Ico } from "@/components/icons/AgriIcons";

/**
 * ContactHero — bandeau plat (pas de photo) pour la page Contact, inspiré
 * d'une maquette à fond couleur + chevrons décoratifs. Repris ici dans la
 * charte Espace Vert : dégradé sauge/blé + chevrons "ChevR" du système
 * d'icônes maison, en écho au tracteur qui avance / au sillon labouré.
 */
export function ContactHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(160deg,#eef7e6_0%,#e0f5d8_55%,#d7f0cb_100%)] pb-20 pt-[calc(var(--nav-h)+56px)] sm:pb-24 sm:pt-[calc(var(--nav-h)+72px)]">
      {/* Chevrons décoratifs — coin haut-gauche */}
      <div className="pointer-events-none absolute left-6 top-[22%] hidden gap-1 sm:flex md:left-10">
        {[0, 1, 2, 3].map((i) => (
          <Ico.ChevR
            key={i}
            className="h-6 w-6 text-ev-400"
            style={{ opacity: 0.9 - i * 0.18 }}
          />
        ))}
      </div>

      {/* Chevrons décoratifs — coin bas-droit, inversés */}
      <div className="pointer-events-none absolute bottom-10 right-6 hidden gap-1 sm:flex md:right-12">
        {[0, 1, 2, 3].map((i) => (
          <Ico.ChevR
            key={i}
            className="h-6 w-6 rotate-180 text-ev-500"
            style={{ opacity: 0.55 - i * 0.11 }}
          />
        ))}
      </div>

      {/* Halo lumineux discret */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/40 blur-3xl"
      />

      <div className="container-ev relative text-center">
        {eyebrow && (
          <p className="eyebrow mb-3 justify-center inline-flex items-center gap-2">
            <Ico.Leaf className="h-3.5 w-3.5" />
            {eyebrow}
          </p>
        )}

        <h1 className="site-heading mx-auto max-w-3xl text-ev-950">
          {title}
        </h1>

        {/* Trait ondulé — signature graphique de la section */}
        <svg
          aria-hidden
          viewBox="0 0 160 16"
          className="mx-auto mt-4 h-4 w-40 text-ev-500"
        >
          <path
            d="M2 8c8-8 16 8 24 0s16-8 24 0 16 8 24 0 16-8 24 0 16 8 24 0 16-8 24 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>

        {subtitle && (
          <p className="site-copy mx-auto mt-5 max-w-xl text-ev-900/70">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}