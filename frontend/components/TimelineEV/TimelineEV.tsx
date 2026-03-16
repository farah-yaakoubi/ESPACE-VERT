"use client";
/**
 * components/TimelineEV/TimelineEV.tsx
 * Timeline Groupe Espace Vert — version pro animée
 * Icônes : SVG inline custom (zéro IA, zéro lucide)
 * Animation : CSS keyframes + framer-motion scroll-triggered
 */

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

// ─── Palette lumineuse (non foncée) ──────────────────────────────────────────
const C = {
  forest : "#10693B",
  leaf   : "#4CAF50",
  sage   : "#66BB6A",
  foam   : "#F1FDF4",
  cream  : "#FAFFF8",
  mint   : "#C8E6C9",
  mist   : "#E8F5E9",
  text   : "#1B3A2F",
  mid    : "#2E7D52",
  soft   : "#5A8A6A",
  muted  : "#90A890",
  white  : "#FFFFFF",
};

// ─── CSS keyframes injectés une seule fois ────────────────────────────────────
const KEYFRAMES = `
@keyframes stemGrow {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}
@keyframes nodePop {
  0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
  70%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes pulseRing {
  0%   { transform: scale(1);   opacity: 0.6; }
  100% { transform: scale(2.2); opacity: 0; }
}
@keyframes cardSlideLeft {
  from { opacity: 0; transform: translateX(-48px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes cardSlideRight {
  from { opacity: 0; transform: translateX(48px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes floatY {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-6px); }
}
.tl-card-left  { animation: cardSlideLeft  0.7s cubic-bezier(0.22,1,0.36,1) both; }
.tl-card-right { animation: cardSlideRight 0.7s cubic-bezier(0.22,1,0.36,1) both; }
.tl-node-pop   { animation: nodePop        0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
.tl-stem-grow  { animation: stemGrow       2s   cubic-bezier(0.22,1,0.36,1) both; transform-origin: top center; }
.tl-pulse-ring { animation: pulseRing      2s   ease-out infinite; }
.tl-float      { animation: floatY         4s   ease-in-out infinite; }
`;

