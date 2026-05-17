"use client";

/* ─────────────────────────────────────────────────────────────────────────────
   PageHeroStatic — Bannière image fixe pour les pages intérieures
   • Récupère l'image depuis le backend (/api/hero-slides?page=<slug>)
   • Fallback sur une image locale si aucun slide actif n'est configuré
   • Effet Ken Burns (zoom-in CSS) + double gradient
   ───────────────────────────────────────────────────────────────────────────── */

import { useEffect, useState } from "react";

const FALLBACK_IMAGE = "/images/hero/fertivert.webp";
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export interface PageHeroStaticProps {
  /** Slug de page correspondant au champ `page` en base (ex: "contact") */
  page: string;
  /** Libellé badge au-dessus du titre (optionnel) */
  eyebrow?: string;
  /** Titre principal */
  title: string;
  /** Phrase d'accroche */
  subtitle?: string;
  /**
   * Image de fallback locale si aucun slide n'est configuré en admin.
   * Défaut : /images/hero/fertivert.webp
   */
  fallbackImage?: string;
  /**
   * Hauteur CSS (ex: "55vh", "480px").
   * Défaut : "55vh" (min 300px / max 560px).
   */
  height?: string;
}

export function PageHeroStatic({
  page,
  eyebrow,
  title,
  subtitle,
  fallbackImage = FALLBACK_IMAGE,
  height = "clamp(360px, 58vh, 680px)",
}: PageHeroStaticProps) {
  const [image, setImage] = useState<string>(fallbackImage);

  useEffect(() => {
    fetch(`${BASE}/hero-slides?page=${page}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: { image: string; actif: boolean; ordre: number }[]) => {
        const first = data
          .filter(s => s.actif)
          .sort((a, b) => a.ordre - b.ordre)[0];
        if (first?.image) setImage(first.image);
      })
      .catch(() => {}); // garde le fallback
  }, [page]);

  return (
    <>
      <style>{`
        @keyframes phsZoomIn {
          from { transform: scale(1.0); }
          to   { transform: scale(1.10); }
        }
        .phs-bg-image {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center 34%; display: block;
          animation: phsZoomIn 10s ease-in-out forwards;
          will-change: transform;
        }
        @keyframes phsStaticTextUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .phs-static-text {
          animation: phsStaticTextUp 0.8s cubic-bezier(.22,1,.36,1) 0.15s both;
        }
        .phs-static-section {
          position: relative; width: 100%; overflow: hidden;
          height: ${height}; min-height: 340px; max-height: 760px;
          isolation: isolate;
        }
        .phs-static-text-wrap {
          position: absolute;
          left: 0; right: 0;
          bottom: clamp(28px, 7vh, 84px);
          z-index: 4;
          padding: 0 clamp(18px, 5vw, 100px);
        }
        .phs-static-text-inner {
          width: min(100%, 820px);
        }
        @media (max-width: 640px)  {
          .phs-static-section   { height: clamp(320px, 52vh, 440px); min-height: 320px; }
          .phs-bg-image         { object-position: center 28%; }
          .phs-static-text-wrap { bottom: 24px; padding: 0 16px; }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .phs-static-section { height: clamp(400px, 52vh, 540px); }
          .phs-bg-image       { object-position: center 32%; }
        }
        @media (min-width: 1400px) {
          .phs-static-section { max-height: 820px; }
        }
      `}</style>

      <section className="phs-static-section">

        {/* Image + Ken Burns */}
        <img src={image} alt="" className="phs-bg-image" />

        {/* Gradient double */}
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
            background: `linear-gradient(to bottom,
              rgba(0,0,0,0.52) 0%,
              rgba(0,0,0,0.14) 32%,
              rgba(0,0,0,0.07) 55%,
              rgba(0,0,0,0.62) 80%,
              rgba(0,0,0,0.78) 100%)`,
          }}
        />

        {/* Contenu textuel */}
        <div className="phs-static-text phs-static-text-wrap">
          <div className="phs-static-text-inner">
            {eyebrow && (
              <p style={{
                margin: "0 0 11px", fontSize: 11, fontWeight: 800,
                letterSpacing: "0.22em", textTransform: "uppercase",
                color: "#86efac", textShadow: "0 1px 6px rgba(0,0,0,0.45)",
              }}>
                {eyebrow}
              </p>
            )}

            <h1 style={{
              margin: 0,
              fontSize: "clamp(1.75rem, 4vw, 3rem)",
              fontWeight: 900, color: "#fff",
              lineHeight: 1.1, letterSpacing: "-0.025em",
              textShadow: "0 2px 30px rgba(0,0,0,0.4)",
            }}>
              {title}
            </h1>

            {subtitle && (
              <p style={{
                margin: "13px 0 0",
                fontSize: "clamp(0.87rem, 1.35vw, 1.02rem)",
                color: "rgba(255,255,255,0.82)", lineHeight: 1.65,
                maxWidth: 510, textShadow: "0 1px 8px rgba(0,0,0,0.3)",
              }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

      </section>
    </>
  );
}
