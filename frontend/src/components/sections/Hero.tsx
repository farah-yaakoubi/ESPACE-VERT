"use client";

import Link from "next/link";
import { ArrowRight, Bot } from "lucide-react";
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
    image: "/images/hero/banner ev.webp",
    href: "/activites/semences-et-plants",
    ctaLabel: "Découvrir",
    ordre: 1,
    actif: true,
  },
 {
    id: 2,
    image: "/images/hero/fertivert-marque.webp",
    imageTablet: "",
    imageMobile: "",
    href: "/marques/fertivert",
    ctaLabel: "Découvrir",
    ordre: 2,
    actif: true,
  },
  {
    id: 3,
    image: "/images/hero/irrigation.webp",
    imageTablet: "",
    imageMobile: "",
    href: "/marques/matar",
    ctaLabel: "Découvrir",
    ordre: 3,
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

export function Hero() {
  const slides = useHeroSlides();
  const [current, setCurrent] = useState(0);
  const [hasAdvanced, setHasAdvanced] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setHasAdvanced(true);
      setCurrent((c) => (c + 1) % slides.length);
    }, 5000);
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
  const ctaHref = "/#nos-activites";

  const openChat = () => {
    window.dispatchEvent(new CustomEvent("ev:open-chat"));
  };

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
          clip-path: inset(0 0 0 100%);
          transform: translate3d(0, 0, 0);
          will-change: clip-path, opacity;
        }

        .hero-slide--active {
          opacity: 1;
          z-index: 2;
          animation: heroImageReveal 1.45s cubic-bezier(.72,0,.18,1) both;
        }

        .hero-slide--previous {
          opacity: 1;
          z-index: 1;
          clip-path: inset(0);
          animation: heroImageLeave 1.45s cubic-bezier(.72,0,.18,1) both;
        }

        .hero-slide::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: -16%;
          width: 32%;
          z-index: 2;
          pointer-events: none;
          opacity: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.34), rgba(255,255,255,0));
          filter: blur(10px);
          transform: translateX(-130%) skewX(-12deg);
        }

        .hero-slide--active::after {
          animation: heroRevealSweep 1.25s 0.06s cubic-bezier(.72,0,.18,1) both;
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
          top: 0;
          bottom: 0;
          z-index: 6;
          padding: 0 clamp(20px, 5vw, 80px);
          display: flex;
          align-items: center;
        }

        .hero-copy-inner {
          width: min(100%, 1180px);
          margin: 0 auto;
          padding-top: 80px;
        }

        .hero-content-pro {
          width: min(100%, 760px);
        }

        .hero-title-pro {
          margin: 0;
          max-width: 760px;
          color: #fff;
          font-size: clamp(2.7rem, 6.5vw, 6rem);
          font-weight: 950;
          line-height: 0.92;
          letter-spacing: 0;
          text-shadow: 0 20px 60px rgba(0,0,0,0.38);
        }

        .hero-title-pro span {
          color: #c8ff75;
        }

        .hero-subtitle-pro {
          margin: 22px 0 0;
          max-width: 620px;
          color: rgba(255,255,255,0.84);
          font-size: clamp(1rem, 1.5vw, 1.18rem);
          line-height: 1.7;
          font-weight: 500;
          text-shadow: 0 10px 28px rgba(0,0,0,0.35);
        }

        .hero-actions-pro {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-top: 30px;
        }

        .hero-primary-pro,
        .hero-secondary-pro {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 50px;
          border-radius: 999px;
          padding: 0 20px;
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: transform 0.35s cubic-bezier(.16,1,.3,1), box-shadow 0.35s ease, background 0.35s ease;
        }

        .hero-primary-pro {
          color: #072716;
          background: linear-gradient(135deg, #ffffff 0%, #d8ff86 100%);
          box-shadow: 0 22px 48px -24px rgba(216,255,134,0.75), inset 0 1px 0 rgba(255,255,255,0.92);
        }

        .hero-secondary-pro {
          color: #ffffff;
          border: 1px solid rgba(255,255,255,0.28);
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(16px);
        }

        .hero-primary-pro:hover,
        .hero-secondary-pro:hover {
          transform: translateY(-3px);
        }

        .hero-trust-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-top: 24px;
          color: rgba(255,255,255,0.78);
          font-size: 0.82rem;
          font-weight: 800;
        }

        .hero-trust-row span {
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }

        .hero-trust-row span + span::before {
          content: "";
          display: inline-block;
          width: 5px;
          height: 5px;
          border-radius: 999px;
          background: #c8ff75;
          opacity: 0.85;
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
            align-items: flex-end;
            padding: 0 16px;
            padding-bottom: 42px;
          }

          .hero-copy-inner {
            padding-top: 0;
          }

          .hero-title-pro {
            font-size: clamp(2.35rem, 14vw, 4.15rem);
          }

          .hero-subtitle-pro {
            line-height: 1.55;
          }

          .hero-actions-pro {
            margin-top: 22px;
          }

          .hero-primary-pro,
          .hero-secondary-pro {
            width: 100%;
          }

          .hero-trust-row {
            gap: 8px 12px;
            margin-top: 18px;
            font-size: 0.76rem;
          }

          .hero-trust-row span + span::before {
            display: none;
          }

        }

        @media (min-width: 641px) and (max-width: 1024px) {
          .hero-section {
            min-height: 640px;
          }

          .hero-image {
            object-position: center 28% !important;
          }

          .hero-content-pro {
            width: min(100%, 680px);
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

        @keyframes heroImageReveal {
          0% {
            clip-path: inset(0 0 0 100%);
            opacity: 1;
          }
          100% {
            clip-path: inset(0);
            opacity: 1;
          }
        }

        @keyframes heroImageLeave {
          0% {
            clip-path: inset(0);
            opacity: 1;
          }
          100% {
            clip-path: inset(0 100% 0 0);
            opacity: 1;
          }
        }

        @keyframes heroRevealSweep {
          0% {
            opacity: 0;
            transform: translateX(-130%) skewX(-12deg);
          }
          18% {
            opacity: 0.9;
          }
          100% {
            opacity: 0;
            transform: translateX(430%) skewX(-12deg);
          }
        }

        /* Zoom lent sur l'image active — accompagne le changement sans masquer le contenu */
        @keyframes heroSlowZoom {
          from { transform: scale(1.055) translateX(1.6%); }
          to   { transform: scale(1.12) translateX(0);     }
        }

        /* Apparition douce du texte — fade + légère montée */
        @keyframes heroTextIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .hero-slide--active .hero-slide__image {
          animation: heroSlowZoom 6.6s ease-out forwards;
        }

        .hero-slide--previous .hero-slide__image {
          transform: scale(1.08);
        }

        .hero-text-enter {
          animation: heroTextIn 1.2s 0.6s ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-slide,
          .hero-slide::after,
          .hero-slide__image,
          .hero-text-enter {
            animation: none !important;
            transition: opacity 0.01ms !important;
          }
        }
      `}</style>

      <section className="hero-section">
        {slides.map((item, index) => {
          const isActive = index === current;
          const isPrevious = hasAdvanced && index === (current - 1 + slides.length) % slides.length;

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
              rgba(0,0,0,0.46) 0%,
              rgba(0,0,0,0.20) 28%,
              rgba(0,0,0,0.24) 54%,
              rgba(0,0,0,0.58) 100%)`,
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
            pointerEvents: "none",
            background: "radial-gradient(circle at 12% 28%, rgba(200,255,117,0.18), transparent 30%), linear-gradient(90deg, rgba(3,31,16,0.76) 0%, rgba(3,31,16,0.34) 46%, rgba(3,31,16,0.08) 100%)",
          }}
        />

        <div key={`text-${slide.id}`} className="hero-text-enter hero-copy">
          <div className="hero-copy-inner">
            <div className="hero-content-pro">
              <h1 className="hero-title-pro">
                Des solutions vertes, <span>choisies avec soin.</span>
              </h1>
              <p className="hero-subtitle-pro">
                Semences, irrigation, fertilisation et équipements pour accompagner vos projets agricoles, jardins et espaces verts.
              </p>
              <div className="hero-actions-pro">
                <Link href={ctaHref} className="hero-primary-pro">
                  Découvrir nos solutions
                  <ArrowRight size={17} strokeWidth={2.6} />
                </Link>
                <button type="button" onClick={openChat} className="hero-secondary-pro">
                  Demander conseil
                  <Bot size={17} strokeWidth={2.4} />
                </button>
              </div>
              <div className="hero-trust-row" aria-label="Points forts Espace Vert">
                <span>Conseil terrain</span>
                <span>Marques spécialisées</span>
                <span>Produits professionnels</span>
              </div>
            </div>
          </div>
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
