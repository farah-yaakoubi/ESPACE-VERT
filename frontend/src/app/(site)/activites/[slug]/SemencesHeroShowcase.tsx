"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

const FALLBACK_IMAGE = "/images/hero/semences-desktop.webp";
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface SemencesHeroShowcaseProps {
  activiteSlug: string;
  fallbackImage?: string;
  ctaHref?: string;
}

export function SemencesHeroShowcase({
  activiteSlug,
  fallbackImage = FALLBACK_IMAGE,
  ctaHref = "#produits-activite",
}: SemencesHeroShowcaseProps) {
  const [image, setImage] = useState<string>(fallbackImage);

  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE}/hero-slides?page=activite:${activiteSlug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { image: string; actif: boolean; ordre: number }[]) => {
        if (cancelled) return;
        const first = data.filter((s) => s.actif).sort((a, b) => a.ordre - b.ordre)[0];
        if (first?.image) setImage(first.image);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [activiteSlug]);

  return (
    <section className="relative overflow-hidden bg-sand-50">
      {/* ── Photo plein format ─────────────────────────────────────────── */}
      <div className="relative min-h-[480px] lg:min-h-[560px] flex items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="Semences et plants" className="absolute inset-0 h-full w-full object-cover" />

        {/* Voile clair pour lisibilité du texte, dans l'esprit "lin" du site */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 55% at 50% 46%, rgba(246,244,238,0.94) 0%, rgba(246,244,238,0.72) 42%, rgba(246,244,238,0.18) 68%, rgba(246,244,238,0) 82%)",
          }}
        />

        {/* ── Contenu texte ─────────────────────────────────────────────── */}
        <div
          className="relative z-10 container-ev flex flex-col items-center text-center"
          style={{ paddingTop: "calc(var(--nav-h, 80px) + 12px)" }}
        >
          <p className="text-[12px] sm:text-[13px] font-extrabold tracking-[0.22em] uppercase mb-3 text-ev-700">
            Semences &amp; plants
          </p>

          <h1
            className="font-black leading-[1.08] tracking-tight text-[clamp(2rem,4.4vw,3.2rem)] text-[#1b2118]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Fraîches. Locales.
            <br />
            Adaptées à votre terre.
          </h1>

          <p className="mt-4 text-[13.5px] sm:text-sm font-medium text-[#1b2118]/70 max-w-lg">
            Découvrez nos semences et plants sélectionnés pour vos cultures — des variétés
            testées, du semis à la récolte.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[13.5px] font-bold text-white uppercase tracking-wide bg-ev-700 hover:bg-ev-800 transition-colors duration-200"
            >
              Voir le catalogue
              <ArrowRight size={16} />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[13.5px] font-bold uppercase tracking-wide bg-white/90 text-[#1b2118] border border-[#1b2118]/10 hover:bg-white transition-colors duration-200"
            >
              Conseil personnalisé
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}