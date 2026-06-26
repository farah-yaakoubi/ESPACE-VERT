"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Droplet,
  Droplets,
  Map,
  Settings2,
  CalendarPlus,
  PhoneCall,
  MapPin,
  Pencil,
  Ruler,
  Wrench,
  Play,
  TrendingUp,
  Gauge,
  Leaf,
  Sun,
  ArrowLeft,
  ClipboardCheck,
  ShieldCheck,
  Handshake,
} from "lucide-react";

const FEATS = [
  {
    icon: Droplets,
    title: "Goutte-a-goutte & aspersion",
    desc: "Systemes adaptes a chaque type de culture et de terrain",
  },
  {
    icon: Map,
    title: "Etude & plan technique sur mesure",
    desc: "Releve terrain, sectorisation, dimensionnement et calcul de debit",
  },
  {
    icon: Settings2,
    title: "Automatisation & mise en service",
    desc: "Vannes, filtres, programmateurs et suivi apres installation",
  },
];

const PROCESS = [
  { icon: MapPin, label: "Visite terrain", active: true },
  { icon: Pencil, label: "Plan technique", active: true },
  { icon: Ruler, label: "Dimensionnement", active: true },
  { icon: Wrench, label: "Installation", active: false },
  { icon: Play, label: "Mise en service", active: false },
  { icon: TrendingUp, label: "Suivi", active: false },
];

const BUBBLES = [
  { icon: Droplet, title: "Goutte-a-goutte", sub: "Precision maximale", cls: "top-4 left-3" },
  { icon: Sun, title: "Plein soleil", sub: "Resistant UV", cls: "top-4 right-3" },
  { icon: Gauge, title: "Pression regulee", sub: "0,5 - 3,5 bar", cls: "bottom-20 left-3" },
  { icon: Leaf, title: "Economie d'eau", sub: "Jusqu'a 50 %", cls: "bottom-20 right-3" },
];

const SERVICES = [
  {
    icon: MapPin,
    title: "Etude",
    desc: "Releve du terrain, analyse de la source d'eau, pression, debit et contraintes d'exploitation.",
  },
  {
    icon: Pencil,
    title: "Conception",
    desc: "Plans, sectorisation, dimensionnement et choix des equipements adaptes a chaque culture.",
  },
  {
    icon: Wrench,
    title: "Realisation",
    desc: "Preparation du chantier, pose du reseau, raccordements et controle de conformite.",
  },
  {
    icon: Settings2,
    title: "Installation",
    desc: "Mise en place des arroseurs, goutte-a-goutte, filtres, vannes et automatismes.",
  },
  {
    icon: ClipboardCheck,
    title: "Suivi",
    desc: "Tests, reglage, optimisation des zones et controle du rendement apres mise en service.",
  },
  {
    icon: ShieldCheck,
    title: "Conseil",
    desc: "Recommandations techniques pour economiser l'eau et ameliorer la regularite d'irrigation.",
  },
  {
    icon: Handshake,
    title: "Accompagnement",
    desc: "Assistance terrain et support apres installation pour garder le systeme performant.",
  },
];

