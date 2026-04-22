"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Calendar,
  BookOpen,
  Phone,
  Search,
} from "lucide-react";

const SLIDES = [
  {
    id: 1,
    image: "/images/hero/slide1.jpg",
    label: "Irrigation",
    title: "Solutions d'irrigation\nperformantes",
    subtitle: "Goutte-à-goutte, aspersion & plus",
    cta: "Nos solutions",
    href: "/activites/irrigation",
    secondCta: "Catalogue",
    secondHref: "/catalogue",
    SecondIcon: BookOpen,
    accent: "#0a5c2e",
  },
  {
    id: 2,
    image: "/images/hero/slide2.jpg",
    label: "Semences",
    title: "Semences & plants\nsélectionnés",
    subtitle: "Qualité certifiée pour vos cultures",
    cta: "Voir les semences",
    href: "/activites/semences-et-plants",
    secondCta: "Catalogue",
    secondHref: "/catalogue",
    SecondIcon: BookOpen,
    accent: "#166534",
  },
  {
    id: 3,
    image: "/images/hero/slide3.jpg",
    label: "Fertilisation",
    title: "Fertivert — engrais\nécologiques",
    subtitle: "Nutrition optimale pour vos sols",
    cta: "Découvrir Fertivert",
    href: "/marques/fertivert",
    secondCta: "Nous contacter",
    secondHref: "/contact",
    SecondIcon: Phone,
    accent: "#1a6b3a",
  },
  {
    id: 4,
    image: "/images/hero/slide4.jpg",
    label: "Machinisme",
    title: "Matériel agricole\n& jardinage",
    subtitle: "Équipements pour chaque usage",
    cta: "Explorer",
    href: "/activites/machinisme-et-jardinage",
    secondCta: "Nos produits",
    secondHref: "/produits",
    SecondIcon: Search,
    accent: "#b45309",
  },
];

export function Hero() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [imgErr, setImgErr] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(t);
  }, [paused]);

  const go = (i: number) => setCurrent(i);
  const prev = () => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent((c) => (c + 1) % SLIDES.length);

  const slide = SLIDES[current];
  const hasImg = slide.image && !imgErr.has(slide.id);
  const { SecondIcon } = slide;

  return (
    <div
      className="relative overflow-hidden"
      style={{ minHeight: "calc(100vh - 72px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* BACKGROUND */}
      {SLIDES.map((s, i) => {
        const visible = !imgErr.has(s.id) && s.image;
        return (
          <div
            key={s.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            {visible ? (
              <>
                <Image
                  src={s.image}
                  alt={`slide-${s.id}`}
                  fill
                  priority={i === 0}
                  className="object-cover object-center"
                  sizes="100vw"
                  onError={() => setImgErr((prev) => new Set(prev).add(s.id))}
                />
                {/* Overlay gradient dynamique selon couleur du slide */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(120deg,${s.accent}f0 0%,${s.accent}99 45%,transparent 100%)`,
                  }}
                />
                {/* Gradient bas pour lisibilité */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0" style={{ background: s.accent }} />
            )}
          </div>
        );
      })}

      {/* CONTENT */}
      <div
        className="relative z-10 flex items-end justify-start container-ev"
        style={{
          minHeight: "calc(100vh - 72px)",
          paddingBlock: "clamp(3rem,8vw,5rem)",
        }}
      >
        <div className="max-w-xl">
          {/* Label catégorie */}
          <p
            className="text-xs font-medium uppercase tracking-widest mb-2"
            style={{ color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em" }}
          >
            {slide.label}
          </p>

          {/* Titre */}
          <h2
            className="font-medium text-white leading-tight mb-2"
            style={{ fontSize: "clamp(26px, 4vw, 44px)", whiteSpace: "pre-line" }}
          >
            {slide.title}
          </h2>

          {/* Sous-titre */}
          <p
            className="mb-6 text-sm"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            {slide.subtitle}
          </p>

          {/* Boutons */}
          <div className="flex flex-wrap gap-3">
            {/* Bouton principal */}
            <Link
              href={slide.href}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
              style={{
                background: "#7dc040",
                color: "#073d1e",
                boxShadow: "0 6px 24px rgba(125,192,64,.3)",
              }}
            >
              {slide.cta}
              <ArrowRight size={15} />
            </Link>

            {/* Bouton secondaire ghost */}
            <Link
              href={slide.secondHref}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm text-white transition-all hover:bg-white/20"
              style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.28)",
              }}
            >
              <SecondIcon size={15} />
              {slide.secondCta}
            </Link>

            {/* Bouton RDV constant */}
            <Link
              href="/rendez-vous"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm text-white transition-all hover:bg-white/20"
              style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.28)",
              }}
            >
              <Calendar size={15} />
              RDV
            </Link>
          </div>
        </div>
      </div>

      {/* FLÈCHE GAUCHE */}
      <button
        onClick={prev}
        aria-label="Slide précédent"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center text-white transition-all hover:bg-white/25"
        style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.25)",
        }}
      >
        <ChevronLeft size={20} />
      </button>

      {/* FLÈCHE DROITE */}
      <button
        onClick={next}
        aria-label="Slide suivant"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center text-white transition-all hover:bg-white/25"
        style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.25)",
        }}
      >
        <ChevronRight size={20} />
      </button>

      {/* DOTS */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Aller au slide ${i + 1}`}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === current ? 28 : 8,
              background:
                i === current ? "#7dc040" : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>
    </div>
  );
}