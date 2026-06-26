"use client";

import { motion } from "framer-motion";
import { Building2, Clock, ExternalLink, Mail, MapPin, Navigation, Phone } from "lucide-react";
import type { Agence } from "@/config/agences";

function mapsHref(agence: Agence) {
  return agence.maps ?? `https://maps.google.com/?q=${encodeURIComponent(`${agence.adresse} ${agence.ville} Tunisie`)}`;
}

export function AgencesShowcase({ agences }: { agences: Agence[] }) {
  return (
    <section className="section bg-[#f7faf4] border-t border-ev-100">
      <div className="container-ev">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-ev-100 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-ev-700 shadow-sm">
              <Building2 size={13} />
              Réseau Groupe Espace Vert
            </div>
            <h2 className="site-heading">Nos agences</h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              Retrouvez l'agence la plus proche et ouvrez directement l'itinéraire dans Google Maps.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {agences.map((agence, index) => (
            <motion.article
              key={agence.ville}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.42, delay: index * 0.06, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              className={`group relative flex min-h-[320px] flex-col overflow-hidden rounded-[1.25rem] border bg-white p-5 shadow-[0_14px_42px_rgba(31,73,43,0.07)] transition-shadow hover:shadow-[0_22px_54px_rgba(31,73,43,0.12)] ${
                agence.principal ? "border-ev-200" : "border-gray-100"
              }`}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#2e7d4f,#8cc63f,#d3a642)]" />

              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ev-50 text-ev-700 ring-1 ring-ev-100">
                  <MapPin size={22} />
                </div>
                {agence.principal && (
                  <span className="rounded-full bg-ev-700 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                    Siège
                  </span>
                )}
              </div>

              <h3 className="text-xl font-black text-ev-950" style={{ fontFamily: "var(--font-display)" }}>
                {agence.ville}
              </h3>
              <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-500">{agence.adresse}</p>

              <div className="mt-5 space-y-3 border-t border-gray-100 pt-5">
                <a
                  href={`tel:${agence.tel.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 text-sm font-semibold text-gray-700 transition-colors hover:text-ev-700"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ev-50 text-ev-700">
                    <Phone size={14} />
                  </span>
                  {agence.tel}
                </a>

                {agence.tel2 && (
                  <a
                    href={`tel:${agence.tel2.replace(/\s/g, "")}`}
                    className="flex items-center gap-3 text-sm font-semibold text-gray-700 transition-colors hover:text-ev-700"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ev-50 text-ev-700">
                      <Phone size={14} />
                    </span>
                    {agence.tel2}
                  </a>
                )}

                {agence.email && (
                  <a
                    href={`mailto:${agence.email}`}
                    className="flex items-center gap-3 text-sm font-semibold text-gray-700 transition-colors hover:text-ev-700"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sand-50 text-[#9a6b1f]">
                      <Mail size={14} />
                    </span>
                    <span className="min-w-0 truncate">{agence.email}</span>
                  </a>
                )}

                <p className="flex items-start gap-3 text-sm leading-6 text-gray-500">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                    <Clock size={14} />
                  </span>
                  {agence.horaires}
                </p>
              </div>

              <a
                href={mapsHref(agence)}
                target="_blank"
                rel="noreferrer"
                className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ev-700 px-4 text-sm font-black text-white transition-colors hover:bg-ev-800"
              >
                <Navigation size={16} />
                Ouvrir dans Google Maps
                <ExternalLink size={14} className="opacity-80" />
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
