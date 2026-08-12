"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import type { Agence } from "@/config/agences";
import { Reveal } from "@/components/ui/Reveal";
import { SectionTitleLine } from "@/components/ui/SectionTitleIcon";
import { cn } from "@/lib/utils";

/**
 * AgencesContactSection — sélecteur d'agences + carte dynamique.
 *
 * Remplace à la fois l'ancien strip "Tunis uniquement" en haut de page et
 * la grille statique "Nos agences" plus bas : toutes les coordonnées
 * (tél, e-mail, adresse, horaires) sont réunies ici, dans un seul module
 * interactif — on choisit une agence à gauche, la carte et la fiche de
 * droite se mettent à jour avec une transition fondu/slide fluide.
 */
export function AgencesContactSection({ agences }: { agences: Agence[] }) {
  const [activeIndex, setActiveIndex] = useState(() => {
    const i = agences.findIndex((a) => a.principal);
    return i >= 0 ? i : 0;
  });
  const active = agences[activeIndex];

  const mapSrc =
    active.lat != null && active.lng != null
      ? `https://maps.google.com/maps?q=${active.lat},${active.lng}&z=14&output=embed`
      : `https://maps.google.com/maps?q=${encodeURIComponent(active.adresse)}&z=13&output=embed`;

  return (
    <section className="section bg-white">
      <div className="container-ev">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-3 justify-center inline-flex items-center gap-2">Nos agences</p>
          <h2 className="site-heading text-ev-950">
            <SectionTitleLine icon="Barn" align="left">Une agence près de chez vous</SectionTitleLine>
          </h2>
          <p className="site-copy mx-auto mt-4 max-w-xl">
            Choisissez une agence pour voir ses coordonnées et sa localisation exacte.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(280px,0.85fr)_1.15fr] lg:items-start">
          {/* Liste des agences */}
          <div
            role="tablist"
            aria-label="Choisir une agence"
            className="flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
          >
            {agences.map((agence, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={agence.ville}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "group relative flex min-w-[240px] shrink-0 flex-col gap-2 rounded-2xl border p-4 text-left transition-all duration-200 lg:min-w-0",
                    isActive
                      ? "border-ev-300 bg-ev-50 shadow-[0_10px_32px_rgba(10,60,8,0.10)]"
                      : "border-sand-200 bg-white hover:border-ev-200 hover:bg-ev-50/40",
                  )}
                >
                  {/* Barre d'accent active */}
                  <span
                    className={cn(
                      "absolute inset-y-3 left-0 w-[3px] rounded-full bg-ev-500 transition-opacity duration-200",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex items-center justify-between gap-2 pl-2">
                    <h3 className={cn("h-card", isActive ? "text-ev-950" : "text-gray-800")}>
                      {agence.ville.replace(" — Siège", "")}
                    </h3>
                    {agence.principal && (
                      <span className="shrink-0 rounded-full bg-ev-700 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-white">
                        Siège
                      </span>
                    )}
                  </div>
                  <div className="flex items-start gap-2 pl-2 text-xs leading-5 text-gray-500">
                    <MapPin size={13} className="mt-0.5 shrink-0 text-ev-500" />
                    <span>{agence.adresse}</span>
                  </div>
                  <div className="flex items-center gap-2 pl-2 text-xs font-semibold text-gray-600">
                    <Phone size={13} className="shrink-0 text-ev-500" />
                    <span>{agence.tel}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Carte + fiche détaillée de l'agence sélectionnée */}
          <div className="relative overflow-hidden rounded-[1.5rem] border border-sand-200 bg-white shadow-[0_20px_60px_rgba(10,60,8,0.10)]">
            <div className="relative h-[280px] w-full sm:h-[340px]">
              <AnimatePresence mode="wait">
                <motion.iframe
                  key={active.ville}
                  title={`Carte — ${active.ville}`}
                  src={mapSrc}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active.ville}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="border-t border-sand-100 p-5 sm:p-7"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-ev-950">
                      {active.ville.replace(" — Siège", "")}
                      {active.principal && (
                        <span className="ml-2 rounded-full bg-ev-100 px-2.5 py-1 align-middle text-[10px] font-black uppercase tracking-[0.08em] text-ev-800">
                          Siège
                        </span>
                      )}
                    </h3>
                    <p className="mt-1 flex items-start gap-2 text-sm text-gray-600">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-ev-600" />
                      {active.adresse}
                    </p>
                  </div>

                  {active.maps && (
                    <a
                      href={active.maps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-ev-200 bg-ev-50 px-3.5 py-2 text-xs font-black uppercase tracking-[0.06em] text-ev-800 transition-colors hover:bg-ev-100"
                    >
                      <Navigation size={13} />
                      Itinéraire
                    </a>
                  )}
                </div>

                <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  <a
                    href={`tel:${active.tel.replace(/[^+\d]/g, "")}`}
                    className="flex items-center gap-2.5 rounded-xl border border-sand-200 bg-sand-50/60 px-3.5 py-2.5 text-sm text-gray-700 transition-colors hover:border-ev-200 hover:bg-ev-50"
                  >
                    <Phone size={15} className="shrink-0 text-ev-600" />
                    <span className="truncate">{active.tel}{active.tel2 ? ` · ${active.tel2}` : ""}</span>
                  </a>
                  {active.email && (
                    <a
                      href={`mailto:${active.email}`}
                      className="flex items-center gap-2.5 rounded-xl border border-sand-200 bg-sand-50/60 px-3.5 py-2.5 text-sm text-gray-700 transition-colors hover:border-ev-200 hover:bg-ev-50"
                    >
                      <Mail size={15} className="shrink-0 text-ev-600" />
                      <span className="truncate">{active.email}</span>
                    </a>
                  )}
                  <div className="flex items-center gap-2.5 rounded-xl border border-sand-200 bg-sand-50/60 px-3.5 py-2.5 text-sm text-gray-700 sm:col-span-2">
                    <Clock size={15} className="shrink-0 text-ev-600" />
                    <span>{active.horaires}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}