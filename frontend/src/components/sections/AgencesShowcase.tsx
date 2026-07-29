"use client";
import { motion } from "framer-motion";
import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import type { Agence } from "@/config/agences";
export function AgencesShowcase({ agences }: { agences: Agence[] }) {
  if (!agences || agences.length === 0) return null;
  return (
    <section className="section bg-white border-t border-sand-200">
      <div className="container-ev">
        <div className="max-w-2xl">
          <p className="eyebrow mb-3">Nos agences</p>
          <h2 className="site-heading">Une présence de proximité</h2>
          <p className="site-copy mt-4">
            Retrouvez les coordonnées de chacune de nos agences pour vous
            orienter vers l&apos;interlocuteur le plus proche de chez vous.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {agences.map((agence, index) => (
            <motion.div
              key={`${agence.ville}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="flex flex-col rounded-2xl border border-sand-200 bg-sand-50/60 p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="h-card text-ev-950">{agence.ville}</h3>
                {agence.principal && (
                  <span className="shrink-0 rounded-full bg-ev-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-ev-800">
                    Siège
                  </span>
                )}
              </div>

              <div className="space-y-2.5 text-sm text-gray-600">
                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-ev-600" />
                  <p>{agence.adresse}</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone size={15} className="mt-0.5 shrink-0 text-ev-600" />
                  <div>
                    <p>{agence.tel}</p>
                    {agence.tel2 && <p className="mt-0.5">{agence.tel2}</p>}
                  </div>
                </div>
                {agence.email && (
                  <div className="flex items-start gap-2.5">
                    <Mail size={15} className="mt-0.5 shrink-0 text-ev-600" />
                    <p className="break-all">{agence.email}</p>
                  </div>
                )}
                <div className="flex items-start gap-2.5">
                  <Clock size={15} className="mt-0.5 shrink-0 text-ev-600" />
                  <p>{agence.horaires}</p>
                </div>
              </div>

              {agence.maps && (
                <a
                  href={agence.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-ev-700 transition-colors hover:text-ev-900"
                >
                  <Navigation size={13} />
                  Voir l&apos;itinéraire
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}