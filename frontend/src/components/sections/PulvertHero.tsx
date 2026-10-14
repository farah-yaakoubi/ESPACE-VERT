"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

/** Hero statique : image fixe, même structure que le hero Semences & plants. */
const HERO_IMAGE = "/images/pulverisation/big-banner-pulverisation.webp";

/** Titre en 2 lignes, révélé caractère par caractère (effet machine à écrire). */
const TITLE_LINES = ["Solutions de pulvérisation", "avancées."];
const TITLE_TEXT = TITLE_LINES.join("\n");
const TYPE_SPEED_MS = 85;
const LETTER_FADE_MS = 850;

interface PulvertHeroProps {
  // Conservé pour compatibilité avec la page marque (non utilisé dans le hero).
  categories?: unknown[];
  ctaHref?: string;
  image?: string;
}

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

export function PulvertHero({
  ctaHref = "#categories-pulvert",
  image = HERO_IMAGE,
}: PulvertHeroProps) {
  const { count } = useTypewriter(TITLE_TEXT, TYPE_SPEED_MS);

  return (
    <section className="relative overflow-hidden bg-sand-50">
      <div className="relative flex min-h-[480px] items-end justify-center overflow-hidden pb-10 lg:min-h-[560px] lg:pb-14">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt="Pulvérisateurs Pulvert et PulverAgro"
          className="absolute inset-0 h-full w-full object-cover object-bottom"
        />
        <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/60 via-black/25 to-transparent" />

        <div
          className="container-ev relative z-10 flex flex-col items-center text-center"
          style={{ paddingTop: "calc(var(--nav-h, 80px) + 12px)" }}
        >
          <p
            className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.22em] text-white sm:text-[13px]"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.35)" }}
          >
            Pulvérisation
          </p>

          <h1
            className="min-h-[2.2em] text-[clamp(2rem,4.4vw,3.2rem)] font-black leading-[1.08] tracking-tight text-white"
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
                        {char === " " ? " " : char}
                      </span>
                    );
                  })}
                </span>
              );
            })}
          </h1>

          <p
            className="mt-4 max-w-lg text-[13.5px] font-medium text-white/90 sm:text-sm"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
          >
            Précision, performance, productivité — des pulvérisateurs Pulvert et PulverAgro pour
            le jardin, les vergers et les grandes cultures.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-ev-700 px-6 py-3.5 text-[13.5px] font-bold uppercase tracking-wide text-white transition-colors duration-200 hover:bg-ev-800"
            >
              Explorer nos produits
              <ArrowRight size={16} />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-[#1b2118]/10 bg-white/90 px-6 py-3.5 text-[13.5px] font-bold uppercase tracking-wide text-[#1b2118] transition-colors duration-200 hover:bg-white"
            >
              Conseil personnalisé
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}