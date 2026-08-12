"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_H = 80;

export interface HeroSlide {
  id: number;
  image: string;
  imageMobile?: string;
  imageTablet?: string;
  href?: string;
  titre?: string;
  sousTitre?: string;
  ctaLabel?: string;
  objectPosition?: string;
  ordre: number;
  actif: boolean;
}

const SLIDES_FALLBACK: HeroSlide[] = [
  {
    id: 1,
    image: "/images/hero/semences-desktop.webp",
    imageTablet: "/images/hero/semences-tablette.webp",
    imageMobile: "/images/hero/semences-mobile.webp",
    href: "/activites/semences-et-plants",
    ctaLabel: "Découvrir",
    ordre: 1,
    actif: true,
  },
  {
    id: 2,
    image: "/images/hero/fertivert-desktop.webp",
    imageTablet: "/images/hero/fertivert-tablette.webp",
    imageMobile: "/images/hero/fertivert-mobile.webp",
    href: "/marques/fertivert",
    ctaLabel: "Explorer",
    ordre: 2,
    actif: true,
  },
  {
    id: 3,
    image: "/images/hero/matar-desktop.webp",
    imageTablet: "/images/hero/matar-tablette.webp",
    imageMobile: "/images/hero/matar-mobile.webp",
    href: "/marques/matar",
    ctaLabel: "Découvrir",
    ordre: 3,
    actif: true,
  },
  {
    id: 4,
    image: "/images/hero/pulvert-desktop.webp",
    imageTablet: "/images/hero/pulvert-tablette.webp",
    imageMobile: "/images/hero/pulvert-mobile.webp",
    href: "/marques/pulvert",
    ctaLabel: "Explorer",
    ordre: 4,
    actif: true,
  },
];
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
function useHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>(SLIDES_FALLBACK);

  useEffect(() => {
    fetch(`${BASE}/hero-slides?page=home`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: HeroSlide[]) => {
        const actifs = data.filter((s) => s.actif).sort((a, b) => a.ordre - b.ordre);
        if (actifs.length > 0) setSlides(actifs);
      })
      .catch(() => undefined);
  }, []);

  return slides;
}

function buildSrcSet(slide: HeroSlide): string {
  const mobile = slide.imageMobile ?? slide.image;
  const tablet = slide.imageTablet ?? slide.image;
  const desktop = slide.image;
  const entries = new Map<string, number>([
    [mobile, 768],
    [tablet, 1200],
    [desktop, 1920],
  ]);

  return [...entries.entries()].map(([url, width]) => `${url} ${width}w`).join(", ");
}

const HERO_SIZES = [
  "(max-width: 640px) 100vw",
  "(max-width: 1024px) 100vw",
  "100vw",
].join(", ");

// Valeurs par défaut — le bouton reste toujours affiché, même si un slide n'a pas de CTA défini
const CTA_FALLBACK_LABEL = "Découvrir";
const CTA_FALLBACK_HREF = "/activites";

