"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

const FALLBACK_IMAGE = "/images/hero/fertivert.webp";
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export interface PageHeroStaticProps {
  page:                   string;
  eyebrow?:               string;
  title:                  string;
  subtitle?:              string;
  fallbackImage?:         string;
  /** Variantes responsive du fallback local */
  fallbackImageTablet?:   string;
  fallbackImageMobile?:   string;
  height?:                string;
  mobileHeight?:          string;
  tabletHeight?:          string;
  imagePosition?:         string;
  imagePositionTablet?:   string;
  imagePositionMobile?:   string;
  contentMaxWidth?:       string;
  contentAlign?:          "left" | "center";
}

export function PageHeroStatic({
  page,
  eyebrow,
  title,
  subtitle,
  fallbackImage       = FALLBACK_IMAGE,
  fallbackImageTablet,
  fallbackImageMobile,
  height              = "clamp(360px, 58vh, 680px)",
  mobileHeight        = "clamp(340px, 58svh, 500px)",
  tabletHeight        = "clamp(400px, 54svh, 620px)",
  imagePosition       = "center 34%",
  imagePositionTablet,
  imagePositionMobile,
  contentMaxWidth     = "46rem",
  contentAlign        = "left",
}: PageHeroStaticProps) {
  const [image,       setImage]       = useState<string>(fallbackImage);
  const [imageTablet, setImageTablet] = useState<string | undefined>(fallbackImageTablet);
  const [imageMobile, setImageMobile] = useState<string | undefined>(fallbackImageMobile);

  useEffect(() => {
    fetch(`${BASE}/hero-slides?page=${page}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: { image: string; imageMobile?: string; imageTablet?: string; actif: boolean; ordre: number }[]) => {
        const first = data
          .filter(s => s.actif)
          .sort((a, b) => a.ordre - b.ordre)[0];
        if (first?.image) {
          setImage(first.image);
          if (first.imageTablet) setImageTablet(first.imageTablet);
          if (first.imageMobile) setImageMobile(first.imageMobile);
        }
      })
      .catch(() => {});
  }, [page]);

  const sectionVars = {
    "--phs-height":            height,
    "--phs-height-mobile":     mobileHeight,
    "--phs-height-tablet":     tabletHeight,
    "--phs-image-pos":         imagePosition,
    "--phs-image-pos-tablet":  imagePositionTablet ?? imagePosition,
    "--phs-image-pos-mobile":  imagePositionMobile ?? imagePositionTablet ?? imagePosition,
    "--phs-content-max":       contentMaxWidth,
  } as CSSProperties;

  return (
    <>
      <style>{`
        @keyframes phsZoomIn {
          from { transform: scale(1.0); }
          to   { transform: scale(1.08); }
        }
        /* ✅ FIX : picture remplit la section */
        .phs-picture {
          display: block;
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .phs-bg-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: var(--phs-image-pos);
          display: block;
          animation: phsZoomIn 11s ease-in-out forwards;
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
          height: var(--phs-height); min-height: 340px; max-height: 820px;
          isolation: isolate;
        }
        .phs-static-shell {
          position: relative;
          z-index: 4;
          display: flex;
          align-items: flex-end;
          min-height: 100%;
          padding-top: clamp(100px, 14vh, 150px);
          padding-bottom: clamp(24px, 6vw, 72px);
        }
        .phs-static-text-wrap {
          width: min(100%, var(--phs-content-max));
        }
        .phs-static-text-wrap.is-center {
          margin-inline: auto;
          text-align: center;
        }
        .phs-static-text-wrap.is-center p:last-child {
          margin-inline: auto;
        }
        @media (max-width: 640px) {
          .phs-static-section { height: var(--phs-height-mobile); min-height: 340px; }
          .phs-bg-image        { object-position: var(--phs-image-pos-mobile); }
          .phs-static-shell {
            padding-top: calc(var(--nav-h) + 28px);
            padding-bottom: 22px;
          }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .phs-static-section { height: var(--phs-height-tablet); }
          .phs-bg-image        { object-position: var(--phs-image-pos-tablet); }
          .phs-static-shell {
            padding-top: calc(var(--nav-h) + 42px);
            padding-bottom: 32px;
          }
        }
        @media (min-width: 1400px) {
          .phs-static-section { max-height: 820px; }
        }
      `}</style>

      <section className="phs-static-section" style={sectionVars}>

        {/* ✅ FIX : <picture> responsive */}
        <picture className="phs-picture">
          {imageMobile && (
            <source media="(max-width: 640px)" srcSet={imageMobile} />
          )}
          {imageTablet && (
            <source media="(max-width: 1024px)" srcSet={imageTablet} />
          )}
          <img src={image} alt="" className="phs-bg-image" />
        </picture>

        {/* Gradient double */}
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
            background: `linear-gradient(to bottom,
              rgba(0,0,0,0.58) 0%,
              rgba(0,0,0,0.18) 34%,
              rgba(0,0,0,0.10) 56%,
              rgba(0,0,0,0.66) 82%,
              rgba(0,0,0,0.78) 100%)`,
          }}
        />

        {/* Contenu textuel */}
        <div className="container-ev phs-static-shell">
          <div className={`phs-static-text phs-static-text-wrap${contentAlign === "center" ? " is-center" : ""}`}>
            {eyebrow && (
              <p style={{
                margin: "0 0 11px", fontSize: 11, fontWeight: 800,
                letterSpacing: "0.22em", textTransform: "uppercase",
                color: "#86efac", textShadow: "0 1px 6px rgba(0,0,0,0.45)",
                fontFamily: "var(--font-display)",
              }}>
                {eyebrow}
              </p>
            )}

            <h1 style={{
              margin: 0,
              fontSize: "clamp(2rem, 4.8vw, 3.75rem)",
              fontWeight: 900, color: "#fff",
              lineHeight: 1.04, letterSpacing: "-0.035em",
              textShadow: "0 2px 30px rgba(0,0,0,0.4)",
              fontFamily: "var(--font-display)",
              maxWidth: "12ch",
            }}>
              {title}
            </h1>

            {subtitle && (
              <p style={{
                margin: "13px 0 0",
                fontSize: "clamp(0.96rem, 1.45vw, 1.12rem)",
                color: "rgba(255,255,255,0.88)", lineHeight: 1.72,
                maxWidth: 620, textShadow: "0 1px 8px rgba(0,0,0,0.3)",
                fontFamily: "var(--font-body)",
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