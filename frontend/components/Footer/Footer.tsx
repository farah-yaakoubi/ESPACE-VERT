"use client";

import { useState, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  EnvelopeIcon, PhoneIcon, MapPinIcon, ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

const agences = [
  { nom: "Tunis",     adresse: "69, rue Abderrazak Chraibi, 1001 Tunis",        tel: "(+216) 71 333 858", tel2: "(+216) 71 348 404", email: "secretariat.groupeev@planet.tn", maps: "https://www.google.com/maps/search/?api=1&query=36.8065,10.1815", lat: 36.8065, lng: 10.1815 },
  { nom: "Soliman",   adresse: "MGR2+XGH, R43, Sulayman",                       tel: "(+216) 72 333 143", maps: "https://www.google.com/maps/search/?api=1&query=36.7011,10.4886", lat: 36.7011, lng: 10.4886 },
  { nom: "Borj Amri", adresse: "PXQ2+R9, Sidi Ali El Hattab",                   tel: "(+216) 71 234 567", maps: "https://www.google.com/maps/search/?api=1&query=36.9117,9.9728",  lat: 36.9117, lng: 9.9728  },
  { nom: "Sfax",      adresse: "MPV7+GG3, rue béjaia, Rte de Gabes, Sfax 3049", tel: "(+216) 74 000 000", maps: "https://www.google.com/maps/search/?api=1&query=34.7252,10.7605", lat: 34.7252, lng: 10.7605 },
] as const;

const socials = [
  { name: "Facebook",  url: "https://www.facebook.com/profile.php?id=61566401919487", bg: "#1877F2",
    icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  { name: "Instagram", url: "https://www.instagram.com/espacevert.officiel/", bg: "#E1306C", gradient: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
    icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
  { name: "TikTok",    url: "https://www.tiktok.com/@espace.vert.tunisie", bg: "#010101",
    icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg> },
  { name: "LinkedIn",  url: "https://linkedin.com/company/espacevert", bg: "#0A66C2",
    icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
  { name: "YouTube",   url: "https://youtube.com/@espacevert", bg: "#FF0000",
    icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
];

function AgencesMap() {
  const [active, setActive] = useState(0);
  const ag = agences[active];
  return (
    <div className="rounded-3xl overflow-hidden border border-white/15 shadow-2xl">
      <div className="flex bg-black/25 backdrop-blur-sm overflow-x-auto">
        {agences.map((a, i) => (
          <button key={i} onClick={() => setActive(i)}
            className="flex-1 px-3 py-3 text-xs font-black transition-all whitespace-nowrap relative overflow-hidden"
            style={{ color: active === i ? "#fff" : "rgba(255,255,255,0.4)" }}>
            {active === i && (
              <motion.span layoutId="mapTab" className="absolute inset-0"
                style={{ background: "linear-gradient(135deg,#27942f,#3cb648)" }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }} />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              <MapPinIcon className="w-3 h-3" />{a.nom}
            </span>
          </button>
        ))}
      </div>
      <div className="relative h-[260px] bg-gray-900">
        <AnimatePresence mode="wait">
          <motion.iframe key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            src={`https://maps.google.com/maps?q=${ag.lat},${ag.lng}&z=15&output=embed`}
            width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
            referrerPolicy="no-referrer-when-downgrade" title={`Carte ${ag.nom}`}
            className="w-full h-full absolute inset-0" />
        </AnimatePresence>
        <div className="absolute top-3 left-3 bg-white/97 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-xl border border-gray-100 max-w-[190px]">
          <p className="text-[11px] font-black text-[#1a3d0a] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3cb648] animate-pulse inline-block" />
            Agence {ag.nom}
          </p>
          <p className="text-[10px] text-gray-500 leading-snug mt-0.5">{ag.adresse}</p>
        </div>
        <a href={ag.maps} target="_blank" rel="noopener noreferrer"
          className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[#1a3d0a] hover:bg-[#3cb648] text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-lg transition-colors">
          <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" /> Ouvrir Maps
        </a>
      </div>
      <div className="bg-black/20 px-4 py-3 flex flex-wrap gap-4">
        <a href={`tel:${ag.tel}`} className="flex items-center gap-2 text-white/80 hover:text-white text-xs font-semibold transition-colors">
          <PhoneIcon className="w-3.5 h-3.5 text-[#3cb648]" />{ag.tel}
        </a>
        {"email" in ag && ag.email && (
          <a href={`mailto:${ag.email}`} className="flex items-center gap-2 text-white/80 hover:text-white text-xs font-semibold transition-colors">
            <EnvelopeIcon className="w-3.5 h-3.5 text-[#3cb648]" />{ag.email}
          </a>
        )}
      </div>
    </div>
  );
}

export default function Footer() {
  const locale     = useLocale();
  const tf         = useTranslations("footer");
  const sectionRef = useRef<HTMLElement>(null);
  const isInView   = useInView(sectionRef, { once: true, margin: "-60px" });

  const fadeUp = (delay = 0) => ({
    initial:    { opacity: 0, y: 28 },
    animate:    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  const navLinks = {
    services: [
      { href: "/activites/semences-et-plants",      label: "Semences & Plants" },
      { href: "/activites/irrigation",              label: "Irrigation" },
      { href: "/activites/fertilisation",           label: "Fertilisation" },
      { href: "/activites/machinisme-et-jardinage", label: "Machinisme" },
      { href: "/activites/pulverisation",           label: "Pulvérisation" },
    ],
    marques: [
      { href: "/marques/fertivert", label: "Fertivert", accent: true  },
      { href: "/marques/pulvert",   label: "Pulvert",   accent: false },
      { href: "/marques/matar",     label: "Matar",     accent: false },
    ],
    company: [
      { href: "/qui-sommes-nous", label: "Qui sommes-nous" },
    ],
  };

  const partenaires = [
    { name: "Baddar Agricole",    src: "/logosPartenaires/logo baddar agricole.png" },
    { name: "Mondial Irrigation", src: "/logosPartenaires/logo mendial irrigation.png" },
    { name: "Stajap",             src: "/logosPartenaires/logo stajap.png" },
  ];

  return (
    <footer ref={sectionRef} id="site-footer"
      className="relative text-white overflow-hidden mt-20"
      style={{ background: "#0d2410" }}>

      {/* DÉCO orbes */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full opacity-[0.10] blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle,#3cb648,transparent)" }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-[0.06] blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle,#3cb648,transparent)" }} />

      {/* Vague entrée */}
      <div className="absolute top-0 inset-x-0 h-16 -translate-y-full pointer-events-none overflow-hidden">
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,32 C360,64 720,0 1080,32 C1260,48 1380,24 1440,16 L1440,64 L0,64 Z" fill="#0d2410" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 pt-12 pb-8">

        {/* ══ AGENCES ══════════════════════════════════════════════════ */}
        <motion.div {...fadeUp(0)} className="mb-12">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/15" />
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04]">
              <MapPinIcon className="w-3.5 h-3.5 text-[#3cb648]" />
              <span className="text-xs font-black tracking-[0.18em] uppercase text-white/50">Nos Agences</span>
            </div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/15" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="grid grid-cols-2 gap-3">
              {agences.map((ag, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative bg-white/[0.055] hover:bg-white/[0.09] border border-white/[0.09] hover:border-[#3cb648]/35 rounded-2xl p-4 transition-all duration-300">
                  <div className="absolute top-0 inset-x-4 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#3cb648]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(60,182,72,0.15)" }}>
                      <MapPinIcon className="w-3.5 h-3.5 text-[#3cb648]" />
                    </div>
                    <h4 className="font-black text-[13px]">{ag.nom}</h4>
                  </div>
                  <p className="text-white/40 text-[11px] leading-relaxed mb-3">{ag.adresse}</p>
                  <a href={`tel:${ag.tel}`} className="flex items-center gap-1.5 text-[11px] text-white/60 hover:text-[#3cb648] transition-colors font-medium mb-1">
                    <PhoneIcon className="w-3 h-3 flex-shrink-0" />{ag.tel}
                  </a>
                  {"tel2" in ag && ag.tel2 && (
                    <a href={`tel:${ag.tel2}`} className="flex items-center gap-1.5 text-[11px] text-white/60 hover:text-[#3cb648] transition-colors font-medium">
                      <PhoneIcon className="w-3 h-3 flex-shrink-0" />{ag.tel2}
                    </a>
                  )}
                  <a href={ag.maps} target="_blank" rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-[10px] font-black text-[#3cb648] hover:text-white transition-colors">
                    Itinéraire <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                  </a>
                </motion.div>
              ))}
            </div>
            <motion.div {...fadeUp(0.18)} className="hidden lg:block">
              <AgencesMap />
            </motion.div>
          </div>
        </motion.div>

        {/* SÉPARATEUR */}
        <div className="flex items-center gap-4 my-10">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#3cb648] opacity-60" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* ══ COLONNES ════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-10 gap-8 mb-12">

          {/* À propos — 4 cols */}
          <motion.div {...fadeUp(0.1)} className="lg:col-span-4">
            <div className="mb-6">
              <img
                src="/logos/LOGO ESPACE VERT.png"
                alt="Espace Vert"
                style={{
                  height: 64, width: "auto", maxWidth: 200,
                  objectFit: "contain", objectPosition: "left center",
                  filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.40))",
                }}
              />
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-xs">
              Groupe agricole tunisien depuis 1985. Fertilisation, irrigation, pulvérisation et semences.
            </p>
            <p className="text-[10px] font-black text-white/25 uppercase tracking-[0.16em] mb-4">{tf("followUs")}</p>
            <div className="flex gap-2.5 flex-wrap">
              {socials.map((s, i) => (
                <motion.a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                  title={s.name} aria-label={s.name}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
                  transition={{ delay: 0.32 + i * 0.055, type: "spring", stiffness: 300, damping: 20 }}
                  whileHover={{ y: -4, scale: 1.12 }} whileTap={{ scale: 0.88 }}
                  className="relative w-11 h-11 rounded-2xl flex items-center justify-center text-white overflow-hidden shadow-lg hover:shadow-2xl group transition-shadow"
                  style={{ background: ("gradient" in s ? s.gradient : s.bg) as string }}>
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
                    style={{ background: "linear-gradient(135deg,#fff,transparent)" }} />
                  <span className="relative z-10">{s.icon}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Services — 3 cols */}
          <motion.div {...fadeUp(0.14)} className="lg:col-span-3">
            <h4 className="text-[10px] font-black text-white/25 uppercase tracking-[0.18em] mb-5">Services</h4>
            <ul className="space-y-3">
              {navLinks.services.map((l, i) => (
                <li key={i}>
                  <Link href={`/${locale}${l.href}`}
                    className="group flex items-center gap-2 text-sm text-white/45 hover:text-white transition-colors duration-200">
                    <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-200 text-[#3cb648] text-sm font-black">›</span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Marques + Entreprise — 3 cols */}
          <motion.div {...fadeUp(0.17)} className="lg:col-span-3">
            <h4 className="text-[10px] font-black text-white/25 uppercase tracking-[0.18em] mb-5">{tf("ourBrands")}</h4>
            <ul className="space-y-3 mb-7">
              {navLinks.marques.map((l, i) => (
                <li key={i}>
                  <Link href={`/${locale}${l.href}`}
                    className={`group flex items-center gap-2 text-sm font-bold transition-colors duration-200 ${l.accent ? "text-[#3cb648] hover:text-white" : "text-white/45 hover:text-white"}`}>
                    <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-200 text-[#3cb648] text-sm font-black">›</span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="text-[10px] font-black text-white/25 uppercase tracking-[0.18em] mb-4">Entreprise</h4>
            <ul className="space-y-3">
              {navLinks.company.map((l, i) => (
                <li key={i}>
                  <Link href={`/${locale}${l.href}`}
                    className="group flex items-center gap-2 text-sm text-white/45 hover:text-white transition-colors duration-200">
                    <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-200 text-[#3cb648] text-sm font-black">›</span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* ══ PARTENAIRES — FOND BLANC ══════════════════════════════════ */}
        <motion.div {...fadeUp(0.22)} className="mb-12">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/12" />
            <span className="text-[10px] font-black tracking-[0.18em] uppercase text-white/30">Nos Partenaires</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/12" />
          </div>

          <div className="flex justify-center gap-5 flex-wrap">
            {partenaires.map((p, i) => (
              <motion.div
                key={p.src}
                initial={{ opacity: 0, y: 14 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                transition={{ delay: 0.28 + i * 0.09, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6, scale: 1.04 }}
                className="group relative flex items-center justify-center cursor-pointer"
                style={{
                  width: 168, height: 88,
                  borderRadius: 16,
                  /* ✅ FOND BLANC pour les logos partenaires */
                  background: "#ffffff",
                  border: "1.5px solid rgba(255,255,255,0.15)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.30)",
                  transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s",
                  padding: "12px 16px",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.45), 0 0 0 2px rgba(60,182,72,0.5)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(60,182,72,0.6)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.30)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                }}
              >
                <img
                  src={p.src}
                  alt={p.name}
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "contain",
                    transition: "opacity 0.3s",
                    opacity: 0.92,
                  }}
                  onMouseEnter={e => { (e.target as HTMLImageElement).style.opacity = "1"; }}
                  onMouseLeave={e => { (e.target as HTMLImageElement).style.opacity = "0.92"; }}
                  onError={e => {
                    const img = e.target as HTMLImageElement;
                    const parent = img.parentElement;
                    if (parent) {
                      img.style.display = "none";
                      const span = document.createElement("span");
                      span.style.cssText = "font-size:12px;font-weight:700;color:#4a5568;text-align:center;padding:0 8px;font-family:system-ui";
                      span.textContent = p.name;
                      parent.appendChild(span);
                    }
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ══ COPYRIGHT ════════════════════════════════════════════════ */}
        <motion.div {...fadeUp(0.26)}>
          <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/22 text-xs">
              © {new Date().getFullYear()} Groupe Espace Vert. {tf("allRightsReserved")}.
            </p>
            <div className="flex flex-wrap justify-center gap-5 text-xs text-white/22">
              <Link href={`/${locale}/mentions-legales`}          className="hover:text-white/50 transition-colors">{tf("legal")}</Link>
              <Link href={`/${locale}/politique-confidentialite`} className="hover:text-white/50 transition-colors">{tf("privacy")}</Link>
              <Link href={`/${locale}/cgv`}                       className="hover:text-white/50 transition-colors">{tf("terms")}</Link>
            </div>
          </div>
        </motion.div>

      </div>
    </footer>
  );
}