export function Hero() {
  const slides = useHeroSlides();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const nextIdx = (current + 1) % slides.length;
    const next = slides[nextIdx];
    const urls = [next.image, next.imageMobile, next.imageTablet].filter(Boolean) as string[];
    const links: HTMLLinkElement[] = urls.map((href) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = href;
      document.head.appendChild(link);
      return link;
    });

    return () => links.forEach((link) => document.head.removeChild(link));
  }, [current, slides]);

  const slide = slides[current];
  const ctaLabel = slide.ctaLabel ?? CTA_FALLBACK_LABEL;
  const ctaHref = slide.href ?? CTA_FALLBACK_HREF;

  return (
    <>
      <style>{`
        .hero-section {
          position: relative;
          width: 100%;
          height: 100vh;
          height: 100dvh;
          min-height: 520px;
          max-height: 960px;
          overflow: hidden;
          isolation: isolate;
        }

        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 32%;
          display: block;
          will-change: transform, opacity;
        }

        .hero-slide {
          position: absolute;
          inset: 0;
          overflow: hidden;
          opacity: 0;
          transition: opacity 1.8s ease-in-out;
        }

        .hero-slide--active {
          opacity: 1;
          z-index: 1;
        }

        .hero-slide--previous {
          opacity: 0;
          z-index: 0;
        }

        .hero-slide__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .hero-copy {
          position: absolute;
          left: 0;
          right: 0;
          bottom: clamp(150px, 24vh, 220px);
          z-index: 6;
          padding: 0 clamp(20px, 5vw, 80px);
        }

        .hero-copy-inner {
          width: min(100%, 780px);
        }

        /* Bouton — détaché du bloc titre : il reste en place, à taille lisible,
           et ne se réanime pas à chaque changement de slide (seul le libellé change).
           Il occupe désormais la position tout en bas, centrée, qu'occupaient les points. */
        .hero-cta-fixed {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 28px;
          z-index: 7;
          padding: 0 clamp(20px, 5vw, 80px);
          display: flex;
          justify-content: center;
        }

        @media (max-width: 640px) {
          .hero-section {
            min-height: 560px;
          }

          .hero-image {
            /* !important : sur mobile, le cadrage responsive doit toujours
               l'emporter sur une objectPosition personnalisée (style inline)
               définie pour le rendu desktop depuis l'admin. */
            object-position: center bottom !important;
          }

          .hero-copy {
            bottom: 168px;
            padding: 0 16px;
          }

          .hero-cta-fixed {
            bottom: 24px;
            padding: 0 16px;
            justify-content: center;
          }
        }

        @media (min-width: 641px) and (max-width: 1024px) {
          .hero-section {
            min-height: 640px;
          }

          .hero-image {
            object-position: center 28% !important;
          }

          .hero-cta-fixed {
            bottom: 26px;
          }
        }

        @media (min-width: 1025px) {
          .hero-section {
            height: 100vh;
            height: 100dvh;
            max-height: 920px;
          }
        }

        @media (min-width: 1920px) {
          .hero-section { max-height: 1080px; }
        }

        /* Zoom lent sur l'image active — 14s, démarre de scale(1) vers scale(1.10) */
        @keyframes heroSlowZoom {
          from { transform: scale(1);    }
          to   { transform: scale(1.10); }
        }

        /* Apparition douce du texte — fade + légère montée */
        @keyframes heroTextIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .hero-slide--active .hero-slide__image {
          animation: heroSlowZoom 14s ease-out forwards;
        }

        .hero-text-enter {
          animation: heroTextIn 1.2s 0.6s ease-out both;
        }

        /* Zoom-in + fade doux, même easing/rythme que la transition des bannières hero (opacity 1.8s ease-in-out) */
        @keyframes heroCtaZoomFade {
          0%, 100% { transform: scale(1);     opacity: 1;    }
          50%      { transform: scale(1.045); opacity: 0.88; }
        }

        .hero-cta {
          position: relative;
          overflow: hidden;
          background: linear-gradient(145deg, #14512f 0%, #0f693a 55%, #0a3c21 100%);
          border: 1.5px solid #8bc541;
          box-shadow: 0 0 0 3px rgba(139,197,65,0.18), 0 10px 24px -10px rgba(10,60,33,0.55);
          animation: heroCtaZoomFade 3.6s ease-in-out infinite;
          transition: transform 0.5s cubic-bezier(.16,1,.3,1),
                      box-shadow 0.5s cubic-bezier(.16,1,.3,1),
                      background 0.4s ease;
        }

        .hero-cta:hover {
          animation-play-state: paused;
          transform: translateY(-3px);
          box-shadow: 0 0 0 3px rgba(139,197,65,0.28), 0 16px 34px -10px rgba(10,60,33,0.6);
        }

        .hero-cta-arrow {
          display: inline-flex;
          transition: transform 0.5s cubic-bezier(.16,1,.3,1);
        }

        .hero-cta:hover .hero-cta-arrow {
          transform: translateX(5px);
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-slide,
          .hero-slide__image,
          .hero-text-enter,
          .hero-cta,
          .hero-cta-arrow {
            animation: none !important;
            transition: opacity 0.01ms !important;
          }
        }
      `}</style>

      <section className="hero-section">
        {slides.map((item, index) => {
          const isActive = index === current;
          const isPrevious = index === (current - 1 + slides.length) % slides.length;

          return (
            <div
              key={item.id}
              style={{ pointerEvents: isActive ? "auto" : "none" }}
              className={[
                "hero-slide",
                isActive ? "hero-slide--active" : "",
                isPrevious ? "hero-slide--previous" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <img
                src={item.image}
                srcSet={buildSrcSet(item)}
                sizes={HERO_SIZES}
                alt=""
                className="hero-image hero-slide__image"
                style={{
                  ...(item.objectPosition ? { objectPosition: item.objectPosition } : {}),
                }}
              />
            </div>
          );
        })}

        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 4,
            pointerEvents: "none",
            background: `linear-gradient(to bottom,
              rgba(0,0,0,0.42) 0%,
              rgba(0,0,0,0.10) 25%,
              rgba(0,0,0,0.04) 55%,
              rgba(0,0,0,0.55) 80%,
              rgba(0,0,0,0.72) 100%)`,
          }}
        />

        {/* Titre — change et se fond avec chaque slide */}
        {slide.titre && (
          <div key={`text-${slide.id}`} className="hero-text-enter hero-copy">
            <div className="hero-copy-inner">
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(2rem, 5vw, 3.6rem)",
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  textShadow: "0 2px 24px rgba(0,0,0,0.3)",
                }}
              >
                {slide.titre}
              </h1>
            </div>
          </div>
        )}

        {/* Bouton — toujours présent, position fixe tout en bas et centré
            (il occupe désormais la place des anciens points de pagination).
            Pas de key liée au slide : le nœud DOM reste stable, seul le libellé/lien change. */}
        <div className="hero-cta-fixed">
          <Link
            href={ctaHref}
            className="hero-cta"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "17px 38px",
              color: "#fff",
              fontWeight: 600,
              fontSize: "1rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              borderRadius: 9999,
              textDecoration: "none",
            }}
          >
            {ctaLabel}
            <span className="hero-cta-arrow">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        </div>

        {slide.href && !slide.titre && (
          <Link
            href={slide.href}
            style={{ position: "absolute", inset: 0, zIndex: 3 }}
            tabIndex={-1}
            aria-hidden
          />
        )}
      </section>
    </>
  );
}

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image?: string;
  minHeight?: string | number;
}

