"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

type Agence = {
  id: string;
  ville: string;
  region: string;
  adresse: string;
  tel: string;
  tel2?: string;
  email?: string;
  principal?: boolean;
  image: string;
  pinX: number;
  pinY: number;
};

const AGENCES: Agence[] = [
  {
    id: "tunis",
    ville: "Tunis — Siège",
    region: "Grand Tunis",
    adresse: "69, rue Abderrazak Chraibi, 1001 Tunis",
    tel: "(+216) 71 333 858",
    tel2: "(+216) 71 348 404",
    email: "secretariat.groupeev@planet.tn",
    principal: true,
    image: "/images/agence-tunis.webp",
    pinX: 50,
    pinY: 14,
  },
  {
    id: "soliman",
    ville: "Soliman",
    region: "Cap Bon",
    adresse: "Route R43, Soliman",
    tel: "(+216) 72 333 143",
    image: "/images/agence-sol.webp",
    pinX: 62,
    pinY: 17,
  },
  {
    id: "borj",
    ville: "Borj Amri",
    region: "Nord-Ouest",
    adresse: "Sidi Ali El Hattab, Borj Amri",
    tel: "(+216) 71 234 567",
    image: "/images/agence-borj.webp",
    pinX: 44,
    pinY: 12,
  },
  {
    id: "sfax",
    ville: "Sfax",
    region: "Centre-Est",
    adresse: "Route de Gabes, Sfax 3049",
    tel: "(+216) 74 000 000",
    image: "/images/agence-sfax.webp",
    pinX: 60,
    pinY: 38,
  },
];

function AgencePreview({ agence }: { agence: Agence }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className="pointer-events-none absolute z-20 hidden w-[220px] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_16px_42px_rgba(0,0,0,0.18)] sm:block"
      style={{
        left: `${agence.pinX}%`,
        top: `calc(${agence.pinY}% - 14px)`,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="relative h-28 w-full">
        <Image
          src={agence.image}
          alt={agence.ville}
          fill
          className="object-cover"
          sizes="220px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ev-200">
            {agence.region}
          </p>
          <p className="mt-1 text-sm font-bold text-white">{agence.ville}</p>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs leading-6 text-gray-600">{agence.adresse}</p>
      </div>
      <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-white" />
    </motion.div>
  );
}

export default function AgenceSection() {
  const [activeId, setActiveId] = useState("tunis");

  const activeAgence = useMemo(
    () => AGENCES.find((agence) => agence.id === activeId) ?? AGENCES[0],
    [activeId],
  );

  return (
    <section className="bg-white border-b border-sand-200">
      <div className="container-ev py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
            className="eyebrow mb-4"
          >
            Nos agences
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="site-heading"
          >
            Une présence de proximité à l&apos;échelle nationale
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="site-copy mt-4"
          >
            Survolez la carte ou sélectionnez une agence pour afficher
            rapidement ses coordonnées.
          </motion.p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="rounded-[28px] border border-sand-200 bg-sand-50 p-4 sm:p-5"
          >
            <div className="relative mx-auto max-w-[420px] overflow-visible rounded-[22px] border border-sand-200 bg-white">
              <Image
                src="/images/maptunisie .png"
                alt="Carte de Tunisie avec implantation des agences Espace Vert"
                width={1092}
                height={2058}
                className="h-auto w-full"
                priority
              />

              <AnimatePresence>
                {activeAgence ? (
                  <AgencePreview key={activeAgence.id} agence={activeAgence} />
                ) : null}
              </AnimatePresence>

              {AGENCES.map((agence) => {
                const active = agence.id === activeId;
                return (
                  <button
                    key={agence.id}
                    type="button"
                    onClick={() => setActiveId(agence.id)}
                    onMouseEnter={() => setActiveId(agence.id)}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${agence.pinX}%`, top: `${agence.pinY}%` }}
                    aria-label={`Afficher ${agence.ville}`}
                  >
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-md transition-all duration-200 sm:h-7 sm:w-7"
                      style={{ background: active ? "#15803d" : "#ffffff" }}
                    >
                      <span
                        className="block rounded-full transition-all duration-200"
                        style={{
                          width: active ? 10 : 8,
                          height: active ? 10 : 8,
                          background: active ? "#ffffff" : "#15803d",
                        }}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="space-y-4"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {AGENCES.map((agence) => {
                const active = agence.id === activeId;
                return (
                  <button
                    key={agence.id}
                    type="button"
                    onClick={() => setActiveId(agence.id)}
                    onMouseEnter={() => setActiveId(agence.id)}
                    className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                      active
                        ? "border-ev-300 bg-ev-50 shadow-sm"
                        : "border-sand-200 bg-white hover:border-ev-200 hover:bg-sand-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-ev-600" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ev-950">
                          {agence.ville}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {agence.region}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-[28px] border border-sand-200 bg-sand-50 p-6 sm:p-7">
              <div className="relative mb-5 h-40 overflow-hidden rounded-2xl border border-sand-200">
                <Image
                  src={activeAgence.image}
                  alt={activeAgence.ville}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 420px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ev-200">
                    {activeAgence.region}
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    {activeAgence.ville}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-2xl font-bold text-ev-950">
                  {activeAgence.ville}
                </h3>
                {activeAgence.principal && (
                  <span className="rounded-full bg-ev-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ev-800">
                    Siège
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm font-medium text-ev-700">
                {activeAgence.region}
              </p>
              <p className="site-copy-sm mt-5">{activeAgence.adresse}</p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <Phone size={16} className="mt-0.5 shrink-0 text-ev-600" />
                  <div>
                    <p>{activeAgence.tel}</p>
                    {activeAgence.tel2 && (
                      <p className="mt-1">{activeAgence.tel2}</p>
                    )}
                  </div>
                </div>

                {activeAgence.email && (
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <Mail size={16} className="mt-0.5 shrink-0 text-ev-600" />
                    <p className="break-all">{activeAgence.email}</p>
                  </div>
                )}

                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-ev-600" />
                  <p>Conseil, suivi et orientation commerciale.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