function TerrainIllustration() {
  const trees = ["12%", "38%", "62%", "84%"];
  const pipesH = ["45.5%", "40.5%", "35.5%", "30.5%"];
  const drips = ["20%", "35%", "50%", "65%", "80%"];

  return (
    <div className="relative min-h-[460px] w-full overflow-hidden">
      <div
        className="absolute left-0 right-0 top-0"
        style={{ height: "46%", background: "linear-gradient(180deg,#e8f5fb 0%,#f2faf0 100%)" }}
      />

      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute right-10 top-8 h-11 w-11 rounded-full bg-[#f5c842]/80"
      />

      {[
        { cls: "top-7 left-[20%] w-[70px] h-[20px]", dur: 10 },
        { cls: "top-12 left-[52%] w-[50px] h-[15px]", dur: 18 },
      ].map(({ cls, dur }, index) => (
        <motion.div
          key={index}
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute rounded-full bg-white/75 ${cls}`}
        />
      ))}

      <div className="absolute bottom-0 left-0 right-0 h-[55%] bg-[#e8f5d0]" />
      <div className="absolute bottom-0 left-0 right-0 h-[28%] bg-[#c5e8a0]" />

      {[48, 43, 38, 33, 28, 23, 18, 13].map((bottom) => (
        <div
          key={bottom}
          className="absolute left-[8%] right-[8%] h-[3px] rounded-full bg-[#3d8a22]/15"
          style={{ bottom: `${bottom}%` }}
        />
      ))}

      {pipesH.map((bottom) => (
        <motion.div
          key={bottom}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="absolute left-[8%] right-[8%] h-[4px] origin-left rounded-sm bg-[#2e6e1a]"
          style={{ bottom }}
        />
      ))}

      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
        className="absolute w-[6px] origin-bottom rounded-sm bg-[#1a5210]"
        style={{ left: "50%", bottom: "28%", height: "20%" }}
      />

      {["25%", "74%"].map((left) => (
        <motion.div
          key={left}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="absolute w-[5px] origin-bottom rounded-sm bg-[#1a5210]"
          style={{ left, bottom: "28%", height: "18%" }}
        />
      ))}

      {drips.map((left, index) => (
        <motion.div
          key={left}
          animate={{ y: [0, 14], opacity: [0.9, 0] }}
          transition={{ duration: 1.5, delay: index * 0.28, repeat: Infinity, ease: "easeIn" }}
          className="absolute h-[9px] w-[6px] rounded-b-full bg-[#378add]/80"
          style={{ left, bottom: "43%" }}
        />
      ))}

      {["16%", "48%", "80%"].map((left, index) => (
        <div key={left} className="absolute" style={{ left, bottom: "47%" }}>
          <div className="mx-auto h-[16px] w-[10px] rounded-t-sm bg-[#1a5210]" />
          {[36, 54].map((size, arcIndex) => (
            <motion.div
              key={arcIndex}
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 2, delay: index * 0.3 + arcIndex * 0.3, repeat: Infinity }}
              className="absolute rounded-full border-2 border-[#378add]/50"
              style={{
                width: size,
                height: size * 0.6,
                top: -(size * 0.6) * 0.8,
                left: -(size / 2) + 5,
                borderBottomColor: "transparent",
              }}
            />
          ))}
        </div>
      ))}

      {trees.map((left) => (
        <div key={left} className="absolute" style={{ left, bottom: "55%" }}>
          <div className="relative mx-auto h-[34px] w-[34px] rounded-full bg-[#3d8a22]">
            <div className="absolute left-[6px] top-[6px] h-[22px] w-[22px] rounded-full bg-[#5ea832]" />
          </div>
          <div className="mx-auto h-[22px] w-[8px] rounded-sm bg-[#6b4423]" />
        </div>
      ))}

      {BUBBLES.map(({ icon: Icon, title, sub, cls }, index) => (
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + index * 0.15, duration: 0.4 }}
          className={`absolute rounded-xl border border-[#c0ebb1] bg-white px-3 py-2 ${cls}`}
        >
          <div className="mb-0.5 flex items-center gap-2">
            <Icon size={13} className="text-[#3d8a22]" />
            <p className="text-[12px] font-bold text-[#062504]">{title}</p>
          </div>
          <p className="text-[11px] text-[#8da898]">{sub}</p>
        </motion.div>
      ))}
    </div>
  );
}

export function IrrigationEtudeInstallationPageContent() {
  return (
    <main className="bg-[linear-gradient(180deg,#f6faf6_0%,#edf6ed_100%)]">
      <div className="container-ev pt-28 pb-10 sm:pt-32 sm:pb-12 lg:pt-36 lg:pb-14">
        <Link
          href="/activites/irrigation"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#245e38] transition-colors hover:text-[#14341d]"
        >
          <ArrowLeft size={15} />
          Retour a l'activite irrigation
        </Link>

        <section className="mb-6 overflow-hidden rounded-[1.25rem] border border-[#c0ebb1] bg-white">
          <div className="grid min-h-[460px] lg:grid-cols-2">
            <div className="relative flex flex-col justify-center overflow-hidden border-b border-[#e0f5d8] px-8 py-12 sm:px-11 lg:border-b-0 lg:border-r">
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full"
                preserveAspectRatio="xMidYMid slice"
              >
                <circle cx="420" cy="60" r="180" fill="#f2faf0" opacity=".6" />
                <circle cx="60" cy="420" r="140" fill="#e0f5d8" opacity=".4" />
                <path d="M0 380 Q120 340 240 370 Q360 400 480 360 L480 500 L0 500Z" fill="#f2faf0" opacity=".5" />
              </svg>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#95d97e] bg-[#e0f5d8] px-4 py-1.5"
              >
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-[7px] w-[7px] shrink-0 rounded-full bg-[#2e6e1a]"
                />
                <Droplet size={13} className="text-[#2e6e1a]" />
                <span className="text-[10px] font-black uppercase tracking-[.18em] text-[#2e6e1a]">
                  Solution d'irrigation intelligente
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="relative mb-3 text-[clamp(24px,3vw,38px)] font-black leading-[1.07] tracking-tight text-[#062504]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Chaque goutte
                <br />
                compte. Chaque culture
                <br />
                <span className="text-[#3d8a22]">merite le meilleur.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.45 }}
                className="relative mb-7 max-w-[380px] text-[13.5px] leading-[1.8] text-[#4a5e52]"
              >
                Espace Vert realise l'etude, la conception et l'installation de votre systeme
                d'irrigation - goutte-a-goutte ou aspersion - pour economiser l'eau et ameliorer
                votre rendement.
              </motion.p>

              <div className="relative mb-8 flex flex-col gap-2.5">
                {FEATS.map(({ icon: Icon, title, desc }, index) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.22 + index * 0.08, duration: 0.4 }}
                    className="flex items-start gap-3 rounded-xl border border-[#c0ebb1] bg-[#f2faf0]/90 px-3.5 py-3"
                  >
                    <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-[#e0f5d8]">
                      <Icon size={17} className="text-[#2e6e1a]" />
                    </div>
                    <div>
                      <p className="text-[12.5px] font-black text-[#062504]">{title}</p>
                      <span className="text-[11.5px] text-[#4a5e52]">{desc}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.4 }}
                className="relative flex flex-wrap gap-3"
              >
                <Link href="/rendez-vous" className="btn-primary">
                  <CalendarPlus size={15} />
                  Prendre rendez-vous
                </Link>
                <Link href="/contact" className="btn-outline">
                  <PhoneCall size={15} />
                  Nous contacter
                </Link>
              </motion.div>
            </div>

            <TerrainIllustration />
          </div>

          <div className="relative border-t border-[#e0f5d8] bg-[#fafdf8] px-8 py-5 sm:px-11">
            <div className="absolute left-[calc(2.75rem+22px)] right-[calc(2.75rem+22px)] top-[40px] hidden h-[1.5px] bg-[#e0f5d8] sm:block" />
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
              className="absolute left-[calc(2.75rem+22px)] right-[calc(2.75rem+22px)] top-[40px] hidden h-[1.5px] origin-left rounded-full bg-[#7dc040] sm:block"
            />
            <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-6 sm:gap-0">
              {PROCESS.map(({ icon: Icon, label, active }, index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.35 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] ${
                      active ? "border-[#3d8a22] bg-[#e0f5d8]" : "border-[#c0ebb1] bg-white"
                    }`}
                  >
                    <Icon size={17} className="text-[#3d8a22]" />
                  </div>
                  <p className="max-w-[72px] text-center text-[10px] font-black leading-tight text-[#4a5e52]">
                    {label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#e0f5d8] bg-[#f2faf0] px-8 py-3 sm:px-11">
            <span className="text-[11px] font-black uppercase tracking-[.16em] text-[#8da898]">
              Espace Vert - STAJAP
            </span>
            <span className="text-[11px] text-[#8da898]">innovation - qualite - rentabilite</span>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-7">
          <div className="rounded-[2rem] border border-[#dbe8db] bg-[#0b3f24] p-6 text-white shadow-[0_18px_52px_rgba(10,39,16,0.16)] lg:col-span-2">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#9adf74]">Services</p>
            <h2 className="mt-3 text-3xl font-black" style={{ fontFamily: "var(--font-display)" }}>
              Une equipe pour chaque phase.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/75">
              Etude, conception, installation et accompagnement sont presentes comme un seul flux de travail.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5">
            {SERVICES.map(({ icon: Icon, title, desc }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: index * 0.045, duration: 0.42 }}
                whileHover={{ y: -6 }}
                className="group rounded-[1.5rem] border border-[#dfeadf] bg-white p-5 shadow-[0_10px_28px_rgba(10,39,16,0.04)] transition-shadow hover:shadow-[0_18px_38px_rgba(10,39,16,0.08)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#dcebdc] bg-[#f6fbf5] text-[#1f8c43] transition-colors group-hover:border-[#7dc040] group-hover:bg-[#eef8e8]">
                  <Icon size={24} />
                </div>
                <h3 className="mt-4 text-xl font-black text-[#17341d]">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#607064]">{desc}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-[#dbe8db] bg-white shadow-[0_18px_52px_rgba(10,39,16,0.06)]">
          <div className="grid lg:grid-cols-[0.95fr_1fr]">
            <div className="border-b border-[#dbe8db] p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#6ba92e]">Contact projet</p>
              <h2 className="mt-3 text-3xl font-black text-[#17341d]" style={{ fontFamily: "var(--font-display)" }}>
                Lancer une etude d'irrigation
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#607064]">
                Pour preparer l'etude, l'equipe peut partir de la surface, du type de culture,
                de la source d'eau, de la pression disponible et de l'objectif d'automatisation.
              </p>
            </div>
            <div className="grid gap-3 p-6 sm:grid-cols-2 sm:p-8">
              <Link
                href="/rendez-vous"
                className="group rounded-2xl border border-[#dfeadf] bg-[#f8fbf7] p-5 transition-colors hover:border-[#7dc040] hover:bg-[#f2faee]"
              >
                <CalendarPlus size={25} className="text-[#1f8c43]" />
                <p className="mt-3 font-black text-[#17341d]">Prendre rendez-vous</p>
                <p className="mt-2 text-sm leading-6 text-[#607064]">Planifier une visite ou un appel technique.</p>
              </Link>
              <Link
                href="/activites/irrigation"
                className="group rounded-2xl border border-[#dfeadf] bg-[#f8fbf7] p-5 transition-colors hover:border-[#7dc040] hover:bg-[#f2faee]"
              >
                <ArrowLeft size={25} className="text-[#1f8c43]" />
                <p className="mt-3 font-black text-[#17341d]">Voir l'irrigation</p>
                <p className="mt-2 text-sm leading-6 text-[#607064]">Retourner a l'activite et aux solutions liees.</p>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
