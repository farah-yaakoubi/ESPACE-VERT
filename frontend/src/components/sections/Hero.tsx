"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const NAV_H = 80;

/* ─────────────────────────────────────────────────────────────────────────────
   TYPE — structure d'un slide Hero tel que renvoyé par le backend
   GET /api/hero-slides  →  HeroSlide[]
   Géré depuis /admin/hero dans le backoffice.
   ───────────────────────────────────────────────────────────────────────────── */
export interface HeroSlide {
  id:          number;
  image:       string;   // URL ou chemin /public — ex: "/images/hero/slide.webp"
  href?:       string;   // Lien cliquable (optionnel)
  titre?:      string;   // Titre affiché sur l'image
  sousTitre?:  string;   // Sous-titre
  ctaLabel?:   string;   // Texte du bouton CTA
  ordre:       number;
  actif:       boolean;
}

/* ── Fallback statique — utilisé si le fetch backend échoue ── */
const SLIDES_FALLBACK: HeroSlide[] = [
  { id: 1, image: "/images/hero/semences.webp",  href: "/marques/semences",  ordre: 1, actif: true },
  { id: 2, image: "/images/hero/fertivert.webp", href: "/marques/fertivert", ordre: 2, actif: true },
  { id: 3, image: "/images/hero/pulvert.webp",   href: "/marques/pulvert",   ordre: 3, actif: true },
  { id: 4, image: "/images/hero/jardinage.webp", href: "/marques/jardinage", ordre: 4, actif: true },
  { id: 5, image: "/images/hero/matar.webp",     href: "/marques/matar",     ordre: 5, actif: true },
];

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function useHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>(SLIDES_FALLBACK);
  useEffect(() => {
    fetch(`${BASE}/hero-slides?page=home`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: HeroSlide[]) => {
        const actifs = data.filter(s => s.actif).sort((a, b) => a.ordre - b.ordre);
        if (actifs.length > 0) setSlides(actifs);
      })
      .catch(() => {});
  }, []);
  return slides;
}

