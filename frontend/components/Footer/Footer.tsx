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
    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  { name: "Instagram", url: "https://www.instagram.com/espacevert.officiel/", gradient: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", bg: "#E1306C",
    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
  { name: "TikTok",    url: "https://www.tiktok.com/@espace.vert.tunisie", bg: "#010101",
    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg> },
  { name: "LinkedIn",  url: "https://linkedin.com/company/espacevert", bg: "#0A66C2",
    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
  { name: "YouTube",   url: "https://youtube.com/@espacevert", bg: "#FF0000",
    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
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
          <PhoneIcon className="w-3.5 h-3.5 text-[#8cc83f]" />{ag.tel}
        </a>
        {"email" in ag && ag.email && (
          <a href={`mailto:${ag.email}`} className="flex items-center gap-2 text-white/80 hover:text-white text-xs font-semibold transition-colors">
            <EnvelopeIcon className="w-3.5 h-3.5 text-[#8cc83f]" />{ag.email}
          </a>
        )}
      </div>
    </div>
  );
}

export default function Footer() {
  const locale     = useLocale();
  const tf         = useTranslations("footer");
  const tc         = useTranslations("common");
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

  return (
    <footer ref={sectionRef} id="site-footer"
      className="relative bg-[#0f2607] text-white overflow-hidden mt-20">

      {/* DÉCO */}
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full opacity-[0.12] blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle,#3cb648,transparent)" }} />
      <div className="absolute top-1/2 -right-24 w-64 h-64 rounded-full opacity-[0.07] blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle,#8cc83f,transparent)" }} />

      {/* Vague */}
      <div className="absolute top-0 inset-x-0 h-16 -translate-y-full pointer-events-none overflow-hidden">
        <svg viewBox="0 0 1440 64" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,32 C360,64 720,0 1080,32 C1260,48 1380,24 1440,16 L1440,64 L0,64 Z" fill="#0f2607" />
        </svg>
      </div>

      {/* Grain */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 pt-16 pb-10">

        {/* ══ AGENCES ══════════════════════════════════════════════════ */}
        <motion.div {...fadeUp(0)} className="mb-14">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/20" />
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04]">
              <MapPinIcon className="w-3.5 h-3.5 text-[#8cc83f]" />
              <span className="text-xs font-black tracking-[0.18em] uppercase text-white/60">Nos Agences</span>
            </div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/20" />
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
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(60,182,72,0.16)" }}>
                      <MapPinIcon className="w-3.5 h-3.5 text-[#8cc83f]" />
                    </div>
                    <h4 className="font-black text-[13px]">{ag.nom}</h4>
                  </div>
                  <p className="text-white/45 text-[11px] leading-relaxed mb-3">{ag.adresse}</p>
                  <a href={`tel:${ag.tel}`} className="flex items-center gap-1.5 text-[11px] text-white/65 hover:text-[#8cc83f] transition-colors font-medium mb-1">
                    <PhoneIcon className="w-3 h-3 flex-shrink-0" />{ag.tel}
                  </a>
                  {"tel2" in ag && ag.tel2 && (
                    <a href={`tel:${ag.tel2}`} className="flex items-center gap-1.5 text-[11px] text-white/65 hover:text-[#8cc83f] transition-colors font-medium">
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
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#3cb648] opacity-70" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
        </div>

        {/* ══ COLONNES ═════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">

          {/* À propos — 5 cols */}
          <motion.div {...fadeUp(0.1)} className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#27942f,#3cb648)" }}>
                <svg viewBox="0 0 40 40" className="w-7 h-7 text-white" fill="none">
                  <path d="M20 5C14 5 10 10 10 18c0 8 5 14 10 20 5-6 10-12 10-20C30 10 26 5 20 5Z" fill="currentColor" opacity=".9"/>
                  <path d="M14 20 Q20 13 26 20" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <circle cx="20" cy="17" r="2.5" fill="white"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">Espace Vert</h3>
                <p className="text-white/40 text-xs font-medium">Groupe Agricole — Depuis 1994</p>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              Leader tunisien en solutions agricoles. Innovation, qualité et service d'excellence au service de l'agriculture moderne et durable.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {["ISO 9001", "Certifié Bio", "30+ ans"].map((b) => (
                <span key={b} className="px-3 py-1.5 bg-white/[0.06] border border-white/[0.09] rounded-xl text-xs font-bold text-white/60">{b}</span>
              ))}
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.16em] mb-3">{tf("followUs")}</p>
            <div className="flex gap-2 flex-wrap">
              {socials.map((s, i) => (
                <motion.a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                  title={s.name} aria-label={s.name}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
                  transition={{ delay: 0.32 + i * 0.055, type: "spring", stiffness: 300, damping: 20 }}
                  whileHover={{ y: -3, scale: 1.14 }} whileTap={{ scale: 0.88 }}
                  className="relative w-9 h-9 rounded-xl flex items-center justify-center text-white overflow-hidden shadow-md hover:shadow-xl group transition-shadow"
                  style={{ background: ("gradient" in s ? s.gradient : s.bg) as string }}>
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
                    style={{ background: "linear-gradient(135deg,#fff,transparent)" }} />
                  <span className="relative z-10">{s.icon}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Services — 2 cols */}
          <motion.div {...fadeUp(0.14)} className="lg:col-span-2">
            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.18em] mb-5">Services</h4>
            <ul className="space-y-2.5">
              {navLinks.services.map((l, i) => (
                <li key={i}>
                  <Link href={`/${locale}${l.href}`}
                    className="group flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors duration-200">
                    <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-200 text-[#3cb648] text-sm font-black">›</span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Marques + Entreprise — 2 cols */}
          <motion.div {...fadeUp(0.17)} className="lg:col-span-2">
            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.18em] mb-5">{tf("ourBrands")}</h4>
            <ul className="space-y-2.5 mb-7">
              {navLinks.marques.map((l, i) => (
                <li key={i}>
                  <Link href={`/${locale}${l.href}`}
                    className={`group flex items-center gap-2 text-sm font-bold transition-colors duration-200 ${l.accent ? "text-[#8cc83f] hover:text-white" : "text-white/50 hover:text-white"}`}>
                    <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-200 text-[#3cb648] text-sm font-black">›</span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.18em] mb-4">Entreprise</h4>
            <ul className="space-y-2.5">
              {navLinks.company.map((l, i) => (
                <li key={i}>
                  <Link href={`/${locale}${l.href}`}
                    className="group flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors duration-200">
                    <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-200 text-[#3cb648] text-sm font-black">›</span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact + CTA — 3 cols (remplace l'ancienne colonne Contact) */}
          <motion.div {...fadeUp(0.2)} className="lg:col-span-3 flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.18em] mb-5">Nous Contacter</h4>
              <div className="space-y-3 mb-7">
                {[
                  { href: "tel:+21671333858",                    icon: PhoneIcon,    val: "(+216) 71 333 858" },
                  { href: "tel:+21671348404",                    icon: PhoneIcon,    val: "(+216) 71 348 404" },
                  { href: "mailto:secretariat.groupeev@planet.tn", icon: EnvelopeIcon, val: "secretariat.groupeev@planet.tn" },
                ].map((item, i) => (
                  <a key={i} href={item.href}
                    className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{ background: "rgba(60,182,72,0.14)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(60,182,72,0.28)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "rgba(60,182,72,0.14)")}>
                      <item.icon className="w-3.5 h-3.5 text-[#8cc83f]" />
                    </div>
                    <span className="text-[12px] text-white/65 group-hover:text-white transition-colors font-medium truncate">
                      {item.val}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

        </div>

        {/* ══ COPYRIGHT ════════════════════════════════════════════════ */}
        <motion.div {...fadeUp(0.26)}>
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/25 text-xs">
              © {new Date().getFullYear()} Groupe Espace Vert. {tf("allRightsReserved")}.
            </p>
            <div className="flex flex-wrap justify-center gap-5 text-xs text-white/25">
              <Link href={`/${locale}/mentions-legales`}          className="hover:text-white/55 transition-colors">{tf("legal")}</Link>
              <Link href={`/${locale}/politique-confidentialite`} className="hover:text-white/55 transition-colors">{tf("privacy")}</Link>
              <Link href={`/${locale}/cgv`}                       className="hover:text-white/55 transition-colors">{tf("terms")}</Link>
            </div>
          </div>
        </motion.div>

      </div>
    </footer>
  );
}