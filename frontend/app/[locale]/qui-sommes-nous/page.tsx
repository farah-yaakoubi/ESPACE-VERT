"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  CalendarDays, Award, Users, Globe2, Star, MapPin,
  Leaf, Target, Lightbulb, Handshake,
  Mail, ChevronRight,
} from "lucide-react";
import { TimelineEV } from "@/components/TimelineEV/TimelineEV";
import AgenceSection from "@/components/AgencesSection/AgenceSection";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  forest: "#10693B",
  leaf  : "#4CAF50",
  sage  : "#66BB6A",
  foam  : "#F1FDF4",
  cream : "#FAFFF8",
  mint  : "#C8E6C9",
  mist  : "#E8F5E9",
  text  : "#1B3A2F",
  mid   : "#2E7D52",
  soft  : "#5A8A6A",
  white : "#FFFFFF",
};

const FADE = (delay = 0) => ({
  initial    : { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport   : { once: true },
  transition : { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay },
});

// ─── Données ──────────────────────────────────────────────────────────────────
const STATS = [
  { value: "1995", label: "Fondation",        icon: CalendarDays, color: C.forest  },
  { value: "30+",  label: "Ans d'expérience", icon: Award,        color: "#D97706" },
  { value: "100",  label: "Collaborateurs",   icon: Users,        color: "#0277BD" },
  { value: "30+",  label: "Marques intl.",    icon: Globe2,       color: "#7C3AED" },
  { value: "6",    label: "Marques propres",  icon: Star,         color: "#C2410C" },
  { value: "4",    label: "Agences Tunisie",  icon: MapPin,       color: C.leaf    },
];

const PARTENAIRES = [
  { name: "Baddar Agricole",    src: "/logosPartenaires/logo baddar agricole.png"     },
  { name: "Mondial Irrigation", src: "/logosPartenaires/logo mendial irrigation.png"  },
  { name: "Stajap",             src: "/logosPartenaires/logo stajap.png"               },
];

const VALEURS = [
  {
    icon  : Star,
    title : "Qualité & Fiabilité",
    text  : "30 ans de confiance bâtie sur la qualité de nos produits et la fiabilité de nos services.",
    color : "#D97706",
    bg    : "#FFFBEB",
    border: "#FDE68A",
  },
  {
    icon  : Lightbulb,
    title : "Innovation",
    text  : "3 départements dédiés : R&D semences hybrides, irrigation goutte-à-goutte, service après-vente.",
    color : "#1565C0",
    bg    : "#EFF6FF",
    border: "#BFDBFE",
  },
  {
    icon  : Handshake,
    title : "Partenariat",
    text  : "30+ marques internationales de premier rang, représentées exclusivement sur le marché tunisien.",
    color : C.forest,
    bg    : C.cream,
    border: C.mint,
  },
  {
    icon  : Globe2,
    title : "Présence nationale",
    text  : "4 agences : Borj El Amri, Tunis, Soliman et Sfax — couvrant tout le territoire.",
    color : "#7C3AED",
    bg    : "#F5F3FF",
    border: "#DDD6FE",
  },
];

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const Icon   = stat.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
      whileHover={{ y: -5, boxShadow: `0 16px 40px ${stat.color}18` }}
      style={{
        background  : C.white,
        borderRadius: 20,
        padding     : "1.4rem 1rem",
        textAlign   : "center",
        border      : `1px solid ${C.mist}`,
        cursor      : "default",
        transition  : "box-shadow 0.25s",
      }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: index * 0.07 + 0.15, type: "spring", stiffness: 200 }}
        style={{
          width         : 44, height: 44, borderRadius: 13,
          background    : `${stat.color}12`,
          border        : `1.5px solid ${stat.color}22`,
          display       : "flex", alignItems: "center", justifyContent: "center",
          margin        : "0 auto 12px",
        }}
      >
        <Icon size={18} style={{ color: stat.color }} strokeWidth={1.8} />
      </motion.div>
      <div style={{
        fontSize     : "clamp(1.7rem, 4vw, 2.6rem)",
        fontWeight   : 900, color: stat.color,
        lineHeight   : 1, marginBottom: 5, letterSpacing: "-0.02em",
      }}>
        {stat.value}
      </div>
      <div style={{
        fontSize     : "0.68rem", fontWeight: 700, color: C.soft,
        textTransform: "uppercase", letterSpacing: "0.08em",
      }}>
        {stat.label}
      </div>
    </motion.div>
  );
}

