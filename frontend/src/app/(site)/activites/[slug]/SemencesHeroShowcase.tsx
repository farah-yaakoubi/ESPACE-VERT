"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

/** Hero statique : image fixe, pas de récupération dynamique depuis l'admin. */
const HERO_IMAGE = "/images/hero/banner semences.webp";

/** Texte du titre, avec un retour à la ligne explicite entre les 2 phrases. */
const TITLE_LINES = ["Fraîches. Locales.", "Adaptées à votre terre."];
const TITLE_TEXT = TITLE_LINES.join("\n");
/** Délai entre chaque caractère (ms) — plus grand = plus lent. */
const TYPE_SPEED_MS = 115;
const LETTER_FADE_MS = 850;

interface SemencesHeroShowcaseProps {
  activiteSlug: string;
  ctaHref?: string;
}

/** Effet machine à écrire : révèle le titre caractère par caractère. */
function useTypewriter(text: string, speedMs: number) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    if (!text) return;
    const id = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, speedMs);
    return () => clearInterval(id);
  }, [text, speedMs]);

  return { count };
}

export function SemencesHeroShowcase({
  ctaHref = "#produits-activite",
}: SemencesHeroShowcaseProps) {
  const { count } = useTypewriter(TITLE_TEXT, TYPE_SPEED_MS);

  return (
    <section className="relative overflow-hidden bg-sand-50">
      {/* ── Photo plein format ─────────────────────────────────────────── */}
      <div className="relative min-h-[480px] lg:min-h-[560px] flex items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HERO_IMAGE} alt="Semences et plants" className="absolute inset-0 h-full w-full object-cover" />

        {/* ── Contenu texte ─────────────────────────────────────────────── */}
        <div
          className="relative z-10 container-ev flex flex-col items-center text-center"
          style={{ paddingTop: "calc(var(--nav-h, 80px) + 12px)" }}
        >
          <p
            className="text-[12px] sm:text-[13px] font-extrabold tracking-[0.22em] uppercase mb-3 text-white"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.35)" }}
          >
            Semences &amp; plants
          </p>

          <h1
            className="font-black leading-[1.08] tracking-tight text-[clamp(2rem,4.4vw,3.2rem)] text-white min-h-[2.2em]"
            style={{ fontFamily: "var(--font-display)", textShadow: "0 2px 10px rgba(0,0,0,0.35)" }}
          >
            {TITLE_LINES.map((line, lineIndex) => {
              const lineOffset = TITLE_LINES.slice(0, lineIndex).reduce(
                (sum, item) => sum + item.length + 1,
                0,
              );

              return (
                <span key={lineIndex}>
                  {lineIndex > 0 && <br />}
                  {line.split("").map((char, charIndex) => {
                    const isVisible = count > lineOffset + charIndex;
                    return (
                      <span
                        key={`${lineIndex}-${charIndex}`}
                        className="inline-block transition-opacity ease-out"
                        style={{
                          opacity: isVisible ? 1 : 0,
                          transitionDuration: `${LETTER_FADE_MS}ms`,
                          width: char === " " ? "0.35em" : undefined,
                        }}
                      >
                        {char === " " ? "\u00A0" : char}
                      </span>
                    );
                  })}
                </span>
              );
            })}
          </h1>

          <p
            className="mt-4 text-[13.5px] sm:text-sm font-medium text-white/85 max-w-lg"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.3)" }}
          >
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
