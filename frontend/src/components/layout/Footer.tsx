"use client";
import Image from "next/image";
import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  MapPinIcon as MapPin,
  PhoneIcon as Phone,
  EnvelopeIcon as Mail,
  BuildingOffice2Icon as BuildingIcon,
  ArrowTopRightOnSquareIcon as ArrowTopRightOnSquare,
} from "@heroicons/react/24/outline";
import { useI18n } from "@/i18n/I18nProvider";

/* ─── Types ─────────────────────────────────────────────────── */
type Agence = {
  nom: string;
  adresse: string;
  tel: string;
  tel2?: string;
  email?: string;
  maps: string;
  lat: number;
  lng: number;
};

/* ─── Données ──────────────────────────────────────────────── */
const agences: Agence[] = [
  { nom: "Tunis", adresse: "69, rue Abderrazak Chraibi, 1001 Tunis", tel: "(+216) 71 333 858", tel2: "(+216) 71 348 404", email: "secretariat.groupeev@planet.tn", maps: "https://www.google.com/maps/search/?api=1&query=36.8065,10.1815", lat: 36.8065, lng: 10.1815 },
  { nom: "Soliman", adresse: "MGR2+XGH, R43, Sulayman", tel: "(+216) 72 333 143", maps: "https://www.google.com/maps/search/?api=1&query=36.7011,10.4886", lat: 36.7011, lng: 10.4886 },
  { nom: "Borj Amri", adresse: "PXQ2+R9, Sidi Ali El Hattab", tel: "(+216) 71 234 567", maps: "https://www.google.com/maps/search/?api=1&query=36.9117,9.9728", lat: 36.9117, lng: 9.9728 },
  { nom: "Sfax", adresse: "MPV7+GG3, rue béjaia, Rte de Gabes 3049", tel: "(+216) 74 000 000", maps: "https://www.google.com/maps/search/?api=1&query=34.7252,10.7605", lat: 34.7252, lng: 10.7605 },
];

const socials = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/profile.php?id=61566401919487",
    bg: "#1877F2",
    icon: <svg className="w-[17px] h-[17px]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/espacevert.officiel/",
    gradient: "linear-gradient(180deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)",
    bg: "#E1306C",
    icon: <svg className="w-[17px] h-[17px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>,
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@espace.vert.tunisie",
    bg: "#010101",
    icon: <svg className="w-[17px] h-[17px]" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>,
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/espace-vert-b0319b238/",
    bg: "#0A66C2",
    icon: <svg className="w-[17px] h-[17px]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@espacevert7382",
    bg: "#FF0000",
    icon: <svg className="w-[17px] h-[17px]" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
  },
];