// ─── PartenaireCard ───────────────────────────────────────────────────────────
function PartenaireCard({ p, index, inView }: {
  p: typeof PARTENAIRES[0];
  index: number;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ delay: 0.28 + index * 0.09, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, scale: 1.06 }}
      style={{
        width        : 164, height: 84,
        borderRadius : 14,
        background   : C.white,
        border       : "1.5px solid rgba(16,105,59,0.12)",
        boxShadow    : "0 2px 12px rgba(0,0,0,0.07)",
        display      : "flex", alignItems: "center", justifyContent: "center",
        overflow     : "hidden", cursor: "pointer",
        transition   : "border-color 0.3s, box-shadow 0.3s",
        position     : "relative",
      }}
      onHoverStart={(e) => {
        const el = (e.target as HTMLElement).closest("[data-card]") as HTMLElement;
        if (el) {
          el.style.borderColor = "rgba(60,182,72,0.55)";
          el.style.boxShadow   = "0 6px 24px rgba(16,105,59,0.18)";
        }
      }}
      onHoverEnd={(e) => {
        const el = (e.target as HTMLElement).closest("[data-card]") as HTMLElement;
        if (el) {
          el.style.borderColor = "rgba(16,105,59,0.12)";
          el.style.boxShadow   = "0 2px 12px rgba(0,0,0,0.07)";
        }
      }}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 3.6 + index * 0.7, ease: "easeInOut", delay: index * 1.1 }}
        style={{ width: "76%", height: "60%", position: "relative" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.src}
          alt={p.name}
          style={{
            width     : "100%", height: "100%",
            objectFit : "contain",
            filter    : "drop-shadow(0 2px 6px rgba(0,0,0,0.1))",
            opacity   : 0.93,
            transition: "opacity 0.3s",
          }}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            const parent = img.parentElement;
            if (parent) {
              img.style.display = "none";
              const span = document.createElement("span");
              span.style.cssText = "font-size:11px;font-weight:700;color:#1B3A2F;text-align:center;padding:0 8px;";
              span.textContent   = p.name;
              parent.appendChild(span);
            }
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// ─── ValeurCard ───────────────────────────────────────────────────────────────
function ValeurCard({ v, index }: { v: typeof VALEURS[0]; index: number }) {
  const Icon = v.icon;
  return (
    <motion.div
      {...FADE(index * 0.1)}
      whileHover={{ y: -5, boxShadow: `0 12px 32px ${v.color}18` }}
      style={{
        background  : v.bg, borderRadius: 20,
        padding     : "1.7rem", border: `1.5px solid ${v.border}`,
        cursor      : "default", transition: "box-shadow 0.25s",
      }}
    >
      <motion.div
        whileHover={{ scale: 1.15 }}
        transition={{ type: "spring", stiffness: 300 }}
        style={{
          width         : 44, height: 44, borderRadius: 12,
          background    : `${v.color}12`, border: `1.5px solid ${v.color}22`,
          display       : "flex", alignItems: "center", justifyContent: "center",
          marginBottom  : 16,
        }}
      >
        <Icon size={18} style={{ color: v.color }} strokeWidth={1.8} />
      </motion.div>
      <h3 style={{ fontWeight: 800, color: v.color, marginBottom: 8, fontSize: "1rem" }}>
        {v.title}
      </h3>
      <p style={{ color: C.soft, fontSize: "0.84rem", lineHeight: 1.68 }}>{v.text}</p>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function QuiSommesNousPage() {
  const partenairesRef    = useRef<HTMLDivElement>(null);
  const partenairesInView = useInView(partenairesRef, { once: true, margin: "-60px" });

  return (
    <div style={{ background: C.white, minHeight: "100vh" }}>

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section style={{
        background  : `linear-gradient(135deg, ${C.cream} 0%, #DAF5DE 55%, #CCE9D4 100%)`,
        position    : "relative", overflow: "hidden",
        padding     : "7rem 2rem 6rem",
        borderBottom: `1px solid ${C.mist}`,
      }}>
        <div style={{
          position       : "absolute", inset: 0,
          backgroundImage: `radial-gradient(${C.forest}08 1px, transparent 1px)`,
          backgroundSize : "28px 28px", pointerEvents: "none",
        }} />
        <div style={{
          position     : "absolute", top: -100, right: -100,
          width: 500, height: 500, borderRadius: "50%",
          background   : `radial-gradient(circle, ${C.leaf}18 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <div style={{ position: "absolute", bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 60" style={{ width: "100%", height: 60, display: "block" }} preserveAspectRatio="none">
            <path d="M0,60L1440,60L1440,20C1080,52,720,4,360,30C180,44,90,14,0,26Z" fill={C.white} />
          </svg>
        </div>

        <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              style={{
                display      : "inline-flex", alignItems: "center", gap: 8,
                background   : C.forest, color: C.white,
                padding      : "6px 20px", borderRadius: 99,
                fontSize     : 11, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", marginBottom: 28,
                boxShadow    : `0 4px 20px ${C.forest}35`,
              }}
            >
              <Leaf size={12} strokeWidth={2.5} />
              Groupe Espace Vert · Fondé en 1995
            </motion.span>

            <h1 style={{
              fontSize     : "clamp(2.6rem, 6vw, 4.5rem)",
              fontWeight   : 900, color: C.text,
              lineHeight   : 1.02, letterSpacing: "-0.03em", marginBottom: 22,
            }}>
              Qui sommes-<span style={{ color: C.forest }}>nous</span>&nbsp;?
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              style={{ fontSize: "1.08rem", color: C.mid, maxWidth: 580, margin: "0 auto", lineHeight: 1.8 }}
            >
              Fondé par M. Abderraouf Ghariani, le Groupe Espace Vert est une référence tunisienne
              en production agricole, irrigation, espaces verts et animalerie depuis plus de 30 ans.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ══ STATS ═════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "4rem 2rem", background: C.white }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            display            : "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
            gap                : 14,
          }}>
            {STATS.map((s, i) => <StatCard key={i} stat={s} index={i} />)}
          </div>
        </div>
      </section>

      {/* ══ TIMELINE ══════════════════════════════════════════════════════════ */}
      <TimelineEV />

      {/* ══ PARTENAIRES (à la place des sociétés) ════════════════════════════ */}
      <section style={{ padding: "5.5rem 2rem", background: C.white }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div {...FADE()} style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{
              display      : "inline-flex", alignItems: "center", gap: 7,
              background   : C.forest, color: C.white,
              padding      : "5px 18px", borderRadius: 99,
              fontSize     : 11, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", marginBottom: 16,
            }}>
              {/* Handshake icon inline */}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
              </svg>
              Nos Filiales
            </span>
            <h2 style={{
              fontSize     : "clamp(1.6rem, 3.5vw, 2.4rem)",
              fontWeight   : 900, color: C.text, letterSpacing: "-0.02em",
            }}>
              3 marques qui nous définissent
            </h2>
            <p style={{ color: C.soft, marginTop: 10, fontSize: "0.88rem" }}>
              Des marques propres développées pour répondre aux besoins spécifiques du marché tunisien.
            </p>
          </motion.div>

          {/* Logos partenaires */}
          <div ref={partenairesRef}>
            <div style={{
              display       : "flex",
              justifyContent: "center",
              gap           : 24,
              flexWrap      : "wrap",
            }}>
              {PARTENAIRES.map((p, i) => (
                <PartenaireCard key={p.src} p={p} index={i} inView={partenairesInView} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ MISSION ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "4rem 2rem", background: C.foam }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <motion.div
            {...FADE()}
            style={{
              background  : `linear-gradient(135deg, ${C.forest} 0%, ${C.sage} 100%)`,
              borderRadius: 26, padding: "3rem",
              position    : "relative", overflow: "hidden",
            }}
          >
            <div style={{
              position       : "absolute", inset: 0,
              backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize : "22px 22px", pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", right: -60, top: -60,
              width: 220, height: 220, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
            <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 22, flexWrap: "wrap" }}>
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 250 }}
                style={{
                  width: 52, height: 52, borderRadius: 15,
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Target size={24} color="white" strokeWidth={1.7} />
              </motion.div>
              <div>
                <h2 style={{ fontSize: "1.55rem", fontWeight: 900, marginBottom: 14, color: C.white }}>
                  Notre Mission
                </h2>
                <p style={{ fontSize: "0.97rem", color: "rgba(255,255,255,0.88)", lineHeight: 1.82, maxWidth: 680 }}>
                  Véritable partenaire de nos clients, notre mission est de les accompagner dans toutes les phases
                  du processus de la production agricole en leur guidant sur la voie des bonnes pratiques culturales
                  et en leur offrant des produits modernes et des services personnalisés d'assistance technique et d'expertise.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ VALEURS ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "5.5rem 2rem", background: C.white }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div {...FADE()} style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{
              display      : "inline-flex", alignItems: "center", gap: 7,
              background   : C.forest, color: C.white,
              padding      : "5px 18px", borderRadius: 99,
              fontSize     : 11, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", marginBottom: 16,
            }}>
              <Star size={11} strokeWidth={2.5} />
              Nos Valeurs
            </span>
            <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 900, color: C.text, letterSpacing: "-0.02em" }}>
              Ce qui nous définit
            </h2>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
            {VALEURS.map((v, i) => <ValeurCard key={i} v={v} index={i} />)}
          </div>
        </div>
      </section>

      {/* ══ AGENCES ═══════════════════════════════════════════════════════════ */}
      <AgenceSection />

      {/* ══ CTA ═══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "5rem 2rem", background: C.white, textAlign: "center" }}>
        <motion.div {...FADE()}>
          <h2 style={{ fontSize: "1.55rem", fontWeight: 900, color: C.text, marginBottom: 10 }}>
            Vous souhaitez en savoir plus ?
          </h2>
          <p style={{ color: C.soft, marginBottom: 32, fontSize: "0.97rem" }}>
            Notre équipe d'experts est à votre disposition.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/contact" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: C.forest, color: C.white,
                padding: "0.85rem 1.9rem", borderRadius: 13,
                fontWeight: 700, fontSize: "0.92rem", textDecoration: "none",
                boxShadow: `0 4px 18px ${C.forest}35`,
              }}>
                <Mail size={15} strokeWidth={2} />
                Nous contacter
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/rendez-vous" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: C.cream, color: C.forest,
                padding: "0.85rem 1.9rem", borderRadius: 13,
                fontWeight: 700, fontSize: "0.92rem",
                border: `1.5px solid ${C.mint}`, textDecoration: "none",
              }}>
                <CalendarDays size={15} strokeWidth={2} />
                Prendre rendez-vous
                <ChevronRight size={14} strokeWidth={2.5} />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}