export function PageHero({ eyebrow, title, subtitle, image, minHeight }: PageHeroProps) {
  return (
    <section
      style={{
        position: "relative",
        paddingTop: `calc(${NAV_H}px + 3rem)`,
        paddingBottom: "3rem",
        minHeight: minHeight ?? "clamp(360px, 48vh, 560px)",
        background: image ? undefined : "linear-gradient(135deg, #0a5c2e 0%, #15803d 50%, #4a7c2f 100%)",
        overflow: "hidden",
      }}
    >
      {image && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, rgba(10,92,46,0.88), rgba(21,128,61,0.78))",
              zIndex: 1,
            }}
          />
        </>
      )}

      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "rgba(125,192,64,0.12)",
          zIndex: image ? 2 : 0,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: -40,
          left: -40,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(125,192,64,0.08)",
          zIndex: image ? 2 : 0,
          pointerEvents: "none",
        }}
      />

      <div className="container-ev" style={{ position: "relative", zIndex: image ? 3 : 1 }}>
        {eyebrow && (
          <p
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#86efac",
              marginBottom: 12,
            }}
          >
            {eyebrow}
          </p>
        )}

        <h1 className="h-display" style={{ color: "#ffffff", maxWidth: 700, textShadow: "0 2px 16px rgba(0,0,0,0.25)" }}>
          {title}
        </h1>

        {subtitle && (
          <p
            style={{
              marginTop: 16,
              fontSize: "clamp(0.95rem, 1.4vw, 1.1rem)",
              color: "rgba(255,255,255,0.80)",
              maxWidth: 560,
              lineHeight: 1.65,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}