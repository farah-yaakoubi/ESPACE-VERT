"use client";

import Link from "next/link";

interface MarqueHeroBannerProps {
  nom:          string;
  slug:         string;
  description?: string;
  /** URL de la bannière uploadée depuis l'admin */
  banniere?:    string;
  /** Affiche le CTA « Prendre rendez-vous » (Matar uniquement) */
  rdvCta?:      boolean;
}

const NAV_H = 80;

export function MarqueHeroBanner({
  nom,
  slug,
  description,
  banniere,
  rdvCta = false,
}: MarqueHeroBannerProps) {
  /* ── Avec bannière image ── */
  if (banniere) {
    return (
      <>
        <style>{`
          @keyframes mhbZoom {
            from { transform: scale(1.0); }
            to   { transform: scale(1.08); }
          }
          .mhb-section {
            position: relative;
            width: 100%;
            overflow: hidden;
            height: clamp(360px, 58vh, 680px);
            min-height: 340px;
            max-height: 760px;
            isolation: isolate;
          }
          .mhb-img {
            position: absolute; inset: 0;
            width: 100%; height: 100%;
            object-fit: cover; object-position: center 34%;
            animation: mhbZoom 12s ease-in-out forwards;
            will-change: transform;
          }
          @keyframes mhbFadeUp {
            from { opacity: 0; transform: translateY(22px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .mhb-text {
            animation: mhbFadeUp 0.8s cubic-bezier(.22,1,.36,1) 0.1s both;
          }
          .mhb-text-wrap {
            position: absolute;
            left: 0; right: 0;
            bottom: clamp(28px, 7vh, 80px);
            z-index: 4;
            padding: 0 clamp(18px, 5vw, 100px);
          }
          .mhb-text-inner {
            width: min(100%, 860px);
          }
          @media (max-width: 640px) {
            .mhb-section   { height: clamp(320px, 52vh, 440px); min-height: 320px; }
            .mhb-img       { object-position: center 28%; }
            .mhb-text-wrap { bottom: 24px; padding: 0 16px; }
          }
          @media (min-width: 641px) and (max-width: 1024px) {
            .mhb-section { height: clamp(400px, 52vh, 540px); }
            .mhb-img     { object-position: center 32%; }
          }
          @media (min-width: 1400px) {
            .mhb-section { max-height: 820px; }
          }
        `}</style>

        <section className="mhb-section">
          {/* Background image */}
          <img src={banniere} alt={nom} className="mhb-img" />

          {/* Double gradient overlay */}
          <div
            aria-hidden
            style={{
              position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
              background: `linear-gradient(to bottom,
                rgba(0,0,0,0.55) 0%,
                rgba(0,0,0,0.15) 30%,
                rgba(0,0,0,0.08) 52%,
                rgba(0,0,0,0.65) 78%,
                rgba(0,0,0,0.82) 100%)`,
            }}
          />

          {/* Text */}
          <div className="mhb-text mhb-text-wrap">
            <div className="mhb-text-inner">
              <p style={{
                margin: "0 0 10px",
                fontSize: 11, fontWeight: 800,
                letterSpacing: "0.22em", textTransform: "uppercase",
                color: "#86efac",
                textShadow: "0 1px 6px rgba(0,0,0,0.45)",
              }}>
                Marque
              </p>

              <h1 style={{
                margin: 0,
                fontSize: "clamp(1.8rem, 4vw, 3.2rem)",
                fontWeight: 900, color: "#fff",
                lineHeight: 1.1, letterSpacing: "-0.025em",
                textShadow: "0 2px 30px rgba(0,0,0,0.4)",
              }}>
                {nom}
              </h1>

              {description && (
                <p style={{
                  margin: "14px 0 0",
                  fontSize: "clamp(0.87rem, 1.35vw, 1.05rem)",
                  color: "rgba(255,255,255,0.80)",
                  lineHeight: 1.65, maxWidth: 520,
                  textShadow: "0 1px 8px rgba(0,0,0,0.3)",
                }}>
                  {description}
                </p>
              )}

              {rdvCta && (
                <div style={{ marginTop: 24 }}>
                  <Link
                    href="/rendez-vous"
                    className="btn btn-lg bg-sky-500 text-white hover:bg-sky-600"
                  >
                    Prendre rendez-vous — Irrigation
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </>
    );
  }

  /* ── Fallback : dégradé vert (aucune bannière configurée) ── */
  return (
    <section
      className="bg-gradient-to-br from-ev-950 to-ev-800"
      style={{
        paddingTop: `calc(${NAV_H}px + 3rem)`,
        paddingBottom: "3rem",
      }}
    >
      <div className="container-ev">
        <div className="text-center md:text-left max-w-3xl">
          <p className="eyebrow text-ev-300 mb-2">Marque</p>
          <h1
            className="font-bold text-white mb-4 font-display"
            style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)" }}
          >
            {nom}
          </h1>
          {description && (
            <p className="text-white/65 text-lg leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
          {rdvCta && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/rendez-vous"
                className="btn btn-lg bg-sky-500 text-white hover:bg-sky-600"
              >
                Prendre rendez-vous — Irrigation
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
