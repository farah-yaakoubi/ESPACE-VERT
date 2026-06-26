"use client";

import { motion } from "framer-motion";

type TimelineStep = {
  year: string;
  label: string;
  title: string;
  text: string;
  accent: string;
  facts?: string[];
};

type TimelineEVProps = {
  compact?: boolean;
};

const STEPS: TimelineStep[] = [
  {
    year: "1995",
    label: "Fondation",
    title: "Naissance d'Espace Vert",
    text: "Le groupe est fonde par M. Abderraouf Ghariani avec une activite initialement specialisee dans le commerce de gros de semences.",
    accent: "#10693B",
    facts: [
      "Creation du groupe",
      "Ancrage terrain",
      "Depart autour des semences",
    ],
  },
  {
    year: "Demarrage",
    label: "Reputation",
    title: "Construction d'un leadership de confiance",
    text: "Espace Vert batit sa reputation sur la fiabilite de ses services, la qualite de son accompagnement et un reseau solide de partenaires internationaux renommes.",
    accent: "#1B7A46",
    facts: ["Fiabilite", "Qualite de service", "Partenaires internationaux"],
  },
  {
    year: "Croissance",
    label: "Diversification",
    title: "Elargissement progressif de l'offre",
    text: "L'activite s'etend ensuite vers l'irrigation, la fertilisation, le materiel agricole, la pulverisation ainsi que les produits de jardinage.",
    accent: "#1565C0",
    facts: ["Irrigation", "Fertilisation", "Pulverisation", "Jardinage"],
  },
  {
    year: "Structuration",
    label: "Filiales",
    title: "Deploiement d'entites specialisees",
    text: "Le groupe se structure autour de societes dediees comme STAJAP, Baddar Agricole, Mondiale Irrigation et Fertivert pour repondre a des besoins de marche plus precis.",
    accent: "#006064",
    facts: ["STAJAP", "Baddar Agricole", "Mondiale Irrigation", "Fertivert"],
  },
  {
    year: "Developpement",
    label: "Marques",
    title: "Montee en puissance des marques propres",
    text: "La presentation met en avant des marques propres et des departements dedies au developpement des semences, a l'irrigation goutte a goutte et au service apres-vente.",
    accent: "#558B2F",
    facts: [
      "6 marques propres",
      "3 departements dedies",
      "Solutions integrees",
    ],
  },
  {
    year: "Aujourd'hui",
    label: "Chiffres",
    title: "Un groupe desormais lisible en chiffres",
    text: "La trajectoire du groupe se traduit par une presence nationale, une equipe structuree et un portefeuille de marques qui ancrent durablement Espace Vert sur son marche.",
    accent: "#D97706",
    facts: ["30 marques internationales", "100 salaries", "4 points de vente"],
  },
];

export function TimelineEV({ compact = false }: TimelineEVProps) {
  const body = (
    <div
      className={`relative mx-auto ${compact ? "mt-0 max-w-none" : "mt-12 max-w-4xl"}`}
    >
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
            key={`${step.year}-${step.title}`}
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
                <div
                  className="mb-4 h-1.5 w-14 rounded-full"
                  style={{ backgroundColor: `${step.accent}22` }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.7, delay: 0.14 + index * 0.06 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: step.accent }}
                  />
                </div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: step.accent }}
                >
                  {step.label}
                </p>
                <motion.h3
                  initial={{ opacity: 0, y: 12, x: -8 }}
                  whileInView={{ opacity: 1, y: 0, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 0.5,
                    delay: 0.15 + index * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mt-2 text-xl font-bold text-ev-950 sm:text-[1.35rem]"
                >
                  {step.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: 0.18 + index * 0.08 }}
                  className="mt-3 text-sm leading-7 text-gray-600 sm:text-[15px]"
                >
                  {step.text}
                </motion.p>

                {step.facts && step.facts.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {step.facts.map((fact) => (
                      <span
                        key={fact}
                        className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]"
                        style={{
                          color: step.accent,
                          borderColor: `${step.accent}33`,
                          backgroundColor: `${step.accent}0D`,
                        }}
                      >
                        {fact}
                      </span>
                    ))}
                  </div>
                ) : null}
              </motion.div>
            </motion.div>
          </motion.article>
        ))}
      </div>
    </div>
  );

  if (compact) return body;

  return (
    <section className="border-b border-sand-200 bg-[linear-gradient(180deg,#FBFDFB_0%,#FFFFFF_100%)]">
      <div className="container-ev py-12 sm:py-16 lg:py-18">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex rounded-full border border-ev-200 bg-white px-4 py-2 shadow-sm">
            <p className="eyebrow !mb-0">Chronologie</p>
          </div>
          <div className="mx-auto mt-4 max-w-2xl border-t-4 border-ev-200 pt-5">
            <motion.h2
              initial={{ opacity: 0, y: 20, x: -10 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="site-heading"
            >
              Une evolution construite etape par etape
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="site-copy mt-4"
            >
              Une lecture plus fidele de la progression du groupe, depuis la
              fondation jusqu'aux chiffres-cles mis en avant dans la
              presentation institutionnelle.
            </motion.p>
          </div>
        </div>

        {body}
      </div>
    </section>
  );
}
