"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    year: "1995",
    label: "Fondation",
    title: "Création d'Espace Vert",
    text: "Le groupe démarre autour des semences agricoles et d'un accompagnement déjà tourné vers le terrain.",
    accent: "#10693B",
  },
  {
    year: "2000+",
    label: "Diversification",
    title: "Élargissement des gammes",
    text: "L'irrigation, les fertilisants et le matériel agricole viennent compléter l'offre.",
    accent: "#1565C0",
  },
  {
    year: "2005+",
    label: "Structuration",
    title: "Développement du groupe",
    text: "Des sociétés spécialisées renforcent la lisibilité de l'offre et la réponse aux besoins du marché.",
    accent: "#0277BD",
  },
  {
    year: "2010+",
    label: "Industrialisation",
    title: "Renforcement de l'irrigation",
    text: "La fabrication locale de solutions d'irrigation consolide la chaîne de valeur du groupe.",
    accent: "#006064",
  },
  {
    year: "Aujourd'hui",
    label: "Présence nationale",
    title: "Un groupe structuré",
    text: "Agences, équipes et marques travaillent ensemble pour accompagner durablement les professionnels tunisiens.",
    accent: "#10693B",
  },
];

export function TimelineEV() {
  return (
    <section className="border-b border-sand-200 bg-[linear-gradient(180deg,#FBFDFB_0%,#FFFFFF_100%)]">
      <div className="container-ev py-12 sm:py-16 lg:py-18">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex rounded-full border border-ev-200 bg-white px-4 py-2 shadow-sm">
            <p className="eyebrow !mb-0">Chronologie</p>
          </div>
          <div className="mx-auto mt-4 max-w-2xl border-t-4 border-ev-200 pt-5">
            <h2 className="site-heading">Un parcours clair, construit dans le temps</h2>
            <p className="site-copy mt-4">
              Les étapes essentielles du développement du groupe, dans un format plus direct et plus lisible.
            </p>
          </div>
        </div>

        <div className="relative mx-auto mt-12 max-w-4xl">
          <motion.div
            initial={{ scaleY: 0, opacity: 0.35 }}
            whileInView={{ scaleY: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-0 left-[20px] top-0 w-px origin-top bg-[linear-gradient(180deg,#D8E9DD_0%,#10693B_100%)] sm:left-[108px]"
          />

          <div className="space-y-6 sm:space-y-7">
            {STEPS.map((step, index) => (
              <motion.article
                key={step.year}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="relative grid gap-4 sm:grid-cols-[88px_1fr] sm:gap-8"
              >
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}
                  className="relative z-10 flex items-start sm:justify-end"
                >
                  <motion.span
                    whileHover={{ y: -1 }}
                    className="inline-flex rounded-full border bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] shadow-sm"
                    style={{ color: step.accent, borderColor: `${step.accent}33` }}
                  >
                    {step.year}
                  </motion.span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.45, delay: 0.08 + index * 0.07 }}
                  className="relative z-10"
                >
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.35, delay: 0.12 + index * 0.07 }}
                    className="absolute left-[-26px] top-3 h-3.5 w-3.5 rounded-full border-4 border-white shadow-sm sm:left-[-34px]"
                    style={{ backgroundColor: step.accent }}
                  />

                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.18 }}
                    className="rounded-[24px] border border-sand-200 bg-white p-5 shadow-[0_10px_30px_rgba(17,24,39,0.04)] sm:p-6"
                  >
                    <div className="mb-4 h-1.5 w-14 rounded-full" style={{ backgroundColor: `${step.accent}22` }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.7, delay: 0.14 + index * 0.06 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: step.accent }}
                      />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: step.accent }}>
                      {step.label}
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-ev-950 sm:text-[1.35rem]">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-gray-600 sm:text-[15px]">{step.text}</p>
                  </motion.div>
                </motion.div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
