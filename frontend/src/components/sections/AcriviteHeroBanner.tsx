"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";

interface ActiviteHeroBannerProps {
  nom:             string;
  description?:    string;
  banniere?:       string;
  /** Variantes responsive de la bannière */
  banniereTablet?: string;
  banniereMobile?: string;
  /** Image miniature fallback */
  image?:          string;
  isIrrigation?:   boolean;
}

export function ActiviteHeroBanner({
  nom,
  description,
  banniere,
  banniereTablet,
  banniereMobile,
  image,
  isIrrigation = false,
}: ActiviteHeroBannerProps) {
  const bgImage = banniere || image;

  if (banniere) {
    return (
      <>
        <style>{`
          @keyframes ahbZoom {
            from { transform: scale(1.0); }
            to   { transform: scale(1.08); }
          }
          .ahb-section {
            position: relative;
            width: 100%;
            overflow: hidden;
            height: clamp(360px, 58vh, 680px);
            min-height: 340px;
            max-height: 760px;
            isolation: isolate;
          }
          /* ✅ FIX */
          .ahb-picture {
            display: block;
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
          }
          .ahb-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center 34%;
            animation: ahbZoom 12s ease-in-out forwards;
            will-change: transform;
          }
          @keyframes ahbFadeUp {
            from { opacity: 0; transform: translateY(22px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .ahb-text {
            animation: ahbFadeUp 0.8s cubic-bezier(.22,1,.36,1) 0.1s both;
          }
          .ahb-text-wrap {
            position: absolute;
            left: 0; right: 0;
            bottom: clamp(28px, 7vh, 80px);
            z-index: 4;
            padding: 0 clamp(18px, 5vw, 100px);
          }
          .ahb-text-inner {
            width: min(100%, 860px);
          }
          @media (max-width: 640px) {
            .ahb-section   { height: clamp(320px, 52vh, 440px); min-height: 320px; }
            .ahb-img       { object-position: center 28%; }
            .ahb-text-wrap { bottom: 24px; padding: 0 16px; }
          }
          @media (min-width: 641px) and (max-width: 1024px) {
            .ahb-section { height: clamp(400px, 52vh, 540px); }
            .ahb-img     { object-position: center 32%; }
          }
          @media (min-width: 1400px) {
            .ahb-section { max-height: 820px; }
          }
        `}</style>

        <section className="ahb-section">
          {/* ✅ FIX : <picture> responsive */}
          <picture className="ahb-picture">
            {banniereMobile && (
              <source media="(max-width: 640px)" srcSet={banniereMobile} />
            )}
            {banniereTablet && (
              <source media="(max-width: 1024px)" srcSet={banniereTablet} />
            )}
            <img src={banniere} alt={nom} className="ahb-img" />
          </picture>

          {/* Gradient overlay */}
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

          <div className="ahb-text ahb-text-wrap">
            <div className="ahb-text-inner">
              <p style={{
                margin: "0 0 10px",
                fontSize: 11, fontWeight: 800,
                letterSpacing: "0.22em", textTransform: "uppercase",
                color: "#86efac",
                textShadow: "0 1px 6px rgba(0,0,0,0.45)",
              }}>
                Activité
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

              {isIrrigation && (
                <div style={{ marginTop: 28 }}>
                  <div className="inline-flex items-center gap-4 bg-sky-900/60 border border-sky-700/50 rounded-2xl px-6 py-4">
                    <CalendarDays size={24} className="text-sky-400 shrink-0" />
                    <div>
                      <p className="text-white font-semibold text-sm">Solutions d&apos;irrigation Matar</p>
                      <p className="text-sky-300 text-xs">
                        Prenez rendez-vous avec un expert pour un audit personnalisé.
                      </p>
                    </div>
                    <Link href="/rendez-vous" className="btn btn-sm bg-sky-500 text-white hover:bg-sky-400 shrink-0">
                      Prendre RDV
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </>
    );
  }

  /* ── Fallback avec image miniature floue ── */
  return (
    <section
      className="relative bg-ev-950 overflow-hidden"
      style={{ paddingTop: "calc(80px + 3rem)", paddingBottom: "3rem" }}
    >
      {bgImage && (
        <>
          <img
            src={bgImage}
            alt={nom}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", opacity: 0.20,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to right, rgba(8,28,14,0.95) 0%, rgba(8,28,14,0.50) 100%)",
            }}
          />
        </>
      )}

      <div className="container-ev relative z-10">
        <p className="eyebrow text-ev-400 mb-3">Activité</p>
        <h1
          className="font-bold text-white font-display mb-4"
          style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)" }}
        >
          {nom}
        </h1>
        {description && (
          <p className="text-white/65 text-lg max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
        {isIrrigation && (
          <div className="mt-8 inline-flex items-center gap-4 bg-sky-900/60 border border-sky-700/50 rounded-2xl px-6 py-4">
            <CalendarDays size={24} className="text-sky-400 shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm">Solutions d&apos;irrigation Matar</p>
              <p className="text-sky-300 text-xs">
                Prenez rendez-vous avec un expert pour un audit personnalisé de votre installation.
              </p>
            </div>
            <Link href="/rendez-vous" className="btn btn-sm bg-sky-500 text-white hover:bg-sky-400 shrink-0">
              Prendre RDV
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}