/* ─── Grille de cartes agences ─────────────────────────────── */
function AgencesMap() {
  const gridRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(gridRef, { once: true, margin: "-40px" });

  return (
    <div ref={gridRef} className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {agences.map((ag, i) => (
        <motion.div
          key={ag.nom}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4 }}
          className="group relative overflow-hidden rounded-lg border border-[#3cb648]/35 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg hover:border-[#3cb648]/60"
        >
          {/* En-tête : icône + nom de la ville */}
          <div className="flex items-center gap-3 px-5 pb-3 pt-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3cb648]">
              <BuildingIcon className="h-5 w-5 text-white" />
            </span>
            <h3 className="text-2xl font-bold leading-none text-[#0f2607]">
              {ag.nom}
            </h3>
          </div>

          {/* Mini-carte cliquable — ouvre Google Maps dans un nouvel onglet */}
          <a
            href={ag.maps}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ouvrir ${ag.nom} sur Google Maps`}
            className="relative block h-36 w-full overflow-hidden bg-gray-100"
          >
            <iframe
              src={`https://maps.google.com/maps?q=${ag.lat},${ag.lng}&z=15&output=embed`}
              className="pointer-events-none absolute inset-0 h-full w-full scale-[1.22] transition-transform duration-700 ease-out group-hover:scale-[1.38]"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Carte ${ag.nom}`}
            />
            {/* Masque de bas de carte : neutralise le logo/les contrôles Google qui
                peuvent déborder selon la localisation (visible sur Tunis / Soliman) */}
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-9 bg-gradient-to-t from-white via-white/80 to-transparent" />
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px] font-semibold text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
              <ArrowTopRightOnSquare className="h-3 w-3" />
              Maps
            </span>
          </a>

          {/* Informations — liens réellement fonctionnels */}
          <div className="flex flex-col gap-2 px-5 pb-6 pt-4">
            <p className="flex items-start gap-2 text-[13px] font-bold leading-snug text-gray-600">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1a3d0a]" />
              {ag.adresse}
            </p>

            <a
              href={`tel:${ag.tel.replace(/[^+\d]/g, "")}`}
              className="flex items-center gap-2 text-[13px] font-bold text-gray-600 transition-colors hover:text-[#1a3d0a]"
            >
              <Phone className="h-3.5 w-3.5 shrink-0 text-[#1a3d0a]" />
              {ag.tel}
            </a>

            {ag.tel2 && (
              <a
                href={`tel:${ag.tel2.replace(/[^+\d]/g, "")}`}
                className="flex items-center gap-2 text-[12px] font-bold text-gray-500 transition-colors hover:text-[#1a3d0a]"
              >
                <Phone className="h-3.5 w-3.5 shrink-0 text-[#1a3d0a]/60" />
                {ag.tel2}
              </a>
            )}

            {ag.email && (
              <a
                href={`mailto:${ag.email}`}
                className="flex items-center gap-2 break-all text-[13px] font-bold text-gray-600 transition-colors hover:text-[#1a3d0a]"
              >
                <Mail className="h-3.5 w-3.5 shrink-0 text-[#1a3d0a]" />
                {ag.email}
              </a>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Footer principal ─────────────────────────────────────── */
export function Footer() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 28 },
    animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 },
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  const navLinks = {
    Activités: [
      { href: "/activites/semences-et-plants", label: "Semences & Plants" },
      { href: "/activites/irrigation", label: "Irrigation" },
      { href: "/marques/fertivert", label: "Fertilisation" },
      { href: "/activites/pollinisation-et-protection-des-plantes", label: "Pollinisation & Protection" },
      { href: "/marques/pulvert", label: "Pulvérisation" },
      { href: "/activites/machinisme-et-jardinage", label: "Jardinage & Machinisme" },
    ],
    Marques: [
      { href: "/marques/fertivert", label: "Fertivert" },
      { href: "/marques/pulvert", label: "Pulvert" },
      { href: "/marques/matar", label: "Matar" },
      { href: "/marques/baddar-semences", label: "Baddar Semences" },
    ],
    Entreprise: [
      { href: "/qui-sommes-nous", label: t("nav.about") },
      { href: "/contact", label: t("nav.contact") },
      { href: "/rendez-vous", label: t("nav.appointment") },
      { href: "/actualites", label: t("footer.news") },
    ],
  };

  return (
    <footer ref={sectionRef} id="site-footer" className="relative bg-[#fbfdf9] text-[#0f2607] overflow-hidden">
      {/* Bande verte du haut */}
      <div className="relative z-10 h-3 w-full bg-gradient-to-r from-[#1a3d0a] via-[#3cb648] to-[#8cc83f]" />

      {/* Déco fond */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-[0.12] blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle,#3cb648,transparent)" }} />
      <div className="absolute top-1/2 -right-32 w-72 h-72 rounded-full opacity-[0.10] blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle,#8cc83f,transparent)" }} />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 pt-16 pb-8">

        {/* ── Grille agences ─────────────────────────────────────────── */}
        <motion.div {...fadeUp(0.05)} className="mb-14">
          <AgencesMap />
        </motion.div>

        {/* ── Grille logo + liens ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-10 gap-10 mb-12">

          {/* Logo + tagline + socials */}
          <motion.div {...fadeUp(0.1)} className="lg:col-span-4 flex flex-col gap-6">

            <Link href="/" className="inline-block" style={{ lineHeight: 0 }}>
              <Image
                src="/logos/logo espace vert.png"
                alt="Groupe Espace Vert"
                width={400} height={120}
                style={{
                  height: "clamp(56px, 14vw, 90px)",
                  width: "auto",
                  maxWidth: "min(100%, 360px)",
                  objectFit: "contain",
                  display: "block",
                }}
                priority
              />
            </Link>

            {/* Réseaux sociaux */}
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em] mb-4">{t("footer.follow")}</p>
              <div className="flex gap-3 flex-wrap">
                {socials.map((s, i) => (
                  <motion.a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 16 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                    transition={{ delay: 0.14 + i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -3, scale: 1.08 }} whileTap={{ scale: 0.9 }}
                    title={s.name}
                    className="relative w-10 h-10 rounded-2xl overflow-hidden group shadow-md hover:shadow-xl transition-shadow flex items-center justify-center text-white"
                    style={{ background: (s as any).gradient ?? s.bg }}>
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
                      style={{ background: "linear-gradient(135deg,#fff 0%,transparent 60%)" }} />
                    <motion.span className="relative z-10" whileHover={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.3 }}>
                      {s.icon}
                    </motion.span>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Services */}
          <motion.div {...fadeUp(0.14)} className="lg:col-span-2">
            <h4 className="text-sm font-bold text-[#1a7a2e] mb-5 border-b border-[#1a7a2e]/25 pb-2 inline-block">{t("footer.services")}</h4>
            <ul className="space-y-3 mt-3">
              {navLinks.Activités.map((l, i) => (
                <li key={i}>
                  <Link href={l.href} className="group flex items-center gap-2 text-gray-600 hover:text-[#1a3d0a] text-sm font-bold transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3cb648]/60 group-hover:bg-[#1a7a2e] transition-colors shrink-0" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Marques */}
          <motion.div {...fadeUp(0.17)} className="lg:col-span-2">
            <h4 className="text-sm font-bold text-[#1a7a2e] mb-5 border-b border-[#1a7a2e]/25 pb-2 inline-block">{t("footer.brands")}</h4>
            <ul className="space-y-3 mt-3">
              {navLinks.Marques.map((l, i) => (
                <li key={i}>
                  <Link href={l.href} className="group flex items-center gap-2 text-gray-600 hover:text-[#1a3d0a] text-sm font-bold transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3cb648]/60 group-hover:bg-[#1a7a2e] transition-colors shrink-0" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Entreprise */}
          <motion.div {...fadeUp(0.20)} className="lg:col-span-2">
            <h4 className="text-sm font-bold text-[#1a7a2e] mb-5 border-b border-[#1a7a2e]/25 pb-2 inline-block">{t("footer.company")}</h4>
            <ul className="space-y-3 mt-3">
              {navLinks.Entreprise.map((l, i) => (
                <li key={i}>
                  <Link href={l.href} className="group flex items-center gap-2 text-gray-600 hover:text-[#1a3d0a] text-sm font-bold transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3cb648]/60 group-hover:bg-[#1a7a2e] transition-colors shrink-0" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* ── Espacement avant le bandeau ─────────────────────────────── */}
        <div className="h-6" />
      </div>

      {/* Bandeau vert du bas — contient le copyright */}
      <motion.div {...fadeUp(0.26)} className="relative z-10 w-full bg-gradient-to-r from-[#1a3d0a] via-[#3cb648] to-[#8cc83f]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/85 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} Groupe Espace Vert. {t("footer.rights")}
          </p>
        </div>
      </motion.div>
    </footer>
  );
}