// ─── Icônes SVG custom (aucune IA) ────────────────────────────────────────────
const Icons = {
  Seed: ({ size = 22, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12" />
      <path d="M5 3C5 3 5.5 8 9 11C12.5 14 12 12 12 12C12 12 11.5 7 8 5C6 3.8 5 3 5 3Z" fill={color} fillOpacity="0.3"/>
      <path d="M19 3C19 3 18.5 8 15 11C11.5 14 12 12 12 12C12 12 12.5 7 16 5C18 3.8 19 3 19 3Z" fill={color} fillOpacity="0.3"/>
    </svg>
  ),
  Globe: ({ size = 22, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  Building: ({ size = 22, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
    </svg>
  ),
  Pipe: ({ size = 22, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4"/>
      <path d="M4 8a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2"/>
      <path d="M9 12h6"/>
      <circle cx="6" cy="12" r="1" fill={color}/>
      <circle cx="18" cy="12" r="1" fill={color}/>
    </svg>
  ),
  Flower: ({ size = 22, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3z" fill={color} fillOpacity="0.25"/>
      <path d="M12 16a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3z" fill={color} fillOpacity="0.25"/>
      <path d="M2 12a3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3z" fill={color} fillOpacity="0.25"/>
      <path d="M16 12a3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3z" fill={color} fillOpacity="0.25"/>
    </svg>
  ),
  Trophy: ({ size = 22, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16M12 17v5M8 17h8"/>
      <path d="M6 4h12v9a6 6 0 0 1-12 0Z"/>
    </svg>
  ),
  Check: ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Arrow: ({ size = 13, color = "currentColor" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
};

// ─── Données timeline ─────────────────────────────────────────────────────────
const STEPS = [
  {
    year    : "1995",
    label   : "Fondation",
    title   : "Création d'Espace Vert SARL",
    summary : "Fondée par M. Abderraouf Ghariani — premier acteur tunisien en commercialisation de semences agricoles en gros.",
    detail  : "La société démarre avec une vision claire : devenir la référence nationale en intrants agricoles. Un réseau solide de fournisseurs étrangers de grande renommée est mis en place dès les premières années, jetant les bases d'une croissance durable.",
    icon    : Icons.Seed,
    accent  : "#10693B",
    bg      : "#F0FDF4",
    border  : "#BBF7D0",
    highlight: "#D1FAE5",
    stat    : { label: "Activité de départ", value: "Semences" },
    chips   : ["Semences Agricoles", "Gros & Détail"],
  },
  {
    year    : "2000+",
    label   : "Diversification",
    title   : "Extension des gammes produits",
    summary : "Matériel agricole, irrigation, fertilisants, jardinage et animalerie rejoignent le catalogue.",
    detail  : "Grâce à la qualité et la fiabilité de ses services, la société étend son offre à 5 familles : matériel agricole, systèmes d'irrigation, fertilisants, jardinage, animalerie. Le réseau de fournisseurs internationaux se consolide avec des partenaires de premier rang.",
    icon    : Icons.Globe,
    accent  : "#1565C0",
    bg      : "#EFF6FF",
    border  : "#BFDBFE",
    highlight: "#DBEAFE",
    stat    : { label: "Familles de produits", value: "5+" },
    chips   : ["Irrigation", "Fertilisants", "Jardinage"],
  },
  {
    year    : "2005+",
    label   : "STAJAP",
    title   : "2ème société — Espaces Verts Pro",
    summary : "Filiale spécialisée en matériels pour parcs, stades, golfs et installations sportives.",
    detail  : "STAJAP répond à une demande croissante des collectivités, hôteliers et terrains de golf. Matériels et produits pour espaces verts professionnels, animalerie, semences, engrais et outils complètent l'offre de cette société dédiée.",
    icon    : Icons.Building,
    accent  : "#0277BD",
    bg      : "#E0F7FA",
    border  : "#B2EBF2",
    highlight: "#E0F7FA",
    stat    : { label: "Clients cibles", value: "Golfs • Hôtels" },
    chips   : ["Stades", "Parcs", "Sport"],
  },
  {
    year    : "2010+",
    label   : "Mondiale Irrigation",
    title   : "3ème société — Fabrication industrielle",
    summary : "Unité de fabrication de tuyaux PEHD, tubes lisses et tubes à goutteur pour l'irrigation.",
    detail  : "Intégration verticale majeure : fabrication de tuyaux PEHD (Ø 25–110 mm), tubes lisses et tubes à goutteur. Couverture complète de l'irrigation agricole, parcs et jardins. Cette unité industrielle renforce la compétitivité et l'indépendance du groupe.",
    icon    : Icons.Pipe,
    accent  : "#006064",
    bg      : "#E0F7FA",
    border  : "#80DEEA",
    highlight: "#E0F7FA",
    stat    : { label: "Diamètres fabriqués", value: "Ø 25–110 mm" },
    chips   : ["PEHD", "Tube Goutteur", "Tube Lisse"],
  },
  {
    year    : "2015+",
    label   : "BADDAR AGRICOLE",
    title   : "4ème société — Pépinière & Semences",
    summary : "Production et vente de plants francs et greffés, semences maraîchères et florales.",
    detail  : "Quatrième société du groupe, BADDAR AGRICOLE se concentre sur la production végétale : plants maraîchers, fruitiers et ornementaux. Semences florales et maraîchères de haute qualité génétique. L'expertise en horticulture complète parfaitement l'offre globale.",
    icon    : Icons.Flower,
    accent  : "#E65100",
    bg      : "#FFF3E0",
    border  : "#FFCC80",
    highlight: "#FFE0B2",
    stat    : { label: "Types de plants", value: "Francs & Greffés" },
    chips   : ["Plants Maraîchers", "Fruitiers", "Floraux"],
  },
  {
    year    : "Aujourd'hui",
    label   : "Leader National",
    title   : "Groupe Espace Vert — 30 ans",
    summary : "100 collaborateurs, 30+ marques internationales, 6 marques propres, 5 agences nationales.",
    detail  : "Leader national reconnu. 30 cadres supérieurs — ingénieurs agronomes et techniciens. 5 agences : Borj El Amri, Tunis, Soliman, Kairouan et Sfax. 3 départements dédiés : R&D semences hybrides, irrigation goutte-à-goutte, SAV matériels professionnels.",
    icon    : Icons.Trophy,
    accent  : "#10693B",
    bg      : "#F0FDF4",
    border  : "#86EFAC",
    highlight: "#DCFCE7",
    stat    : { label: "Collaborateurs", value: "100" },
    chips   : ["30+ Marques Intl.", "6 Marques Propres", "5 Agences"],
  },
];

// ─── Tige SVG animée ──────────────────────────────────────────────────────────
function AnimatedStem() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  return (
    <div ref={ref} style={{
      position: "absolute", left: "50%", top: 0, bottom: 0,
      transform: "translateX(-50%)", width: 3, pointerEvents: "none", zIndex: 0,
    }}>
      <div className={inView ? "tl-stem-grow" : ""} style={{
        width: "100%", height: "100%",
        background: `linear-gradient(to bottom, ${C.sage} 0%, ${C.forest} 60%, ${C.mid} 100%)`,
        borderRadius: 4,
        boxShadow: `0 0 12px ${C.leaf}44`,
      }} />
    </div>
  );
}

// ─── Nœud ─────────────────────────────────────────────────────────────────────
function Node({ step, delay, visible }: { step: typeof STEPS[0]; delay: number; visible: boolean }) {
  const Icon = step.icon;
  return (
    <div className={visible ? "tl-node-pop" : ""} style={{
      animationDelay: `${delay}s`,
      position: "relative", zIndex: 4,
      width: 56, height: 56,
    }}>
      {/* Pulse ring */}
      <div className="tl-pulse-ring" style={{
        position: "absolute", inset: -6,
        borderRadius: "50%",
        border: `2px solid ${step.accent}`,
      }} />
      {/* Main circle */}
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: `linear-gradient(135deg, ${step.accent} 0%, ${step.accent}bb 100%)`,
        border: `3px solid white`,
        boxShadow: `0 0 0 3px ${step.accent}33, 0 8px 24px ${step.accent}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", zIndex: 2,
      }}>
        <Icon size={22} color="white" />
      </div>
      {/* Year pill */}
      <div style={{
        position: "absolute", top: -32, left: "50%",
        transform: "translateX(-50%)",
        background: step.accent,
        color: "white",
        padding: "3px 10px",
        borderRadius: 99,
        fontSize: 11, fontWeight: 800,
        whiteSpace: "nowrap",
        boxShadow: `0 2px 8px ${step.accent}44`,
      }}>
        {step.year}
      </div>
    </div>
  );
}

// ─── Carte flip 3D pro ────────────────────────────────────────────────────────
function FlipCard({ step, isLeft, index, visible }: {
  step: typeof STEPS[0]; isLeft: boolean; index: number; visible: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const Icon = step.icon;
  const aniClass = isLeft ? "tl-card-left" : "tl-card-right";

  return (
    <div
      className={visible ? aniClass : ""}
      style={{ animationDelay: `${index * 0.15}s`, width: "100%", maxWidth: 360 }}
    >
      {/* flip wrapper */}
      <div
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
        style={{
          position: "relative",
          height: 240,
          cursor: "pointer",
          transformStyle: "preserve-3d",
          perspective: 1200,
          transition: "transform 0.65s cubic-bezier(0.34,1.2,0.64,1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ── RECTO ── */}
        <div style={{
          position: "absolute", inset: 0,
          backfaceVisibility: "hidden",
          background: C.white,
          borderRadius: 22,
          border: `2px solid ${step.border}`,
          boxShadow: `0 4px 24px ${step.accent}12, 0 1px 4px rgba(0,0,0,0.06)`,
          padding: "1.4rem 1.5rem",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          overflow: "hidden",
        }}>
          {/* Déco coin */}
          <div style={{
            position: "absolute", top: 0, right: 0,
            width: 80, height: 80,
            background: `radial-gradient(circle at top right, ${step.highlight}, transparent 70%)`,
            borderRadius: "0 22px 0 0",
          }} />
          <div>
            {/* Icône + label */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 14,
                background: step.bg,
                border: `2px solid ${step.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                boxShadow: `0 2px 8px ${step.accent}18`,
              }}>
                <Icon size={20} color={step.accent} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: step.accent, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {step.label}
                </div>
                <h3 style={{ fontSize: "0.93rem", fontWeight: 800, color: C.text, lineHeight: 1.3 }}>
                  {step.title}
                </h3>
              </div>
            </div>
            <p style={{ fontSize: "0.8rem", color: C.soft, lineHeight: 1.7 }}>
              {step.summary}
            </p>
          </div>
          {/* Chips + hint */}
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
              {step.chips.map((c, i) => (
                <span key={i} style={{
                  fontSize: 10, fontWeight: 700,
                  background: step.bg, color: step.accent,
                  border: `1px solid ${step.border}`,
                  padding: "2px 8px", borderRadius: 99,
                }}>
                  {c}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 16, height: 1.5, background: step.accent, borderRadius: 99 }} />
              <span style={{ fontSize: "0.67rem", color: C.muted, fontWeight: 600 }}>
                Survolez pour les détails →
              </span>
            </div>
          </div>
        </div>

        {/* ── VERSO ── */}
        <div style={{
          position: "absolute", inset: 0,
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          borderRadius: 22,
          background: `linear-gradient(145deg, ${step.accent} 0%, ${step.accent}e0 100%)`,
          padding: "1.5rem",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          overflow: "hidden",
        }}>
          {/* Motifs déco */}
          <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
          <div style={{ position: "absolute", bottom: -30, left: -20, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          {/* Grid déco */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(255,255,255,0.18)",
                border: "1.5px solid rgba(255,255,255,0.28)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={17} color="white" />
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {step.year} · {step.label}
              </span>
            </div>
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.92)", lineHeight: 1.75 }}>
              {step.detail}
            </p>
          </div>

          {/* Stat badge */}
          <div style={{ position: "relative" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 14,
              background: "rgba(255,255,255,0.15)",
              border: "1.5px solid rgba(255,255,255,0.22)",
              borderRadius: 14, padding: "10px 16px", marginTop: 12,
            }}>
              <div>
                <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "white", lineHeight: 1 }}>
                  {step.stat.value}
                </div>
                <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.6)", marginTop: 2, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {step.stat.label}
                </div>
              </div>
              {/* Progress bar déco */}
              <div style={{ width: 60, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ width: "75%", height: "100%", background: "rgba(255,255,255,0.7)", borderRadius: 99 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export function TimelineEV() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView     = useInView(sectionRef, { once: true, margin: "-8%" });

  return (
    <section style={{
      padding: "5.5rem 2rem 4.5rem",
      background: `linear-gradient(180deg, ${C.foam} 0%, white 60%, ${C.foam} 100%)`,
      position: "relative", overflow: "hidden",
    }}>
      {/* Inject keyframes */}
      <style>{KEYFRAMES}</style>

      {/* Fond décoratif doux */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='52' viewBox='0 0 52 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2310693B' fill-rule='evenodd'%3E%3Ccircle cx='26' cy='26' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: "52px 52px", pointerEvents: "none",
      }} />

      {/* Halo gauche */}
      <div style={{ position: "absolute", top: "10%", left: "-80px", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${C.sage}18 0%, transparent 70%)`, pointerEvents: "none" }} />
      {/* Halo droit */}
      <div style={{ position: "absolute", bottom: "15%", right: "-60px", width: 240, height: 240, borderRadius: "50%", background: `radial-gradient(circle, ${C.leaf}14 0%, transparent 70%)`, pointerEvents: "none" }} />

      <div ref={sectionRef} style={{ maxWidth: 980, margin: "0 auto", position: "relative" }}>

        {/* ── Titre ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          style={{ textAlign: "center", marginBottom: "5rem" }}
        >
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: C.forest, color: "white",
            padding: "6px 18px", borderRadius: 99,
            fontSize: 11, fontWeight: 800,
            letterSpacing: "0.1em", textTransform: "uppercase",
            marginBottom: 20,
            boxShadow: `0 4px 16px ${C.forest}33`,
          }}>
            <Icons.Seed size={13} color="white" />
            Notre Histoire depuis 1995
          </span>

          <h2 style={{
            fontSize: "clamp(1.9rem, 4.5vw, 2.8rem)",
            fontWeight: 900, color: C.text,
            letterSpacing: "-0.025em", lineHeight: 1.1,
            marginBottom: 14,
          }}>
            30 ans de croissance{" "}
            <span style={{
              background: `linear-gradient(135deg, ${C.forest}, ${C.leaf})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              & d'innovation
            </span>
          </h2>

          <p style={{ color: C.soft, fontSize: "1rem", maxWidth: 500, margin: "0 auto", lineHeight: 1.75 }}>
            De la commercialisation de semences à un groupe de 4 sociétés, 100 collaborateurs et 5 agences nationales.
          </p>

          {/* Ligne décorative */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 24 }}>
            <div style={{ width: 40, height: 1.5, background: C.mint, borderRadius: 99 }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.forest }} />
            <div style={{ width: 40, height: 1.5, background: C.mint, borderRadius: 99 }} />
          </div>
        </motion.div>

        {/* ── Grille timeline ── */}
        <div style={{ position: "relative" }}>
          <AnimatedStem />

          <div style={{ display: "flex", flexDirection: "column", gap: 52, position: "relative", zIndex: 1 }}>
            {STEPS.map((step, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div key={i} style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 72px 1fr",
                  alignItems: "center",
                  paddingTop: 32,
                }}>
                  {/* Gauche */}
                  <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: 24 }}>
                    {isLeft && <FlipCard step={step} isLeft index={i} visible={inView} />}
                  </div>
                  {/* Nœud */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Node step={step} delay={i * 0.14} visible={inView} />
                  </div>
                  {/* Droite */}
                  <div style={{ paddingLeft: 24 }}>
                    {!isLeft && <FlipCard step={step} isLeft={false} index={i} visible={inView} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Footer hint ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.2, duration: 0.6 }}
          style={{ textAlign: "center", marginTop: "3.5rem" }}
        >
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: C.white,
            border: `2px solid ${C.mint}`,
            color: C.muted,
            padding: "8px 20px", borderRadius: 99,
            fontSize: "0.72rem", fontWeight: 700,
            boxShadow: "0 2px 12px rgba(16,105,59,0.08)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m7 15 5 5 5-5M7 9l5-5 5 5"/>
            </svg>
            Survolez chaque carte pour découvrir les détails complets
          </span>
        </motion.div>

      </div>
    </section>
  );
}