export function Hero() {
  const slides  = useHeroSlides();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  useEffect(() => {
    const nextIdx = (current + 1) % slides.length;
    const link = document.createElement("link");
    link.rel = "preload"; link.as = "image"; link.href = slides[nextIdx].image;
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, [current, slides]);

  const slide = slides[current];

  return (
    <>
      <style>{`
        .hero-section {
          position: relative; width: 100%;
          height: 100vh;
          height: 100dvh;
          min-height: 520px;
          max-height: 960px;
          overflow: hidden;
          isolation: isolate;
        }
        .hero-image {
          width: 100%; height: 100%; object-fit: cover;
          object-position: center 32%; display: block;
        }
        .hero-copy {
          position: absolute;
          left: 0;
          right: 0;
          bottom: clamp(72px, 12vh, 140px);
          z-index: 6;
          padding: 0 clamp(20px, 5vw, 80px);
        }
        .hero-copy-inner {
          width: min(100%, 780px);
        }
        @media (max-width: 640px) {
          .hero-section  { min-height: 560px; }
          .hero-image    { object-position: center 24%; }
          .hero-copy     { bottom: 88px; padding: 0 16px; }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .hero-section { min-height: 640px; }
          .hero-image   { object-position: center 28%; }
        }
        @media (min-width: 1025px) {
          .hero-section { height: 100vh; height: 100dvh; max-height: 920px; }
        }
        @media (min-width: 1920px) { .hero-section { max-height: 1080px; } }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-text-enter { animation: heroFadeUp 0.7s cubic-bezier(.22,1,.36,1) both; }
        .hero-cta:hover { background: #6aaf30 !important; transform: translateY(-1px); }
      `}</style>

      <section className="hero-section">

        {/* Images en couches avec cross-fade */}
        {slides.map((s, i) => (
          <div key={s.id} style={{
            position: "absolute", inset: 0,
            opacity: i === current ? 1 : 0,
            transition: "opacity 1.5s ease-in-out",
            zIndex: i === current ? 1 : 0,
          }}>
            <img src={s.image} alt="" className="hero-image" style={{
              transform: i === current ? "scale(1.07)" : "scale(1)",
              transition: "transform 6s ease-in-out",
            }} />
          </div>
        ))}

        {/* Overlay gradient double — navbar + bas de page */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none",
          background: `linear-gradient(to bottom,
            rgba(0,0,0,0.42) 0%,
            rgba(0,0,0,0.10) 25%,
            rgba(0,0,0,0.04) 55%,
            rgba(0,0,0,0.55) 80%,
            rgba(0,0,0,0.72) 100%)`,
        }} />

        {/* Texte du slide actif */}
        {(slide.titre || slide.sousTitre || slide.ctaLabel) && (
          <div key={`text-${slide.id}`} className="hero-text-enter hero-copy">
            <div className="hero-copy-inner">
              {slide.titre && (
                <h1 style={{
                  margin: 0,
                  fontSize: "clamp(2rem, 5vw, 3.6rem)",
                  fontWeight: 800, color: "#fff", lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  textShadow: "0 2px 24px rgba(0,0,0,0.3)",
                }}>
                  {slide.titre}
                </h1>
              )}
              {slide.sousTitre && (
                <p style={{
                  margin: "14px 0 0",
                  fontSize: "clamp(0.95rem, 1.5vw, 1.15rem)",
                  color: "rgba(255,255,255,0.82)", lineHeight: 1.6, maxWidth: 520,
                  textShadow: "0 1px 8px rgba(0,0,0,0.3)",
                }}>
                  {slide.sousTitre}
                </p>
              )}
              {slide.ctaLabel && slide.href && (
                <Link href={slide.href} className="hero-cta" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  marginTop: 28, padding: "12px 28px",
                  background: "#7dc040", color: "#fff",
                  fontWeight: 700, fontSize: "0.9rem",
                  borderRadius: 9999, textDecoration: "none",
                  letterSpacing: "0.02em",
                  boxShadow: "0 4px 20px rgba(125,192,64,0.4)",
                  transition: "background 0.15s, transform 0.12s",
                }}>
                  {slide.ctaLabel}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Dots navigation */}
        <div style={{
          position: "absolute", bottom: 28, left: "50%",
          transform: "translateX(-50%)",
          display: "flex", gap: 8, zIndex: 10,
        }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`} style={{
              width: i === current ? 28 : 8, height: 8,
              borderRadius: 9999,
              background: i === current ? "#7dc040" : "rgba(255,255,255,0.45)",
              border: "none", cursor: "pointer", padding: 0,
              transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
            }} />
          ))}
        </div>
        {/* Lien zone si pas de CTA */}
        {slide.href && !slide.ctaLabel && (
          <Link href={slide.href} style={{ position: "absolute", inset: 0, zIndex: 3 }} tabIndex={-1} aria-hidden />
        )}
      </section>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PageHero — Bannière pour les pages intérieures (inchangée)
   ───────────────────────────────────────────────────────────────────────────── */
interface PageHeroProps {
  eyebrow?: string; title: string; subtitle?: string; image?: string; minHeight?: string | number;
}
export function PageHero({ eyebrow, title, subtitle, image, minHeight }: PageHeroProps) {
  return (
    <section style={{
      position: "relative",
      paddingTop: `calc(${NAV_H}px + 3rem)`, paddingBottom: "3rem",
      minHeight: minHeight ?? "clamp(360px, 48vh, 560px)",
      background: image ? undefined : "linear-gradient(135deg, #0a5c2e 0%, #15803d 50%, #4a7c2f 100%)",
      overflow: "hidden",
    }}>
      {image && (
        <>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center", zIndex: 0 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(10,92,46,0.88), rgba(21,128,61,0.78))", zIndex: 1 }} />
        </>
      )}
      <div aria-hidden style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(125,192,64,0.12)", zIndex: image ? 2 : 0, pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(125,192,64,0.08)", zIndex: image ? 2 : 0, pointerEvents: "none" }} />
      <div className="container-ev" style={{ position: "relative", zIndex: image ? 3 : 1 }}>
        {eyebrow && <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#86efac", marginBottom: 12 }}>{eyebrow}</p>}
        <h1 className="h-display" style={{ color: "#ffffff", maxWidth: 700, textShadow: "0 2px 16px rgba(0,0,0,0.25)" }}>{title}</h1>
        {subtitle && <p style={{ marginTop: 16, fontSize: "clamp(0.95rem, 1.4vw, 1.1rem)", color: "rgba(255,255,255,0.80)", maxWidth: 560, lineHeight: 1.65 }}>{subtitle}</p>}
      </div>
    </section>
  );
}
