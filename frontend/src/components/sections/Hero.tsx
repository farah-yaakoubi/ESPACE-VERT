"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const SLIDES = [
  { id: 1, image: "/images/hero/slide.jpg", accent: "#0a5c2e" },
  { id: 2, image: "/images/hero/slide2.jpg", accent: "#166534" },
  { id: 3, image: "/images/hero/slide3.jpg", accent: "#1a6b3a" },
  { id: 4, image: "/images/hero/slide4.jpg", accent: "#b45309" },
];

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image?: string;
  imagePlaceholder?: boolean;
}

export function PageHero({ eyebrow, title, subtitle, image, imagePlaceholder }: PageHeroProps) {
  return (
    <div
      className="relative bg-ev-900 overflow-hidden"
      style={imagePlaceholder && !image ? { background: "linear-gradient(135deg, #0a5c2e 0%, #134e4a 100%)" } : undefined}
    >
      {image && (
        <Image src={image} alt={title} fill className="object-cover opacity-20" sizes="100vw" />
      )}
      <div className="relative z-10 container-ev py-16 md:py-20">
        {eyebrow && (
          <p className="text-ev-400 text-xs font-semibold uppercase tracking-widest mb-3">{eyebrow}</p>
        )}
        <h1
          className="text-3xl md:text-5xl font-bold text-white leading-tight"
          style={{ fontFamily: "var(--font-display, sans-serif)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-ev-200 text-lg max-w-2xl">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export function Hero() {
  const [current, setCurrent] = useState(0);
  const [imgErr, setImgErr] = useState<Set<number>>(new Set());

  useEffect(() => {
    const t = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const go = (i: number) => setCurrent(i);

  return (
    <div className="relative overflow-hidden" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Slides — transition opacity fluide */}
      {SLIDES.map((s, i) => {
        const visible = !imgErr.has(s.id) && s.image;
        return (
          <div
            key={s.id}
            className="absolute inset-0"
            style={{
              opacity: i === current ? 1 : 0,
              transition: "opacity 1s ease-in-out",
              zIndex: i === current ? 1 : 0,
            }}
          >
            {visible ? (
              <Image
                src={s.image}
                alt={`slide-${s.id}`}
                fill
                priority={i === 0}
                className="object-cover object-center"
                sizes="100vw"
                onError={() => setImgErr((prev) => new Set(prev).add(s.id))}
              />
            ) : (
              <div className="absolute inset-0" style={{ background: s.accent }} />
            )}
          </div>
        );
      })}

      {/* DOTS — seul élément de navigation, centré en bas */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Slide ${i + 1}`}
            className="rounded-full transition-all duration-400"
            style={{
              width: i === current ? 32 : 8,
              height: 8,
              background: i === current ? "#7dc040" : "rgba(255,255,255,0.45)",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}